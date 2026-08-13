"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "@/lib/admin-client";
import { associationConfig } from "@/lib/association-config";

export default function AdminConfiguracoesRedesSociais() {
  const [data, setData] = useState({
    instagram: associationConfig.social.instagram,
    youtube: associationConfig.social.youtube,
    facebook: associationConfig.social.facebook,
  });

  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getAdminClient();
    client
      .from("site_settings")
      .select("valor")
      .eq("chave", "redes_sociais")
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
        .upsert({ chave: "redes_sociais", valor: data, updated_by: userId });
      if (error) throw new Error(error.message);
      setMessage({ type: "success", text: "Links das redes sociais salvos com sucesso." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Carregando redes sociais…</div>;

  return (
    <form className="admin-form" onSubmit={handleSave}>
      <div className="admin-topbar">
        <div>
          <h1>Configurações — Redes Sociais</h1>
          <p>Links oficiais de redes sociais exibidos no cabeçalho, rodapé e páginas institucionais.</p>
        </div>
      </div>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <h2 className="admin-section-title">Perfis Oficiais</h2>
      <div className="admin-form-grid">
        <div className="field field-full">
          <label htmlFor="instagram">Instagram URL</label>
          <input
            id="instagram"
            type="url"
            value={data.instagram}
            onChange={(e) => setData({ ...data, instagram: e.target.value })}
            placeholder="https://instagram.com/saftalisma"
          />
        </div>
        <div className="field field-full">
          <label htmlFor="youtube">YouTube URL</label>
          <input
            id="youtube"
            type="url"
            value={data.youtube}
            onChange={(e) => setData({ ...data, youtube: e.target.value })}
            placeholder="https://youtube.com/@saftalisma"
          />
        </div>
        <div className="field field-full">
          <label htmlFor="facebook">Facebook URL (Opcional)</label>
          <input
            id="facebook"
            type="url"
            value={data.facebook}
            onChange={(e) => setData({ ...data, facebook: e.target.value })}
            placeholder="https://facebook.com/..."
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Salvando…" : "Salvar Redes Sociais"}
        </button>
      </div>
    </form>
  );
}
