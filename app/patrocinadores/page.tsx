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
            <a className="button button-green" href={`mailto:${mailto}?subject=Quero%20ser%20parceiro%20do%20Talismã`}>
              Quero ser parceiro →
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
