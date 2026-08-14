import { MetadataRoute } from "next";
import { supabaseUrl, supabaseAnonKey } from "../lib/supabase";

const SITE = "https://saftalisma.com.br";

type SitemapEntry = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

async function fetchJson<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
      next: { revalidate: 300 },
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error(`Sitemap: erro ao buscar ${path}:`, e);
  }
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: SitemapEntry[] = [];

  // ── Páginas estáticas ──────────────────────────────────────────────
  entries.push(
    { url: SITE, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE}/noticias`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/jogos`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE}/campeonatos`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/patrocinadores`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE}/transparencia`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/sobre`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE}/diretoria`, changeFrequency: "monthly", priority: 0.5 },
  );

  // ── Notícias publicadas ────────────────────────────────────────────
  const posts = await fetchJson<{
    slug: string;
    updated_at: string | null;
    published_at: string | null;
  }>("posts?select=slug,updated_at,published_at&status=eq.published&order=published_at.desc");

  for (const p of posts) {
    entries.push({
      url: `${SITE}/noticias/${p.slug}`,
      lastModified: p.updated_at || p.published_at || undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // ── Campeonatos públicos ───────────────────────────────────────────
  const champs = await fetchJson<{
    slug: string;
    updated_at: string | null;
  }>("championships?select=slug,updated_at&visibility=eq.published&order=created_at.desc");

  for (const c of champs) {
    entries.push({
      url: `${SITE}/campeonatos/${c.slug}`,
      lastModified: c.updated_at || undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return entries;
}
