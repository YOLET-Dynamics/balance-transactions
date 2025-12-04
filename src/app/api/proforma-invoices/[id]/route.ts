import { createRoute } from "@/lib/api/route-handler";
import { proformaService } from "@/application/services/proforma.service";
import { requireRole } from "@/lib/middleware/auth.middleware";

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

    const body = await request.json();

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

