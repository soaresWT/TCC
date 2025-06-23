import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Páginas que requerem autenticação
  const protectedPaths = ["/admin", "/atividades/cadastro", "/home"];

  // Páginas que requerem permissões específicas
  const adminPaths = ["/admin"];

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

  if (isProtectedPath) {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/cadastro", request.url));
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/cadastro", request.url));
    }

    // Verificar se é página admin e usuário tem permissão
    if (isAdminPath && payload.tipo !== "admin") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/atividades/cadastro", "/home"],
};
