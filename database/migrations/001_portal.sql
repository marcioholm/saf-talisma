-- ============================================================
-- SAF TALISMÃ — Portal Institucional e Esportivo
-- Migração 001 — Estrutura de dados completa
-- Executar no Supabase: SQL Editor → New Query → Run
-- Base: projeto zompnocfdlofhsyuiuhj
-- ============================================================

-- ------------------------------------------------------------
-- Extensões
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- PERFIS E PAPÉIS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- ------------------------------------------------------------
-- CATEGORIAS DE NOTÍCIAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- NOTÍCIAS (tabela base + colunas do portal; IF NOT EXISTS cobre
-- tanto banco vazio quanto o schema legado já aplicado)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  conteudo TEXT NOT NULL,
  resumo TEXT,
  subtitulo TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  categoria_id UUID,
  cover_alt TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  imagem_url TEXT,
  autor VARCHAR(100),
  author_user_id UUID,
  data_publicacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  destaque BOOLEAN DEFAULT false,
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_categoria_check;
ALTER TABLE posts DROP COLUMN IF EXISTS categoria;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS subtitulo TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'scheduled', 'published', 'archived'));
ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES post_categories(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS cover_alt TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_categoria_id ON posts(categoria_id);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON posts(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_posts_autor_user ON posts(author_user_id);

-- ------------------------------------------------------------
-- TAGS E RELAÇÕES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_tag_relations (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES post_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_tag_rel_tag ON post_tag_relations(tag_id);

-- ------------------------------------------------------------
-- CATEGORIAS ESPORTIVAS / EQUIPES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sports_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  imagem_capa_url TEXT,
  foto_oficial_url TEXT,
  comissao_tecnica JSONB DEFAULT '[]'::jsonb,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- ATLETAS E COMISSÃO TÉCNICA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES sports_categories(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  apelido TEXT,
  posicao TEXT,
  numero INTEGER,
  foto_url TEXT,
  data_nascimento DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_players_categoria ON players(categoria_id) WHERE ativo = true;

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES sports_categories(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  funcao TEXT,
  foto_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_categoria ON staff(categoria_id) WHERE ativo = true;

-- ------------------------------------------------------------
-- CAMPEONATOS (para filtros de jogos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  temporada TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- JOGOS E RESULTADOS (substitui a tabela legada `resultados`)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS resultados;

CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES sports_categories(id) ON DELETE SET NULL,
  competicao_id UUID REFERENCES competitions(id) ON DELETE SET NULL,
  adversario TEXT NOT NULL,
  escudo_adversario_url TEXT,
  fase_rodada TEXT,
  data_jogo TIMESTAMPTZ NOT NULL,
  local TEXT,
  cidade TEXT,
  casa_fora TEXT NOT NULL DEFAULT 'casa' CHECK (casa_fora IN ('casa', 'fora')),
  status TEXT NOT NULL DEFAULT 'agendado'
    CHECK (status IN ('agendado', 'andamento', 'encerrado', 'cancelado')),
  placar_nosso INTEGER,
  placar_adversario INTEGER,
  link_transmissao TEXT,
  noticia_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (status = 'encerrado' AND placar_nosso IS NOT NULL AND placar_adversario IS NOT NULL)
    OR (status <> 'encerrado')
  )
);

CREATE INDEX IF NOT EXISTS idx_games_categoria ON games(categoria_id);
CREATE INDEX IF NOT EXISTS idx_games_competicao ON games(competicao_id);
CREATE INDEX IF NOT EXISTS idx_games_data ON games(data_jogo);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status) WHERE status = 'agendado';
CREATE INDEX IF NOT EXISTS idx_games_noticia ON games(noticia_id);

-- ------------------------------------------------------------
-- TRANSPARÊNCIA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transparency_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  instituicao_origem TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'convenio', 'repasse', 'patrocinio', 'emenda_parlamentar',
    'edital', 'doacao', 'prestacao_contas', 'relatorio',
    'contrato', 'termo_parceria'
  )),
  numero_processo TEXT,
  valor NUMERIC(14, 2),
  data_recebimento DATE,
  periodo_execucao_inicio DATE,
  periodo_execucao_fim DATE,
  finalidade TEXT,
  situacao TEXT CHECK (situacao IN (
    'em_andamento', 'concluido', 'aguardando_prestacao',
    'prestacao_enviada', 'aprovado', 'cancelado'
  )),
  ano_referencia INTEGER,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  data_publicacao TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transparency_status ON transparency_records(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_transparency_ano ON transparency_records(ano_referencia);
CREATE INDEX IF NOT EXISTS idx_transparency_origem ON transparency_records(instituicao_origem);
CREATE INDEX IF NOT EXISTS idx_transparency_tipo ON transparency_records(tipo);

CREATE TABLE IF NOT EXISTS transparency_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID NOT NULL REFERENCES transparency_records(id) ON DELETE CASCADE,
  titulo TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  tipo_documento TEXT NOT NULL DEFAULT 'principal'
    CHECK (tipo_documento IN ('principal', 'complementar', 'comprovante', 'prestacao_contas')),
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transparency_docs_record ON transparency_documents(record_id);

-- ------------------------------------------------------------
-- BANNERS DA HOME
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT,
  subtitulo TEXT,
  texto TEXT,
  botao_texto TEXT,
  botao_url TEXT,
  botao_target TEXT NOT NULL DEFAULT 'same' CHECK (botao_target IN ('same', 'new')),
  imagem_desktop_url TEXT,
  imagem_mobile_url TEXT,
  imagem_alt TEXT,
  foco TEXT NOT NULL DEFAULT '50% 50%',
  ordem INTEGER NOT NULL DEFAULT 0,
  data_inicio DATE,
  data_fim DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banners_ativo ON banners(ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_banners_ordem ON banners(ordem);

-- ------------------------------------------------------------
-- PATROCINADORES (estende a tabela legada `sponsors`)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sponsor_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela base de patrocinadores (schema legado + colunas do portal)
CREATE TABLE IF NOT EXISTS sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(150) NOT NULL,
  logo_url TEXT NOT NULL,
  website TEXT,
  destaque BOOLEAN DEFAULT false,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE sponsors DROP CONSTRAINT IF EXISTS sponsors_categoria_check;
ALTER TABLE sponsors DROP COLUMN IF EXISTS categoria;
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES sponsor_categories(id) ON DELETE SET NULL;
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_sponsors_categoria_id ON sponsors(categoria_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_ativo ON sponsors(ativo) WHERE ativo = true;

-- ------------------------------------------------------------
-- CONTEÚDO INSTITUCIONAL (história, missão, visão, diretoria, etc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS institutional_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave TEXT NOT NULL UNIQUE,
  conteudo JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- CONFIGURAÇÕES DO SITE (redes sociais, contatos)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave TEXT NOT NULL UNIQUE,
  valor JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- LOGS DE AUDITORIA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  entidade TEXT,
  entidade_id UUID,
  detalhes JSONB DEFAULT '{}'::jsonb,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_entidade ON audit_logs(entidade, entidade_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- Tabelas legadas: newsletter e estatísticas
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  ativo BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_ativo ON newsletter_subscribers(ativo);

CREATE TABLE IF NOT EXISTS estatisticas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  atletas_ativos INTEGER DEFAULT 0,
  categorias INTEGER DEFAULT 0,
  anos_atuacao INTEGER DEFAULT 0,
  premios INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- ------------------------------------------------------------
-- Função utilitária: verifica papel do usuário autenticado
-- (usada nas políticas RLS; substitui o RLS nativo do Postgres)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.has_role(role_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = role_name
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('admin');
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('admin') OR public.has_role('editor');
$$;

-- ------------------------------------------------------------
-- Função: updated_at automático
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- ------------------------------------------------------------
-- Triggers de updated_at
-- ------------------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'post_categories', 'posts', 'sports_categories', 'players',
    'staff', 'competitions', 'games', 'transparency_records', 'banners',
    'sponsors', 'institutional_content', 'site_settings'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%I ON %I', t, t);
    EXECUTE format(
      'CREATE TRIGGER set_updated_at_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
      t, t
    );
  END LOOP;
END $$;

-- ------------------------------------------------------------
-- SEEDS — dados iniciais estruturais (sem conteúdo inventado)
-- ------------------------------------------------------------
INSERT INTO post_categories (nome, slug, descricao, ordem) VALUES
  ('Institucional', 'institucional', 'Ações e comunicações oficiais do clube.', 1),
  ('Jogos', 'jogos', 'Cobertura de jogos e partidas.', 2),
  ('Campeonatos', 'campeonatos', 'Participações em competições.', 3),
  ('Categorias de base', 'categorias-de-base', 'Sub-13, Sub-15 e formação.', 4),
  ('Adulto', 'adulto', 'Equipe adulta masculina.', 5),
  ('Feminino', 'feminino', 'Equipe feminina.', 6),
  ('Comunidade', 'comunidade', 'Ações sociais e comunitárias.', 7),
  ('Patrocinadores', 'patrocinadores', 'Parcerias e apoios.', 8),
  ('Eventos', 'eventos', 'Eventos, torneios e atividades.', 9)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO sponsor_categories (nome, slug, descricao, ordem) VALUES
  ('Patrocinador Master', 'master', 'Patrocínio principal.', 1),
  ('Patrocinador Oficial', 'oficial', 'Patrocínio oficial.', 2),
  ('Apoiador', 'apoiador', 'Apoio institucional ou comercial.', 3),
  ('Parceiro Institucional', 'parceiro-institucional', 'Parceria institucional.', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO sports_categories (nome, slug, descricao, ordem) VALUES
  ('Sub-13', 'sub-13', 'Primeiros passos, grandes sonhos.', 1),
  ('Sub-15', 'sub-15', 'Talento que ganha forma.', 2),
  ('Adulto', 'adulto', 'Nossa força em quadra.', 3),
  ('Feminino', 'feminino', 'Elas mudam o jogo.', 4)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_settings (chave, valor) VALUES
  ('contatos', '{"email":"contato@saftalisma.com.br","telefone":"","endereco":"","cidade":"","estado":""}'::jsonb),
  ('redes_sociais', '{"instagram":"","facebook":"","whatsapp":"","youtube":""}'::jsonb)
ON CONFLICT (chave) DO NOTHING;

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sports_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE transparency_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transparency_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE estatisticas ENABLE ROW LEVEL SECURITY;

-- Leitura pública — apenas conteúdo publicado/ativo
CREATE POLICY "public_read_posts" ON posts FOR SELECT
  USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

CREATE POLICY "public_read_post_categories" ON post_categories FOR SELECT
  USING (ativo = true);

CREATE POLICY "public_read_post_tags" ON post_tags FOR SELECT USING (true);
CREATE POLICY "public_read_tag_relations" ON post_tag_relations FOR SELECT USING (true);

CREATE POLICY "public_read_sports_categories" ON sports_categories FOR SELECT
  USING (ativo = true);

CREATE POLICY "public_read_players" ON players FOR SELECT
  USING (ativo = true);

CREATE POLICY "public_read_staff" ON staff FOR SELECT
  USING (ativo = true);

CREATE POLICY "public_read_competitions" ON competitions FOR SELECT
  USING (ativo = true);

CREATE POLICY "public_read_games" ON games FOR SELECT USING (true);

CREATE POLICY "public_read_transparency" ON transparency_records FOR SELECT
  USING (status = 'published');

CREATE POLICY "public_read_transparency_docs" ON transparency_documents FOR SELECT USING (true);

CREATE POLICY "public_read_banners" ON banners FOR SELECT
  USING (ativo = true);

CREATE POLICY "public_read_sponsor_categories" ON sponsor_categories FOR SELECT
  USING (ativo = true);

CREATE POLICY "public_read_sponsors" ON sponsors FOR SELECT
  USING (ativo = true);

CREATE POLICY "public_read_institutional" ON institutional_content FOR SELECT USING (true);
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "public_read_estatisticas" ON estatisticas FOR SELECT USING (true);

-- Newsletter: inscrição anônima
CREATE POLICY "public_insert_newsletter" ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Mutação — apenas admin ou editor (exceto módulos exclusivos de admin)
CREATE POLICY "staff_all_posts" ON posts FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_post_categories" ON post_categories FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_post_tags" ON post_tags FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_tag_relations" ON post_tag_relations FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_sports_categories" ON sports_categories FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_players" ON players FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_staff" ON staff FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_competitions" ON competitions FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_games" ON games FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_transparency" ON transparency_records FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_transparency_docs" ON transparency_documents FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_banners" ON banners FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_sponsor_categories" ON sponsor_categories FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_sponsors" ON sponsors FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "staff_all_institutional" ON institutional_content FOR ALL
  USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Exclusivo de admin
CREATE POLICY "admin_all_user_roles" ON user_roles FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "admin_all_profiles" ON profiles FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "admin_all_site_settings" ON site_settings FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "admin_all_audit_logs" ON audit_logs FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Leitura própria do perfil
CREATE POLICY "self_read_profile" ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Newsletter: somente admin gerencia
CREATE POLICY "admin_all_newsletter" ON newsletter_subscribers FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "admin_all_estatisticas" ON estatisticas FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- STORAGE — buckets públicos
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES
  ('covers', 'covers', true),
  ('games', 'games', true),
  ('banners', 'banners', true),
  ('sponsors', 'sponsors', true),
  ('transparency', 'transparency', true),
  ('institutional', 'institutional', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública dos arquivos
CREATE POLICY "public_read_objects" ON storage.objects FOR SELECT
  USING (bucket_id IN ('covers', 'games', 'banners', 'sponsors', 'transparency', 'institutional'));

-- Upload/gestão apenas para admin e editor
CREATE POLICY "staff_insert_objects" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('covers', 'games', 'banners', 'sponsors', 'transparency', 'institutional')
    AND public.is_staff()
  );

CREATE POLICY "staff_update_objects" ON storage.objects FOR UPDATE
  USING (public.is_staff());

CREATE POLICY "staff_delete_objects" ON storage.objects FOR DELETE
  USING (public.is_staff());

-- ------------------------------------------------------------
-- DADOS DE ESTATÍSTICA (preenchidos pelo painel; zeros como padrão)
-- ------------------------------------------------------------
INSERT INTO estatisticas (atletas_ativos, categorias, anos_atuacao, premios)
VALUES (0, 4, 0, 0)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Seeds de campeonatos e institucional vazios (estado vazio adequado)
-- ------------------------------------------------------------
INSERT INTO institutional_content (chave, conteudo) VALUES
  ('historia', '{}'::jsonb),
  ('missao', '{}'::jsonb),
  ('visao', '{}'::jsonb),
  ('valores', '{}'::jsonb),
  ('objetivos', '{}'::jsonb),
  ('impacto', '{}'::jsonb),
  ('diretoria', '{}'::jsonb),
  ('comissao', '{}'::jsonb),
  ('timeline', '[]'::jsonb),
  ('fotos', '[]'::jsonb)
ON CONFLICT (chave) DO NOTHING;