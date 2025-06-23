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
