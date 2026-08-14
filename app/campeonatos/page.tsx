import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../../lib/supabase";
import { associationConfig } from "../../lib/association-config";
import Link from "next/link";
import "../public.css";
import { type Metadata } from "next";
import { SITE, OG_IMAGE_DEFAULT, breadcrumbJsonLd } from "../../lib/seo";

type Championship = {
  id: string;
  name: string;
  slug: string;
  banner_path: string | null;
  short_description: string | null;
  category: string;
  modality: string;
  location_name: string | null;
  city: string | null;
  max_teams: number;
  visibility: string;
  registration_status: "scheduled" | "open" | "paused" | "closed";
};

async function getChampionships(): Promise<Championship[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/championships?select=id,name,slug,banner_path,short_description,category,modality,location_name,city,max_teams,visibility,registration_status&visibility=eq.published&order=created_at.desc`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Erro ao carregar campeonatos:", e);
  }
  return [];
}

const REG_STATUS_LABEL: Record<Championship["registration_status"], { label: string; color: string }> = {
  scheduled: { label: "Inscrições em breve", color: "#8a8a8a" },
  open: { label: "Inscrições Abertas", color: "#61CE70" },
  paused: { label: "Inscrições Pausadas", color: "#ffb74d" },
  closed: { label: "Inscrições Encerradas", color: "#e57373" },
};

export const metadata: Metadata = {
  title: `Campeonatos | ${associationConfig.name}`,
  description: `Acompanhe os campeonatos e eventos esportivos organizados pela ${associationConfig.name}.`,
  alternates: { canonical: `${SITE}/campeonatos` },
  openGraph: {
    title: `Campeonatos | ${associationConfig.name}`,
    description: `Acompanhe os campeonatos e eventos esportivos organizados pela ${associationConfig.name}.`,
    url: `${SITE}/campeonatos`,
    type: "website",
    images: [{ url: OG_IMAGE_DEFAULT }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Campeonatos | ${associationConfig.name}`,
    description: `Acompanhe os campeonatos e eventos esportivos organizados pela ${associationConfig.name}.`,
    images: [OG_IMAGE_DEFAULT],
  },
};

export default async function PublicCampeonatosPage() {
  const championships = await getChampionships();

  return (
    <main className="page-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbJsonLd([
            { name: "Início", url: SITE },
            { name: "Campeonatos", url: `${SITE}/campeonatos` },
          ]),
        }}
      />
      <SiteHeader active="/campeonatos" />
      <section className="page-hero">
        <div className="shell">
          <div className="eyebrow">TORNEIOS E COMPETIÇÕES</div>
          <h1>
            Campeonatos da <em>Associação</em>
          </h1>
          <p>Confira as competições oficiais promovidas e apoiadas pela {associationConfig.institutionalName}.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          {championships.length === 0 ? (
            <div className="empty">
              <strong>Nenhum campeonato publicado no momento</strong>
              <p style={{ marginTop: 8 }}>Fique atento às nossas redes sociais para o lançamento de futuros torneios!</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "24px",
              }}
            >
              {championships.map((c) => {
                const regInfo = REG_STATUS_LABEL[c.registration_status] || REG_STATUS_LABEL.scheduled;
                return (
                  <div
                    key={c.id}
                    style={{
                      background: "#fff",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {c.banner_path ? (
                      <img
                        src={publicFileUrl(c.banner_path)}
                        alt={c.name}
                        style={{ width: "100%", height: 180, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: 140,
                          background: "#0d0d0d",
                          color: "#61CE70",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 22,
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: "bold",
                        }}
                      >
                        {c.name}
                      </div>
                    )}

                    <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            color: "#D200D2",
                          }}
                        >
                          {c.category} · {c.modality}
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "bold",
                            color: regInfo.color,
                            background: "rgba(0,0,0,0.05)",
                            padding: "4px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {regInfo.label}
                        </span>
                      </div>

                      <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", lineHeight: 1.3 }}>{c.name}</h3>

                      {c.short_description && (
                        <p style={{ fontSize: "13.5px", color: "#666", lineHeight: 1.4, margin: "0 0 16px 0", flex: 1 }}>
                          {c.short_description}
                        </p>
                      )}

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                        <span style={{ fontSize: "12px", color: "#888" }}>
                          📍 {c.location_name || c.city || "Arapoti - PR"}
                        </span>

                        <Link
                          href={`/campeonatos/${c.slug}`}
                          style={{
                            padding: "8px 16px",
                            background: "#0d0d0d",
                            color: "#fff",
                            borderRadius: "4px",
                            textDecoration: "none",
                            fontSize: "13px",
                            fontWeight: "bold",
                          }}
                        >
                          Ver Campeonato
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
