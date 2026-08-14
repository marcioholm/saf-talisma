"use client";

import { useState, useEffect } from "react";
import { getAdminClient, fmtDate } from "../../../lib/admin-client";
import Link from "next/link";

type GameRow = {
  id: string;
  adversario: string;
  status: string;
  casa_fora: string;
  data_jogo: string;
  competicao: { nome: string } | null;
  placar_nosso: number | null;
  placar_adversario: number | null;
};

const STATUS: Record<string, string> = {
  agendado: "Agendado",
  andamento: "Em andamento",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export default function AdminJogos() {
  const [rows, setRows] = useState<GameRow[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function load() {
    setLoading(true);
    let q = getAdminClient()
      .from("games")
      .select("id, adversario, status, casa_fora, data_jogo, placar_nosso, placar_adversario, competicao:competicao_id(nome)")
      .order("data_jogo", { ascending: false })
      .limit(300);
    if (status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    if (!error) setRows((data ?? []) as unknown as GameRow[]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este jogo?")) return;
    setDeleting(id);
    const { error } = await getAdminClient().from("games").delete().eq("id", id);
    setDeleting(null);
    if (!error) load();
    else window.alert(`Erro: ${error.message}`);
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Jogos</h1>
          <p>Agenda e resultados das equipes.</p>
        </div>
        <div className="admin-toolbar" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/admin/configuracoes" className="btn" style={{ background: "#2e9c41", color: "#fff", fontWeight: 600 }}>
            Configurar Próximo Desafio na Home
          </Link>
          <Link href="/admin/jogos/nova" className="btn btn-magenta">
            + Novo jogo
          </Link>
        </div>
      </div>

      <div className="filter-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Todos os status</option>
          <option value="agendado">Agendados</option>
          <option value="andamento">Em andamento</option>
          <option value="encerrado">Encerrados</option>
          <option value="cancelado">Cancelados</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="empty-state">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum jogo</strong>
            Clique em “+ Novo jogo” para cadastrar.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Adversário</th>
                <th>Competição</th>
                <th>Data</th>
                <th>Casa/Fora</th>
                <th>Status</th>
                <th>Placar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="cell-title">{r.adversario}</td>
                  <td className="cell-sub">{r.competicao?.nome ?? "—"}</td>
                  <td className="cell-sub">{fmtDate(r.data_jogo)}</td>
                  <td>
                    <span className={`badge badge-${r.casa_fora}`}>
                      {r.casa_fora === "casa" ? "Casa" : "Fora"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${r.status}`}>{STATUS[r.status] ?? r.status}</span>
                  </td>
                  <td className="cell-title">
                    {r.status === "encerrado" ? `${r.placar_nosso} × ${r.placar_adversario}` : "—"}
                  </td>
                  <td>
                    <div className="cell-actions">
                      <Link href={`/admin/jogos/${r.id}`} className="btn" style={{ padding: "6px 10px", fontSize: 12 }}>
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
