-- ============================================================
-- SAF TALISMÃ — Migração 004 — Módulo de Campeonatos e Inscrições
-- ============================================================

-- 1. Campeonatos
CREATE TABLE IF NOT EXISTS championships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  banner_path TEXT,
  short_description TEXT,
  full_description TEXT,
  rules_text TEXT,
  rules_file_path TEXT,
  modality TEXT DEFAULT 'Futsal',
  category TEXT NOT NULL DEFAULT 'Adulto',
  location_name TEXT DEFAULT 'Ginásio de Esportes Chapelão',
  city TEXT DEFAULT 'Arapoti',
  state TEXT DEFAULT 'PR',
  start_date DATE,
  end_date DATE,
  registration_start TIMESTAMPTZ,
  registration_end TIMESTAMPTZ,
  max_teams INTEGER DEFAULT 16,
  min_athletes_per_team INTEGER DEFAULT 5,
  max_athletes_per_team INTEGER DEFAULT 15,
  max_staff_per_team INTEGER DEFAULT 3,
  min_age INTEGER,
  max_age INTEGER,
  support_contact TEXT,
  featured_home BOOLEAN DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('draft', 'published', 'hidden', 'archived')),
  registration_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (registration_status IN ('scheduled', 'open', 'paused', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Contatos Responsáveis
CREATE TABLE IF NOT EXISTS team_responsible_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'PR',
  email_verified BOOLEAN DEFAULT false,
  verification_token_hash TEXT,
  verification_expires_at TIMESTAMPTZ,
  representation_declared BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Inscrições de Equipes
CREATE TABLE IF NOT EXISTS team_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  championship_id UUID NOT NULL REFERENCES championships(id) ON DELETE CASCADE,
  responsible_id UUID NOT NULL REFERENCES team_responsible_contacts(id),
  team_name TEXT NOT NULL,
  short_name TEXT,
  city TEXT NOT NULL,
  state TEXT DEFAULT 'PR',
  colors TEXT,
  logo_path TEXT,
  notes TEXT,
  protocol TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'email_verified', 'under_review', 'correction_requested', 'approved', 'rejected', 'cancelled')),
  status_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Comissão Técnica
CREATE TABLE IF NOT EXISTS team_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES team_registrations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  document_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Atletas Inscritos
CREATE TABLE IF NOT EXISTS registration_athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES team_registrations(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  sports_name TEXT,
  birth_date DATE NOT NULL,
  city TEXT,
  state TEXT DEFAULT 'PR',
  jersey_number INTEGER,
  position TEXT,
  cpf_hash TEXT,
  cpf_encrypted TEXT,
  doc_path TEXT,
  parent_guardian_name TEXT,
  parent_guardian_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Consentimentos de Regulamento
CREATE TABLE IF NOT EXISTS registration_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES team_registrations(id) ON DELETE CASCADE,
  rules_accepted BOOLEAN DEFAULT true,
  privacy_accepted BOOLEAN DEFAULT true,
  terms_accepted_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Consentimentos de Marketing / Comunicação Futura
CREATE TABLE IF NOT EXISTS communication_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  responsible_id UUID NOT NULL REFERENCES team_responsible_contacts(id),
  future_campaigns_accepted BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Histórico e Auditoria
CREATE TABLE IF NOT EXISTS registration_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID NOT NULL REFERENCES team_registrations(id),
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_championships_slug ON championships(slug);
CREATE INDEX IF NOT EXISTS idx_championships_vis ON championships(visibility);
CREATE INDEX IF NOT EXISTS idx_registrations_champ ON team_registrations(championship_id);
CREATE INDEX IF NOT EXISTS idx_registrations_proto ON team_registrations(protocol);
CREATE INDEX IF NOT EXISTS idx_registrations_token ON team_registrations(access_token);
CREATE INDEX IF NOT EXISTS idx_athletes_reg ON registration_athletes(registration_id);

-- ROW LEVEL SECURITY
ALTER TABLE championships ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_responsible_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_status_history ENABLE ROW LEVEL SECURITY;

-- Leitura pública somente de campeonatos publicados
DROP POLICY IF EXISTS "public_read_championships" ON championships;
CREATE POLICY "public_read_championships" ON championships
  FOR SELECT
  USING (visibility = 'published');

-- Admin gerencia tudo
DROP POLICY IF EXISTS "admin_all_championships" ON championships;
CREATE POLICY "admin_all_championships" ON championships FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "admin_all_responsible" ON team_responsible_contacts;
CREATE POLICY "admin_all_responsible" ON team_responsible_contacts FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "admin_all_registrations" ON team_registrations;
CREATE POLICY "admin_all_registrations" ON team_registrations FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "admin_all_staff_reg" ON team_staff;
CREATE POLICY "admin_all_staff_reg" ON team_staff FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "admin_all_athletes" ON registration_athletes;
CREATE POLICY "admin_all_athletes" ON registration_athletes FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "admin_all_consents" ON registration_consents;
CREATE POLICY "admin_all_consents" ON registration_consents FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "admin_all_comm_consents" ON communication_consents;
CREATE POLICY "admin_all_comm_consents" ON communication_consents FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "admin_all_history" ON registration_status_history;
CREATE POLICY "admin_all_history" ON registration_status_history FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());
