"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/site-shell";
import { associationConfig } from "@/lib/association-config";
import "@/app/public.css";

type ChampionshipInfo = {
  id: string;
  name: string;
  slug: string;
  category: string;
  min_athletes_per_team: number;
  max_athletes_per_team: number;
  max_staff_per_team: number;
  rules_text: string | null;
  registration_status: string;
};

export default function TeamRegistrationPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const [champ, setChamp] = useState<ChampionshipInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [protocolResult, setProtocolResult] = useState<{ protocol: string; tracking_url: string } | null>(null);

  // Form State
  const [team, setTeam] = useState({ team_name: "", short_name: "", city: "Arapoti", state: "PR", colors: "", notes: "" });
  const [responsible, setResponsible] = useState({ full_name: "", role: "Representante", email: "", email_confirm: "", phone: "", city: "Arapoti", state: "PR" });
  const [staff, setStaff] = useState<Array<{ full_name: string; role: string }>>([
    { full_name: "", role: "Técnico" },
  ]);
  const [athletes, setAthletes] = useState<Array<{ full_name: string; sports_name: string; birth_date: string; jersey_number: number; position: string }>>([
    { full_name: "", sports_name: "", birth_date: "", jersey_number: 1, position: "Goleiro" },
    { full_name: "", sports_name: "", birth_date: "", jersey_number: 2, position: "Fixo" },
    { full_name: "", sports_name: "", birth_date: "", jersey_number: 3, position: "Ala" },
    { full_name: "", sports_name: "", birth_date: "", jersey_number: 4, position: "Ala" },
    { full_name: "", sports_name: "", birth_date: "", jersey_number: 5, position: "Pivô" },
  ]);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [futureCampaignsAccepted, setFutureCampaignsAccepted] = useState(false);

  useEffect(() => {
    if (slug) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zompnocfdlofhsyuiuhj.supabase.co";
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_xfyG0CUyTWHk1JDesbUG8w_FVsOF56o";

      fetch(`${supabaseUrl}/rest/v1/championships?select=id,name,slug,category,min_athletes_per_team,max_athletes_per_team,max_staff_per_team,rules_text,registration_status&slug=eq.${encodeURIComponent(slug)}&limit=1`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      })
        .then((r) => r.json())
        .then((rows) => {
          if (rows[0]) setChamp(rows[0]);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  function handleAddStaff() {
    if (champ && staff.length >= (champ.max_staff_per_team || 3)) return;
    setStaff([...staff, { full_name: "", role: "Auxiliar Técnico" }]);
  }

  function handleAddAthlete() {
    if (champ && athletes.length >= (champ.max_athletes_per_team || 15)) return;
    setAthletes([...athletes, { full_name: "", sports_name: "", birth_date: "", jersey_number: athletes.length + 1, position: "Linha" }]);
  }

  function handleRemoveAthlete(idx: number) {
    if (athletes.length <= (champ?.min_athletes_per_team || 5)) {
      alert(`Mínimo de ${champ?.min_athletes_per_team || 5} atletas obrigatórios.`);
      return;
    }
    setAthletes(athletes.filter((_, i) => i !== idx));
  }

  async function handleSubmitRegistration() {
    setError("");

    if (responsible.email !== responsible.email_confirm) {
      setError("Confirmação de e-mail não confere.");
      return;
    }

    if (!rulesAccepted || !privacyAccepted) {
      setError("É necessário aceitar os termos do regulamento e política de privacidade.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/campeonatos/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          championship_slug: slug,
          team,
          responsible,
          staff,
          athletes,
          rules_accepted: rulesAccepted,
          privacy_accepted: privacyAccepted,
          future_campaigns_accepted: futureCampaignsAccepted,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao enviar inscrição.");

      setProtocolResult({ protocol: data.protocol, tracking_url: data.tracking_url });
      setStep(7); // Final step
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no envio.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="empty-state">Carregando formulário de inscrição…</div>;
  if (!champ || champ.registration_status !== "open") {
    return (
      <main className="page-body">
        <SiteHeader />
        <div className="shell" style={{ padding: "60px 20px", textAlign: "center" }}>
          <h2>Inscrições Indisponíveis</h2>
          <p>As inscrições para este campeonato não estão abertas no momento.</p>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="page-body">
      <SiteHeader active="/campeonatos" />
      <section className="page-hero" style={{ padding: "40px 0" }}>
        <div className="shell">
          <div className="eyebrow">FORMULÁRIO DE INSCRIÇÃO</div>
          <h1>{champ.name}</h1>
          <p>Preencha os dados da sua equipe para participar da competição.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell" style={{ maxWidth: 800 }}>
          {/* Indicador de Passos */}
          {step < 7 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30, background: "#fafafa", padding: 16, borderRadius: 8, border: "1px solid #e0e0e0" }}>
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} style={{ fontWeight: step === s ? "bold" : "normal", color: step === s ? "#D200D2" : step > s ? "#61CE70" : "#aaa", fontSize: 14 }}>
                  {s === 1 ? "1. Regulamento" : s === 2 ? "2. Equipe" : s === 3 ? "3. Responsável" : s === 4 ? "4. Comissão" : s === 5 ? "5. Atletas" : "6. Revisão"}
                </div>
              ))}
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

          {/* PASSO 1 — Regulamento */}
          {step === 1 && (
            <div style={{ background: "#fff", padding: 24, borderRadius: 8, border: "1px solid #ddd" }}>
              <h2 style={{ marginTop: 0 }}>Passo 1: Regulamento &amp; Requisitos</h2>
              <div style={{ maxHeight: 240, overflowY: "auto", background: "#f9f9f9", padding: 16, borderRadius: 6, fontSize: 13.5, lineHeight: 1.6, marginBottom: 20 }}>
                {champ.rules_text || "Regulamento oficial da Associação Esportiva SAF/Talismã. Respeito às regras da competição, vestuário adequado e pontualidade."}
              </div>

              <label style={{ display: "block", marginBottom: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={rulesAccepted} onChange={(e) => setRulesAccepted(e.target.checked)} />
                {" "}Declaro que li e concordo integralmente com o regulamento oficial do campeonato.
              </label>
              <label style={{ display: "block", marginBottom: 24, cursor: "pointer" }}>
                <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} />
                {" "}Concordo com a Política de Privacidade e tratamento de dados para a competição.
              </label>

              <button disabled={!rulesAccepted || !privacyAccepted} className="btn btn-magenta" onClick={() => setStep(2)}>
                Avançar para Dados da Equipe ➔
              </button>
            </div>
          )}

          {/* PASSO 2 — Equipe */}
          {step === 2 && (
            <div style={{ background: "#fff", padding: 24, borderRadius: 8, border: "1px solid #ddd" }}>
              <h2 style={{ marginTop: 0 }}>Passo 2: Dados da Equipe</h2>
              <div className="admin-form-grid">
                <div className="field field-full">
                  <label htmlFor="team_name">Nome da Equipe / Clube</label>
                  <input id="team_name" value={team.team_name} onChange={(e) => setTeam({ ...team, team_name: e.target.value })} required />
                </div>
                <div className="field">
                  <label htmlFor="city">Cidade</label>
                  <input id="city" value={team.city} onChange={(e) => setTeam({ ...team, city: e.target.value })} required />
                </div>
                <div className="field">
                  <label htmlFor="colors">Cores Principais do Uniforme</label>
                  <input id="colors" value={team.colors} onChange={(e) => setTeam({ ...team, colors: e.target.value })} placeholder="Ex: Verde e Preto" />
                </div>
              </div>
              <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>Voltar</button>
                <button disabled={!team.team_name} className="btn btn-magenta" onClick={() => setStep(3)}>Avançar para Responsável ➔</button>
              </div>
            </div>
          )}

          {/* PASSO 3 — Responsável */}
          {step === 3 && (
            <div style={{ background: "#fff", padding: 24, borderRadius: 8, border: "1px solid #ddd" }}>
              <h2 style={{ marginTop: 0 }}>Passo 3: Representante Legal / Responsável</h2>
              <div className="admin-form-grid">
                <div className="field field-full">
                  <label htmlFor="resp_name">Nome Completo do Responsável</label>
                  <input id="resp_name" value={responsible.full_name} onChange={(e) => setResponsible({ ...responsible, full_name: e.target.value })} required />
                </div>
                <div className="field">
                  <label htmlFor="resp_role">Função / Cargo na Equipe</label>
                  <input id="resp_role" value={responsible.role} onChange={(e) => setResponsible({ ...responsible, role: e.target.value })} placeholder="Técnico, Dirigente..." />
                </div>
                <div className="field">
                  <label htmlFor="resp_phone">Telefone / WhatsApp</label>
                  <input id="resp_phone" value={responsible.phone} onChange={(e) => setResponsible({ ...responsible, phone: e.target.value })} required />
                </div>
                <div className="field">
                  <label htmlFor="resp_email">E-mail para Notificações</label>
                  <input id="resp_email" type="email" value={responsible.email} onChange={(e) => setResponsible({ ...responsible, email: e.target.value })} required />
                </div>
                <div className="field">
                  <label htmlFor="resp_email_confirm">Confirme o E-mail</label>
                  <input id="resp_email_confirm" type="email" value={responsible.email_confirm} onChange={(e) => setResponsible({ ...responsible, email_confirm: e.target.value })} required />
                </div>
              </div>

              <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(2)}>Voltar</button>
                <button disabled={!responsible.full_name || !responsible.email || !responsible.phone} className="btn btn-magenta" onClick={() => setStep(4)}>Avançar para Comissão ➔</button>
              </div>
            </div>
          )}

          {/* PASSO 4 — Comissão */}
          {step === 4 && (
            <div style={{ background: "#fff", padding: 24, borderRadius: 8, border: "1px solid #ddd" }}>
              <h2 style={{ marginTop: 0 }}>Passo 4: Comissão Técnica</h2>
              {staff.map((s, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <input placeholder="Nome Completo" value={s.full_name} onChange={(e) => {
                    const newStaff = [...staff];
                    newStaff[idx].full_name = e.target.value;
                    setStaff(newStaff);
                  }} />
                  <input placeholder="Função (Ex: Técnico, Auxiliar)" value={s.role} onChange={(e) => {
                    const newStaff = [...staff];
                    newStaff[idx].role = e.target.value;
                    setStaff(newStaff);
                  }} />
                </div>
              ))}
              {staff.length < (champ.max_staff_per_team || 3) && (
                <button className="btn btn-xs btn-outline" onClick={handleAddStaff}>+ Adicionar Membro da Comissão</button>
              )}
              <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(3)}>Voltar</button>
                <button className="btn btn-magenta" onClick={() => setStep(5)}>Avançar para Atletas ➔</button>
              </div>
            </div>
          )}

          {/* PASSO 5 — Atletas */}
          {step === 5 && (
            <div style={{ background: "#fff", padding: 24, borderRadius: 8, border: "1px solid #ddd" }}>
              <h2 style={{ marginTop: 0 }}>Passo 5: Cadastro dos Atletas ({athletes.length} de máx {champ.max_athletes_per_team})</h2>
              {athletes.map((a, idx) => (
                <div key={idx} style={{ background: "#fafafa", padding: 12, borderRadius: 6, marginBottom: 12, border: "1px solid #eee" }}>
                  <div style={{ fontWeight: "bold", fontSize: 13, marginBottom: 6 }}>Atleta #{idx + 1}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10 }}>
                    <input placeholder="Nome Completo" value={a.full_name} onChange={(e) => {
                      const copy = [...athletes];
                      copy[idx].full_name = e.target.value;
                      setAthletes(copy);
                    }} required />
                    <input type="date" value={a.birth_date} onChange={(e) => {
                      const copy = [...athletes];
                      copy[idx].birth_date = e.target.value;
                      setAthletes(copy);
                    }} required />
                    <input placeholder="Camisa Nº" type="number" value={a.jersey_number} onChange={(e) => {
                      const copy = [...athletes];
                      copy[idx].jersey_number = Number(e.target.value);
                      setAthletes(copy);
                    }} />
                    <input placeholder="Posição" value={a.position} onChange={(e) => {
                      const copy = [...athletes];
                      copy[idx].position = e.target.value;
                      setAthletes(copy);
                    }} />
                  </div>
                  {athletes.length > (champ.min_athletes_per_team || 5) && (
                    <button className="btn btn-xs btn-danger" style={{ marginTop: 8 }} onClick={() => handleRemoveAthlete(idx)}>Remover</button>
                  )}
                </div>
              ))}
              {athletes.length < (champ.max_athletes_per_team || 15) && (
                <button className="btn btn-xs btn-outline" onClick={handleAddAthlete}>+ Adicionar Atleta</button>
              )}
              <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(4)}>Voltar</button>
                <button className="btn btn-magenta" onClick={() => setStep(6)}>Avançar para Revisão ➔</button>
              </div>
            </div>
          )}

          {/* PASSO 6 — Revisão & Consentimento */}
          {step === 6 && (
            <div style={{ background: "#fff", padding: 24, borderRadius: 8, border: "1px solid #ddd" }}>
              <h2 style={{ marginTop: 0 }}>Passo 6: Revisão e Envio</h2>
              <div style={{ background: "#fafafa", padding: 16, borderRadius: 6, marginBottom: 20, fontSize: 14 }}>
                <p><strong>Equipe:</strong> {team.team_name} ({team.city})</p>
                <p><strong>Responsável:</strong> {responsible.full_name} ({responsible.email})</p>
                <p><strong>Total de Atletas:</strong> {athletes.length} atletas cadastrados</p>
              </div>

              <label style={{ display: "block", marginBottom: 20, cursor: "pointer", fontSize: 13.5 }}>
                <input type="checkbox" checked={futureCampaignsAccepted} onChange={(e) => setFutureCampaignsAccepted(e.target.checked)} />
                {" "}Quero receber por e-mail convites e informações sobre os próximos campeonatos e eventos da Associação Esportiva SAF/Talismã. (Opcional)
              </label>

              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setStep(5)}>Voltar</button>
                <button disabled={submitting} className="btn btn-magenta" onClick={handleSubmitRegistration}>
                  {submitting ? "Enviando..." : "Confirmar e Enviar Inscrição"}
                </button>
              </div>
            </div>
          )}

          {/* PASSO 7 — Sucesso & Protocolo */}
          {step === 7 && protocolResult && (
            <div style={{ background: "#fff", padding: 32, borderRadius: 8, border: "2px solid #61CE70", textAlign: "center" }}>
              <h2 style={{ color: "#2e9c41", marginTop: 0 }}>Inscrição Realizada com Sucesso!</h2>
              <p>Obrigado! A inscrição da equipe <strong>{team.team_name}</strong> foi recebida.</p>

              <div style={{ background: "#f5f5f5", padding: 20, borderRadius: 6, margin: "24px 0" }}>
                <span style={{ fontSize: 12, textTransform: "uppercase", color: "#666" }}>PROTOCOLO DE ACOMPANHAMENTO</span>
                <h3 style={{ fontSize: 28, margin: "4px 0", color: "#D200D2", letterSpacing: 1 }}>{protocolResult.protocol}</h3>
                <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
                  Enviamos uma cópia para <strong>{responsible.email}</strong> com os detalhes.
                </p>
              </div>

              <a href={protocolResult.tracking_url} className="btn btn-magenta" style={{ textDecoration: "none" }}>
                Acessar Portal do Responsável ➔
              </a>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
