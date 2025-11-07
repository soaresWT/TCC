import mongoose, { Schema, Types } from "mongoose";

const atividadeSchema = new Schema(
  {
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    campus: { type: String, required: true },
    visibilidade: { type: Boolean, required: false },
    autor: { type: Types.ObjectId, ref: "User", required: true },
    bolsistas: [{ type: Types.ObjectId, ref: "User", required: false }],
    participantes: [{ type: Types.ObjectId, ref: "User", required: false }],
    datainicio: { type: Date, required: false },
    datafim: { type: Date, required: false },
    categoria: {
      type: String,
      required: true,
      enum: ["Ensino", "Pesquisa", "Extensão", "Outros"],
      default: "Outros",
    },
    quantidadeAlunos: { type: Number, required: false, min: 0 },
    avaliacao: {
      type: String,
      required: false,
      enum: ["Plena", "Parcial", "Não desenvolvida"],
    },
    cargaHoraria: {
      type: Number,
      required: false,
      min: 0,
      validate: {
        validator(value: number | undefined) {
          if (value === undefined || value === null) return true;
          return value > 0;
        },
        message: "A carga horária deve ser um valor positivo",
      },
    },
    materialUtilizado: { type: String, required: false },
    relatoAvaliacao: { type: String, required: false },
    metodologiaUtilizada: { type: String, required: false },
    resultados: { type: String, required: false },
    arquivo: {
      fileName: { type: String, required: false },
      originalName: { type: String, required: false },
      size: { type: Number, required: false },
      type: { type: String, required: false },
      url: { type: String, required: false },
    },
  },
  { timestamps: true }
);

const Atividade =
  mongoose.models.Atividade || mongoose.model("Atividade", atividadeSchema);
export default Atividade;
