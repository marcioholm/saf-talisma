"use client";

import { useState, useEffect } from "react";
import { getAdminClient, STATUS_LABEL, fmtDate } from "../../../lib/admin-client";
import Link from "next/link";

type PostRow = {
  id: string;
  titulo: string;
  status: string;
  destaque: boolean;
  categoria_id: string | null;
  published_at: string | null;
};

export default function AdminNoticias() {
  const [rows, setRows] = useState<PostRow[]>([]);
  const [cats, setCats] = useState<{ id: string; nome: string }[]>([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getAdminClient()
      .from("post_categories")
      .select("id, nome")
      .order("ordem")
      .then(({ data, error }) => {
        if (!error) setCats((data ?? []) as { id: string; nome: string }[]);
      });
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function load() {
    setLoading(true);
    let q = getAdminClient()
      .from("posts")
      .select("id, titulo, status, destaque, categoria_id, published_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    if (!error) setRows((data ?? []) as PostRow[]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir esta notícia?")) return;
    setDeleting(id);
    const { error } = await getAdminClient().from("posts").delete().eq("id", id);
    setDeleting(null);
    if (!error) load();
    else window.alert(`Erro: ${error.message}`);
  }

  const filtered = rows.filter((r) =>
    search.trim() ? r.titulo.toLowerCase().includes(search.toLowerCase()) : true,
  );

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Notícias</h1>
          <p>Rascunhos, agendadas e publicadas.</p>
        </div>
        <div className="admin-toolbar">
          <Link href="/admin/noticias/nova" className="btn btn-magenta">
            + Nova notícia
          </Link>
        </div>
      </div>

      <div className="filter-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="scheduled">Agendadas</option>
          <option value="published">Publicadas</option>
          <option value="archived">Arquivadas</option>
        </select>
        <input
          type="search"
          placeholder="Buscar por título…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="empty-state">Carregando…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhuma notícia</strong>
            Clique em “+ Nova notícia” para começar.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Status</th>
                <th>Categoria</th>
                <th>Publicação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="cell-title">
                    {r.titulo}
                    {r.destaque && <span className="admin-tag"> · destaque</span>}
                  </td>
                  <td>
                    <span className={`badge badge-${r.status}`}>
                      {STATUS_LABEL[r.status as keyof typeof STATUS_LABEL] ?? r.status}
                    </span>
                  </td>
                  <td className="cell-sub">{cats.find((c) => c.id === r.categoria_id)?.nome ?? "—"}</td>
                  <td className="cell-sub">{fmtDate(r.published_at)}</td>
                  <td>
                    <div className="cell-actions">
                      <Link href={`/admin/noticias/${r.id}`} className="btn" style={{ padding: "6px 10px", fontSize: 12 }}>
                        Editar
                      </Link>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                        onClick={() => handleDelete(r.id)}
                        disabled={deleting === r.id}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
