export type HomeDestaque = {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  numero: string;
  numero_rotulo: string;
  botao_texto: string;
  botao_link: string;
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

export const DEFAULT_HOME_DESTAQUE: HomeDestaque = {
  eyebrow: "ORGULHO DO NORTE PIONEIRO",
  titulo: "Mais que futsal.\nUm movimento.",
  subtitulo:
    "Formando atletas, fortalecendo valores e levando o nome de Wenceslau Braz cada vez mais longe.",
  numero: "17",
  numero_rotulo: "ANOS\nDE HISTÓRIA",
  botao_texto: "Conheça nossa história",
  botao_link: "#historia",
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
  link_url: "#noticias",
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
