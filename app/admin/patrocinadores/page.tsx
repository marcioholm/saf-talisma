"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "../../../lib/admin-client";
import Link from "next/link";

type SponsorRow = {
  id: string;
  nome: string;
  logo_url: string;
  website: string | null;
  destaque: boolean;
  ordem: number;
  ativo: boolean;
  sponsor_categories: { nome: string } | null;
};

export default function AdminPatrocinadores() {
  const [rows, setRows] = useState<SponsorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await getAdminClient()
      .from("sponsors")
      .select("id, nome, logo_url, website, destaque, ordem, ativo, sponsor_categories:categoria_id(nome)")
      .order("ordem");
    if (!error) setRows((data ?? []) as unknown as SponsorRow[]);
    setLoading(false);
  }

  async function toggleActive(id: string, ativo: boolean) {
    await getAdminClient().from("sponsors").update({ ativo: !ativo }).eq("id", id);
    load();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este patrocinador?")) return;
    setDeleting(id);
    const { error } = await getAdminClient().from("sponsors").delete().eq("id", id);
    setDeleting(null);
    if (!error) load();
    else window.alert(`Erro: ${error.message}`);
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Patrocinadores</h1>
          <p>Parceiros e apoiadores da Associação.</p>
        </div>
        <div className="admin-toolbar">
          <Link href="/admin/patrocinadores/nova" className="btn btn-magenta">
            + Novo patrocinador
          </Link>
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="empty-state">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum patrocinador</strong>
            Clique em “+ Novo patrocinador”.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ordem</th>
                <th>Logo</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Ativo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="cell-sub">{r.ordem}</td>
                  <td>
                    <img
                      src={
                        r.logo_url.startsWith("http")
                          ? r.logo_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${r.logo_url}`
                      }
                      alt={r.nome}
                      className="thumb-thumb"
                      style={{ display: "block" }}
                    />
                  </td>
                  <td className="cell-title">
                    {r.nome}
                    {r.destaque && <span className="admin-tag"> · destaque</span>}
                  </td>
                  <td className="cell-sub">{r.sponsor_categories?.nome ?? "—"}</td>
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
                      <Link href={`/admin/patrocinadores/${r.id}`} className="btn" style={{ padding: "6px 10px", fontSize: 12 }}>
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
