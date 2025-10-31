"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  message,
  Typography,
  Tabs,
} from "antd";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserForm, LoginForm } from "@/types/forms/auth";
import { Bolsa } from "@/types/bolsa";
import { AuthService, BolsaService } from "@/services";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

export default function CadastroUsuario() {
  const [form] = Form.useForm();
  const [loginForm] = Form.useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [bolsas, setBolsas] = useState<Bolsa[]>([]);
  const { user, login } = useAuth();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      if (user.tipo === "admin") {
        router.push("/admin");
      } else {
        router.push("/home");
      }
    }
  }, [user, router]);

  // Carregar bolsas
  useEffect(() => {
    const fetchBolsas = async () => {
      try {
        const data = await BolsaService.getBolsas();
        setBolsas(data);
      } catch (error) {
        console.error("Erro ao carregar bolsas:", error);
      }
    };
    fetchBolsas();
  }, []);

  const onFinish = async (values: UserForm) => {
    setLoading(true);
    try {
      await AuthService.register(values);
      message.success("Usuário cadastrado com sucesso!");

      // Tentar fazer login automaticamente
      const loginResult = await login(values.email, values.password);
      if (!loginResult.success) {
        message.info("Usuário criado! Faça login para continuar.");
      }
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onLoginFinish = async (values: LoginForm) => {
    setLoginLoading(true);
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        message.success("Login realizado com sucesso!");
        // O redirecionamento agora é feito automaticamente pelo hook useAuth
      } else {
        message.error(result.error || "Erro no login");
      }
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoginLoading(false);
    }
  };

  if (user) {
    return null; // Evita flash de conteúdo durante redirecionamento
  }

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <Card>
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          Sistema de Gestão
        </Title>

        <Tabs defaultActiveKey="login" centered>
          <TabPane tab="Login" key="login">
            <Form
              form={loginForm}
              layout="vertical"
              onFinish={onLoginFinish}
              requiredMark={false}
            >
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
                ]}
              >
                <Input.Password placeholder="Senha" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loginLoading}
                  block
                >
                  Entrar
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Cadastro" key="cadastro">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
            >
              <Form.Item
                name="name"
                label="Nome"
                rules={[
                  { required: true, message: "Por favor, insira o nome" },
                ]}
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
                  {
                    min: 6,
                    message: "A senha deve ter no mínimo 6 caracteres",
                  },
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
                name="tipo"
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

              <Form.Item name="bolsa" label="Bolsa (opcional)">
                <Select placeholder="Selecione a bolsa" allowClear>
                  {bolsas.map((bolsa) => (
                    <Option key={bolsa._id} value={bolsa._id}>
                      {bolsa.nome}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  Cadastrar
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
