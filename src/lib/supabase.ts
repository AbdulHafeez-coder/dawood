import { createClient } from "@supabase/supabase-js";

// BYO Supabase — publishable/anon key is safe to expose in client code.
export const SUPABASE_URL = "https://xvarmbxgspqvasppcijc.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_70ZM2gIc6AAVEoMyx9W20g_DSPDUA6A";

const isNewKey = SUPABASE_PUBLISHABLE_KEY.startsWith("sb_");

// New-format sb_ keys are opaque, not JWTs. PostgREST rejects them when sent
// as an Authorization: Bearer header, so strip that and send only apikey.
const patchedFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);
  if (isNewKey && headers.get("Authorization") === `Bearer ${SUPABASE_PUBLISHABLE_KEY}`) {
    headers.delete("Authorization");
  }
  headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: true,
    storageKey: "maison-terra-supabase-auth",
  },
  global: { fetch: patchedFetch },
});
