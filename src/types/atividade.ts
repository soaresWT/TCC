export interface Atividade {
  _id: string;
  nome: string;
  descricao: string;
  campus: string;
  visibilidade: boolean;
  autor: {
    _id: string;
    name: string;
    email: string;
  };
  bolsistas: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  participantes: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  datainicio?: string;
  categoria: "Ensino" | "Pesquisa" | "Extensão" | "Outros";
  quantidadeAlunos?: number;
  arquivo?: {
    fileName: string;
    originalName: string;
    size: number;
    type: string;
    url: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AtividadeForm {
  nome: string;
  descricao: string;
  campus: string;
  visibilidade?: boolean;
  bolsistas?: string[];
  participantes?: string[];
  datainicio?: string;
  categoria: "Ensino" | "Pesquisa" | "Extensão" | "Outros";
  quantidadeAlunos?: number;
  arquivo?: File;
}

export interface AtividadeSearchParams {
  search?: string;
  categoria?: string;
  campus?: string;
  autor?: string;
  page?: number;
  limit?: number;
}
