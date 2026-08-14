"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminClient, uploadFile } from "../../../lib/admin-client";
import Link from "next/link";

type FormState = {
  titulo: string;
  subtitulo: string;
  texto: string;
  botao_texto: string;
  botao_url: string;
  botao_target: "same" | "new";
  imagem_alt: string;
  foco: string;
  ordem: string;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
};

const EMPTY: FormState = {
  titulo: "",
  subtitulo: "",
  texto: "",
  botao_texto: "",
  botao_url: "",
  botao_target: "same",
  imagem_alt: "",
  foco: "50% 50%",
  ordem: "0",
  data_inicio: "",
  data_fim: "",
  ativo: true,
};

export default function BannerForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [desktopPath, setDesktopPath] = useState("");
  const [mobilePath, setMobilePath] = useState("");
  const [desktopPreview, setDesktopPreview] = useState("");
  const [mobilePreview, setMobilePreview] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const isEdit = Boolean(id);

  useEffect(() => {
    if (id) {
      const client = getAdminClient();
      client
        .from("banners")
        .select("*")
        .eq("id", id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            setMessage({ type: "error", text: "Banner não encontrado." });
            setLoading(false);
            return;
          }
          setForm({
            titulo: data.titulo ?? "",
            subtitulo: data.subtitulo ?? "",
            texto: data.texto ?? "",
            botao_texto: data.botao_texto ?? "",
            botao_url: data.botao_url ?? "",
            botao_target: data.botao_target ?? "same",
            imagem_alt: data.imagem_alt ?? "",
            foco: data.foco ?? "50% 50%",
            ordem: String(data.ordem ?? 0),
            data_inicio: data.data_inicio ?? "",
            data_fim: data.data_fim ?? "",
            ativo: data.ativo ?? true,
          });
          setDesktopPath(data.imagem_desktop_url ?? "");
          setDesktopPreview(data.imagem_desktop_url ?? "");
          setMobilePath(data.imagem_mobile_url ?? "");
          setMobilePreview(data.imagem_mobile_url ?? "");
          setLoading(false);
        });
    }
  }, [id]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImage(kind: "desktop" | "mobile", file: File | null) {
    if (!file) return;
    try {
      const path = await uploadFile(getAdminClient(), "banners", file, "banners");
      if (kind === "desktop") {
        setDesktopPath(path);
        setDesktopPreview(path);
      } else {
        setMobilePath(path);
        setMobilePreview(path);
      }
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload falhou." });
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const client = getAdminClient();
      const payload = {
        titulo: form.titulo.trim() || null,
        subtitulo: form.subtitulo.trim() || null,
        texto: form.texto.trim() || null,
        botao_texto: form.botao_texto.trim() || null,
        botao_url: form.botao_url.trim() || null,
        botao_target: form.botao_target,
        imagem_alt: form.imagem_alt.trim() || null,
        foco: form.foco || "50% 50%",
        ordem: Number(form.ordem) || 0,
        data_inicio: form.data_inicio || null,
        data_fim: form.data_fim || null,
        ativo: form.ativo,
        imagem_desktop_url: desktopPath || null,
        imagem_mobile_url: mobilePath || null,
      };
      if (!payload.imagem_desktop_url && !payload.imagem_mobile_url) {
        throw new Error("Envie ao menos uma imagem (desktop ou mobile).");
      }
      const { error } = isEdit
        ? await client.from("banners").update(payload).eq("id", id)
        : await client.from("banners").insert(payload);
      if (error) throw new Error(error.message);
      setMessage({ type: "success", text: "Banner salvo." });
      router.push("/admin/banners");
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Carregando…</div>;

  const img = (path: string) =>
    path.startsWith("http") ? path : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path}`;

  return (
    <form className="admin-form" onSubmit={handleSave}>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <div className="admin-form-grid">
        <div className="field field-full">
          <label htmlFor="titulo">Título</label>
          <input id="titulo" value={form.titulo} onChange={(e) => set("titulo", e.target.value)} />
        </div>
        <div className="field field-full">
          <label htmlFor="subtitulo">Subtítulo</label>
          <input id="subtitulo" value={form.subtitulo} onChange={(e) => set("subtitulo", e.target.value)} />
        </div>
        <div className="field field-full">
          <label htmlFor="texto">Texto</label>
          <textarea id="texto" value={form.texto} onChange={(e) => set("texto", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="botao_texto">Texto do botão</label>
          <input id="botao_texto" value={form.botao_texto} onChange={(e) => set("botao_texto", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="botao_url">URL do botão</label>
          <input id="botao_url" value={form.botao_url} onChange={(e) => set("botao_url", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="botao_target">Abrir botão em</label>
          <select id="botao_target" value={form.botao_target} onChange={(e) => set("botao_target", e.target.value as "same" | "new")}>
            <option value="same">Mesma aba</option>
            <option value="new">Nova aba</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="ordem">Ordem</label>
          <input id="ordem" type="number" value={form.ordem} onChange={(e) => set("ordem", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="foco">
            Foco da imagem <small>ex.: 50% 50%, 20% 80%</small>
          </label>
          <input id="foco" value={form.foco} onChange={(e) => set("foco", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="data_inicio">Início da veiculação</label>
          <input id="data_inicio" type="date" value={form.data_inicio} onChange={(e) => set("data_inicio", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="data_fim">Fim da veiculação</label>
          <input id="data_fim" type="date" value={form.data_fim} onChange={(e) => set("data_fim", e.target.value)} />
        </div>
        <div className="field field-full">
          <label>
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => set("ativo", e.target.checked)}
              style={{ width: "auto" }}
            />{" "}
            Banner ativo
          </label>
        </div>
        <div className="field field-full">
          <label htmlFor="img_desktop">
            Imagem desktop (wide) <small style={{ color: "#2e9c41", fontWeight: 700 }}>· Proporção recomendada: 1920 × 600 px (panorâmica)</small>
          </label>
          <div className="file-field">
            {desktopPreview && <img src={img(desktopPreview)} alt="" className="thumb" style={{ width: 260, height: 120 }} />}
            <input id="img_desktop" type="file" accept="image/*" onChange={(e) => handleImage("desktop", e.target.files?.[0] ?? null)} />
            <div className="hint" style={{ marginTop: 6, fontSize: 12, color: "#888" }}>
              Resolução ideal: <strong>1920 × 600 px</strong> (ou proporção ~3:1). Mantenha o conteúdo principal e textos no terço central.
            </div>
          </div>
        </div>
        <div className="field field-full">
          <label htmlFor="img_mobile">
            Imagem mobile (vertical) <small style={{ color: "#2e9c41", fontWeight: 700 }}>· Proporção recomendada: 1080 × 1350 px ou 1080 × 1080 px</small>
          </label>
          <div className="file-field">
            {mobilePreview && <img src={img(mobilePreview)} alt="" className="thumb" />}
            <input id="img_mobile" type="file" accept="image/*" onChange={(e) => handleImage("mobile", e.target.files?.[0] ?? null)} />
            <div className="hint" style={{ marginTop: 6, fontSize: 12, color: "#888" }}>
              Resolução ideal: <strong>1080 × 1350 px</strong> (proporção 4:5 vertical) ou <strong>1080 × 1080 px</strong> (quadrada).
            </div>
          </div>
        </div>
        <div className="field field-full">
          <label htmlFor="imagem_alt">Texto alternativo das imagens</label>
          <input id="imagem_alt" value={form.imagem_alt} onChange={(e) => set("imagem_alt", e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Salvando…" : "Salvar banner"}
        </button>
        <Link href="/admin/banners" className="btn">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
