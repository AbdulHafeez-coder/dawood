const pkrFormatter = new Intl.NumberFormat("en-PK", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format a number as a PKR price with thousands separators.
 * Example: 12345.6 -> "PKR 12,346"
 */
export function formatPKR(value: number | null | undefined): string {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return `PKR ${pkrFormatter.format(n)}`;
}
