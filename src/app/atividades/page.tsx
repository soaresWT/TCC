"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, List, Button, Space, Tag, Input, Select, message } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const { Search } = Input;
const { Option } = Select;

interface Atividade {
  _id: string;
  nome: string;
  descricao: string;
  campus: string;
  visibilidade: boolean;
  datainicio?: string;
  createdAt: string;
  autor?: {
    name: string;
    email: string;
    tipo: string;
  };
}

export default function AtividadesPage() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    nome: "",
    campus: "",
    visibilidade: "",
    datainicio: "",
  });
  const router = useRouter();
  const { hasPermission } = useAuth();

  const campusOptions = [
    "Campus I - João Pessoa",
    "Campus II - Areia",
    "Campus III - Bananeiras",
    "Campus IV - Rio Tinto",
    "Campus V - Mamanguape",
    "Campus VI - Sousa",
    "Campus VII - Patos",
    "Campus VIII - Cajazeiras",
    "Campus IX - Pombal",
    "Campus X - Guarabira",
    "Campus XI - Princesa Isabel",
    "Campus XII - Catolé do Rocha",
    "Campus XIII - Picuí",
    "Campus XIV - Monteiro",
    "Campus XV - Esperança",
  ];

  const fetchAtividades = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();

      if (filtros.nome) queryParams.append("nome", filtros.nome);
      if (filtros.campus) queryParams.append("campus", filtros.campus);
      if (filtros.visibilidade)
        queryParams.append("visibilidade", filtros.visibilidade);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            <Search
              placeholder="Buscar por nome"
              allowClear
              enterButton={<SearchOutlined />}
              value={filtros.nome}
              onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
              onSearch={() => fetchAtividades()}
            />

            <Select
              placeholder="Filtrar por campus"
              allowClear
              value={filtros.campus || undefined}
              onChange={(value) =>
                setFiltros({ ...filtros, campus: value || "" })
              }
              style={{ width: "100%" }}
            >
              {campusOptions.map((campus) => (
                <Option key={campus} value={campus}>
                  {campus}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Filtrar por visibilidade"
              allowClear
              value={filtros.visibilidade || undefined}
              onChange={(value) =>
                setFiltros({ ...filtros, visibilidade: value || "" })
              }
              style={{ width: "100%" }}
            >
              <Option value="true">Pública</Option>
              <Option value="false">Privada</Option>
            </Select>
          </div>
        </Card>

        {/* Lista de Atividades */}
        <Card>
          <List
            loading={loading}
            dataSource={atividades}
            renderItem={(atividade) => (
              <List.Item
                actions={[
                  <Button
                    key="view"
                    type="link"
                    onClick={() => router.push(`/atividades/${atividade._id}`)}
                  >
                    Ver Detalhes
                  </Button>,
                  <Button key="edit" type="link">
                    Editar
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {atividade.nome}
                      <Tag color={atividade.visibilidade ? "green" : "orange"}>
                        {atividade.visibilidade ? "Pública" : "Privada"}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <p style={{ marginBottom: "8px" }}>
                        {atividade.descricao}
                      </p>
                      <Space size="large">
                        <span>
                          <EnvironmentOutlined style={{ marginRight: "4px" }} />
                          {atividade.campus}
                        </span>
                        {atividade.datainicio && (
                          <span>
                            <CalendarOutlined style={{ marginRight: "4px" }} />
                            Início: {formatDate(atividade.datainicio)}
                          </span>
                        )}
                        {atividade.autor && (
                          <span style={{ color: "#1890ff" }}>
                            <UserOutlined style={{ marginRight: "4px" }} />
                            Por: {atividade.autor.name} ({atividade.autor.tipo})
                          </span>
                        )}
                        <span style={{ color: "#666" }}>
                          Criada em: {formatDate(atividade.createdAt)}
                        </span>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
            locale={{
              emptyText: "Nenhuma atividade encontrada",
            }}
          />
        </Card>
      </div>
    </div>
  );
}
