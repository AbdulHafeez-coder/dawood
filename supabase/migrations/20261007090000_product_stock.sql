-- Independent stock control; all records and existing access policies remain intact.
BEGIN;
SET LOCAL lock_timeout = '5s';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS in_stock boolean NOT NULL DEFAULT true;
COMMIT;
-- Rollback application code if needed; retain this column and saved values.
