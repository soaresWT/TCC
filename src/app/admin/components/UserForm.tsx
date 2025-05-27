import React from "react";
import { Form, Input, Select, Button, Modal } from "antd";

const { Option } = Select;

interface UserFormData {
  email: string;
  password?: string;
  name: string;
  campus: string;
  role: string;
}

interface UserFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: UserFormData) => void;
  initialValues?: UserFormData;
  loading?: boolean;
  title: string;
}

export const UserForm: React.FC<UserFormProps> = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  loading = false,
  title,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: UserFormData) => {
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
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

        {!initialValues && (
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
        )}

        <Form.Item
          name="campus"
          label="Campus"
          rules={[{ required: true, message: "Por favor, selecione o campus" }]}
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
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={onCancel}>Cancelar</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {initialValues ? "Salvar" : "Cadastrar"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
