import Link from "next/link";
import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../../lib/supabase";
import "../public.css";
import { type Metadata } from "next";
import { SITE, OG_IMAGE_DEFAULT, breadcrumbJsonLd } from "../../lib/seo";
import { associationConfig } from "../../lib/association-config";

type SportCategory = { id: string; nome: string };
type Game = {
  id: string;
  adversario: string;
  escudo_adversario_url: string | null;
  fase_rodada: string | null;
  data_jogo: string;
  local: string | null;
  cidade: string | null;
  casa_fora: "casa" | "fora";
  status: "agendado" | "andamento" | "encerrado" | "cancelado";
  placar_nosso: number | null;
  placar_adversario: number | null;
  link_transmissao: string | null;
  competicao: { nome: string } | null;
};

const WEEKDAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

async function getCategories(): Promise<SportCategory[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/sports_categories?select=id,nome&order=ordem.asc`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Erro ao carregar categorias esportivas:", e);
  }
  return [];
}

async function getUpcomingGames(catId?: string): Promise<Game[]> {
  try {
    const filter = catId && catId !== "all" ? `&categoria_id=eq.${catId}` : "";
    const res = await fetch(
      `${supabaseUrl}/rest/v1/games?select=id,adversario,escudo_adversario_url,fase_rodada,data_jogo,local,cidade,casa_fora,status,placar_nosso,placar_adversario,link_transmissao,competicao:competitions(nome)&status=in.(agendado,andamento)&order=data_jogo.asc${filter}`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Erro ao carregar próximos jogos:", e);
  }
  return [];
}

async function getFinishedGames(catId?: string): Promise<Game[]> {
  try {
    const filter = catId && catId !== "all" ? `&categoria_id=eq.${catId}` : "";
    const res = await fetch(
      `${supabaseUrl}/rest/v1/games?select=id,adversario,escudo_adversario_url,fase_rodada,data_jogo,local,cidade,casa_fora,status,placar_nosso,placar_adversario,link_transmissao,competicao:competitions(nome)&status=eq.encerrado&order=data_jogo.desc${filter}`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 60 },
      }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Erro ao carregar jogos encerrados:", e);
  }
  return [];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const time = `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
  return `${WEEKDAYS[d.getDay()]} · ${day} ${month} ${year} · ${time}`;
}

function GameCard({ g }: { g: Game }) {
  const encerrado = g.status === "encerrado";
  const win = encerrado && (g.placar_nosso ?? 0) > (g.placar_adversario ?? 0);
  const loss = encerrado && (g.placar_nosso ?? 0) < (g.placar_adversario ?? 0);
  return (
    <div className="game-card">
      <div className="game-top">
        <span>
          {g.competicao?.nome ?? "Jogo"} {g.fase_rodada ? ` · ${g.fase_rodada}` : ""}
        </span>
        <b>{g.casa_fora === "casa" ? "EM CASA" : "FORA DE CASA"}</b>
      </div>
      <div className="game-teams">
        <div className="game-team">
          <div className="opponent-mark" style={{ background: "#D200D2", color: "#fff" }}>
            SAF
          </div>
          Talismã
        </div>
        <div className={`game-score ${win ? "is-win" : loss ? "is-loss" : ""}`}>
          {encerrado ? (
            <>
              {g.placar_nosso} × {g.placar_adversario}
              <small>{win ? "VITÓRIA" : loss ? "DERROTA" : "EMPATE"}</small>
            </>
          ) : (
            <>
              VS
              <small>{g.status === "andamento" ? "AO VIVO" : "EM BREVE"}</small>
            </>
          )}
        </div>
        <div className="game-team">
          <div className="opponent-mark">
            {g.escudo_adversario_url ? (
              <img src={publicFileUrl(g.escudo_adversario_url)} alt={g.adversario} />
            ) : (
              g.adversario.slice(0, 3).toUpperCase()
            )}
          </div>
          {g.adversario}
        </div>
      </div>
      <div className="game-bottom">
        <span>{formatDate(g.data_jogo)}</span>
        <span>{[g.local, g.cidade].filter(Boolean).join(" · ") || "Local a definir"}</span>
        {g.link_transmissao && (
          <a href={g.link_transmissao} target="_blank" rel="noreferrer">
            Assistir transmissão →
          </a>
        )}
      </div>
    </div>
  );
  return [];
}

export const metadata: Metadata = {
  title: `Jogos e Resultados | ${associationConfig.name}`,
  description: `Confira a agenda de próximos jogos e os resultados recentes das equipes da ${associationConfig.name}.`,
  alternates: { canonical: `${SITE}/jogos` },
  openGraph: {
    title: `Jogos e Resultados | ${associationConfig.name}`,
    description: `Confira a agenda de próximos jogos e os resultados recentes das equipes da ${associationConfig.name}.`,
    url: `${SITE}/jogos`,
    type: "website",
    images: [{ url: OG_IMAGE_DEFAULT }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Jogos e Resultados | ${associationConfig.name}`,
    description: `Confira a agenda de próximos jogos e os resultados recentes das equipes da ${associationConfig.name}.`,
    images: [OG_IMAGE_DEFAULT],
  },
};

export default async function JogosPage({
  searchParams,
}: {
  searchParams?: Promise<{ cat?: string }>;
}) {
  const params = await searchParams;
  const currentCat = params?.cat || "all";

  const [categories, upcoming, finished] = await Promise.all([
    getCategories(),
    getUpcomingGames(currentCat),
    getFinishedGames(currentCat),
  ]);

  return (
    <main className="page-body">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbJsonLd([
            { name: "Início", url: SITE },
            { name: "Jogos", url: `${SITE}/jogos` },
          ]),
        }}
      />
      <SiteHeader active="/jogos" />
      <section className="page-hero">
        <div className="shell">
          <div className="eyebrow">Agenda e resultados</div>
          <h1>
            Jogos & <em>resultados</em>
          </h1>
          <p>Todos os confrontos das equipes da SAF Talismã.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <div className="chip-bar">
            <Link className={`chip ${currentCat === "all" ? "active" : ""}`} href="/jogos">
              Todas as equipes
            </Link>
            {categories.map((c) => (
              <Link key={c.id} className={`chip ${currentCat === c.id ? "active" : ""}`} href={`/jogos?cat=${c.id}`}>
                {c.nome}
              </Link>
            ))}
          </div>

          <div className="games-columns">
            <div className="games-block">
              <h2>
                Próximos <span>jogos</span>
              </h2>
              {upcoming.length === 0 ? (
                <div className="empty" style={{ padding: 28 }}>
                  <strong>Nada agendado no momento</strong>
                </div>
              ) : (
                upcoming.map((g) => <GameCard key={g.id} g={g} />)
              )}
            </div>
            <div className="games-block">
              <h2>
                Últimos <span>resultados</span>
              </h2>
              {finished.length === 0 ? (
                <div className="empty" style={{ padding: 28 }}>
                  <strong>Nenhum resultado ainda</strong>
                </div>
              ) : (
                finished.map((g) => <GameCard key={g.id} g={g} />)
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
