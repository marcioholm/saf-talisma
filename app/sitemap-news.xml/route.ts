import { NextResponse } from "next/server";
import { supabaseUrl, supabaseAnonKey } from "../../lib/supabase";

const SITE = "https://saftalisma.com.br";
const PUBLICATION_NAME = "Associação Esportiva SAF/Talismã";
const LANGUAGE = "pt-BR";

// Google News aceita notícias dos últimos 2 dias (recomendação oficial),
// mas na prática indexa até 30 dias. Usamos 30 dias para maximizar cobertura.
const NEWS_WINDOW_DAYS = 30;

type NewsPost = {
  slug: string;
  titulo: string;
  published_at: string;
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<NextResponse> {
  let posts: NewsPost[] = [];

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - NEWS_WINDOW_DAYS);
    const cutoffISO = cutoff.toISOString();

    const res = await fetch(
      `${supabaseUrl}/rest/v1/posts?select=slug,titulo,published_at&status=eq.published&published_at=gte.${cutoffISO}&order=published_at.desc`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        next: { revalidate: 300 },
      }
    );

    if (res.ok) {
      posts = await res.json();
    }
  } catch (e) {
    console.error("Sitemap News: erro ao buscar posts:", e);
  }

  const urlEntries = posts
    .map((p) => {
      const pubDate = new Date(p.published_at).toISOString().split("T")[0];
      return `
  <url>
    <loc>${SITE}/noticias/${escapeXml(p.slug)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>
        <news:language>${LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(p.titulo)}</news:title>
    </news:news>
  </url>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urlEntries}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
