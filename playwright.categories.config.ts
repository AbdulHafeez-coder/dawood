import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "categories.spec.ts",
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://localhost:5186",
    viewport: { width: 1280, height: 900 },
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run build && node scripts/preview-vercel.mjs",
    url: "http://localhost:5186",
    reuseExistingServer: false,
    timeout: 180000,
    env: {
      VITE_SUPABASE_URL: "https://jowinhlsiofthbrtjind.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_category_test_only",
    },
  },
});
