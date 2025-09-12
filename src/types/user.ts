export interface User {
  _id: string;
  email: string;
  tipo: "admin" | "tutor" | "bolsista";
  name: string;
  campus: string;
  avatar?: string;
  bolsa?: {
    _id: string;
    nome: string;
  };
  atividades?: string[];
  createdAt: string;
  updatedAt: string;
  role?: string;
}

export interface UserFormData {
  email: string;
  password: string;
  tipo: "admin" | "tutor" | "bolsista";
  name: string;
  campus: string;
  avatar?: string;
  bolsa?: string;
  role?: string;
}

export interface UserProfile {
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
}
