import {
  createRoute,
  getAllowedSearchParam,
  getPaginationParams,
  getValidatedBody,
  getYearSearchParam,
} from "@/lib/api/route-handler";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { paymentsService } from "@/application/services/payments.service";
import { createPaymentSchema } from "@/lib/validation/schemas";

export const GET = createRoute(
  async ({ request, auth }) => {
    const { searchParams } = new URL(request.url);
    const { page, limit } = getPaginationParams(request);
    const search = searchParams.get("search") || undefined;
    const direction = getAllowedSearchParam(request, "direction", [
      "Incoming",
      "Outgoing",
    ] as const);
    const relatedType = getAllowedSearchParam(request, "relatedType", [
      "Invoice",
      "Bill",
      "None",
    ] as const);
    const relatedId = searchParams.get("relatedId") || undefined;
    const year = getYearSearchParam(request);

    const result = await paymentsService.listPayments(auth!.orgId, {
      page,
      limit,
      search,
      direction,
      relatedType,
      relatedId,
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
