"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAdminClient,
  slugify,
  toIsoLocal,
  uploadFile,
  STATUS_LABEL,
  type Status,
} from "../../../lib/admin-client";

type Category = { id: string; nome: string };

type FormState = {
  titulo: string;
  slug: string;
  resumo: string;
  subtitulo: string;
  conteudo: string;
  status: Status;
  destaque: boolean;
  categoria_id: string;
  autor: string;
  cover_alt: string;
  video_url: string;
  gallery: string;
  scheduled_at: string;
};

const EMPTY: FormState = {
  titulo: "",
  slug: "",
  resumo: "",
  subtitulo: "",
  conteudo: "",
  status: "draft",
  destaque: false,
  categoria_id: "",
  autor: "",
  cover_alt: "",
  video_url: "",
  gallery: "[]",
  scheduled_at: "",
};

function toLocalInput(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function PostForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coverPath, setCoverPath] = useState("");
  const [currentCover, setCurrentCover] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const isEdit = Boolean(id);
  const initialStatusRef = useRef<Status>("draft");

  useEffect(() => {
    const client = getAdminClient();
    client
      .from("post_categories")
      .select("id, nome")
      .order("ordem")
      .then(({ data, error }) => {
        if (!error) setCategories((data ?? []) as Category[]);
      });
    if (id) {
      client
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            setMessage({ type: "error", text: "Notícia não encontrada." });
            setLoading(false);
            return;
          }
          setForm({
            titulo: data.titulo ?? "",
            slug: data.slug ?? "",
            resumo: data.resumo ?? "",
            subtitulo: data.subtitulo ?? "",
            conteudo: data.conteudo ?? "",
            status: data.status ?? "draft",
            destaque: data.destaque ?? false,
            categoria_id: data.categoria_id ?? "",
            autor: data.autor ?? "",
            cover_alt: data.cover_alt ?? "",
            video_url: data.video_url ?? "",
            gallery: JSON.stringify(data.gallery ?? [], null, 2),
            scheduled_at: toLocalInput(data.scheduled_at),
          });
          initialStatusRef.current = data.status ?? "draft";
          setCurrentCover(data.imagem_url ?? "");
          setCoverPath(data.imagem_url ?? "");
          setLoading(false);
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

      let gallery: unknown = [];
      try {
        gallery = JSON.parse(form.gallery || "[]");
      } catch {
        throw new Error("Galeria: JSON inválido.");
      }

      const slug = form.slug || slugify(form.titulo);
      if (!slug) throw new Error("Informe um título ou slug.");

      let publishedAt: string | null = null;
      if (form.status === "published") {
        publishedAt = toIsoLocal(new Date().toISOString());
      }

      const payload = {
        titulo: form.titulo.trim(),
        slug,
        resumo: form.resumo.trim() || null,
        subtitulo: form.subtitulo.trim() || null,
        conteudo: form.conteudo,
        status: form.status,
        destaque: form.destaque,
        categoria_id: form.categoria_id || null,
        autor: form.autor.trim() || null,
        cover_alt: form.cover_alt.trim() || null,
        video_url: form.video_url.trim() || null,
        gallery,
        imagem_url: coverPath || null,
        scheduled_at: form.status === "scheduled" ? toIsoLocal(form.scheduled_at) : null,
        published_at:
          form.status === "published"
            ? publishedAt
            : form.status === "scheduled"
              ? null
              : undefined,
        updated_by: userId,
      };

      const { error, data: saved } = isEdit
        ? await client.from("posts").update(payload).eq("id", id).select("id").single()
        : await client
            .from("posts")
            .insert({ ...payload, author_user_id: userId })
            .select("id")
            .single();

      if (error) throw new Error(error.message);

      const savedId = isEdit ? id : saved?.id;
      if (form.status === "published" && initialStatusRef.current !== "published" && savedId) {
        fetch("/api/newsletter/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: savedId }),
        }).catch(() => {});
      }

      setMessage({ type: "success", text: "Notícia salva." });
      router.push("/admin/noticias");
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  async function handleCover(file: File | null) {
    if (!file) return;
    try {
      const path = await uploadFile(getAdminClient(), "covers", file, "posts");
      setCoverPath(path);
      setCurrentCover(path);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload falhou." });
    }
  }

  if (loading) return <div className="empty-state">Carregando…</div>;

  return (
    <form className="admin-form" onSubmit={handleSave}>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="admin-form-grid">
        <div className="field field-full">
          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            value={form.titulo}
            onChange={(e) => {
              set("titulo", e.target.value);
              if (!form.slug) set("slug", slugify(e.target.value));
            }}
            required
          />
        </div>
        <div className="field field-full">
          <label htmlFor="slug">
            Slug <small>URL: /noticias/{form.slug || "…"}</small>
          </label>
          <input id="slug" value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
        </div>
        <div className="field field-full">
          <label htmlFor="resumo">Resumo</label>
          <textarea id="resumo" value={form.resumo} onChange={(e) => set("resumo", e.target.value)} />
        </div>
        <div className="field field-full">
          <label htmlFor="subtitulo">Subtítulo</label>
          <input id="subtitulo" value={form.subtitulo} onChange={(e) => set("subtitulo", e.target.value)} />
        </div>
        <div className="field field-full">
          <label htmlFor="conteudo">Conteúdo</label>
          <textarea
            id="conteudo"
            className="textarea-tall"
            value={form.conteudo}
            onChange={(e) => set("conteudo", e.target.value)}
            placeholder="Texto da notícia…"
          />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={form.status} onChange={(e) => set("status", e.target.value as Status)}>
            {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="categoria_id">Categoria</label>
          <select id="categoria_id" value={form.categoria_id} onChange={(e) => set("categoria_id", e.target.value)}>
            <option value="">— Sem categoria —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="autor">Autor (exibido)</label>
          <input id="autor" value={form.autor} onChange={(e) => set("autor", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="scheduled_at">Agendar publicação</label>
          <input
            id="scheduled_at"
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => set("scheduled_at", e.target.value)}
          />
        </div>
        <div className="field field-full">
          <label>
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(e) => set("destaque", e.target.checked)}
              style={{ width: "auto" }}
            />{" "}
            Notícia em destaque na home
          </label>
        </div>
        <div className="field field-full">
          <label htmlFor="cover">Imagem de capa</label>
          <div className="file-field">
            {currentCover && <img src={currentCover.startsWith("http") ? currentCover : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${currentCover}`} alt="" className="thumb" />}
            <input
              id="cover"
              type="file"
              accept="image/*"
              onChange={(e) => handleCover(e.target.files?.[0] ?? null)}
            />
            <div className="hint mono">{coverPath || "Nenhuma imagem enviada."}</div>
          </div>
        </div>
        <div className="field">
          <label htmlFor="cover_alt">Texto alternativo da capa</label>
          <input id="cover_alt" value={form.cover_alt} onChange={(e) => set("cover_alt", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="video_url">URL de vídeo</label>
          <input id="video_url" value={form.video_url} onChange={(e) => set("video_url", e.target.value)} />
        </div>
        <div className="field field-full">
          <label htmlFor="gallery">
            Galeria <small>JSON: [{"\"covers/foto1.jpg\""}, {"\"covers/foto2.jpg\""}]</small>
          </label>
          <textarea
            id="gallery"
            className="mono"
            style={{ minHeight: 90 }}
            value={form.gallery}
            onChange={(e) => set("gallery", e.target.value)}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Salvando…" : "Salvar notícia"}
        </button>
        <Link href="/admin/noticias" className="btn">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
