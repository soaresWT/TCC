import { NextRequest, NextResponse } from "next/server";
import Bolsa from "@/models/Bolsa";
import dbConnection from "@/lib/mongodb";
import { requireAuth, getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    await dbConnection();

    let bolsas;

    if (!authUser) {
      // Usuários não autenticados podem ver apenas informações básicas das bolsas
      bolsas = await Bolsa.find({}).select("nome");
    } else if (authUser.tipo === "admin") {
      // Admin pode ver todas as bolsas com detalhes
      bolsas = await Bolsa.find({}).populate("bolsistas", "name email tipo");
    } else if (authUser.tipo === "tutor") {
      // Tutor só pode ver a própria bolsa
      bolsas = await Bolsa.find({ _id: authUser.bolsa }).populate(
        "bolsistas",
        "name email tipo"
      );
    } else {
      // Bolsistas podem ver informações básicas de todas as bolsas
      bolsas = await Bolsa.find({}).select("nome");
    }

    return NextResponse.json(bolsas);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apenas admins podem criar bolsas
    await requireAuth(request, "admin");
    await dbConnection();

    const { nome } = await request.json();

    if (!nome) {
      return NextResponse.json(
        { error: "Nome da bolsa é obrigatório" },
        { status: 400 }
      );
    }

    const bolsa = await Bolsa.create({
      nome,
      bolsistas: [],
    });

    return NextResponse.json(bolsa, { status: 201 });
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
