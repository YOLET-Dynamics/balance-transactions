import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { itemsService } from "@/application/services/items.service";
import { updateItemSchema } from "@/lib/validation/schemas";

export const GET = createRoute(
  async ({ params, auth }) => {
    const item = await itemsService.getItemById(auth!.orgId, params!.id);

    return item;
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

export const PATCH = createRoute(
  async ({ params, auth, request }) => {
    requireRole(auth!, "Manager");

    const body = getValidatedBody<typeof updateItemSchema._type>(request);

    const item = await itemsService.updateItem(auth!.orgId, params!.id, body);

    return item;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: updateItemSchema,
  }
);

export const DELETE = createRoute(
  async ({ params, auth }) => {
    requireRole(auth!, "Admin");

    await itemsService.deleteItem(auth!.orgId, params!.id);

    return { success: true };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);

