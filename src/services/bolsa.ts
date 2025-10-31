import { Bolsa } from "@/types/bolsa";

export class BolsaService {
  private static baseUrl = "/api/bolsas";

  static async getBolsas(): Promise<Bolsa[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error("Erro ao carregar bolsas");
    }

    return response.json();
  }

  static async createBolsa(bolsaData: {
    nome: string;
    bolsistas?: string[];
  }): Promise<Bolsa> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bolsaData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Erro ao criar bolsa");
    }

    return response.json();
  }

  static async updateBolsa(
    id: string,
    bolsaData: Partial<{ nome: string; bolsistas: string[] }>
  ): Promise<Bolsa> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bolsaData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Erro ao atualizar bolsa");
    }

    return response.json();
  }

  static async deleteBolsa(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Erro ao deletar bolsa");
    }
  }
}
