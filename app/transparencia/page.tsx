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
  periodo_bimestral: string | null;
  mes_referencia: number | null;
  exercicio_fiscal: string | null;
  descricao_resumida: string | null;
  dados_identificacao: JSONB | null;
  link_original: string | null;
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
  bimestral: "Relatório Bimestral",
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

interface BimestralFormData {
  titulo: string;
  descricao: string;
  instituicao_origem: string;
  tipo: keyof typeof TIPO;
  mes_referencia: number;
  exercicio_fiscal: string;
  periodo_bimestral: "1º bimestre" | "2º bimestre" | "1-2º bimestres";
  descricao_resumida: string;
  dados_identificacao: string; // JSON string
  link_original: string;
  status: "published" | "draft";
}

export default function TransparenciaPage() {
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("all");
  const [bimestralFilter, setBimestralFilter] = useState<"all" | "1º bimestre" | "2º bimestre" | "1-2º bimestres">("all");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<BimestralFormData>({
    titulo: "",
    descricao: "",
    instituicao_origem: "",
    tipo: "relatorio",
    mes_referencia: new Date().getMonth() + 1,
    exercicio_fiscal: String(new Date().getFullYear()),
    periodo_bimestral: "1º bimestre",
    descricao_resumida: "",
    dados_identificacao: "{}",
    link_original: "",
    status: "published",
  });

  useEffect(() => {
    supabase
      .from("transparency_records")
      .select("id, titulo, descricao, instituicao_origem, tipo, numero_processo, valor, data_recebimento, periodo_execucao_inicio, periodo_execucao_fim, finalidade, situacao, ano_referencia, data_publicacao, periodo_bimestral, mes_referencia, exercicio_fiscal, descricao_resumida, dados_identificacao:transparency_dados_identificacao, link_original, documents:transparency_documents(id, titulo, file_url, file_name, tipo_documento)")
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

  // Filtrar por bimestre
  let filteredByBimestre = filtered;
  if (bimestralFilter !== "all") {
    filteredByBimestre = filtered.filter((r) => r.periodo_bimestral === bimestralFilter);
  }

  const totalValue = filteredByBimestre.reduce((acc, r) => acc + (r.valor ?? 0), 0);
  const totalCount = filteredByBimestre.length;

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

          {bimestralFilter !== "all" && (
            <div className="chip-bar">
              <button className={`chip ${bimestralFilter === "all" ? "active" : ""}`} onClick={() => setBimestralFilter("all")}>
                Todos os bimestres
              </button>
              <button className={`chip ${bimestralFilter === "1º bimestre" ? "active" : ""}`} onClick={() => setBimestralFilter("1º bimestre")}>
                1º bimestre
              </button>
              <button className={`chip ${bimestralFilter === "2º bimestre" ? "active" : ""}`} onClick={() => setBimestralFilter("2º bimestre")}>
                2º bimestre
              </button>
              <button className={`chip ${bimestralFilter === "1-2º bimestres" ? "active" : ""}`} onClick={() => setBimestralFilter("1-2º bimestres")}>
                1-2º bimestres
              </button>
            </div>
          )}

          {loading ? (
            <div className="empty">Carregando registros…</div>
          ) : filteredByBimestre.length === 0 ? (
            <div className="empty">
              <strong>Nenhum registro publicado ainda</strong>
              Os dados de convênios, repasses e prestações de contas aparecerão aqui assim que forem
              publicados.
            </div>
          ) : (
            filteredByBimestre.map((r) => (
              <details key={r.id} className="transparency-item">
                <summary>
                  <div className="t-head">
                    <h3>{r.titulo}</h3>
                    <p>
                      {TIPO[r.tipo] ?? r.tipo}
                      {r.ano_referencia ? ` · ${r.ano_referencia}` : ""}
                      {r.periodo_bimestral ? ` · ${r.periodo_bimestral}` : ""}
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
                  {r.descricao_resumida && (
                    <p style={{ fontSize: 14, color: "#4a4a4a", margin: "0 0 12px" }}><b>Resumo: </b>{r.descricao_resumida}</p>
                  )}
                  {r.finalidade && (
                    <p style={{ fontSize: 14, color: "#4a4a4a", margin: "0 0 12px" }}>
                      <b>Finalidade: </b>
                      {r.finalidade}
                    </p>
                  )}
                  {r.dados_identificacao && typeof r.dados_identificacao === "object" && (
                    <div className="t-field">
                      <span>Dados identificadores</span>
                      <p>{JSON.stringify(r.dados_identificacao).substring(0, 200)}...</p>
                    </div>
                  )}
                  {r.link_original && (
                    <a href{r.link_original} target="_blank" rel="noreferrer">
                      <span>Documento original</span>
                    </a>
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

          {/* Formulário de novo registro */}
          {showForm && (
            <div className="form-overlay">
              <div className="form-card">
                <h3>{formData.tipo === "bimestral" ? "Novo Relatório Bimestral" : "Novo Registro"}</h3>
                <button onClick={() => setShowForm(false)} className="close-btn">×</button>
                <form
                  onSubmit={async (e: React.FormEvent) => {
                    e.preventDefault();
                    try {
                      const { data, error } = await supabase
                        .from("transparency_records")
                        .insert({
                          titulo: formData.titulo,
                          descricao: formData.descricao,
                          instituicao_origem: formData.instituicao_origem,
                          tipo: formData.tipo,
                          mes_referencia: formData.mes_referencia,
                          exercicio_fiscal: formData.exercicio_fiscal,
                          periodo_bimestral: formData.periodo_bimestral,
                          descricao_resumida: formData.descricao_resumida,
                          dados_identificacao: formData.dados_identificacao,
                          link_original: formData.link_original,
                          ano_referencia: formData.exercicio_fiscal ? parseInt(formData.exercicio_fiscal) : null,
                          status: formData.status,
                        })
                        .select()
                        .single();

                      if (error) throw error;
                      
                      // Upload de arquivos anexos (se houver)
                      // TODO: Implementar upload de files para transparência_bimestral_annexes
                      
                      setShowForm(false);
                      setFormData({
                        titulo: "",
                        descricao: "",
                        instituicao_origem: "",
                        tipo: "relatorio",
                        mes_referencia: new Date().getMonth() + 1,
                        exercicio_fiscal: String(new Date().getFullYear()),
                        periodo_bimestral: "1º bimestre",
                        descricao_resumida: "",
                        dados_identificacao: "{}",
                        link_original: "",
                        status: "published",
                      });
                      // Recarregar página
                      window.location.reload();
                    } catch (err) {
                      console.error("Erro ao cadastrar registro:", err);
                    }
                  }}
                >
                  {/* Campos do formulário */}
                  <div className="form-group">
                    <label>Título</label>
                    <input type="text" name="titulo" value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} required />
                  </div>
                  
                  <div className="form-group">
                    <label>Descrição</label>
                    <textarea name="descricao" value={formData.descricao} onChange={(e) => setFormData({...formData, descricao: e.target.value})} rows={3} required /></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Instituição de origem</label>
                    <input type="text" name="instituicao_origem" value={formData.instituicao_origem} onChange={(e) => setFormData({...formData, instituicao_origem: e.target.value})} required />
                  </div>
                  
                  <div className="form-group">
                    <label>Tipo</label>
                    <select name="tipo" value={formData.tipo} onChange={(e) => setFormData({...formData, tipo: e.target.value as keyof typeof TIPO})}>
                      {Object.keys(TIPO).map((key) => (
                        <option key={key} value={key}>{TIPO[key]}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Exercício fiscal</label>
                    <input type="number" name="exercicio_fiscal" value={formData.exercicio_fiscal} onChange={(e) => setFormData({...formData, exercicio_fiscal: e.target.value})} min={2000} max={2030} required />
                  </div>
                  
                  <div className="form-group">
                    <label>Período bimestral</label>
                    <select name="periodo_bimestral" value={formData.periodo_bimestral} onChange={(e) => setFormData({...formData, periodo_bimestral: e.target.value as "1º bimestre" | "2º bimestre" | "1-2º bimestres"})}>
                      <option value="1º bimestre">1º bimestre</option>
                      <option value="2º bimestre">2º bimestre</option>
                      <option value="1-2º bimestres">1-2º bimestres</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Mês de referência</label>
                    <input type="number" name="mes_referencia" value={formData.mes_referencia} onChange={(e) => setFormData({...formData, mes_referencia: parseInt(e.target.value)})} min={1} max={12} required />
                  </div>
                  
                  <div className="form-group">
                    <label>Descrição resumida</label>
                    <textarea name="descricao_resumida" value={formData.descricao_resumida} onChange={(e) => setFormData({...formData, descricao_resumida: e.target.value})} rows={2} /></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Dados identificadores (JSON)</label>
                    <textarea name="dados_identificacao" value={formData.dados_identificacao} onChange={(e) => setFormData({...formData, dados_identificacao: e.target.value})} rows={3} placeholder='Ex: {"cpf": "123.456.789-00", "cnpj": "00.000.000/0000-00"} /></textarea>
                  </div>
                  
                  <div className="form-group">
                    <label>Link original</label>
                    <input type="url" name="link_original" value={formData.link_original} onChange={(e) => setFormData({...formData, link_original: e.target.value})} placeholder="URL do documento no site oficial" />
                  </div>
                  
                  <div className="form-group">
                    <label>Situação</label>
                    <select name="status">
                      <option value="published">Publicado</option>
                      <option value="draft">Rascunho</option>
                    </select>
                  </div>
                  
                  <div className="actions">
                    <button type="submit" className="btn-primary">Salvar registro</button>
                    <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Botão para abrir formulário */}
          <button onClick={() => setShowForm(true)} className="add-btn">
            + Novo registro
          </button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
