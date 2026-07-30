import { expect, test } from "@playwright/test";
import { waitForCatalog } from "./helpers";

test("product detail page shows gallery, variants and add to cart", async ({ page }) => {
  await page.goto("/");
  const first = await waitForCatalog(page);
  await first.click();

  await expect(page).toHaveURL(/\/product\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("main img, img").first()).toBeVisible();

  // Add to cart is gated until a size and a colour are picked.
  const addButton = page.getByRole("button", { name: /select size & colour|add to cart/i });
  await expect(addButton).toBeVisible();
  await expect(page.getByRole("button", { name: /select size & colour/i })).toBeDisabled();

  await page.locator('button[aria-pressed]').first().click(); // first size chip
  await page.locator('button[aria-label][aria-pressed]').first().click(); // first colour swatch

  const enabled = page.getByRole("button", { name: /add to cart/i });
  await expect(enabled).toBeEnabled();
  await enabled.click();

  await expect(page.locator("button[aria-label=\"Cart\"]").first()).toBeVisible();
});
