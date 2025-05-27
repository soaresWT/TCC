import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from "antd";
import ptBR from "antd/locale/pt_BR";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Gestão de Atividades",
  description: "Sistema para gestão de atividades de bolsistas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ConfigProvider
          locale={ptBR}
          theme={{
            token: {
              colorPrimary: "#1677ff",
            },
          }}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
