"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminClient, uploadFile } from "../../../lib/admin-client";
import Link from "next/link";

type Doc = {
  id: string;
  titulo: string;
  file_name: string;
  file_url: string;
  tipo_documento: string;
  file_size?: number;
  ordem: number;
};

type StagedFile = {
  file: File;
  titulo: string;
  tipo_documento: string;
};

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
  instituicao_origem: "Associação Esportiva SAF Talismã",
  tipo: "prestacao_contas",
  numero_processo: "",
  valor: "",
  data_recebimento: "",
  periodo_execucao_inicio: "",
  periodo_execucao_fim: "",
  finalidade: "",
  situacao: "aprovado",
  ano_referencia: String(new Date().getFullYear()),
  status: "published",
};

const TIPOS: Array<[string, string]> = [
  ["estatuto", "Estatuto Social / Regimento"],
  ["balanco", "Balanço Patrimonial / Demonstrativo Financeiro"],
  ["ata", "Ata de Eleição / Diretoria"],
  ["prestacao_contas", "Prestação de Contas"],
  ["convenio", "Convênio / Termo de Fomento"],
  ["repasse", "Repasse Público / Municipal"],
  ["patrocinio", "Contrato de Patrocínio"],
  ["emenda_parlamentar", "Emenda Parlamentar"],
  ["edital", "Edital / Chamamento Público"],
  ["doacao", "Termo de Doação"],
  ["relatorio", "Relatório de Atividades"],
  ["contrato", "Contrato Administrativo"],
  ["termo_parceria", "Termo de Parceria"],
];

const SITUACOES: Array<[string, string]> = [
  ["aprovado", "Aprovado / Regular"],
  ["concluido", "Concluído"],
  ["em_andamento", "Em andamento / Vigente"],
  ["aguardando_prestacao", "Aguardando prestação de contas"],
  ["prestacao_enviada", "Prestação enviada em análise"],
  ["cancelado", "Cancelado"],
];

const DOC_TIPOS: Array<[string, string]> = [
  ["principal", "Documento Principal (PDF)"],
  ["estatuto", "Estatuto Social / Ata"],
  ["balanco", "Balanço / DRE / Contábil"],
  ["prestacao_contas", "Prestação de Contas Oficial"],
  ["convenio", "Convênio / Termo"],
  ["comprovante", "Comprovante / Recibo"],
  ["complementar", "Documento Complementar"],
];

