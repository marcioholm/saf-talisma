-- ============================================================
-- SAF TALISMÃ — Migração 003 — Tabela da Diretoria da Associação
-- ============================================================

CREATE TABLE IF NOT EXISTS association_board_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  short_bio TEXT,
  photo_path TEXT,
  mandate_start DATE,
  mandate_end DATE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,
  instagram_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_board_members_order ON association_board_members(display_order);
CREATE INDEX IF NOT EXISTS idx_board_members_active ON association_board_members(is_active, is_public);

ALTER TABLE association_board_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_board_members" ON association_board_members;
CREATE POLICY "public_read_board_members" ON association_board_members
  FOR SELECT
  USING (is_active = true AND is_public = true AND archived_at IS NULL);

DROP POLICY IF EXISTS "admin_all_board_members" ON association_board_members;
CREATE POLICY "admin_all_board_members" ON association_board_members
  FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());
