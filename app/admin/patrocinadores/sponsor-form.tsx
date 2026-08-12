"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminClient, uploadFile } from "../../../lib/admin-client";
import Link from "next/link";

type Category = { id: string; nome: string };

type FormState = {
  nome: string;
  website: string;
  descricao: string;
  categoria_id: string;
  ordem: string;
  destaque: boolean;
  ativo: boolean;
};

const EMPTY: FormState = {
  nome: "",
  website: "",
  descricao: "",
  categoria_id: "",
  ordem: "0",
  destaque: false,
  ativo: true,
};

export default function SponsorForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [logoPath, setLogoPath] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const isEdit = Boolean(id);

  useEffect(() => {
    const client = getAdminClient();
    client.from("sponsor_categories").select("id, nome").order("ordem").then(({ data, error }) => {
      if (!error) setCategories((data ?? []) as Category[]);
    });
    if (id) {
      client
        .from("sponsors")
        .select("*")
        .eq("id", id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            setMessage({ type: "error", text: "Patrocinador não encontrado." });
            setLoading(false);
            return;
          }
          setForm({
            nome: data.nome ?? "",
            website: data.website ?? "",
            descricao: data.descricao ?? "",
            categoria_id: data.categoria_id ?? "",
            ordem: String(data.ordem ?? 0),
            destaque: data.destaque ?? false,
            ativo: data.ativo ?? true,
          });
          setLogoPath(data.logo_url ?? "");
          setLogoPreview(data.logo_url ?? "");
          setLoading(false);
        });
    }
  }, [id]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleLogo(file: File | null) {
    if (!file) return;
    try {
      const path = await uploadFile(getAdminClient(), "sponsors", file, "logos");
      setLogoPath(path);
      setLogoPreview(path);
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
        nome: form.nome.trim(),
        website: form.website.trim() || null,
        descricao: form.descricao.trim() || null,
        categoria_id: form.categoria_id || null,
        ordem: Number(form.ordem) || 0,
        destaque: form.destaque,
        ativo: form.ativo,
        logo_url: logoPath,
      };
      if (!payload.nome) throw new Error("Informe o nome.");
      if (!payload.logo_url) throw new Error("Envie a logo.");
      const { error } = isEdit
        ? await client.from("sponsors").update(payload).eq("id", id)
        : await client.from("sponsors").insert(payload);
      if (error) throw new Error(error.message);
      setMessage({ type: "success", text: "Patrocinador salvo." });
      router.push("/admin/patrocinadores");
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Carregando…</div>;

  return (
    <form className="admin-form" onSubmit={handleSave}>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="nome">Nome</label>
          <input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="categoria_id">Categoria</label>
          <select id="categoria_id" value={form.categoria_id} onChange={(e) => set("categoria_id", e.target.value)}>
            <option value="">— Nenhuma —</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="website">Site</label>
          <input id="website" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />
        </div>
        <div className="field">
          <label htmlFor="ordem">Ordem</label>
          <input id="ordem" type="number" value={form.ordem} onChange={(e) => set("ordem", e.target.value)} />
        </div>
        <div className="field field-full">
          <label htmlFor="descricao">Descrição</label>
          <textarea id="descricao" value={form.descricao} onChange={(e) => set("descricao", e.target.value)} />
        </div>
        <div className="field field-full">
          <label htmlFor="logo">Logo</label>
          <div className="file-field">
            {logoPreview && (
              <img
                src={logoPreview.startsWith("http") ? logoPreview : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${logoPreview}`}
                alt=""
                className="thumb-thumb"
              />
            )}
            <input id="logo" type="file" accept="image/*" onChange={(e) => handleLogo(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <div className="field field-full">
          <label>
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(e) => set("destaque", e.target.checked)}
              style={{ width: "auto" }}
            />{" "}
            Destaque
          </label>
        </div>
        <div className="field field-full">
          <label>
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => set("ativo", e.target.checked)}
              style={{ width: "auto" }}
            />{" "}
            Ativo
          </label>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Salvando…" : "Salvar patrocinador"}
        </button>
        <Link href="/admin/patrocinadores" className="btn">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
