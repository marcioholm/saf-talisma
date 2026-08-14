import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../../lib/supabase";
import { associationConfig } from "../../lib/association-config";
import "../public.css";
import { type Metadata } from "next";
import { SITE, OG_IMAGE_DEFAULT, breadcrumbJsonLd } from "../../lib/seo";

type BoardMember = {
  id: string;
  full_name: string;
  role: string;
  short_bio: string | null;
  photo_path: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  display_order: number;
  is_active?: boolean;
  is_public?: boolean;
};

async function getBoardMembers(): Promise<BoardMember[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?select=valor&chave=eq.diretoria_membros`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 30 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      const list = data?.[0]?.valor;
      if (Array.isArray(list)) {
        return list
          .filter((m: BoardMember) => m.is_active !== false && m.is_public !== false)
          .sort((a: BoardMember, b: BoardMember) => (a.display_order ?? 0) - (b.display_order ?? 0));
      }
    }
  } catch (e) {
    console.error("Erro ao carregar diretoria:", e);
  }
  return [];
  return [];
}

export const metadata: Metadata = {
  title: `Diretoria | ${associationConfig.name}`,
  description: `Conheça a diretoria e as pessoas responsáveis pela gestão e desenvolvimento da ${associationConfig.institutionalName}.`,
  alternates: { canonical: `${SITE}/diretoria` },
  openGraph: {
    title: `Diretoria | ${associationConfig.name}`,
    description: `Conheça a diretoria e as pessoas responsáveis pela gestão e desenvolvimento da ${associationConfig.institutionalName}.`,
    url: `${SITE}/diretoria`,
    type: "website",
    images: [{ url: OG_IMAGE_DEFAULT }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Diretoria | ${associationConfig.name}`,
    description: `Conheça a diretoria e as pessoas responsáveis pela gestão e desenvolvimento da ${associationConfig.institutionalName}.`,
    images: [OG_IMAGE_DEFAULT],
  },
};

export default async function DiretoriaPage() {
  const members = await getBoardMembers();

  return (
    <main className="page-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbJsonLd([
            { name: "Início", url: SITE },
            { name: "Diretoria", url: `${SITE}/diretoria` },
          ]),
        }}
      />
      <SiteHeader active="/diretoria" />
      <section className="page-hero">
        <div className="shell">
          <div className="eyebrow">GESTÃO INSTITUCIONAL</div>
          <h1>
            Diretoria da <em>Associação</em>
          </h1>
          <p>Conheça as pessoas responsáveis pela gestão e pelo desenvolvimento da {associationConfig.institutionalName}.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          {members.length === 0 ? (
            <div className="empty">
              <strong>Membros em atualização</strong>
              <p style={{ marginTop: 8 }}>As informações oficiais da Diretoria serão disponibilizadas em breve.</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "24px",
              }}
            >
              {members.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "24px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {m.photo_path ? (
                    <img
                      src={publicFileUrl(m.photo_path)}
                      alt={m.full_name}
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: 16,
                        border: "3px solid #61CE70",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        background: "#0d0d0d",
                        color: "#61CE70",
                        display: "grid",
                        placeItems: "center",
                        fontSize: "32px",
                        fontWeight: "bold",
                        marginBottom: 16,
                        fontFamily: "'Barlow Condensed', sans-serif",
                      }}
                    >
                      {m.full_name.charAt(0)}
                    </div>
                  )}

                  <h3 style={{ margin: "0 0 4px 0", fontSize: "20px" }}>{m.full_name}</h3>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "12px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      color: "#D200D2",
                      letterSpacing: "1px",
                      marginBottom: 12,
                    }}
                  >
                    {m.role}
                  </span>

                  {m.short_bio && (
                    <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.5, margin: "0 0 16px 0" }}>
                      {m.short_bio}
                    </p>
                  )}

                  <div style={{ display: "flex", gap: "12px", marginTop: "auto", flexWrap: "wrap", justifyContent: "center" }}>
                    {m.instagram_url && (
                      <a
                        href={m.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px",
                          color: "#61CE70",
                          textDecoration: "none",
                          fontWeight: "bold",
                        }}
                      >
                        Instagram →
                      </a>
                    )}
                    {m.linkedin_url && (
                      <a
                        href={m.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "12px",
                          color: "#D200D2",
                          textDecoration: "none",
                          fontWeight: "bold",
                        }}
                      >
                        LinkedIn →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
