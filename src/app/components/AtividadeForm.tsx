"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Switch,
  Select,
  message,
  InputNumber,
  Spin,
} from "antd";
import { Upload as UploadIcon, Trash2 } from "lucide-react";
import CAMPUSES from "@/lib/campuses";
import type { Atividade } from "@/types/atividade";
import type { User } from "@/types/user";
import { useUploadThing } from "@/lib/uploadthing/client";
import type { ClientUploadedFileData } from "uploadthing/types";

const { TextArea } = Input;
const { Option } = Select;

type UploadedFile = NonNullable<Atividade["arquivo"]>;
type UploadThingMetadata = UploadedFile & {
  uploadedBy?: string;
  uploadedAt?: string;
};

type AtividadeFormValues = {
  nome: string;
  descricao: string;
  campus: string;
  categoria: string;
  quantidadeAlunos?: number;
  bolsistas?: string[];
  datainicio?: Dayjs;
  datafim?: Dayjs;
  visibilidade?: boolean;
  arquivo?: UploadedFile | null;
  avaliacao?: "Plena" | "Parcial" | "Não desenvolvida";
  cargaHoraria?: number;
  materialUtilizado?: string;
  relatoAvaliacao?: string;
  metodologiaUtilizada?: string;
  resultados?: string;
};

type AtividadeFormProps = {
  mode: "create" | "edit";
  currentUser: User;
  atividadeId?: string;
  initialValues?: Partial<Atividade> | null;
  onSuccess?: (atividade: Atividade) => void;
  onCancel?: () => void;
  submitLabel?: string;
  successMessage?: string;
  loadingInitialData?: boolean;
};

const categoriaOptions = ["Ensino", "Pesquisa", "Extensão", "Outros"];
const avaliacaoOptions = ["Plena", "Parcial", "Não desenvolvida"] as const;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/gif",
  "text/plain",
];
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const defaultInitialValues: Partial<AtividadeFormValues> = {
  campus: "Campus de Quixadá",
  visibilidade: true,
};

function filterUsuariosPorPerfil(usuarios: User[], currentUser: User) {
  if (currentUser.tipo === "admin") {
    return usuarios.filter((usuario) => usuario.tipo === "bolsista");
  }

  if (currentUser.tipo === "tutor") {
    return usuarios.filter(
      (usuario) =>
        usuario.tipo === "bolsista" &&
        usuario.bolsa?._id === currentUser.bolsa?._id
    );
  }

  if (currentUser.tipo === "bolsista") {
    return usuarios.filter(
      (usuario) =>
        usuario.tipo === "bolsista" &&
        usuario.bolsa?._id === currentUser.bolsa?._id
    );
  }

  return [];
}

