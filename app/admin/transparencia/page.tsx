"use client";

import { useState, useEffect } from "react";
import { getAdminClient, fmtBRL } from "../../../lib/admin-client";
import Link from "next/link";

type RecordRow = {
  id: string;
  titulo: string;
  tipo: string;
  valor: number | null;
  instituicao_origem: string;
  status: string;
  data_publicacao: string | null;
  data_recebimento: string | null;
};

const TIPO: Record<string, string> = {
  convenio: "Convênio",
  repasse: "Repasse",
  patrocinio: "Patrocínio",
  emenda_parlamentar: "Emenda parlamentar",
  edital: "Edital",
  doacao: "Doação",
  prestacao_contas: "Prestação de contas",
  relatorio: "Relatório",
  contrato: "Contrato",
  termo_parceria: "Termo de parceria",
};

const STATUS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export default function AdminTransparencia() {
  const [rows, setRows] = useState<RecordRow[]>([]);
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
      .from("transparency_records")
      .select("id, titulo, tipo, valor, instituicao_origem, status, data_publicacao, data_recebimento")
      .order("created_at", { ascending: false })
      .limit(300);
    if (status !== "all") q = q.eq("status", status);
    const { data, error } = await q;
    if (!error) setRows((data ?? []) as RecordRow[]);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Excluir este registro de transparência (incluindo documentos)?")) return;
    setDeleting(id);
    const { error } = await getAdminClient().from("transparency_records").delete().eq("id", id);
    setDeleting(null);
    if (!error) load();
    else window.alert(`Erro: ${error.message}`);
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Transparência</h1>
          <p>Convênios, repasses e prestações de contas.</p>
        </div>
        <div className="admin-toolbar">
          <Link href="/admin/transparencia/nova" className="btn btn-magenta">
            + Novo registro
          </Link>
        </div>
      </div>

      <div className="filter-bar">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="published">Publicados</option>
          <option value="archived">Arquivados</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="empty-state">Carregando…</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhum registro</strong>
            Cadastre o primeiro item de transparência.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Origem</th>
                <th>Valor</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="cell-title">{r.titulo}</td>
                  <td className="cell-sub">{TIPO[r.tipo] ?? r.tipo}</td>
                  <td className="cell-sub">{r.instituicao_origem}</td>
                  <td className="cell-title">{fmtBRL(r.valor)}</td>
                  <td>
                    <span className={`badge badge-${r.status}`}>{STATUS[r.status] ?? r.status}</span>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <Link href={`/admin/transparencia/${r.id}`} className="btn" style={{ padding: "6px 10px", fontSize: 12 }}>
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
