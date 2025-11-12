import { createRoute, getValidatedBody } from '@/lib/api/route-handler';
import { requestPasswordResetSchema } from '@/lib/validation/schemas';
import { authService } from '@/application/services/auth.service';

export const POST = createRoute(
  async ({ request }) => {
    const body = getValidatedBody<typeof requestPasswordResetSchema._type>(request);
    
    const result = await authService.requestPasswordReset(body.email);
    
    return result;
  },
  {
    rateLimit: 'auth',
    bodySchema: requestPasswordResetSchema,
  }
);

