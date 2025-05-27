"use client";

import React, { useState } from "react";
import { Form, Input, Select, Button, Card, message, Typography } from "antd";
import { useRouter } from "next/navigation";

const { Title } = Typography;
const { Option } = Select;

interface UserForm {
  email: string;
  password: string;
  name: string;
  campus: string;
  role: string;
  avatar?: string;
}

export default function CadastroUsuario() {
  const [form] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: UserForm) => {
    setLoading(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cadastrar usuário");
      }

      message.success("Usuário cadastrado com sucesso!");
      router.push("/"); // Redireciona para a página inicial
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <Card>
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Cadastro de Usuário
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: "Por favor, insira o nome" }]}
          >
            <Input placeholder="Nome completo" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Por favor, insira o email" },
              { type: "email", message: "Email inválido" },
            ]}
          >
            <Input placeholder="email@exemplo.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Senha"
            rules={[
              { required: true, message: "Por favor, insira a senha" },
              { min: 6, message: "A senha deve ter no mínimo 6 caracteres" },
            ]}
          >
            <Input.Password placeholder="Senha" />
          </Form.Item>

          <Form.Item
            name="campus"
            label="Campus"
            rules={[
              { required: true, message: "Por favor, selecione o campus" },
            ]}
          >
            <Select placeholder="Selecione o campus">
              <Option value="Centro">Centro</Option>
              <Option value="Cajazeiras">Cajazeiras</Option>
              <Option value="Mangabeira">Mangabeira</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="Tipo de Usuário"
            rules={[
              {
                required: true,
                message: "Por favor, selecione o tipo de usuário",
              },
            ]}
          >
            <Select placeholder="Selecione o tipo de usuário">
              <Option value="bolsista">Bolsista</Option>
              <Option value="tutor">Tutor</Option>
              <Option value="admin">Administrador</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Cadastrar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
