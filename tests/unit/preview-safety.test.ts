import test from "node:test";
import assert from "node:assert/strict";
import { previewRequestBlocked } from "../../src/lib/preview-safety.ts";
test("Preview cannot mutate the production database or images", () => {
  for (const method of ["POST", "PATCH", "PUT", "DELETE"]) {
    assert.equal(
      previewRequestBlocked("https://jowinhlsiofthbrtjind.supabase.co/rest/v1/products", method),
      true,
    );
    assert.equal(
      previewRequestBlocked(
        "https://jowinhlsiofthbrtjind.supabase.co/storage/v1/object/product-images/test.jpg",
        method,
      ),
      true,
    );
  }
  assert.equal(
    previewRequestBlocked("https://jowinhlsiofthbrtjind.supabase.co/rest/v1/products", "GET"),
    false,
  );
  assert.equal(
    previewRequestBlocked("https://isolated-preview.supabase.co/rest/v1/products", "PATCH"),
    false,
  );
});
