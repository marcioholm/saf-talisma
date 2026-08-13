"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAdminClient, fmtDate } from "@/lib/admin-client";

type RegistrationItem = {
  id: string;
  protocol: string;
  team_name: string;
  city: string;
  status: "pending" | "email_verified" | "under_review" | "correction_requested" | "approved" | "rejected" | "cancelled";
  status_notes: string | null;
  created_at: string;
  team_responsible_contacts: { full_name: string; email: string; phone: string } | null;
};

export default function AdminChampionshipRegistrationsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    if (id) loadRegistrations();
  }, [id]);

  async function loadRegistrations() {
    setLoading(true);
    const client = getAdminClient();
    const { data, error } = await client
      .from("team_registrations")
      .select("*, team_responsible_contacts(full_name, email, phone)")
      .eq("championship_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Aviso ao carregar inscrições:", error.message);
      setItems([]);
    } else {
      setItems((data as RegistrationItem[]) || []);
    }
    setLoading(false);
  }

  async function handleUpdateStatus(reg: RegistrationItem, nextStatus: RegistrationItem["status"]) {
    const notes = prompt(`Observações/instruções para a equipe (opcional):`, reg.status_notes || "");
    try {
      const client = getAdminClient();
      const { error } = await client
        .from("team_registrations")
        .update({
          status: nextStatus,
          status_notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reg.id);

      if (error) throw error;

      // Register status history
      const { data: session } = await client.auth.getSession();
      await client.from("registration_status_history").insert([
        {
          registration_id: reg.id,
          old_status: reg.status,
          new_status: nextStatus,
          changed_by: session.session?.user.email || "admin",
          notes: notes || null,
        },
      ]);

      setMessage({ type: "success", text: `Status da inscrição ${reg.protocol} atualizado para ${nextStatus}.` });
      await loadRegistrations();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao atualizar status." });
    }
  }

  if (loading) return <div className="empty-state">Carregando inscrições do campeonato…</div>;

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div>
          <h1>Inscrições do Campeonato</h1>
          <p>Análise, aprovação, solicitação de correções e gestão de equipes inscritas.</p>
        </div>
        <Link href={`/admin/campeonatos/${id}`} className="btn btn-outline">
          ← Voltar ao Campeonato
        </Link>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="admin-card">
        {items.length === 0 ? (
          <div className="empty-state">Nenhuma inscrição recebida para este campeonato ainda.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Protocolo</th>
                <th>Equipe</th>
                <th>Responsável</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((reg) => (
                <tr key={reg.id}>
                  <td>
                    <code style={{ fontWeight: "bold" }}>{reg.protocol}</code>
                  </td>
                  <td>
                    <strong>{reg.team_name}</strong>
                    <br />
                    <small style={{ color: "#888" }}>{reg.city}</small>
                  </td>
                  <td>
                    {reg.team_responsible_contacts?.full_name}
                    <br />
                    <small style={{ color: "#666" }}>{reg.team_responsible_contacts?.email}</small>
                  </td>
                  <td>{fmtDate(reg.created_at)}</td>
                  <td>
                    <select
                      value={reg.status}
                      onChange={(e) => handleUpdateStatus(reg, e.target.value as RegistrationItem["status"])}
                      style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}
                    >
                      <option value="pending">Pendente</option>
                      <option value="under_review">Em Análise</option>
                      <option value="correction_requested">Correção Solicitada</option>
                      <option value="approved">Aprovada</option>
                      <option value="rejected">Rejeitada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </td>
                  <td>
                    <Link
                      href={`/admin/campeonatos/${id}/inscricoes/${reg.id}`}
                      className="btn btn-xs btn-outline"
                    >
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
