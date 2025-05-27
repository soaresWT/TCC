import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnection from "@/lib/mongodb";

export async function POST(request: Request) {
  await dbConnection();
  const { email, password } = await request.json();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 401 }
    );
  }

  const isMatch = password === user.password;

  if (!isMatch) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userData } = user.toObject();
  return NextResponse.json({ ok: true, user: userData });
}
