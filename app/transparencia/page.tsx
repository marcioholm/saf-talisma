"use client";

import { useState, useEffect } from "react";
import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { supabase, publicFileUrl } from "../../lib/supabase";
import "../public.css";

type Doc = { id: string; titulo: string | null; file_url: string; file_name: string; tipo_documento: string };
type RecordRow = {
  id: string;
  titulo: string;
  descricao: string | null;
  instituicao_origem: string;
  tipo: string;
  numero_processo: string | null;
  valor: number | null;
  data_recebimento: string | null;
  periodo_execucao_inicio: string | null;
  periodo_execucao_fim: string | null;
  finalidade: string | null;
  situacao: string | null;
  ano_referencia: number | null;
  data_publicacao: string | null;
  documents: Doc[] | null;
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

const SITUACAO: Record<string, string> = {
  em_andamento: "Em andamento",
  concluido: "Concluído",
  aguardando_prestacao: "Aguardando prestação de contas",
  prestacao_enviada: "Prestação enviada",
  aprovado: "Aprovado",
  cancelado: "Cancelado",
};

const brl = (v: number | null) =>
  v === null
    ? "—"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function TransparenciaPage() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("all");

  useEffect(() => {
    supabase
      .from("transparency_records")
      .select("id, titulo, descricao, instituicao_origem, tipo, numero_processo, valor, data_recebimento, periodo_execucao_inicio, periodo_execucao_fim, finalidade, situacao, ano_referencia, data_publicacao, documents:transparency_documents(id, titulo, file_url, file_name, tipo_documento)")
      .eq("status", "published")
      .order("data_recebimento", { ascending: false })
      .order("ano_referencia", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setRows((data ?? []) as RecordRow[]);
        setLoading(false);
      });
  }, []);

  const years = Array.from(new Set(rows.map((r) => r.ano_referencia).filter((y): y is number => y !== null))).sort(
    (a, b) => b - a,
  );
  const filtered = year === "all" ? rows : rows.filter((r) => r.ano_referencia === Number(year));
  const totalValue = filtered.reduce((acc, r) => acc + (r.valor ?? 0), 0);
  const totalCount = filtered.length;

  return (
    <main className="page-body">
      <SiteHeader active="/transparencia" />
      <section className="page-hero">
        <div className="shell">
          <div className="eyebrow">Contas claras, clube de verdade</div>
          <h1>
            Transparência <em>total</em>
          </h1>
          <p>
            Convênios, repasses, doações e prestações de contas da SAF Talismã — publicados
            integralmente, sem filtros.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <div className="transparency-summary">
            <div className="tstat">
              <span>Registros publicados</span>
              <strong>{totalCount}</strong>
            </div>
            <div className="tstat">
              <span>Valor total registrado</span>
              <strong>{brl(totalValue)}</strong>
            </div>
            <div className="tstat">
              <span>Ano corrente</span>
              <strong>{new Date().getFullYear()}</strong>
            </div>
          </div>

          {years.length > 1 && (
            <div className="chip-bar">
              <button className={`chip ${year === "all" ? "active" : ""}`} onClick={() => setYear("all")}>
                Todos os anos
              </button>
              {years.map((y) => (
                <button key={y} className={`chip ${year === String(y) ? "active" : ""}`} onClick={() => setYear(String(y))}>
                  {y}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="empty">Carregando registros…</div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <strong>Nenhum registro publicado ainda</strong>
              Os dados de convênios, repasses e prestações de contas aparecerão aqui assim que forem
              publicados.
            </div>
          ) : (
            filtered.map((r) => (
              <details key={r.id} className="transparency-item">
                <summary>
                  <div className="t-head">
                    <h3>{r.titulo}</h3>
                    <p>
                      {r.instituicao_origem} · {TIPO[r.tipo] ?? r.tipo}
                      {r.ano_referencia ? ` · ${r.ano_referencia}` : ""}
                    </p>
                  </div>
                  <div className="t-badge">{r.situacao ? (SITUACAO[r.situacao] ?? r.situacao) : "Publicado"}</div>
                  <div className="t-value">{brl(r.valor)}</div>
                </summary>
                <div className="t-details">
                  <div className="t-grid">
                    {r.numero_processo && (
                      <div className="t-field">
                        <span>Nº do processo</span>
                        <p>{r.numero_processo}</p>
                      </div>
                    )}
                    {r.data_recebimento && (
                      <div className="t-field">
                        <span>Recebimento</span>
                        <p>{new Date(r.data_recebimento + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                      </div>
                    )}
                    {(r.periodo_execucao_inicio || r.periodo_execucao_fim) && (
                      <div className="t-field">
                        <span>Execução</span>
                        <p>
                          {r.periodo_execucao_inicio
                            ? new Date(r.periodo_execucao_inicio + "T12:00:00").toLocaleDateString("pt-BR")
                            : "—"}{" "}
                          até{" "}
                          {r.periodo_execucao_fim
                            ? new Date(r.periodo_execucao_fim + "T12:00:00").toLocaleDateString("pt-BR")
                            : "—"}
                        </p>
                      </div>
                    )}
                    {r.situacao && (
                      <div className="t-field">
                        <span>Situação</span>
                        <p>{SITUACAO[r.situacao] ?? r.situacao}</p>
                      </div>
                    )}
                  </div>
                  {r.descricao && <p style={{ fontSize: 14, color: "#4a4a4a", margin: "0 0 12px" }}>{r.descricao}</p>}
                  {r.finalidade && (
                    <p style={{ fontSize: 14, color: "#4a4a4a", margin: "0 0 12px" }}>
                      <b>Finalidade: </b>
                      {r.finalidade}
                    </p>
                  )}
                  {r.documents && r.documents.length > 0 && (
                    <div className="t-docs">
                      {r.documents.map((doc) => (
                        <a key={doc.id} href={publicFileUrl(doc.file_url)} target="_blank" rel="noreferrer">
                          📄 {doc.titulo || doc.file_name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </details>
            ))
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
