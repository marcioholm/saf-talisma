"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "../../../lib/admin-client";
import {
  DEFAULT_HOME_DESTAQUE,
  DEFAULT_HOME_EVENTO,
  mergeDestaque,
  mergeEvento,
  type HomeDestaque,
  type HomeEvento,
} from "../../../lib/home-content";
import { associationConfig } from "../../../lib/association-config";

type Settings = {
  contatos: { email: string; telefone: string; endereco: string; cidade: string; estado: string };
  redes_sociais: { instagram: string; facebook: string; whatsapp: string; youtube: string };
  email_config: { from: string };
  home_destaque: HomeDestaque;
  home_evento: HomeEvento;
};

type Stats = { id: string; atletas_ativos: number; categorias: number; anos_atuacao: number; premios: number };

const EMPTY_SETTINGS: Settings = {
  contatos: { email: "", telefone: "", endereco: "", cidade: "", estado: "" },
  redes_sociais: { instagram: "", facebook: "", whatsapp: "", youtube: "" },
  email_config: { from: "" },
  home_destaque: DEFAULT_HOME_DESTAQUE,
  home_evento: DEFAULT_HOME_EVENTO,
};

export default function AdminConfiguracoes() {
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);
  const [stats, setStats] = useState<Stats | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getAdminClient();
    (async () => {
      const { data: contatos } = await client.from("site_settings").select("valor").eq("chave", "contatos").maybeSingle();
      const { data: redes } = await client.from("site_settings").select("valor").eq("chave", "redes_sociais").maybeSingle();
      const { data: emailConfig } = await client.from("site_settings").select("valor").eq("chave", "email_config").maybeSingle();
      const { data: homeRows } = await client.from("site_settings").select("chave, valor").in("chave", ["home_destaque", "home_evento"]);
      const { data: stats } = await client.from("estatisticas").select("*").limit(1).maybeSingle();
      setSettings({
        contatos: { ...EMPTY_SETTINGS.contatos, ...(contatos?.valor as object) },
        redes_sociais: { ...EMPTY_SETTINGS.redes_sociais, ...(redes?.valor as object) },
        email_config: { ...EMPTY_SETTINGS.email_config, ...(emailConfig?.valor as object) },
        home_destaque: mergeDestaque(homeRows as Array<{ chave: string; valor: unknown }> | null),
        home_evento: mergeEvento(homeRows as Array<{ chave: string; valor: unknown }> | null),
      });
      setStats(stats as Stats | null);
      setLoading(false);
    })().catch((e: Error) => setMessage({ type: "error", text: e.message }));
  }, []);

  function setContato<K extends keyof Settings["contatos"]>(key: K, value: string) {
    setSettings((s) => ({ ...s, contatos: { ...s.contatos, [key]: value } }));
  }
  function setRede<K extends keyof Settings["redes_sociais"]>(key: K, value: string) {
    setSettings((s) => ({ ...s, redes_sociais: { ...s.redes_sociais, [key]: value } }));
  }
  function setEmailCfg<K extends keyof Settings["email_config"]>(key: K, value: string) {
    setSettings((s) => ({ ...s, email_config: { ...s.email_config, [key]: value } }));
  }
  function setDestaqueField<K extends keyof HomeDestaque>(key: K, value: HomeDestaque[K]) {
    setSettings((s) => ({ ...s, home_destaque: { ...s.home_destaque, [key]: value } }));
  }
  function setEventoField<K extends keyof HomeEvento>(key: K, value: HomeEvento[K]) {
    setSettings((s) => ({ ...s, home_evento: { ...s.home_evento, [key]: value } }));
  }
  function setStat<K extends keyof Stats>(key: K, value: number) {
    setStats((s) => (s ? { ...s, [key]: value } : s));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const client = getAdminClient();
      const { data: session } = await client.auth.getSession();
      const userId = session.session?.user.id;
      const err1 = await client.from("site_settings").upsert({ chave: "contatos", valor: settings.contatos, updated_by: userId });
      if (err1.error) throw new Error(err1.error.message);
      const err2 = await client.from("site_settings").upsert({ chave: "redes_sociais", valor: settings.redes_sociais, updated_by: userId });
      if (err2.error) throw new Error(err2.error.message);
      const err4 = await client.from("site_settings").upsert({ chave: "email_config", valor: settings.email_config, updated_by: userId });
      if (err4.error) throw new Error(err4.error.message);
      const err5 = await client.from("site_settings").upsert({ chave: "home_destaque", valor: settings.home_destaque, updated_by: userId });
      if (err5.error) throw new Error(err5.error.message);
      const err6 = await client.from("site_settings").upsert({ chave: "home_evento", valor: settings.home_evento, updated_by: userId });
      if (err6.error) throw new Error(err6.error.message);
      if (stats) {
        const err3 = await client.from("estatisticas").update({ atletas_ativos: stats.atletas_ativos, categorias: stats.categorias, anos_atuacao: stats.anos_atuacao, premios: stats.premios }).eq("id", stats.id);
        if (err3.error) throw new Error(err3.error.message);
      }
      setMessage({ type: "success", text: "Configurações salvas." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Carregando…</div>;

  return (
    <form className="admin-form" onSubmit={handleSave}>
      <div className="admin-topbar">
        <div>
          <h1>Configurações</h1>
          <p>Contatos, redes sociais e estatísticas exibidas no site.</p>
        </div>
      </div>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <h2 className="admin-section-title">Contatos</h2>
      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="email">
            E-mail de contato <small>(recebe as solicitações de parceria)</small>
          </label>
          <input id="email" type="email" value={settings.contatos.email} onChange={(e) => setContato("email", e.target.value)} placeholder={`contato@${associationConfig.domain}`} />
        </div>
        <div className="field">
          <label htmlFor="telefone">Telefone / WhatsApp</label>
          <input id="telefone" value={settings.contatos.telefone} onChange={(e) => setContato("telefone", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="cidade">Cidade</label>
          <input id="cidade" value={settings.contatos.cidade} onChange={(e) => setContato("cidade", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="estado">Estado</label>
          <input id="estado" value={settings.contatos.estado} onChange={(e) => setContato("estado", e.target.value)} />
        </div>
        <div className="field field-full">
          <label htmlFor="endereco">Endereço</label>
          <input id="endereco" value={settings.contatos.endereco} onChange={(e) => setContato("endereco", e.target.value)} />
        </div>
      </div>

      <h2 className="admin-section-title">E-mail (Resend)</h2>
      <div className="admin-form-grid">
        <div className="field field-full">
          <label htmlFor="email-from">
            Remetente dos e-mails <small>(domínio verificado no Resend)</small>
          </label>
          <input
            id="email-from"
            type="email"
            value={settings.email_config.from}
            onChange={(e) => setEmailCfg("from", e.target.value)}
            placeholder={`contato@${associationConfig.domain}`}
          />
          <p className="hint">
            Usado como remetente (from) no envio de contato e newsletter. Enquanto o domínio não for
            verificado, fica <code>onboarding@resend.dev</code>.
          </p>
        </div>
      </div>

      <h2 className="admin-section-title">Home — frase de destaque</h2>
      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="hd-eyebrow">Selo (eyebrow)</label>
          <input id="hd-eyebrow" value={settings.home_destaque.eyebrow} onChange={(e) => setDestaqueField("eyebrow", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="hd-numero">Número em destaque</label>
          <input id="hd-numero" value={settings.home_destaque.numero} onChange={(e) => setDestaqueField("numero", e.target.value)} />
        </div>
        <div className="field field-full">
          <label htmlFor="hd-titulo">
            Título <small>(use Enter para quebrar linha; a última linha fica destacada)</small>
          </label>
          <textarea id="hd-titulo" value={settings.home_destaque.titulo} onChange={(e) => setDestaqueField("titulo", e.target.value)} />
        </div>
        <div className="field field-full">
          <label htmlFor="hd-rotulo">Rótulo do número</label>
          <textarea id="hd-rotulo" value={settings.home_destaque.numero_rotulo} onChange={(e) => setDestaqueField("numero_rotulo", e.target.value)} />
        </div>
        <div className="field field-full">
          <label htmlFor="hd-subtitulo">Subtítulo</label>
          <textarea id="hd-subtitulo" value={settings.home_destaque.subtitulo} onChange={(e) => setDestaqueField("subtitulo", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="hd-botao-texto">Texto do botão</label>
          <input id="hd-botao-texto" value={settings.home_destaque.botao_texto} onChange={(e) => setDestaqueField("botao_texto", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="hd-botao-link">
            Link do botão <small>#secao, /pagina ou URL</small>
          </label>
          <input id="hd-botao-link" value={settings.home_destaque.botao_link} onChange={(e) => setDestaqueField("botao_link", e.target.value)} placeholder="#historia" />
        </div>
      </div>

      <h2 className="admin-section-title">Home — evento em destaque (placar)</h2>
      <div className="admin-form-grid">
        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={settings.home_evento.exibir}
              onChange={(e) => setEventoField("exibir", e.target.checked)}
              style={{ width: "auto" }}
            />{" "}
            Exibir faixa do evento na home
          </label>
        </div>
        <div className="field">
          <label htmlFor="he-status">Status</label>
          <input id="he-status" value={settings.home_evento.status_label} onChange={(e) => setEventoField("status_label", e.target.value)} placeholder="ENCERRADO / EM BREVE" />
        </div>
        <div className="field">
          <label htmlFor="he-placar">Placar</label>
          <input id="he-placar" value={settings.home_evento.placar} onChange={(e) => setEventoField("placar", e.target.value)} placeholder="6 × 2" />
        </div>
        <div className="field field-full">
          <label htmlFor="he-competicao">
            Competição <small>(Enter para quebrar linha)</small>
          </label>
          <textarea id="he-competicao" value={settings.home_evento.competicao} onChange={(e) => setEventoField("competicao", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="he-data">Data / local</label>
          <input id="he-data" value={settings.home_evento.data_local} onChange={(e) => setEventoField("data_local", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="he-time-casa">Time casa</label>
          <input id="he-time-casa" value={settings.home_evento.time_casa} onChange={(e) => setEventoField("time_casa", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="he-time-fora">Time visitante</label>
          <input id="he-time-fora" value={settings.home_evento.time_fora} onChange={(e) => setEventoField("time_fora", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="he-marca-fora">Selo do visitante</label>
          <input id="he-marca-fora" value={settings.home_evento.marca_fora} onChange={(e) => setEventoField("marca_fora", e.target.value)} placeholder="PFC" />
        </div>
        <div className="field">
          <label htmlFor="he-link-texto">Texto do link</label>
          <input id="he-link-texto" value={settings.home_evento.link_texto} onChange={(e) => setEventoField("link_texto", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="he-link-url">Link do evento</label>
          <input id="he-link-url" value={settings.home_evento.link_url} onChange={(e) => setEventoField("link_url", e.target.value)} placeholder="#noticias" />
        </div>
      </div>

      <h2 className="admin-section-title">Redes sociais</h2>      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="instagram">Instagram</label>
          <input id="instagram" value={settings.redes_sociais.instagram} onChange={(e) => setRede("instagram", e.target.value)} placeholder="https://instagram.com/…" />
        </div>
        <div className="field">
          <label htmlFor="facebook">Facebook</label>
          <input id="facebook" value={settings.redes_sociais.facebook} onChange={(e) => setRede("facebook", e.target.value)} placeholder="https://facebook.com/…" />
        </div>
        <div className="field">
          <label htmlFor="whatsapp">WhatsApp</label>
          <input id="whatsapp" value={settings.redes_sociais.whatsapp} onChange={(e) => setRede("whatsapp", e.target.value)} placeholder="https://wa.me/55…" />
        </div>
        <div className="field">
          <label htmlFor="youtube">YouTube</label>
          <input id="youtube" value={settings.redes_sociais.youtube} onChange={(e) => setRede("youtube", e.target.value)} placeholder="https://youtube.com/…" />
        </div>
      </div>

      <h2 className="admin-section-title">Estatísticas da home</h2>
      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="atletas">Atletas ativos</label>
          <input id="atletas" type="number" min={0} value={stats?.atletas_ativos ?? 0} onChange={(e) => setStat("atletas_ativos", Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="categorias-stats">Categorias</label>
          <input id="categorias-stats" type="number" min={0} value={stats?.categorias ?? 0} onChange={(e) => setStat("categorias", Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="anos">Anos de atuação</label>
          <input id="anos" type="number" min={0} value={stats?.anos_atuacao ?? 0} onChange={(e) => setStat("anos_atuacao", Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="premios">Prêmios</label>
          <input id="premios" type="number" min={0} value={stats?.premios ?? 0} onChange={(e) => setStat("premios", Number(e.target.value))} />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Salvando…" : "Salvar configurações"}
        </button>
      </div>
    </form>
  );
}
