import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { paymentsService } from "@/application/services/payments.service";
import { createPaymentSchema } from "@/lib/validation/schemas";

export const GET = createRoute(
  async ({ request, auth }) => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;
    const direction = searchParams.get("direction") as any;
    const year = searchParams.get("year")
      ? parseInt(searchParams.get("year")!)
      : undefined;

    const result = await paymentsService.listPayments(auth!.orgId, {
      page,
      limit,
      search,
      direction,
      year,
    });

    return result;
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

export const POST = createRoute(
  async ({ request, auth }) => {
    requireRole(auth!, "Manager");

    const body = getValidatedBody<typeof createPaymentSchema._type>(request);

    const payment = await paymentsService.createPayment(auth!.orgId, body);

    return payment;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: createPaymentSchema,
  }
);

