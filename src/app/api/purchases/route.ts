import { createRoute } from "@/lib/api/route-handler";
import {
  createPurchaseBillSchema,
  paginationSchema,
} from "@/lib/validation/schemas";
import { purchasesService } from "@/application/services/purchases.service";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { authRepository } from "@/infrastructure/repositories/auth.repository.impl";

export const POST = createRoute(
  async ({ request, auth }) => {
    requireRole(auth!, "Manager");

    const body = await request.json();

    const org = await authRepository.findOrgById(auth!.orgId);

    const bill = await purchasesService.createBill(
      auth!.orgId,
      org!.code,
      body
    );

    return bill;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);

export const GET = createRoute(
  async ({ request, auth }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const search = url.searchParams.get("search") || undefined;
    const year = url.searchParams.get("year")
      ? parseInt(url.searchParams.get("year")!)
      : undefined;

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

