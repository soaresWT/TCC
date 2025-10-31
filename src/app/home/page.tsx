"use client";

import React, { useEffect, useState } from "react";
import { Typography } from "antd";
import { AtividadeSearchForm, AtividadeList } from "../components";
import type { AtividadeFilters } from "../components";
import { Atividade } from "../../types/atividade";

const { Title } = Typography;

export default function Home() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<AtividadeFilters>({
    nome: "",
    campus: "",
    visibilidade: undefined,
    datainicio: undefined,
  });

  const fetchAtividades = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.nome) params.append("nome", filters.nome);
    if (filters.campus) params.append("campus", filters.campus);
    if (filters.visibilidade !== undefined)
      params.append("visibilidade", String(filters.visibilidade));
    if (filters.datainicio) params.append("datainicio", filters.datainicio);

    const res = await fetch(`/api/atividades?${params.toString()}`);
    const data = await res.json();
    setAtividades(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAtividades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setFilters(clearedFilters);
    setTimeout(fetchAtividades, 0);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Atividades</Title>

      <AtividadeSearchForm
        filters={filters}
        loading={loading}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />

      <AtividadeList
        atividades={atividades}
        loading={loading}
        emptyMessage="Nenhuma atividade encontrada"
      />
    </div>
  );
}
