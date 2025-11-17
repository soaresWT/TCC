import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/mongodb";
import Atividade from "@/models/Atividade";
import "@/models/User"; // Side-effect import garante registro do schema em builds otimizados
import { Types } from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("oiiii");
    await dbConnection();

    const { id } = await params;

    // Validar se o ID é um ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de atividade inválido" },
        { status: 400 }
      );
    }

    const atividade = await Atividade.findById(id)
      .populate("autor", "name email tipo")
      .populate("bolsistas", "name email tipo campus bolsa");

    if (!atividade) {
      return NextResponse.json(
        { error: "Atividade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(atividade, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar atividade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnection();

    const { id } = await params;
    const data = await request.json();

    // Validar se o ID é um ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de atividade inválido" },
        { status: 400 }
      );
    }

    const atividade = await Atividade.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!atividade) {
      return NextResponse.json(
        { error: "Atividade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(atividade, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar atividade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnection();

    const { id } = await params;

    // Validar se o ID é um ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "ID de atividade inválido" },
        { status: 400 }
      );
    }

    const atividade = await Atividade.findByIdAndDelete(id);

    if (!atividade) {
      return NextResponse.json(
        { error: "Atividade não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Atividade excluída com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir atividade:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
