"use client";

import { useState } from "react";
import Link from "next/link";
import NewsletterForm from "./newsletter-form";
import { associationConfig, developerCredit } from "../lib/association-config";

function Mark({ small = false }: { small?: boolean }) {
  return (
    <div className={`mark mark-logo ${small ? "mark-small" : ""}`} aria-label={associationConfig.institutionalName}>
      <img src="/logo-saf.svg" alt={associationConfig.institutionalName} />
    </div>
  );
}

const NAV = [
  { href: "/", label: "Início" },
  { href: "/noticias", label: "Notícias" },
  { href: "/jogos", label: "Jogos" },
  { href: "/campeonatos", label: "Campeonatos" },
  { href: "/patrocinadores", label: "Patrocinadores" },
  { href: "/transparencia", label: "Transparência" },
  { href: "/sobre", label: "Sobre nós" },
  { href: "/diretoria", label: "Diretoria" },
];

export function SiteHeader({ active = "" }: { active?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="topline">
        <div className="shell topline-inner">
          <span>{associationConfig.slogan}</span>
          <div>
            <Link href="/sobre">Institucional</Link>
            <Link href="/patrocinadores">Seja parceiro</Link>
          </div>
        </div>
      </div>
      <header className="header">
        <div className="shell header-main">
          <Link href="/" className="brand" onClick={() => setMenuOpen(false)}>
            <Mark />
          </Link>
          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <nav className={menuOpen ? "nav nav-open" : "nav"} aria-label="Navegação principal">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={active === item.href ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link className="partner-button" href="/patrocinadores">
            Seja parceiro <span>↗</span>
          </Link>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="newsletter-strip">
        <div className="shell newsletter-inner">
          <NewsletterForm />
        </div>
      </div>
      <div className="shell footer-grid">
        {/* Coluna 1 — Identidade */}
        <div className="footer-col-brand">
          <Mark />
          <h4 style={{ margin: "12px 0 6px 0", color: "#fff", fontSize: "16px", fontFamily: "'Barlow Condensed', sans-serif" }}>
            {associationConfig.institutionalName}
          </h4>
          <p style={{ fontSize: "13px", color: "#a0a0a0", margin: 0, lineHeight: 1.5 }}>
            {associationConfig.description}
          </p>
        </div>

        {/* Coluna 2 — Navegação */}
        <div className="footer-col-nav">
          <strong>NAVEGAÇÃO</strong>
          <Link href="/">Início</Link>
          <Link href="/noticias">Notícias</Link>
          <Link href="/jogos">Jogos</Link>
          <Link href="/campeonatos">Campeonatos</Link>
          <Link href="/patrocinadores">Patrocinadores</Link>
          <Link href="/transparencia">Transparência</Link>
          <Link href="/sobre">Sobre nós</Link>
          <Link href="/diretoria">Diretoria</Link>
          <Link href="/sobre#contato">Contato</Link>
        </div>

        {/* Coluna 3 — Contato */}
        <div className="footer-col-contact">
          <strong>CONTATO &amp; SEDE</strong>
          <span style={{ display: "block", color: "#d0d0d0", fontSize: "13px", marginBottom: "4px" }}>
            {associationConfig.legalAddress.street}, {associationConfig.legalAddress.number}
          </span>
          <span style={{ display: "block", color: "#a0a0a0", fontSize: "12px", marginBottom: "8px" }}>
            {associationConfig.legalAddress.city} – {associationConfig.legalAddress.state} · {associationConfig.region}
          </span>
          <a
            className="footer-contact"
            href={`tel:+${associationConfig.phoneRaw}`}
            style={{ display: "block", marginBottom: "4px" }}
          >
            📞 {associationConfig.phone}
          </a>
          <a
            className="footer-contact"
            href={`https://wa.me/${associationConfig.phoneRaw}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", marginBottom: "4px" }}
          >
            💬 WhatsApp: {associationConfig.phone}
          </a>
          <a
            className="footer-contact"
            href={`mailto:${associationConfig.email}`}
            style={{ display: "block", marginBottom: "8px" }}
          >
            ✉️ {associationConfig.email}
          </a>
          <span style={{ display: "block", fontSize: "11px", color: "#777" }}>
            CNPJ: {associationConfig.cnpj}
          </span>
        </div>

        {/* Coluna 4 — Redes sociais */}
        <div className="footer-col-social">
          <strong>REDES SOCIAIS</strong>
          {associationConfig.social.instagram && (
            <a
              href={associationConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#61CE70", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}
            >
              <span>📷</span> Instagram
            </a>
          )}
          {associationConfig.social.youtube && (
            <a
              href={associationConfig.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#61CE70", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}
            >
              <span>▶️</span> YouTube
            </a>
          )}
        </div>
      </div>

      <div className="shell footer-bottom">
        <span>© {year} {associationConfig.institutionalName}. Todos os direitos reservados.</span>
        {developerCredit.visible && (
          <span>
            {developerCredit.url ? (
              <a href={developerCredit.url} target="_blank" rel="noopener noreferrer" style={{ color: "#aaa", textDecoration: "none" }}>
                Desenvolvido por {developerCredit.name}
              </a>
            ) : (
              `Desenvolvido por ${developerCredit.name}`
            )}
          </span>
        )}
      </div>
    </footer>
  );
}
