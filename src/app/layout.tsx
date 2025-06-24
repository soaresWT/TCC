// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import ptBR from "antd/locale/pt_BR";
import { ClientLayout } from "./components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

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
        <ConfigProvider locale={ptBR}>
          <ClientLayout>{children}</ClientLayout>
        </ConfigProvider>
      </body>
    </html>
  );
}
