import Link from "next/link";
import { SiteHeader, SiteFooter } from "../../../components/site-shell";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../../../lib/supabase";
import "../../public.css";

type Post = {
  id: string;
  categoria_id: string | null;
  titulo: string;
  subtitulo: string | null;
  resumo: string | null;
  conteudo: string;
  imagem_url: string | null;
  cover_alt: string | null;
  video_url: string | null;
  gallery: string[] | null;
  autor: string | null;
  published_at: string;
  categoria?: { nome: string; slug: string } | null;
};

type Related = { id: string; slug: string; titulo: string; imagem_url: string | null };

async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/posts?select=id,categoria_id,titulo,subtitulo,resumo,conteudo,imagem_url,cover_alt,video_url,gallery,autor,published_at&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const post = data[0] as Post;
        if (post.categoria_id) {
          const catRes = await fetch(
            `${supabaseUrl}/rest/v1/post_categories?select=nome,slug&id=eq.${post.categoria_id}&limit=1`,
            {
              headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
              next: { revalidate: 60 },
            }
          );
          if (catRes.ok) {
            const catData = await catRes.json();
            if (catData && catData.length > 0) {
              post.categoria = catData[0];
            }
          }
        }
        return post;
      }
    }
  } catch (e) {
    console.error("Erro ao buscar notícia por slug:", e);
  }
  return null;
}

async function getRelatedPosts(currentId: string, categoriaId?: string | null): Promise<Related[]> {
  try {
    const filter = categoriaId ? `&categoria_id=eq.${categoriaId}` : "";
    const res = await fetch(
      `${supabaseUrl}/rest/v1/posts?select=id,slug,titulo,imagem_url&status=eq.published&id=neq.${currentId}&order=published_at.desc&limit=3${filter}`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Erro ao buscar notícias relacionadas:", e);
  }
  return [];
}

export default async function NoticiaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <main className="page-body">
        <SiteHeader active="/noticias" />
        <section className="page-hero">
          <div className="shell">
            <Link href="/noticias" className="article-back">
              ← Todas as notícias
            </Link>
            <h1>Notícia não encontrada</h1>
            <p>Ela pode ter sido removida ou ainda não publicada.</p>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const related = await getRelatedPosts(post.id, post.categoria_id);
  const paragraphs = (post.conteudo || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const gallery = Array.isArray(post.gallery) ? post.gallery.filter(Boolean) : [];
  const videoId = (post.video_url || "").match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/,
  )?.[1];

  return (
    <main className="page-body">
      <SiteHeader active="/noticias" />
      <section className="page-hero">
        <div className="shell article-hero-copy">
          <Link href="/noticias" className="article-back">
            ← Todas as notícias
          </Link>
          <div className="news-tag" style={{ color: "#61CE70", fontWeight: 700 }}>
            {post.categoria?.nome ?? "Notícias"}
          </div>
          <h1>{post.titulo}</h1>
          {post.subtitulo && <p className="article-subtitle">{post.subtitulo}</p>}
          <div className="article-meta">
            {post.autor && <b>{post.autor}</b>}
            <span>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </span>
          </div>
        </div>
      </section>

      <div
        className="article-cover"
        style={post.imagem_url ? { backgroundImage: `url("${publicFileUrl(post.imagem_url)}")` } : undefined}
        role={post.imagem_url ? "img" : undefined}
        aria-label={post.cover_alt || post.titulo}
      >
        {!post.imagem_url && <div className="cover-fallback">SAF</div>}
      </div>

      <section className="page-section" style={{ paddingTop: 8 }}>
        <div className="shell">
          <div className="article-body">
            {post.resumo && (
              <p style={{ fontWeight: 600, color: "#1a1a1a", fontSize: 17.5 }}>{post.resumo}</p>
            )}
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            {videoId && (
              <div className="article-video">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Vídeo da notícia"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}

            {gallery.length > 0 && (
              <div className="article-gallery">
                <h3>Galeria</h3>
                <div className="article-gallery-grid">
                  {gallery.map((img, i) => (
                    <a key={i} href={publicFileUrl(img)} target="_blank" rel="noreferrer">
                      <img src={publicFileUrl(img)} alt={`Foto ${i + 1}`} loading="lazy" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {related.length > 0 && (
            <>
              <div className="section-heading" style={{ marginTop: 40 }}>
                <div>
                  <span>Continue lendo</span>
                  <h2>Outras notícias</h2>
                </div>
              </div>
              <div className="news-grid-page">
                {related.map((r) => (
                  <Link key={r.id} href={`/noticias/${r.slug}`} className="news-card-page">
                    <div
                      className="news-thumb"
                      style={r.imagem_url ? { backgroundImage: `url("${publicFileUrl(r.imagem_url)}")` } : undefined}
                    >
                      {!r.imagem_url && <div className="news-thumb-fallback">SAF</div>}
                    </div>
                    <div className="news-body">
                      <h3>{r.titulo}</h3>
                      <div className="news-meta">
                        <b>Ler notícia →</b>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
