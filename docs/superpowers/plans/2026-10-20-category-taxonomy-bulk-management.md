# Category Taxonomy and Bulk Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task.

**Goal:** Add a non-destructive four-group storefront taxonomy and safe admin bulk operations.

**Architecture:** Keep `products.category` intact. A versioned taxonomy module resolves only verified product IDs and source categories into storefront filters. Admin updates remain protected by existing Supabase admin RLS; bulk operations are client orchestrated, bounded, and confirm every result.

**Tech Stack:** React 19, TanStack Start, Supabase, TypeScript, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-20-category-taxonomy-bulk-management-design.md`

## Global Constraints

- Development only; never apply a production migration or deploy without a verified backup/rollback path.
- Preserve category values, product data, URLs, colors, card classes, and unrelated behavior.
- Exclude ambiguous Sheets products and Kitchen Towels.

### Task 1: Taxonomy module and tests

**Files:** Create `src/lib/category-taxonomy.ts`, `tests/category-taxonomy.test.ts`.

- [ ] Test expected group/subcategory resolution and legacy categories.
- [ ] Run test; verify missing-module failure.
- [ ] Implement exact verified mappings and filter helpers.
- [ ] Run test; verify pass.

### Task 2: Storefront taxonomy navigation

**Files:** Modify `src/routes/index.tsx`, `src/lib/shop.ts`, `src/styles.css`; test `tests/e2e/storefront.spec.ts`.

- [ ] Test exactly four cards and a taxonomy route.
- [ ] Run test; verify failure.
- [ ] Render existing-style cards with accessible desktop/mobile subcategory controls; expand product queries using taxonomy filters.
- [ ] Run storefront test and build.

### Task 3: Bulk product actions

**Files:** Modify `src/routes/admin.index.tsx`, `src/lib/shop.ts`, `src/lib/product-queries.ts`; test `tests/e2e/admin-products.spec.ts`.

- [ ] Test page selection, filtered selection, activate/deactivate/out-of-stock, confirmation, and success count.
- [ ] Run test; verify failure.
- [ ] Add bounded validated product updates and selection UI; preserve existing delete dialog safeguards.
- [ ] Run test and build.

### Task 4: Migration preview and verification

**Files:** Create `scripts/verify-category-taxonomy.mjs`, `scripts/category-taxonomy-preview.mjs`.

- [ ] Test preview against fixture snapshot; verify no source mutation and expected counts.
- [ ] Implement snapshot validation and reversible preview JSON output.
- [ ] Run checks, targeted tests, build, and inspect Git/deployment configuration.