function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TransparencyForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
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
            tipo: data.tipo ?? "prestacao_contas",
            numero_processo: data.numero_processo ?? "",
            valor: data.valor !== null && data.valor !== undefined ? String(data.valor) : "",
            data_recebimento: data.data_recebimento ?? "",
            periodo_execucao_inicio: data.periodo_execucao_inicio ?? "",
            periodo_execucao_fim: data.periodo_execucao_fim ?? "",
            finalidade: data.finalidade ?? "",
            situacao: data.situacao ?? "aprovado",
            ano_referencia: data.ano_referencia ? String(data.ano_referencia) : "",
            status: data.status ?? "published",
          });
          setLoading(false);
        });

      client
        .from("transparency_documents")
        .select("id, titulo, file_name, file_url, tipo_documento, file_size, ordem")
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

  // Adicionar arquivos para upload
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (isEdit && id) {
      // No modo edição, faz upload direto
      setUploading(true);
      setMessage(null);
      try {
        const client = getAdminClient();
        for (const file of files) {
          const path = await uploadFile(client, "transparency", file, `records/${id}`);
          const { data, error } = await client
            .from("transparency_documents")
            .insert({
              record_id: id,
              titulo: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
              file_url: path,
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
              tipo_documento: "principal",
              ordem: docs.length,
            })
            .select()
            .single();

          if (error) throw new Error(error.message);
          if (data) setDocs((d) => [...d, data as Doc]);
        }
        setMessage({ type: "success", text: "Documento(s) enviado(s) com sucesso!" });
      } catch (err: any) {
        setMessage({ type: "error", text: err?.message || "Falha no upload do documento." });
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    } else {
      // No modo novo registro, enfileira os arquivos
      const newStaged: StagedFile[] = files.map((file) => ({
        file,
        titulo: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        tipo_documento: "principal",
      }));
      setStagedFiles((prev) => [...prev, ...newStaged]);
      e.target.value = "";
    }
  }

  function removeStagedFile(index: number) {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function updateStagedTitle(index: number, titulo: string) {
    setStagedFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, titulo } : item))
    );
  }

  function updateStagedType(index: number, tipo_documento: string) {
    setStagedFiles((prev) =>
      prev.map((item, i) => (i === index ? { ...item, tipo_documento } : item))
    );
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
        instituicao_origem: form.instituicao_origem.trim() || "Associação Esportiva SAF Talismã",
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

      if (!payload.titulo) throw new Error("O título do registro é obrigatório.");

      let recordId = id;

      if (isEdit) {
        const { error } = await client
          .from("transparency_records")
          .update(payload)
          .eq("id", id);
        if (error) throw new Error(error.message);
      } else {
        const { data: created, error } = await client
          .from("transparency_records")
          .insert({ ...payload, created_by: userId })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        recordId = created.id;
      }

      // Se há arquivos na fila de criação, faz o upload agora
      if (stagedFiles.length > 0 && recordId) {
        for (let i = 0; i < stagedFiles.length; i++) {
          const item = stagedFiles[i];
          const path = await uploadFile(client, "transparency", item.file, `records/${recordId}`);
          await client.from("transparency_documents").insert({
            record_id: recordId,
            titulo: item.titulo.trim() || item.file.name,
            file_url: path,
            file_name: item.file.name,
            file_size: item.file.size,
            file_type: item.file.type,
            tipo_documento: item.tipo_documento,
            ordem: i,
          });
        }
      }

      setMessage({ type: "success", text: "Registro de transparência e documentos salvos com sucesso!" });
      router.push("/admin/transparencia");
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Erro ao salvar registro de transparência." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDocType(docId: string, tipo_documento: string) {
    const { error } = await getAdminClient().from("transparency_documents").update({ tipo_documento }).eq("id", docId);
    if (!error) setDocs((d) => d.map((x) => (x.id === docId ? { ...x, tipo_documento } : x)));
  }

  async function handleDocTitle(docId: string, titulo: string) {
    const { error } = await getAdminClient().from("transparency_documents").update({ titulo }).eq("id", docId);
    if (!error) setDocs((d) => d.map((x) => (x.id === docId ? { ...x, titulo } : x)));
  }

  async function handleDocDelete(docId: string) {
    if (!window.confirm("Excluir este documento anexado?")) return;
    const { error } = await getAdminClient().from("transparency_documents").delete().eq("id", docId);
    if (!error) setDocs((d) => d.filter((x) => x.id !== docId));
  }

  if (loading) return <div className="empty-state">Carregando…</div>;

  return (
    <form className="admin-form" onSubmit={handleSave}>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="admin-form-grid">
        <div className="field field-full">
          <label htmlFor="titulo">Título do Documento / Prestação de Contas</label>
          <input
            id="titulo"
            placeholder="Ex.: Estatuto Social 2026, Balanço Patrimonial 2025, Prestação de Contas Chamamento Público..."
            value={form.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="tipo">Categoria de Transparência</label>
          <select id="tipo" value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
            {TIPOS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="instituicao_origem">Órgão / Entidade de Origem</label>
          <input
            id="instituicao_origem"
            placeholder="Ex.: SAF Talismã, Prefeitura Municipal, Ministério do Esporte..."
            value={form.instituicao_origem}
            onChange={(e) => set("instituicao_origem", e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="ano_referencia">Ano de Referência</label>
          <input
            id="ano_referencia"
            type="number"
            placeholder="2026"
            value={form.ano_referencia}
            onChange={(e) => set("ano_referencia", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="situacao">Situação / Status</label>
          <select id="situacao" value={form.situacao} onChange={(e) => set("situacao", e.target.value)}>
            {SITUACOES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="valor">Valor do Recurso / Repasse (R$)</label>
          <input
            id="valor"
            type="number"
            step="0.01"
            min="0"
            placeholder="Deixe em branco se for documento institucional"
            value={form.valor}
            onChange={(e) => set("valor", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="numero_processo">Nº do Processo / Termo / Contrato</label>
          <input
            id="numero_processo"
            placeholder="Ex.: Termo de Fomento nº 04/2026"
            value={form.numero_processo}
            onChange={(e) => set("numero_processo", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="data_recebimento">Data de Recebimento / Registro</label>
          <input
            id="data_recebimento"
            type="date"
            value={form.data_recebimento}
            onChange={(e) => set("data_recebimento", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="periodo_execucao_inicio">Vigência (Início)</label>
          <input
            id="periodo_execucao_inicio"
            type="date"
            value={form.periodo_execucao_inicio}
            onChange={(e) => set("periodo_execucao_inicio", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="periodo_execucao_fim">Vigência (Término)</label>
          <input
            id="periodo_execucao_fim"
            type="date"
            value={form.periodo_execucao_fim}
            onChange={(e) => set("periodo_execucao_fim", e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="status">Status de Visibilidade</label>
          <select id="status" value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="published">Publicado (Visível no site)</option>
            <option value="draft">Rascunho (Oculto)</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>

        <div className="field field-full">
          <label htmlFor="finalidade">Objeto / Finalidade</label>
          <textarea
            id="finalidade"
            placeholder="Descreva o objetivo do convênio, projeto esportivo ou finalidade do documento..."
            value={form.finalidade}
            onChange={(e) => set("finalidade", e.target.value)}
            style={{ minHeight: 70 }}
          />
        </div>

        <div className="field field-full">
          <label htmlFor="descricao">Informações Adicionais / Observações</label>
          <textarea
            id="descricao"
            placeholder="Detalhes complementares sobre a prestação de contas..."
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            style={{ minHeight: 70 }}
          />
        </div>
      </div>

      {/* Seção de Upload de Arquivos / Documentos para Download Público */}
      <div style={{ marginTop: 32, padding: 24, background: "#fbfbfb", border: "1px solid #e5e5e5", borderRadius: 8 }}>
        <h2 style={{ fontSize: 18, margin: "0 0 8px", color: "#111" }}>
          Arquivos e Documentos para Download Público
        </h2>
        <p style={{ fontSize: 13.5, color: "#666", margin: "0 0 16px" }}>
          Faça o upload dos arquivos (PDF, DOCX, Planilhas, ZIP) que ficarão disponíveis para download público na aba de Transparência.
        </p>

        <div className="field field-full">
          <label htmlFor="doc-upload" style={{ fontWeight: 600 }}>
            Selecionar Arquivo(s) do Computador
          </label>
          <input
            id="doc-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.txt,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ padding: "10px", background: "#fff", border: "1px dashed #ccc", borderRadius: 6 }}
          />
          <div className="hint" style={{ marginTop: 4 }}>
            Formatos aceitos: <strong>PDF, DOCX, XLSX, CSV, ZIP, TXT</strong> — {uploading ? "Enviando arquivo(s)..." : "Você pode selecionar vários arquivos de uma vez."}
          </div>
        </div>

        {/* Arquivos enfileirados para criação */}
        {!isEdit && stagedFiles.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4 style={{ fontSize: 14, margin: "0 0 10px", color: "#2e9c41" }}>
              Arquivos prontos para envio ({stagedFiles.length}):
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stagedFiles.map((staged, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 13, minWidth: 140 }}>
                    {staged.file.name} ({formatBytes(staged.file.size)})
                  </span>
                  <input
                    type="text"
                    placeholder="Título público do documento"
                    value={staged.titulo}
                    onChange={(e) => updateStagedTitle(idx, e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: "6px 10px", fontSize: 13 }}
                  />
                  <select
                    value={staged.tipo_documento}
                    onChange={(e) => updateStagedType(idx, e.target.value)}
                    style={{ padding: "6px 10px", fontSize: 13 }}
                  >
                    {DOC_TIPOS.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ padding: "6px 10px", fontSize: 12 }}
                    onClick={() => removeStagedFile(idx)}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documentos já cadastrados no registro (Edição) */}
        {isEdit && docs.length > 0 && (
          <div className="admin-table-wrap" style={{ marginTop: 16 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome do Arquivo</th>
                  <th>Título de Exibição Pública</th>
                  <th>Tipo</th>
                  <th>Tamanho</th>
                  <th style={{ width: 150 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td className="cell-title" style={{ fontSize: 13 }}>
                      <a
                        href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${doc.file_url}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#D200D2", textDecoration: "underline", fontWeight: 600 }}
                      >
                        {doc.file_name}
                      </a>
                    </td>
                    <td>
                      <input
                        type="text"
                        defaultValue={doc.titulo || doc.file_name}
                        onBlur={(e) => handleDocTitle(doc.id, e.target.value)}
                        style={{ width: "100%", padding: "4px 8px", fontSize: 13 }}
                      />
                    </td>
                    <td>
                      <select
                        value={doc.tipo_documento}
                        onChange={(e) => handleDocType(doc.id, e.target.value)}
                        style={{ padding: "4px 8px", fontSize: 12 }}
                      >
                        {DOC_TIPOS.map(([v, l]) => (
                          <option key={v} value={v}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: 12, color: "#666" }}>
                      {formatBytes(doc.file_size)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ padding: "4px 8px", fontSize: 12 }}
                        onClick={() => handleDocDelete(doc.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="form-actions" style={{ marginTop: 24 }}>
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Salvando…" : isEdit ? "Atualizar Registro" : "Salvar e Publicar Registro"}
        </button>
        <Link href="/admin/transparencia" className="btn">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
