import { createRoute } from "@/lib/api/route-handler";
import { salesService } from "@/application/services/sales.service";
import { requireRole } from "@/lib/middleware/auth.middleware";

export const GET = createRoute(
  async ({ params, auth }) => {
    const invoice = await salesService.getInvoiceById(auth!.orgId, params!.id);
    return invoice;
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

    const invoice = await salesService.updateInvoice(
      auth!.orgId,
      params!.id,
      body
    );

    return invoice;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);

export const DELETE = createRoute(
  async ({ params, auth }) => {
    requireRole(auth!, "Admin");

    await salesService.deleteInvoice(auth!.orgId, params!.id);

    return { success: true, message: "Invoice deleted successfully" };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);
