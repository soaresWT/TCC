"use client";
import { Form, Input, Button, Card } from "antd";

export default function Home() {
  const [form] = Form.useForm();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Card title="Login" style={{ width: 400 }}>
        <Form form={form} onFinish={(values) => console.log(values)}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Por favor, insira seu email!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Senha"
            name="password"
            rules={[
              { required: true, message: "Por favor, insira sua senha!" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Entrar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
