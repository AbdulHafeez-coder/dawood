import { expect, type Page, test } from "@playwright/test";

/** Waits until the storefront catalog has rendered at least one product link. */
export async function waitForCatalog(page: Page) {
  const firstProduct = page.locator('a[href^="/product/"]').first();
  await expect(firstProduct).toBeVisible({ timeout: 30_000 });
  return firstProduct;
}

/**
 * Signs into the admin dashboard.
 * Prefers an injected Supabase session (sandbox/CI), falls back to
 * E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD credentials.
 * Skips the test when neither is available.
 */
export async function adminSignIn(page: Page) {
  const storageKey = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
  const sessionJson = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (storageKey && sessionJson) {
    await page.goto("/");
    await page.evaluate(
      ([key, value]) => window.localStorage.setItem(key, value),
      [storageKey, sessionJson] as const,
    );
    await page.goto("/admin");
  } else if (email && password) {
    await page.goto("/admin");
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByPlaceholder("••••••••").fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
  } else {
    test.skip(
      true,
      "No admin session available. Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.",
    );
    return;
  }

  // The dashboard renders tab navigation once the admin role is verified.
  const promotionsTab = page.getByRole("button", { name: /promotions/i }).first();
  await expect(promotionsTab).toBeVisible({ timeout: 30_000 });
}
