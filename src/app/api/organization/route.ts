import { createRoute } from "@/lib/api/route-handler";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { prisma } from "@/infrastructure/database/prisma";
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
});

export const PATCH = createRoute(
  async ({ request, auth }) => {
    requireRole(auth!, "Admin");

    const body = await request.json();
    const validated = updateOrganizationSchema.parse(body);

    const organization = await prisma.organization.update({
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
        createdAt: true,
      },
    });

    return { organization };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);

