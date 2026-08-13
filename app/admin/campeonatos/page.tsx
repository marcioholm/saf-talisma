"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminClient } from "@/lib/admin-client";

type Championship = {
  id: string;
  name: string;
  slug: string;
  category: string;
  modality: string;
  city: string;
  start_date: string | null;
  max_teams: number;
  visibility: "draft" | "published" | "hidden" | "archived";
  registration_status: "scheduled" | "open" | "paused" | "closed";
  created_at: string;
};

export default function AdminCampeonatosPage() {
  const [items, setItems] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    const client = getAdminClient();
    const { data, error } = await client
      .from("championships")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Aviso ao carregar campeonatos:", error.message);
      setItems([]);
    } else {
      setItems((data as Championship[]) || []);
    }
    setLoading(false);
  }

  async function handleToggleVisibility(c: Championship, nextVis: Championship["visibility"]) {
    try {
      const client = getAdminClient();
      const { error } = await client
        .from("championships")
        .update({ visibility: nextVis, updated_at: new Date().toISOString() })
        .eq("id", c.id);
      if (error) throw error;
      await loadItems();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao alterar visibilidade." });
    }
  }

  async function handleToggleRegistration(c: Championship, nextReg: Championship["registration_status"]) {
    try {
      const client = getAdminClient();
      const { error } = await client
        .from("championships")
        .update({ registration_status: nextReg, updated_at: new Date().toISOString() })
        .eq("id", c.id);
      if (error) throw error;
      await loadItems();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao alterar status de inscrição." });
    }
  }

  if (loading) return <div className="empty-state">Carregando campeonatos…</div>;

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div>
          <h1>Campeonatos e Torneios</h1>
          <p>Crie e gerencie os campeonatos, regulamentos, limites de vagas e inscrições de equipes.</p>
        </div>
        <Link href="/admin/campeonatos/novo" className="btn btn-magenta">
          + Novo Campeonato
        </Link>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="admin-card">
        {items.length === 0 ? (
          <div className="empty-state" style={{ padding: "48px 24px" }}>
            <strong style={{ fontSize: 18, color: "#333" }}>Nenhum campeonato cadastrado</strong>
            <p style={{ margin: "8px 0 16px 0", color: "#666" }}>Clique no botão acima para criar o primeiro campeonato da Associação.</p>
            <Link href="/admin/campeonatos/novo" className="btn btn-magenta">
              Criar Campeonato
            </Link>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Vagas</th>
                <th>Visibilidade</th>
                <th>Inscrições</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    <br />
                    <small style={{ color: "#888" }}>/{c.slug}</small>
                  </td>
                  <td>{c.category}</td>
                  <td>{c.max_teams} equipes</td>
                  <td>
                    <select
                      value={c.visibility}
                      onChange={(e) => handleToggleVisibility(c, e.target.value as Championship["visibility"])}
                      style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}
                    >
                      <option value="draft">Rascunho</option>
                      <option value="published">Publicado</option>
                      <option value="hidden">Oculto</option>
                      <option value="archived">Arquivado</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={c.registration_status}
                      onChange={(e) => handleToggleRegistration(c, e.target.value as Championship["registration_status"])}
                      style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}
                    >
                      <option value="scheduled">Em breve</option>
                      <option value="open">Abertas</option>
                      <option value="paused">Pausadas</option>
                      <option value="closed">Encerradas</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Link href={`/admin/campeonatos/${c.id}`} className="btn btn-xs btn-outline">
                        Editar
                      </Link>
                      <Link href={`/admin/campeonatos/${c.id}/inscricoes`} className="btn btn-xs btn-magenta">
                        Inscrições
                      </Link>
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
