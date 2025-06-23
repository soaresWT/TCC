"use client";

import React from "react";
import { Layout } from "antd";
import { Header } from "./Header";
import { AuthProvider } from "@/hooks/useAuth";

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AuthProvider>
      <Layout style={{ minHeight: "100vh" }}>
        <Header />
        <Layout.Content style={{ padding: "24px", background: "#f0f2f5" }}>
          {children}
        </Layout.Content>
      </Layout>
    </AuthProvider>
  );
};
