import {
  generateReactHelpers,
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import type { FileRouterType } from "@/app/api/uploadthing/core";

export const UploadThingButton = generateUploadButton<FileRouterType>();
export const UploadThingDropzone = generateUploadDropzone<FileRouterType>();
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<FileRouterType>();
