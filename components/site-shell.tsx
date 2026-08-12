"use client";

import { useState } from "react";
import Link from "next/link";
import NewsletterForm from "./newsletter-form";

function Mark({ small = false }: { small?: boolean }) {
  return (
    <div className={`mark mark-logo ${small ? "mark-small" : ""}`} aria-label="SAF Talismã">
      <img src="/logo-saf.svg" alt="SAF Talismã" />
    </div>
  );
}

const NAV = [
  { href: "/", label: "Início" },
  { href: "/noticias", label: "Notícias" },
  { href: "/jogos", label: "Jogos" },
  { href: "/transparencia", label: "Transparência" },
  { href: "/sobre", label: "O clube" },
  { href: "/patrocinadores", label: "Patrocinadores" },
];

export function SiteHeader({ active = "" }: { active?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="topline">
        <div className="shell topline-inner">
          <span>O clube do Norte Pioneiro</span>
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
  return (
    <footer className="site-footer">
      <div className="newsletter-strip">
        <div className="shell newsletter-inner">
          <NewsletterForm />
        </div>
      </div>
      <div className="shell footer-grid">
        <div>
          <Mark />
          <p>
            Futsal, formação e futuro.
            <br />
            De Wenceslau Braz para o mundo.
          </p>
        </div>
        <div>
          <strong>CLUBE</strong>
          <Link href="/sobre">Nossa história</Link>
          <Link href="/sobre">Categorias</Link>
          <Link href="/jogos">Jogos</Link>
        </div>
        <div>
          <strong>ACOMPANHE</strong>
          <Link href="/noticias">Notícias</Link>
          <Link href="/transparencia">Transparência</Link>
          <Link href="/patrocinadores">Patrocinadores</Link>
        </div>
        <div>
          <strong>CONTATO</strong>
          <span>Wenceslau Braz · Paraná</span>
          <a className="footer-contact" href="mailto:contato@saftalisma.com.br">
            contato@saftalisma.com.br
          </a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 SAF Talismã. Todos os direitos reservados.</span>
        <span>FEITO COM RAÇA NO NORTE PIONEIRO.</span>
      </div>
    </footer>
  );
}
