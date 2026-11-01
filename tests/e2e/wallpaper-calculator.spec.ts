import { expect, test, type Page } from "@playwright/test";

async function openCalculator(page: Page, configured = false) {
  await page.route("**/rest/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const p = {
      id: "wall-test",
      name: "Wallpaper sheet",
      category: "Wall paper sheets",
      price: 1000,
      is_active: true,
      in_stock: true,
      img: "/images/storefront/premium-table-sheet-480.webp",
      gallery: [],
      description: "Wallpaper",
      rating: 0,
      details: configured
        ? ['wallpaper_config:{"priceLengthFt":10,"readyCuts":[10,12,40],"availableRolls":2}']
        : [],
    };
    await route.fulfill({
      json: url.pathname.endsWith("/products") ? (url.searchParams.has("id") ? p : [p]) : [],
      headers: { "content-range": "0-0/1" },
    });
  });
  await page.goto("/?category=Sheets");
  await page.locator(".dm-collection-featured .dm-product-name").first().click();
  await expect(page.getByRole("heading", { name: /Wallpaper calculator/ })).toBeVisible();
}

test("mobile custom and ready cuts, roll feasibility, unknown pricing and inquiry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCalculator(page);
  await page.getByLabel("Wall width (ft)", { exact: false }).fill("14");
  await page.getByLabel("Wallpaper height (ft)", { exact: false }).fill("10");
  await expect(page.locator(".dm-wallpaper-result")).toContainText("30 ft");
  await expect(page.locator(".dm-wallpaper-result")).toContainText("3 strips");
  await expect(page.locator(".dm-wallpaper-result")).toContainText("Confirm rate");
  await page.getByLabel("Wall coverage", { exact: false }).selectOption("full");
  await expect(page.locator(".dm-wallpaper-result")).toContainText("30 ft");
  await page.getByLabel("Cut type", { exact: false }).selectOption("ready");
  await page.getByLabel("Wallpaper height (ft)", { exact: false }).fill("14");
  await expect(page.getByRole("alert")).toContainText("shorter");
  await page.getByLabel("Ready cut length", { exact: false }).selectOption("40");
  await expect(page.locator(".dm-wallpaper-result")).toContainText("3 × 60 ft");
  await page.getByLabel("Cut type", { exact: false }).selectOption("custom");
  await page.getByLabel("Wallpaper height (ft)", { exact: false }).fill("61");
  await expect(page.getByRole("alert")).toContainText("cannot exceed 60");
  await expect(page.getByRole("button", { name: /WhatsApp inquiry/ })).toBeDisabled();
  await page.getByLabel("Wallpaper height (ft)", { exact: false }).fill("12");
  await page.evaluate(() => {
    window.open = ((url: string) => {
      (window as unknown as { inquiry: string }).inquiry = url;
      return null;
    }) as typeof window.open;
  });
  await page.getByRole("button", { name: /WhatsApp inquiry/ }).click();
  const inquiry = await page.evaluate(() => (window as unknown as { inquiry: string }).inquiry);
  expect(decodeURIComponent(inquiry)).toContain("36 running ft");
  expect(decodeURIComponent(inquiry)).toContain("not a confirmed order");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("configured selling price uses existing storefront discount and stock limit", async ({
  page,
}) => {
  await openCalculator(page, true);
  await page.getByLabel("Wall width (ft)", { exact: false }).fill("15");
  await page.getByLabel("Wallpaper height (ft)", { exact: false }).fill("12");
  await expect(page.locator(".dm-wallpaper-result")).toContainText("PKR 2,880");
  await page.getByLabel("Cut type", { exact: false }).selectOption("ready");
  await page.getByLabel("Ready cut length", { exact: false }).selectOption("40");
  await expect(page.locator(".dm-wallpaper-result")).toContainText("Not enough source rolls");
});
