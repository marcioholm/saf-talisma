"use client";

import { useState, useEffect } from "react";
import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { supabase, publicFileUrl } from "../../lib/supabase";
import "../public.css";

type SponsorGroup = {
  id: string;
  nome: string;
  ordem: number;
  sponsors: Array<{
    id: string;
    nome: string;
    logo_url: string;
    website: string | null;
    descricao: string | null;
    destaque: boolean;
  }> | null;
};

function PartnerForm({ mailto }: { mailto: string }) {
  const [form, setForm] = useState({
    nome: "",
    empresa: "",
    telefone: "",
    email: "",
    mensagem: "",
  });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.mensagem.trim()) return;
    setSending(true);
    setMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Erro ao enviar.");
      setForm({ nome: "", empresa: "", telefone: "", email: "", mensagem: "" });
      setMsg({ type: "ok", text: "Mensagem enviada! Entraremos em contato em breve." });
    } catch (err) {
      setMsg({ type: "err", text: err instanceof Error ? err.message : "Não foi possível enviar." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="partner-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="pf-nome">Nome *</label>
        <input
          id="pf-nome"
          value={form.nome}
          onChange={(e) => set("nome", e.target.value)}
          required
          autoComplete="name"
        />
      </div>
      <div className="field">
        <label htmlFor="pf-empresa">Empresa</label>
        <input
          id="pf-empresa"
          value={form.empresa}
          onChange={(e) => set("empresa", e.target.value)}
          autoComplete="organization"
        />
      </div>
      <div className="field">
        <label htmlFor="pf-email">E-mail *</label>
        <input
          id="pf-email"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="field">
        <label htmlFor="pf-telefone">Telefone</label>
        <input
          id="pf-telefone"
          value={form.telefone}
          onChange={(e) => set("telefone", e.target.value)}
          autoComplete="tel"
        />
      </div>
      <div className="field field-full">
        <label htmlFor="pf-mensagem">Mensagem *</label>
        <textarea
          id="pf-mensagem"
          value={form.mensagem}
          onChange={(e) => set("mensagem", e.target.value)}
          placeholder="Conte um pouco sobre sua empresa e o tipo de parceria desejada…"
          required
        />
      </div>
      {msg && <p className={`form-msg ${msg.type}`}>{msg.text}</p>}
      <button type="submit" className="button button-green" disabled={sending}>
        {sending ? "Enviando…" : "Enviar proposta →"}
      </button>
      <p className="fallback-mail">
        Prefere e-mail direto? Escreva para <a href={`mailto:${mailto}`}>{mailto}</a>
      </p>
    </form>
  );
}

export default function PatrocinadoresPage() {
  const [groups, setGroups] = useState<SponsorGroup[]>([]);
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("sponsor_categories")
      .select("id, nome, ordem, sponsors(id, nome, logo_url, website, descricao, destaque)")
      .eq("ativo", true)
      .eq("sponsors.ativo", true)
      .order("ordem")
      .then(({ data, error }) => {
        if (!error) {
          setGroups(
            ((data ?? []) as SponsorGroup[]).map((g) => ({
              ...g,
              sponsors: (g.sponsors ?? []).sort((a, b) => Number(b.destaque) - Number(a.destaque)),
            })),
          );
        }
        setLoading(false);
      });
    supabase
      .from("site_settings")
      .select("valor")
      .eq("chave", "contatos")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.valor && typeof data.valor === "object") {
          const v = data.valor as { email?: string };
          if (v.email) setContact(v.email);
        }
      });
  }, []);

  const mailto = contact || "contato@saftalisma.com.br";
  const hasAny = groups.some((g) => g.sponsors && g.sponsors.length > 0);

  return (
    <main className="page-body">
      <SiteHeader active="/patrocinadores" />
      <section className="page-hero">
        <div className="shell">
          <div className="eyebrow">Quem acredita no nosso jogo</div>
          <h1>
            Nossos <em>parceiros</em>
          </h1>
          <p>
            Empresas e instituições que caminham junto com a SAF Talismã. Sua marca também pode
            fazer parte dessa história.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          {loading ? (
            <div className="empty">Carregando patrocinadores…</div>
          ) : !hasAny ? (
            <div className="empty">
              <strong>Em breve</strong>
              Nossos parceiros serão anunciados aqui. Quer ser um? Fale com a gente.
            </div>
          ) : (
            groups
              .filter((g) => g.sponsors && g.sponsors.length > 0)
              .map((group) => (
                <div key={group.id} className="partner-group">
                  <h3>
                    <span>◆</span> {group.nome}
                  </h3>
                  <div className="partner-grid-page">
                    {group.sponsors!.map((s) => (
                      <a
                        key={s.id}
                        className="partner-card"
                        href={s.website || undefined}
                        target={s.website ? "_blank" : undefined}
                        rel={s.website ? "noreferrer" : undefined}
                      >
                        <img src={publicFileUrl(s.logo_url)} alt={s.nome} loading="lazy" />
                        <strong>{s.nome}</strong>
                        {s.descricao && <span>{s.descricao}</span>}
                      </a>
                    ))}
                  </div>
                </div>
              ))
          )}

          <div className="partner-cta-block">
            <h2>
              Sua marca, <em>no nosso jogo</em>
            </h2>
            <p>
              Patrocínio Master, Oficial ou apoio institucional — construímos juntos a parceria
              ideal para o seu negócio.
            </p>
            <PartnerForm mailto={mailto} />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
