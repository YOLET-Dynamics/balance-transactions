import {
  createRoute,
  getAllowedSearchParam,
  getPaginationParams,
  getValidatedBody,
  getYearSearchParam,
} from "@/lib/api/route-handler";
import {
  createSalesInvoiceSchema,
} from "@/lib/validation/schemas";
import { salesService } from "@/application/services/sales.service";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { authRepository } from "@/infrastructure/repositories/auth.repository.impl";

export const POST = createRoute(
  async ({ request, auth }) => {
    requireRole(auth!, "Manager");

    const body =
      getValidatedBody<typeof createSalesInvoiceSchema._type>(request);

    const org = await authRepository.findOrgById(auth!.orgId);

    const invoice = await salesService.createInvoice(
      auth!.orgId,
      org!.code,
      body
    );

    return invoice;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: createSalesInvoiceSchema,
  }
);

export const GET = createRoute(
  async ({ request, auth }) => {
    const url = new URL(request.url);
    const { page, limit } = getPaginationParams(request);
    const search = url.searchParams.get("search") || undefined;
    const status = getAllowedSearchParam(request, "status", [
      "Draft",
      "Pending",
      "Paid",
      "Overdue",
      "Cancelled",
    ] as const);
    const year = getYearSearchParam(request);

    const result = await salesService.listInvoices(auth!.orgId, {
      page,
      limit,
      search,
      status,
      kind: "Invoice",
      year,
    });

    return result;
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);
