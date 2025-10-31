"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Card,
  message,
  Tag,
  Modal,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { UserForm } from "./components/UserForm";
import { UserService } from "@/services/user";
import type { CreateUserPayload, User, UserFormData } from "@/types/user";

const { Title } = Typography;

type FormValues = Pick<
  UserFormData,
  "email" | "name" | "campus" | "tipo" | "password"
>;

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await UserService.getUsers();
      setUsers(data);
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : String(error);
      message.error(messageText || "Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setSelectedUser(null);
  }, []);

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      setFormLoading(true);
      try {
        if (selectedUser) {
          await UserService.updateUser(selectedUser._id, values);
          message.success("Usuário atualizado com sucesso!");
        } else {
          if (!values.password) {
            throw new Error("A senha é obrigatória para novos usuários");
          }
          const payload: CreateUserPayload = {
            ...values,
            password: values.password,
          };
          await UserService.createUser(payload);
          message.success("Usuário cadastrado com sucesso!");
        }

        handleModalClose();
        await fetchUsers();
      } catch (error) {
        const messageText =
          error instanceof Error ? error.message : String(error);
        message.error(messageText || "Erro ao processar usuário");
      } finally {
        setFormLoading(false);
      }
    },
    [fetchUsers, handleModalClose, selectedUser]
  );

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (user: User) => {
      Modal.confirm({
        title: `Excluir ${user.name}?`,
        content: "Esta ação não pode ser desfeita.",
        okText: "Excluir",
        okButtonProps: { danger: true },
        cancelText: "Cancelar",
        onOk: async () => {
          try {
            await UserService.deleteUser(user._id);
            message.success("Usuário removido com sucesso!");
            await fetchUsers();
          } catch (error) {
            const messageText =
              error instanceof Error ? error.message : String(error);
            message.error(messageText || "Erro ao remover usuário");
          }
        },
      });
    },
    [fetchUsers]
  );

  const columns: ColumnsType<User> = useMemo(
    () => [
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
        dataIndex: "tipo",
        key: "tipo",
        render: (tipo: User["tipo"]) => {
          const colorMap: Record<User["tipo"], string> = {
            admin: "red",
            tutor: "blue",
            bolsista: "green",
          };
          const label = `${tipo.charAt(0).toUpperCase()}${tipo.slice(1)}`;
          return <Tag color={colorMap[tipo]}>{label}</Tag>;
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
            <Button type="link" danger onClick={() => handleDelete(record)}>
              Excluir
            </Button>
          </Space>
        ),
      },
    ],
    [handleDelete, handleEdit]
  );

  return (
    <div className="px-6 py-8">
      <Card className="shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Title level={2} className="!mb-0">
            Gerenciamento de Usuários
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedUser(null);
              setModalOpen(true);
            }}
          >
            Adicionar Usuário
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />

        <UserForm
          open={modalOpen}
          onCancel={handleModalClose}
          onSubmit={handleSubmit}
          initialValues={
            selectedUser
              ? {
                  name: selectedUser.name,
                  email: selectedUser.email,
                  campus: selectedUser.campus,
                  tipo: selectedUser.tipo,
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
