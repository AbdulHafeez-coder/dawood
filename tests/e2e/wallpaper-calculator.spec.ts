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
  await expect(page.getByRole("heading", { name: /Wallpaper sheets & calculator/ })).toBeVisible();
}

test("mobile room rounds every wall; standard price, no roll cart and unknown cuts hidden", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCalculator(page);
  await expect(page.locator(".dm-wallpaper-calculator .dm-price")).toContainText("PKR 1,500");
  await expect(page.getByLabel("Sheet length").locator("option")).toHaveCount(1);
  await page.getByLabel("Wall coverage").selectOption("room");
  await page.getByLabel("Room length (ft)").fill("11");
  await page.getByLabel("Room width (ft)").fill("9");
  await page.getByLabel("Wallpaper height (ft)").fill("10");
  await expect(page.getByLabel("Quantity / شیٹس کی تعداد", { exact: true })).toHaveValue("10");
  await expect(page.locator(".dm-wallpaper-calculator")).toContainText("PKR 15,000");
  await expect(page.locator(".dm-wallpaper-calculator")).toContainText("3 + 2 + 3 + 2");
  await page.getByLabel("Wallpaper height (ft)").fill("12");
  await expect(page.getByRole("alert")).toContainText("shorter");
  await expect(page.getByRole("button", { name: /Add sheets to cart/ })).toBeDisabled();
  await page.evaluate(() => {
    window.open = ((url: string) => {
      (window as unknown as { draft: string }).draft = url;
      return null;
    }) as typeof window.open;
  });
  await page.getByRole("button", { name: /Ask About Full Roll/ }).click();
  expect(
    decodeURIComponent(await page.evaluate(() => (window as unknown as { draft: string }).draft)),
  ).toContain("manually quote the full roll price and shipping");
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
  await expect(page.locator(".dm-wallpaper-calculator")).toContainText("PKR 4,080");
  await page.getByRole("button", { name: /Add sheets to cart/ }).click();
  const cart = page.getByRole("dialog");
  await expect(cart).toContainText("PKR 4,080");
  // Persisted snapshots retain sheet length and quantity pricing on a new page load.
  await page.goto("/?category=Sheets");
  await expect(page.locator(".dm-collection-caption")).toBeVisible();
  await page.getByRole("button", { name: /Open cart,/ }).first().click();
  await expect(cart).toContainText("5 × 10 ft sheet");
  await expect(cart).toContainText("PKR 4,080");
  await cart.getByRole("button", { name: "Decrease", exact: true }).click();
  await expect(cart).toContainText("PKR 3,400");
  await cart.getByRole("button", { name: "Increase", exact: true }).click();
  await expect(cart).toContainText("PKR 4,080");
  await page.getByRole("button", { name: /Proceed to Checkout/ }).click();
  await expect(page).toHaveURL(/checkout/);
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
  expect(writes).toEqual([]);
});
