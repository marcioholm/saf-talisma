"use client";

import { useState, useEffect } from "react";
import { getAdminClient } from "../../lib/admin-client";
import Link from "next/link";

type Counts = {
  posts: { draft: number; scheduled: number; published: number; archived: number };
  games: { agendado: number; encerrado: number };
  transparency: number;
  banners: number;
  sponsors: number;
  categories: number;
  subscribers: number;
  users: number;
};

async function count(client: ReturnType<typeof getAdminClient>, table: string, filter?: [string, string, unknown]) {
  let q = client.from(table).select("id", { count: "exact", head: true });
  if (filter) q = q.filter(filter[0], filter[1], filter[2] as never) as typeof q;
  const { count } = await q;
  return count ?? 0;
}

export default function AdminDashboard() {
  const [c, setC] = useState<Counts | null>(null);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    const client = getAdminClient();
    (async () => {
      const [
        draft, scheduled, published, archived,
        agendado, encerrado,
        transparency, banners, sponsors, categories,
        subscribers, users,
      ] = await Promise.all([
        count(client, "posts", ["status", "eq", "draft"]),
        count(client, "posts", ["status", "eq", "scheduled"]),
        count(client, "posts", ["status", "eq", "published"]),
        count(client, "posts", ["status", "eq", "archived"]),
        count(client, "games", ["status", "eq", "agendado"]),
        count(client, "games", ["status", "eq", "encerrado"]),
        count(client, "transparency_records", ["status", "eq", "published"]),
        count(client, "banners", ["ativo", "eq", true]),
        count(client, "sponsors", ["ativo", "eq", true]),
        count(client, "post_categories", ["ativo", "eq", true]),
        count(client, "newsletter_subscribers"),
        count(client, "profiles"),
      ]);
      setC({ posts: { draft, scheduled, published, archived }, games: { agendado, encerrado }, transparency, banners, sponsors, categories, subscribers, users });

      const { data, error } = await client
        .from("posts")
        .select("id, titulo, status, published_at")
        .order("created_at", { ascending: false })
        .limit(8);
      if (!error) setRecent(data as Array<Record<string, unknown>>);
    })().catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!c) return <div className="empty-state">Carregando…</div>;

  return (
    <div>
      <div className="admin-topbar">
        <div>
          <h1>Visão geral</h1>
          <p>Resumo do conteúdo do portal.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Notícias publicadas</div>
          <div className="stat-value green">{c.posts.published}</div>
          <div className="stat-detail">
            {c.posts.draft} rascunho · {c.posts.scheduled} agendada · {c.posts.archived} arquivada
          </div>
          <Link href="/admin/noticias">Gerenciar</Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Jogos</div>
          <div className="stat-value magenta">{c.games.agendado + c.games.encerrado}</div>
          <div className="stat-detail">{c.games.agendado} agendados · {c.games.encerrado} encerrados</div>
          <Link href="/admin/jogos">Gerenciar</Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transparência</div>
          <div className="stat-value">{c.transparency}</div>
          <div className="stat-detail">registros publicados</div>
          <Link href="/admin/transparencia">Gerenciar</Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Banners ativos</div>
          <div className="stat-value">{c.banners}</div>
          <div className="stat-detail">na página inicial</div>
          <Link href="/admin/banners">Gerenciar</Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Patrocinadores</div>
          <div className="stat-value">{c.sponsors}</div>
          <div className="stat-detail">ativos</div>
          <Link href="/admin/patrocinadores">Gerenciar</Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Categorias</div>
          <div className="stat-value">{c.categories}</div>
          <div className="stat-detail">de notícias ativas</div>
          <Link href="/admin/categorias">Gerenciar</Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Newsletter</div>
          <div className="stat-value">{c.subscribers}</div>
          <div className="stat-detail">assinantes</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Usuários do painel</div>
          <div className="stat-value">{c.users}</div>
          <div className="stat-detail">perfis cadastrados</div>
          <Link href="/admin/usuarios">Gerenciar</Link>
        </div>
      </div>

      <h2 className="admin-section-title">Últimas notícias</h2>
      <div className="admin-table-wrap">
        {recent.length === 0 ? (
          <div className="empty-state">
            <strong>Nenhuma notícia ainda</strong>
            Publique a primeira notícia do portal.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Status</th>
                <th>Publicação</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={String(p.id)}>
                  <td className="cell-title">{String(p.titulo)}</td>
                  <td>
                    <span className={`badge badge-${String(p.status)}`}>{String(p.status)}</span>
                  </td>
                  <td className="cell-sub">{p.published_at ? new Date(String(p.published_at)).toLocaleString("pt-BR") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
