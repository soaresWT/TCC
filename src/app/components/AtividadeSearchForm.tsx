import React from "react";
import { Input, Select, DatePicker, Button, Space, Row, Col, Form } from "antd";
import dayjs from "dayjs";
import { CAMPUSES } from "@/lib/campuses";

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
  const [form] = Form.useForm();

  const updateFilter = <K extends keyof AtividadeFilters>(
    key: K,
    value: AtividadeFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    form.resetFields();
    onClear();
  };

  // Atualizar os valores do form quando os filtros mudarem
  React.useEffect(() => {
    form.setFieldsValue({
      nome: filters.nome,
      campus: filters.campus || undefined,
      visibilidade: filters.visibilidade,
      datainicio: filters.datainicio ? dayjs(filters.datainicio) : undefined,
    });
  }, [filters, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSearch}
      initialValues={{
        nome: filters.nome,
        campus: filters.campus || undefined,
        visibilidade: filters.visibilidade,
        datainicio: filters.datainicio ? dayjs(filters.datainicio) : undefined,
      }}
    >
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
            <Select
              allowClear
              placeholder="Selecionar campus"
              value={filters.campus || undefined}
              onChange={(value) => updateFilter("campus", value || "")}
              disabled={loading}
            >
              {CAMPUSES.map((campus) => (
                <Option key={campus} value={campus}>
                  {campus}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Form.Item label="Visibilidade" name="visibilidade">
            <Select
              allowClear
              placeholder="Selecionar visibilidade"
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
              format="DD/MM/YYYY"
              placeholder="Selecionar data"
              value={filters.datainicio ? dayjs(filters.datainicio) : null}
              onChange={(date) =>
                updateFilter(
                  "datainicio",
                  date ? date.format("YYYY-MM-DD") : undefined
                )
              }
              disabled={loading}
              allowClear
            />
          </Form.Item>
        </Col>
      </Row>

      <Space>
        <Button type="primary" htmlType="submit" loading={loading}>
          Buscar
        </Button>
        <Button onClick={handleClearFilters} disabled={loading}>
          Limpar Filtros
        </Button>
      </Space>
    </Form>
  );
}
