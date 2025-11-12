import { createRoute, getValidatedBody } from '@/lib/api/route-handler';
import { resetPasswordSchema } from '@/lib/validation/schemas';
import { authService } from '@/application/services/auth.service';

export const POST = createRoute(
  async ({ request }) => {
    const body = getValidatedBody<typeof resetPasswordSchema._type>(request);
    
    await authService.resetPassword(body.token, body.password);
    
    return {
      success: true,
      message: 'Password reset successfully',
    };
  },
  {
    rateLimit: 'auth',
    bodySchema: resetPasswordSchema,
  }
);

