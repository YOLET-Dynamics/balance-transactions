import Redis from "ioredis";
import { NextRequest } from "next/server";
import { RateLimitError } from "../utils/errors";

// Create Redis client - supports both REDIS_URL and individual config vars
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    })
  : new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("ready", () => {
  console.log("Redis ready to accept commands");
});

if (typeof process !== "undefined") {
  process.on("SIGTERM", async () => {
    await redis.quit();
  });
  process.on("SIGINT", async () => {
    await redis.quit();
  });
}

interface RateLimiterConfig {
  limit: number;
  window: number;
  prefix: string;
}

export const rateLimiters: Record<string, RateLimiterConfig> = {
  auth: {
    limit: 5,
    window: 60,
    prefix: "@ratelimit/auth",
  },
  mutations: {
    limit: 60,
    window: 60,
    prefix: "@ratelimit/mutations",
  },
  queries: {
    limit: 120,
    window: 60,
    prefix: "@ratelimit/queries",
  },
  pdf: {
    limit: 20,
    window: 3600,
    prefix: "@ratelimit/pdf",
  },
};

function getClientIdentifier(request: NextRequest, userId?: string): string {
  if (userId) return `user:${userId}`;

  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return forwarded?.split(",")[0] || realIp || "anonymous";
}

async function slidingWindowRateLimit(
  identifier: string,
  config: RateLimiterConfig
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const key = `${config.prefix}:${identifier}`;
  const now = Date.now();
  const windowStart = now - config.window * 1000;

  const pipeline = redis.pipeline();

  pipeline.zremrangebyscore(key, 0, windowStart);

  pipeline.zcard(key);

  pipeline.zadd(key, now, `${now}`);

  pipeline.expire(key, config.window);

  const results = await pipeline.exec();

  if (!results) {
    throw new Error("Redis pipeline failed");
  }

  const count = (results[1][1] as number) || 0;
  const remaining = Math.max(0, config.limit - count - 1);
  const success = count < config.limit;

  const reset = now + config.window * 1000;

  return {
    success,
    limit: config.limit,
    remaining,
    reset,
  };
}

export async function checkRateLimit(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters,
  userId?: string
): Promise<void> {
  const identifier = getClientIdentifier(request, userId);
  const config = rateLimiters[limiterType];

  const { success, reset } = await slidingWindowRateLimit(identifier, config);

  if (!success) {
    const resetDate = new Date(reset);
    throw new RateLimitError(
      `Rate limit exceeded. Try again at ${resetDate.toISOString()}`
    );
  }
}

export async function getRateLimitHeaders(
  request: NextRequest,
  limiterType: keyof typeof rateLimiters,
  userId?: string
): Promise<Record<string, string>> {
  const identifier = getClientIdentifier(request, userId);
  const config = rateLimiters[limiterType];

  const { limit, reset, remaining } = await slidingWindowRateLimit(
    identifier,
    config
  );

  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };
}
