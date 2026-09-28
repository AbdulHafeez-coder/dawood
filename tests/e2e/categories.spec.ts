import { expect, test } from "@playwright/test";
const rows = Array.from({ length: 30 }, (_, i) => ({
  id: `real-${i}`,
  name: i === 0 ? "Wallpaper Sheet" : i === 1 ? "Dining Table Cover" : `Glass Cup ${i}`,
  category: i < 2 ? "Sheets" : "Crockery",
  storefront_category: i < 2 ? "Sheets" : "Crockery",
  subcategory: i === 0 ? "Wallpaper Sheets" : i === 1 ? "Table Sheets" : "",
  status: i === 0 ? "on_demand" : "available",
  availability_rank: i === 0 ? 1 : 0,
  price: 1000 + i,
  slug: null,
  details: [],
  gallery: [],
  img: "/images/products/dining-table-sheet.jpg",
  description: "A real catalog item",
  created_at: "2026-09-28T00:00:00Z",
}));
test("real catalog pagination, search, filters, detail, cart, WhatsApp and responsive layout", async ({
  page,
}) => {
  await page.route("**/rest/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const table = url.pathname.split("/").pop();
    if (table !== "products") {
      await route.fulfill({
        json:
          table === "settings"
            ? { brand_name: "Dawood Mart", whatsapp_number: "03024201342", socials: {} }
            : [],
      });
      return;
    }
    let found = [...rows];
    for (const field of ["id", "slug", "storefront_category", "subcategory", "status"]) {
      const value = url.searchParams.get(field);
      if (value?.startsWith("eq."))
        found = found.filter((r) => String(r[field as keyof typeof r]) === value.slice(3));
    }
    if (url.searchParams.has("or")) found = found.filter((r) => r.name.includes("Cup 29"));
    found.sort((a, b) => a.availability_rank - b.availability_rank || a.id.localeCompare(b.id));
    const count = found.length;
    const offset = Number(url.searchParams.get("offset") || 0),
      limit = Number(url.searchParams.get("limit") || 24);
    const single = route.request().headers()["accept"]?.includes("object");
    await route.fulfill({
      json: single ? found[0] || null : found.slice(offset, offset + limit),
      headers: {
        "access-control-expose-headers": "content-range",
        "content-range": `${offset}-${Math.min(offset + limit, count) - 1}/${count}`,
      },
    });
  });
  await page.goto("/");
  await expect(page.getByTestId("product-card")).toHaveCount(24);
  await expect(page.getByText("30 products", { exact: true })).toBeVisible();
  await expect(page.getByText("20% OFF", { exact: false })).toHaveCount(0);
  await expect(page.getByText("Brand", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByTestId("product-card")).toHaveCount(6);
  await page.getByLabel("Search products", { exact: true }).fill("Cup 29");
  await expect(page.getByTestId("product-card")).toHaveCount(1);
  await page.getByLabel("Search products", { exact: true }).fill("");
  await page.getByRole("button", { name: "Sheets", exact: true }).click();
  await expect(page.getByTestId("product-card")).toHaveCount(2);
  await page.getByLabel("Sheet type", { exact: true }).selectOption("Wallpaper Sheets");
  await expect(page.getByTestId("product-card")).toHaveCount(1);
  const request = page.getByRole("link", { name: "Request this product" });
  await expect(request).toHaveAttribute("href", /wa\.me\/923024201342/);
  const href = await request.getAttribute("href");
  expect(decodeURIComponent(href || "")).toContain("Product ID: real-0");
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
  }
  await page.getByLabel("Sheet type", { exact: true }).selectOption("Table Sheets");
  await page.getByRole("link", { name: "View & order" }).click();
  await expect(page.getByRole("heading", { name: "Dining Table Cover" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
