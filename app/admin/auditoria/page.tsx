"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "../../../lib/admin-client";

type LogRow = {
  id: string;
  acao: string;
  entidade: string | null;
  entidade_id: string | null;
  detalhes: Record<string, unknown> | null;
  ip: string | null;
  created_at: string;
};

export default function AdminAuditoria() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [subscribers, setSubscribers] = useState<Array<{ id: string; email: string; subscribed_at: string; ativo: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"logs" | "newsletter">("logs");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const client = getAdminClient();
    (async () => {
      const { data: logs } = await client.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (tab === "logs" && logs) setRows(logs as LogRow[]);
      const { data: subs } = await client.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }).limit(500);
      if (subs) setSubscribers(subs as typeof subscribers);
      setLoading(false);
    })();
  }, []);

  function exportCSV() {
    setExporting(true);
    const csv = [
      "email;inscrito_em;ativo",
      ...subscribers.map((s) => `${s.email};${new Date(s.subscribed_at).toISOString()};${s.ativo ? "sim" : "nao"}`),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "newsletter-talisma.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    setExporting(false);
  }

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Auditoria</h1>
          <p>Registro de ações no painel e assinantes da newsletter.</p>
        </div>
        <div className="admin-toolbar">
          {tab === "newsletter" && (
            <button className="btn btn-green" onClick={exportCSV} disabled={exporting}>
              {exporting ? "Exportando…" : "Exportar CSV"}
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <button className={`btn ${tab === "logs" ? "btn-magenta" : ""}`} onClick={() => setTab("logs")}>
          Logs de auditoria
        </button>
        <button className={`btn ${tab === "newsletter" ? "btn-magenta" : ""}`} onClick={() => setTab("newsletter")}>
          Newsletter ({subscribers.length})
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Carregando…</div>
      ) : tab === "logs" ? (
        <div className="admin-table-wrap">
          {rows.length === 0 ? (
            <div className="empty-state">
              <strong>Sem registros</strong>
              As ações no painel aparecerão aqui quando o registro de auditoria for habilitado.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Ação</th>
                  <th>Entidade</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="cell-sub">{new Date(r.created_at).toLocaleString("pt-BR")}</td>
                    <td className="cell-title">{r.acao}</td>
                    <td className="cell-sub">
                      {r.entidade ?? "—"}
                      {r.entidade_id ? ` · ${String(r.entidade_id).slice(0, 8)}…` : ""}
                    </td>
                    <td className="cell-sub mono" style={{ maxWidth: 320 }}>
                      {r.detalhes ? JSON.stringify(r.detalhes) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="admin-table-wrap">
          {subscribers.length === 0 ? (
            <div className="empty-state">
              <strong>Nenhum assinante</strong>
              Inscrições feitas na home aparecerão aqui.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Inscrito em</th>
                  <th>Ativo</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id}>
                    <td className="cell-title">{s.email}</td>
                    <td className="cell-sub">{new Date(s.subscribed_at).toLocaleString("pt-BR")}</td>
                    <td>
                      <span className={`badge ${s.ativo ? "badge-published" : "badge-draft"}`}>{s.ativo ? "ativo" : "inativo"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
