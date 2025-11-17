import { createUploadthing, type FileRouter } from "uploadthing/next";
import { requireAuth } from "@/lib/auth";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const MAX_FILE_SIZE = "16MB";
const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/gif",
  "text/plain",
]);

export const fileRouter = {
  atividadeAttachment: f(
    {
      blob: {
        maxFileSize: MAX_FILE_SIZE,
        maxFileCount: 1,
      },
    },
    {
      awaitServerData: true,
    }
  )
    .middleware(async ({ req, files }) => {
      let user;

      try {
        user = await requireAuth(req);
      } catch (error) {
        throw new UploadThingError({
          code: "FORBIDDEN",
          message:
            error instanceof Error ? error.message : "Usuário não autenticado",
        });
      }

      const hasInvalidType = files.some(
        (file) => !ACCEPTED_TYPES.has(file.type)
      );
      if (hasInvalidType) {
        throw new UploadThingError({
          code: "BAD_REQUEST",
          message:
            "Tipo de arquivo não permitido. Utilize PDF, DOC, DOCX, JPG, PNG, GIF ou TXT.",
        });
      }

      const hasOversizedFile = files.some(
        (file) => file.size > 10 * 1024 * 1024
      );
      if (hasOversizedFile) {
        throw new UploadThingError({
          code: "TOO_LARGE",
          message: "Arquivo muito grande. Máximo permitido: 10MB.",
        });
      }

      return {
        userId: user.userId,
        email: user.email,
        tipo: user.tipo,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        fileName: file.key,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: file.ufsUrl ?? file.url,
        uploadedBy: metadata.userId,
        uploadedAt: new Date().toISOString(),
      };
    }),
} satisfies FileRouter;

export type FileRouterType = typeof fileRouter;
