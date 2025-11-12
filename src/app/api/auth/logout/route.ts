import { NextResponse } from "next/server";
import { createRoute } from "@/lib/api/route-handler";
import { authService } from "@/application/services/auth.service";
import { clearSessionCookie } from "@/lib/middleware/auth.middleware";
import { hashToken } from "@/lib/crypto/hash";

export const POST = createRoute(
  async ({ request }) => {
    const token = request.cookies.get("session_token")?.value;

    if (token) {
      const tokenHash = hashToken(token);
      await authService.logout(tokenHash);
    }

    const response = NextResponse.json({
      data: { success: true, message: "Logged out successfully" },
    });

    const cookieOptions = clearSessionCookie();
    response.cookies.set(cookieOptions);

    return response;
  },
  {
    rateLimit: "auth",
  }
);
