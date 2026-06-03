import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import { purchasesService } from "@/application/services/purchases.service";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { updatePurchaseBillSchema } from "@/lib/validation/schemas";
import { authRepository } from "@/infrastructure/repositories/auth.repository.impl";

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

    const body = getValidatedBody<typeof updatePurchaseBillSchema._type>(request);
    const org = await authRepository.findOrgById(auth!.orgId);

    const bill = await purchasesService.updateBill(
      auth!.orgId,
      params!.id,
      body,
      org!.isWithholdingAgent
    );

    return bill;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: updatePurchaseBillSchema,
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
