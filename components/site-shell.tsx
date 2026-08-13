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

// Icones SVG Oficiais e Elegantes
function IconInstagram({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

function IconYouTube({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function IconFacebook({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function IconWhatsApp({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}

function IconPhone({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );
}

function IconMail({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  );
}

function IconMapPin({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
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
          <div className="topline-left">
            <span className="topline-badge">OFICIAL</span>
            <span>{associationConfig.slogan}</span>
          </div>
          <div className="topline-right">
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
            Seja parceiro
          </Link>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  const instagramUrl = associationConfig.social.instagram || "https://instagram.com/saftalisma";
  const youtubeUrl = associationConfig.social.youtube || "https://youtube.com/@saftalisma";
  const facebookUrl = associationConfig.social.facebook || "";

  return (
    <footer className="site-footer">
      <div className="newsletter-strip">
        <div className="shell newsletter-inner">
          <NewsletterForm />
        </div>
      </div>

      <div className="footer-main-wrap">
        <div className="shell footer-grid">
          {/* Coluna 1 — Identidade */}
          <div className="footer-col footer-col-brand">
            <Link href="/" className="footer-logo-link">
              <Mark />
            </Link>
            <div className="footer-badge">ASSOCIAÇÃO ESPORTIVA</div>
            <h4 className="footer-brand-title">
              {associationConfig.institutionalName}
            </h4>
            <p className="footer-brand-desc">
              {associationConfig.description}
            </p>
            <div className="footer-region-tag">
              <IconMapPin size={14} />
              <span>Arapoti – PR · {associationConfig.region}</span>
            </div>
          </div>

          {/* Coluna 2 — Navegação */}
          <div className="footer-col footer-col-nav">
            <h5 className="footer-heading">NAVEGAÇÃO</h5>
            <ul className="footer-nav-list">
              <li><Link href="/">Início</Link></li>
              <li><Link href="/noticias">Notícias</Link></li>
              <li><Link href="/jogos">Jogos</Link></li>
              <li><Link href="/campeonatos">Campeonatos</Link></li>
              <li><Link href="/patrocinadores">Patrocinadores</Link></li>
              <li><Link href="/transparencia">Transparência</Link></li>
              <li><Link href="/sobre">Sobre nós</Link></li>
              <li><Link href="/diretoria">Diretoria</Link></li>
              <li><Link href="/sobre#contato">Contato</Link></li>
            </ul>
          </div>

          {/* Coluna 3 — Contato & Sede */}
          <div className="footer-col footer-col-contact">
            <h5 className="footer-heading">CONTATO &amp; SEDE</h5>
            
            <div className="footer-contact-item">
              <IconMapPin size={15} />
              <div>
                <strong>Sede Administrativa</strong>
                <span>{associationConfig.legalAddress.street}, {associationConfig.legalAddress.number}</span>
                <small>{associationConfig.legalAddress.city} – {associationConfig.legalAddress.state}</small>
              </div>
            </div>

            <a className="footer-contact-card" href={`tel:+${associationConfig.phoneRaw}`}>
              <IconPhone size={15} />
              <span>{associationConfig.phone}</span>
            </a>

            <a
              className="footer-contact-card footer-contact-wa"
              href={`https://wa.me/${associationConfig.phoneRaw}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp size={16} />
              <span>WhatsApp: {associationConfig.phone}</span>
            </a>

            <a className="footer-contact-card footer-contact-email" href={`mailto:${associationConfig.email}`}>
              <IconMail size={15} />
              <span>{associationConfig.email}</span>
            </a>

            <div className="footer-cnpj">
              CNPJ: {associationConfig.cnpj}
            </div>
          </div>

          {/* Coluna 4 — Redes Sociais */}
          <div className="footer-col footer-col-social">
            <h5 className="footer-heading">REDES SOCIAIS</h5>
            <p className="footer-social-intro">
              Acompanhe as novidades, coberturas de jogos e bastidores da Associação:
            </p>

            <div className="footer-social-buttons">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn social-btn-instagram"
                  aria-label="Instagram da SAF Talismã"
                >
                  <IconInstagram size={18} />
                  <span>Instagram</span>
                </a>
              )}

              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn social-btn-youtube"
                  aria-label="YouTube da SAF Talismã"
                >
                  <IconYouTube size={18} />
                  <span>YouTube</span>
                </a>
              )}

              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn social-btn-facebook"
                  aria-label="Facebook da SAF Talismã"
                >
                  <IconFacebook size={18} />
                  <span>Facebook</span>
                </a>
              )}

              <a
                href={`https://wa.me/${associationConfig.phoneRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn social-btn-whatsapp"
                aria-label="WhatsApp da SAF Talismã"
              >
                <IconWhatsApp size={18} />
                <span>Canal WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Faixa inferior de Direitos */}
      <div className="shell footer-bottom">
        <span>© {year} {associationConfig.institutionalName}. Todos os direitos reservados.</span>
        {developerCredit.visible && (
          <span className="developer-credit">
            {developerCredit.url ? (
              <a href={developerCredit.url} target="_blank" rel="noopener noreferrer">
                Desenvolvido por <strong>{developerCredit.name}</strong>
              </a>
            ) : (
              <>Desenvolvido por <strong>{developerCredit.name}</strong></>
            )}
          </span>
        )}
      </div>
    </footer>
  );
}
