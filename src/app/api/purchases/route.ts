import {
  createRoute,
  getPaginationParams,
  getValidatedBody,
  getYearSearchParam,
} from "@/lib/api/route-handler";
import {
  createPurchaseBillSchema,
} from "@/lib/validation/schemas";
import { purchasesService } from "@/application/services/purchases.service";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { authRepository } from "@/infrastructure/repositories/auth.repository.impl";

export const POST = createRoute(
  async ({ request, auth }) => {
    requireRole(auth!, "Manager");

    const body = getValidatedBody<typeof createPurchaseBillSchema._type>(request);

    const org = await authRepository.findOrgById(auth!.orgId);

    const bill = await purchasesService.createBill(
      auth!.orgId,
      org!.code,
      body,
      org!.isWithholdingAgent
    );

    return bill;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: createPurchaseBillSchema,
  }
);

export const GET = createRoute(
  async ({ request, auth }) => {
    const url = new URL(request.url);
    const { page, limit } = getPaginationParams(request);
    const search = url.searchParams.get("search") || undefined;
    const year = getYearSearchParam(request);

    const result = await purchasesService.listBills(auth!.orgId, {
      page,
      limit,
      search,
      year,
    });

    return result;
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);
