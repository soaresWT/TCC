import React from "react";
import type { CSSProperties } from "react";
import { Card, Tag, Col, Typography, Divider, Space } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import {
  CalendarRange,
  Eye,
  EyeOff,
  Layers3,
  MapPin,
  UsersRound,
  UserRound,
} from "lucide-react";
import { Atividade } from "../../types/atividade";

interface AtividadeCardProps {
  atividade: Atividade;
  loading?: boolean;
  onClick?: (atividade: Atividade) => void;
  navigateOnClick?: boolean;
}

const { Paragraph, Text, Title } = Typography;

type InfoItem = {
  key: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    color?: string;
  }>;
  label: string;
  caption?: string;
};

const cardStyles: Record<string, CSSProperties> = {
  wrapper: {
    borderRadius: 18,
    boxShadow: "0 12px 32px rgba(15, 23, 42, 0.08)",
    overflow: "hidden",
    height: "100%",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    height: "100%",
    padding: 24,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 12,
    background: "#f8fafc",
  },
  infoText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  footer: {
    marginTop: "auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
  },
  statBlock: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 14,
    background: "linear-gradient(135deg, #eff6ff, #f5f5ff)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
  },
};

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

  const visibilityTag = atividade.visibilidade
    ? {
        color: "success" as const,
        label: "Visível",
        icon: Eye,
      }
    : {
        color: "default" as const,
        label: "Oculto",
        icon: EyeOff,
      };

  const infoItems: InfoItem[] = [];

  if (atividade.campus) {
    infoItems.push({
      key: "campus",
      icon: MapPin,
      label: atividade.campus,
      caption: "Campus",
    });
  }

  if (atividade.datainicio) {
    infoItems.push({
      key: "datainicio",
      icon: CalendarRange,
      label: dayjs(atividade.datainicio).format("DD/MM/YYYY"),
      caption: "Início",
    });
  }

  if (atividade.categoria) {
    infoItems.push({
      key: "categoria",
      icon: Layers3,
      label: atividade.categoria,
      caption: "Categoria",
    });
  }

  if (
    atividade.quantidadeAlunos !== undefined &&
    atividade.quantidadeAlunos !== null
  ) {
    infoItems.push({
      key: "quantidadeAlunos",
      icon: UsersRound,
      label: `${atividade.quantidadeAlunos} vagas`,
      caption: "Capacidade",
    });
  }

  return (
    <Card
      hoverable
      loading={loading}
      onClick={handleCardClick}
      style={{
        ...cardStyles.wrapper,
        cursor: onClick || navigateOnClick ? "pointer" : "default",
      }}
      bodyStyle={cardStyles.body}
    >
      <div style={cardStyles.header}>
        <div style={cardStyles.meta}>
          <Title level={4} style={{ margin: 0, fontSize: 20 }}>
            {atividade.nome}
          </Title>
          <div style={cardStyles.chips}>
            {atividade.campus && (
              <Tag
                icon={<MapPin size={16} strokeWidth={1.6} />}
                color="blue"
                style={{ borderRadius: 999, padding: "2px 10px" }}
              >
                {atividade.campus}
              </Tag>
            )}
            {atividade.categoria && (
              <Tag
                icon={<Layers3 size={16} strokeWidth={1.6} />}
                color="orange"
                style={{ borderRadius: 999, padding: "2px 10px" }}
              >
                {atividade.categoria}
              </Tag>
            )}
          </div>
        </div>
        <Tag
          icon={<visibilityTag.icon size={16} strokeWidth={1.6} />}
          color={visibilityTag.color}
          style={{ borderRadius: 999, padding: "4px 12px" }}
        >
          {visibilityTag.label}
        </Tag>
      </div>

      <Paragraph
        ellipsis={{ rows: 3, tooltip: atividade.descricao }}
        style={{ margin: 0, color: "#475467" }}
      >
        {atividade.descricao ||
          "Esta atividade ainda não possui uma descrição detalhada."}
      </Paragraph>

      {infoItems.length > 0 && (
        <>
          <Divider style={{ margin: "8px 0" }} />
          <div style={cardStyles.infoGrid}>
            {infoItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} style={cardStyles.infoItem}>
                  <Icon size={20} strokeWidth={1.6} color="#2563eb" />
                  <div style={cardStyles.infoText}>
                    {item.caption && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.caption}
                      </Text>
                    )}
                    <Text strong>{item.label}</Text>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div style={cardStyles.footer}>
        <div style={cardStyles.statBlock}>
          <UsersRound size={20} strokeWidth={1.5} color="#1d4ed8" />
          <Space direction="vertical" size={0}>
            <Text type="secondary">Participantes</Text>
            <Text strong>{atividade.participantes?.length ?? 0}</Text>
          </Space>
        </div>
        <div style={cardStyles.statBlock}>
          <UserRound size={20} strokeWidth={1.5} color="#7c3aed" />
          <Space direction="vertical" size={0}>
            <Text type="secondary">Bolsistas</Text>
            <Text strong>{atividade.bolsistas?.length ?? 0}</Text>
          </Space>
        </div>
      </div>
    </Card>
  );
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
    <Col
      xs={xs}
      sm={sm}
      md={md}
      lg={lg}
      key={atividade._id}
      style={{ display: "flex" }}
    >
      <AtividadeCard
        atividade={atividade}
        loading={loading}
        onClick={onClick}
        navigateOnClick={navigateOnClick}
      />
    </Col>
  );
}
