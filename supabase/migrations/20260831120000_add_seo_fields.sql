-- Add SEO and slug fields to the products table
-- Existing records will have NULL by default
ALTER TABLE public.products ADD COLUMN slug text;
ALTER TABLE public.products ADD COLUMN seo_title text;
ALTER TABLE public.products ADD COLUMN seo_description text;

-- Create a unique index on slug that ignores NULL values
-- This ensures existing duplicate/null data doesn't fail the migration
CREATE UNIQUE INDEX products_slug_key ON public.products (slug) WHERE slug IS NOT NULL;
