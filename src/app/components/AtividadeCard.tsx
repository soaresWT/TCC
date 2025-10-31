import React from "react";
import { Card, Tag, Col } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { Atividade } from "../../types/atividade";

interface AtividadeCardProps {
  atividade: Atividade;
  loading?: boolean;
  onClick?: (atividade: Atividade) => void;
  navigateOnClick?: boolean;
}

export default function AtividadeCard({
  atividade,
  loading = false,
  onClick,
  navigateOnClick = true,
}: AtividadeCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (onClick) {
      onClick(atividade);
    } else if (navigateOnClick) {
      router.push(`/atividades/${atividade._id}`);
    }
  };

  const cardContent = (
    <Card
      title={atividade.nome}
      extra={
        <Tag color={atividade.visibilidade ? "green" : "red"}>
          {atividade.visibilidade ? "Visível" : "Oculto"}
        </Tag>
      }
      loading={loading}
      hoverable
      onClick={handleCardClick}
      style={{
        cursor: onClick || navigateOnClick ? "pointer" : "default",
        height: "400px",
        overflow: "hidden",
      }}
      styles={{
        body: {
          height: "calc(100% - 60px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div style={{ marginBottom: 8, flex: "0 0 auto" }}>
        <strong>Descrição:</strong>{" "}
        <div
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: 4,
          }}
        >
          {atividade.descricao}
        </div>
      </div>

      <div style={{ marginBottom: 8, flex: "0 0 auto" }}>
        <strong>Campus:</strong> {atividade.campus}
      </div>

      {atividade.categoria && (
        <div style={{ marginBottom: 8, flex: "0 0 auto" }}>
          <strong>Categoria:</strong>
          <Tag color="orange" style={{ marginLeft: 8 }}>
            {atividade.categoria}
          </Tag>
        </div>
      )}

      {atividade.datainicio && (
        <div style={{ marginBottom: 8, flex: "0 0 auto" }}>
          <strong>Data de início:</strong>{" "}
          {dayjs(atividade.datainicio).format("DD/MM/YYYY")}
        </div>
      )}

      {atividade.quantidadeAlunos && (
        <div style={{ marginBottom: 8, flex: "0 0 auto" }}>
          <strong>Quantidade de alunos:</strong> {atividade.quantidadeAlunos}
        </div>
      )}

      <div style={{ marginTop: "auto", flex: "0 0 auto" }}>
        <Tag color="blue">Bolsistas: {atividade.bolsistas?.length ?? 0}</Tag>
        <Tag color="purple">
          Participantes: {atividade.participantes?.length ?? 0}
        </Tag>
      </div>
    </Card>
  );

  return cardContent;
}

export function AtividadeCardCol({
  atividade,
  loading = false,
  onClick,
  navigateOnClick = true,
  xs = 24,
  sm = 12,
  md = 8,
  lg = 6,
}: AtividadeCardProps & {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
}) {
  return (
    <Col xs={xs} sm={sm} md={md} lg={lg} key={atividade._id}>
      <AtividadeCard
        atividade={atividade}
        loading={loading}
        onClick={onClick}
        navigateOnClick={navigateOnClick}
      />
    </Col>
  );
}
