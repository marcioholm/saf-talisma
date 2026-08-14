import Link from "next/link";
import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../../lib/supabase";
import "../public.css";

type Doc = {
  id: string;
  titulo: string | null;
  file_url: string;
  file_name: string;
  tipo_documento: string;
  file_size?: number;
  file_type?: string;
};

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
  periodo_bimestral?: string | null;
  mes_referencia?: number | null;
  exercicio_fiscal?: string | null;
  descricao_resumida?: string | null;
  dados_identificacao?: Record<string, unknown> | null;
  link_original?: string | null;
  documents?: Doc[] | null;
};

const TIPO: Record<string, string> = {
  estatuto: "Estatuto Social",
  balanco: "Balanço Patrimonial",
  ata: "Ata de Diretoria",
  prestacao_contas: "Prestação de Contas",
  convenio: "Convênio",
  repasse: "Repasse Público",
  patrocinio: "Patrocínio",
  emenda_parlamentar: "Emenda Parlamentar",
  edital: "Edital / Chamamento",
  doacao: "Doação",
  relatorio: "Relatório de Atividades",
  contrato: "Contrato",
  termo_parceria: "Termo de Parceria",
  bimestral: "Relatório Bimestral",
};

const SITUACAO: Record<string, string> = {
  aprovado: "Aprovado / Regular",
  concluido: "Concluído",
  em_andamento: "Em andamento",
  aguardando_prestacao: "Aguardando prestação de contas",
  prestacao_enviada: "Prestação enviada",
  cancelado: "Cancelado",
};

const brl = (v: number | null) =>
  v === null
    ? "—"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtensionBadge(fileName: string): string {
  const ext = fileName.split(".").pop()?.toUpperCase() || "DOC";
  return ext.length <= 4 ? ext : "DOC";
}

