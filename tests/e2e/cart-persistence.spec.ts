import { expect, test } from "@playwright/test";
import { waitForCatalog } from "./helpers";

test("cart contents survive a page refresh", async ({ page }) => {
  await page.goto("/");
  const first = await waitForCatalog(page);
  await first.click();
  await expect(page).toHaveURL(/\/product\//);
  const productUrl = page.url();

  await page.locator('button[aria-pressed]').first().click();
  await page.locator('button[aria-label][aria-pressed]').first().click();
  await page.getByRole("button", { name: /add to cart/i }).click();

  // Cart badge reflects the added line immediately.
  const cartButton = page.getByRole("button", { name: "Cart" });
  await expect(cartButton).toContainText(/[1-9]/);

  await page.reload();
  await expect(page).toHaveURL(productUrl);
  await expect(cartButton).toContainText(/[1-9]/, { timeout: 20_000 });

  await cartButton.click();
  const drawer = page.getByRole("dialog", { name: "Shopping cart" });
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('button[aria-label^="Remove"]')).toHaveCount(1);

  // Remove clears the persisted line too.
  await drawer.locator('button[aria-label^="Remove"]').first().click();
  await expect(drawer.locator('button[aria-label^="Remove"]')).toHaveCount(0);
});
