import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../../lib/supabase";
import { associationConfig } from "../../lib/association-config";
import { PartnerForm } from "./partner-form";
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

async function getSponsorGroups(): Promise<SponsorGroup[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/sponsor_categories?select=id,nome,ordem,sponsors(id,nome,logo_url,website,descricao,destaque)&ativo=eq.true&order=ordem.asc`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return (data as SponsorGroup[]).map((g) => ({
        ...g,
        sponsors: (g.sponsors ?? []).sort((a, b) => Number(b.destaque) - Number(a.destaque)),
      }));
    }
  } catch (err) {
    console.error("Erro ao carregar patrocinadores:", err);
  }
  return [];
}

async function getContactEmail(): Promise<string> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?select=valor&chave=eq.contatos`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]?.valor?.email) {
        return data[0].valor.email;
      }
    }
  } catch (e) {
    console.error("Erro ao buscar e-mail de contato:", e);
  }
  return `contato@${associationConfig.domain}`;
}

export default async function PatrocinadoresPage() {
  const [groups, contactEmail] = await Promise.all([
    getSponsorGroups(),
    getContactEmail(),
  ]);

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
            Empresas e instituições que caminham junto com a {associationConfig.name}. Sua marca também pode
            fazer parte dessa história.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          {!hasAny ? (
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
            <PartnerForm mailto={contactEmail} />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
