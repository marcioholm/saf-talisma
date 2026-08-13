import { SiteHeader, SiteFooter } from "../../../components/site-shell";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../../../lib/supabase";
import { associationConfig } from "../../../lib/association-config";
import Link from "next/link";
import { notFound } from "next/navigation";
import "@/app/public.css";

type ChampionshipDetail = {
  id: string;
  name: string;
  slug: string;
  banner_path: string | null;
  short_description: string | null;
  full_description: string | null;
  rules_text: string | null;
  category: string;
  modality: string;
  location_name: string | null;
  city: string | null;
  max_teams: number;
  min_athletes_per_team: number;
  max_athletes_per_team: number;
  max_staff_per_team: number;
  support_contact: string | null;
  visibility: string;
  registration_status: "scheduled" | "open" | "paused" | "closed";
};

async function getChampionshipBySlug(slug: string): Promise<ChampionshipDetail | null> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/championships?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 30 },
      }
    );
    if (res.ok) {
      const rows = await res.json();
      return rows[0] || null;
    }
  } catch (e) {
    console.error("Erro ao carregar detalhes do campeonato:", e);
  }
  return null;
}

export default async function ChampionshipDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const c = await getChampionshipBySlug(resolvedParams.slug);

  if (!c || c.visibility === "draft" || c.visibility === "archived") {
    notFound();
  }

  return (
    <main className="page-body">
      <SiteHeader active="/campeonatos" />
      <section className="page-hero">
        <div className="shell">
          <div className="eyebrow">{c.category.toUpperCase()} · {c.modality.toUpperCase()}</div>
          <h1>{c.name}</h1>
          <p>{c.short_description || `Campeonato oficial promovido pela ${associationConfig.institutionalName}.`}</p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px" }}>
          {/* Conteúdo principal */}
          <div>
            {c.banner_path && (
              <div style={{ marginBottom: 24, borderRadius: 8, overflow: "hidden" }}>
                <img src={publicFileUrl(c.banner_path)} alt={c.name} style={{ width: "100%", maxHeight: 360, objectFit: "cover" }} />
              </div>
            )}

            {c.full_description && (
              <div style={{ background: "#fff", padding: 24, borderRadius: 8, border: "1px solid #e0e0e0", marginBottom: 24 }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: 20 }}>Sobre o Campeonato</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "#444" }}>{c.full_description}</p>
              </div>
            )}

            {c.rules_text && (
              <div style={{ background: "#fff", padding: 24, borderRadius: 8, border: "1px solid #e0e0e0" }}>
                <h3 style={{ margin: "0 0 12px 0", fontSize: 20 }}>Regulamento e Instruções</h3>
                <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, color: "#333", background: "#fafafa", padding: 16, borderRadius: 6 }}>
                  {c.rules_text}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar de Informações & Inscrição */}
          <div>
            <div style={{ background: "#0d0d0d", color: "#fff", padding: 24, borderRadius: 8, position: "sticky", top: 20 }}>
              <span style={{ fontSize: 12, textTransform: "uppercase", color: "#61CE70", fontWeight: "bold" }}>STATUS DAS INSCRIÇÕES</span>
              <h3 style={{ margin: "4px 0 16px 0", fontSize: 22 }}>
                {c.registration_status === "open"
                  ? "Inscrições Abertas"
                  : c.registration_status === "paused"
                  ? "Inscrições Pausadas"
                  : c.registration_status === "closed"
                  ? "Inscrições Encerradas"
                  : "Em Breve"}
              </h3>

              <div style={{ borderTop: "1px solid #222", paddingTop: 16, marginBottom: 20, fontSize: 14, lineHeight: 1.8, color: "#ccc" }}>
                <div><strong>Vagas:</strong> {c.max_teams} equipes</div>
                <div><strong>Atletas por equipe:</strong> {c.min_athletes_per_team} a {c.max_athletes_per_team}</div>
                <div><strong>Comissão técnica:</strong> até {c.max_staff_per_team} membros</div>
                <div><strong>Local:</strong> {c.location_name || "Ginásio Chapelão"}</div>
                <div><strong>Cidade:</strong> {c.city || "Arapoti - PR"}</div>
              </div>

              {c.registration_status === "open" ? (
                <Link
                  href={`/campeonatos/${c.slug}/inscricao`}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px",
                    background: "#D200D2",
                    color: "#fff",
                    textAlign: "center",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    textDecoration: "none",
                    textTransform: "uppercase",
                  }}
                >
                  Inscreva sua equipe ➔
                </Link>
              ) : (
                <button
                  disabled
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#333",
                    color: "#888",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    fontSize: "15px",
                    cursor: "not-allowed",
                  }}
                >
                  {c.registration_status === "paused"
                    ? "Inscrições Pausadas"
                    : c.registration_status === "closed"
                    ? "Inscrições Encerradas"
                    : "Inscrições em Breve"}
                </button>
              )}

              {c.support_contact && (
                <div style={{ marginTop: 20, fontSize: 12, color: "#aaa", textAlign: "center" }}>
                  Dúvidas? Suporte: <strong>{c.support_contact}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
