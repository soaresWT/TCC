import { LoginForm, UserForm } from "@/types/forms/auth";
import { LoginResponse, AuthCheckResponse, ApiResponse } from "@/types/api";
import { User } from "@/types/user";

export class AuthService {
  private static baseUrl = "/api/auth";

  static async login(credentials: LoginForm): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    return response.json();
  }

  static async logout(): Promise<void> {
    await fetch(`${this.baseUrl}/logout`, {
      method: "POST",
      credentials: "include",
    });
  }

  static async checkAuth(): Promise<AuthCheckResponse> {
    const response = await fetch(`${this.baseUrl}/me`, {
      credentials: "include",
    });

    if (!response.ok) {
      return { authenticated: false };
    }

    return response.json();
  }

  static async register(userData: UserForm): Promise<ApiResponse<User>> {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erro ao cadastrar usuário");
    }

    return data;
  }
}
