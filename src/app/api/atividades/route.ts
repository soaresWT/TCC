import { NextRequest, NextResponse } from "next/server";
import Atividade from "@/models/Atividade";
import User from "@/models/User";
import dbConnection from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  // Qualquer um pode consultar atividades (não precisa de autenticação)
  await dbConnection();
  const { searchParams } = new URL(request.url);

  const filters: Record<string, unknown> = {};
  // Filtros
  if (searchParams.has("nome")) {
    filters.nome = { $regex: searchParams.get("nome"), $options: "i" };
  }
  if (searchParams.has("campus")) {
    filters.campus = searchParams.get("campus");
  }
  if (searchParams.has("categoria")) {
    filters.categoria = searchParams.get("categoria");
  }
  if (searchParams.has("visibilidade")) {
    filters.visibilidade = searchParams.get("visibilidade") === "true";
  }
  if (searchParams.has("datainicio")) {
    const dataInicio = new Date(searchParams.get("datainicio")!);
    // Criar range de um dia completo (00:00 até 23:59:59)
    const startOfDay = new Date(dataInicio);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dataInicio);
    endOfDay.setHours(23, 59, 59, 999);

    filters.datainicio = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  const atividades = await Atividade.find(filters)
    .populate("autor", "name email tipo")
    .populate("bolsistas", "name email tipo campus bolsa");
  return NextResponse.json(atividades);
}

export async function POST(request: NextRequest) {
  try {
    // Apenas usuários autenticados podem criar atividades
    const authUser = await requireAuth(request);
    await dbConnection();

    const data = await request.json();

    // Adicionar o autor automaticamente
    const atividadeData = {
      ...data,
      autor: authUser.userId,
    };

    const atividade = await Atividade.create(atividadeData);

    // Adicionar a atividade à lista do usuário
    await User.findByIdAndUpdate(authUser.userId, {
      $push: { atividades: atividade._id },
    });

    const populatedAtividade = await Atividade.findById(atividade._id)
      .populate("autor", "name email tipo")
      .populate("bolsistas", "name email tipo campus bolsa");

    return NextResponse.json(populatedAtividade, { status: 201 });
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
