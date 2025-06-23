import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import User from "@/models/User";
import dbConnection from "./mongodb";
import { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "sua-chave-secreta-super-forte";

export interface UserPayload {
  userId: string;
  email: string;
  tipo: "admin" | "tutor" | "bolsista";
  bolsa?: string;
}

interface UserForToken {
  _id: Types.ObjectId;
  email: string;
  tipo: "admin" | "tutor" | "bolsista";
  bolsa?: Types.ObjectId;
}

export function generateToken(user: UserForToken): string {
  const payload: UserPayload = {
    userId: user._id.toString(),
    email: user.email,
    tipo: user.tipo,
    bolsa: user.bolsa?.toString(),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(
  request: NextRequest
): Promise<UserPayload | null> {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    request.cookies.get("auth-token")?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  await dbConnection();
  const user = await User.findById(payload.userId);
  if (!user) return null;

  return payload;
}

export function checkPermission(
  user: UserPayload,
  action: string,
  targetUserId?: string
): boolean {
  switch (user.tipo) {
    case "admin":
      // Admin pode fazer tudo
      return true;

    case "tutor":
      if (action === "manage-users") {
        // Tutor só pode gerenciar usuários da mesma bolsa
        return true; // A verificação da bolsa será feita no endpoint
      }
      if (action === "create-activity") {
        return true;
      }
      return false;

    case "bolsista":
      if (action === "create-activity") {
        return true;
      }
      if (action === "edit-profile" && targetUserId === user.userId) {
        return true;
      }
      return false;

    default:
      return false;
  }
}

export async function requireAuth(
  request: NextRequest,
  minRole?: "admin" | "tutor" | "bolsista"
) {
  const user = await getAuthUser(request);

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  if (minRole) {
    const roleHierarchy = { admin: 3, tutor: 2, bolsista: 1 };
    if (roleHierarchy[user.tipo] < roleHierarchy[minRole]) {
      throw new Error("Permissão insuficiente");
    }
  }

  return user;
}
