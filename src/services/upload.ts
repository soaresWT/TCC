import { UploadResponse } from "@/types/api";

export class UploadService {
  private static baseUrl = "/api/upload";

  static async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(this.baseUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao fazer upload do arquivo");
    }

    return data;
  }
}
