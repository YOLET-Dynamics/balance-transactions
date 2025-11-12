import { createUploadthing, type FileRouter } from "uploadthing/next";
import { cookies } from "next/headers";
import { authService } from "@/application/services/auth.service";
import { hashToken } from "@/lib/crypto/hash";
import { UnauthorizedError } from "@/lib/utils/errors";

const f = createUploadthing();

async function authenticateUpload() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    throw new UnauthorizedError("You must be logged in to upload files");
  }

  const tokenHash = hashToken(token);
  const session = await authService.validateSession(tokenHash);

  if (!session) {
    throw new UnauthorizedError("Invalid or expired session");
  }

  return {
    userId: session.userId,
    orgId: session.orgId,
  };
}

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const authResult = await authenticateUpload();
      return authResult;
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        orgId: metadata.orgId,
        url: file.url,
      };
    }),

  attachmentUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    pdf: { maxFileSize: "4MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const authResult = await authenticateUpload();
      return authResult;
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        orgId: metadata.orgId,
        url: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
