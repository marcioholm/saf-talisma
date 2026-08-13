"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminClient, uploadFile } from "@/lib/admin-client";
import { associationConfig } from "@/lib/association-config";
import { publicFileUrl } from "@/lib/supabase";

export default function AdminEditarCampeonatoPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    modality: "Futsal",
    location_name: "",
    city: "",
    state: "PR",
    short_description: "",
    full_description: "",
    rules_text: "",
    banner_path: null as string | null,
    max_teams: 16,
    min_athletes_per_team: 5,
    max_athletes_per_team: 15,
    max_staff_per_team: 3,
    min_age: 16,
    max_age: 99,
    support_contact: "",
    featured_home: false,
    visibility: "published" as "draft" | "published" | "hidden" | "archived",
    registration_status: "open" as "scheduled" | "open" | "paused" | "closed",
    start_date: "",
    end_date: "",
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) loadChampionship();
  }, [id]);

  async function loadChampionship() {
    setLoading(true);
    const client = getAdminClient();
    const { data, error } = await client
      .from("championships")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setMessage({ type: "error", text: "Campeonato não encontrado." });
    } else if (data) {
      setForm({
        name: data.name || "",
        slug: data.slug || "",
        category: data.category || "",
        modality: data.modality || "Futsal",
        location_name: data.location_name || "",
        city: data.city || "",
        state: data.state || "PR",
        short_description: data.short_description || "",
        full_description: data.full_description || "",
        rules_text: data.rules_text || "",
        banner_path: data.banner_path || null,
        max_teams: data.max_teams || 16,
        min_athletes_per_team: data.min_athletes_per_team || 5,
        max_athletes_per_team: data.max_athletes_per_team || 15,
        max_staff_per_team: data.max_staff_per_team || 3,
        min_age: data.min_age || 16,
        max_age: data.max_age || 99,
        support_contact: data.support_contact || "",
        featured_home: data.featured_home || false,
        visibility: data.visibility || "published",
        registration_status: data.registration_status || "open",
        start_date: data.start_date || "",
        end_date: data.end_date || "",
      });
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const client = getAdminClient();
      let bannerPath = form.banner_path;

      if (bannerFile) {
        bannerPath = await uploadFile(client, "covers", bannerFile, "championships");
      }

      const payload = {
        ...form,
        banner_path: bannerPath,
        updated_at: new Date().toISOString(),
      };

      const { error } = await client
        .from("championships")
        .update(payload)
        .eq("id", id);

      if (error) throw error;

      setMessage({ type: "success", text: "Campeonato atualizado com sucesso!" });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao atualizar campeonato." });
    } finally {
      setSaving(false);
    }
  }

  function handleCopyPublicLink() {
    const publicUrl = `${associationConfig.url}/campeonatos/${form.slug}`;
    navigator.clipboard.writeText(publicUrl);
    alert(`Link público copiado: ${publicUrl}`);
  }

  if (loading) return <div className="empty-state">Carregando detalhes do campeonato…</div>;

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div>
          <h1>Editar Campeonato</h1>
          <p>Altere visibilidade, regras, limites de equipes e consulte a página pública.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn btn-outline" onClick={handleCopyPublicLink}>
            🔗 Copiar Link Público
          </button>
        </div>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2 className="admin-section-title">Controle de Status e Visibilidade</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="visibility">Visibilidade da Página</label>
            <select
              id="visibility"
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value as any })}
            >
              <option value="draft">Rascunho (Privado)</option>
              <option value="published">Publicado (Público no site)</option>
              <option value="hidden">Oculto (Acessível via link direto)</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="registration_status">Status das Inscrições</label>
            <select
              id="registration_status"
              value={form.registration_status}
              onChange={(e) => setForm({ ...form, registration_status: e.target.value as any })}
            >
              <option value="scheduled">Em breve</option>
              <option value="open">Inscrições Abertas</option>
              <option value="paused">Inscrições Pausadas</option>
              <option value="closed">Inscrições Encerradas</option>
            </select>
          </div>
          <div className="field">
            <label>
              <input
                type="checkbox"
                checked={form.featured_home}
                onChange={(e) => setForm({ ...form, featured_home: e.target.checked })}
                style={{ width: "auto" }}
              />{" "}
              Destacar na Página Inicial
            </label>
          </div>
        </div>

        <h2 className="admin-section-title">Informações Gerais</h2>
        <div className="admin-form-grid">
          <div className="field field-full">
            <label htmlFor="name">Nome do Campeonato</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="slug">Slug URL</label>
            <input
              id="slug"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="category">Categoria</label>
            <input
              id="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="max_teams">Limite de Vagas (Equipes)</label>
            <input
              id="max_teams"
              type="number"
              value={form.max_teams}
              onChange={(e) => setForm({ ...form, max_teams: Number(e.target.value) })}
            />
          </div>
        </div>

        <h2 className="admin-section-title">Regulamento e Banner</h2>
        <div className="admin-form-grid">
          <div className="field field-full">
            <label htmlFor="rules_text">Regulamento</label>
            <textarea
              id="rules_text"
              rows={6}
              value={form.rules_text}
              onChange={(e) => setForm({ ...form, rules_text: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="banner">Alterar Banner</label>
            <input
              id="banner"
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
            />
            {form.banner_path && (
              <div style={{ marginTop: 8 }}>
                <img src={publicFileUrl(form.banner_path)} alt="Banner atual" style={{ height: 60, borderRadius: 4 }} />
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-magenta" disabled={saving}>
            {saving ? "Salvando…" : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
