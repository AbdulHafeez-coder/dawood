import { expect, test } from "@playwright/test";

const rows = [
  ["sheet", "Dining table runner", "Wall paper sheets"],
  ["towel", "Bath towel set", "Towels"],
  ["bowl", "Serving bowl", "Serving Bowls"],
  ["gadget", "Electric chopper", "Electronics & Gadgets"],
].map(([id, name, category]) => ({
  id,
  name,
  category,
  price: 1000,
  is_active: true,
  in_stock: true,
  img: "/images/storefront/7-pcs-bowl-set-480.webp",
  gallery: [],
  description: "Catalog description for " + name,
  details: [],
  rating: 0,
}));

test.beforeEach(async ({ page }) => {
  await page.route("**/rest/v1/**", async (route) => {
    const url = new URL(route.request().url());
    let data = url.pathname.endsWith("/products") ? rows : [];
    const category = url.searchParams.get("category");
    if (category?.startsWith("in.")) data = data.filter((p) => category.includes(p.category));
    await route.fulfill({
      json: data,
      headers: { "content-range": `0-${data.length - 1}/${data.length}` },
    });
  });
});

for (const [category, id] of [
  ["Sheets", "sheet"],
  ["Towels", "towel"],
  ["Crockery", "bowl"],
  ["Gadgets", "gadget"],
]) {
  test(`${category} landing keeps discovery and shopping together`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/?category=${category}`);
    await expect(page.locator(".dm-collection-hero h1")).toContainText(category);
    await expect(page.getByRole("link", { name: "Shop Now", exact: true })).toHaveAttribute(
      "href",
      "#shop",
    );
    await expect(page.locator(".dm-collection-subcategories a")).toHaveCount(
      1 + (category === "Towels" ? 1 : 0),
    );
    await expect(page.locator(`#shop a[href='/product/${id}']`).first()).toBeVisible();
    await expect(page.locator("#shop .dm-product")).toHaveCount(1);
    await page.locator(".dm-collection-subcategories a").first().click();
    await expect(page).toHaveURL(/sub=/);
    await expect(page.locator("#shop .dm-product")).toHaveCount(1);
    await page.getByRole("button", { name: /Filters/ }).click();
    await expect(page.getByLabel("Minimum price (PKR)")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test("preview blocks checkout and admin without sending writes", async ({ page }) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("supabase.co") && !["GET", "HEAD"].includes(request.method()))
      writes.push(request.url());
  });
  for (const path of ["/checkout", "/admin", "/admin/login", "/track-request"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Browsing preview only" })).toBeVisible();
  }
  expect(writes).toEqual([]);
});

test("desktop layout, filters and empty state preserve collection", async ({ page }) => {
  await page.goto("/?category=Crockery");
  await expect(page.locator("#shop .dm-product")).toHaveCount(1);
  await page.getByRole("button", { name: /Filters/ }).click();
  await page.getByLabel("Minimum price (PKR)").fill("900");
  await page.getByRole("button", { name: "Show results", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No products found" })).toBeVisible();
  await expect(page.locator(".dm-collection-hero h1")).toContainText("Crockery");
  await page.screenshot({ path: "scratch/category-desktop.png", fullPage: true });
});
