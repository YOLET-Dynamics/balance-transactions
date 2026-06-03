import { createRoute } from "@/lib/api/route-handler";
import { requireRole } from "@/lib/middleware/auth.middleware";
import { withTenantContext } from "@/infrastructure/database/prisma";
import { ForbiddenError } from "@/lib/utils/errors";

export const POST = createRoute(
  async ({ auth }) => {
    requireRole(auth!, "Admin");

    throw new ForbiddenError(
      "Logo uploads must complete through UploadThing"
    );
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);

export const DELETE = createRoute(
  async ({ auth }) => {
    requireRole(auth!, "Admin");

    await withTenantContext(auth!.orgId, async (tx) => {
      const org = await tx.organization.findUnique({
        where: { id: auth!.orgId },
        select: { logoAttachmentId: true },
      });

      await tx.organization.update({
        where: { id: auth!.orgId },
        data: {
          logoAttachmentId: null,
        },
      });

      if (org?.logoAttachmentId) {
        await tx.attachment.deleteMany({
          where: { id: org.logoAttachmentId, orgId: auth!.orgId },
        });
      }
    });

    return { success: true, message: "Logo removed successfully" };
  },
  {
    requireAuth: true,
    rateLimit: "mutations",
  }
);
