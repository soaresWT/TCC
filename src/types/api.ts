export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginResponse {
  success: boolean;
  user?: {
    _id: string;
    email: string;
    name: string;
    tipo: "admin" | "tutor" | "bolsista";
    campus: string;
    bolsa?: {
      _id: string;
      nome: string;
    };
    avatar?: string;
    atividades?: string[];
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

export interface AuthCheckResponse {
  authenticated: boolean;
  user?: {
    _id: string;
    email: string;
    name: string;
    tipo: "admin" | "tutor" | "bolsista";
    campus: string;
    bolsa?: {
      _id: string;
      nome: string;
    };
    avatar?: string;
    atividades?: string[];
    createdAt: string;
    updatedAt: string;
  };
}

export interface UploadResponse {
  success: boolean;
  fileName?: string;
  originalName?: string;
  size?: number;
  type?: string;
  url?: string;
  error?: string;
}
