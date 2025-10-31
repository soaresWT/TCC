"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { AuthService } from "@/services/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const data = await AuthService.checkAuth();

      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await AuthService.login({ email, password });

      if (result.success && result.user) {
        setUser(result.user);

        // Redirecionar baseado no tipo de usuário
        if (result.user.tipo === "admin") {
          router.push("/admin");
        } else {
          router.push("/home");
        }

        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "Credenciais inválidas",
        };
      }
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch {
      // Ignore errors
    } finally {
      setUser(null);
      router.push("/");
    }
  };

  const hasPermission = (action: string): boolean => {
    if (!user) return false;

    switch (user.tipo) {
      case "admin":
        return true;
      case "tutor":
        return ["manage-users", "create-activity", "edit-profile"].includes(
          action
        );
      case "bolsista":
        return ["create-activity", "edit-profile"].includes(action);
      default:
        return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
