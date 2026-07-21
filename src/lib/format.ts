const pkrFormatter = new Intl.NumberFormat("en-PK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number as a PKR price with thousands separators and 2 decimals.
 * Example: 12345.6 -> "PKR 12,345.60"
 */
export function formatPKR(value: number | null | undefined): string {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return `PKR ${pkrFormatter.format(n)}`;
}
