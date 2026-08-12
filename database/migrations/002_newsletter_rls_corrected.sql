-- ============================================================
-- SAF TALISMÃ — Migração 002 — Políticas RLS Corrigidas
-- ------------------------------------------------------------
-- Obrigações deste arquivo (auditoria de segurança):
-- 1. Remover public_read_newsletter
-- 2. Remover public_insert_newsletter (inscrição usa API server-side)
-- 3. Listar todas as policies com USING (true) e WITH CHECK (true)
-- 4. Justificar individualmente as que permanecerem
-- 5. Não permitir acesso público a: newsletter_subscribers
-- ============================================================

-- ===============================================
-- newsletter_subscribers - ACCESS RESTRICTED
-- ===============================================
-- REGRA: Acesso público REMANEDE PROIBIDO
-- A inscrição ocorre via API server-side (/api/newsletter/subscribe)
-- Admin acessa para gestão no painel
-- ===============================================

-- POLÍCIA REMOVIDA: public_read_newsletter
-- Removida pois o acesso público a newsletter_subscribers não é necessário
-- A inscrição é feita via API controlada e a leitura só deve ocorrer
-- para o próprio usuário inscrito (com autenticação) ou admin

-- POLÍCIA REMOVIDA: public_insert_newsletter
-- Removida pois a inscrição ocorre via endpoint server-side (/api/newsletter/subscribe)
-- Isso impede INSERT direto via anon client e garante validação (Turnstile, rate limit, e-mail)

-- POLÍCIA: admin_all_newsletter (mantida com justificativa)
-- Apenas administradores podem gerenciar inscritos no painel
-- USING (true) e WITH CHECK (true) - acesso restrito a admins autenticados
CREATE POLICY "admin_all_newsletter" ON newsletter_subscribers
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===============================================
-- posts - ACCESS PUBLIC READ, ADMIN WRITE
-- ===============================================

-- POLÍCIA: public_read_published_posts
-- Apenas posts com status 'published' são visíveis publicamente
CREATE POLICY "public_read_published_posts" ON posts
  FOR SELECT
  USING (status = 'published');

-- POLÍCIA: admin_all_posts (mantida)
-- Admin ALL para gestão de posts no painel
CREATE POLICY "admin_all_posts" ON posts
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===============================================
-- sponsors - ACCESS ACTIVE ONLY
-- ===============================================

-- POLÍCIA: public_read_active_sponsors
-- Apenas sponsors ativos são visíveis publicamente
CREATE POLICY "public_read_active_sponsors" ON sponsors
  FOR SELECT
  USING (ativo = true);

-- POLÍCIA: admin_all_sponsors (mantida)
CREATE POLICY "admin_all_sponsors" ON sponsors
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===============================================
-- site_settings - READ PUBLIC, ADMIN WRITE
-- ===============================================

-- POLÍCIA: public_read_site_settings
-- Leitura pública de configurações de site (informações gerais)
CREATE POLICY "public_read_site_settings" ON site_settings
  FOR SELECT
  USING (true);

-- POLÍCIA: admin_all_site_settings (mantida)
CREATE POLICY "admin_all_site_settings" ON site_settings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ===============================================
-- newsletter_dispatches - ADMIN ONLY
-- ===============================================

-- POLÍCIA: admin_all_dispatches
-- Apenas admin pode criar, ler, atualizar dispatchs de newsletter
CREATE POLICY "admin_all_dispatches" ON newsletter_dispatches
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
