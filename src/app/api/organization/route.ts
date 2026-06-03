import { createRoute, getValidatedBody } from "@/lib/api/route-handler";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { withTenantContext } from "@/infrastructure/database/prisma";
import { z } from "zod";

const updateOrganizationSchema = z.object({
  legalName: z.string().min(1).max(255).optional(),
  tradeName: z.string().max(255).optional(),
  subcity: z.string().max(100).optional(),
  cityRegion: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  tin: z.string().max(50).optional(),
  vatNumber: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  isWithholdingAgent: z.boolean().optional(),
});

export const PATCH = createRoute(
  async ({ request, auth }) => {
    requireRole(auth!, "Admin");

    const validated = getValidatedBody<z.infer<typeof updateOrganizationSchema>>(
      request
    );

    const organization = await withTenantContext(auth!.orgId, async (tx) => {
      return await tx.organization.update({
        where: { id: auth!.orgId },
        data: {
          legalName: validated.legalName,
          tradeName: validated.tradeName,
          subcity: validated.subcity,
          cityRegion: validated.cityRegion,
          country: validated.country,
          tin: validated.tin,
          vatNumber: validated.vatNumber,
          phone: validated.phone,
          email: validated.email,
          isWithholdingAgent: validated.isWithholdingAgent,
        },
        select: {
          id: true,
          code: true,
          legalName: true,
          tradeName: true,
          subcity: true,
          cityRegion: true,
          country: true,
          tin: true,
          vatNumber: true,
          phone: true,
          email: true,
          isWithholdingAgent: true,
          createdAt: true,
        },
      });
    });

    return { organization };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
    bodySchema: updateOrganizationSchema,
  }
);
