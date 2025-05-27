"use client";

import React from "react";
import { Layout } from "antd";
import { Header } from "./Header";

export const ClientLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header />
      <Layout.Content style={{ padding: "24px", background: "#f0f2f5" }}>
        {children}
      </Layout.Content>
    </Layout>
  );
};
