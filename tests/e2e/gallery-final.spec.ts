import { expect, test } from "@playwright/test";
test("ten images: autoplay, thumbnails, arrows, swipe, video and reduced motion", async ({
  page,
}) => {
  await page.clock.install();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/rest/v1/**", async (route) => {
    const u = new URL(route.request().url()),
      src = "/images/storefront/premium-table-sheet-480.webp";
    const p = {
      id: "p-mvjofm73-rrll",
      name: "Wall paper sheets",
      category: "Wall paper sheets",
      price: 1650,
      is_active: true,
      in_stock: true,
      img: src,
      gallery: [src, ...Array.from({ length: 9 }, (_, i) => `${src}?image=${i + 2}`)],
      video: "/test-video.mp4",
      description: "Fabric wallpaper",
      details: [],
      rating: 0,
    };
    await route.fulfill({
      json: u.pathname.endsWith("/products")
        ? u.searchParams.get("id")?.startsWith("eq.")
          ? p
          : [p]
        : [],
      headers: { "content-range": "0-0/1" },
    });
  });
  await page.goto("/?category=Sheets");
  await page.locator(".dm-collection-featured .dm-product-name").first().click();
  const gallery = page.getByRole("region", { name: "Product gallery" });
  await expect(gallery.locator(".dm-thumbnails button")).toHaveCount(11);
  await expect(page.locator(".dm-ats-quality")).toBeVisible();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(3500);
  await expect(gallery.getByRole("button", { name: "View image 2", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await gallery.getByRole("button", { name: "Next image or video" }).click();
  await page.clock.fastForward(7000);
  await expect(gallery.getByRole("button", { name: "View image 3", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await gallery.getByRole("button", { name: "View image 10", exact: true }).click();
  await gallery.getByRole("button", { name: "Next image or video" }).click();
  await expect(gallery.locator("video[controls]")).toBeVisible();
  await gallery.getByRole("button", { name: "Previous image or video" }).click();
  const stage = gallery.locator(".dm-gallery-stage");
  await stage.dispatchEvent("pointerdown", { pointerType: "touch", clientX: 300, clientY: 150 });
  await stage.dispatchEvent("pointerup", { pointerType: "touch", clientX: 100, clientY: 155 });
  await expect(gallery.locator("video")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gallery.getByRole("button", { name: "View image 1", exact: true }).click();
  await page.getByRole("heading", { name: /Wall size calculator/ }).click();
  await page.clock.fastForward(7000);
  await expect(gallery.getByRole("button", { name: "View image 1", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
