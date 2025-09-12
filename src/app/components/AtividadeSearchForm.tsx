import React from "react";
import { Input, Select, DatePicker, Button, Space, Row, Col, Form } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

export interface AtividadeFilters {
  nome: string;
  campus: string;
  visibilidade: boolean | undefined;
  datainicio: string | undefined;
}

interface AtividadeSearchFormProps {
  filters: AtividadeFilters;
  loading?: boolean;
  onFiltersChange: (filters: AtividadeFilters) => void;
  onSearch: () => void;
  onClear: () => void;
}

export default function AtividadeSearchForm({
  filters,
  loading = false,
  onFiltersChange,
  onSearch,
  onClear,
}: AtividadeSearchFormProps) {
  const updateFilter = <K extends keyof AtividadeFilters>(
    key: K,
    value: AtividadeFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Form layout="vertical" onFinish={onSearch} initialValues={filters}>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Nome" name="nome">
            <Input
              placeholder="Buscar por nome"
              value={filters.nome}
              onChange={(e) => updateFilter("nome", e.target.value)}
              disabled={loading}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Campus" name="campus">
            <Input
              placeholder="Buscar por campus"
              value={filters.campus}
              onChange={(e) => updateFilter("campus", e.target.value)}
              disabled={loading}
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Visibilidade" name="visibilidade">
            <Select
              allowClear
              placeholder="Selecione"
              value={filters.visibilidade}
              onChange={(v) => updateFilter("visibilidade", v)}
              disabled={loading}
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
              value={filters.datainicio ? dayjs(filters.datainicio) : undefined}
              onChange={(date) =>
                updateFilter(
                  "datainicio",
                  date ? date.format("YYYY-MM-DD") : undefined
                )
              }
              disabled={loading}
            />
          </Form.Item>
        </Col>
      </Row>

      <Space>
        <Button type="primary" htmlType="submit" loading={loading}>
          Buscar
        </Button>
        <Button onClick={onClear} disabled={loading}>
          Limpar
        </Button>
      </Space>
    </Form>
  );
}
