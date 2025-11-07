"use client";
import React, { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Drawer,
  Space,
  Typography,
  Skeleton,
  Divider,
} from "antd";
import { useRouter, usePathname } from "next/navigation";
import type { MenuProps } from "antd";
import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  Home,
  CalendarRange,
  ShieldCheck,
  Menu as MenuIcon,
  Settings2,
  LogOut,
  LogIn,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

type NavDefinition = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
  requiresPermission?: string;
};

const NAV_ITEMS: NavDefinition[] = [
  {
    key: "home",
    label: "Início",
    href: "/home",
    icon: Home,
    requiresAuth: true,
  },
  {
    key: "atividades",
    label: "Atividades",
    href: "/atividades",
    icon: CalendarRange,
  },
  {
    key: "admin",
    label: "Administração",
    href: "/admin",
    icon: ShieldCheck,
    requiresPermission: "manage-users",
  },
];

type StyleMap = Record<string, CSSProperties>;

const styles: StyleMap = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 120,
    background: "rgba(255, 255, 255, 0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #f0f0f0",
    padding: "0 24px",
    height: 72,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "box-shadow 0.2s ease",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
  },
  brandLink: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
    color: "inherit",
    minWidth: 0,
  },
  brandText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    lineHeight: 1.1,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 600,
    margin: 0,
    color: "#101828",
  },
  brandSubtitle: {
    fontSize: 12,
    color: "#475467",
    margin: 0,
  },
  navWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    flex: 1,
    minWidth: 0,
  },
  menu: {
    flex: 1,
    minWidth: 0,
    borderBottom: "none",
    background: "transparent",
    fontWeight: 500,
  },
  menuLabel: {
    fontSize: 14,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  userButton: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(148, 163, 184, 0.3)",
    background: "rgba(248, 250, 252, 0.8)",
  },
  userName: {
    fontWeight: 600,
    color: "#101828",
    fontSize: 14,
    maxWidth: 160,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: 12,
    color: "#475467",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 4px 16px",
  },
  drawerFooter: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, hasPermission, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 960);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = NAV_ITEMS.filter((item) => {
    if (item.requiresPermission && !hasPermission(item.requiresPermission)) {
      return false;
    }
    if (item.requiresAuth && !user) {
      return false;
    }
    return true;
  });

  const menuItems: MenuProps["items"] = navItems.map((item) => ({
    key: item.href,
    icon: React.createElement(item.icon, {
      size: 18,
      strokeWidth: 1.6,
    }),
    label: <span style={styles.menuLabel}>{item.label}</span>,
  }));

  const basePath = (() => {
    if (!pathname) return undefined;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return "/home";
    }
    return `/${segments[0]}`;
  })();

  const activeNavKey =
    basePath && navItems.some((item) => item.href === basePath)
      ? basePath
      : undefined;

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (typeof key === "string") {
      router.push(key);
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const handleDrawerClose = () => {
    setMobileMenuOpen(false);
  };

  const dropdownMenu: MenuProps = {
    items: [
      // {
      //   key: "profile",
      //   icon: <UserRound size={16} strokeWidth={1.6} />,
      //   label: "Meu Perfil",
      // },
      {
        key: "settings",
        icon: <Settings2 size={16} strokeWidth={1.6} />,
        label: "Configurações",
      },
      {
        type: "divider",
      },
      {
        key: "logout",
        icon: <LogOut size={16} strokeWidth={1.6} />,
        label: "Sair",
        danger: true,
      },
    ],
    onClick: ({ key }) => {
      if (key === "profile") {
        router.push("/perfil");
      } else if (key === "settings") {
        router.push("/configuracoes");
      } else if (key === "logout") {
        handleLogout();
      }
    },
  };

  if (loading) {
    return (
      <AntHeader style={styles.header}>
        <Space align="center" size={16} style={{ minWidth: 0 }}>
          <GraduationCap size={28} strokeWidth={1.6} color="#1d4ed8" />
          <div style={styles.brandText}>
            <Skeleton.Input active size="small" style={{ width: 140 }} />
            <Skeleton.Input active size="small" style={{ width: 200 }} />
          </div>
        </Space>
        <Skeleton.Button active shape="round" style={{ width: 120 }} />
      </AntHeader>
    );
  }

  return (
    <>
      <AntHeader style={styles.header}>
        <div style={styles.navWrapper}>
          <Link href={user ? "/home" : "/"} style={styles.brandLink}>
            <GraduationCap size={28} strokeWidth={1.6} color="#1d4ed8" />
            <div style={styles.brandText}>
              <h1 style={styles.brandTitle}>Sistema de Gestão</h1>
              <p style={styles.brandSubtitle}>
                Monitoramento integrado de atividades
              </p>
            </div>
          </Link>
          {!isMobile && menuItems.length > 0 && (
            <Menu
              mode="horizontal"
              selectable={menuItems.length > 0}
              selectedKeys={activeNavKey ? [activeNavKey] : []}
              items={menuItems}
              style={styles.menu}
              onClick={handleMenuClick}
            />
          )}
        </div>

        <div style={styles.actions}>
          {isMobile && menuItems.length > 0 && (
            <Button
              type="text"
              aria-label="Abrir menu"
              icon={<MenuIcon size={22} strokeWidth={1.8} />}
              onClick={() => setMobileMenuOpen(true)}
            />
          )}

          {user ? (
            <Dropdown
              menu={dropdownMenu}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button type="text" style={styles.userButton}>
                <Avatar src={user.avatar} size="small">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </Avatar>
                {!isMobile && (
                  <div>
                    <div style={styles.userName}>{user.name}</div>
                    <div style={styles.userRole}>{user.tipo}</div>
                  </div>
                )}
                <ChevronDown size={16} strokeWidth={1.6} />
              </Button>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              icon={<LogIn size={18} strokeWidth={1.6} />}
              onClick={() => router.push("/cadastro")}
            >
              Entrar
            </Button>
          )}
        </div>
      </AntHeader>

      <Drawer
        title={
          <Space align="center">
            <GraduationCap size={22} strokeWidth={1.6} color="#1d4ed8" />
            <Text strong>Sistema de Gestão</Text>
          </Space>
        }
        placement="left"
        open={mobileMenuOpen}
        onClose={handleDrawerClose}
        width={300}
      >
        {user && (
          <div style={styles.drawerHeader}>
            <Avatar src={user.avatar} size={48}>
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Text strong>{user.name}</Text>
              <br />
              <Text type="secondary">{user.tipo}</Text>
            </div>
          </div>
        )}

        {menuItems.length > 0 ? (
          <Menu
            mode="inline"
            selectable={menuItems.length > 0}
            selectedKeys={activeNavKey ? [activeNavKey] : []}
            items={menuItems}
            onClick={(info) => {
              setMobileMenuOpen(false);
              handleMenuClick(info);
            }}
          />
        ) : (
          <Text type="secondary">Nenhuma rota disponível.</Text>
        )}

        <div style={styles.drawerFooter}>
          <Divider style={{ margin: "8px 0 0" }} />
          {user ? (
            <Button
              block
              danger
              icon={<LogOut size={18} strokeWidth={1.6} />}
              onClick={handleLogout}
            >
              Sair da conta
            </Button>
          ) : (
            <Button
              type="primary"
              block
              icon={<LogIn size={18} strokeWidth={1.6} />}
              onClick={() => {
                setMobileMenuOpen(false);
                router.push("/cadastro");
              }}
            >
              Acessar conta
            </Button>
          )}
        </div>
      </Drawer>
    </>
  );
};
