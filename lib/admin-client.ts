import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://zompnocfdlofhsyuiuhj.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_xfyG0CUyTWHk1JDesbUG8w_FVsOF56o";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

/**
 * Cliente do browser (sessão persistente em localStorage).
 * A autorização é garantida pelo RLS: staff/adm vêm de user_roles.
 */
export function getAdminClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export type AdminRole = "admin" | "editor" | "none";

/** Lê os papéis do usuário autenticado na tabela user_roles (RLS admin/staff). */
export async function getMyRole(
  client: SupabaseClient,
): Promise<{ role: AdminRole; fullName: string | null }> {
  const { data: session } = await client.auth.getSession();
  const user = session.session?.user;
  if (!user) return { role: "none", fullName: null };

  let role: AdminRole = "none";

  const { data: roles, error } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (!error && roles && roles.length > 0) {
    if (roles.some((r) => r.role === "admin")) role = "admin";
    else if (roles.some((r) => r.role === "editor")) role = "editor";
  }

  // Fallback 1: check metadata
  if (role === "none") {
    const metaRole = user.app_metadata?.role || user.user_metadata?.role;
    if (metaRole === "admin" || metaRole === "editor") {
      role = metaRole as AdminRole;
    }
  }

  // Fallback 2: admin check for official admin emails
  const adminEmails = [
    "admin@saftalisma.com.br",
    "marketing.northway@gmail.com",
    "contato@saftalisma.com.br",
    "saftalisma1@gmail.com",
  ];
  if (role === "none" && user.email && adminEmails.includes(user.email.toLowerCase())) {
    role = "admin";
  }

  const { data: profile } = await client
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const fullName = profile?.full_name || user.user_metadata?.full_name || user.email || null;

  return { role, fullName };
}

/** Converte uma string simples em slug URL-safe (pt-BR). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Converte Date local para ISO que o Postgres aceita (sem fuso TZ do browser). */
export function toIsoLocal(value: string | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
  );
}

/** Formata data para exibição no painel. */
export function fmtDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Formata valor monetário em BRL. */
export function fmtBRL(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Faz upload de um arquivo para o bucket e retorna o caminho público
 * (ex.: "covers/nome-uuid.ext").
 */
export async function uploadFile(
  client: SupabaseClient,
  bucket: string,
  file: File,
  folder = "",
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = folder ? `${folder.replace(/^\/+|\/+$/g, "")}/${safeName}` : safeName;
  const { error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(`Upload falhou: ${error.message}`);
  return `${bucket}/${path}`;
}

export type Status = "draft" | "scheduled" | "published" | "archived";

export const STATUS_LABEL: Record<Status, string> = {
  draft: "Rascunho",
  scheduled: "Agendada",
  published: "Publicada",
  archived: "Arquivada",
};
