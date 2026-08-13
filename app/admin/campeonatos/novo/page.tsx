"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminClient, slugify, uploadFile } from "@/lib/admin-client";

export default function AdminNovoCampeonatoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "Adulto",
    modality: "Futsal",
    location_name: "Ginásio de Esportes Chapelão",
    city: "Arapoti",
    state: "PR",
    short_description: "",
    full_description: "",
    rules_text: "",
    max_teams: 16,
    min_athletes_per_team: 5,
    max_athletes_per_team: 15,
    max_staff_per_team: 3,
    min_age: 16,
    max_age: 99,
    support_contact: "(41) 99754-4010",
    featured_home: false,
    visibility: "published" as "draft" | "published" | "hidden" | "archived",
    registration_status: "open" as "scheduled" | "open" | "paused" | "closed",
    start_date: "",
    end_date: "",
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugify(name),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const client = getAdminClient();
      let bannerPath = null;

      if (bannerFile) {
        bannerPath = await uploadFile(client, "covers", bannerFile, "championships");
      }

      const payload = {
        ...form,
        banner_path: bannerPath,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await client.from("championships").insert([payload]).select("id").single();
      if (error) throw error;

      setMessage({ type: "success", text: "Campeonato criado com sucesso!" });
      setTimeout(() => {
        router.push(`/admin/campeonatos/${data.id}`);
      }, 1000);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao criar campeonato." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div>
          <h1>Novo Campeonato</h1>
          <p>Preencha os dados do campeonato ou torneio da Associação.</p>
        </div>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2 className="admin-section-title">Informações Principais</h2>
        <div className="admin-form-grid">
          <div className="field field-full">
            <label htmlFor="name">Nome do Campeonato / Torneio</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: 1ª Copa SAF Talismã de Futsal Adulto"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="slug">Slug (URL amigável)</label>
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
              placeholder="Adulto, Sub-15, Feminino..."
              required
            />
          </div>
          <div className="field">
            <label htmlFor="modality">Modalidade</label>
            <input
              id="modality"
              value={form.modality}
              onChange={(e) => setForm({ ...form, modality: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="location_name">Local dos Jogos</label>
            <input
              id="location_name"
              value={form.location_name}
              onChange={(e) => setForm({ ...form, location_name: e.target.value })}
            />
          </div>
        </div>

        <h2 className="admin-section-title">Regras e Limites de Vagas</h2>
        <div className="admin-form-grid">
          <div className="field">
            <label htmlFor="max_teams">Limite de Equipes</label>
            <input
              id="max_teams"
              type="number"
              min={2}
              value={form.max_teams}
              onChange={(e) => setForm({ ...form, max_teams: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="min_athletes_per_team">Mínimo de Atletas por Equipe</label>
            <input
              id="min_athletes_per_team"
              type="number"
              min={1}
              value={form.min_athletes_per_team}
              onChange={(e) => setForm({ ...form, min_athletes_per_team: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="max_athletes_per_team">Máximo de Atletas por Equipe</label>
            <input
              id="max_athletes_per_team"
              type="number"
              min={1}
              value={form.max_athletes_per_team}
              onChange={(e) => setForm({ ...form, max_athletes_per_team: Number(e.target.value) })}
            />
          </div>
          <div className="field">
            <label htmlFor="max_staff_per_team">Limite de Comissão Técnica</label>
            <input
              id="max_staff_per_team"
              type="number"
              min={0}
              value={form.max_staff_per_team}
              onChange={(e) => setForm({ ...form, max_staff_per_team: Number(e.target.value) })}
            />
          </div>
        </div>

        <h2 className="admin-section-title">Descrições e Regulamento</h2>
        <div className="admin-form-grid">
          <div className="field field-full">
            <label htmlFor="short_description">Descrição Curta (Resumo)</label>
            <textarea
              id="short_description"
              rows={2}
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value })}
            />
          </div>
          <div className="field field-full">
            <label htmlFor="full_description">Descrição Completa</label>
            <textarea
              id="full_description"
              rows={4}
              value={form.full_description}
              onChange={(e) => setForm({ ...form, full_description: e.target.value })}
            />
          </div>
          <div className="field field-full">
            <label htmlFor="rules_text">Regulamento do Campeonato</label>
            <textarea
              id="rules_text"
              rows={6}
              value={form.rules_text}
              onChange={(e) => setForm({ ...form, rules_text: e.target.value })}
              placeholder="Insira as regras, critérios de pontuação e penalidades..."
            />
          </div>
          <div className="field">
            <label htmlFor="banner">Banner Promocional</label>
            <input
              id="banner"
              type="file"
              accept="image/*"
              onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-magenta" disabled={saving}>
            {saving ? "Criando…" : "Salvar e Criar Campeonato"}
          </button>
        </div>
      </form>
    </div>
  );
}
