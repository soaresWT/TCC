import { NextResponse } from "next/server";
import User from "@/models/User";
import { initDatabase } from "../init";
import dbConnection from "@/lib/mongodb";
import bcrypt from "bcryptjs";

initDatabase().catch(console.error);

export async function POST(request: Request) {
  await dbConnection();
  const data = await request.json();
  const { email, password, role, name, campus, avatar } = data;

  // Validação básica
  if (!email || !password || !role || !name || !campus) {
    return NextResponse.json(
      { error: "Todos os campos são obrigatórios" },
      { status: 400 }
    );
  }

  // Verificar se o email já existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
  }

  try {
    const user = await User.create({
      email,
      password, // Será hasheada pelo middleware do modelo
      role,
      name,
      campus,
      avatar: avatar || "",
      atividades: [],
    });

    // Não retornar a senha
    const { password: _, ...userData } = user.toObject();
    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function GET() {
  await dbConnection();
  try {
    const users = await User.find({}).select("-password"); // Exclui a senha do resultado
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
