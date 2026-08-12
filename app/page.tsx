"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NewsletterForm from "../components/newsletter-form";
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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");

  useEffect(() => {
    const sections = ["inicio", "jogos", "noticias", "categorias", "historia", "parceiros"]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const isActive = (id: string) => activeSection === id;

  return (
    <main>
      <div className="topline">
        <div className="shell topline-inner">
          <span>O clube do Norte Pioneiro</span>
          <div><a href="#historia">Institucional</a><a href="#parceiros">Seja parceiro</a></div>
        </div>
      </div>

      <header className="header">
        <div className="shell header-main">
          <a href="#inicio" className="brand"><Mark /></a>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu" aria-expanded={menuOpen}>
            <span /><span /><span />
          </button>
          <nav className={menuOpen ? "nav nav-open" : "nav"} aria-label="Navegação principal">
            <a href="#noticias" className={isActive("noticias") ? "active" : ""} onClick={() => setMenuOpen(false)}>Notícias</a>
            <a href="#jogos" className={isActive("jogos") ? "active" : ""} onClick={() => setMenuOpen(false)}>Jogos</a>
            <a href="#categorias" className={isActive("categorias") ? "active" : ""} onClick={() => setMenuOpen(false)}>Categorias</a>
            <a href="#historia" className={isActive("historia") ? "active" : ""} onClick={() => setMenuOpen(false)}>O clube</a>
            <a href="#parceiros" className={isActive("parceiros") ? "active" : ""} onClick={() => setMenuOpen(false)}>Patrocinadores</a>
          </nav>
          <a className="partner-button" href="#parceiros">Seja parceiro <span>↗</span></a>
        </div>
      </header>

      <section className="score-strip" id="jogos">
        <div className="shell score-layout">
          <div className="competition"><span>CONMEBOL</span><strong>SUL-AMERICANO<br />DE CLUBES</strong></div>
          <div className="score-center">
            <div className="team"><Mark small /><b>SAF Talismã</b></div>
            <div className="score"><span>ENCERRADO</span><strong className="is-win">6 <i>×</i> 2</strong><small>29 JUL 2026 · ASSUNÇÃO, PAR</small></div>
            <div className="team opponent"><div className="opponent-mark">PFC</div><b>Palermo FC</b></div>
          </div>
          <a href="#noticias" className="match-link">Ver detalhes <span>→</span></a>
        </div>
      </section>

      <section className="hero" id="inicio">
        <div className="hero-lines" />
        <div className="shell hero-inner">
          <div className="eyebrow"><span /> ORGULHO DO NORTE PIONEIRO</div>
          <h1>Mais que futsal.<br /><em>Um movimento.</em></h1>
          <p>Formando atletas, fortalecendo valores e levando o nome de Wenceslau Braz cada vez mais longe.</p>
          <div className="hero-actions"><a href="#historia" className="button button-green">Conheça nossa história</a><a href="#noticias" className="text-link">Últimas notícias <span>→</span></a></div>
          <div className="hero-number">17<small>ANOS<br />DE HISTÓRIA</small></div>
        </div>
        <div className="hero-ball" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      </section>

      <section className="news-section shell" id="noticias">
        <div className="section-heading"><div><span>EM DESTAQUE</span><h2>Últimas notícias</h2></div><Link href="/noticias">Todas as notícias <b>→</b></Link></div>
        <div className="news-grid">
          {news.map((item, index) => (
            <article key={item.title} className={item.className}>
              <div className="news-art"><span className="art-number">0{index + 1}</span><div className="court-lines" /></div>
              <div className="news-content"><span className="news-tag">{item.tag}</span><h3>{item.title}</h3><p>{item.text}</p><div className="news-meta"><span>29 de julho de 2026</span><b>Leia mais →</b></div></div>
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
          {[['01','SUB-13','Primeiros passos, grandes sonhos.'],['02','SUB-15','Talento que ganha forma.'],['03','ADULTO','Nossa força em quadra.'],['04','FEMININO','Elas mudam o jogo.']].map(([num,title,text]) => <article key={title}><span data-num={num}>{num}</span><h3>{title}</h3><p>{text}</p><b>CONHEÇA A EQUIPE →</b></article>)}
        </div>
      </section>

      <section className="story" id="historia"><div className="shell story-grid"><div className="story-visual"><span className="year">2009</span><div className="crest-ghost"><Mark /></div></div><div className="story-copy"><span className="label">NOSSA HISTÓRIA</span><h2>Nascemos para<br />transformar vidas.</h2><p>A SAF Talismã é mais do que um clube de futsal. É um projeto de formação esportiva e humana que acredita no poder do esporte para abrir caminhos.</p><p>Há 17 anos, desenvolvemos atletas com disciplina, respeito e espírito de equipe — dentro e fora das quadras.</p><div className="stats"><div><strong>200+</strong><span>ATLETAS</span></div><div><strong>4</strong><span>CATEGORIAS</span></div><div><strong>50+</strong><span>TÍTULOS</span></div></div><a className="button button-green" href="#historia">Conheça o projeto</a></div></div></section>

      <section className="partners shell" id="parceiros"><span className="label">QUEM ACREDITA NO NOSSO JOGO</span><h2>Parceiros do Talismã</h2><div className="partner-grid"><div>MASTER<br /><strong>PARCEIRO</strong></div><div>NORTE<br /><strong>PIONEIRO</strong></div><div>WENCESLAU<br /><strong>BRAZ</strong></div><div>SUA MARCA<br /><strong>AQUI</strong></div></div><a className="partner-cta" href="mailto:contato@saftalisma.com.br">Quero ser parceiro <span>→</span></a></section>

      <footer id="social"><div className="newsletter-strip"><div className="shell newsletter-inner"><NewsletterForm /></div></div><div className="shell footer-grid"><div><Mark /><p>Futsal, formação e futuro.<br />De Wenceslau Braz para o mundo.</p></div><div><strong>CLUBE</strong><a href="#historia">Nossa história</a><a href="#categorias">Categorias</a><a href="#jogos">Jogos</a></div><div><strong>ACOMPANHE</strong><a href="#noticias">Notícias</a><a href="#social">Instagram</a><a href="#social">Facebook</a></div><div><strong>CONTATO</strong><span>Wenceslau Braz · Paraná</span><a className="footer-contact" href="mailto:contato@saftalisma.com.br">contato@saftalisma.com.br</a></div></div><div className="shell footer-bottom"><span>© 2026 SAF Talismã. Todos os direitos reservados.</span><span>FEITO COM RAÇA NO NORTE PIONEIRO.</span></div></footer>
    </main>
  );
}
