"use client";
import { useEffect } from "react";
import { Card, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AtividadeForm } from "@/app/components";

export default function CadastroAtividade() {
  const router = useRouter();
  const { user, hasPermission, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      message.error("Você precisa estar logado para criar atividades");
      router.push("/cadastro");
      return;
    }

    if (!hasPermission("create-activity")) {
      message.error("Você não tem permissão para criar atividades");
      router.push("/home");
    }
  }, [authLoading, hasPermission, router, user]);

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user || !hasPermission("create-activity")) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "64px 24px 96px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      <Card
        title="Cadastrar nova atividade"
        style={{
          width: "100%",
          maxWidth: 680,
          borderRadius: 24,
          boxShadow: "0 24px 64px rgba(15, 23, 42, 0.12)",
        }}
        bodyStyle={{ padding: "32px 36px 28px" }}
      >
        <AtividadeForm
          mode="create"
          currentUser={user}
          onCancel={() => router.back()}
          onSuccess={() => router.push("/atividades")}
        />
      </Card>
    </div>
  );
}
