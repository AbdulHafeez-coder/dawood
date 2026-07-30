import { expect, test } from "@playwright/test";
import { adminSignIn } from "./helpers";

const stamp = Date.now();
const LABEL = `E2E-${stamp}`;
const HEADLINE = `Smoke test ${stamp}`;
const UPDATED_HEADLINE = `${HEADLINE} updated`;

test("admin can create, update and delete a promotion", async ({ page }) => {
  await adminSignIn(page);

  await page.getByRole("button", { name: /promotions/i }).first().click();

  // --- CREATE ---
  await page.getByRole("button", { name: /new promotion|create your first promotion/i }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("New promotion")).toBeVisible();
  await dialog.getByPlaceholder("e.g. TOWELS").fill(LABEL);
  await dialog.getByPlaceholder("e.g. UP to 40% OFF").fill(HEADLINE);
  await dialog.getByRole("button", { name: "Create" }).click();

  const card = page.locator("li", { hasText: LABEL }).first();
  await expect(card).toBeVisible({ timeout: 20_000 });
  await expect(card).toContainText(HEADLINE);

  // Persists across a reload (i.e. it really hit the database).
  await page.reload();
  await page.getByRole("button", { name: /promotions/i }).first().click();
  const reloaded = page.locator("li", { hasText: LABEL }).first();
  await expect(reloaded).toBeVisible({ timeout: 20_000 });

  // --- UPDATE ---
  await reloaded.getByRole("button", { name: "Edit" }).click();
  const editDialog = page.getByRole("dialog");
  await expect(editDialog.getByText("Edit promotion")).toBeVisible();
  await editDialog.getByPlaceholder("e.g. UP to 40% OFF").fill(UPDATED_HEADLINE);
  await editDialog.getByRole("button", { name: "Save" }).click();

  const updated = page.locator("li", { hasText: LABEL }).first();
  await expect(updated).toContainText(UPDATED_HEADLINE, { timeout: 20_000 });

  // --- DELETE ---
  await updated.getByRole("button", { name: "Delete" }).click();
  const confirm = page.getByRole("alertdialog");
  await expect(confirm).toContainText("Delete promotion?");
  await confirm.getByRole("button", { name: "Delete" }).click();

  await expect(page.locator("li", { hasText: LABEL })).toHaveCount(0, { timeout: 20_000 });

  await page.reload();
  await page.getByRole("button", { name: /promotions/i }).first().click();
  await expect(page.locator("li", { hasText: LABEL })).toHaveCount(0, { timeout: 20_000 });
});
