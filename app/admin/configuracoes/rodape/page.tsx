"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "@/lib/admin-client";
import { associationConfig, developerCredit } from "@/lib/association-config";

export default function AdminConfiguracoesRodape() {
  const [data, setData] = useState({
    shortDescription: associationConfig.description,
    copyrightName: associationConfig.institutionalName,
    developerName: developerCredit.name,
    developerUrl: developerCredit.url,
    developerVisible: developerCredit.visible,
  });

  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getAdminClient();
    client
      .from("site_settings")
      .select("valor")
      .eq("chave", "config_rodape")
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
        .upsert({ chave: "config_rodape", valor: data, updated_by: userId });
      if (error) throw new Error(error.message);
      setMessage({ type: "success", text: "Configurações do rodapé salvas com sucesso." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Carregando configurações do rodapé…</div>;

  return (
    <form className="admin-form" onSubmit={handleSave}>
      <div className="admin-topbar">
        <div>
          <h1>Configurações do Rodapé</h1>
          <p>Personalize os textos institucionais e o crédito do desenvolvedor no rodapé.</p>
        </div>
      </div>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <h2 className="admin-section-title">Texto Institucional Curto</h2>
      <div className="admin-form-grid">
        <div className="field field-full">
          <label htmlFor="shortDescription">Descrição Curta (exibida na 1ª coluna do rodapé)</label>
          <textarea
            id="shortDescription"
            rows={3}
            value={data.shortDescription}
            onChange={(e) => setData({ ...data, shortDescription: e.target.value })}
            required
          />
        </div>
      </div>

      <h2 className="admin-section-title">Crédito do Desenvolvedor (NorthWay)</h2>
      <div className="admin-form-grid">
        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={data.developerVisible}
              onChange={(e) => setData({ ...data, developerVisible: e.target.checked })}
              style={{ width: "auto" }}
            />{" "}
            Exibir crédito do desenvolvedor no rodapé
          </label>
        </div>
        <div className="field">
          <label htmlFor="developerName">Nome do Desenvolvedor</label>
          <input
            id="developerName"
            value={data.developerName}
            onChange={(e) => setData({ ...data, developerName: e.target.value })}
          />
        </div>
        <div className="field field-full">
          <label htmlFor="developerUrl">URL do Desenvolvedor (Opcional)</label>
          <input
            id="developerUrl"
            type="url"
            value={data.developerUrl}
            onChange={(e) => setData({ ...data, developerUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Salvando…" : "Salvar Configurações do Rodapé"}
        </button>
      </div>
    </form>
  );
}
