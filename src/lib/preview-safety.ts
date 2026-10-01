export const PRODUCTION_DATABASE_HOST = "jowinhlsiofthbrtjind.supabase.co";
export const PREVIEW_WRITE_MESSAGE =
  "Preview is connected to the production database in read-only mode. Connect an isolated Preview database to save changes.";
export function previewRequestBlocked(url: string, method: string): boolean {
  const target = new URL(url);
  const mutation = !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
  return (
    mutation &&
    target.hostname === PRODUCTION_DATABASE_HOST &&
    (target.pathname.startsWith("/rest/v1/") || target.pathname.startsWith("/storage/v1/"))
  );
}
