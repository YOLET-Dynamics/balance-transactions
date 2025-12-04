import { createRoute } from "@/lib/api/route-handler";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { prisma } from "@/infrastructure/database/prisma";
import { z } from "zod";

const uploadLogoSchema = z.object({
  url: z.string().url(),
  fileKey: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
});

export const POST = createRoute(
  async ({ request, auth }) => {
    requireRole(auth!, "Admin");

    const body = await request.json();
    const validated = uploadLogoSchema.parse(body);

    const attachment = await prisma.attachment.create({
      data: {
        orgId: auth!.orgId,
        fileKey: validated.fileKey,
        url: validated.url,
        mime: "image/png",
        size: validated.fileSize,
        kind: "Logo",
        createdBy: auth!.userId,
      },
    });

    const organization = await prisma.organization.update({
      where: { id: auth!.orgId },
      data: {
        logoAttachmentId: attachment.id,
      },
      include: {
        logoAttachment: true,
      },
    });

    return { organization, attachment };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);

export const DELETE = createRoute(
  async ({ auth }) => {
    requireRole(auth!, "Admin");

    const org = await prisma.organization.findUnique({
      where: { id: auth!.orgId },
      select: { logoAttachmentId: true },
    });

    if (org?.logoAttachmentId) {
      await prisma.attachment.delete({
        where: { id: org.logoAttachmentId },
      });
    }

    await prisma.organization.update({
      where: { id: auth!.orgId },
      data: {
        logoAttachmentId: null,
      },
    });

    return { success: true, message: "Logo removed successfully" };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);

