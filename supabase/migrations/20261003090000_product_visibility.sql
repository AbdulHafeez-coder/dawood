-- Additive visibility control. Existing catalog rows and business data are preserved.
-- Apply to an isolated database and verify admin/public access before production.
BEGIN;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS products_active_page_idx
  ON public.products (is_active, created_at DESC, id);

-- Restrictive policy combines with existing permissions; it does not grant access.
-- Existing authenticated admins retain access to inactive records.
DROP POLICY IF EXISTS "products storefront visibility" ON public.products;
CREATE POLICY "products storefront visibility" ON public.products
  AS RESTRICTIVE FOR SELECT TO anon, authenticated
  USING (is_active OR public.has_role(auth.uid(), 'admin'));
COMMIT;

-- Rollback access policy if necessary; retain the column and its saved values:
-- DROP POLICY "products storefront visibility" ON public.products;
