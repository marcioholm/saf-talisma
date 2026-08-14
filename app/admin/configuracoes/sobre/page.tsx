"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "@/lib/admin-client";
import { associationConfig } from "@/lib/association-config";

export default function AdminConfiguracoesSobre() {
  const [data, setData] = useState({
    title: "Sobre a Associação",
    presentation: "A Associação Esportiva SAF/Talismã atua por meio do esporte, da formação e do desenvolvimento de atletas. Sediada em Arapoti, nos Campos Gerais do Paraná, a Associação desenvolve projetos, participa de competições e promove iniciativas que fortalecem o esporte e a comunidade.",
    missao: "Promover o esporte e a formação integral de atletas através de disciplina, respeito e desenvolvimento comunitário.",
    visao: "Ser referência regional e estadual em formação esportiva e cidadania nos Campos Gerais do Paraná.",
    valores: "Respeito, Disciplina, Ética, Trabalho em equipe, Dedicação",
    sportsLocationName: associationConfig.sportsLocation.name,
    sportsLocationStreet: associationConfig.sportsLocation.street,
    sportsLocationNumber: associationConfig.sportsLocation.number,
    sportsLocationCity: associationConfig.sportsLocation.city,
    sportsLocationState: associationConfig.sportsLocation.state,
    sportsLocationPostalCode: associationConfig.sportsLocation.postalCode,
    mapEmbedUrl: associationConfig.sportsLocation.mapEmbedUrl,
    mapRouteUrl: associationConfig.sportsLocation.mapRouteUrl,
  });

  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getAdminClient();
    client
      .from("site_settings")
      .select("valor")
      .eq("chave", "config_sobre")
      .maybeSingle()
      .then(({ data: row }: { data: { valor: unknown } | null }) => {
        if (row?.valor && typeof row.valor === "object") {
          setData((prev) => ({ ...prev, ...(row.valor as object) }));
        }
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const client = getAdminClient();
      const { data: session } = await client.auth.getSession();
      const userId = session.session?.user.id;
      const { error } = await client
        .from("site_settings")
        .upsert(
          { chave: "config_sobre", valor: data, updated_by: userId },
          { onConflict: "chave" }
        );
      if (error) throw new Error(error.message);
      setMessage({ type: "success", text: "Configurações da página Sobre salvas com sucesso." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Carregando configurações da página Sobre…</div>;

  return (
    <form className="admin-form" onSubmit={handleSave}>
      <div className="admin-topbar">
        <div>
          <h1>Configurações — Página "Sobre nós"</h1>
          <p>Edite os textos de apresentação, Missão, Visão, Valores e o local esportivo (Ginásio Chapelão).</p>
        </div>
      </div>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <h2 className="admin-section-title">Apresentação Institucional</h2>
      <div className="admin-form-grid">
        <div className="field field-full">
          <label htmlFor="presentation">Texto de Apresentação</label>
          <textarea
            id="presentation"
            rows={4}
            value={data.presentation}
            onChange={(e) => setData({ ...data, presentation: e.target.value })}
            required
          />
        </div>
      </div>

      <h2 className="admin-section-title">Missão, Visão e Valores</h2>
      <div className="admin-form-grid">
        <div className="field field-full">
          <label htmlFor="missao">Missão</label>
          <textarea
            id="missao"
            rows={2}
            value={data.missao}
            onChange={(e) => setData({ ...data, missao: e.target.value })}
          />
        </div>
        <div className="field field-full">
          <label htmlFor="visao">Visão</label>
          <textarea
            id="visao"
            rows={2}
            value={data.visao}
            onChange={(e) => setData({ ...data, visao: e.target.value })}
          />
        </div>
        <div className="field field-full">
          <label htmlFor="valores">Valores (separados por vírgula)</label>
          <input
            id="valores"
            value={data.valores}
            onChange={(e) => setData({ ...data, valores: e.target.value })}
          />
        </div>
      </div>

      <h2 className="admin-section-title">Local das Atividades Esportivas (Ginásio Chapelão)</h2>
      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="sportsLocationName">Nome do Ginásio / Local</label>
          <input
            id="sportsLocationName"
            value={data.sportsLocationName}
            onChange={(e) => setData({ ...data, sportsLocationName: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="sportsLocationStreet">Rua / Logradouro</label>
          <input
            id="sportsLocationStreet"
            value={data.sportsLocationStreet}
            onChange={(e) => setData({ ...data, sportsLocationStreet: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="sportsLocationNumber">Número</label>
          <input
            id="sportsLocationNumber"
            value={data.sportsLocationNumber}
            onChange={(e) => setData({ ...data, sportsLocationNumber: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="sportsLocationPostalCode">CEP</label>
          <input
            id="sportsLocationPostalCode"
            value={data.sportsLocationPostalCode}
            onChange={(e) => setData({ ...data, sportsLocationPostalCode: e.target.value })}
          />
        </div>
        <div className="field field-full">
          <label htmlFor="mapEmbedUrl">URL de Incorporação do Google Maps (iframe)</label>
          <input
            id="mapEmbedUrl"
            value={data.mapEmbedUrl}
            onChange={(e) => setData({ ...data, mapEmbedUrl: e.target.value })}
          />
        </div>
        <div className="field field-full">
          <label htmlFor="mapRouteUrl">URL de Rota ("Como chegar")</label>
          <input
            id="mapRouteUrl"
            value={data.mapRouteUrl}
            onChange={(e) => setData({ ...data, mapRouteUrl: e.target.value })}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Salvando…" : "Salvar Configurações da Página Sobre"}
        </button>
      </div>
    </form>
  );
}
