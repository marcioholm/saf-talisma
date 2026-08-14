"use client";

import { useState, useEffect } from "react";
import { getAdminClient, uploadFile } from "../../../lib/admin-client";
import { publicFileUrl } from "../../../lib/supabase";

export type BoardMember = {
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
    try {
      const client = getAdminClient();
      const { data: row } = await client
        .from("site_settings")
        .select("valor")
        .eq("chave", "diretoria_membros")
        .maybeSingle();

      if (row?.valor && Array.isArray(row.valor)) {
        const sorted = (row.valor as BoardMember[]).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
        setMembers(sorted);
      } else {
        setMembers([]);
      }
    } catch (e: any) {
      console.warn("Aviso ao carregar diretoria:", e?.message);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_MEMBER, display_order: members.length + 1 });
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

  async function saveMembersList(newList: BoardMember[]) {
    const client = getAdminClient();
    const { data: session } = await client.auth.getSession();
    const userId = session.session?.user.id;

    const { error } = await client.from("site_settings").upsert(
      {
        chave: "diretoria_membros",
        valor: newList,
        updated_by: userId,
      },
      { onConflict: "chave" }
    );
    if (error) throw error;
    setMembers(newList.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)));
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

      const updatedMemberData = {
        ...form,
        photo_path: photoPath,
      };

      let updatedList: BoardMember[] = [];

      if (editingId) {
        updatedList = members.map((m) =>
          m.id === editingId ? { ...m, ...updatedMemberData } : m
        );
        await saveMembersList(updatedList);
        setMessage({ type: "success", text: "Membro da diretoria atualizado com sucesso." });
      } else {
        const newMember: BoardMember = {
          ...updatedMemberData,
          id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        };
        updatedList = [...members, newMember];
        await saveMembersList(updatedList);
        setMessage({ type: "success", text: "Novo membro da diretoria cadastrado com sucesso." });
      }

      setShowModal(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar diretoria." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Deseja realmente remover "${name}" da diretoria?`)) return;
    try {
      const updatedList = members.filter((m) => m.id !== id);
      await saveMembersList(updatedList);
      setMessage({ type: "success", text: `Membro "${name}" removido com sucesso.` });
    } catch (err: any) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao remover membro." });
    }
  }

  async function handleToggleStatus(m: BoardMember, field: "is_active" | "is_public") {
    try {
      const updatedList = members.map((item) =>
        item.id === m.id ? { ...item, [field]: !item[field] } : item
      );
      await saveMembersList(updatedList);
    } catch (err: any) {
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

      <div className="admin-card" style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
        {members.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ color: "#666", marginBottom: 16 }}>Nenhum membro da diretoria cadastrado ainda.</p>
            <button className="btn btn-magenta" onClick={handleOpenCreate}>
              Cadastrar Primeiro Membro
            </button>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Foto</th>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th style={{ width: 80 }}>Ordem</th>
                  <th style={{ width: 80 }}>Ativo</th>
                  <th style={{ width: 90 }}>Público</th>
                  <th style={{ width: 140, textAlign: "right" }}>Ações</th>
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
                          style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            background: "#0d0d0d",
                            color: "#61CE70",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: "bold",
                            fontSize: "16px",
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
                        className={`badge ${m.is_active ? "badge-success" : "badge-inactive"}`}
                        onClick={() => handleToggleStatus(m, "is_active")}
                        title="Clique para alternar status"
                        style={{ cursor: "pointer", border: "none", padding: "4px 8px", borderRadius: "4px" }}
                      >
                        {m.is_active ? "SIM" : "NÃO"}
                      </button>
                    </td>
                    <td>
                      <button
                        className={`badge ${m.is_public ? "badge-success" : "badge-inactive"}`}
                        onClick={() => handleToggleStatus(m, "is_public")}
                        title="Clique para alternar visibilidade no site"
                        style={{ cursor: "pointer", border: "none", padding: "4px 8px", borderRadius: "4px" }}
                      >
                        {m.is_public ? "VISÍVEL" : "OCULTO"}
                      </button>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "8px" }}>
                        <button className="btn btn-sm btn-outline" onClick={() => handleOpenEdit(m)}>
                          Editar
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m.id, m.full_name)}>
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
              color: "#111",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>
                {editingId ? "Editar Membro da Diretoria" : "Novo Membro da Diretoria"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#666", lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="field field-full" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="full_name" style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>
                    Nome Completo
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: "6px" }}
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Ex.: Maria Cicilia Rolim Lopes"
                  />
                </div>

                <div className="field">
                  <label htmlFor="role" style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>
                    Cargo Institucional
                  </label>
                  <input
                    id="role"
                    type="text"
                    required
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: "6px" }}
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Ex.: Presidente, Diretor Financeiro..."
                  />
                </div>

                <div className="field">
                  <label htmlFor="display_order" style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>
                    Ordem de Exibição
                  </label>
                  <input
                    id="display_order"
                    type="number"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: "6px" }}
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  />
                </div>

                <div className="field field-full" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="short_bio" style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>
                    Mini Biografia (Opcional)
                  </label>
                  <textarea
                    id="short_bio"
                    rows={3}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: "6px" }}
                    value={form.short_bio || ""}
                    onChange={(e) => setForm({ ...form, short_bio: e.target.value })}
                    placeholder="Breve resumo da trajetória ou formação..."
                  />
                </div>

                <div className="field field-full" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="photo" style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>
                    Foto Oficial <small style={{ color: "#2e9c41", fontWeight: 700 }}>· Proporção recomendada: 1:1 (300 × 300 px ou 400 × 400 px)</small>
                  </label>
                  <div className="file-field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {form.photo_path && (
                      <img
                        src={publicFileUrl(form.photo_path)}
                        alt=""
                        style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                      />
                    )}
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="hint" style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                    Dimensão ideal: 300 × 300 px (quadrada / retrato centralizado). Formatos: JPG, PNG, WebP.
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="instagram_url" style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>
                    Instagram (URL Opcional)
                  </label>
                  <input
                    id="instagram_url"
                    type="url"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: "6px" }}
                    value={form.instagram_url || ""}
                    onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div className="field">
                  <label htmlFor="linkedin_url" style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>
                    LinkedIn (URL Opcional)
                  </label>
                  <input
                    id="linkedin_url"
                    type="url"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #ccc", borderRadius: "6px" }}
                    value={form.linkedin_url || ""}
                    onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="field" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      style={{ width: "auto" }}
                    />
                    Ativo
                  </label>
                </div>

                <div className="field" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
                    <input
                      type="checkbox"
                      checked={form.is_public}
                      onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                      style={{ width: "auto" }}
                    />
                    Visível no site público
                  </label>
                </div>
              </div>

              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid #eee", paddingTop: "16px" }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-magenta" disabled={saving}>
                  {saving ? "Salvando…" : "Salvar Membro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
