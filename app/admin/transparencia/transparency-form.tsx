"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminClient, uploadFile } from "../../../lib/admin-client";
import Link from "next/link";

type Doc = { id: string; titulo: string; file_name: string; file_url: string; tipo_documento: string; ordem: number };

type FormState = {
  titulo: string;
  descricao: string;
  instituicao_origem: string;
  tipo: string;
  numero_processo: string;
  valor: string;
  data_recebimento: string;
  periodo_execucao_inicio: string;
  periodo_execucao_fim: string;
  finalidade: string;
  situacao: string;
  ano_referencia: string;
  status: string;
};

const EMPTY: FormState = {
  titulo: "",
  descricao: "",
  instituicao_origem: "",
  tipo: "convenio",
  numero_processo: "",
  valor: "",
  data_recebimento: "",
  periodo_execucao_inicio: "",
  periodo_execucao_fim: "",
  finalidade: "",
  situacao: "em_andamento",
  ano_referencia: String(new Date().getFullYear()),
  status: "draft",
};

const TIPOS: Array<[string, string]> = [
  ["convenio", "Convênio"],
  ["repasse", "Repasse"],
  ["patrocinio", "Patrocínio"],
  ["emenda_parlamentar", "Emenda parlamentar"],
  ["edital", "Edital"],
  ["doacao", "Doação"],
  ["prestacao_contas", "Prestação de contas"],
  ["relatorio", "Relatório"],
  ["contrato", "Contrato"],
  ["termo_parceria", "Termo de parceria"],
];

const SITUACOES: Array<[string, string]> = [
  ["em_andamento", "Em andamento"],
  ["concluido", "Concluído"],
  ["aguardando_prestacao", "Aguardando prestação de contas"],
  ["prestacao_enviada", "Prestação enviada"],
  ["aprovado", "Aprovado"],
  ["cancelado", "Cancelado"],
];

const DOC_TIPOS: Array<[string, string]> = [
  ["principal", "Documento principal"],
  ["complementar", "Complementar"],
  ["comprovante", "Comprovante"],
  ["prestacao_contas", "Prestação de contas"],
];

