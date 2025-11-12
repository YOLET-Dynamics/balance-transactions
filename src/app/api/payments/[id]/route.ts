import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { paymentsService } from "@/application/services/payments.service";
import { updatePaymentSchema } from "@/lib/validation/schemas";

export const GET = createRoute(
  async ({ params, auth }) => {
    const payment = await paymentsService.getPaymentById(auth!.orgId, params!.id);

    return payment;
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

export const PATCH = createRoute(
  async ({ params, auth, request }) => {
    requireRole(auth!, "Manager");

    const body = getValidatedBody<typeof updatePaymentSchema._type>(request);

    const payment = await paymentsService.updatePayment(
      auth!.orgId,
      params!.id,
      body
    );

    return payment;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: updatePaymentSchema,
  }
);

export const DELETE = createRoute(
  async ({ params, auth }) => {
    requireRole(auth!, "Admin");

    await paymentsService.deletePayment(auth!.orgId, params!.id);

    return { success: true };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);

