import { createRoute } from "@/lib/api/route-handler";
import { purchasesService } from "@/application/services/purchases.service";
import { requireRole } from "@/lib/middleware/auth.middleware";

export const GET = createRoute(
  async ({ params, auth }) => {
    const bill = await purchasesService.getBillById(auth!.orgId, params!.id);
    return bill;
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

    const bill = await purchasesService.updateBill(
      auth!.orgId,
      params!.id,
      body
    );

    return bill;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);

export const DELETE = createRoute(
  async ({ params, auth }) => {
    requireRole(auth!, "Admin");

    await purchasesService.deleteBill(auth!.orgId, params!.id);

    return { success: true, message: "Purchase bill deleted successfully" };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);

