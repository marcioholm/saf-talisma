"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getAdminClient, getMyRole, type AdminRole } from "../../lib/admin-client";
import "./admin.css";

const NAV: { group: string; items: { href: string; label: string; admin?: boolean }[] }[] = [
  {
    group: "Conteúdo",
    items: [
      { href: "/admin", label: "Visão geral" },
      { href: "/admin/noticias", label: "Notícias" },
      { href: "/admin/jogos", label: "Jogos" },
      { href: "/admin/transparencia", label: "Transparência" },
      { href: "/admin/banners", label: "Banners" },
      { href: "/admin/patrocinadores", label: "Patrocinadores" },
      { href: "/admin/categorias", label: "Categorias" },
    ],
  },
  {
    group: "Administração",
    items: [
      { href: "/admin/usuarios", label: "Usuários", admin: true },
      { href: "/admin/configuracoes", label: "Configurações", admin: true },
      { href: "/admin/auditoria", label: "Auditoria", admin: true },
    ],
  },
];

function Mark({ small = false }: { small?: boolean }) {
  return (
    <div className={`mark mark-logo ${small ? "mark-small" : ""}`} aria-label="SAF Talismã">
      <img src="/logo-saf.svg" alt="SAF Talismã" />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<
    { status: "loading" } | { status: "ready"; role: AdminRole; fullName: string | null } | { status: "denied" }
  >({ status: "loading" });

  useEffect(() => {
    if (pathname === "/admin/login") return;
    let alive = true;
    const client = getAdminClient();
    client.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      if (!data.session) {
        window.location.replace("/admin/login");
        return;
      }
      const { role, fullName } = await getMyRole(client);
      if (!alive) return;
      if (role === "none") {
        setState({ status: "denied" });
        return;
      }
      setState({ status: "ready", role, fullName });
    });
    return () => {
      alive = false;
    };
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <main className="admin-body">{children}</main>;
  }

  if (state.status === "loading") {
    return (
      <main className="admin-body">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          Carregando painel…
        </div>
      </main>
    );
  }

  if (state.status === "denied") {
    return (
      <main className="admin-body">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <strong>Sem acesso ao painel</strong>
          Sua conta não possui papel de editor ou administrador.
          <div style={{ marginTop: 14 }}>
            <button
              className="btn btn-ghost"
              onClick={() => getAdminClient().auth.signOut().then(() => window.location.replace("/admin/login"))}
            >
              Sair
            </button>
          </div>
        </div>
      </main>
    );
  }

  const role = state.role;

  return (
    <div className="admin-body">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <a href="/admin" className="admin-brand">
            <Mark />
            <span className="admin-brand-name">
              SAF Talismã
              <small>Painel</small>
            </span>
          </a>
          <nav className="admin-nav" aria-label="Navegação do painel">
            {NAV.map((section) => (
              <div key={section.group}>
                <div className="admin-nav-group">{section.group}</div>
                {section.items
                  .filter((item) => !item.admin || role === "admin")
                  .map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className={pathname === item.href ? "active" : ""}
                    >
                      {item.label}
                    </a>
                  ))}
              </div>
            ))}
          </nav>
          <div className="admin-sidebar-foot">
            <div className="admin-user">
              <strong>{state.fullName || "Administrador"}</strong>
              <em className="badge" style={{ fontStyle: "normal" }}>
                {role === "admin" ? (
                  <span className="badge badge-admin">admin</span>
                ) : (
                  <span className="badge badge-editor">editor</span>
                )}
              </em>
            </div>
            <button
              className="btn-logout"
              onClick={() =>
                getAdminClient()
                  .auth.signOut()
                  .then(() => window.location.replace("/admin/login"))
              }
            >
              Sair
            </button>
          </div>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
