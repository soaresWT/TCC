"use client";

import React, { useEffect, useState } from "react";
import { Table, Button, Space, Typography, Card, message, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Title } = Typography;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  campus: string;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        const colors = {
          admin: "red",
          tutor: "blue",
          bolsista: "green",
        };
        return (
          <Tag color={colors[role as keyof typeof colors]}>
            {role.toUpperCase()}
          </Tag>
        );
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
          <Button
            type="link"
            onClick={() => router.push(`/admin/edit/${record._id}`)}
          >
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
            onClick={() => router.push("/cadastro")}
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
      </Card>
    </div>
  );
}
