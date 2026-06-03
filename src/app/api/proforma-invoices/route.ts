import {
  createRoute,
  getAllowedSearchParam,
  getPaginationParams,
  getValidatedBody,
  getYearSearchParam,
} from "@/lib/api/route-handler";
import {
  createProformaInvoiceSchema,
} from "@/lib/validation/schemas";
import { proformaService } from "@/application/services/proforma.service";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { authRepository } from "@/infrastructure/repositories/auth.repository.impl";

export const POST = createRoute(
  async ({ request, auth }) => {
    requireRole(auth!, "Manager");

    const body =
      getValidatedBody<typeof createProformaInvoiceSchema._type>(request);

    const org = await authRepository.findOrgById(auth!.orgId);

    const proforma = await proformaService.createProforma(
      auth!.orgId,
      org!.code,
      body
    );

    return proforma;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: createProformaInvoiceSchema,
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

    const result = await proformaService.listProformas(auth!.orgId, {
      page,
      limit,
      search,
      status,
      year,
    });

    return result;
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);
