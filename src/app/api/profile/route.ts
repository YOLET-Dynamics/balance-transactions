import { createRoute } from "@/lib/api/route-handler";
import { prisma } from "@/infrastructure/database/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
});

export const PATCH = createRoute(
  async ({ request, auth }) => {
    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: auth!.userId },
      data: {
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });

    return { user };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);
