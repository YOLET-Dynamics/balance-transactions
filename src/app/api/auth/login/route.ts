import { NextResponse } from "next/server";
import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import { loginSchema } from "@/lib/validation/schemas";
import { authService } from "@/application/services/auth.service";
import { getSessionCookieOptions } from "@/lib/middleware/auth.middleware";

export const POST = createRoute(
  async ({ request }) => {
    const body = getValidatedBody<typeof loginSchema._type>(request);

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const result = await authService.login(body, ip, userAgent);

    const response = NextResponse.json({
      data: {
        user: result.user,
        organization: result.organization,
        membership: result.membership,
      },
    });

    const cookieOptions = getSessionCookieOptions(
      result.session.token,
      result.session.expiresAt
    );
    response.cookies.set(cookieOptions);

    return response;
  },
  {
    rateLimit: "auth",
    bodySchema: loginSchema,
  }
);
