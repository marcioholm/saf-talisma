import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey =
  typeof process !== "undefined" ? process.env.SUPABASE_SERVICE_ROLE_KEY || "" : "";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Variáveis NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não definidas.");
}

/**
 * Cliente público (anon) — respeita RLS: só lê conteúdo publicado.
 * Uso em componentes do lado do cliente e em leituras públicas no servidor.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Cliente administrativo (service role) — ignora RLS.
 * SOMENTE no servidor (Worker/Node) e SEMPRE após validar sessão + papel
 * do usuário autenticado no código.
 *
 * Fica `null` quando a chave não está disponível (ex.: no browser, onde a
 * chave service role nunca deve existir). Use `getSupabaseAdmin()` para
 * garantir erro claro ao usar no lugar errado.
 */
export const supabaseAdmin: SupabaseClient | null = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

/** Retorna o cliente service role (somente servidor) ou lança. */
export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdmin() só pode ser usado no servidor.");
  }
  if (!supabaseAdmin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não definida no servidor.");
  }
  return supabaseAdmin;
}

export const hasSupabaseServiceKey = Boolean(supabaseServiceKey);

/** URL pública de um arquivo no Storage (buckets são públicos). */
export function publicFileUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${supabaseUrl}/storage/v1/object/public/${path.replace(/^\/+/, "")}`;
}
