// Versioned metadata in the existing text[] column keeps the deployed schema compatible.
// All other details, including historical brand/source records, remain untouched.
export const CATALOG_METADATA_PREFIX = "dawood_catalog_v1:";
export type CatalogMetadata = {
  status?: string;
  category?: string;
  subcategory?: string;
  visible?: boolean;
};
export function readCatalogMetadata(details: readonly string[]): CatalogMetadata {
  const entry = [...details].reverse().find((value) => value.startsWith(CATALOG_METADATA_PREFIX));
  if (!entry) return {};
  try {
    const value = JSON.parse(entry.slice(CATALOG_METADATA_PREFIX.length));
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
export function writeCatalogMetadata(
  details: readonly string[],
  metadata: CatalogMetadata,
): string[] {
  return [
    ...details.filter((value) => !value.startsWith(CATALOG_METADATA_PREFIX)),
    CATALOG_METADATA_PREFIX + JSON.stringify(metadata),
  ];
}
export function isApolloProduct(product: {
  id: string;
  brand?: string;
  details?: string[];
}): boolean {
  return (
    /^app?ollo[-_]/i.test(product.id) ||
    /^app?ollo$/i.test(product.brand || "") ||
    (product.details || []).some((value) => /^(?:brand|source):\s*app?ollo(?:\s|$)/i.test(value))
  );
}
