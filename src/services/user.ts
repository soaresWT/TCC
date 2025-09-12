import { User, UserFormData } from "@/types/user";
import { ApiResponse } from "@/types/api";

export class UserService {
  private static baseUrl = "/api/users";

  static async getUsers(): Promise<User[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error("Erro ao carregar usuários");
    }

    return response.json();
  }

  static async createUser(userData: UserFormData): Promise<ApiResponse<User>> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao criar usuário");
    }

    return data;
  }

  static async updateUser(
    id: string,
    userData: Partial<UserFormData>
  ): Promise<ApiResponse<User>> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao atualizar usuário");
    }

    return data;
  }

  static async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Erro ao deletar usuário");
    }
  }
}
