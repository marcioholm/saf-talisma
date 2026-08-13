"use client";

import { useState, useEffect } from "react";
import { getAdminClient, uploadFile } from "../../../lib/admin-client";
import { publicFileUrl } from "../../../lib/supabase";

type BoardMember = {
  id: string;
  full_name: string;
  role: string;
  short_bio: string | null;
  photo_path: string | null;
  mandate_start: string | null;
  mandate_end: string | null;
  display_order: number;
  is_active: boolean;
  is_public: boolean;
  instagram_url: string | null;
  linkedin_url: string | null;
};

const EMPTY_MEMBER: Omit<BoardMember, "id"> = {
  full_name: "",
  role: "",
  short_bio: "",
  photo_path: null,
  mandate_start: null,
  mandate_end: null,
  display_order: 0,
  is_active: true,
  is_public: true,
  instagram_url: "",
  linkedin_url: "",
};

export default function AdminDiretoriaPage() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<BoardMember, "id">>(EMPTY_MEMBER);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    setLoading(true);
    const client = getAdminClient();
    const { data, error } = await client
      .from("association_board_members")
      .select("*")
      .is("archived_at", null)
      .order("display_order", { ascending: true });

    if (error) {
      // If table does not exist in local cache yet, gracefully set empty array
      console.warn("Aviso ao carregar diretoria:", error.message);
      setMembers([]);
    } else {
      setMembers((data as BoardMember[]) || []);
    }
    setLoading(false);
  }

  function handleOpenCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_MEMBER, display_order: members.length });
    setPhotoFile(null);
    setShowModal(true);
  }

  function handleOpenEdit(m: BoardMember) {
    setEditingId(m.id);
    setForm({
      full_name: m.full_name,
      role: m.role,
      short_bio: m.short_bio || "",
      photo_path: m.photo_path,
      mandate_start: m.mandate_start || null,
      mandate_end: m.mandate_end || null,
      display_order: m.display_order,
      is_active: m.is_active,
      is_public: m.is_public,
      instagram_url: m.instagram_url || "",
      linkedin_url: m.linkedin_url || "",
    });
    setPhotoFile(null);
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const client = getAdminClient();
      let photoPath = form.photo_path;

      if (photoFile) {
        photoPath = await uploadFile(client, "institutional", photoFile, "board");
      }

      const payload = {
        ...form,
        photo_path: photoPath,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await client
          .from("association_board_members")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        setMessage({ type: "success", text: "Membro da diretoria atualizado." });
      } else {
        const { error } = await client
          .from("association_board_members")
          .insert([payload]);
        if (error) throw error;
        setMessage({ type: "success", text: "Novo membro cadastrado com sucesso." });
      }

      setShowModal(false);
      await loadMembers();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive(id: string, name: string) {
    if (!confirm(`Deseja realmente arquivar o membro "${name}"?`)) return;
    try {
      const client = getAdminClient();
      const { error } = await client
        .from("association_board_members")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      setMessage({ type: "success", text: "Membro arquivado." });
      await loadMembers();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao arquivar." });
    }
  }

  async function handleToggleStatus(m: BoardMember, field: "is_active" | "is_public") {
    try {
      const client = getAdminClient();
      const { error } = await client
        .from("association_board_members")
        .update({ [field]: !m[field], updated_at: new Date().toISOString() })
        .eq("id", m.id);
      if (error) throw error;
      await loadMembers();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao atualizar status." });
    }
  }

  if (loading) return <div className="empty-state">Carregando membros da diretoria…</div>;

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <div>
          <h1>Diretoria da Associação</h1>
          <p>Gerencie os membros da diretoria, cargos, biografias e visibilidade pública.</p>
        </div>
        <button className="btn btn-magenta" onClick={handleOpenCreate}>
          + Novo Membro
        </button>
      </div>

      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="admin-card">
        {members.length === 0 ? (
          <div className="empty-state">Nenhum membro da diretoria cadastrado ainda.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>Cargo</th>
                <th>Ordem</th>
                <th>Ativo</th>
                <th>Público</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td>
                    {m.photo_path ? (
                      <img
                        src={publicFileUrl(m.photo_path)}
                        alt={m.full_name}
                        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "#e0e0e0",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        {m.full_name.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>{m.full_name}</strong>
                  </td>
                  <td>{m.role}</td>
                  <td>{m.display_order}</td>
                  <td>
                    <button
                      className={`btn btn-xs ${m.is_active ? "btn-success" : "btn-ghost"}`}
                      onClick={() => handleToggleStatus(m, "is_active")}
                    >
                      {m.is_active ? "Sim" : "Não"}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`btn btn-xs ${m.is_public ? "btn-success" : "btn-ghost"}`}
                      onClick={() => handleToggleStatus(m, "is_public")}
                    >
                      {m.is_public ? "Sim" : "Não"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn btn-xs btn-outline" onClick={() => handleOpenEdit(m)}>
                        Editar
                      </button>
                      <button className="btn btn-xs btn-danger" onClick={() => handleArchive(m.id, m.full_name)}>
                        Arquivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <h2>{editingId ? "Editar Membro da Diretoria" : "Novo Membro da Diretoria"}</h2>
            <form onSubmit={handleSave} className="admin-form">
              <div className="admin-form-grid">
                <div className="field field-full">
                  <label htmlFor="full_name">Nome Completo</label>
                  <input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="role">Cargo Institucional</label>
                  <input
                    id="role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Ex: Presidente, Vice-Presidente..."
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="display_order">Ordem de Exibição</label>
                  <input
                    id="display_order"
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  />
                </div>
                <div className="field field-full">
                  <label htmlFor="short_bio">Mini Biografia (Opcional)</label>
                  <textarea
                    id="short_bio"
                    rows={2}
                    value={form.short_bio || ""}
                    onChange={(e) => setForm({ ...form, short_bio: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label htmlFor="photo">Foto Oficial</label>
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="instagram_url">Instagram (URL Opcional)</label>
                  <input
                    id="instagram_url"
                    value={form.instagram_url || ""}
                    onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      style={{ width: "auto" }}
                    />{" "}
                    Ativo
                  </label>
                </div>
                <div className="field">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.is_public}
                      onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                      style={{ width: "auto" }}
                    />{" "}
                    Visível no site público
                  </label>
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-magenta" disabled={saving}>
                  {saving ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
