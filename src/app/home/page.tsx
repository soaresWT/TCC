"use client";

import React, { useEffect, useState } from "react";
import {
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Form,
  Card,
  Tag,
  Empty,
} from "antd";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

interface Atividade {
  _id: string;
  nome: string;
  descricao: string;
  campus: string;
  visibilidade: boolean;
  bolsistas: string[];
  participantes: string[];
  datainicio: string;
}

export default function Home() {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    nome: "",
    campus: "",
    visibilidade: undefined as boolean | undefined,
    datainicio: undefined as string | undefined,
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

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Atividades</Title>
      <Form layout="vertical" onFinish={handleSearch} initialValues={filters}>
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Nome" name="nome">
              <Input
                placeholder="Buscar por nome"
                value={filters.nome}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, nome: e.target.value }))
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Campus" name="campus">
              <Input
                placeholder="Buscar por campus"
                value={filters.campus}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, campus: e.target.value }))
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Visibilidade" name="visibilidade">
              <Select
                allowClear
                placeholder="Selecione"
                value={filters.visibilidade}
                onChange={(v) => setFilters((f) => ({ ...f, visibilidade: v }))}
              >
                <Option value={true}>Visível</Option>
                <Option value={false}>Oculto</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Data de Início" name="datainicio">
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                value={
                  filters.datainicio ? dayjs(filters.datainicio) : undefined
                }
                onChange={(date) =>
                  setFilters((f) => ({
                    ...f,
                    datainicio: date ? date.format("YYYY-MM-DD") : undefined,
                  }))
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Space>
          <Button type="primary" htmlType="submit">
            Buscar
          </Button>
          <Button
            onClick={() => {
              setFilters({
                nome: "",
                campus: "",
                visibilidade: undefined,
                datainicio: undefined,
              });
              setTimeout(fetchAtividades, 0);
            }}
          >
            Limpar
          </Button>
        </Space>
      </Form>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {atividades.length === 0 && !loading && (
          <Col span={24}>
            <Empty description="Nenhuma atividade encontrada" />
          </Col>
        )}
        {atividades.map((atividade) => (
          <Col xs={24} sm={12} md={8} lg={6} key={atividade._id}>
            <Card
              title={atividade.nome}
              extra={
                <Tag color={atividade.visibilidade ? "green" : "red"}>
                  {atividade.visibilidade ? "Visível" : "Oculto"}
                </Tag>
              }
              loading={loading}
              hoverable
            >
              <p>
                <b>Descrição:</b> {atividade.descricao}
              </p>
              <p>
                <b>Campus:</b> {atividade.campus}
              </p>
              <p>
                <b>Data de início:</b>{" "}
                {dayjs(atividade.datainicio).format("DD/MM/YYYY")}
              </p>
              <p>
                <Tag color="blue">
                  Bolsistas: {atividade.bolsistas?.length ?? 0}
                </Tag>
                <Tag color="purple">
                  Participantes: {atividade.participantes?.length ?? 0}
                </Tag>
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
