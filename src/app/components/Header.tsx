"use client";
import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Avatar, Dropdown, Drawer } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  SettingOutlined,
  TeamOutlined,
  LogoutOutlined,
  LoginOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { MenuProps } from "antd";
import { useAuth } from "@/hooks/useAuth";

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, hasPermission, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      onClick: logout,
    },
  ];

  const getMenuItems = () => {
    const items = [
      {
        key: "atividades",
        icon: <TeamOutlined />,
        label: <Link href="/atividades">Atividades</Link>,
      },
    ];

    if (user) {
      items.unshift({
        key: "home",
        icon: <HomeOutlined />,
        label: <Link href="/home">Home</Link>,
      });

      if (hasPermission("manage-users")) {
        items.push({
          key: "admin",
          icon: <TeamOutlined />,
          label: <Link href="/admin">Admin</Link>,
        });
      }
    }

    return items;
  };

  const handleDrawerClose = () => {
    setMobileMenuOpen(false);
  };

  if (loading) {
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
        </div>
      </AntHeader>
    );
  }

  return (
    <>
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
        <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div style={{ marginRight: isMobile ? 16 : 24 }}>
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? 16 : 20,
                whiteSpace: "nowrap",
              }}
            >
              {isMobile ? "Sistema" : "Sistema de Gestão"}
            </h1>
          </div>
          {!isMobile && (
            <Menu
              mode="horizontal"
              selectedKeys={[pathname]}
              items={getMenuItems()}
              style={{
                border: "none",
                minWidth: "auto",
                flex: 1,
              }}
              overflowedIndicator={null}
            />
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
            />
          )}

          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button
                type="text"
                icon={<Avatar src={user.avatar} icon={<UserOutlined />} />}
              >
                {isMobile
                  ? user.name.split(" ")[0]
                  : `${user.name} (${user.tipo})`}
              </Button>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={() => router.push("/cadastro")}
              size={isMobile ? "small" : "middle"}
            >
              Login
            </Button>
          )}
        </div>
      </AntHeader>

      {/* Menu móvel */}
      <Drawer
        title="Menu"
        placement="left"
        open={mobileMenuOpen}
        onClose={handleDrawerClose}
        width={250}
      >
        <Menu
          mode="vertical"
          selectedKeys={[pathname]}
          items={getMenuItems()}
          style={{ border: "none" }}
          onClick={() => setMobileMenuOpen(false)}
        />
      </Drawer>
    </>
  );
};
