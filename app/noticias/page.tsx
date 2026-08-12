"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, publicFileUrl } from "../../lib/supabase";
import { SiteHeader, SiteFooter } from "../../components/site-shell";
import "../public.css";

type Category = { id: string; nome: string; slug: string };
type Post = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  imagem_url: string | null;
  categoria_id: string | null;
  autor: string | null;
  published_at: string;
};

const PER_PAGE = 9;

export default function NoticiasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [cat, setCat] = useState("all");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("post_categories").select("id, nome, slug").order("ordem").then(({ data, error }) => {
      if (!error) setCategories((data ?? []) as Category[]);
    });
  }, []);

  useEffect(() => {
    let q = supabase
      .from("posts")
      .select("id, titulo, slug, resumo, imagem_url, autor, published_at, categoria_id", {
        count: "exact",
      })
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .range(page * PER_PAGE, page * PER_PAGE + PER_PAGE - 1);
    if (cat !== "all") q = q.eq("categoria_id", cat);
    q.then(({ data, error, count }) => {
      if (!error) {
        setPosts((data ?? []) as Post[]);
        setTotal(count ?? 0);
      }
      setLoading(false);
    });
  }, [cat, page]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <main className="page-body">
      <SiteHeader active="/noticias" />
      <section className="page-hero">
        <div className="shell">
          <div className="eyebrow">O clube sempre informado</div>
          <h1>
            Últimas <em>notícias</em>
          </h1>
          <p>Acompanhe os bastidores, jogos e novidades da SAF Talismã.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <div className="chip-bar">
            <button className={`chip ${cat === "all" ? "active" : ""}`} onClick={() => { setCat("all"); setPage(0); }}>
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`chip ${cat === c.id ? "active" : ""}`}
                onClick={() => { setCat(c.id); setPage(0); }}
              >
                {c.nome}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty">Carregando notícias…</div>
          ) : posts.length === 0 ? (
            <div className="empty">
              <strong>Nenhuma notícia publicada ainda</strong>
              Volte em breve para acompanhar as novidades do clube.
            </div>
          ) : (
            <div className="news-grid-page">
              {posts.map((p) => (
                <Link key={p.id} href={`/noticias/${p.slug}`} className="news-card-page">
                  <div
                    className="news-thumb"
                    style={p.imagem_url ? { backgroundImage: `url("${publicFileUrl(p.imagem_url)}")` } : undefined}
                  >
                    {!p.imagem_url && <div className="news-thumb-fallback">SAF</div>}
                  </div>
                  <div className="news-body">
                    <span className="news-tag">{categories.find((c) => c.id === p.categoria_id)?.nome ?? "Notícias"}</span>
                    <h3>{p.titulo}</h3>
                    {p.resumo && <p>{p.resumo}</p>}
                    <div className="news-meta">
                      <span>
                        {p.published_at
                          ? new Date(p.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                          : ""}
                      </span>
                      <b>Ler notícia →</b>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="page-pagination">
              <button disabled={page === 0} onClick={() => setPage(page - 1)}>
                ← Anterior
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} className={i === page ? "active" : ""} onClick={() => setPage(i)}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                Próxima →
              </button>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
