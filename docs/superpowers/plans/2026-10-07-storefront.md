# Dawood Mart storefront and stock plan

Goal: Replace customer storefront presentation while preserving Supabase, catalog, Admin, cart, orders and authentication.
Architecture: Existing TanStack routes/hooks; shared storefront header, category navigation and clean cards. No new framework or packages. Neutral canvas, charcoal text, olive CTAs, real catalog photography. Existing DB categories mapped into presentation groups only.

- [x] Add independently controlled in_stock boolean with additive idempotent migration; preserve every original column and row. Existing is_active RLS stays intact. Rollback application code without dropping stored values.
- [x] Extend existing Admin table/status writer; add availability checks at cart add and checkout submission, using fresh DB reads and failing closed on errors.
- [x] Replace homepage, cards, search/header/footer and product presentation. Restyle cart and favourites; preserve actions and stored cart keys. No brands or raw SEO/tag metadata rendered.
- [x] Use existing photography, responsive WebP local assets and supported remote CDN sizing; secondary photos fetched only on desktop interaction. Keep requests bounded at 24 products.
- [ ] Run focused status/preservation tests, build + SSR smoke, real rendered mobile widths 360/375/390/412/430 and desktop, search/cart/detail checks. Record performance measurements and any tool limitations honestly.
- [ ] Commit/push current branch; deploy current work as previously authorized after compatibility checks. Do not claim final business sign-off or place real test orders.

Admin credentials remain in existing Supabase Auth. Never print secrets or reset a password without the owner's action.

## Verification and continuation
- Production additive stock migration applied with an in-transaction comparison of every original product JSON row. 702 products and the existing order preserved; RLS remains enabled. No category, image, order or authentication data changed.
- Query and stock checks passed, including disjoint 24-row public API pages and fail-closed unavailable basket checks. Local PostgreSQL tests preserve all 702 original rows and verify independent status persistence and RLS.
- Production build and SSR homepage smoke passed. Browser checks cover desktop, 360/375/390/412/430 mobile frames, catalog pagination, real one-letter suggestions, keyboard product navigation, cart add and checkout navigation. No order submitted.
- Four-panel hero correction replaces the earlier split hero only. Floating white home header; four real catalog visuals; native horizontal mobile scrolling; no additional API requests or carousel dependency. Bestseller image uses the existing catalog's explicit Bestseller tag.
- Authenticated Admin UI save/reload still needs owner login. Existing /admin/login uses Supabase Auth and user_roles; one admin account exists. Password is not exposed in source. Owner can use Supabase Authentication > Users for account recovery; no credentials or reset changed.
- Typecheck retains pre-existing ErrorView/ErrorComponentProps incompatibilities and vite.config server.preset typing error. Production build passes; unrelated configuration/auth code left intact.
- Browser performance throttling/LCP/CLS measurements were not available through the current browser tools; no scores claimed.
