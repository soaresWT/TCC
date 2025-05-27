"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      message.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Erro ao criar usuário");

      message.success("Usuário criado com sucesso!");
      setIsModalOpen(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error("Erro ao criar usuário");
    }
  };

  const columns: ColumnsType<User> = [
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
    },
    {
      title: "Campus",
      dataIndex: "campus",
      key: "campus",
    },
    {
      title: "Data de Criação",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString("pt-BR"),
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Adicionar Usuário
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={isLoading}
      />

      <Modal
        title="Novo Usuário"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: "Por favor, insira o nome" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Por favor, insira o email" },
              { type: "email", message: "Email inválido" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Senha"
            rules={[{ required: true, message: "Por favor, insira a senha" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo"
            rules={[{ required: true, message: "Por favor, selecione o tipo" }]}
            initialValue="bolsista"
          >
            <Select>
              <Select.Option value="bolsista">Bolsista</Select.Option>
              <Select.Option value="tutor">Tutor</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="campus"
            label="Campus"
            rules={[{ required: true, message: "Por favor, insira o campus" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Criar Usuário
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
