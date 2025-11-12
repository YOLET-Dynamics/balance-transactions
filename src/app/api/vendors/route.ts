import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import { vendorsService } from "@/application/services/vendors.service";
import { createVendorSchema } from "@/lib/validation/schemas";

export const GET = createRoute(
  async ({ request, auth }) => {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;

    const vendors = await vendorsService.listVendors(auth!.orgId, search);

    return { vendors };
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

export const POST = createRoute(
  async ({ request, auth }) => {
    const body = getValidatedBody<typeof createVendorSchema._type>(request);

    const vendor = await vendorsService.createVendor(auth!.orgId, body);

    return vendor;
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);

