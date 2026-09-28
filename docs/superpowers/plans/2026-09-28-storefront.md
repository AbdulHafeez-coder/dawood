# Dawood Mart storefront implementation plan

**Goal:** Serve the real Supabase catalog through a mobile storefront and editable admin controls.
**Architecture:** Preserve TanStack Start, existing authentication, cart and infrastructure. Introduce a paged catalog repository with explicit failures and direct detail lookup. Add stock metadata without deleting products; deploy only after the database contract is available.
**Tech Stack:** React 19, TanStack Start, Vite 8, Tailwind 4, Supabase, Vercel.
**Spec:** ../dawood-master-brief.md

## Constraints and audit

- Only AbdulHafeez-coder/dawood and Supabase jowinhlsiofthbrtjind. Browser currently has an unauthorized account; do not use it.
- Existing six demo products survive failed requests; hydration never retries. Remove production seeds.
- Existing mapper invents 20% discounts and a Classic brand; preserve real prices and metadata.
- Existing product detail depends on a global full-catalog fetch and drops slugs.
- Existing schema lacks availability, brand and subcategory columns. Unknown stock defaults to on_demand; owner will manage it in admin.
- Never apply the earlier destructive category consolidation automatically. Preserve old categories while mapping customer navigation.
- Existing orders announce success before database acknowledgement; inspect and correct before claiming checkout QA.

## Deliverables and verification

- [ ] Catalog contract: pure mapping/status helpers, direct ID/slug lookup, ranged queries, stable availability ordering, escaped search, filters. Unit tests assert actual prices, no invented brands, unknown stock, pagination and failure handling.
- [ ] Additive migration: status/brand/subcategory and sorting/search support. Preserve product IDs/count/content, retain old categories, restrict public discontinued visibility with admin access. Validate migration and rollback in isolated PostgreSQL.
- [ ] Admin controls: editable category, subcategory, brand, status; await saves and report errors; remove reset-to-demo action.
- [ ] Storefront: compact real-data cards, search and filters, loading/error/retry/empty states, pagination, mobile navigation, real category sections without fabricated offers.
- [ ] Details: direct query, canonical URL and metadata, real image gallery, status-aware cart/request, WhatsApp name/ID/link, related products.
- [ ] Gates: unit tests, TypeScript, ESLint, production build, controlled browser checks at 360/390/tablet/desktop, then review.
- [ ] Release: verify correct GitHub identity, push tested commit, verify existing Vercel deployment and live Supabase product reads. Record inaccessible settings and unapplied migrations explicitly.
