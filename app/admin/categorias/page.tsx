"use client";

import { useState, useEffect } from "react";
import { getAdminClient, slugify } from "../../../lib/admin-client";

type Tab = "posts" | "sports" | "competitions" | "sponsors";

type CatRow = {
  id: string;
  nome: string;
  slug: string;
  ordem: number;
  ativo: boolean;
  temporada?: string | null;
};

const TABS: Array<{ key: Tab; label: string; table: string; hasSlug: boolean; hasSeason: boolean }> = [
  { key: "posts", label: "Notícias", table: "post_categories", hasSlug: true, hasSeason: false },
  { key: "sports", label: "Esportivas", table: "sports_categories", hasSlug: true, hasSeason: false },
  { key: "competitions", label: "Competições", table: "competitions", hasSlug: true, hasSeason: true },
  { key: "sponsors", label: "Patrocinadores", table: "sponsor_categories", hasSlug: true, hasSeason: false },
];

export default function AdminCategorias() {
  const [tab, setTab] = useState<Tab>("posts");
  const [rows, setRows] = useState<CatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [temporada, setTemporada] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const current = TABS.find((t) => t.key === tab)!;

  async function load() {
    setLoading(true);
    setMessage("");
    const { data, error } = await getAdminClient()
      .from(current.table)
      .select("id, nome, slug, ordem, ativo, temporada")
      .order("ordem");
    if (error) setMessage(error.message);
    else setRows((data ?? []) as CatRow[]);
    setLoading(false);
  }

  useEffect(() => {
    const t = window.setTimeout(load, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function add() {
    if (!nome.trim()) return;
    setSaving(true);
    const payload: Record<string, unknown> = {
      nome: nome.trim(),
      slug: slugify(nome),
      ordem: rows.length,
    };
    if (current.hasSeason) payload.temporada = temporada.trim() || null;
    const { error } = await getAdminClient().from(current.table).insert(payload);
    setSaving(false);
    if (error) setMessage(error.message);
    else {
      setNome("");
      setTemporada("");
      load();
    }
  }

  async function toggle(id: string, ativo: boolean) {
    await getAdminClient().from(current.table).update({ ativo: !ativo }).eq("id", id);
    load();
  }

  async function remove(id: string) {
    if (!window.confirm("Excluir esta categoria?")) return;
    const { error } = await getAdminClient().from(current.table).delete().eq("id", id);
    if (error) setMessage(error.message);
    else load();
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Categorias</h1>
          <p>Estrutura de organização do conteúdo.</p>
        </div>
      </div>

      <div className="filter-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`btn ${tab === t.key ? "btn-magenta" : ""}`}
            style={{ padding: "7px 12px", fontSize: 13 }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {message && <div className="alert alert-error">{message}</div>}

      <form
        className="admin-form"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        style={{ display: "flex", gap: 10, alignItems: "flex-end", padding: 16, marginBottom: 16 }}
      >
        <div className="field" style={{ margin: 0, flex: 1 }}>
          <label htmlFor="cat-nome">Nova categoria de {current.label.toLowerCase()}</label>
          <input id="cat-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da categoria" required />
        </div>
        {current.hasSeason && (
          <div className="field" style={{ margin: 0, width: 180 }}>
            <label htmlFor="cat-temporada">Temporada</label>
            <input id="cat-temporada" value={temporada} onChange={(e) => setTemporada(e.target.value)} placeholder="Ex.: 2026" />
          </div>
        )}
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Adicionando…" : "Adicionar"}
        </button>
      </form>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="empty-state">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhuma categoria</strong>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ordem</th>
                <th>Nome</th>
                <th>Slug</th>
                <th>Temporada</th>
                <th>Ativo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="cell-sub">{r.ordem}</td>
                  <td className="cell-title">{r.nome}</td>
                  <td className="cell-sub mono">{r.slug}</td>
                  <td className="cell-sub">{r.temporada ?? "—"}</td>
                  <td>
                    <button
                      className={`btn ${r.ativo ? "btn-green" : "btn-ghost"}`}
                      style={{ padding: "5px 10px", fontSize: 12 }}
                      onClick={() => toggle(r.id, r.ativo)}
                    >
                      {r.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <button className="btn btn-danger" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => remove(r.id)}>
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
