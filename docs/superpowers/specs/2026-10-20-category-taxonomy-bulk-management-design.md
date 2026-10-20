# Dawood Mart Category Taxonomy and Bulk Product Management

## Scope

Implement in development only. Do not execute production database changes, deploy, delete catalog data, or alter existing product category values, IDs, SKUs, prices, images, descriptions, stock, URLs, orders, customers, checkout, payments, shipping, or authentication.

## Taxonomy

Add a versioned, client-side taxonomy definition. It maps verified source categories and product IDs into four homepage groups without mutating `products.category`.

- **Sheets**: Dining Table Sheets (80 verified products), Center & Side Table Sheets (`prod-c5fd53b3`), Dressing & Bedside Table Sheets (`prod-53f5fe33`), Wallpaper Sheets (`prod-7c584e73`, `white-marble-wall-sheet-10x5`).
- **Towels**: Bath Towels, Hand Towels, Face Towels, Towel Sets. Kitchen Towels stay unassigned.
- **Gadgets**: verified `Electronics & Gadgets` products only, split into Other Electrical Appliances and Useful Household Gadgets when product names prove it.
- **Crockery**: verified cups/drinkware, glasses, serving/dining, containers, jars, food warmers, kitchenware, and ceramics, split by product purpose.

Do not create empty Dastarkhwan Sheets, Desk Sheets, Kids Towels, Electric Kettles, or Room Heaters subcategories. Leave six ambiguous Sheets products unassigned: `prod-154a2dea`, `prod-6455ba5b`, `prod-7478d47a`, `prod-80bf8075`, `prod-8466f8d3`, `prod-d7f30f11`.

## Storefront

Homepage renders exactly four cards using existing card classes, images, colors, typography, and layout. Each card exposes verified non-empty subcategories: hover on desktop, tap/click on mobile. Routes use taxonomy query values; the product query expands them to exact verified IDs/source categories. Existing database-category query values remain accepted.

## Admin bulk actions

Add a server endpoint protected by existing authenticated-admin authorization. It validates action and IDs, re-reads matching products, applies bounded batches atomically per batch, reports affected/failed counts, and rejects duplicate requests. Actions: activate, deactivate, out-of-stock, quantity update only if quantity field exists, and guarded delete. Delete requires explicit count confirmation and must use the existing safe deletion policy.

Admin selection tracks page IDs separately from all matching filtered IDs. Search, category, visibility, stock, sort, and pagination remain active. UI exposes selected count, select page, select all filtered results, deselect, confirmations, and result messages.

## Migration and rollback

No catalog migration runs automatically. Provide an idempotent development migration preview that records source categories, target taxonomy keys, affected IDs, counts, and an inverse rollback file. The taxonomy leaves database categories unchanged; therefore IDs, rows, URLs, and catalog data remain intact. Validation compares total catalog count, IDs, and protected fields before and after.

## Verification

Run TypeScript/build checks plus targeted storefront and admin tests. Verify four cards, preserved class names/colors, desktop/mobile subcategory access, taxonomy filtering, legacy category filtering, admin permission denial, selections, batch action reporting, and migration-preview integrity.
