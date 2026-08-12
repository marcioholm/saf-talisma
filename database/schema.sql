-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Posts/Notícias
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  conteudo TEXT NOT NULL,
  resumo TEXT,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('noticias', 'sub-13', 'sub-15', 'masculino', 'evento')),
  imagem_url TEXT,
  autor VARCHAR(100) NOT NULL,
  data_publicacao TIMESTAMP WITH TIME ZONE NOT NULL,
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_posts_categoria ON posts(categoria);
CREATE INDEX idx_posts_data_publicacao ON posts(data_publicacao DESC);
CREATE INDEX idx_posts_destaque ON posts(destaque);
CREATE INDEX idx_posts_slug ON posts(slug);

-- Patrocinadores
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(150) NOT NULL,
  logo_url TEXT NOT NULL,
  website TEXT,
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('ouro', 'prata', 'bronze', 'parceiro')),
  destaque BOOLEAN DEFAULT false,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_sponsors_categoria ON sponsors(categoria);
CREATE INDEX idx_sponsors_ordem ON sponsors(ordem);

-- Newsletter
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ativo BOOLEAN DEFAULT true
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_ativo ON newsletter_subscribers(ativo);

-- Resultados
CREATE TABLE resultados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('sub-13', 'sub-15', 'masculino', 'feminino')),
  data_jogo DATE NOT NULL,
  time_adversario VARCHAR(100) NOT NULL,
  placar_nosso INTEGER NOT NULL,
  placar_adversario INTEGER NOT NULL,
  competicao VARCHAR(100) NOT NULL,
  local VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_resultados_categoria ON resultados(categoria);
CREATE INDEX idx_resultados_data_jogo ON resultados(data_jogo DESC);

-- Estatísticas
CREATE TABLE estatisticas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  atletas_ativos INTEGER DEFAULT 0,
  categorias INTEGER DEFAULT 0,
  anos_atuacao INTEGER DEFAULT 0,
  premios INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resultados_updated_at BEFORE UPDATE ON resultados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estatisticas_updated_at BEFORE UPDATE ON estatisticas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE estatisticas ENABLE ROW LEVEL SECURITY;

-- Políticas de read público
CREATE POLICY "Posts são públicos para leitura"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Sponsors são públicos para leitura"
  ON sponsors FOR SELECT
  USING (true);

CREATE POLICY "Resultados são públicos para leitura"
  ON resultados FOR SELECT
  USING (true);

CREATE POLICY "Estatísticas são públicas para leitura"
  ON estatisticas FOR SELECT
  USING (true);

-- Newsletter - apenas insert anônimo
CREATE POLICY "Qualquer um pode se inscrever na newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuário pode atualizar sua subscrição"
  ON newsletter_subscribers FOR UPDATE
  USING (true);

-- Inserir estatísticas iniciais
INSERT INTO estatisticas (atletas_ativos, categorias, anos_atuacao, premios)
VALUES (0, 4, 15, 0);
