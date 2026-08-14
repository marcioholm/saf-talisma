import { SiteHeader, SiteFooter } from "../../components/site-shell";
import { supabaseUrl, supabaseAnonKey, publicFileUrl } from "../../lib/supabase";
import { associationConfig } from "../../lib/association-config";
import Link from "next/link";
import "../public.css";

type Content = { chave: string; conteudo: Record<string, unknown> };
type SportCat = {
  id: string;
  nome: string;
  descricao: string | null;
  players: Array<{ nome: string; apelido: string | null; posicao: string | null; numero: number | null; foto_url: string | null }> | null;
  staff: Array<{ nome: string; funcao: string | null }> | null;
};

type ConfigSobre = {
  title?: string;
  presentation?: string;
  missao?: string;
  visao?: string;
  valores?: string;
  sportsLocationName?: string;
  sportsLocationStreet?: string;
  sportsLocationNumber?: string;
  sportsLocationCity?: string;
  sportsLocationState?: string;
  sportsLocationPostalCode?: string;
  mapEmbedUrl?: string;
  mapRouteUrl?: string;
};

type ConfigInstitucional = {
  legalName?: string;
  institutionalName?: string;
  cnpj?: string;
  region?: string;
  legalAddress?: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
  };
};

function text(value: unknown): string {
  return typeof value === "string" ? value : Array.isArray(value) ? value.join("\n") : "";
}

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === "string") : [];
}

async function getContentMap(): Promise<Record<string, Content>> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/institutional_content?select=chave,conteudo`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 30 },
      }
    );
    if (res.ok) {
      const rows = await res.json();
      const map: Record<string, Content> = {};
      for (const r of rows) map[r.chave] = r as Content;
      return map;
    }
  } catch (e) {
    console.error("Erro ao carregar conteúdo institucional:", e);
  }
  return {};
}

async function getSiteSettings(): Promise<{ sobre: ConfigSobre; institucional: ConfigInstitucional }> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/site_settings?select=chave,valor&chave=in.(config_sobre,config_institucional)`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 30 },
      }
    );
    if (res.ok) {
      const rows = await res.json();
      const sobreRow = rows?.find((r: any) => r.chave === "config_sobre")?.valor || {};
      const instRow = rows?.find((r: any) => r.chave === "config_institucional")?.valor || {};
      return { sobre: sobreRow, institucional: instRow };
    }
  } catch (e) {
    console.error("Erro ao carregar configurações de sobre:", e);
  }
  return { sobre: {}, institucional: {} };
}

