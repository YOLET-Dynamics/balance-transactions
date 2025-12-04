import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
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
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const search = url.searchParams.get("search") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const year = url.searchParams.get("year")
      ? parseInt(url.searchParams.get("year")!)
      : undefined;

    const result = await proformaService.listProformas(auth!.orgId, {
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

