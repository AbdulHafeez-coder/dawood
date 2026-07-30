import { expect, test } from "@playwright/test";
import { waitForCatalog } from "./helpers";

test.describe("storefront", () => {
  test("home page loads with catalog and no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });

    await page.goto("/");
    await expect(page).toHaveTitle(/Dawood Mart/i);
    await expect(page.locator("button[aria-label=\"Cart\"]").first().first()).toBeVisible();
    await waitForCatalog(page);

    expect(errors.filter((e) => !/favicon|third-party/i.test(e))).toEqual([]);
  });

  test("search filters the product grid", async ({ page }) => {
    await page.goto("/");
    await waitForCatalog(page);

    const before = await page.locator('a[href^="/product/"]').count();
    await page
      .getByPlaceholder("Search towels, wallpaper, cloths, sponges…")
      .fill("zzzznomatch");
    await expect
      .poll(() => page.locator('a[href^="/product/"]').count(), { timeout: 10_000 })
      .toBeLessThan(before);
  });
});