export default function TransparencyForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const [uploading, setUploading] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (id) {
      const client = getAdminClient();
      client
        .from("transparency_records")
        .select("*")
        .eq("id", id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            setMessage({ type: "error", text: "Registro não encontrado." });
            setLoading(false);
            return;
          }
          setForm({
            titulo: data.titulo ?? "",
            descricao: data.descricao ?? "",
            instituicao_origem: data.instituicao_origem ?? "",
            tipo: data.tipo ?? "convenio",
            numero_processo: data.numero_processo ?? "",
            valor: data.valor ?? "",
            data_recebimento: data.data_recebimento ?? "",
            periodo_execucao_inicio: data.periodo_execucao_inicio ?? "",
            periodo_execucao_fim: data.periodo_execucao_fim ?? "",
            finalidade: data.finalidade ?? "",
            situacao: data.situacao ?? "em_andamento",
            ano_referencia: data.ano_referencia ?? "",
            status: data.status ?? "draft",
          });
          setLoading(false);
        });
      client
        .from("transparency_documents")
        .select("id, titulo, file_name, file_url, tipo_documento, ordem")
        .eq("record_id", id)
        .order("ordem")
        .then(({ data, error }) => {
          if (!error) setDocs((data ?? []) as Doc[]);
        });
    }
  }, [id]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const client = getAdminClient();
      const { data: session } = await client.auth.getSession();
      const userId = session.session?.user.id;

      const payload = {
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim() || null,
        instituicao_origem: form.instituicao_origem.trim(),
        tipo: form.tipo,
        numero_processo: form.numero_processo.trim() || null,
        valor: form.valor === "" ? null : Number(form.valor),
        data_recebimento: form.data_recebimento || null,
        periodo_execucao_inicio: form.periodo_execucao_inicio || null,
        periodo_execucao_fim: form.periodo_execucao_fim || null,
        finalidade: form.finalidade.trim() || null,
        situacao: form.situacao || null,
        ano_referencia: form.ano_referencia === "" ? null : Number(form.ano_referencia),
        status: form.status,
        data_publicacao: form.status === "published" ? new Date().toISOString() : null,
        updated_by: userId,
      };

      if (!payload.titulo || !payload.instituicao_origem) throw new Error("Título e origem são obrigatórios.");

      const { error } = isEdit
        ? await client.from("transparency_records").update(payload).eq("id", id)
        : await client.from("transparency_records").insert({ ...payload, created_by: userId });

      if (error) throw new Error(error.message);
      setMessage({ type: "success", text: "Registro salvo." });
      router.push("/admin/transparencia");
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    if (!["application/pdf", "application/zip", "text/csv", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      setMessage({ type: "error", text: "Formato não permitido. Use PDF, ZIP, CSV, TXT ou DOCX." });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const path = await uploadFile(getAdminClient(), "transparency", file, `records/${id}`);
      const { data, error } = await getAdminClient()
        .from("transparency_documents")
        .insert({ record_id: id, titulo: file.name, file_url: path, file_name: file.name, file_size: file.size, file_type: file.type, tipo_documento: "complementar", ordem: docs.length })
        .select()
        .single();
      if (error) throw new Error(error.message);
      setDocs((d) => [...d, data as Doc]);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload falhou." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDocType(docId: string, tipo_documento: string) {
    const { error } = await getAdminClient().from("transparency_documents").update({ tipo_documento }).eq("id", docId);
    if (!error) setDocs((d) => d.map((x) => (x.id === docId ? { ...x, tipo_documento } : x)));
  }

  async function handleDocDelete(docId: string) {
    if (!window.confirm("Excluir este documento?")) return;
    const { error } = await getAdminClient().from("transparency_documents").delete().eq("id", docId);
    if (!error) setDocs((d) => d.filter((x) => x.id !== docId));
  }

  if (loading) return <div className="empty-state">Carregando…</div>;

  return (
    <form className="admin-form" onSubmit={handleSave}>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="admin-form-grid">
        <div className="field field-full">
          <label htmlFor="titulo">Título do registro</label>
          <input id="titulo" value={form.titulo} onChange={(e) => set("titulo", e.target.value)} required />
        </div>
        <div className="field field-full">
          <label htmlFor="descricao">Descrição</label>
          <textarea id="descricao" value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="tipo">Tipo</label>
          <select id="tipo" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
            {TIPOS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="instituicao_origem">Instituição de origem</label>
          <input id="instituicao_origem" value={form.instituicao_origem} onChange={(e) => set("instituicao_origem", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="numero_processo">Nº do processo</label>
          <input id="numero_processo" value={form.numero_processo} onChange={(e) => set("numero_processo", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="valor">Valor (R$)</label>
          <input id="valor" type="number" step="0.01" min="0" value={form.valor} onChange={(e) => set("valor", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="ano_referencia">Ano de referência</label>
          <input id="ano_referencia" type="number" value={form.ano_referencia} onChange={(e) => set("ano_referencia", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="data_recebimento">Data de recebimento</label>
          <input id="data_recebimento" type="date" value={form.data_recebimento} onChange={(e) => set("data_recebimento", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="periodo_execucao_inicio">Início da execução</label>
          <input id="periodo_execucao_inicio" type="date" value={form.periodo_execucao_inicio} onChange={(e) => set("periodo_execucao_inicio", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="periodo_execucao_fim">Fim da execução</label>
          <input id="periodo_execucao_fim" type="date" value={form.periodo_execucao_fim} onChange={(e) => set("periodo_execucao_fim", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="situacao">Situação</label>
          <select id="situacao" value={form.situacao} onChange={(e) => set("situacao", e.target.value)}>
            {SITUACOES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
        <div className="field field-full">
          <label htmlFor="finalidade">Finalidade</label>
          <textarea id="finalidade" value={form.finalidade} onChange={(e) => set("finalidade", e.target.value)} />
        </div>
      </div>

      {isEdit && (
        <>
          <h2 className="admin-section-title">Documentos</h2>
          <div className="field">
            <input id="doc-upload" type="file" accept=".pdf,.zip,.csv,.txt,.doc,.docx" onChange={handleUpload} disabled={uploading} />
            <div className="hint">PDF, ZIP, CSV, TXT, DOCX — {uploading ? "Enviando…" : ""}</div>
          </div>
          {docs.length > 0 && (
            <div className="admin-table-wrap" style={{ marginTop: 12 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Arquivo</th>
                    <th>Tipo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc) => (
                    <tr key={doc.id}>
                      <td className="cell-title">
                        <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${doc.file_url}`} target="_blank" rel="noreferrer">
                          {doc.file_name}
                        </a>
                      </td>
                      <td>
                        <select value={doc.tipo_documento} onChange={(e) => handleDocType(doc.id, e.target.value)}>
                          {DOC_TIPOS.map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button type="button" className="btn btn-danger" style={{ padding: "6px 10px", fontSize: 12 }} onClick={() => handleDocDelete(doc.id)}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <div className="form-actions">
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Salvando…" : "Salvar registro"}
        </button>
        <Link href="/admin/transparencia" className="btn">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
