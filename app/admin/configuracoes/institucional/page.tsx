"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "@/lib/admin-client";
import { associationConfig } from "@/lib/association-config";

export default function AdminConfiguracoesInstitucional() {
  const [data, setData] = useState({
    legalName: associationConfig.legalName,
    institutionalName: associationConfig.institutionalName,
    shortName: associationConfig.shortName,
    displayName: associationConfig.displayName,
    cnpj: associationConfig.cnpj,
    phone: associationConfig.phone,
    phoneRaw: associationConfig.phoneRaw,
    email: associationConfig.email,
    operationalEmail: associationConfig.operationalEmail,
    region: associationConfig.region,
    legalAddress: associationConfig.legalAddress,
    sportsLocation: associationConfig.sportsLocation,
  });

  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getAdminClient();
    client
      .from("site_settings")
      .select("valor")
      .eq("chave", "config_institucional")
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
          { chave: "config_institucional", valor: data, updated_by: userId },
          { onConflict: "chave" }
        );
      if (error) throw new Error(error.message);
      setMessage({ type: "success", text: "Dados institucionais salvos com sucesso." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Carregando dados institucionais…</div>;

  return (
    <form className="admin-form" onSubmit={handleSave}>
      <div className="admin-topbar">
        <div>
          <h1>Configurações Institucionais</h1>
          <p>Gerencie o nome legal, CNPJ, contatos oficiais e endereços da Associação.</p>
        </div>
      </div>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <h2 className="admin-section-title">Identificação Oficial</h2>
      <div className="admin-form-grid">
        <div className="field field-full">
          <label htmlFor="legalName">Razão Social / Nome Legal (em maiúsculas)</label>
          <input
            id="legalName"
            value={data.legalName}
            onChange={(e) => setData({ ...data, legalName: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="institutionalName">Nome Institucional Completo</label>
          <input
            id="institutionalName"
            value={data.institutionalName}
            onChange={(e) => setData({ ...data, institutionalName: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="shortName">Nome Reduzido / Sigla</label>
          <input
            id="shortName"
            value={data.shortName}
            onChange={(e) => setData({ ...data, shortName: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="cnpj">CNPJ</label>
          <input
            id="cnpj"
            value={data.cnpj}
            onChange={(e) => setData({ ...data, cnpj: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="region">Região de Atuação</label>
          <input
            id="region"
            value={data.region}
            onChange={(e) => setData({ ...data, region: e.target.value })}
          />
        </div>
      </div>

      <h2 className="admin-section-title">Contatos Oficiais</h2>
      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="email">E-mail Institucional Público</label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="operationalEmail">E-mail Operacional Interno (Alertas)</label>
          <input
            id="operationalEmail"
            type="email"
            value={data.operationalEmail}
            onChange={(e) => setData({ ...data, operationalEmail: e.target.value })}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="phone">Telefone / WhatsApp (Formatado)</label>
          <input
            id="phone"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="phoneRaw">Telefone (Somente Números)</label>
          <input
            id="phoneRaw"
            value={data.phoneRaw}
            onChange={(e) => setData({ ...data, phoneRaw: e.target.value })}
          />
        </div>
      </div>

      <h2 className="admin-section-title">Endereço Legal</h2>
      <div className="admin-form-grid">
        <div className="field field-full">
          <label htmlFor="legalStreet">Logradouro / Rua</label>
          <input
            id="legalStreet"
            value={data.legalAddress.street}
            onChange={(e) => setData({ ...data, legalAddress: { ...data.legalAddress, street: e.target.value } })}
          />
        </div>
        <div className="field">
          <label htmlFor="legalNumber">Número</label>
          <input
            id="legalNumber"
            value={data.legalAddress.number}
            onChange={(e) => setData({ ...data, legalAddress: { ...data.legalAddress, number: e.target.value } })}
          />
        </div>
        <div className="field">
          <label htmlFor="legalCity">Cidade / Estado</label>
          <input
            id="legalCity"
            value={`${data.legalAddress.city} - ${data.legalAddress.state}`}
            onChange={(e) => {
              const [city, state] = e.target.value.split("-").map((s) => s.trim());
              setData({ ...data, legalAddress: { ...data.legalAddress, city: city || "", state: state || "PR" } });
            }}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Salvando…" : "Salvar Configurações Institucionais"}
        </button>
      </div>
    </form>
  );
}
