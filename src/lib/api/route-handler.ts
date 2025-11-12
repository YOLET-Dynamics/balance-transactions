import { NextRequest, NextResponse } from "next/server";
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

export type RouteHandler<T = any> = (context: RouteContext) => Promise<T>;

interface RouteConfig {
  requireAuth?: boolean;
  rateLimit?: keyof typeof rateLimiters;
  bodySchema?: ZodSchema;
}

export function createRoute<T = any>(
  handler: RouteHandler<T>,
  config: RouteConfig = {}
) {
  return async function (
    request: NextRequest,
    context?: unknown
  ): Promise<Response> {
    try {
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

        (request as any).validatedBody = result.data;
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
  return (request as any).validatedBody as T;
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
