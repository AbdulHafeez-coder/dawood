import assert from "node:assert/strict";
import test from "node:test";
import { cleanBusinessSettings, VERIFIED_DAWOOD_CONTACT } from "../../src/lib/business-settings.ts";
test("known demo singleton never routes customers to Maison Terra", () => {
  const result = cleanBusinessSettings({
    ...VERIFIED_DAWOOD_CONTACT,
    brandName: "Maison Terra",
    whatsappNumber: "03011234567",
    contactEmail: "hello@maisonterra.co",
    address: "12 Linden Row, Copenhagen",
  });
  assert.equal(result.brandName, "Dawood Mart");
  assert.equal(result.whatsappNumber, "03024201342");
  assert.equal(result.contactEmail, "abdulhafeez828@gmail.com");
  assert.match(result.address, /Walton Road/);
});
test("legitimate saved business edits remain authoritative", () => {
  const saved = {
    ...VERIFIED_DAWOOD_CONTACT,
    tagline: "New collection",
    whatsappNumber: "03029876543",
  };
  assert.deepEqual(cleanBusinessSettings(saved), saved);
});
