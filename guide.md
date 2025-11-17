# 🚀 UploadThing + Next.js --- Quick Integration Guide

Este guia cobre a integração mínima e funcional para uso em produção com
Next.js (App Router) e UploadThing.

## 📦 Instalação

```bash
npm install uploadthing @uploadthing/react
```

---

## 🧩 1. Configure o File Router

Crie: `app/api/uploadthing/core.ts`

```ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const fileRouter = {
  avatar: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      return { userId: "example-user-id" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Uploaded file URL:", file.url);
      return { fileUrl: file.url };
    }),
} satisfies FileRouter;

export type FileRouterType = typeof fileRouter;
```

---

## 🛣️ 2. Registre a rota

Crie: `app/api/uploadthing/route.ts`

```ts
import { createNextRouteHandler } from "uploadthing/next";
import { fileRouter } from "./core";

export const { GET, POST } = createNextRouteHandler({
  router: fileRouter,
});
```

---

## 🎨 3. Use no Frontend

Exemplo de uso em qualquer componente client:

```tsx
"use client";

import { UploadButton } from "@uploadthing/react";
import type { FileRouterType } from "@/app/api/uploadthing/core";

export function AvatarUploader() {
  return (
    <UploadButton<FileRouterType>
      endpoint="avatar"
      onClientUploadComplete={(res) => {
        console.log("Arquivo enviado:", res[0].url);
      }}
      onUploadError={(err) => {
        console.error("Erro:", err);
      }}
    />
  );
}
```

## ENV UPLOADTHING_TOKEN

## ✅ Resultado

- Upload direto do navegador → UploadThing\
- Zero carga no backend da Vercel\
- URL final disponível no `onUploadComplete`\
- Pronto para salvar no banco ou usar no frontend

---

## 🔗 Docs oficiais

https://uploadthing.com/docs