async function getTeams(): Promise<SportCat[]> {
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/sports_categories?select=id,nome,descricao&ativo=eq.true&order=ordem.asc`,
      {
        headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
        next: { revalidate: 30 },
      }
    );
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Erro ao carregar equipes:", e);
  }
  return [];
}

export default async function SobrePage() {
  const [content, { sobre, institucional }, teams] = await Promise.all([
    getContentMap(),
    getSiteSettings(),
    getTeams(),
  ]);

  const presentation = sobre.presentation || text(content.historia?.conteudo?.historia ?? content.historia?.conteudo?.texto) || (
    `A ${associationConfig.institutionalName} atua por meio do esporte, da formação e do desenvolvimento de atletas. Sediada em Arapoti, nos Campos Gerais do Paraná, a Associação desenvolve projetos, participa de competições e promove iniciativas que fortalecem o esporte e a comunidade.`
  );

  const missao = sobre.missao || text(content.missao?.conteudo?.missao ?? content.missao?.conteudo?.texto);
  const visao = sobre.visao || text(content.visao?.conteudo?.visao ?? content.visao?.conteudo?.texto);
  const valoresRaw = sobre.valores || content.valores?.conteudo?.valores || content.valores?.conteudo?.lista;
  const valores = typeof valoresRaw === "string" ? valoresRaw.split(",").map((s) => s.trim()).filter(Boolean) : list(valoresRaw);

  const timeline = list(content.timeline?.conteudo?.timeline ?? content.timeline?.conteudo);
  const fotos = list(content.fotos?.conteudo?.fotos ?? content.fotos?.conteudo);

  // Endereço legal
  const legalName = institucional.legalName || associationConfig.legalName;
  const cnpj = institucional.cnpj || associationConfig.cnpj;
  const legalStreet = institucional.legalAddress?.street || associationConfig.legalAddress.street;
  const legalNumber = institucional.legalAddress?.number || associationConfig.legalAddress.number;
  const legalCity = institucional.legalAddress?.city || associationConfig.legalAddress.city;
  const legalState = institucional.legalAddress?.state || associationConfig.legalAddress.state;
  const legalRegion = institucional.region || associationConfig.region;

  // Local esportivo
  const sportsName = sobre.sportsLocationName || associationConfig.sportsLocation.name;
  const sportsStreet = sobre.sportsLocationStreet || associationConfig.sportsLocation.street;
  const sportsNumber = sobre.sportsLocationNumber || associationConfig.sportsLocation.number;
  const sportsCity = sobre.sportsLocationCity || associationConfig.sportsLocation.city;
  const sportsState = sobre.sportsLocationState || associationConfig.sportsLocation.state;
  const sportsPostal = sobre.sportsLocationPostalCode || associationConfig.sportsLocation.postalCode;

  // Montar URL de Embed do Google Maps 100% compatível com iframes
  const chapelaoQuery = `${sportsName}, ${sportsStreet}, ${sportsNumber}, ${sportsCity}, ${sportsState}`;
  const mapsEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(chapelaoQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  const mapRouteUrl = sobre.mapRouteUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(chapelaoQuery)}`;

  return (
    <main className="page-body">
      <SiteHeader active="/sobre" />
      <section className="page-hero">
        <div className="shell">
          <div className="eyebrow">{legalRegion.toUpperCase()}</div>
          <h1>
            Sobre a <em>Associação</em>
          </h1>
          <p>Esporte, formação e desenvolvimento de atletas em Arapoti e nos Campos Gerais do Paraná.</p>
        </div>
      </section>

      {/* Apresentação Institucional */}
      <section className="page-section">
        <div className="shell about-copy">
          <div className="section-heading">
            <div>
              <span>Institucional</span>
              <h2>Nossa trajetória</h2>
            </div>
          </div>
          {presentation
            .split(/\n\s*\n/)
            .filter(Boolean)
            .map((p, i) => <p key={i}>{p}</p>)}

          {timeline.length > 0 && (
            <>
              <h2>Marcos históricos</h2>
              {timeline.map((item, i) => (
                <p key={i}>• {item}</p>
              ))}
            </>
          )}

          {/* Missão, Visão e Valores */}
          {(missao || visao || valores.length > 0) && (
            <div className="about-values" style={{ marginTop: 32, marginBottom: 32 }}>
              {missao && (
                <div style={{ background: "#f8f9fa", borderLeft: "4px solid #61CE70", padding: "16px", borderRadius: "4px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#666", fontWeight: "bold" }}>Missão</span>
                  <strong style={{ display: "block", fontSize: "16px", color: "#111", marginTop: "4px" }}>{missao}</strong>
                </div>
              )}
              {visao && (
                <div style={{ background: "#f8f9fa", borderLeft: "4px solid #D200D2", padding: "16px", borderRadius: "4px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#666", fontWeight: "bold" }}>Visão</span>
                  <strong style={{ display: "block", fontSize: "16px", color: "#111", marginTop: "4px" }}>{visao}</strong>
                </div>
              )}
              {valores.length > 0 && (
                <div style={{ background: "#f8f9fa", borderLeft: "4px solid #333", padding: "16px", borderRadius: "4px" }}>
                  <span style={{ fontSize: "12px", textTransform: "uppercase", color: "#666", fontWeight: "bold" }}>Valores</span>
                  <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
                    {valores.map((v, i) => (
                      <li key={i} style={{ fontSize: "15px", color: "#222", marginBottom: "4px" }}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {fotos.length > 0 && (
            <>
              <h2>Galeria de registros</h2>
              <div className="article-gallery-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                {fotos.map((f, i) => (
                  <a key={i} href={publicFileUrl(f)} target="_blank" rel="noreferrer">
                    <img src={publicFileUrl(f)} alt={`Registro ${i + 1}`} loading="lazy" />
                  </a>
                ))}
              </div>
            </>
          )}

          {/* Chamada para a Diretoria */}
          <div style={{ marginTop: 40, padding: "24px", background: "#0d0d0d", color: "#fff", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontFamily: "'Barlow Condensed', sans-serif", fontSize: "22px" }}>Gestão e Transparência</h3>
              <p style={{ margin: "4px 0 0 0", color: "#aaa", fontSize: "14px" }}>Conheça a diretoria responsável pela condução da Associação.</p>
            </div>
            <Link href="/diretoria" className="partner-button" style={{ display: "inline-block" }}>
              Ver Diretoria
            </Link>
          </div>
        </div>
      </section>

      {/* Informações Legais vs Local Esportivo */}
      <section className="page-section" style={{ background: "#faf9f6", borderTop: "1px solid #eaeaea", borderBottom: "1px solid #eaeaea", padding: "48px 0" }}>
        <div className="shell">
          <div className="section-heading">
            <div>
              <span>Transparência e Localização</span>
              <h2>Dados institucionais e Sede das atividades</h2>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "32px", marginTop: "24px" }}>
            {/* Endereço Legal */}
            <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <span style={{ color: "#61CE70", fontWeight: "bold", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Endereço Legal da Associação
              </span>
              <h3 style={{ margin: "8px 0 12px 0", fontSize: "20px" }}>{legalName}</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#555", lineHeight: 1.6 }}>
                <strong>CNPJ:</strong> {cnpj}<br />
                <strong>Endereço:</strong> {legalStreet}, {legalNumber}<br />
                <strong>Município:</strong> {legalCity} – {legalState}<br />
                <strong>Região:</strong> {legalRegion}
              </p>
            </div>

            {/* Local Esportivo (Chapelão) */}
            <div style={{ background: "#fff", padding: "24px", borderRadius: "8px", border: "1px solid #e0e0e0" }}>
              <span style={{ color: "#D200D2", fontWeight: "bold", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Local das Atividades Esportivas
              </span>
              <h3 style={{ margin: "8px 0 12px 0", fontSize: "20px" }}>{sportsName}</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#555", lineHeight: 1.6 }}>
                <strong>Endereço:</strong> {sportsStreet}, {sportsNumber}<br />
                <strong>Cidade:</strong> {sportsCity} – {sportsState}<br />
                <strong>CEP:</strong> {sportsPostal}
              </p>

              <div style={{ marginTop: "16px" }}>
                <a
                  href={mapRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: "inline-block",
                    padding: "10px 18px",
                    background: "#0d0d0d",
                    color: "#fff",
                    borderRadius: "4px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Como chegar (Google Maps) →
                </a>
              </div>
            </div>
          </div>

          {/* Mapa do Chapelão */}
          <div style={{ marginTop: "32px", borderRadius: "8px", overflow: "hidden", border: "1px solid #ddd", background: "#f0f0f0", height: "400px" }}>
            <iframe
              title="Mapa do Ginásio de Esportes Chapelão"
              src={mapsEmbedSrc}
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* Contato & Redes Sociais */}
      <section className="page-section" id="contato">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span>Fale Conosco</span>
              <h2>Fale com a Associação</h2>
            </div>
            <p>Para informações sobre projetos, campeonatos, parcerias e atividades da Associação, entre em contato pelos nossos canais oficiais.</p>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "24px" }}>
            <a
              href={`mailto:${associationConfig.email}`}
              className="partner-button"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              Enviar E-mail
            </a>
            <a
              href={`https://wa.me/${associationConfig.phoneRaw}`}
              target="_blank"
              rel="noopener noreferrer"
              className="partner-button"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#25D366", borderColor: "#25D366" }}
            >
              WhatsApp Oficial
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
