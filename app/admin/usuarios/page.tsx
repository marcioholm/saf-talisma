"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "../../../lib/admin-client";

type UserRow = {
  id: string;
  full_name: string | null;
  created_at: string;
  roles: { role: string }[] | null;
};

export default function AdminUsuarios() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const client = getAdminClient();
    client.auth.getSession().then(({ data }) => setMyId(data.session?.user.id ?? null));
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await getAdminClient()
      .from("profiles")
      .select("id, full_name, created_at, roles:user_roles(role)")
      .order("created_at", { ascending: false });
    if (error) setMessage({ type: "error", text: error.message });
    else setRows((data ?? []) as UserRow[]);
    setLoading(false);
  }

  async function setRole(userId: string, role: "admin" | "editor", add: boolean) {
    setMessage(null);
    const client = getAdminClient();
    const { error } = add
      ? await client.from("user_roles").insert({ user_id: userId, role, created_by: myId })
      : await client.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) setMessage({ type: "error", text: error.message });
    else load();
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Usuários</h1>
          <p>Perfis e papéis de acesso ao painel.</p>
        </div>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="alert alert-info" style={{ maxWidth: 860 }}>
        Para criar uma nova conta de acesso, use o comando no terminal:
        <code className="mono" style={{ display: "block", marginTop: 6 }}>
          npm run supabase:create-admin -- email@dominio.com &quot;Nome Completo&quot; &quot;senha-min-8&quot;
        </code>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="empty-state">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum perfil</strong>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Papéis</th>
                <th>Criado em</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isAdmin = r.roles?.some((x) => x.role === "admin");
                const isEditor = r.roles?.some((x) => x.role === "editor");
                const self = r.id === myId;
                return (
                  <tr key={r.id}>
                    <td className="cell-title">
                      {r.full_name || "Sem nome"}
                      {self && <span className="admin-tag"> · você</span>}
                    </td>
                    <td>
                      <span className={`badge ${isAdmin ? "badge-admin" : "badge-draft"}`}>admin</span>{" "}
                      <span className={`badge ${isEditor ? "badge-editor" : "badge-draft"}`}>editor</span>
                    </td>
                    <td className="cell-sub">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <div className="cell-actions">
                        {!self && (
                          <>
                            <button
                              className={`btn ${isAdmin ? "btn-ghost" : ""}`}
                              style={{ padding: "5px 10px", fontSize: 12 }}
                              disabled={isAdmin}
                              onClick={() => setRole(r.id, "admin", !isAdmin)}
                            >
                              {isAdmin ? "Admin" : "Promover"}
                            </button>
                            <button
                              className={`btn ${isEditor ? "btn-ghost" : ""}`}
                              style={{ padding: "5px 10px", fontSize: 12 }}
                              onClick={() => setRole(r.id, "editor", !isEditor)}
                            >
                              {isEditor ? "Editor" : "Editor+"}
                            </button>
                            {(isAdmin || isEditor) && (
                              <button
                                className="btn btn-danger"
                                style={{ padding: "5px 10px", fontSize: 12 }}
                                onClick={() => setRole(r.id, isAdmin ? "admin" : "editor", false)}
                              >
                                Remover acesso
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
