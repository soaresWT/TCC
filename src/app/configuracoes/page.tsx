"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Typography,
  Row,
  Col,
  Avatar,
  Space,
  Divider,
  Spin,
  Result,
  message,
} from "antd";
import { useAuth } from "@/hooks/useAuth";
import { UserService } from "@/services/user";
import CAMPUSES from "@/lib/campuses";
import { UserCog, ShieldCheck, LogOut, Home } from "lucide-react";

const { Title, Text } = Typography;
const { Option } = Select;

type ProfileFormValues = {
  name: string;
  email: string;
  campus: string;
  avatar?: string;
};

type PasswordFormValues = {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    hasPermission,
    logout,
    checkAuth,
  } = useAuth();
  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const canEditProfile = useMemo(
    () => hasPermission("edit-profile"),
    [hasPermission]
  );

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
        campus: user.campus,
        avatar: user.avatar,
      });
    }
  }, [profileForm, user]);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) return;

    setSavingProfile(true);
    try {
      await UserService.updateUser(user._id, {
        name: values.name,
        email: values.email,
        campus: values.campus,
        avatar: values.avatar,
      });
      message.success("Perfil atualizado com sucesso!");
      await checkAuth();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar perfil";
      message.error(errorMessage);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    if (!user) return;

    if (values.newPassword !== values.confirmPassword) {
      message.error("As senhas não coincidem");
      return;
    }

    if (values.newPassword.length < 6) {
      message.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    setSavingPassword(true);
    try {
      await UserService.updateUser(user._id, {
        password: values.newPassword,
      });
      message.success("Senha atualizada com sucesso!");
      passwordForm.resetFields();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar senha";
      message.error(errorMessage);
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <Result
        status="403"
        title="Sessão expirada"
        subTitle="Faça login novamente para acessar suas configurações"
        extra={
          <Button type="primary" href="/cadastro">
            Acessar conta
          </Button>
        }
      />
    );
  }

  if (!canEditProfile) {
    return (
      <Result
        status="403"
        title="Sem permissão"
        subTitle="Você não possui permissão para editar o próprio perfil."
        extra={<Button href="/home">Ir para a página inicial</Button>}
      />
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "48px 24px 96px",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <Card
          style={{
            borderRadius: 24,
            boxShadow: "0 18px 48px rgba(15,23,42,0.1)",
          }}
          bodyStyle={{ padding: "28px 32px" }}
        >
          <Space size={20} align="start" style={{ width: "100%" }}>
            <Avatar
              size={72}
              src={user.avatar}
              style={{ backgroundColor: "#1d4ed8", fontSize: 28 }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Title level={3} style={{ marginBottom: 4 }}>
                Configurações da conta
              </Title>
              <Text type="secondary">
                Gerencie suas informações pessoais, credenciais de acesso e
                preferências do sistema.
              </Text>
              <Space size={16} style={{ marginTop: 16, display: "flex" }}>
                <Button
                  icon={<Home size={18} strokeWidth={1.6} />}
                  onClick={() => router.push("/home")}
                >
                  Voltar para o painel
                </Button>
                <Button
                  icon={<LogOut size={18} strokeWidth={1.6} />}
                  onClick={logout}
                >
                  Sair da conta
                </Button>
              </Space>
            </div>
          </Space>
        </Card>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={14}>
            <Card
              title={
                <Space size={12}>
                  <UserCog size={20} strokeWidth={1.6} />
                  <span>Informações pessoais</span>
                </Space>
              }
              style={{ borderRadius: 20, height: "100%" }}
              bodyStyle={{ padding: "24px 28px" }}
            >
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleProfileSubmit}
                initialValues={{ campus: user.campus }}
              >
                <Form.Item
                  label="Nome completo"
                  name="name"
                  rules={[{ required: true, message: "Informe seu nome" }]}
                >
                  <Input placeholder="Como você prefere ser chamado?" />
                </Form.Item>

                <Form.Item
                  label="E-mail institucional"
                  name="email"
                  rules={[
                    { required: true, message: "Informe um e-mail válido" },
                    { type: "email", message: "Digite um e-mail válido" },
                  ]}
                >
                  <Input placeholder="nome.sobrenome@instituicao.br" />
                </Form.Item>

                <Form.Item
                  label="Campus"
                  name="campus"
                  rules={[{ required: true, message: "Selecione o campus" }]}
                >
                  <Select placeholder="Selecione seu campus">
                    {CAMPUSES.map((campus) => (
                      <Option key={campus} value={campus}>
                        {campus}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Avatar (URL opcional)" name="avatar">
                  <Input placeholder="https://exemplo.com/imagem-perfil.png" />
                </Form.Item>

                <Divider style={{ margin: "16px 0 24px" }} />

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={savingProfile}
                  style={{ width: "100%" }}
                >
                  Salvar informações
                </Button>
              </Form>
            </Card>
          </Col>

          <Col xs={24} md={10}>
            <Card
              title={
                <Space size={12}>
                  <ShieldCheck size={20} strokeWidth={1.6} />
                  <span>Atualizar senha</span>
                </Space>
              }
              style={{ borderRadius: 20, height: "100%" }}
              bodyStyle={{ padding: "24px 28px" }}
            >
              <Text type="secondary">
                Reforce a segurança da sua conta definindo uma nova senha forte.
              </Text>

              <Form
                form={passwordForm}
                layout="vertical"
                style={{ marginTop: 18 }}
                onFinish={handlePasswordSubmit}
              >
                <Form.Item
                  label="Nova senha"
                  name="newPassword"
                  rules={[{ required: true, message: "Informe a nova senha" }]}
                >
                  <Input.Password placeholder="Uma senha com pelo menos 6 caracteres" />
                </Form.Item>

                <Form.Item
                  label="Confirmar senha"
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[{ required: true, message: "Confirme a nova senha" }]}
                >
                  <Input.Password placeholder="Repita a nova senha" />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={savingPassword}
                  style={{ width: "100%" }}
                >
                  Atualizar senha
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
