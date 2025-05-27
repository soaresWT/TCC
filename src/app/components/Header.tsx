"use client";
import React from "react";
import { Layout, Menu, Button, Avatar, Dropdown } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  SettingOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { MenuProps } from "antd";

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Meu Perfil",
      onClick: () => router.push("/perfil"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Configurações",
      onClick: () => router.push("/configuracoes"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sair",
      onClick: () => {
        // Implementar lógica de logout
        router.push("/login");
      },
    },
  ];

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link href="/home">Home</Link>,
    },
    {
      key: "atividades",
      icon: <TeamOutlined />,
      label: <Link href="/atividades">Atividades</Link>,
    },
    {
      key: "admin",
      icon: <TeamOutlined />,
      label: <Link href="/admin">Gerenciar Usuários</Link>,
    },
  ];

  return (
    <AntHeader
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ marginRight: 48 }}>
          <h1 style={{ margin: 0, fontSize: 20 }}>Sistema de Gestão</h1>
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ border: "none" }}
        />
      </div>

      <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
        <Button type="text" icon={<Avatar icon={<UserOutlined />} />}>
          Meu Perfil
        </Button>
      </Dropdown>
    </AntHeader>
  );
};
