// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider, theme } from "antd";
import ptBR from "antd/locale/pt_BR";
import { ClientLayout } from "./components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

// Tema customizado com cores bonitas
const customTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Cores primárias
    colorPrimary: "#1890ff", // Azul vibrante
    colorSuccess: "#52c41a", // Verde sucesso
    colorWarning: "#faad14", // Amarelo/laranja aviso
    colorError: "#ff4d4f", // Vermelho erro
    colorInfo: "#13c2c2", // Ciano informação

    // Cores de fundo
    colorBgBase: "#ffffff", // Branco puro para fundo
    colorBgContainer: "#ffffff", // Branco para containers
    colorBgElevated: "#ffffff", // Branco para elementos elevados
    colorBgLayout: "#f8fafc", // Cinza muito claro para layout

    // Cores de texto
    colorText: "#2c3e50", // Azul escuro para texto principal
    colorTextSecondary: "#64748b", // Cinza azulado para texto secundário
    colorTextTertiary: "#94a3b8", // Cinza claro para texto terciário

    // Bordas
    colorBorder: "#e2e8f0", // Cinza claro para bordas
    colorBorderSecondary: "#f1f5f9", // Cinza muito claro para bordas secundárias

    // Outras configurações
    borderRadius: 8, // Bordas arredondadas
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)", // Sombra suave
    fontFamily: inter.style.fontFamily,
    fontSize: 14,
    lineHeight: 1.5,
  },
  components: {
    Layout: {
      headerBg: "#ffffff",
      bodyBg: "#f8fafc",
      headerHeight: 64,
      headerPadding: "0 24px",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#e6f7ff",
      itemSelectedColor: "#1890ff",
      itemHoverBg: "#f0f9ff",
      itemHoverColor: "#1890ff",
    },
    Button: {
      borderRadius: 6,
      controlHeight: 36,
    },
    Card: {
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
    },
    Input: {
      borderRadius: 6,
      controlHeight: 36,
    },
    Select: {
      borderRadius: 6,
      controlHeight: 36,
    },
  },
};

export const metadata: Metadata = {
  title: "Sistema de Gestão",
  description: "Sistema de Gestão de Atividades",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ConfigProvider locale={ptBR} theme={customTheme}>
          <ClientLayout>{children}</ClientLayout>
        </ConfigProvider>
      </body>
    </html>
  );
}
