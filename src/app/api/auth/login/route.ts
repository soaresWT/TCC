import { NextResponse } from "next/server";
import User from "@/models/User";
import dbConnection from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  await dbConnection();
  const { email, password } = await request.json();

  const user = await User.findOne({ email }).populate("bolsa");
  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 401 }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
  }

  const token = generateToken(user);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userData } = user.toObject();

  const response = NextResponse.json({
    success: true,
    user: userData,
    token,
  });

  // Define o token como cookie httpOnly
  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 dias
  });

  return response;
}
