"use client";

import { useState, useEffect } from "react";
import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { supabase, publicFileUrl } from "../../lib/supabase";
import "../public.css";

type Content = { chave: string; conteudo: Record<string, unknown> };
type SportCat = {
  id: string;
  nome: string;
  descricao: string | null;
  players: Array<{ nome: string; apelido: string | null; posicao: string | null; numero: number | null; foto_url: string | null }> | null;
  staff: Array<{ nome: string; funcao: string | null }> | null;
};

function text(value: unknown): string {
  return typeof value === "string" ? value : Array.isArray(value) ? value.join("\n") : "";
}

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

export default function SobrePage() {
  const [content, setContent] = useState<Record<string, Content>>({});
  const [teams, setTeams] = useState<SportCat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAboutData() {
      setLoading(true);
      try {
        const { data: instData } = await supabase
          .from("institutional_content")
          .select("chave, conteudo");
        if (instData) {
          const map: Record<string, Content> = {};
          for (const row of instData) map[row.chave] = row as Content;
          setContent(map);
        }

        const { data: catData } = await supabase
          .from("sports_categories")
          .select("id, nome, descricao")
          .eq("ativo", true)
          .order("ordem");
        if (catData) setTeams(catData as SportCat[]);
      } catch (err) {
        console.error("Erro ao carregar sobre:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAboutData();
  }, []);

  const historia = text(content.historia?.conteudo?.historia ?? content.historia?.conteudo?.texto);
  const missao = text(content.missao?.conteudo?.missao ?? content.missao?.conteudo?.texto);
  const visao = text(content.visao?.conteudo?.visao ?? content.visao?.conteudo?.texto);
  const valores = list(content.valores?.conteudo?.valores ?? content.valores?.conteudo?.lista ?? content.valores?.conteudo);
  const timeline = list(content.timeline?.conteudo?.timeline ?? content.timeline?.conteudo);
  const fotos = list(content.fotos?.conteudo?.fotos ?? content.fotos?.conteudo);

  return (
    <main className="page-body">
      <SiteHeader active="/sobre" />
      <section className="page-hero">
        <div className="shell">
          <div className="eyebrow">Futsal, formação e futuro</div>
          <h1>
            Nosso <em>clube</em>
          </h1>
          <p>A história e o elenco de uma SAF construída no Norte Pioneiro do Paraná.</p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell about-copy">
          <div className="section-heading">
            <div>
              <span>Desde 2009</span>
              <h2>Nossa história</h2>
            </div>
          </div>
          {loading ? (
            <div className="empty">Carregando…</div>
          ) : historia ? (
            historia
              .split(/\n\s*\n/)
              .filter(Boolean)
              .map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p>
              A SAF Talismã nasceu em Wenceslau Braz (PR) como um projeto de formação esportiva e
              humana. Mais do que um clube de futsal, somos uma escola de valores: disciplina,
              respeito e espírito de equipe — dentro e fora das quadras. As informações detalhadas
              da nossa trajetória serão publicadas em breve.
            </p>
          )}

          {timeline.length > 0 && (
            <>
              <h2>Linha do tempo</h2>
              {timeline.map((item, i) => (
                <p key={i}>• {item}</p>
              ))}
            </>
          )}

          {(missao || visao || valores.length > 0) && (
            <div className="about-values">
              {missao && (
                <div>
                  <span>Missão</span>
                  <strong>{missao}</strong>
                </div>
              )}
              {visao && (
                <div>
                  <span>Visão</span>
                  <strong>{visao}</strong>
                </div>
              )}
              {valores.map((v, i) => (
                <div key={i}>
                  <span>Valor</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          )}

          {fotos.length > 0 && (
            <>
              <h2>Galeria do clube</h2>
              <div className="article-gallery-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                {fotos.map((f, i) => (
                  <a key={i} href={publicFileUrl(f)} target="_blank" rel="noreferrer">
                    <img src={publicFileUrl(f)} alt={`Registro ${i + 1}`} loading="lazy" />
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span>Nossas equipes</span>
              <h2>Categorias</h2>
            </div>
            <p>Desenvolvimento esportivo e humano em todas as fases da formação.</p>
          </div>

          {loading ? (
            <div className="empty">Carregando elencos…</div>
          ) : teams.length === 0 ? (
            <div className="empty">
              <strong>Elenco em divulgação</strong>
            </div>
          ) : (
            teams.map((team) => (
              <div key={team.id} className="team-block">
                <h3>{team.nome}</h3>
                {team.descricao && <p className="team-desc">{team.descricao}</p>}
                {team.players && team.players.length > 0 && (
                  <div className="roster">
                    {team.players.map((p, i) => (
                      <div key={i} className="player">
                        {p.foto_url ? (
                          <img src={publicFileUrl(p.foto_url)} alt={p.nome} />
                        ) : (
                          <div className="p-num">{p.numero ?? i + 1}</div>
                        )}
                        <strong>{p.nome}</strong>
                        {p.apelido && <span>{p.apelido}</span>}
                        {p.posicao && <span className="p-pos">{p.posicao}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {team.staff && team.staff.length > 0 && (
                  <div className="roster" style={{ marginTop: 12 }}>
                    {team.staff.map((s, i) => (
                      <div key={i} className="player">
                        <div className="p-num" style={{ color: "#D200D2" }}>
                          ★
                        </div>
                        <strong>{s.nome}</strong>
                        <span className="p-pos">{s.funcao}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
