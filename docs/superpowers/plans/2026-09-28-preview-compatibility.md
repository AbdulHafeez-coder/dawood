# Dawood Mart Preview compatibility plan

Scope: implement the owner's seven requirements in the existing Preview branch only. Production main and database are read-only. Baseline: main 3ff84b1; Preview dcb7a62; public API contains 702 products, including 334 Apollo/Appollo records. Existing settings contain known demo values.

- [x] Inspect live storefront, source, public catalog schema and settings; save local read-only catalog snapshot.
- [x] Add legacy-compatible catalog metadata using a versioned entry in the existing details array. Preserve original category, brand metadata and images. No schema migration required. Read typed metadata when present; default Apollo to Coming Soon. Explicit visibility and In Stock controls determine customer exposure.
- [x] Query real rows in bounded batches, then classify/filter/paginate consistently, including direct product lookup. Never append seed products.
- [x] Save metadata and edits with database acknowledgement and returned row verification; never report success for a zero-row update. Protect original brand details. Convert product removal to hiding.
- [x] Restore verified business configuration from the existing production footer when the settings row contains known demo identity. Do not invent social accounts or contact details.
- [x] Refine existing Preview design with real catalog images, three customer category groups and contextual subcategories. Preserve image-first cards and cart/detail flows.
- [x] Block writes against the known production database in this Preview build; test legacy schema, Apollo release/visibility, preservation and persistence locally.
- [ ] Verify real-data local Preview and deployed Preview where access permits. Hosted admin persistence requires an isolated Preview database; never test writes against production. Report any remaining prerequisite explicitly.

Validation: regression unit tests, TypeScript, lint, build, real catalog classification and preservation, browser desktop/mobile catalog/detail/cart/contact checks. Database reads may use the existing public key. No remote migrations, data deletion, main push or production promotion.


Verification on 2026-10-01:
- 29 unit tests pass; TypeScript passes; build passes; lint has zero errors and seven existing react-refresh warnings.
- Real-catalog persistent local PostgreSQL copy: 702 products, 334 Apollo preserved. Apollo In Stock raises visible count from 368 to 369; hide/status/price edits survive database close/reopen. Original IDs, categories, brand/source details, images and galleries are preserved.
- Browser: 368 visible products; Sheets 91 with four intended subcategories; Towels 8; real towel detail and empty cart drawer load. WhatsApp and footer use verified Dawood Mart production contact information.
- Hosted admin persistence/RLS remains unverified. Existing Supabase project has only production; dashboard requires a paid upgrade for database branches. No upgrade or remote database writes were performed.
- This Preview blocks mutations to the known production REST/storage host. Connect an isolated Preview database with the existing schema, catalog copy and admin access before running hosted save/reload tests.
- No migration is required by this implementation. Do not apply the earlier 20260928090000_storefront_catalog.sql migration for this Preview.
