import {
  Atividade,
  AtividadeForm,
  AtividadeSearchParams,
} from "@/types/atividade";

export class AtividadeService {
  private static baseUrl = "/api/atividades";

  static async getAtividades(
    params?: AtividadeSearchParams
  ): Promise<Atividade[]> {
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.append("search", params.search);
    if (params?.categoria) queryParams.append("categoria", params.categoria);
    if (params?.campus) queryParams.append("campus", params.campus);
    if (params?.autor) queryParams.append("autor", params.autor);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = queryParams.toString()
      ? `${this.baseUrl}?${queryParams}`
      : this.baseUrl;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Erro ao carregar atividades");
    }

    return response.json();
  }

  static async getAtividadeById(id: string): Promise<Atividade> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (!response.ok) {
      throw new Error("Erro ao carregar atividade");
    }

    return response.json();
  }

  static async createAtividade(
    atividadeData: AtividadeForm
  ): Promise<Atividade> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(atividadeData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Erro ao criar atividade");
    }

    return response.json();
  }

  static async updateAtividade(
    id: string,
    atividadeData: Partial<AtividadeForm>
  ): Promise<Atividade> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(atividadeData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Erro ao atualizar atividade");
    }

    return response.json();
  }

  static async deleteAtividade(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Erro ao deletar atividade");
    }
  }
}
