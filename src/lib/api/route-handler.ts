import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { ZodSchema } from "zod";
import { formatErrorResponse, ValidationError } from "../utils/errors";
import {
  authenticateRequest,
  type AuthContext,
} from "../middleware/auth.middleware";
import { checkRateLimit } from "../middleware/rate-limit.middleware";
import { rateLimiters } from "../middleware/rate-limit.middleware";

export interface RouteContext {
  request: NextRequest;
  params?: Record<string, string>;
  auth?: AuthContext;
}

export type RouteHandler<T = unknown> = (context: RouteContext) => Promise<T>;

type ValidatedRequest = NextRequest & {
  validatedBody?: unknown;
};

interface RouteConfig {
  requireAuth?: boolean;
  rateLimit?: keyof typeof rateLimiters;
  bodySchema?: ZodSchema;
}

export function createRoute<T = unknown>(
  handler: RouteHandler<T>,
  config: RouteConfig = {}
) {
  return async function (
    request: NextRequest,
    context?: unknown
  ): Promise<Response> {
    try {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
        const origin = request.headers.get("origin");
        if (origin) {
          try {
            if (new URL(origin).host !== request.nextUrl.host) {
              return NextResponse.json(
                {
                  error: {
                    message: "Cross-origin mutation rejected",
                    code: "CSRF_ORIGIN_MISMATCH",
                  },
                },
                { status: 403 }
              );
            }
          } catch {
            return NextResponse.json(
              {
                error: {
                  message: "Invalid origin header",
                  code: "INVALID_ORIGIN",
                },
              },
              { status: 400 }
            );
          }
        }
      }

      const segmentData = context as
        | { params?: Promise<Record<string, string>> }
        | undefined;
      const params = segmentData?.params ? await segmentData.params : undefined;
      const routeContext: RouteContext = { request, params };

      if (config.rateLimit) {
        await checkRateLimit(request, config.rateLimit);
      }

      if (config.requireAuth) {
        routeContext.auth = await authenticateRequest(request);
      }

      if (
        config.bodySchema &&
        (request.method === "POST" ||
          request.method === "PUT" ||
          request.method === "PATCH")
      ) {
        const body = await request.json();
        const result = config.bodySchema.safeParse(body);

        if (!result.success) {
          const errors: Record<string, string[]> = {};
          result.error.issues.forEach((issue) => {
            const path = issue.path.join(".");
            if (!errors[path]) errors[path] = [];
            errors[path].push(issue.message);
          });

          throw new ValidationError("Validation failed", errors);
        }

        (request as ValidatedRequest).validatedBody = result.data;
      }

      const data = await handler(routeContext);

      if (data instanceof Response) {
        return data;
      }

      return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
      const { error: errorData, statusCode } = formatErrorResponse(error);
      return NextResponse.json(errorData, { status: statusCode });
    }
  };
}

export function getValidatedBody<T>(request: NextRequest): T {
  return (request as ValidatedRequest).validatedBody as T;
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ data }, { status });
}

export function errorResponse(
  message: string,
  status: number = 400,
  code?: string
) {
  return NextResponse.json(
    {
      error: {
        message,
        code,
      },
    },
    { status }
  );
}

export function streamNodeResponse(
  stream: NodeJS.ReadableStream,
  headers: HeadersInit
): Response {
  const webStream = Readable.toWeb(stream as Readable) as ReadableStream;
  return new Response(webStream, { headers });
}

export function getPaginationParams(
  request: NextRequest,
  defaultLimit: number = 20
): { page: number; limit: number } {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || defaultLimit.toString());

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit:
      Number.isInteger(limit) && limit > 0
        ? Math.min(limit, 100)
        : defaultLimit,
  };
}

export function getAllowedSearchParam<T extends string>(
  request: NextRequest,
  name: string,
  allowed: readonly T[]
): T | undefined {
  const value = request.nextUrl.searchParams.get(name);
  if (!value || value === "all") return undefined;
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export function getYearSearchParam(
  request: NextRequest,
  name: string = "year"
): number | undefined {
  const value = request.nextUrl.searchParams.get(name);
  if (!value) return undefined;

  const year = Number(value);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return undefined;
  }

  return year;
}
