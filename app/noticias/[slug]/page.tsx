"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SiteHeader, SiteFooter } from "../../../components/site-shell";
import { supabase, publicFileUrl } from "../../../lib/supabase";
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
  categoria: { nome: string; slug: string } | null;
  published_at: string;
};

type Related = { id: string; slug: string; titulo: string; imagem_url: string | null };

export default function NoticiaPage() {
  const params = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Related[]>([]);
  const [state, setState] = useState<"loading" | "found" | "missing">("loading");

  useEffect(() => {
    supabase
      .from("posts")
      .select("id, categoria_id, titulo, subtitulo, resumo, conteudo, imagem_url, cover_alt, video_url, gallery, autor, published_at")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setState("missing");
          return;
        }
        setPost(data as unknown as Post);
        setState("found");
        if (data.categoria_id) {
          supabase
            .from("post_categories")
            .select("nome, slug")
            .eq("id", data.categoria_id)
            .maybeSingle()
            .then(({ data: cat }) => {
              if (cat) setPost((prev) => (prev ? { ...prev, categoria: cat } : prev));
            });
          supabase
            .from("posts")
            .select("id, slug, titulo, imagem_url")
            .eq("status", "published")
            .neq("id", data.id)
            .eq("categoria_id", data.categoria_id)
            .order("published_at", { ascending: false })
            .limit(3)
            .then(({ data: rel }) => {
              if (!rel?.length) return;
              supabase
                .from("posts")
                .select("id, slug, titulo, imagem_url")
                .eq("status", "published")
                .neq("id", data.id)
                .order("published_at", { ascending: false })
                .limit(3)
                .then(({ data: all }) => setRelated((all ?? []) as Related[]));
            });
        }
      });
  }, [params.slug]);

  if (state === "loading") {
    return (
      <main className="page-body">
        <SiteHeader />
        <section className="page-hero">
          <div className="shell">
            <div className="empty" style={{ background: "transparent", borderColor: "#2a2a2a", color: "#8a8a8a" }}>
              Carregando…
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (state === "missing" || !post) {
    return (
      <main className="page-body">
        <SiteHeader />
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

  const paragraphs = post.conteudo
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
