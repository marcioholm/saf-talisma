import Link from "next/link";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../../lib/supabase";
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

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/post_categories?select=id,nome,slug&order=ordem.asc`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Erro ao buscar categorias:", e);
  }
  return [];
}

async function getPosts(catId?: string): Promise<Post[]> {
  try {
    const filter = catId && catId !== "all" ? `&categoria_id=eq.${catId}` : "";
    const res = await fetch(
      `${supabaseUrl}/rest/v1/posts?select=id,titulo,slug,resumo,imagem_url,autor,published_at,categoria_id&status=eq.published&order=published_at.desc${filter}`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Erro ao buscar notícias:", e);
  }
  return [];
}

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams?: Promise<{ cat?: string }>;
}) {
  const params = await searchParams;
  const currentCat = params?.cat || "all";
  const [categories, posts] = await Promise.all([
    getCategories(),
    getPosts(currentCat),
  ]);

  return (
    <main className="page-body">
      <SiteHeader active="/noticias" />
      <section className="page-hero">
        <div className="shell">
          <div className="eyebrow">Fique por dentro</div>
          <h1>
            Notícias &amp; <em>atualizações</em>
          </h1>
          <p>
            Coberturas de jogos, convocações, bastidores e comunicados oficiais da Associação.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <div className="chip-bar">
            <Link
              href="/noticias"
              className={`chip ${currentCat === "all" ? "active" : ""}`}
            >
              Todas
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/noticias?cat=${c.id}`}
                className={`chip ${currentCat === c.id ? "active" : ""}`}
              >
                {c.nome}
              </Link>
            ))}
          </div>

          {posts.length === 0 ? (
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
                    <span className="news-tag">
                      {categories.find((c) => c.id === p.categoria_id)?.nome ?? "Notícias"}
                    </span>
                    <h3>{p.titulo}</h3>
                    {p.resumo && <p>{p.resumo}</p>}
                    <div className="news-meta">
                      <span>
                        {p.published_at
                          ? new Date(p.published_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : ""}
                      </span>
                      <b>Ler notícia →</b>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
