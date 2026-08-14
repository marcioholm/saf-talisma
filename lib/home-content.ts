export type HomeDestaque = {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  numero: string;
  numero_rotulo: string;
  botao_texto: string;
  botao_link: string;
  imagem_historia_url?: string;
  imagem_hero_url?: string;
};

export type HomeEvento = {
  exibir: boolean;
  competicao: string;
  status_label: string;
  placar: string;
  data_local: string;
  time_casa: string;
  time_fora: string;
  marca_fora: string;
  link_texto: string;
  link_url: string;
};

export type HomeProximoDesafio = {
  exibir: boolean;
  tag: string;
  titulo: string;
  subtitulo: string;
  fase_rodada: string;
  local_cidade: string;
  time_casa: string;
  time_fora: string;
  marca_fora: string;
  escudo_fora_url: string;
  imagem_fundo_url: string;
  status_label: string;
  link_texto: string;
  link_url: string;
};

export const DEFAULT_HOME_DESTAQUE: HomeDestaque = {
  eyebrow: "CAMPOS GERAIS DO PARANÁ",
  titulo: "Mais que futsal.\nUm movimento.",
  subtitulo:
    "Formando atletas, fortalecendo valores e desenvolvendo o esporte em Arapoti e região.",
  numero: "17",
  numero_rotulo: "ANOS\nDE HISTÓRIA",
  botao_texto: "Conheça nossa história",
  botao_link: "/sobre",
  imagem_historia_url: "",
  imagem_hero_url: "",
};

export const DEFAULT_HOME_EVENTO: HomeEvento = {
  exibir: true,
  competicao: "CONMEBOL\nSUL-AMERICANO\nDE CLUBES",
  status_label: "ENCERRADO",
  placar: "6 × 2",
  data_local: "29 JUL 2026 · ASSUNÇÃO, PAR",
  time_casa: "SAF Talismã",
  time_fora: "Palermo FC",
  marca_fora: "PFC",
  link_texto: "Ver detalhes",
  link_url: "/jogos",
};

export const DEFAULT_HOME_PROXIMO_DESAFIO: HomeProximoDesafio = {
  exibir: true,
  tag: "PRÓXIMO DESAFIO",
  titulo: "A caminhada\ncontinua.",
  subtitulo: "Mais um grande confronto pela fase de grupos do Sul-Americano de Clubes.",
  fase_rodada: "FASE DE GRUPOS · RODADA 2",
  local_cidade: "ASSUNÇÃO, PARAGUAI",
  time_casa: "SAF Talismã",
  time_fora: "12 de Junio Futsal",
  marca_fora: "12J",
  escudo_fora_url: "",
  imagem_fundo_url: "",
  status_label: "EM BREVE",
  link_texto: "Acompanhe a Associação",
  link_url: "/jogos",
};

function toObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export function mergeDestaque(rows: Array<{ chave: string; valor: unknown }> | null | undefined): HomeDestaque {
  const row = (rows ?? []).find((r) => r.chave === "home_destaque");
  return { ...DEFAULT_HOME_DESTAQUE, ...(toObject(row?.valor) as Partial<HomeDestaque>) };
}

export function mergeEvento(rows: Array<{ chave: string; valor: unknown }> | null | undefined): HomeEvento {
  const row = (rows ?? []).find((r) => r.chave === "home_evento");
  return { ...DEFAULT_HOME_EVENTO, ...(toObject(row?.valor) as Partial<HomeEvento>) };
}

export function mergeProximoDesafio(rows: Array<{ chave: string; valor: unknown }> | null | undefined): HomeProximoDesafio {
  const row = (rows ?? []).find((r) => r.chave === "home_proximo_desafio");
  return { ...DEFAULT_HOME_PROXIMO_DESAFIO, ...(toObject(row?.valor) as Partial<HomeProximoDesafio>) };
}
