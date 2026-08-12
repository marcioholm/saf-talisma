"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "../../../lib/admin-client";
import Link from "next/link";

type BannerRow = {
  id: string;
  titulo: string | null;
  ordem: number;
  ativo: boolean;
  data_inicio: string | null;
  data_fim: string | null;
};

export default function AdminBanners() {
  const [rows, setRows] = useState<BannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await getAdminClient()
      .from("banners")
      .select("id, titulo, ordem, ativo, data_inicio, data_fim")
      .order("ordem");
    if (!error) setRows((data ?? []) as BannerRow[]);
    setLoading(false);
  }

  async function toggleActive(id: string, ativo: boolean) {
    const { error } = await getAdminClient().from("banners").update({ ativo: !ativo }).eq("id", id);
    if (!error) load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este banner?")) return;
    setDeleting(id);
    const { error } = await getAdminClient().from("banners").delete().eq("id", id);
    setDeleting(null);
    if (!error) load();
    else window.alert(`Erro: ${error.message}`);
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Banners</h1>
          <p>Banners da página inicial (desktop e mobile).</p>
        </div>
        <div className="admin-toolbar">
          <Link href="/admin/banners/nova" className="btn btn-magenta">
            + Novo banner
          </Link>
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="empty-state">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum banner</strong>
            Clique em “+ Novo banner”.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ordem</th>
                <th>Título</th>
                <th>Vigência</th>
                <th>Ativo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="cell-sub">{r.ordem}</td>
                  <td className="cell-title">{r.titulo || "Sem título"}</td>
                  <td className="cell-sub">
                    {r.data_inicio ? new Date(r.data_inicio).toLocaleDateString("pt-BR") : "—"} até{" "}
                    {r.data_fim ? new Date(r.data_fim).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td>
                    <button
                      className={`btn ${r.ativo ? "btn-green" : "btn-ghost"}`}
                      style={{ padding: "5px 10px", fontSize: 12 }}
                      onClick={() => toggleActive(r.id, r.ativo)}
                    >
                      {r.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <Link href={`/admin/banners/${r.id}`} className="btn" style={{ padding: "6px 10px", fontSize: 12 }}>
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
