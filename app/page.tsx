"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "../components/site-shell";
import { supabase } from "../lib/supabase";
import {
  mergeDestaque,
  mergeEvento,
  DEFAULT_HOME_DESTAQUE,
  DEFAULT_HOME_EVENTO,
  type HomeDestaque,
  type HomeEvento,
} from "../lib/home-content";
import "./public.css";

const news = [
  {
    tag: "Sul-Americano",
    title: "SAF Talismã estreia com vitória por 6 a 2 no Sul-Americano de Clubes",
    text: "Equipe de Wenceslau Braz supera o Palermo FC, do Uruguai, e começa a competição continental com autoridade.",
    className: "news-card news-main",
  },
  {
    tag: "Bastidores",
    title: "A preparação que levou o Talismã até Assunção",
    text: "Rotina, disciplina e união antes do maior desafio da temporada.",
    className: "news-card news-side news-training",
  },
  {
    tag: "Comunidade",
    title: "Nossa torcida também joga junto",
    text: "Do Norte Pioneiro para o continente: uma corrente de apoio que atravessa fronteiras.",
    className: "news-card news-side news-crowd",
  },
];

function Mark({ small = false }: { small?: boolean }) {
  return (
    <div className={`mark ${small ? "mark-small" : ""}`} aria-label="SAF Talismã">
      <span className="mark-star">★</span>
      <strong>SAF</strong>
      <span>TALISMÃ</span>
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

export default function Home() {
  const [destaque, setDestaque] = useState<HomeDestaque | null>(null);
  const [evento, setEvento] = useState<HomeEvento | null>(null);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("chave, valor")
      .in("chave", ["home_destaque", "home_evento"])
      .then(({ data }) => {
        setDestaque(mergeDestaque(data as Array<{ chave: string; valor: unknown }> | null));
        setEvento(mergeEvento(data as Array<{ chave: string; valor: unknown }> | null));
      });
  }, []);

  return (
    <main>
      <SiteHeader active="/" />

      {(evento ?? DEFAULT_HOME_EVENTO).exibir && (
        <section className="score-strip" id="jogos">
          <div className="shell score-layout">
            <div className="competition">
              <Lines text={(evento ?? DEFAULT_HOME_EVENTO).competicao} />
            </div>
            <div className="score-center">
              <div className="team"><Mark small /><b>{(evento ?? DEFAULT_HOME_EVENTO).time_casa}</b></div>
              <div className="score">
                <span>{(evento ?? DEFAULT_HOME_EVENTO).status_label}</span>
                <strong className="is-win">{(evento ?? DEFAULT_HOME_EVENTO).placar}</strong>
                <small>{(evento ?? DEFAULT_HOME_EVENTO).data_local}</small>
              </div>
              <div className="team opponent">
                <div className="opponent-mark">{(evento ?? DEFAULT_HOME_EVENTO).marca_fora}</div>
                <b>{(evento ?? DEFAULT_HOME_EVENTO).time_fora}</b>
              </div>
            </div>
            <a href={(evento ?? DEFAULT_HOME_EVENTO).link_url} className="match-link">
              {(evento ?? DEFAULT_HOME_EVENTO).link_texto} <span>→</span>
            </a>
          </div>
        </section>
      )}

      <section className="hero" id="inicio">
        <div className="hero-lines" />
        <div className="shell hero-inner">
          <div className="eyebrow"><span /> {(destaque ?? DEFAULT_HOME_DESTAQUE).eyebrow}</div>
          <h1><Lines text={(destaque ?? DEFAULT_HOME_DESTAQUE).titulo} emLast /></h1>
          <p>{(destaque ?? DEFAULT_HOME_DESTAQUE).subtitulo}</p>
          <div className="hero-actions">
            <a href={(destaque ?? DEFAULT_HOME_DESTAQUE).botao_link} className="button button-green">
              {(destaque ?? DEFAULT_HOME_DESTAQUE).botao_texto}
            </a>
            <Link href="/noticias" className="text-link">Últimas notícias <span>→</span></Link>
          </div>
          <div className="hero-number">
            {(destaque ?? DEFAULT_HOME_DESTAQUE).numero}
            <small><Lines text={(destaque ?? DEFAULT_HOME_DESTAQUE).numero_rotulo} /></small>
          </div>
        </div>
        <div className="hero-ball" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      </section>

      <section className="news-section shell" id="noticias">
        <div className="section-heading"><div><span>EM DESTAQUE</span><h2>Últimas notícias</h2></div><Link href="/noticias">Todas as notícias <b>→</b></Link></div>
        <div className="news-grid">
          {news.map((item, index) => (
            <article key={item.title} className={item.className}>
              <div className="news-art"><span className="art-number">0{index + 1}</span><div className="court-lines" /></div>
              <div className="news-content"><span className="news-tag">{item.tag}</span><h3>{item.title}</h3><p>{item.text}</p><div className="news-meta"><span>29 de julho de 2026</span><Link href="/noticias">Leia mais →</Link></div></div>
            </article>
          ))}
        </div>
      </section>

      <section className="next-match">
        <div className="shell next-grid">
          <div><span className="label">PRÓXIMO DESAFIO</span><h2>A caminhada<br />continua.</h2><p>Mais um grande confronto pela fase de grupos do Sul-Americano de Clubes.</p></div>
          <div className="fixture-card"><div className="fixture-top"><span>FASE DE GRUPOS · RODADA 2</span><b>ASSUNÇÃO, PARAGUAI</b></div><div className="fixture-teams"><div><Mark small /><strong>SAF<br />Talismã</strong></div><span className="versus">VS<small>EM BREVE</small></span><div><div className="opponent-mark large">12J</div><strong>12 de Junio<br />Futsal</strong></div></div>            <div className="fixture-bottom"><span><i className="dot" />Acompanhe em nossas redes sociais</span><a href="#social">Seguir o Talismã →</a></div></div>
        </div>
      </section>

      <section className="categories shell" id="categorias">
        <div className="section-heading"><div><span>NOSSAS EQUIPES</span><h2>Uma base forte.<br />Um futuro gigante.</h2></div><p>Desenvolvimento esportivo e humano em todas as fases da formação.</p></div>
        <div className="category-grid">
          {[['01','SUB-13','Primeiros passos, grandes sonhos.'],['02','SUB-15','Talento que ganha forma.'],['03','ADULTO','Nossa força em quadra.'],['04','FEMININO','Elas mudam o jogo.']].map(([num,title,text]) => <article key={title}><span data-num={num}>{num}</span><h3>{title}</h3><p>{text}</p><Link href="/sobre">CONHEÇA A EQUIPE →</Link></article>)}
        </div>
      </section>

      <section className="story" id="historia"><div className="shell story-grid"><div className="story-visual"><span className="year">2009</span><div className="crest-ghost"><Mark /></div></div><div className="story-copy"><span className="label">NOSSA HISTÓRIA</span><h2>Nascemos para<br />transformar vidas.</h2><p>A SAF Talismã é mais do que um clube de futsal. É um projeto de formação esportiva e humana que acredita no poder do esporte para abrir caminhos.</p><p>Há 17 anos, desenvolvemos atletas com disciplina, respeito e espírito de equipe — dentro e fora das quadras.</p><div className="stats"><div><strong>200+</strong><span>ATLETAS</span></div><div><strong>4</strong><span>CATEGORIAS</span></div><div><strong>50+</strong><span>TÍTULOS</span></div></div><Link className="button button-green" href="/sobre">Conheça o projeto</Link></div></div></section>

      <section className="partners shell" id="parceiros"><span className="label">QUEM ACREDITA NO NOSSO JOGO</span><h2>Parceiros do Talismã</h2><div className="partner-grid"><div>MASTER<br /><strong>PARCEIRO</strong></div><div>NORTE<br /><strong>PIONEIRO</strong></div><div>WENCESLAU<br /><strong>BRAZ</strong></div><div>SUA MARCA<br /><strong>AQUI</strong></div></div><Link className="partner-cta" href="/patrocinadores">Quero ser parceiro <span>→</span></Link></section>

      <SiteFooter />
    </main>
  );
}

