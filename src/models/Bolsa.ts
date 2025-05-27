import mongoose, { Schema, Types } from "mongoose";

const bolsaSchema = new Schema(
  {
    nome: { type: String, required: true },
    bolsistas: [{ type: Types.ObjectId, ref: "User", required: true }],
  },
  { timestamps: true }
);

const Bolsa = mongoose.models.Bolsa || mongoose.model("Bolsa", bolsaSchema);
export default Bolsa;
