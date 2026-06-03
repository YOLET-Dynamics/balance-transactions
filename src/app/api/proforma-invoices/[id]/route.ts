import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import { proformaService } from "@/application/services/proforma.service";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { updateProformaInvoiceSchema } from "@/lib/validation/schemas";

export const GET = createRoute(
  async ({ params, auth }) => {
    const proforma = await proformaService.getProformaById(auth!.orgId, params!.id);
    return proforma;
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

export const PATCH = createRoute(
  async ({ params, auth, request }) => {
    requireRole(auth!, "Manager");

    const body =
      getValidatedBody<typeof updateProformaInvoiceSchema._type>(request);

    const proforma = await proformaService.updateProforma(
      auth!.orgId,
      params!.id,
      body
    );

    return proforma;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: updateProformaInvoiceSchema,
  }
);

export const DELETE = createRoute(
  async ({ params, auth }) => {
    requireRole(auth!, "Admin");

    await proformaService.deleteProforma(auth!.orgId, params!.id);

    return { success: true, message: "Proforma invoice deleted successfully" };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);
