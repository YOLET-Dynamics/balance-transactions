import { createRoute, getValidatedBody } from '@/lib/api/route-handler';
import { registerSchema } from '@/lib/validation/schemas';
import { authService } from '@/application/services/auth.service';

export const POST = createRoute(
  async ({ request }) => {
    const body = getValidatedBody<typeof registerSchema._type>(request);
    
    const result = await authService.register(body);
    
    return {
      success: true,
      userId: result.userId,
      message: result.message,
    };
  },
  {
    rateLimit: 'auth',
    bodySchema: registerSchema,
  }
);

