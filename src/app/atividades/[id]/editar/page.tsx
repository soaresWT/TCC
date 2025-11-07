"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  Spin,
  Result,
  message,
  Typography,
  Breadcrumb,
  Button,
} from "antd";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AtividadeForm } from "@/app/components";
import type { Atividade } from "@/types/atividade";

const { Title, Text } = Typography;

export default function EditarAtividadePage() {
  const router = useRouter();
  const params = useParams();
  const atividadeId = useMemo(() => params?.id as string | undefined, [params]);
  const { user, hasPermission, loading: authLoading } = useAuth();
  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [loadingAtividade, setLoadingAtividade] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      message.error("Faça login para editar atividades");
      router.push("/cadastro");
      return;
    }

    if (!hasPermission("create-activity")) {
      message.error("Você não possui permissão para editar atividades");
      router.push(`/atividades/${atividadeId ?? ""}`);
    }
  }, [authLoading, hasPermission, router, user, atividadeId]);

  const canEdit = useMemo(() => {
    return Boolean(user && hasPermission("create-activity"));
  }, [hasPermission, user]);

  const fetchAtividade = useCallback(async () => {
    if (!atividadeId || !canEdit) return;

    setLoadingAtividade(true);
    setFetchError(null);
    try {
      const response = await fetch(`/api/atividades/${atividadeId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao carregar atividade");
      }
      const data = (await response.json()) as Atividade;
      setAtividade(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao carregar atividade";
      setFetchError(errorMessage);
    } finally {
      setLoadingAtividade(false);
    }
  }, [atividadeId, canEdit]);

  useEffect(() => {
    fetchAtividade();
  }, [fetchAtividade]);

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

  if (!atividadeId || !user || !canEdit) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "48px 24px 96px",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 780,
          borderRadius: 24,
          boxShadow: "0 24px 64px rgba(15, 23, 42, 0.12)",
        }}
        bodyStyle={{ padding: "32px 36px" }}
      >
        <Breadcrumb
          separator={<ChevronRight size={14} strokeWidth={1.6} />}
          items={[
            {
              title: <Link href="/atividades">Atividades</Link>,
            },
            {
              title: atividade?.nome ? (
                <Link href={`/atividades/${atividadeId}`}>
                  {atividade.nome}
                </Link>
              ) : (
                "Detalhes"
              ),
            },
            { title: "Editar" },
          ]}
        />

        <div style={{ marginTop: 16, marginBottom: 32 }}>
          <Title level={3} style={{ margin: 0 }}>
            Editar atividade
          </Title>
          <Text type="secondary">
            Atualize informações, arquivos e bolsistas vinculados a esta
            atividade.
          </Text>
        </div>

        {fetchError ? (
          <Result
            status="error"
            title="Não foi possível carregar a atividade"
            subTitle={fetchError}
            extra={[
              <Button
                key="back"
                onClick={() => router.push(`/atividades/${atividadeId}`)}
              >
                Voltar para detalhes
              </Button>,
              <Button
                key="retry"
                type="primary"
                onClick={() => fetchAtividade()}
              >
                Tentar novamente
              </Button>,
            ]}
          />
        ) : (
          <AtividadeForm
            mode="edit"
            atividadeId={atividadeId}
            currentUser={user}
            initialValues={atividade}
            loadingInitialData={loadingAtividade}
            onCancel={() => router.back()}
            onSuccess={(updated) => {
              setAtividade(updated);
              router.push(`/atividades/${updated._id}`);
            }}
            submitLabel="Salvar alterações"
            successMessage="Alterações salvas com sucesso!"
          />
        )}
      </Card>
    </div>
  );
}
