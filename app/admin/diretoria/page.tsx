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

      <div className="admin-card">
        {members.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center" }}>
            <p>Nenhum membro da diretoria cadastrado ainda.</p>
            <button className="btn btn-magenta" onClick={handleOpenCreate} style={{ marginTop: 12 }}>
              Cadastrar Primeiro Membro
            </button>
          </div>
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
                        style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "#eee",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: "bold",
                          color: "#666",
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
                      style={{ cursor: "pointer", border: "none" }}
                    >
                      {m.is_active ? "Sim" : "Não"}
                    </button>
                  </td>
                  <td>
                    <button
                      className={`badge ${m.is_public ? "badge-success" : "badge-inactive"}`}
                      onClick={() => handleToggleStatus(m, "is_public")}
                      title="Clique para alternar visibilidade no site"
                      style={{ cursor: "pointer", border: "none" }}
                    >
                      {m.is_public ? "Visível" : "Oculto"}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
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
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h2>{editingId ? "Editar Membro da Diretoria" : "Novo Membro da Diretoria"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="admin-form-grid">
                <div className="field field-full">
                  <label htmlFor="full_name">Nome Completo</label>
                  <input
                    id="full_name"
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="Ex.: Maria Cicilia Rolim Lopes"
                  />
                </div>

                <div className="field">
                  <label htmlFor="role">Cargo Institucional</label>
                  <input
                    id="role"
                    type="text"
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder="Ex.: Presidente, Diretor Financeiro..."
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
                    rows={3}
                    value={form.short_bio || ""}
                    onChange={(e) => setForm({ ...form, short_bio: e.target.value })}
                    placeholder="Breve resumo da trajetória ou formação..."
                  />
                </div>

                <div className="field field-full">
                  <label htmlFor="photo">
                    Foto Oficial <small style={{ color: "#2e9c41", fontWeight: 700 }}>· Proporção recomendada: 1:1 (300 × 300 px ou 400 × 400 px quadrado)</small>
                  </label>
                  <div className="file-field">
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
                  <div className="hint">Dimensão ideal: 300 × 300 px (quadrada / retrato centralizado). Formatos: JPG, PNG, WebP.</div>
                </div>

                <div className="field">
                  <label htmlFor="instagram_url">Instagram (URL Opcional)</label>
                  <input
                    id="instagram_url"
                    type="url"
                    value={form.instagram_url || ""}
                    onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div className="field">
                  <label htmlFor="linkedin_url">LinkedIn (URL Opcional)</label>
                  <input
                    id="linkedin_url"
                    type="url"
                    value={form.linkedin_url || ""}
                    onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div className="field" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      style={{ width: "auto" }}
                    />
                    Ativo
                  </label>
                </div>

                <div className="field" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
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

              <div className="modal-footer" style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
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
