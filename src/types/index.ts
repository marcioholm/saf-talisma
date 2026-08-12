// Posts/Notícias
export interface Post {
  id: string;
  titulo: string;
  slug: string;
  conteudo: string;
  categoria: 'noticias' | 'sub-13' | 'sub-15' | 'masculino' | 'evento';
  imagem_url?: string;
  autor: string;
  data_publicacao: string;
  destaque: boolean;
  created_at: string;
  updated_at: string;
  resumo?: string;
}

export interface CreatePostDto {
  titulo: string;
  slug: string;
  conteudo: string;
  categoria: string;
  imagem_url?: string;
  autor: string;
  data_publicacao: string;
  destaque?: boolean;
  resumo?: string;
}

// Patrocinadores
export interface Sponsor {
  id: string;
  nome: string;
  logo_url: string;
  website?: string;
  categoria: 'ouro' | 'prata' | 'bronze' | 'parceiro';
  destaque: boolean;
  ordem: number;
  created_at: string;
}

export interface CreateSponsorDto {
  nome: string;
  logo_url: string;
  website?: string;
  categoria: string;
  destaque?: boolean;
  ordem: number;
}

// Newsletter
export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  ativo: boolean;
}

// Resultados
export interface Resultado {
  id: string;
  categoria: 'sub-13' | 'sub-15' | 'masculino' | 'feminino';
  data_jogo: string;
  time_adversario: string;
  placar_nosso: number;
  placar_adversario: number;
  competicao: string;
  local: string;
}

export interface CreateResultadoDto {
  categoria: string;
  data_jogo: string;
  time_adversario: string;
  placar_nosso: number;
  placar_adversario: number;
  competicao: string;
  local: string;
}

// Estatísticas
export interface Estatisticas {
  id: string;
  atletas_ativos: number;
  categorias: number;
  anos_atuacao: number;
  premios: number;
  updated_at: string;
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
