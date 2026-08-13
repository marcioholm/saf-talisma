import Link from "next/link";
import { SiteHeader, SiteFooter } from "../components/site-shell";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../lib/supabase";
import {
  mergeDestaque,
  mergeEvento,
  DEFAULT_HOME_DESTAQUE,
  DEFAULT_HOME_EVENTO,
  type HomeDestaque,
  type HomeEvento,
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

import { associationConfig } from "../lib/association-config";

function Mark({ small = false }: { small?: boolean }) {
  const [primeiroNome, ...resto] = associationConfig.name.split(" ");
  return (
    <div className={`mark ${small ? "mark-small" : ""}`} aria-label={associationConfig.name}>
      <span className="mark-star">★</span>
      <strong>{primeiroNome}</strong>
      <span>{resto.join(" ")}</span>
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

async function getHomeSettings(): Promise<{ destaque: HomeDestaque; evento: HomeEvento }> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?select=chave,valor&chave=in.(home_destaque,home_evento)`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return {
        destaque: mergeDestaque(data),
        evento: mergeEvento(data),
      };
    }
  } catch (e) {
    console.error("Erro ao carregar configurações da home:", e);
  }
  return {
    destaque: DEFAULT_HOME_DESTAQUE,
    evento: DEFAULT_HOME_EVENTO,
  };
}

async function getLatestNews(): Promise<Post[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/posts?select=id,titulo,slug,resumo,imagem_url,published_at&status=eq.published&order=published_at.desc&limit=3`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Erro ao carregar últimas notícias:", e);
  }
  return [];
}

export default async function Home() {
  const [{ destaque, evento }, latestNews] = await Promise.all([
    getHomeSettings(),
    getLatestNews(),
  ]);

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

      <section className="next-match">
        <div className="shell next-grid">
          <div>
            <span className="label">PRÓXIMO DESAFIO</span>
            <h2>
              A caminhada
              <br />
              continua.
            </h2>
            <p>Mais um grande confronto pela fase de grupos do Sul-Americano de Clubes.</p>
          </div>
          <div className="fixture-card">
            <div className="fixture-top">
              <span>FASE DE GRUPOS · RODADA 2</span>
              <b>ASSUNÇÃO, PARAGUAI</b>
            </div>
            <div className="fixture-teams">
              <div>
                <Mark small />
                <strong>
                  SAF
                  <br />
                  Talismã
                </strong>
              </div>
              <span className="versus">
                VS<small>EM BREVE</small>
              </span>
              <div>
                <div className="opponent-mark large">12J</div>
                <strong>
                  12 de Junio
                  <br />
                  Futsal
                </strong>
              </div>
            </div>
            <div className="fixture-bottom">
              <span>
                <i className="dot" />
                Acompanhe em nossas redes sociais
              </span>
              <a href="#social">Seguir o Talismã →</a>
            </div>
          </div>
        </div>
      </section>

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
          <div className="story-visual">
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
              A {associationConfig.name} é mais do que um clube de futsal. É um projeto de formação esportiva e
              humana que acredita no poder do esporte para abrir caminhos.
            </p>
            <p>
              Há {new Date().getFullYear() - associationConfig.founded} anos, desenvolvemos atletas com disciplina, respeito e espírito de equipe — dentro
              e fora das quadras.
            </p>
            <div className="stats">
              <div>
                <strong>200+</strong>
                <span>ATLETAS</span>
              </div>
              <div>
                <strong>4</strong>
                <span>CATEGORIAS</span>
              </div>
              <div>
                <strong>50+</strong>
                <span>TÍTULOS</span>
              </div>
            </div>
            <Link className="button button-green" href="/sobre">
              Conheça o projeto
            </Link>
          </div>
        </div>
      </section>

      <section className="partners shell" id="parceiros">
        <span className="label">QUEM ACREDITA NO NOSSO JOGO</span>
        <h2>Parceiros do clube</h2>
        <div className="partner-grid">
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
        </div>
        <Link className="partner-cta" href="/patrocinadores">
          Quero ser parceiro <span>→</span>
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
