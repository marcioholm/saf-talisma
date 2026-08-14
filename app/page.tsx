import Link from "next/link";
import { SiteHeader, SiteFooter } from "../components/site-shell";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../lib/supabase";
import {
  mergeDestaque,
  mergeEvento,
  mergeProximoDesafio,
  DEFAULT_HOME_DESTAQUE,
  DEFAULT_HOME_EVENTO,
  DEFAULT_HOME_PROXIMO_DESAFIO,
  type HomeDestaque,
  type HomeEvento,
  type HomeProximoDesafio,
} from "../lib/home-content";
import "./public.css";

type Post = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  imagem_url: string | null;
  published_at: string;
};

type Banner = {
  id: string;
  titulo: string | null;
  subtitulo: string | null;
  texto: string | null;
  botao_texto: string | null;
  botao_url: string | null;
  botao_target: "same" | "new";
  imagem_desktop_url: string | null;
  imagem_mobile_url: string | null;
  imagem_alt: string | null;
  ordem: number;
};

type Sponsor = {
  id: string;
  nome: string;
  logo_url: string;
  website: string | null;
  destaque: boolean;
};

type Stats = {
  atletas_ativos: number;
  categorias: number;
  anos_atuacao: number;
  premios: number;
};

import { associationConfig } from "../lib/association-config";

function Mark({ small = false }: { small?: boolean }) {
  return (
    <div className={`mark ${small ? "mark-small" : ""}`} aria-label={associationConfig.name}>
      <span className="mark-star">★</span>
      <strong>SAF</strong>
      <span>Talismã</span>
    </div>
  );
}

function Lines({ text, emLast = false }: { text: string; emLast?: boolean }) {
  const parts = text.split("\n");
  return (
    <>
      {parts.map((line, i) => {
        const last = i === parts.length - 1;
        return (
          <span key={i}>
            {emLast && last ? <em>{line}</em> : line}
            {!last && <br />}
          </span>
        );
      })}
    </>
  );
}

async function getHomeSettings(): Promise<{
  destaque: HomeDestaque;
  evento: HomeEvento;
  proximoDesafio: HomeProximoDesafio;
  stats: Stats;
}> {
  let destaque = DEFAULT_HOME_DESTAQUE;
  let evento = DEFAULT_HOME_EVENTO;
  let proximoDesafio = DEFAULT_HOME_PROXIMO_DESAFIO;
  let stats: Stats = { atletas_ativos: 200, categorias: 4, anos_atuacao: 17, premios: 50 };

  try {
    const [settingsRes, statsRes] = await Promise.all([
      fetch(
        `${supabaseUrl}/rest/v1/site_settings?select=chave,valor&chave=in.(home_destaque,home_evento,home_proximo_desafio)`,
        {
          headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
          next: { revalidate: 30 },
        }
      ),
      fetch(
        `${supabaseUrl}/rest/v1/estatisticas?select=atletas_ativos,categorias,anos_atuacao,premios&limit=1`,
        {
          headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
          next: { revalidate: 30 },
        }
      ),
    ]);

    if (settingsRes.ok) {
      const data = await settingsRes.json();
      destaque = mergeDestaque(data);
      evento = mergeEvento(data);
      proximoDesafio = mergeProximoDesafio(data);
    }

    if (statsRes.ok) {
      const statsData = await statsRes.json();
      if (statsData && statsData.length > 0) {
        stats = {
          atletas_ativos: statsData[0].atletas_ativos || 200,
          categorias: statsData[0].categorias || 4,
          anos_atuacao: statsData[0].anos_atuacao || 17,
          premios: statsData[0].premios || 50,
        };
      }
    }
  } catch (e) {
    console.error("Erro ao carregar configurações da home:", e);
  }

  return { destaque, evento, proximoDesafio, stats };
}

async function getBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/banners?select=id,titulo,subtitulo,texto,botao_texto,botao_url,botao_target,imagem_desktop_url,imagem_mobile_url,imagem_alt,ordem&ativo=eq.true&order=ordem.asc`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 30 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data || [];
    }
  } catch (e) {
    console.error("Erro ao carregar banners:", e);
  }
  return [];
}

async function getSponsors(): Promise<Sponsor[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/sponsors?select=id,nome,logo_url,website,destaque,ordem&ativo=eq.true&order=ordem.asc`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 30 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data || [];
    }
  } catch (e) {
    console.error("Erro ao carregar patrocinadores:", e);
  }
  return [];
}

