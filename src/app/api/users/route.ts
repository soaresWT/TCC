import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import Bolsa from "@/models/Bolsa";
import { initDatabase } from "../init";
import dbConnection from "@/lib/mongodb";
import { requireAuth, getAuthUser } from "@/lib/auth";

initDatabase().catch(console.error);

export async function POST(request: NextRequest) {
  try {
    await dbConnection();

    const data = await request.json();
    const { email, password, tipo, name, campus, avatar, bolsa } = data;

    if (!email || !password || !tipo || !name || !campus) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const existingAdmin = await User.findOne({ tipo: "admin" });

    if (tipo === "admin" && existingAdmin) {
      return NextResponse.json(
        { error: "Já existe um administrador no sistema" },
        { status: 400 }
      );
    }

    if (tipo !== "admin" || existingAdmin) {
      const authUser = await requireAuth(request, "tutor");

      if (authUser.tipo === "tutor") {
        if (!bolsa || bolsa !== authUser.bolsa) {
          return NextResponse.json(
            { error: "Tutores só podem criar usuários da própria bolsa" },
            { status: 403 }
          );
        }
        if (tipo === "tutor" || tipo === "admin") {
          return NextResponse.json(
            { error: "Permissão insuficiente para criar este tipo de usuário" },
            { status: 403 }
          );
        }
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }

    const user = await User.create({
      email,
      password,
      tipo,
      name,
      campus,
      avatar: avatar || "",
      bolsa: bolsa || null,
      atividades: [],
    });

    if (bolsa && tipo === "bolsista") {
      await Bolsa.findByIdAndUpdate(bolsa, {
        $addToSet: { bolsistas: user._id },
      });
    }

    // Não retornar a senha
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userData } = user.toObject();
    return NextResponse.json(userData, { status: 201 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno";
    if (
      errorMessage.includes("não autenticado") ||
      errorMessage.includes("Permissão")
    ) {
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    await dbConnection();

    let users;

    if (!authUser) {
      // Usuários não autenticados não podem listar usuários
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    if (authUser.tipo === "admin") {
      // Admin pode ver todos os usuários
      users = await User.find({}).populate("bolsa").select("-password");
    } else if (authUser.tipo === "tutor") {
      // Tutor só pode ver usuários da mesma bolsa
      users = await User.find({ bolsa: authUser.bolsa })
        .populate("bolsa")
        .select("-password");
    } else {
      // Bolsistas só podem ver próprio perfil
      users = await User.find({ _id: authUser.userId })
        .populate("bolsa")
        .select("-password");
    }

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
