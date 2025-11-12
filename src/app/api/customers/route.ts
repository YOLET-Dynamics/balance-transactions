import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import { createCustomerSchema } from "@/lib/validation/schemas";
import { prisma } from "@/infrastructure/database/prisma";

export const GET = createRoute(
  async ({ request, auth }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    
    const customers = await prisma.customer.findMany({
      where: {
        orgId: auth!.orgId,
        OR: search
          ? [
              { legalName: { contains: search, mode: "insensitive" } },
              { tradeName: { contains: search, mode: "insensitive" } },
              { tin: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      orderBy: [{ legalName: "asc" }],
      take: 50,
    });

    return { customers };
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

export const POST = createRoute(
  async ({ request, auth }) => {
    const body = getValidatedBody<typeof createCustomerSchema._type>(request);

    const customer = await prisma.customer.create({
      data: {
        orgId: auth!.orgId,
        ...body,
      },
    });

    return { customer };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: createCustomerSchema,
  }
);

