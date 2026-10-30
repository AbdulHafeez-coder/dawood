import { test } from "node:test";
import assert from "node:assert/strict";
import { previewRequestAllowed, previewBlockedResponse } from "../src/lib/preview-readonly.ts";

test("preview permits public catalog reads only", () => {
  const url = "https://example.supabase.co/rest/v1/products?is_active=eq.true";
  assert.equal(previewRequestAllowed(url), true);
  for (const method of ["POST", "PATCH", "PUT", "DELETE"]) {
    assert.equal(previewRequestAllowed(url, { method }), false);
    assert.equal(previewRequestAllowed(new Request(url, { method })), false);
  }
  for (const path of [
    "/rest/v1/orders",
    "/rest/v1/rpc/delete_products",
    "/auth/v1/token",
    "/storage/v1/object/products/test.jpg",
  ]) {
    assert.equal(previewRequestAllowed(`https://example.supabase.co${path}`), false);
  }
  assert.equal(previewBlockedResponse().status, 403);
});
