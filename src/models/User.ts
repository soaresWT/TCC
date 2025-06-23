import mongoose, { Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tipo: {
      type: String,
      required: true,
      enum: ["bolsista", "tutor", "admin"],
      default: "bolsista",
    },
    avatar: { type: String },
    name: { type: String, required: true },
    campus: { type: String, required: true },
    bolsa: { type: Types.ObjectId, ref: "Bolsa" },
    atividades: [{ type: Types.ObjectId, ref: "Atividade" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
