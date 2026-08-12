"use client";

import { useState, useEffect } from "react";
import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { supabase, publicFileUrl } from "../../lib/supabase";
import "../public.css";

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

export default function JogosPage() {
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [upcoming, setUpcoming] = useState<Game[]>([]);
  const [finished, setFinished] = useState<Game[]>([]);
  const [cat, setCat] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("sports_categories").select("id, nome").order("ordem").then(({ data, error }) => {
      if (!error) setCategories((data ?? []) as SportCategory[]);
    });
  }, []);

  useEffect(() => {
    const base = () =>
      supabase
        .from("games")
        .select("id, adversario, escudo_adversario_url, fase_rodada, data_jogo, local, cidade, casa_fora, status, placar_nosso, placar_adversario, link_transmissao, competicao:competicao_id(nome)")
        .order("data_jogo", { ascending: false });

    let up = base().in("status", ["agendado", "andamento"]).order("data_jogo", { ascending: true });
    let fin = base().eq("status", "encerrado");
    if (cat !== "all") {
      up = up.eq("categoria_id", cat);
      fin = fin.eq("categoria_id", cat);
    }
    up.then(({ data }) => setUpcoming((data ?? []) as unknown as Game[]));
    fin.then(({ data }) => setFinished((data ?? []) as unknown as Game[]));
    Promise.all([up, fin]).then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat]);

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
          <b>
            {g.casa_fora === "casa" ? "EM CASA" : "FORA DE CASA"}
          </b>
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
          <span>
            {[g.local, g.cidade].filter(Boolean).join(" · ") || "Local a definir"}
          </span>
          {g.link_transmissao && (
            <a href={g.link_transmissao} target="_blank" rel="noreferrer">
              Assistir transmissão →
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="page-body">
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
            <button className={`chip ${cat === "all" ? "active" : ""}`} onClick={() => setCat("all")}>
              Todas as equipes
            </button>
            {categories.map((c) => (
              <button key={c.id} className={`chip ${cat === c.id ? "active" : ""}`} onClick={() => setCat(c.id)}>
                {c.nome}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="empty">Carregando jogos…</div>
          ) : (
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
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
