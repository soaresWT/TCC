import { CreateUserPayload, User, UserFormData } from "@/types/user";

export class UserService {
  private static baseUrl = "/api/users";

  private static async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "error" in data
          ? String((data as { error?: unknown }).error)
          : "Erro ao processar requisição";
      throw new Error(errorMessage);
    }

    return data as T;
  }

  static async getUsers(): Promise<User[]> {
    return this.request<User[]>(this.baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  static async createUser(userData: CreateUserPayload): Promise<User> {
    return this.request<User>(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  }

  static async updateUser(
    id: string,
    userData: Partial<UserFormData>
  ): Promise<User> {
    return this.request<User>(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  }

  static async deleteUser(id: string): Promise<void> {
    await this.request(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
