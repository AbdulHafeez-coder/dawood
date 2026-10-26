-- Add video column to the products table
-- Existing records will have NULL by default
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video text;