async function getRecords(): Promise<RecordRow[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/transparency_records?select=id,titulo,descricao,instituicao_origem,tipo,numero_processo,valor,data_recebimento,periodo_execucao_inicio,periodo_execucao_fim,finalidade,situacao,ano_referencia,data_publicacao,status,created_at,transparency_documents(id,titulo,file_name,file_url,file_size,file_type,tipo_documento)&status=eq.published&order=data_recebimento.desc.nullslast,ano_referencia.desc.nullslast,created_at.desc`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 30 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return (data || []).map((r: any) => ({
        ...r,
        documents: r.transparency_documents || [],
      }));
    }
  } catch (err) {
    console.error("Erro ao carregar transparência:", err);
  }
  return [];
}

export default async function TransparenciaPage({
  searchParams,
}: {
  searchParams?: Promise<{ year?: string }>;
}) {
  const params = await searchParams;
  const selectedYear = params?.year || "all";
  const rows = await getRecords();

  const years = Array.from(new Set(rows.map((r) => r.ano_referencia).filter((y): y is number => y !== null))).sort(
    (a, b) => b - a,
  );
  const filtered = selectedYear === "all" ? rows : rows.filter((r) => String(r.ano_referencia) === selectedYear);

  const totalValue = filtered.reduce((acc, r) => acc + (r.valor ?? 0), 0);
  const totalCount = filtered.length;

  return (
    <main className="page-body">
      <SiteHeader active="/transparencia" />
      <section className="page-hero">
        <div className="shell">
          <div className="eyebrow">Portal de Transparência & Prestação de Contas</div>
          <h1>
            Transparência <em>Oficial</em>
          </h1>
          <p>
            Estatuto social, balanços patrimoniais, convênios, repasses e prestações de contas da Associação Esportiva SAF Talismã disponíveis para consulta e download público.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <div className="transparency-summary">
            <div className="tstat">
              <span>Documentos e Registros</span>
              <strong>{totalCount}</strong>
            </div>
            <div className="tstat">
              <span>Recursos e Repasses</span>
              <strong>{brl(totalValue)}</strong>
            </div>
            <div className="tstat">
              <span>Ano Vigente</span>
              <strong>{new Date().getFullYear()}</strong>
            </div>
          </div>

          {years.length > 1 && (
            <div className="chip-bar">
              <Link className={`chip ${selectedYear === "all" ? "active" : ""}`} href="/transparencia">
                Todos os anos
              </Link>
              {years.map((y) => (
                <Link key={y} className={`chip ${selectedYear === String(y) ? "active" : ""}`} href={`/transparencia?year=${y}`}>
                  {y}
                </Link>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty">
              <strong>Nenhum registro publicado ainda</strong>
              Os documentos oficiais, convênios e prestações de contas aparecerão aqui assim que forem publicados no painel.
            </div>
          ) : (
            filtered.map((r) => (
              <details key={r.id} className="transparency-item" open>
                <summary>
                  <div className="t-head">
                    <h3>{r.titulo}</h3>
                    <p>
                      {TIPO[r.tipo] ?? r.tipo}
                      {r.ano_referencia ? ` · Exercício ${r.ano_referencia}` : ""}
                      {r.instituicao_origem ? ` · ${r.instituicao_origem}` : ""}
                    </p>
                  </div>
                  <div className="t-badge">{r.situacao ? (SITUACAO[r.situacao] ?? r.situacao) : "Publicado"}</div>
                  {r.valor !== null && r.valor > 0 && <div className="t-value">{brl(r.valor)}</div>}
                </summary>
                <div className="t-details">
                  <div className="t-grid">
                    {r.instituicao_origem && (
                      <div className="t-field">
                        <span>Origem / Órgão</span>
                        <p>{r.instituicao_origem}</p>
                      </div>
                    )}
                    {r.numero_processo && (
                      <div className="t-field">
                        <span>Nº do processo / termo</span>
                        <p>{r.numero_processo}</p>
                      </div>
                    )}
                    {r.data_recebimento && (
                      <div className="t-field">
                        <span>Data do Registro</span>
                        <p>{new Date(r.data_recebimento + "T12:00:00").toLocaleDateString("pt-BR")}</p>
                      </div>
                    )}
                    {(r.periodo_execucao_inicio || r.periodo_execucao_fim) && (
                      <div className="t-field">
                        <span>Período de Execução</span>
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

                  {r.descricao && <p style={{ fontSize: 14.5, color: "#333", margin: "0 0 12px", lineHeight: 1.6 }}>{r.descricao}</p>}
                  {r.finalidade && (
                    <p style={{ fontSize: 14, color: "#555", margin: "0 0 16px", lineHeight: 1.5 }}>
                      <strong style={{ color: "#111" }}>Finalidade / Objeto: </strong>
                      {r.finalidade}
                    </p>
                  )}

                  {/* Seção de Arquivos e Documentos para Download */}
                  {r.documents && r.documents.length > 0 ? (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #eee" }}>
                      <h4 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", margin: "0 0 12px 0", fontWeight: 700 }}>
                        Arquivos Disponíveis para Download ({r.documents.length})
                      </h4>
                      <div className="t-docs-grid">
                        {r.documents.map((doc) => (
                          <div key={doc.id} className="t-doc-card">
                            <div className="t-doc-badge">{getFileExtensionBadge(doc.file_name)}</div>
                            <div className="t-doc-info">
                              <span className="t-doc-title">{doc.titulo || doc.file_name}</span>
                              <span className="t-doc-size">{doc.file_name} {doc.file_size ? `· ${formatBytes(doc.file_size)}` : ""}</span>
                            </div>
                            <a
                              href={publicFileUrl(doc.file_url)}
                              target="_blank"
                              rel="noreferrer"
                              download={doc.file_name}
                              className="t-doc-download-btn"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              Baixar
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {r.link_original && (
                    <div style={{ marginTop: 12 }}>
                      <a href={r.link_original} target="_blank" rel="noreferrer" style={{ fontSize: 13.5, color: "#D200D2", fontWeight: 600, textDecoration: "underline" }}>
                        Ver documento na fonte oficial externa
                      </a>
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
