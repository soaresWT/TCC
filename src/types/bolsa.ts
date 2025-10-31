export interface Bolsa {
  _id: string;
  nome: string;
  bolsistas: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BolsaForm {
  nome: string;
  bolsistas?: string[];
}
