import {
  createUploadthing,
  type FileRouter,
  UTFiles,
} from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import {
  authenticateRequest,
  hasRole,
  type AuthContext,
} from "@/lib/middleware/auth.middleware";
import { withTenantContext } from "@/infrastructure/database/prisma";

const f = createUploadthing();

type UploadAuthMetadata = Record<string, string> & {
  userId: string;
  orgId: string;
  role: string;
};

const logoUploadInputSchema = z.object({
  intent: z.literal("organizationLogo"),
});

const LOGO_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

function sanitizeUploadFileName(fileName: string): string {
  const trimmed = fileName.trim().slice(0, 120);
  const sanitized = trimmed.replace(/[^a-zA-Z0-9._-]/g, "-");
  return sanitized || "upload";
}

function toUploadThingAuthError(error: unknown): UploadThingError {
  return new UploadThingError({
    code: "FORBIDDEN",
    message:
      error instanceof Error
        ? error.message
        : "You must be logged in to upload files",
    cause: error,
  });
}

async function authenticateUpload(
  req: Parameters<typeof authenticateRequest>[0]
): Promise<AuthContext> {
  try {
    return await authenticateRequest(req);
  } catch (error) {
    throw toUploadThingAuthError(error);
  }
}

function toUploadMetadata(auth: AuthContext): UploadAuthMetadata {
  return {
    userId: auth.userId,
    orgId: auth.orgId,
    role: auth.role,
  };
}

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return toUploadMetadata(await authenticateUpload(req));
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        orgId: metadata.orgId,
        url: file.ufsUrl,
      };
    }),

  logoUploader: f(
    {
      "image/png": { maxFileSize: "2MB", maxFileCount: 1 },
      "image/jpeg": { maxFileSize: "2MB", maxFileCount: 1 },
      "image/webp": { maxFileSize: "2MB", maxFileCount: 1 },
    },
    { presignedURLTTL: "10m" }
  )
    .input(logoUploadInputSchema)
    .middleware(async ({ req, input, files }) => {
      const authResult = await authenticateUpload(req);

      if (!hasRole(authResult.role, "Admin")) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message: "Requires Admin role or higher",
        });
      }

      if (input.intent !== "organizationLogo" || files.length !== 1) {
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message: "Invalid upload intent",
        });
      }

      const [file] = files;
      if (!file || !LOGO_MIME_TYPES.has(file.type)) {
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message: "Logo must be a PNG, JPG, or WebP image",
        });
      }

      const fileName = sanitizeUploadFileName(file.name);

      return {
        ...toUploadMetadata(authResult),
        intent: input.intent,
        [UTFiles]: [
          {
            ...file,
            name: fileName,
            customId: `org-logo-${authResult.orgId}-${randomUUID()}`,
          },
        ],
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const organization = await withTenantContext(
        metadata.orgId,
        async (tx) => {
          const existingOrganization = await tx.organization.findUnique({
            where: { id: metadata.orgId },
            select: { logoAttachmentId: true },
          });

          const attachment = await tx.attachment.create({
            data: {
              orgId: metadata.orgId,
              fileKey: file.key,
              url: file.ufsUrl,
              mime: file.type,
              size: file.size,
              kind: "Logo",
              createdBy: metadata.userId,
            },
          });

          const organization = await tx.organization.update({
            where: { id: metadata.orgId },
            data: { logoAttachmentId: attachment.id },
            include: { logoAttachment: true },
          });

          if (existingOrganization?.logoAttachmentId) {
            await tx.attachment.deleteMany({
              where: {
                id: existingOrganization.logoAttachmentId,
                orgId: metadata.orgId,
              },
            });
          }

          return organization;
        }
      );

      return {
        uploadedBy: metadata.userId,
        orgId: metadata.orgId,
        url: file.ufsUrl,
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
        attachmentId: organization.logoAttachmentId,
      };
    }),

  attachmentUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    pdf: { maxFileSize: "4MB", maxFileCount: 5 },
  })
    .middleware(async ({ req }) => {
      return toUploadMetadata(await authenticateUpload(req));
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        orgId: metadata.orgId,
        url: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
