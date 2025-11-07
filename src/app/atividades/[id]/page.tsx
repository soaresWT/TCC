"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Spin,
  Alert,
  Avatar,
  List,
  Typography,
  Row,
  Col,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const avaliacaoColorMap: Record<string, string> = {
  Plena: "green",
  Parcial: "blue",
  "Não desenvolvida": "red",
};

interface Usuario {
  _id: string;
  name: string;
  email: string;
}

interface Arquivo {
  fileName: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
}

interface Atividade {
  _id: string;
  nome: string;
  descricao: string;
  campus: string;
  visibilidade: boolean;
  datainicio?: string;
  datafim?: string;
  categoria?: string;
  avaliacao?: "Plena" | "Parcial" | "Não desenvolvida";
  cargaHoraria?: number;
  materialUtilizado?: string;
  relatoAvaliacao?: string;
  metodologiaUtilizada?: string;
  resultados?: string;
  arquivo?: Arquivo;
  bolsistas: Usuario[];
  participantes: Usuario[];
  createdAt: string;
  updatedAt: string;
}

export default function DetalhesAtividade() {
  const [atividade, setAtividade] = useState<Atividade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const fetchAtividade = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/atividades/${id}`);

      if (response.ok) {
        const data = await response.json();
        setAtividade(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao carregar atividade");
      }
    } catch (error) {
      console.error("Erro ao buscar atividade:", error);
      setError("Erro de conexão ao carregar atividade");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchAtividade();
    }
  }, [id, fetchAtividade]);

  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja excluir esta atividade?")) {
      return;
    }

    try {
      const response = await fetch(`/api/atividades/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        message.success("Atividade excluída com sucesso!");
        router.push("/atividades");
      } else {
        const error = await response.json();
        message.error(error.error || "Erro ao excluir atividade");
      }
    } catch (error) {
      console.error("Erro ao excluir atividade:", error);
      message.error("Erro de conexão ao excluir atividade");
    }
  };

  const downloadFile = () => {
    if (atividade?.arquivo?.url) {
      window.open(atividade.arquivo.url, "_blank");
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const textSections = atividade
    ? (
        [
          {
            key: "materialUtilizado",
            title: "Material Utilizado",
            content: atividade.materialUtilizado,
          },
          {
            key: "relatoAvaliacao",
            title: "Relato/Avaliação (Resumo Detalhado da Atividade)",
            content: atividade.relatoAvaliacao,
          },
          {
            key: "metodologiaUtilizada",
            title: "Metodologia Utilizada",
            content: atividade.metodologiaUtilizada,
          },
          {
            key: "resultados",
            title: "Resultados",
            content: atividade.resultados,
          },
        ] as Array<{ key: string; title: string; content?: string }>
      ).filter((section) => {
        if (!section.content) return false;
        return section.content.trim().length > 0;
      })
    : [];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Carregando atividade...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert
          message="Erro"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={() => router.back()}>Voltar</Button>}
        />
      </div>
    );
  }

  if (!atividade) {
    return (
      <div style={{ padding: "20px" }}>
        <Alert
          message="Atividade não encontrada"
          description="A atividade que você está procurando não existe ou foi removida."
          type="warning"
          showIcon
          action={<Button onClick={() => router.back()}>Voltar</Button>}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header com botões de ação */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              size="large"
            >
              Voltar
            </Button>
          </Col>
          <Col>
            <Space>
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => router.push(`/atividades/${id}/editar`)}
              >
                Editar
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                Excluir
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Card principal com informações da atividade */}
        <Card
          style={{
            marginBottom: 24,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Title level={2} style={{ marginBottom: 16 }}>
            {atividade.nome}
          </Title>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={16}>
              <Descriptions column={1} size="middle">
                <Descriptions.Item
                  label={
                    <Space>
                      <EnvironmentOutlined />
                      Campus
                    </Space>
                  }
                >
                  <Tag color="blue">{atividade.campus}</Tag>
                </Descriptions.Item>

                {atividade.datainicio && (
                  <Descriptions.Item
                    label={
                      <Space>
                        <CalendarOutlined />
                        Data de Início
                      </Space>
                    }
                  >
                    {dayjs(atividade.datainicio).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                )}

                {atividade.datafim && (
                  <Descriptions.Item
                    label={
                      <Space>
                        <CalendarOutlined />
                        Data de Fim
                      </Space>
                    }
                  >
                    {dayjs(atividade.datafim).format("DD/MM/YYYY")}
                  </Descriptions.Item>
                )}

                {atividade.avaliacao && (
                  <Descriptions.Item label="Avaliação">
                    <Tag
                      color={
                        avaliacaoColorMap[atividade.avaliacao] ?? "default"
                      }
                    >
                      {atividade.avaliacao}
                    </Tag>
                  </Descriptions.Item>
                )}

                {atividade.cargaHoraria && (
                  <Descriptions.Item
                    label={
                      <Space>
                        <ClockCircleOutlined />
                        Carga Horária
                      </Space>
                    }
                  >
                    {atividade.cargaHoraria} horas
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Visibilidade">
                  <Tag color={atividade.visibilidade ? "green" : "orange"}>
                    {atividade.visibilidade ? "Pública" : "Privada"}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Criado em">
                  {dayjs(atividade.createdAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>

                <Descriptions.Item label="Última atualização">
                  {dayjs(atividade.updatedAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
              </Descriptions>
            </Col>

            <Col xs={24} md={8}>
              {/* Arquivo anexado */}
              {atividade.arquivo && (
                <Card size="small" title="Arquivo Anexado">
                  <div style={{ textAlign: "center" }}>
                    <FileOutlined
                      style={{
                        fontSize: 32,
                        color: "#1890ff",
                        marginBottom: 8,
                      }}
                    />
                    <div>
                      <Text strong>{atividade.arquivo.originalName}</Text>
                    </div>
                    <div>
                      <Text type="secondary">
                        {formatFileSize(atividade.arquivo.size)}
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={downloadFile}
                      style={{ marginTop: 8 }}
                    >
                      Download
                    </Button>
                  </div>
                </Card>
              )}
            </Col>
          </Row>
        </Card>

        {/* Descrição */}
        <Card
          title="Descrição"
          style={{
            marginBottom: 24,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Text
            style={{ whiteSpace: "pre-wrap", fontSize: 16, lineHeight: 1.6 }}
          >
            {atividade.descricao}
          </Text>
        </Card>

        {textSections.map((section) => (
          <Card
            key={section.key}
            title={section.title}
            style={{
              marginBottom: 24,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Text
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              {section.content ?? ""}
            </Text>
          </Card>
        ))}

        {/* Arquivo Anexado */}
        {atividade.arquivo && (
          <Card
            title={
              <Space>
                <FileOutlined />
                Arquivo Anexado
              </Space>
            }
            style={{
              marginBottom: 24,
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Row gutter={[16, 16]} align="middle">
              <Col span={16}>
                <Space direction="vertical" size="small">
                  <Text strong>{atividade.arquivo.originalName}</Text>
                  <Text type="secondary">
                    Tamanho: {formatFileSize(atividade.arquivo.size)} • Tipo:{" "}
                    {atividade.arquivo.type}
                  </Text>
                </Space>
              </Col>
              <Col span={8} style={{ textAlign: "right" }}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={downloadFile}
                  size="large"
                >
                  Download
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        {/* Bolsistas e Participantes */}
        <Row gutter={[24, 24]}>
          {/* Bolsistas */}
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <TeamOutlined />
                  Bolsistas ({atividade.bolsistas.length})
                </Space>
              }
              style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
            >
              {atividade.bolsistas.length > 0 ? (
                <List
                  dataSource={atividade.bolsistas}
                  renderItem={(bolsista) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={bolsista.name}
                        description={bolsista.email}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Nenhum bolsista cadastrado</Text>
              )}
            </Card>
          </Col>

          {/* Participantes */}
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  Participantes ({atividade.participantes.length})
                </Space>
              }
              style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
            >
              {atividade.participantes.length > 0 ? (
                <List
                  dataSource={atividade.participantes}
                  renderItem={(participante) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={participante.name}
                        description={participante.email}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">Nenhum participante cadastrado</Text>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
