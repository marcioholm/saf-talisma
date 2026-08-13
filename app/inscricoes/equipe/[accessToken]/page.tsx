import { SiteHeader, SiteFooter } from "../../../../components/site-shell";
import { supabaseUrl, supabaseAnonKey } from "../../../../lib/supabase";
import { notFound } from "next/navigation";
import "@/app/public.css";

type RegistrationDetail = {
  id: string;
  protocol: string;
  team_name: string;
  city: string;
  state: string;
  colors: string | null;
  status: "pending" | "email_verified" | "under_review" | "correction_requested" | "approved" | "rejected" | "cancelled";
  status_notes: string | null;
  created_at: string;
  championships: { name: string; category: string } | null;
  team_responsible_contacts: { full_name: string; email: string; phone: string } | null;
  registration_athletes: Array<{ full_name: string; jersey_number: number; position: string }>;
};

async function getRegistrationByToken(token: string): Promise<RegistrationDetail | null> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/team_registrations?select=*,championships(name,category),team_responsible_contacts(full_name,email,phone),registration_athletes(full_name,jersey_number,position)&access_token=eq.${encodeURIComponent(token)}&limit=1`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 10 },
      }
    );
    if (res.ok) {
      const rows = await res.json();
      return rows[0] || null;
    }
  } catch (e) {
    console.error("Erro ao carregar detalhes da inscrição:", e);
  }
  return null;
}

const STATUS_MAP: Record<RegistrationDetail["status"], { label: string; color: string; desc: string }> = {
  pending: { label: "Em Análise Inicial", color: "#ffa726", desc: "Sua inscrição foi recebida e aguarda revisão da comissão organizadora." },
  email_verified: { label: "E-mail Verificado", color: "#42a5f5", desc: "Seu contato foi verificado e a equipe está na fila de análise." },
  under_review: { label: "Em Análise pela Comissão", color: "#ab47bc", desc: "A documentação da equipe está sendo verificada." },
  correction_requested: { label: "Correções Solicitadas", color: "#ef5350", desc: "Foram identificadas pendências na inscrição. Veja as instruções abaixo." },
  approved: { label: "Inscrição Aprovada", color: "#66bb6a", desc: "Sua equipe está oficialmente inscrita na competição!" },
  rejected: { label: "Inscrição Rejeitada", color: "#e53935", desc: "Infelizmente a inscrição não atendeu aos critérios." },
  cancelled: { label: "Inscrição Cancelada", color: "#78909c", desc: "A inscrição foi cancelada a pedido da equipe ou por prazo expirado." },
};

export default async function TeamTrackingPage({ params }: { params: Promise<{ accessToken: string }> }) {
  const resolvedParams = await params;
  const reg = await getRegistrationByToken(resolvedParams.accessToken);

  if (!reg) {
    notFound();
  }

  const statusInfo = STATUS_MAP[reg.status] || STATUS_MAP.pending;

  return (
    <main className="page-body">
      <SiteHeader />
      <section className="page-hero" style={{ padding: "40px 0" }}>
        <div className="shell">
          <div className="eyebrow">PORTAL DO RESPONSÁVEL</div>
          <h1>Acompanhamento de Inscrição</h1>
          <p>Protocolo: <strong>{reg.protocol}</strong></p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell" style={{ maxWidth: 800 }}>
          {/* Card de Status */}
          <div
            style={{
              background: "#fff",
              border: `2px solid ${statusInfo.color}`,
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                color: statusInfo.color,
                letterSpacing: "1px",
              }}
            >
              STATUS DA INSCRIÇÃO
            </span>
            <h2 style={{ margin: "4px 0 8px 0", color: "#111" }}>{statusInfo.label}</h2>
            <p style={{ margin: 0, color: "#555", fontSize: "14.5px" }}>{statusInfo.desc}</p>

            {reg.status_notes && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  background: "#fff8e1",
                  borderLeft: "4px solid #ffb300",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                <strong>Observações da Organização:</strong>
                <p style={{ margin: "4px 0 0 0", color: "#333" }}>{reg.status_notes}</p>
              </div>
            )}
          </div>

          {/* Dados da Equipe */}
          <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid #e0e0e0", marginBottom: "24px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "20px" }}>Resumo da Equipe</h3>
            <p style={{ margin: "0 0 8px 0" }}><strong>Campeonato:</strong> {reg.championships?.name || "Campeonato SAF Talismã"}</p>
            <p style={{ margin: "0 0 8px 0" }}><strong>Equipe:</strong> {reg.team_name} ({reg.city} - {reg.state})</p>
            <p style={{ margin: "0 0 8px 0" }}><strong>Responsável:</strong> {reg.team_responsible_contacts?.full_name} ({reg.team_responsible_contacts?.email})</p>
          </div>

          {/* Lista de Atletas */}
          <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "20px" }}>Atletas Cadastrados ({reg.registration_athletes?.length || 0})</h3>
            <table className="admin-table" style={{ width: "100%", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Nome do Atleta</th>
                  <th>Posição</th>
                </tr>
              </thead>
              <tbody>
                {reg.registration_athletes?.map((a, i) => (
                  <tr key={i}>
                    <td><strong>{a.jersey_number || i + 1}</strong></td>
                    <td>{a.full_name}</td>
                    <td>{a.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
