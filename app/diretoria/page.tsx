import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../../lib/supabase";
import { associationConfig } from "../../lib/association-config";
import "../public.css";

type BoardMember = {
  id: string;
  full_name: string;
  role: string;
  short_bio: string | null;
  photo_path: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  display_order: number;
};

async function getBoardMembers(): Promise<BoardMember[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/association_board_members?select=id,full_name,role,short_bio,photo_path,instagram_url,linkedin_url,display_order&is_active=eq.true&is_public=eq.true&archived_at=is.null&order=display_order.asc`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Erro ao carregar diretoria:", e);
  }
  return [];
}

export default async function DiretoriaPage() {
  const members = await getBoardMembers();

  return (
    <main className="page-body">
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
                      📷 Instagram
                    </a>
                  )}
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
