import React from "react";
import { Row, Col, Empty } from "antd";
import { AtividadeCardCol } from "./AtividadeCard";
import { Atividade } from "../../types/atividade";

interface AtividadeListProps {
  atividades: Atividade[];
  loading?: boolean;
  emptyMessage?: string;
  onAtividadeClick?: (atividade: Atividade) => void;
  cardProps?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export default function AtividadeList({
  atividades,
  loading = false,
  emptyMessage = "Nenhuma atividade encontrada",
  onAtividadeClick,
  cardProps = { xs: 24, sm: 12, md: 8, lg: 6 },
}: AtividadeListProps) {
  return (
    <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
      {atividades.length === 0 && !loading && (
        <Col span={24}>
          <Empty description={emptyMessage} />
        </Col>
      )}
      {atividades.map((atividade) => (
        <AtividadeCardCol
          key={atividade._id}
          atividade={atividade}
          loading={loading}
          onClick={onAtividadeClick}
          {...cardProps}
        />
      ))}
    </Row>
  );
}
