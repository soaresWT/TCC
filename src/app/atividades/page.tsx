"use client";
import { useState, useEffect, useCallback } from "react";
import { Button, message, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Atividade } from "@/types/atividade";
import { AtividadeList, AtividadeSearchForm } from "@/app/components";
import type { AtividadeFilters } from "@/app/components/AtividadeSearchForm";

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
    setFiltros({
      nome: "",
      campus: "",
      visibilidade: undefined,
      datainicio: undefined,
    });
  };

  const handleAtividadeClick = (atividade: Atividade) => {
    router.push(`/atividades/${atividade._id}`);
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            Atividades
          </h1>
          {hasPermission("create-activity") && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push("/atividades/cadastro")}
              size="large"
            >
              Nova Atividade
            </Button>
          )}
        </div>

        {/* Filtros */}
        <Card style={{ marginBottom: "24px" }}>
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
