"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  List,
  Button,
  Space,
  Tag,
  Input,
  Select,
  message,
  Statistic,
  Row,
  Col,
  Radio,
  Spin,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  DownloadOutlined,
  FileOutlined,
  BookOutlined,
  TeamOutlined,
  ExperimentOutlined,
  AppstoreOutlined,
  BarsOutlined,
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
  categoria: string;
  quantidadeAlunos?: number;
  bolsasDisponiveis?: Array<{
    _id: string;
    nome: string;
  }>;
  visibilidade: boolean;
  datainicio?: string;
  createdAt: string;
  autor?: {
    name: string;
    email: string;
    tipo: string;
  };
  arquivo?: {
    fileName: string;
    originalName: string;
    size: number;
    type: string;
    url: string;
  };
}

export default function Home() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [filtros, setFiltros] = useState({
    nome: "",
    campus: "",
    categoria: "",
  });
  const router = useRouter();
  const { hasPermission, user, loading: authLoading } = useAuth();

  // Redirecionar usuários não autenticados para a página de cadastro/login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/cadastro");
      return;
    }
  }, [user, authLoading, router]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 10;

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

  const categoriaOptions = ["Ensino", "Pesquisa", "Extensão", "Outros"];

  const fetchAtividades = useCallback(
    async (resetPage = false) => {
      if (resetPage) {
        setLoading(true);
        setPage(1);
        setAtividades([]);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const queryParams = new URLSearchParams();

        // Filtrar apenas atividades públicas na home
        queryParams.append("visibilidade", "true");

        if (filtros.nome) queryParams.append("nome", filtros.nome);
        if (filtros.campus) queryParams.append("campus", filtros.campus);
        if (filtros.categoria)
          queryParams.append("categoria", filtros.categoria);

        const currentPage = resetPage ? 1 : page;
        queryParams.append("page", currentPage.toString());
        queryParams.append("limit", ITEMS_PER_PAGE.toString());

        const response = await fetch(
          `/api/atividades?${queryParams.toString()}`
        );

        if (response.ok) {
          const data = await response.json();

          if (resetPage) {
            setAtividades(data);
          } else {
            setAtividades((prev) => [...prev, ...data]);
          }

          // Se retornou menos itens que o limite, não há mais páginas
          if (data.length < ITEMS_PER_PAGE) {
            setHasMore(false);
          }

          if (!resetPage) {
            setPage((prev) => prev + 1);
          }
        } else {
          message.error("Erro ao carregar atividades");
        }
      } catch (error) {
        console.error("Erro ao buscar atividades:", error);
        message.error("Erro de conexão. Tente novamente.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filtros, page, ITEMS_PER_PAGE]
  );

  // Observer para scroll infinito
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchAtividades(false);
        }
      },
      { threshold: 0.1 }
    );

    if (lastElementRef.current) {
      observerRef.current.observe(lastElementRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [fetchAtividades, hasMore, loadingMore, loading]);

  // Recarregar quando filtros mudarem
  useEffect(() => {
    const resetAndFetch = async () => {
      setLoading(true);
      setPage(1);
      setAtividades([]);
      setHasMore(true);

      try {
        const queryParams = new URLSearchParams();
        queryParams.append("visibilidade", "true");
        if (filtros.nome) queryParams.append("nome", filtros.nome);
        if (filtros.campus) queryParams.append("campus", filtros.campus);
        if (filtros.categoria)
          queryParams.append("categoria", filtros.categoria);
        queryParams.append("page", "1");
        queryParams.append("limit", "10");

        const response = await fetch(
          `/api/atividades?${queryParams.toString()}`
        );
        if (response.ok) {
          const data = await response.json();
          setAtividades(data);
          setPage(2);
          if (data.length < 10) {
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar atividades:", error);
      } finally {
        setLoading(false);
      }
    };

    resetAndFetch();
  }, [filtros.nome, filtros.campus, filtros.categoria]);

  // Carregar dados iniciais
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "/api/atividades?visibilidade=true&page=1&limit=10"
        );
        if (response.ok) {
          const data = await response.json();
          setAtividades(data);
          setPage(2);
          if (data.length < 10) {
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar atividades:", error);
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const handleDownload = (arquivo: { url: string; originalName: string }) => {
    if (arquivo.url) {
      const link = document.createElement("a");
      link.href = arquivo.url;
      link.download = arquivo.originalName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStats = () => {
    const totalAtividades = atividades.length;
    const ensino = atividades.filter((a) => a.categoria === "Ensino").length;
    const pesquisa = atividades.filter(
      (a) => a.categoria === "Pesquisa"
    ).length;
    const extensao = atividades.filter(
      (a) => a.categoria === "Extensão"
    ).length;
    const outros = atividades.filter((a) => a.categoria === "Outros").length;

    return { ensino, pesquisa, extensao, outros, total: totalAtividades };
  };

  // Card Component para visualização em cards
  const AtividadeCard = ({ atividade }: { atividade: Atividade }) => (
    <Card
      hoverable
      style={{ marginBottom: "16px", height: "100%" }}
      actions={[
        <Button
          key="view"
          type="link"
          onClick={() => router.push(`/atividades/${atividade._id}`)}
        >
          Ver Detalhes
        </Button>,
        ...(atividade.arquivo
          ? [
              <Button
                key="download"
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(atividade.arquivo!)}
              >
                Download
              </Button>,
            ]
          : []),
      ]}
    >
      <Card.Meta
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontWeight: "bold" }}>{atividade.nome}</span>
            {atividade.arquivo && (
              <FileOutlined
                style={{ color: "#1890ff" }}
                title="Possui arquivo anexado"
              />
            )}
            <Tag color="green">Pública</Tag>
            <Tag color="blue">{atividade.categoria}</Tag>
          </div>
        }
        description={
          <div>
            <p
              style={{
                marginBottom: "12px",
                height: "48px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {atividade.descricao}
            </p>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <div>
                <EnvironmentOutlined
                  style={{ marginRight: "4px", color: "#666" }}
                />
                <span style={{ fontSize: "13px" }}>{atividade.campus}</span>
              </div>

              {atividade.quantidadeAlunos && (
                <div style={{ color: "#722ed1" }}>
                  <UserOutlined style={{ marginRight: "4px" }} />
                  <span style={{ fontSize: "13px" }}>
                    {atividade.quantidadeAlunos} alunos
                  </span>
                </div>
              )}

              {atividade.bolsasDisponiveis &&
                atividade.bolsasDisponiveis.length > 0 && (
                  <div style={{ color: "#13c2c2" }}>
                    <span style={{ fontSize: "13px" }}>
                      <strong>Bolsas:</strong>{" "}
                      {atividade.bolsasDisponiveis
                        .map((bolsa) => bolsa.nome)
                        .join(", ")}
                    </span>
                  </div>
                )}

              {atividade.datainicio && (
                <div>
                  <CalendarOutlined
                    style={{ marginRight: "4px", color: "#666" }}
                  />
                  <span style={{ fontSize: "13px" }}>
                    Início: {formatDate(atividade.datainicio)}
                  </span>
                </div>
              )}

              {atividade.autor && (
                <div style={{ color: "#1890ff" }}>
                  <UserOutlined style={{ marginRight: "4px" }} />
                  <span style={{ fontSize: "13px" }}>
                    <strong>Por:</strong> {atividade.autor.name} (
                    {atividade.autor.tipo})
                  </span>
                </div>
              )}

              {atividade.arquivo && (
                <div style={{ color: "#52c41a" }}>
                  <FileOutlined style={{ marginRight: "4px" }} />
                  <span style={{ fontSize: "13px" }}>
                    <strong>Arquivo:</strong> {atividade.arquivo.originalName}
                  </span>
                </div>
              )}

              <div
                style={{ color: "#999", fontSize: "12px", marginTop: "8px" }}
              >
                Criada em: {formatDate(atividade.createdAt)}
              </div>
            </Space>
          </div>
        }
      />
    </Card>
  );

  const stats = getStats();

  // Não renderizar nada se o usuário não estiver autenticado
  if (!user && !authLoading) {
    return null;
  }

  // Mostrar loading durante verificação de autenticação
  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Cabeçalho com boas-vindas */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: "bold",
              color: "#1890ff",
            }}
          >
            {user
              ? `Bem-vindo, ${user.name}!`
              : "Bem-vindo ao Sistema de Gestão"}
          </h1>
          <p style={{ fontSize: "16px", color: "#666", marginTop: "8px" }}>
            Explore as atividades acadêmicas disponíveis em nossa instituição
          </p>
        </div>

        {/* Cards de estatísticas */}
        <Row gutter={16} style={{ marginBottom: "32px" }}>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Card>
              <Statistic
                title="Total de Atividades"
                value={stats.total}
                prefix={<BookOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Card>
              <Statistic
                title="Ensino"
                value={stats.ensino}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Card>
              <Statistic
                title="Pesquisa"
                value={stats.pesquisa}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Card>
              <Statistic
                title="Extensão"
                value={stats.extensao}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#eb2f96" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6} lg={5}>
            <Card>
              <Statistic
                title="Outros"
                value={stats.outros}
                prefix={<FileOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Header com ações */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>
            Todas as Atividades
          </h2>
          <Space>
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="list">
                <BarsOutlined /> Lista
              </Radio.Button>
              <Radio.Button value="card">
                <AppstoreOutlined /> Cards
              </Radio.Button>
            </Radio.Group>
            {hasPermission("create-activity") && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push("/atividades/cadastro")}
              >
                Nova Atividade
              </Button>
            )}
          </Space>
        </div>

        {/* Filtros simplificados */}
        <Card style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            <Search
              placeholder="Buscar por nome"
              allowClear
              enterButton={<SearchOutlined />}
              value={filtros.nome}
              onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
              onSearch={() => {
                setLoading(true);
                setPage(1);
                setAtividades([]);
                setHasMore(true);
                fetchAtividades(true);
              }}
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
              placeholder="Filtrar por categoria"
              allowClear
              value={filtros.categoria || undefined}
              onChange={(value) =>
                setFiltros({ ...filtros, categoria: value || "" })
              }
              style={{ width: "100%" }}
            >
              {categoriaOptions.map((categoria) => (
                <Option key={categoria} value={categoria}>
                  {categoria}
                </Option>
              ))}
            </Select>
          </div>
        </Card>

        {/* Lista de Atividades */}
        <Card>
          {viewMode === "list" ? (
            <List
              loading={loading}
              dataSource={atividades}
              renderItem={(atividade) => (
                <List.Item
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      onClick={() =>
                        router.push(`/atividades/${atividade._id}`)
                      }
                    >
                      Ver Detalhes
                    </Button>,
                    ...(atividade.arquivo
                      ? [
                          <Button
                            key="download"
                            type="link"
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload(atividade.arquivo!)}
                          >
                            Download
                          </Button>,
                        ]
                      : []),
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
                        {atividade.arquivo && (
                          <FileOutlined
                            style={{ color: "#1890ff" }}
                            title="Possui arquivo anexado"
                          />
                        )}
                        <Tag color="green">Pública</Tag>
                      </div>
                    }
                    description={
                      <div>
                        <p style={{ marginBottom: "12px" }}>
                          {atividade.descricao}
                        </p>
                        <Space size="large" wrap>
                          <span>
                            <EnvironmentOutlined
                              style={{ marginRight: "4px" }}
                            />
                            {atividade.campus}
                          </span>
                          <span>
                            <Tag color="blue">{atividade.categoria}</Tag>
                          </span>
                          {atividade.quantidadeAlunos && (
                            <span style={{ color: "#722ed1" }}>
                              <UserOutlined style={{ marginRight: "4px" }} />
                              {atividade.quantidadeAlunos} alunos
                            </span>
                          )}
                          {atividade.bolsasDisponiveis &&
                            atividade.bolsasDisponiveis.length > 0 && (
                              <span style={{ color: "#13c2c2" }}>
                                <strong>Bolsas:</strong>{" "}
                                {atividade.bolsasDisponiveis
                                  .map((bolsa) => bolsa.nome)
                                  .join(", ")}
                              </span>
                            )}
                          {atividade.datainicio && (
                            <span>
                              <CalendarOutlined
                                style={{ marginRight: "4px" }}
                              />
                              Início: {formatDate(atividade.datainicio)}
                            </span>
                          )}
                          {atividade.autor && (
                            <span style={{ color: "#1890ff" }}>
                              <UserOutlined style={{ marginRight: "4px" }} />
                              <strong>Por:</strong> {atividade.autor.name} (
                              {atividade.autor.tipo})
                            </span>
                          )}
                          {atividade.arquivo && (
                            <span style={{ color: "#52c41a" }}>
                              <FileOutlined style={{ marginRight: "4px" }} />
                              <strong>Arquivo:</strong>{" "}
                              {atividade.arquivo.originalName}
                            </span>
                          )}
                          <span style={{ color: "#666" }}>
                            <strong>Criada em:</strong>{" "}
                            {formatDate(atividade.createdAt)}
                          </span>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
              locale={{
                emptyText: "Nenhuma atividade pública encontrada",
              }}
            />
          ) : (
            <Row gutter={[16, 16]}>
              {atividades.map((atividade) => (
                <Col xs={24} sm={12} md={8} lg={6} xl={6} key={atividade._id}>
                  <AtividadeCard atividade={atividade} />
                </Col>
              ))}
              {atividades.length === 0 && !loading && (
                <Col span={24}>
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#999",
                    }}
                  >
                    Nenhuma atividade pública encontrada
                  </div>
                </Col>
              )}
            </Row>
          )}

          {/* Loading indicator para scroll infinito */}
          {loadingMore && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin size="large" />
            </div>
          )}

          {/* Elemento observado para scroll infinito */}
          <div ref={lastElementRef} style={{ height: "1px" }} />

          {/* Indicador de fim de lista */}
          {!hasMore && atividades.length > 0 && (
            <div
              style={{ textAlign: "center", padding: "20px", color: "#999" }}
            >
              Todas as atividades foram carregadas
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
