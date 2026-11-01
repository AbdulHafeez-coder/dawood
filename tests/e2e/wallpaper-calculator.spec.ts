import { expect, test, type Page } from "@playwright/test";

async function openCalculator(page: Page) {
  await page.route("**/rest/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const p = {
      id: "wall-test",
      name: "Wallpaper sheet",
      category: "Wall paper sheets",
      price: 1650,
      is_active: true,
      in_stock: true,
      img: "/images/storefront/premium-table-sheet-480.webp",
      gallery: [],
      description: "Wallpaper",
      rating: 0,
      details: [],
    };
    const byId = url.searchParams.get("id")?.startsWith("eq.");
    await route.fulfill({
      json: url.pathname.endsWith("/products") ? (byId ? p : [p]) : [],
      headers: { "content-range": "0-0/1" },
    });
  });
  await page.goto("/?category=Sheets");
  await page.locator(".dm-collection-featured .dm-product-name").first().click();
  await expect(page.getByRole("heading", { name: /Wall size calculator/ })).toBeVisible();
}

test("two calculator modes stay independent of sheet ordering", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCalculator(page);
  const calc = page.locator('[aria-labelledby="wallpaper-calculator-title"]');
  await expect(page.getByLabel("Coverage / کوریج").locator("option")).toHaveCount(2);
  await page.getByLabel("Wall width (ft)").fill("14");
  await page.getByLabel("Wall height (ft)").fill("10");
  await expect(calc).toContainText("PKR 4,500");
  await expect(page.getByLabel("Quantity / شیٹس کی تعداد", { exact: true })).toHaveValue("1");
  await page.getByLabel("Wall height (ft)").fill("11");
  await expect(calc.getByRole("alert")).toContainText("No suitable priced sheet");
  await page.getByLabel("Coverage / کوریج").selectOption("half");
  await page.getByLabel("Wall horizontal length (ft)").fill("10");
  await expect(calc).toContainText("PKR 1,500");
  await expect(page.getByLabel("Wall height (ft)")).toHaveCount(0);
  await page.getByLabel("Wall horizontal length (ft)").fill("14");
  await expect(calc.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("button", { name: /Add sheets to cart/ })).toBeEnabled();
  await expect(page.locator(".dm-ats-quality")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("preview admin settings persist; cart reprices, reloads and checkout drafts without writes", async ({
  page,
}) => {
  const writes: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("supabase.co") && !["GET", "HEAD"].includes(r.method()))
      writes.push(r.url());
  });
  await openCalculator(page);
  await page.getByRole("link", { name: "Preview admin: edit sheet pricing" }).click();
  await page.getByLabel("Normal 5 × 10 ft price (PKR)", { exact: true }).fill("1700");
  await page.getByRole("button", { name: "Add quantity discount", exact: true }).click();
  await page.getByLabel("Minimum sheets", { exact: true }).fill("3");
  await page.getByLabel("Discount percent", { exact: true }).fill("20");
  await page.getByRole("button", { name: "Save preview settings" }).click();
  await expect(page.getByText("Saved in this preview browser only.").first()).toBeVisible();
  await page.getByRole("link", { name: /Back to wallpaper/ }).click();
  await page.getByLabel("Quantity / شیٹس کی تعداد", { exact: true }).fill("3");
  await expect(page.locator('[aria-labelledby="wallpaper-order-title"]')).toContainText(
    "PKR 4,080",
  );
  await page.getByRole("button", { name: /Add sheets to cart/ }).click();
  const cart = page.getByRole("dialog");
  await expect(cart).toContainText("PKR 4,080");
  // Persisted snapshots retain sheet length and quantity pricing on a new page load.
  await page.goto("/?category=Sheets");
  await expect(page.locator(".dm-collection-caption")).toBeVisible();
  await page
    .getByRole("button", { name: /Open cart,/ })
    .first()
    .click();
  await expect(cart).toContainText("5 × 10 ft sheet");
  await expect(cart).toContainText("PKR 4,080");
  await cart.getByRole("button", { name: "Decrease", exact: true }).click();
  await expect(cart).toContainText("PKR 3,400");
  await cart.getByRole("button", { name: "Increase", exact: true }).click();
  await expect(cart).toContainText("PKR 4,080");
  await page.getByRole("button", { name: /Proceed to Checkout/ }).click();
  await expect(page).toHaveURL(/checkout/);
  const eligibility = page.getByRole("region", { name: "Shipping eligibility" });
  await expect(eligibility).toContainText("Standard shipping: PKR 200");
  await page.getByLabel("Payment method").selectOption("advance");
  await expect(eligibility).toContainText("Estimated shipping: Free");
  await page.getByLabel("Payment method").selectOption("cod");
  await expect(eligibility).toContainText("Standard shipping: PKR 200");
  await page.getByLabel("Full Name", { exact: false }).fill("Preview Test");
  await page.getByLabel("WhatsApp Number", { exact: false }).fill("03001234567");
  await page.getByLabel("City", { exact: false }).fill("Lahore");
  await page.getByLabel("Delivery Address", { exact: false }).fill("Preview only");
  await page.getByRole("button", { name: /Continue to Review/ }).click();
  await page.evaluate(() => {
    window.open = ((url: string) => {
      (window as unknown as { draft: string }).draft = url;
      return null;
    }) as typeof window.open;
  });
  await page.getByRole("button", { name: "Open WhatsApp Preview Draft" }).click();
  await expect
    .poll(async () => page.evaluate(() => (window as unknown as { draft: string }).draft || ""))
    .toContain("wa.me");
  const draft = decodeURIComponent(
    await page.evaluate(() => (window as unknown as { draft: string }).draft),
  );
  expect(draft).toContain("PREVIEW inquiry — not an order");
  expect(draft).toContain("5 × 10 ft");
  expect(draft).toContain("4,080");
  expect(draft).toContain("PKR 200");
  expect(draft).toContain("Cash on Delivery");
  expect(writes).toEqual([]);
});
