# Dawood Mart — Developer handoff, 28 September 2026

## Release state

This is a tested development update, **not a completed production deployment**. Production remains https://dawood-virid.vercel.app/ . The public Supabase API returned exactly 702 products during this session. A request for the new catalog metadata columns returned HTTP 400; the additive migration is still required.

Use only `AbdulHafeez-coder/dawood`, Vercel `abdul-hafeezs-projects-9f9cb3ad/dawood`, and Supabase `jowinhlsiofthbrtjind`. The available in-app browser remained signed in as `nhussain304`; no database or Vercel administration was performed through it. Production environment variables and deployed RLS have not been inspected with an authorized administrator session.

## Implemented in code

- Preserved TanStack Start / React 19 / Vite 8 / Tailwind 4 / Nitro Vercel architecture.
- Rebuilt homepage and product detail with mobile two-column catalog, larger desktop grids, image-first cards, search, price/status/category/subcategory filters, pagination and explicit failure/retry states.
- Public listing requests 24 products per page with server-side filters and stable availability-first ordering. Removed six production demo products and the global storefront full-catalog request. Admin still loads its complete management list in batches of 100; favourites/cart fetch only their saved IDs.
- Removed invented 20% discounts. Database prices are displayed unchanged. Removed product Brand controls, labels and filters per latest owner instruction; historical data is retained.
- Customer groups: Sheets, Crockery, Towels, Home Essentials. Table Sheets and Wallpaper Sheets stay separate. Old database category rows are retained.
- Added `available`, `on_demand`, `sold_out`, `coming_soon`, `discontinued` metadata. Unknown stock defaults to On Demand. Admin can edit category, sheet type and availability; successful save messages await database acknowledgement.
- Available products can enter the cart; on-demand/sold-out products have a WhatsApp request with name, ID and URL. Discontinued products are excluded from public browsing. Cart prices refresh from the database; checkout rechecks price/availability and awaits order persistence.
- Direct product ID/slug lookup, canonical slug redirect, SEO/Open Graph metadata, gallery and related products.
- Removed destructive demo reset/category-cascade-delete controls. Fixed baseline TypeScript issues and formatted sources to pass lint.

## Verification

- Unit tests: 18 passed, including catalog query pagination, API failures, price mapping, checkout persistence, cart refresh races, category mapping and write permission failure.
- TypeScript: `node node_modules/typescript/bin/tsc --noEmit` passed.
- ESLint: zero errors; seven React refresh warnings remain.
- Production build and Playwright storefront flow passed. Browser fixture checks cover 360px, 390px, 768px and 1280px overflow, search, pagination, category/sheet filters, detail, cart and WhatsApp URL.
- Browser tests use controlled catalog fixtures; they do not prove production administrator access or live writes.
- PGlite migration verification preserved all 702 original IDs/names/categories/prices, verified safe reapplication, status ordering, and invalid-status rejection.
- Live read-only check: production HTTP 200; Supabase product count 702. No live data changed.

## Deployment prerequisite

1. Sign in to Supabase and Vercel with the correct Abdul Hafeez account.
2. Back up the actual project, inspect deployed schema/RLS and apply only `supabase/migrations/20260928090000_storefront_catalog.sql` after review. It adds metadata without deleting products or old categories. The earlier three-category SQL is archived under `docs/category-reorganization/superseded/`; do not execute it.
3. Confirm actual product counts, admin writes and public visibility after migration. Mark real available stock through admin.
4. Verify production Vercel `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (or existing compatible server fallbacks), then merge the tested branch into the production branch and let the existing Vercel project rebuild from Git. **Do not deploy the local prebuilt QA output: it embeds a fake test publishable key.**
5. Repeat real-data mobile/desktop, direct-link SEO, admin save and checkout smoke tests, then report the actual deployment URL.

## Remaining limitations / security follow-up

- Production deployment, live admin saves, actual Vercel environment values and deployed RLS are unverified.
- Existing sourcing-request migration grants public row reads, including sensitive customer/internal fields. Review and restrict deployed policies before a production-ready claim; the UI's phone/ID filter is not an access-control boundary.
- Checkout validates prices/status client-side; an atomic server-side order transaction is still needed to prevent tampering/races. Structured order_items/customer columns are not wired; the current order message retains customer/item information.
- Dedicated indexable category URLs and full live-site SEO verification remain outstanding; category browsing currently uses homepage filters.
- No live stock claims, fake offers, database replacement, product imports or duplicate products were introduced.
