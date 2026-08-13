"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAdminClient, fmtDate } from "@/lib/admin-client";

type FullRegistration = {
  id: string;
  protocol: string;
  access_token: string;
  team_name: string;
  short_name: string;
  city: string;
  state: string;
  colors: string;
  notes: string;
  status: string;
  status_notes: string;
  created_at: string;
  team_responsible_contacts: { full_name: string; role: string; email: string; phone: string; city: string } | null;
  team_staff: Array<{ full_name: string; role: string; document_number: string | null }>;
  registration_athletes: Array<{ full_name: string; sports_name: string; birth_date: string; jersey_number: number; position: string }>;
};

export default function AdminRegistrationDetailPage() {
  const params = useParams();
  const champId = params?.id as string;
  const regId = params?.registrationId as string;

  const [reg, setReg] = useState<FullRegistration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (regId) loadDetail();
  }, [regId]);

  async function loadDetail() {
    setLoading(true);
    const client = getAdminClient();
    const { data, error } = await client
      .from("team_registrations")
      .select("*, team_responsible_contacts(*), team_staff(*), registration_athletes(*)")
      .eq("id", regId)
      .single();

    if (error) {
      console.warn("Erro ao carregar detalhes:", error.message);
    } else {
      setReg(data as FullRegistration);
    }
    setLoading(false);
  }

  if (loading) return <div className="empty-state">Carregando detalhes da inscrição…</div>;
  if (!reg) return <div className="empty-state">Inscrição não encontrada.</div>;

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div>
          <h1>Detalhes da Inscrição: {reg.team_name}</h1>
          <p>Protocolo: <code>{reg.protocol}</code> · Data: {fmtDate(reg.created_at)}</p>
        </div>
        <Link href={`/admin/campeonatos/${champId}/inscricoes`} className="btn btn-outline">
          ← Voltar às Inscrições
        </Link>
      </div>

      <div className="admin-form-grid" style={{ marginBottom: 24 }}>
        {/* Responsável */}
        <div className="admin-card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Responsável da Equipe</h3>
          <p><strong>Nome:</strong> {reg.team_responsible_contacts?.full_name}</p>
          <p><strong>Função:</strong> {reg.team_responsible_contacts?.role}</p>
          <p><strong>E-mail:</strong> {reg.team_responsible_contacts?.email}</p>
          <p><strong>Telefone:</strong> {reg.team_responsible_contacts?.phone}</p>
        </div>

        {/* Equipe */}
        <div className="admin-card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Dados da Equipe</h3>
          <p><strong>Nome:</strong> {reg.team_name} ({reg.short_name})</p>
          <p><strong>Cidade/UF:</strong> {reg.city} - {reg.state}</p>
          <p><strong>Cores:</strong> {reg.colors || "Não informadas"}</p>
          <p><strong>Status:</strong> <span className="badge">{reg.status}</span></p>
        </div>
      </div>

      {/* Comissão Técnica */}
      <div className="admin-card" style={{ marginBottom: 24, padding: 20 }}>
        <h3 style={{ marginTop: 0 }}>Comissão Técnica ({reg.team_staff?.length || 0})</h3>
        {reg.team_staff?.length === 0 ? (
          <p style={{ color: "#888" }}>Nenhum membro da comissão cadastrado.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Função</th>
              </tr>
            </thead>
            <tbody>
              {reg.team_staff?.map((s, i) => (
                <tr key={i}>
                  <td><strong>{s.full_name}</strong></td>
                  <td>{s.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Atletas */}
      <div className="admin-card" style={{ padding: 20 }}>
        <h3 style={{ marginTop: 0 }}>Atletas Inscritos ({reg.registration_athletes?.length || 0})</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Nome Completo</th>
              <th>Nome Esportivo</th>
              <th>Data Nasc.</th>
              <th>Posição</th>
            </tr>
          </thead>
          <tbody>
            {reg.registration_athletes?.map((a, i) => (
              <tr key={i}>
                <td><strong>{a.jersey_number || i + 1}</strong></td>
                <td>{a.full_name}</td>
                <td>{a.sports_name}</td>
                <td>{a.birth_date}</td>
                <td>{a.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