export function AtividadeForm({
  mode,
  currentUser,
  atividadeId,
  initialValues,
  onSuccess,
  onCancel,
  submitLabel,
  successMessage,
  loadingInitialData = false,
}: AtividadeFormProps) {
  const [form] = Form.useForm<AtividadeFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(
    initialValues?.arquivo ?? null
  );
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredUsuarios = useMemo(() => {
    return filterUsuariosPorPerfil(usuarios, currentUser);
  }, [usuarios, currentUser]);

  useEffect(() => {
    form.setFieldsValue({
      ...(defaultInitialValues as AtividadeFormValues),
    });
  }, [form]);

  useEffect(() => {
    if (!initialValues) return;

    form.setFieldsValue({
      nome: initialValues.nome,
      descricao: initialValues.descricao,
      campus: initialValues.campus,
      categoria: initialValues.categoria,
      quantidadeAlunos: initialValues.quantidadeAlunos,
      bolsistas: initialValues.bolsistas?.map((b) => b._id),
      datainicio: initialValues.datainicio
        ? dayjs(initialValues.datainicio)
        : undefined,
      datafim: initialValues.datafim ? dayjs(initialValues.datafim) : undefined,
      visibilidade: initialValues.visibilidade,
      avaliacao: initialValues.avaliacao,
      cargaHoraria: initialValues.cargaHoraria,
      materialUtilizado: initialValues.materialUtilizado,
      relatoAvaliacao: initialValues.relatoAvaliacao,
      metodologiaUtilizada: initialValues.metodologiaUtilizada,
      resultados: initialValues.resultados,
    });

    setUploadedFile(initialValues.arquivo ?? null);
  }, [initialValues, form]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      if (!currentUser) return;

      setLoadingUsuarios(true);
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Erro ao carregar usuários");
        }
        const data = (await response.json()) as User[];
        setUsuarios(data);
      } catch (error) {
        console.error(error);
        message.error("Não foi possível carregar a lista de bolsistas");
      } finally {
        setLoadingUsuarios(false);
      }
    };

    fetchUsuarios();
  }, [currentUser]);

  const handleUploadSuccess = (fileData: UploadedFile) => {
    setUploadedFile(fileData);
    form.setFieldValue("arquivo", fileData);
    message.success("Arquivo enviado com sucesso!");
  };

  const handleUploadError = (error: unknown) => {
    setUploading(false);
    const errorMessage =
      error instanceof Error ? error.message : "Erro ao enviar arquivo";
    message.error(errorMessage);
  };
  const { startUpload } = useUploadThing("atividadeAttachment");
  const isUploading = uploading;

  const handleFileInputChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = event.target.files;
    const file = fileList?.[0];

    if (!file) {
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      message.error(
        "Tipo de arquivo não permitido. Use PDF, DOC, DOCX, JPG, PNG, GIF ou TXT."
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      message.error("Arquivo muito grande. Máximo permitido: 10MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const uploadedFiles = await startUpload([file]);

      if (!uploadedFiles || uploadedFiles.length === 0) {
        message.error("Nenhum arquivo foi enviado.");
        return;
      }

      const [first] =
        uploadedFiles as ClientUploadedFileData<UploadThingMetadata>[];
      const serverData = first.serverData as UploadThingMetadata | undefined;
      const fileUrl = serverData?.url ?? first.ufsUrl ?? first.url ?? "";

      if (!fileUrl) {
        message.error("Não foi possível recuperar a URL do arquivo enviado.");
        return;
      }

      const uploaded: UploadedFile = {
        fileName: serverData?.fileName ?? first.key,
        originalName: serverData?.originalName ?? first.name,
        size: serverData?.size ?? first.size,
        type: serverData?.type ?? first.type,
        url: fileUrl,
      };

      handleUploadSuccess(uploaded);
    } catch (error) {
      handleUploadError(error);
    } finally {
      // Reset input to allow selecting the same file again if needed
      if (event.target) {
        event.target.value = "";
      }
      setUploading(false);
    }
  };

  const handleSelectFileClick = () => {
    if (loadingInitialData || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    form.setFieldValue("arquivo", undefined);
  };

  const handleSubmit = async (values: AtividadeFormValues) => {
    if (isUploading) {
      message.warning(
        "Aguarde o término do upload antes de salvar a atividade."
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...values,
        datainicio: values.datainicio ? values.datainicio.toISOString() : null,
        datafim: values.datafim ? values.datafim.toISOString() : null,
        arquivo: uploadedFile ?? undefined,
        bolsistas: values.bolsistas || [],
      };

      if (!uploadedFile) {
        delete (payload as { arquivo?: unknown }).arquivo;
      }

      const endpoint =
        mode === "create"
          ? "/api/atividades"
          : `/api/atividades/${atividadeId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao salvar atividade");
      }

      const data = (await response.json()) as Atividade;
      message.success(
        successMessage ||
          (mode === "create"
            ? "Atividade cadastrada com sucesso!"
            : "Atividade atualizada com sucesso!")
      );
      onSuccess?.(data);

      if (mode === "create") {
        form.resetFields();
        setUploadedFile(null);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao salvar atividade";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      size="large"
      style={{ width: "100%" }}
      onFinish={handleSubmit}
      initialValues={defaultInitialValues}
    >
      <Form.Item
        label="Nome da Atividade"
        name="nome"
        rules={[
          { required: true, message: "Informe o nome da atividade" },
          { min: 3, message: "O nome deve ter pelo menos 3 caracteres" },
        ]}
      >
        <Input
          placeholder="Digite o nome da atividade"
          disabled={loadingInitialData}
        />
      </Form.Item>

      <Form.Item
        label="Descrição"
        name="descricao"
        rules={[
          { required: true, message: "Informe a descrição" },
          { min: 10, message: "A descrição deve ter pelo menos 10 caracteres" },
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Descreva os objetivos, público e resultados esperados"
          disabled={loadingInitialData}
        />
      </Form.Item>

      <Form.Item
        label="Campus"
        name="campus"
        rules={[{ required: true, message: "Selecione um campus" }]}
      >
        <Select
          placeholder="Selecione o campus"
          showSearch
          optionFilterProp="children"
          disabled={loadingInitialData}
        >
          {CAMPUSES.map((campus) => (
            <Option key={campus} value={campus}>
              {campus}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Categoria"
        name="categoria"
        rules={[{ required: true, message: "Selecione uma categoria" }]}
      >
        <Select
          placeholder="Selecione a categoria"
          disabled={loadingInitialData}
        >
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
        tooltip="Número esperado de alunos participantes"
      >
        <InputNumber
          min={0}
          style={{ width: "100%" }}
          placeholder="Informe a quantidade de alunos"
          disabled={loadingInitialData}
        />
      </Form.Item>

      <Form.Item
        label="Bolsistas Participantes"
        name="bolsistas"
        tooltip="Selecione os bolsistas vinculados à atividade"
      >
        <Select
          mode="multiple"
          placeholder="Selecione os bolsistas"
          loading={loadingUsuarios}
          disabled={loadingInitialData}
          allowClear
          showSearch
          optionFilterProp="children"
          notFoundContent={
            loadingUsuarios ? (
              <Spin size="small" />
            ) : (
              "Nenhum bolsista disponível"
            )
          }
        >
          {filteredUsuarios.map((usuario) => (
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
        rules={[{ required: false }]}
      >
        <DatePicker
          format="DD/MM/YYYY"
          style={{ width: "100%" }}
          placeholder="Selecione a data de início"
          disabled={loadingInitialData}
        />
      </Form.Item>

      <Form.Item
        label="Data de Fim"
        name="datafim"
        rules={[
          {
            validator: (_, value: Dayjs | undefined) => {
              const dataInicio = form.getFieldValue("datainicio") as
                | Dayjs
                | undefined;
              if (!value || !dataInicio) {
                return Promise.resolve();
              }
              if (value.isBefore(dataInicio, "day")) {
                return Promise.reject(
                  new Error(
                    "A data de fim deve ser igual ou posterior à data de início"
                  )
                );
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <DatePicker
          format="DD/MM/YYYY"
          style={{ width: "100%" }}
          placeholder="Selecione a data de fim"
          disabled={loadingInitialData}
        />
      </Form.Item>

      <Form.Item label="Avaliação" name="avaliacao">
        <Select
          placeholder="Selecione a avaliação"
          allowClear
          disabled={loadingInitialData}
        >
          {avaliacaoOptions.map((avaliacao) => (
            <Option key={avaliacao} value={avaliacao}>
              {avaliacao}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Carga Horária (em horas)"
        name="cargaHoraria"
        rules={[
          {
            validator: (_, value: number | null | undefined) => {
              if (value === undefined || value === null || value > 0) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("Informe uma carga horária positiva")
              );
            },
          },
        ]}
      >
        <InputNumber
          min={1}
          style={{ width: "100%" }}
          placeholder="Informe a carga horária total"
          disabled={loadingInitialData}
        />
      </Form.Item>

      <Form.Item label="Material Utilizado" name="materialUtilizado">
        <TextArea
          rows={3}
          placeholder="Liste materiais, ferramentas, softwares, etc."
          disabled={loadingInitialData}
        />
      </Form.Item>

      <Form.Item
        label="Relato/Avaliação (Resumo Detalhado da Atividade)"
        name="relatoAvaliacao"
      >
        <TextArea
          rows={4}
          placeholder="Descreva o desenvolvimento, desafios e conquistas"
          disabled={loadingInitialData}
        />
      </Form.Item>

      <Form.Item label="Metodologia Utilizada" name="metodologiaUtilizada">
        <TextArea
          rows={4}
          placeholder="Explique as estratégias e métodos aplicados"
          disabled={loadingInitialData}
        />
      </Form.Item>

      <Form.Item label="Resultados" name="resultados">
        <TextArea
          rows={4}
          placeholder="Relate os resultados alcançados e impacto"
          disabled={loadingInitialData}
        />
      </Form.Item>

      <Form.Item
        label="Arquivo (Opcional)"
        name="arquivo"
        extra="Tipos permitidos: PDF, DOC, imagens ou TXT (máx. 10MB)"
      >
        {!uploadedFile ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />
            <Button
              icon={<UploadIcon size={18} strokeWidth={1.6} />}
              loading={isUploading}
              style={{ width: "100%" }}
              onClick={handleSelectFileClick}
              disabled={loadingInitialData || isUploading}
            >
              {isUploading ? "Enviando..." : "Selecionar Arquivo"}
            </Button>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid #d9d9d9",
              background: "#f8fafc",
            }}
          >
            <div>
              <strong>{uploadedFile.originalName}</strong>
              <div style={{ fontSize: 12, color: "#475467" }}>
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            <Button
              type="text"
              danger
              icon={<Trash2 size={18} strokeWidth={1.6} />}
              onClick={handleRemoveFile}
            />
          </div>
        )}
      </Form.Item>

      <Form.Item
        label="Visibilidade"
        name="visibilidade"
        valuePropName="checked"
        tooltip="Defina se a atividade ficará visível para outros usuários"
      >
        <Switch
          checkedChildren="Pública"
          unCheckedChildren="Privada"
          disabled={loadingInitialData}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Button
            type="default"
            onClick={onCancel}
            style={{ flex: 1 }}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            style={{ flex: 1 }}
            loading={submitting}
            disabled={loadingInitialData}
          >
            {submitLabel ||
              (mode === "create" ? "Cadastrar Atividade" : "Salvar alterações")}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
}

export default AtividadeForm;
