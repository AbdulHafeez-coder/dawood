// This branch is a disposable read-only preview, never a production release.
export const PREVIEW_MESSAGE =
  "Read-only design preview — orders, sign-in and admin changes are disabled.";

export function previewRequestAllowed(input: RequestInfo | URL, init?: RequestInit) {
  const request = typeof Request !== "undefined" && input instanceof Request ? input : undefined;
  const method = (init?.method || request?.method || "GET").toUpperCase();
  const url = new URL(request?.url || String(input));
  return (
    ["GET", "HEAD"].includes(method) &&
    /^\/rest\/v1\/(products|categories|brands|settings|store_settings|promotions|coupons)$/.test(
      url.pathname,
    )
  );
}

export function previewBlockedResponse() {
  return new Response(JSON.stringify({ message: PREVIEW_MESSAGE, code: "PREVIEW_READ_ONLY" }), {
    status: 403,
    headers: { "content-type": "application/json" },
  });
}
