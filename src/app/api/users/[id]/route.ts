import { NextRequest, NextResponse } from "next/server";
import { initDatabase } from "../../init";
import dbConnection from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import Bolsa from "@/models/Bolsa";

initDatabase().catch(console.error);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    await dbConnection();

    const { id } = await params;
    const payload = await request.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const isAdminActor = authUser.tipo === "admin";
    const isTutorActor = authUser.tipo === "tutor";
    const isSelfUpdate = authUser.userId === user._id.toString();

    if (!isSelfUpdate) {
      if (!isAdminActor && !isTutorActor) {
        return NextResponse.json(
          { error: "Permissão insuficiente" },
          { status: 403 }
        );
      }

      if (!isAdminActor) {
        if (user.tipo === "admin") {
          return NextResponse.json(
            { error: "Permissão insuficiente" },
            { status: 403 }
          );
        }

        if (!authUser.bolsa || user.bolsa?.toString() !== authUser.bolsa) {
          return NextResponse.json(
            {
              error: "Tutores só podem gerenciar usuários da própria bolsa",
            },
            { status: 403 }
          );
        }

        if (user.tipo !== "bolsista") {
          return NextResponse.json(
            { error: "Tutores só podem editar bolsistas" },
            { status: 403 }
          );
        }

        if (payload.tipo && payload.tipo !== "bolsista") {
          return NextResponse.json(
            { error: "Tutores não podem alterar o tipo de usuário" },
            { status: 403 }
          );
        }

        if (payload.bolsa && payload.bolsa !== authUser.bolsa) {
          return NextResponse.json(
            { error: "Tutores só podem atribuir a própria bolsa" },
            { status: 403 }
          );
        }
      }
    }

    const updatePayload = { ...payload };

    if (isSelfUpdate && !isAdminActor) {
      if (updatePayload.tipo && updatePayload.tipo !== user.tipo) {
        return NextResponse.json(
          { error: "Não é permitido alterar o tipo de usuário" },
          { status: 403 }
        );
      }

      if (
        Object.prototype.hasOwnProperty.call(updatePayload, "bolsa") &&
        updatePayload.bolsa !== (user.bolsa?.toString() ?? undefined)
      ) {
        return NextResponse.json(
          { error: "Não é permitido alterar a bolsa associada" },
          { status: 403 }
        );
      }

      delete (updatePayload as { tipo?: unknown }).tipo;
      delete (updatePayload as { bolsa?: unknown }).bolsa;
    }

    if (updatePayload.email && updatePayload.email !== user.email) {
      const emailTaken = await User.exists({
        email: updatePayload.email,
        _id: { $ne: user._id },
      });
      if (emailTaken) {
        return NextResponse.json(
          { error: "Email já cadastrado" },
          { status: 400 }
        );
      }
    }

    if (updatePayload.tipo === "admin" && !isAdminActor) {
      return NextResponse.json(
        { error: "Permissão insuficiente" },
        { status: 403 }
      );
    }

    if (
      user.tipo === "admin" &&
      updatePayload.tipo &&
      updatePayload.tipo !== "admin"
    ) {
      return NextResponse.json(
        { error: "Não é possível alterar o tipo do administrador" },
        { status: 400 }
      );
    }

    if (updatePayload.tipo === "admin") {
      const existingAdmin = await User.findOne({ tipo: "admin" });
      if (
        existingAdmin &&
        existingAdmin._id.toString() !== user._id.toString()
      ) {
        return NextResponse.json(
          { error: "Já existe um administrador no sistema" },
          { status: 400 }
        );
      }
    }

    const previousTipo = user.tipo;
    const previousBolsa = user.bolsa?.toString() ?? null;

    if (updatePayload.name !== undefined) {
      user.name = updatePayload.name;
    }
    if (updatePayload.email !== undefined) {
      user.email = updatePayload.email;
    }
    if (updatePayload.campus !== undefined) {
      user.campus = updatePayload.campus;
    }
    if (updatePayload.tipo !== undefined) {
      user.tipo = updatePayload.tipo;
    }
    if (updatePayload.avatar !== undefined) {
      user.avatar = updatePayload.avatar;
    }
    if (updatePayload.bolsa !== undefined) {
      user.bolsa = updatePayload.bolsa || undefined;
    }
    if (updatePayload.password) {
      if (String(updatePayload.password).length < 6) {
        return NextResponse.json(
          { error: "A senha deve ter no mínimo 6 caracteres" },
          { status: 400 }
        );
      }
      user.password = updatePayload.password;
    }

    await user.save();

    const currentBolsa = user.bolsa?.toString() ?? null;

    if (
      previousTipo === "bolsista" &&
      previousBolsa &&
      (user.tipo !== "bolsista" || currentBolsa !== previousBolsa)
    ) {
      await Bolsa.findByIdAndUpdate(previousBolsa, {
        $pull: { bolsistas: user._id },
      });
    }

    if (user.tipo === "bolsista" && currentBolsa) {
      await Bolsa.findByIdAndUpdate(currentBolsa, {
        $addToSet: { bolsistas: user._id },
      });
    }

    const updatedUser = user.toObject();
    delete (updatedUser as { password?: string }).password;

    return NextResponse.json(updatedUser);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const statusCode = message.includes("Permissão") ? 403 : 400;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request, "tutor");
    await dbConnection();

    const { id } = await params;
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (user.tipo === "admin") {
      return NextResponse.json(
        { error: "Não é possível remover o administrador" },
        { status: 400 }
      );
    }

    if (authUser.tipo !== "admin") {
      if (user.tipo !== "bolsista") {
        return NextResponse.json(
          { error: "Permissão insuficiente" },
          { status: 403 }
        );
      }

      if (!authUser.bolsa || user.bolsa?.toString() !== authUser.bolsa) {
        return NextResponse.json(
          { error: "Tutores só podem remover bolsistas da própria bolsa" },
          { status: 403 }
        );
      }
    }

    const bolsaId = user.bolsa?.toString();
    await user.deleteOne();

    if (bolsaId) {
      await Bolsa.findByIdAndUpdate(bolsaId, {
        $pull: { bolsistas: user._id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const statusCode = message.includes("Permissão") ? 403 : 400;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
