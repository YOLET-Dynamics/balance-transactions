import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import {
  verifyEmailSchema,
  resendVerificationOtpSchema,
} from "@/lib/validation/schemas";
import { authService } from "@/application/services/auth.service";

export const POST = createRoute(
  async ({ request }) => {
    const body = getValidatedBody<typeof verifyEmailSchema._type>(request);

    await authService.verifyEmail(body.email, body.otp);

    return {
      success: true,
      message: "Email verified successfully",
    };
  },
  {
    rateLimit: "auth",
    bodySchema: verifyEmailSchema,
  }
);

export const PUT = createRoute(
  async ({ request }) => {
    const body = getValidatedBody<typeof resendVerificationOtpSchema._type>(
      request
    );

    const result = await authService.resendVerificationOtp(body.email);

    return result;
  },
  {
    rateLimit: "auth",
    bodySchema: resendVerificationOtpSchema,
  }
);
