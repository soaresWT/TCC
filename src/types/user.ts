export interface User {
  _id: string;
  email: string;
  tipo: "bolsista" | "tutor";
  name: string;
  campus: string;
  avatar?: string;
  atividades?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  email: string;
  password: string;
  tipo: "bolsista" | "tutor";
  name: string;
  campus: string;
  avatar?: string;
}
