import { NextRequest, NextResponse } from "next/server";
import { initDatabase } from "../../init";
import dbConnection from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import User from "@/models/User";
import Bolsa from "@/models/Bolsa";

initDatabase().catch(console.error);

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await requireAuth(request, "tutor");
    await dbConnection();

    const { id } = params;
    const payload = await request.json();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const isAdminActor = authUser.tipo === "admin";

    if (!isAdminActor) {
      if (user.tipo === "admin") {
        return NextResponse.json(
          { error: "Permissão insuficiente" },
          { status: 403 }
        );
      }

      if (authUser.tipo !== "tutor") {
        return NextResponse.json(
          { error: "Permissão insuficiente" },
          { status: 403 }
        );
      }

      if (!authUser.bolsa || user.bolsa?.toString() !== authUser.bolsa) {
        return NextResponse.json(
          { error: "Tutores só podem gerenciar usuários da própria bolsa" },
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

    if (payload.email && payload.email !== user.email) {
      const emailTaken = await User.exists({
        email: payload.email,
        _id: { $ne: user._id },
      });
      if (emailTaken) {
        return NextResponse.json(
          { error: "Email já cadastrado" },
          { status: 400 }
        );
      }
    }

    if (payload.tipo === "admin" && !isAdminActor) {
      return NextResponse.json(
        { error: "Permissão insuficiente" },
        { status: 403 }
      );
    }

    if (user.tipo === "admin" && payload.tipo && payload.tipo !== "admin") {
      return NextResponse.json(
        { error: "Não é possível alterar o tipo do administrador" },
        { status: 400 }
      );
    }

    if (payload.tipo === "admin") {
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

    if (payload.name !== undefined) {
      user.name = payload.name;
    }
    if (payload.email !== undefined) {
      user.email = payload.email;
    }
    if (payload.campus !== undefined) {
      user.campus = payload.campus;
    }
    if (payload.tipo !== undefined) {
      user.tipo = payload.tipo;
    }
    if (payload.avatar !== undefined) {
      user.avatar = payload.avatar;
    }
    if (payload.bolsa !== undefined) {
      user.bolsa = payload.bolsa || undefined;
    }
    if (payload.password) {
      if (String(payload.password).length < 6) {
        return NextResponse.json(
          { error: "A senha deve ter no mínimo 6 caracteres" },
          { status: 400 }
        );
      }
      user.password = payload.password;
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await requireAuth(request, "tutor");
    await dbConnection();

    const { id } = params;
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
