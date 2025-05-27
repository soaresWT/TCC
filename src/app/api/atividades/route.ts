import { NextResponse } from "next/server";
import Atividade from "@/models/Atividade";
import dbConnection from "@/lib/mongodb";

export async function GET(request: Request) {
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
  if (searchParams.has("visibilidade")) {
    filters.visibilidade = searchParams.get("visibilidade") === "true";
  }
  if (searchParams.has("datainicio")) {
    filters.datainicio = { $gte: new Date(searchParams.get("datainicio")!) };
  }

  const atividades = await Atividade.find(filters);
  return NextResponse.json(atividades);
}

export async function POST(request: Request) {
  await dbConnection();
  const data = await request.json();
  try {
    const atividade = await Atividade.create(data);
    return NextResponse.json(atividade, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