async function getLatestNews(): Promise<Post[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/posts?select=id,titulo,slug,resumo,imagem_url,published_at&status=eq.published&order=published_at.desc&limit=3`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 30 },
      }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Erro ao carregar últimas notícias:", e);
  }
  return [];
}

export default async function Home() {
  const [{ destaque, evento, proximoDesafio, stats }, banners, sponsors, latestNews] = await Promise.all([
    getHomeSettings(),
    getBanners(),
    getSponsors(),
    getLatestNews(),
  ]);

  const activeBanner = banners[0];

  return (
    <main>
      <SiteHeader active="/" />

      {evento.exibir && (
        <section className="score-strip" id="jogos">
          <div className="shell score-layout">
            <div className="competition">
              <Lines text={evento.competicao} />
            </div>
            <div className="score-center">
              <div className="team">
                <Mark small />
                <b>{evento.time_casa}</b>
              </div>
              <div className="score">
                <span>{evento.status_label}</span>
                <strong className="is-win">{evento.placar}</strong>
                <small>{evento.data_local}</small>
              </div>
              <div className="team opponent">
                <div className="opponent-mark">{evento.marca_fora}</div>
                <b>{evento.time_fora}</b>
              </div>
            </div>
            <a href={evento.link_url} className="match-link">
              {evento.link_texto} <span>→</span>
            </a>
          </div>
        </section>
      )}

      {/* Banner Principal Cadastrado no Admin */}
      {activeBanner && (activeBanner.imagem_desktop_url || activeBanner.imagem_mobile_url) && (
        <section className="home-banner-section shell" style={{ margin: "24px auto 0" }}>
          <div
            style={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              background: "#0d0d0d",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
          >
            <picture>
              {activeBanner.imagem_mobile_url && (
                <source media="(max-width: 768px)" srcSet={publicFileUrl(activeBanner.imagem_mobile_url)} />
              )}
              <img
                src={publicFileUrl(activeBanner.imagem_desktop_url || activeBanner.imagem_mobile_url || "")}
                alt={activeBanner.imagem_alt || activeBanner.titulo || "Banner SAF Talismã"}
                style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
              />
            </picture>
            {(activeBanner.titulo || activeBanner.subtitulo || activeBanner.botao_texto) && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "40px",
                  color: "#fff",
                  maxWidth: "600px",
                }}
              >
                {activeBanner.subtitulo && (
                  <span style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#2e9c41", fontWeight: 700, marginBottom: "8px" }}>
                    {activeBanner.subtitulo}
                  </span>
                )}
                {activeBanner.titulo && (
                  <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "36px", fontWeight: 800, textTransform: "uppercase", margin: "0 0 10px 0", lineHeight: 1.1 }}>
                    {activeBanner.titulo}
                  </h2>
                )}
                {activeBanner.texto && (
                  <p style={{ fontSize: "15px", color: "#ddd", margin: "0 0 16px 0", lineHeight: 1.4 }}>
                    {activeBanner.texto}
                  </p>
                )}
                {activeBanner.botao_texto && activeBanner.botao_url && (
                  <div>
                    <a
                      href={activeBanner.botao_url}
                      target={activeBanner.botao_target === "new" ? "_blank" : undefined}
                      rel={activeBanner.botao_target === "new" ? "noreferrer" : undefined}
                      className="button button-green"
                      style={{ display: "inline-block" }}
                    >
                      {activeBanner.botao_texto}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="hero" id="inicio">
        <div className="hero-lines" />
        <div className="shell hero-inner">
          <div className="eyebrow">
            <span /> {destaque.eyebrow}
          </div>
          <h1>
            <Lines text={destaque.titulo} emLast />
          </h1>
          <p>{destaque.subtitulo}</p>
          <div className="hero-actions">
            <a href={destaque.botao_link} className="button button-green">
              {destaque.botao_texto}
            </a>
            <Link href="/noticias" className="text-link">
              Últimas notícias <span>→</span>
            </Link>
          </div>
          <div className="hero-number">
            {destaque.numero}
            <small>
              <Lines text={destaque.numero_rotulo} />
            </small>
          </div>
        </div>
        <div className="hero-ball" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </section>

      <section className="news-section shell" id="noticias">
        <div className="section-heading">
          <div>
            <span>EM DESTAQUE</span>
            <h2>Últimas notícias</h2>
          </div>
          <Link href="/noticias">
            Todas as notícias <b>→</b>
          </Link>
        </div>
        <div className="news-grid">
          {latestNews.length > 0 ? (
            latestNews.map((item, index) => (
              <article
                key={item.id}
                className={`news-card ${index === 0 ? "news-main" : "news-side"}`}
              >
                <div
                  className="news-art"
                  style={
                    item.imagem_url
                      ? { backgroundImage: `url("${publicFileUrl(item.imagem_url)}")`, backgroundSize: "cover" }
                      : undefined
                  }
                >
                  <span className="art-number">0{index + 1}</span>
                  <div className="court-lines" />
                </div>
                <div className="news-content">
                  <span className="news-tag">Notícias</span>
                  <h3>{item.titulo}</h3>
                  {item.resumo && <p>{item.resumo}</p>}
                  <div className="news-meta">
                    <span>
                      {item.published_at
                        ? new Date(item.published_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                    <Link href={`/noticias/${item.slug}`}>Leia mais →</Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#666" }}>
              Nenhuma notícia publicada ainda.
            </p>
          )}
        </div>
      </section>

      {/* Seção Próximo Desafio (Editável pelo Admin) */}
      {proximoDesafio.exibir && (
        <section className="next-match">
          <div className="shell next-grid">
            <div>
              <span className="label">{proximoDesafio.tag || "PRÓXIMO DESAFIO"}</span>
              <h2>
                <Lines text={proximoDesafio.titulo} />
              </h2>
              <p>{proximoDesafio.subtitulo}</p>
            </div>
            <div className="fixture-card">
              <div className="fixture-top">
                <span>{proximoDesafio.fase_rodada}</span>
                <b>{proximoDesafio.local_cidade}</b>
              </div>
              <div className="fixture-teams">
                <div>
                  <div className="opponent-mark" style={{ background: "#D200D2", color: "#fff", margin: "0 auto 8px" }}>
                    SAF
                  </div>
                  <strong>{proximoDesafio.time_casa}</strong>
                </div>
                <span className="versus">
                  VS<small>{proximoDesafio.status_label || "EM BREVE"}</small>
                </span>
                <div>
                  <div className="opponent-mark large" style={{ margin: "0 auto 8px" }}>
                    {proximoDesafio.escudo_fora_url ? (
                      <img src={publicFileUrl(proximoDesafio.escudo_fora_url)} alt={proximoDesafio.time_fora} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} />
                    ) : (
                      proximoDesafio.marca_fora || "ADV"
                    )}
                  </div>
                  <strong>{proximoDesafio.time_fora}</strong>
                </div>
              </div>
              <div className="fixture-bottom">
                <span>
                  <i className="dot" />
                  Acompanhe em nossas redes sociais
                </span>
                <a href={proximoDesafio.link_url || "/jogos"}>{proximoDesafio.link_texto || "Ver Detalhes"} →</a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="categories shell" id="categorias">
        <div className="section-heading">
          <div>
            <span>NOSSAS EQUIPES</span>
            <h2>
              Uma base forte.
              <br />
              Um futuro gigante.
            </h2>
          </div>
          <p>Desenvolvimento esportivo e humano em todas as fases da formação.</p>
        </div>
        <div className="category-grid">
          {[
            ["01", "SUB-13", "Primeiros passos, grandes sonhos."],
            ["02", "SUB-15", "Talento que ganha forma."],
            ["03", "ADULTO", "Nossa força em quadra."],
            ["04", "FEMININO", "Elas mudam o jogo."],
          ].map(([num, title, text]) => (
            <article key={title}>
              <span data-num={num}>{num}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link href="/sobre">CONHEÇA A EQUIPE →</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="story" id="historia">
        <div className="shell story-grid">
          <div
            className="story-visual"
            style={
              destaque.imagem_historia_url
                ? {
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url("${publicFileUrl(destaque.imagem_historia_url)}")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            <span className="year">2009</span>
            <div className="crest-ghost">
              <Mark />
            </div>
          </div>
          <div className="story-copy">
            <span className="label">NOSSA HISTÓRIA</span>
            <h2>
              Nascemos para
              <br />
              transformar vidas.
            </h2>
            <p>
              A {associationConfig.name} é um projeto de formação esportiva e
              humana que acredita no poder do esporte para abrir caminhos.
            </p>
            <p>
              Há {stats.anos_atuacao || new Date().getFullYear() - associationConfig.founded} anos, desenvolvemos atletas com disciplina, respeito e espírito de equipe — dentro
              e fora das quadras.
            </p>
            <div className="stats">
              <div>
                <strong>{stats.atletas_ativos}+</strong>
                <span>ATLETAS</span>
              </div>
              <div>
                <strong>{stats.categorias}</strong>
                <span>CATEGORIAS</span>
              </div>
              <div>
                <strong>{stats.premios}+</strong>
                <span>TÍTULOS</span>
              </div>
            </div>
            <Link className="button button-green" href="/sobre">
              Conheça o projeto
            </Link>
          </div>
        </div>
      </section>

      {/* Parceiros da Associação */}
      <section className="partners shell" id="parceiros">
        <span className="label">QUEM ACREDITA NO NOSSO JOGO</span>
        <h2>Parceiros da Associação</h2>
        <div className="partner-grid">
          {sponsors.length > 0 ? (
            sponsors.map((s) => (
              <a
                key={s.id}
                href={s.website || "/patrocinadores"}
                target={s.website ? "_blank" : undefined}
                rel={s.website ? "noreferrer" : undefined}
                className="partner-item"
                title={s.nome}
              >
                <img src={publicFileUrl(s.logo_url)} alt={s.nome} />
                <strong>{s.nome}</strong>
              </a>
            ))
          ) : (
            <>
              <div>
                MASTER
                <br />
                <strong>PARCEIRO</strong>
              </div>
              <div>
                {associationConfig.location.split(',')[0].toUpperCase()}
                <br />
                <strong>E REGIÃO</strong>
              </div>
              <div>
                SUA MARCA
                <br />
                <strong>AQUI</strong>
              </div>
            </>
          )}
        </div>
        <Link className="partner-cta" href="/patrocinadores">
          Quero ser parceiro
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
