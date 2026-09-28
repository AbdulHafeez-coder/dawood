# Current rollout

The September 26 three-category migration is superseded and archived under `superseded/`. Do not execute it or its rollback on production. It would contradict the new requirement to retain legacy categories.

Apply only `supabase/migrations/20260928090000_storefront_catalog.sql` to the verified `jowinhlsiofthbrtjind` project, using the owner's authorized account. This adds stock and storefront metadata; it never removes products or the 69 legacy categories. All unknown stock starts as On Demand; the owner edits availability in admin.

Take a database backup before applying. Verify product IDs/count and original product columns remain unchanged. Validate the actual RLS policies and admin access. The customer application needs these new columns before releasing the storefront commit. A GitHub push alone does not run SQL migrations.

Rollback application first to the prior known working commit. Keep additive columns and entered availability data. Do not drop metadata columns after admins have edited products. The old three-category rollback does not apply to this migration.

Product brand controls and filters were removed at the owner's request. Existing descriptions and historical database metadata are retained.
