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
  Spin,
  InputNumber,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import CAMPUSES from "@/lib/campuses";

interface UploadedFileType {
  fileName: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  tipo: "admin" | "tutor" | "bolsista";
  campus: string;
  bolsa?: {
    _id: string;
    nome: string;
  };
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
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const router = useRouter();
  const { user, hasPermission, loading: authLoading } = useAuth();

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      message.error("Você precisa estar logado para criar atividades");
      router.push("/cadastro");
    } else if (!authLoading && user && !hasPermission("create-activity")) {
      message.error("Você não tem permissão para criar atividades");
      router.push("/home");
    }
  }, [user, hasPermission, authLoading, router]);

  // Carregar usuários disponíveis para seleção como bolsistas
  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoadingUsuarios(true);
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          // Filtrar apenas bolsistas do mesmo campus (exceto admin que vê todos)
          const usuariosFiltrados = data.filter((usuario: User) => {
            if (user?.tipo === "admin") {
              // Admin vê todos os bolsistas
              return usuario.tipo === "bolsista";
            } else if (user?.tipo === "tutor") {
              // Tutor vê apenas bolsistas da mesma bolsa
              return (
                usuario.tipo === "bolsista" &&
                usuario.bolsa?._id === user.bolsa?._id
              );
            } else if (user?.tipo === "bolsista") {
              // Bolsista vê apenas outros da mesma bolsa
              return (
                usuario.tipo === "bolsista" &&
                usuario.bolsa?._id === user.bolsa?._id
              );
            }
            return false;
          });
          setUsuarios(usuariosFiltrados);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    if (user) {
      fetchUsuarios();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user || !hasPermission("create-activity")) {
    return null;
  }

  const campusOptions = CAMPUSES;

  const categoriaOptions = ["Ensino", "Pesquisa", "Extensão", "Outros"];

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
    categoria: string;
    quantidadeAlunos?: number;
    bolsistas?: string[];
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
          bolsistas: values.bolsistas || [],
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
            initialValue="Campus de Quixadá"
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
            label="Categoria"
            name="categoria"
            rules={[
              {
                required: true,
                message: "Por favor, selecione uma categoria!",
              },
            ]}
          >
            <Select placeholder="Selecione a categoria da atividade">
              {categoriaOptions.map((categoria) => (
                <Option key={categoria} value={categoria}>
                  {categoria}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Quantidade de Alunos (Opcional)"
            name="quantidadeAlunos"
            tooltip="Número esperado de alunos que participarão da atividade"
          >
            <InputNumber
              placeholder="Digite a quantidade de alunos"
              min={0}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Bolsistas Participantes (Opcional)"
            name="bolsistas"
            tooltip="Selecione os bolsistas que participarão desta atividade"
          >
            <Select
              mode="multiple"
              placeholder="Selecione os bolsistas participantes"
              loading={loadingUsuarios}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)
                  ?.toLowerCase()
                  ?.indexOf(input.toLowerCase()) >= 0
              }
            >
              {usuarios.map((usuario) => (
                <Option key={usuario._id} value={usuario._id}>
                  {usuario.name} - {usuario.bolsa?.nome || "Sem bolsa"} (
                  {usuario.campus})
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
