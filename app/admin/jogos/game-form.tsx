"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminClient, toIsoLocal, uploadFile } from "../../../lib/admin-client";
import Link from "next/link";

type SelectOption = { id: string; nome: string };

type FormState = {
  adversario: string;
  categoria_id: string;
  competicao_id: string;
  fase_rodada: string;
  data_jogo: string;
  local: string;
  cidade: string;
  casa_fora: "casa" | "fora";
  status: "agendado" | "andamento" | "encerrado" | "cancelado";
  placar_nosso: string;
  placar_adversario: string;
  link_transmissao: string;
  observacoes: string;
};

const EMPTY: FormState = {
  adversario: "",
  categoria_id: "",
  competicao_id: "",
  fase_rodada: "",
  data_jogo: "",
  local: "",
  cidade: "",
  casa_fora: "casa",
  status: "agendado",
  placar_nosso: "",
  placar_adversario: "",
  link_transmissao: "",
  observacoes: "",
};

function toLocalInput(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function GameForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [competitions, setCompetitions] = useState<SelectOption[]>([]);
  const [shieldPath, setShieldPath] = useState("");
  const [currentShield, setCurrentShield] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));
  const isEdit = Boolean(id);

  useEffect(() => {
    const client = getAdminClient();
    client.from("sports_categories").select("id, nome").order("ordem").then(({ data, error }) => {
      if (!error) setCategories((data ?? []) as SelectOption[]);
    });
    client.from("competitions").select("id, nome").order("nome").then(({ data, error }) => {
      if (!error) setCompetitions((data ?? []) as SelectOption[]);
    });
    if (id) {
      client
        .from("games")
        .select("*")
        .eq("id", id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error || !data) {
            setMessage({ type: "error", text: "Jogo não encontrado." });
            setLoading(false);
            return;
          }
          setForm({
            adversario: data.adversario ?? "",
            categoria_id: data.categoria_id ?? "",
            competicao_id: data.competicao_id ?? "",
            fase_rodada: data.fase_rodada ?? "",
            data_jogo: toLocalInput(data.data_jogo),
            local: data.local ?? "",
            cidade: data.cidade ?? "",
            casa_fora: data.casa_fora ?? "casa",
            status: data.status ?? "agendado",
            placar_nosso: data.placar_nosso ?? "",
            placar_adversario: data.placar_adversario ?? "",
            link_transmissao: data.link_transmissao ?? "",
            observacoes: data.observacoes ?? "",
          });
          setShieldPath(data.escudo_adversario_url ?? "");
          setCurrentShield(data.escudo_adversario_url ?? "");
          setLoading(false);
        });
    }
  }, [id]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const client = getAdminClient();
      const { data: session } = await client.auth.getSession();
      const userId = session.session?.user.id;

      const payload = {
        adversario: form.adversario.trim(),
        categoria_id: form.categoria_id || null,
        competicao_id: form.competicao_id || null,
        fase_rodada: form.fase_rodada.trim() || null,
        data_jogo: toIsoLocal(form.data_jogo),
        local: form.local.trim() || null,
        cidade: form.cidade.trim() || null,
        casa_fora: form.casa_fora,
        status: form.status,
        placar_nosso: form.placar_nosso === "" ? null : Number(form.placar_nosso),
        placar_adversario: form.placar_adversario === "" ? null : Number(form.placar_adversario),
        link_transmissao: form.link_transmissao.trim() || null,
        observacoes: form.observacoes.trim() || null,
        escudo_adversario_url: shieldPath || null,
        updated_by: userId,
      };

      if (!payload.data_jogo) throw new Error("Informe a data do jogo.");
      if (payload.status === "encerrado" && (payload.placar_nosso === null || payload.placar_adversario === null)) {
        throw new Error("Para encerrar, informe os dois placares.");
      }

      const { error } = isEdit
        ? await client.from("games").update(payload).eq("id", id)
        : await client.from("games").insert({ ...payload, created_by: userId });

      if (error) throw new Error(error.message);
      setMessage({ type: "success", text: "Jogo salvo." });
      router.push("/admin/jogos");
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  }

  async function handleShield(file: File | null) {
    if (!file) return;
    try {
      const path = await uploadFile(getAdminClient(), "games", file, "escudos");
      setShieldPath(path);
      setCurrentShield(path);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload falhou." });
    }
  }

  if (loading) return <div className="empty-state">Carregando…</div>;

  return (
    <form className="admin-form" onSubmit={handleSave}>
      {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
      <div className="admin-form-grid">
        <div className="field">
          <label htmlFor="adversario">Adversário</label>
          <input
            id="adversario"
            value={form.adversario}
            onChange={(e) => set("adversario", e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="fase_rodada">Fase / Rodada</label>
          <input
            id="fase_rodada"
            value={form.fase_rodada}
            onChange={(e) => set("fase_rodada", e.target.value)}
            placeholder="Ex.: Semifinal, 5ª rodada…"
          />
        </div>
        <div className="field">
          <label htmlFor="data_jogo">Data do jogo</label>
          <input
            id="data_jogo"
            type="datetime-local"
            value={form.data_jogo}
            onChange={(e) => set("data_jogo", e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={form.status} onChange={(e) => set("status", e.target.value as FormState["status"])}>
            <option value="agendado">Agendado</option>
            <option value="andamento">Em andamento</option>
            <option value="encerrado">Encerrado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="categoria_id">Categoria</label>
          <select id="categoria_id" value={form.categoria_id} onChange={(e) => set("categoria_id", e.target.value)}>
            <option value="">— Nenhuma —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="competicao_id">Competição</label>
          <select id="competicao_id" value={form.competicao_id} onChange={(e) => set("competicao_id", e.target.value)}>
            <option value="">— Nenhuma —</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="casa_fora">Mando</label>
          <select id="casa_fora" value={form.casa_fora} onChange={(e) => set("casa_fora", e.target.value as "casa" | "fora")}>
            <option value="casa">Casa</option>
            <option value="fora">Fora</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="local">Local</label>
          <input id="local" value={form.local} onChange={(e) => set("local", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="cidade">Cidade</label>
          <input id="cidade" value={form.cidade} onChange={(e) => set("cidade", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="placar_nosso">Placar — Talismã</label>
          <input
            id="placar_nosso"
            type="number"
            min={0}
            value={form.placar_nosso}
            onChange={(e) => set("placar_nosso", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="placar_adversario">Placar — Adversário</label>
          <input
            id="placar_adversario"
            type="number"
            min={0}
            value={form.placar_adversario}
            onChange={(e) => set("placar_adversario", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="link_transmissao">Link de transmissão</label>
          <input
            id="link_transmissao"
            value={form.link_transmissao}
            onChange={(e) => set("link_transmissao", e.target.value)}
          />
        </div>
        <div className="field field-full">
          <label htmlFor="shield">
            Escudo / Logo do Adversário <small style={{ color: "#2e9c41", fontWeight: 700 }}>· Proporção recomendada: 1:1 (200 × 200 px ou 300 × 300 px em PNG transparente)</small>
          </label>
          <div className="file-field">
            {currentShield && (
              <img
                src={currentShield.startsWith("http") ? currentShield : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${currentShield}`}
                alt=""
                className="thumb-thumb"
                style={{ maxHeight: 60, objectFit: "contain", background: "#f5f5f5", padding: 4, borderRadius: 6 }}
              />
            )}
            <input id="shield" type="file" accept="image/*" onChange={(e) => handleShield(e.target.files?.[0] ?? null)} />
            <div className="hint" style={{ marginTop: 6, fontSize: 12, color: "#888", lineHeight: 1.5 }}>
              <strong>Dica de Imagem:</strong> Utilize o escudo ou logo do adversário em formato <strong>PNG com fundo transparente</strong> ou quadrado na proporção <strong>1:1</strong> (resolução sugerida: <strong>200 × 200 px</strong>) para melhor nitidez nos cards e placares.
            </div>
          </div>
        </div>
        <div className="field field-full">
          <label htmlFor="observacoes">Observações</label>
          <textarea id="observacoes" value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-magenta" disabled={saving}>
          {saving ? "Salvando…" : "Salvar jogo"}
        </button>
        <Link href="/admin/jogos" className="btn">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
