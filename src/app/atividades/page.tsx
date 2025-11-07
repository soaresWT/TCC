"use client";
import { useState, useEffect, useCallback } from "react";
import { Button, message, Card, Typography } from "antd";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Atividade } from "@/types/atividade";
import { AtividadeList, AtividadeSearchForm } from "@/app/components";
import type { AtividadeFilters } from "@/app/components/AtividadeSearchForm";

const { Title, Text } = Typography;

export default function AtividadesPage() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<AtividadeFilters>({
    nome: "",
    campus: "",
    visibilidade: undefined,
    datainicio: undefined,
  });
  const router = useRouter();
  const { hasPermission } = useAuth();

  const fetchAtividades = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      if (filtros.nome) queryParams.append("nome", filtros.nome);
      if (filtros.campus) queryParams.append("campus", filtros.campus);
      if (filtros.visibilidade !== undefined)
        queryParams.append("visibilidade", filtros.visibilidade.toString());
      if (filtros.datainicio)
        queryParams.append("datainicio", filtros.datainicio);

      const response = await fetch(`/api/atividades?${queryParams.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setAtividades(data);
      } else {
        message.error("Erro ao carregar atividades");
      }
    } catch (error) {
      console.error("Erro ao buscar atividades:", error);
      message.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    fetchAtividades();
  }, [fetchAtividades]);

  const handleFiltersChange = (newFilters: AtividadeFilters) => {
    setFiltros(newFilters);
  };

  const handleSearch = () => {
    fetchAtividades();
  };

  const handleClearFilters = () => {
    const clearedFilters: AtividadeFilters = {
      nome: "",
      campus: "",
      visibilidade: undefined,
      datainicio: undefined,
    };
    setFiltros(clearedFilters);
  };

  const handleAtividadeClick = (atividade: Atividade) => {
    router.push(`/atividades/${atividade._id}`);
  };

  return (
    <div
      style={{
        padding: "48px 24px 64px",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Title level={2} style={{ margin: 0 }}>
              Atividades
            </Title>
            <Text type="secondary">
              Acompanhe iniciativas, participantes e cronogramas em um único
              lugar.
            </Text>
          </div>
          {hasPermission("create-activity") && (
            <Button
              type="primary"
              icon={<Plus size={18} strokeWidth={1.6} />}
              onClick={() => router.push("/atividades/cadastro")}
              size="large"
              style={{ borderRadius: 999 }}
            >
              Nova Atividade
            </Button>
          )}
        </div>

        {/* Filtros */}
        <Card
          style={{
            borderRadius: 18,
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
          }}
          bodyStyle={{ padding: "24px 24px 8px" }}
        >
          <AtividadeSearchForm
            filters={filtros}
            loading={loading}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            onClear={handleClearFilters}
          />
        </Card>

        {/* Lista de Atividades */}
        <AtividadeList
          atividades={atividades}
          loading={loading}
          emptyMessage="Nenhuma atividade encontrada"
          onAtividadeClick={handleAtividadeClick}
          cardProps={{ xs: 24, sm: 12, md: 8, lg: 6 }}
        />
      </div>
    </div>
  );
}
