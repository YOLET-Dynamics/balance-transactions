import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import {
  createSalesInvoiceSchema,
  paginationSchema,
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
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const year = url.searchParams.get("year")
      ? parseInt(url.searchParams.get("year")!)
      : undefined;

    const result = await salesService.listInvoices(auth!.orgId, {
      page,
      limit,
      search,
      status: status !== "all" ? status : undefined,
      year,
    });

    return result;
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);
