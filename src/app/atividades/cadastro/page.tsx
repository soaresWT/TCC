"use client";
import {
  Form,
  Input,
  Button,
  Card,
  DatePicker,
  Switch,
  Select,
  message,
  Upload,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface UploadedFileType {
  fileName: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
}

const { TextArea } = Input;
const { Option } = Select;

export default function CadastroAtividade() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileType | null>(
    null
  );
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const campusOptions = [
    "Campus I - João Pessoa",
    "Campus II - Areia",
    "Campus III - Bananeiras",
    "Campus IV - Rio Tinto",
    "Campus V - Mamanguape",
    "Campus VI - Sousa",
    "Campus VII - Patos",
    "Campus VIII - Cajazeiras",
    "Campus IX - Pombal",
    "Campus X - Guarabira",
    "Campus XI - Princesa Isabel",
    "Campus XII - Catolé do Rocha",
    "Campus XIII - Picuí",
    "Campus XIV - Monteiro",
    "Campus XV - Esperança",
  ];

  // Função para fazer upload do arquivo
  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedFile(result);
        message.success("Arquivo enviado com sucesso!");
        return result;
      } else {
        const error = await response.json();
        message.error(error.error || "Erro ao enviar arquivo");
        return false;
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      message.error("Erro de conexão ao enviar arquivo");
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Função para remover arquivo
  const handleRemoveFile = () => {
    setUploadedFile(null);
    form.setFieldValue("arquivo", undefined);
  };

  interface AtividadeFormValues {
    nome: string;
    descricao: string;
    campus: string;
    datainicio?: Date;
    visibilidade?: boolean;
    arquivo?: UploadedFileType;
  }

  const handleSubmit = async (values: AtividadeFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/atividades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          datainicio: values.datainicio
            ? values.datainicio.toISOString()
            : null,
          arquivo: uploadedFile,
        }),
      });

      if (response.ok) {
        message.success("Atividade cadastrada com sucesso!");
        form.resetFields();
        router.push("/atividades");
      } else {
        const error = await response.json();
        message.error(error.error || "Erro ao cadastrar atividade");
      }
    } catch (error) {
      console.error("Erro ao cadastrar atividade:", error);
      message.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Card
        title="Cadastro de Atividade"
        style={{
          width: "100%",
          maxWidth: 600,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label="Nome da Atividade"
            name="nome"
            rules={[
              {
                required: true,
                message: "Por favor, insira o nome da atividade!",
              },
              { min: 3, message: "O nome deve ter pelo menos 3 caracteres!" },
            ]}
          >
            <Input placeholder="Digite o nome da atividade" />
          </Form.Item>

          <Form.Item
            label="Descrição"
            name="descricao"
            rules={[
              {
                required: true,
                message: "Por favor, insira a descrição da atividade!",
              },
              {
                min: 10,
                message: "A descrição deve ter pelo menos 10 caracteres!",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Descreva detalhadamente a atividade"
            />
          </Form.Item>

          <Form.Item
            label="Campus"
            name="campus"
            rules={[
              { required: true, message: "Por favor, selecione um campus!" },
            ]}
          >
            <Select
              placeholder="Selecione o campus"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  ?.indexOf(input.toLowerCase()) >= 0
              }
            >
              {campusOptions.map((campus) => (
                <Option key={campus} value={campus}>
                  {campus}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Data de Início"
            name="datainicio"
            rules={[
              {
                required: false,
                message: "Por favor, selecione a data de início!",
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Selecione a data de início"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            label="Arquivo (Opcional)"
            name="arquivo"
            extra="Tipos permitidos: PDF, DOC, DOCX, JPG, PNG, GIF, TXT (máx: 10MB)"
          >
            <div>
              {!uploadedFile ? (
                <Upload
                  beforeUpload={(file) => {
                    handleUpload(file);
                    return false; // Previne upload automático
                  }}
                  showUploadList={false}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                >
                  <Button
                    icon={<UploadOutlined />}
                    loading={uploading}
                    style={{ width: "100%" }}
                  >
                    {uploading ? "Enviando..." : "Selecionar Arquivo"}
                  </Button>
                </Upload>
              ) : (
                <div
                  style={{
                    padding: "12px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "6px",
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "500" }}>
                      {uploadedFile.originalName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveFile}
                    danger
                  />
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item
            label="Visibilidade"
            name="visibilidade"
            valuePropName="checked"
            tooltip="Defina se a atividade será visível para todos os usuários"
          >
            <Switch checkedChildren="Pública" unCheckedChildren="Privada" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <Button
                type="default"
                onClick={() => router.back()}
                style={{ flex: 1 }}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ flex: 1 }}
              >
                Cadastrar Atividade
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
