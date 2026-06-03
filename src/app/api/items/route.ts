import {
  createRoute,
  getAllowedSearchParam,
  getPaginationParams,
  getValidatedBody,
} from "@/lib/api/route-handler";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { itemsService } from "@/application/services/items.service";
import { createItemSchema } from "@/lib/validation/schemas";
import { authRepository } from "@/infrastructure/repositories/auth.repository.impl";

export const GET = createRoute(
  async ({ request, auth }) => {
    const { searchParams } = new URL(request.url);
    const { page, limit } = getPaginationParams(request, 50);
    const search = searchParams.get("search") || undefined;
    const type = getAllowedSearchParam(request, "type", [
      "Good",
      "Service",
    ] as const);
    const isActive = searchParams.get("isActive")
      ? searchParams.get("isActive") === "true"
      : undefined;

    const result = await itemsService.listItems(auth!.orgId, {
      page,
      limit,
      search,
      type,
      isActive,
    });

    return result;
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

export const POST = createRoute(
  async ({ request, auth }) => {
    requireRole(auth!, "Manager");

    const body = getValidatedBody<typeof createItemSchema._type>(request);

    const org = await authRepository.findOrgById(auth!.orgId);

    const item = await itemsService.createItem(auth!.orgId, org!.code, body);

    return item;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: createItemSchema,
  }
);
