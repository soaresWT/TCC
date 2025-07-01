"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Typography, Card, message, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { UserForm } from "./components/UserForm";

const { Title } = Typography;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  campus: string;
  createdAt: string;
}

interface UserFormData {
  email: string;
  password?: string;
  name: string;
  campus: string;
  role: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setUsers(data);
    } catch (error) {
      console.log(error);
      message.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (values: UserFormData) => {
    setFormLoading(true);
    try {
      const url = selectedUser
        ? `/api/users/${selectedUser._id}`
        : "/api/users";

      const method = selectedUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar usuário");
      }

      message.success(
        selectedUser
          ? "Usuário atualizado com sucesso!"
          : "Usuário cadastrado com sucesso!"
      );

      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setFormLoading(false);
      setSelectedUser(null);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const columns = [
    {
      title: "Nome",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Tipo",
      dataIndex: "role",
      key: "role",
      render: (role: string) => {
        return <Tag color="blue">{role}</Tag>;
      },
    },
    {
      title: "Campus",
      dataIndex: "campus",
      key: "campus",
    },
    {
      title: "Data de Cadastro",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("pt-BR"),
    },
    {
      title: "Ações",
      key: "actions",
      render: (_: unknown, record: User) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            Editar
          </Button>
          <Button type="link" danger>
            Excluir
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Title level={2}>Gerenciamento de Usuários</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            Adicionar Usuário
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

        <UserForm
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleSubmit}
          initialValues={
            selectedUser
              ? {
                  name: selectedUser.name,
                  email: selectedUser.email,
                  campus: selectedUser.campus,
                  role: selectedUser.role,
                  tipo: selectedUser.role,
                }
              : undefined
          }
          loading={formLoading}
          title={selectedUser ? "Editar Usuário" : "Novo Usuário"}
        />
      </Card>
    </div>
  );
}
