// Pakistani mobile number helpers.
// Local canonical form: 11 digits starting with "03" (e.g. 03011234567).
// Display form: "0301-1234567" (4 digits, dash, 7 digits).
// International (wa.me) form: "923011234567" (92 + last 10 digits).

export const PK_PHONE_PLACEHOLDER = "0301-1234567";

/** Keep only digits, cap at 11. */
export function normalizePkDigits(input: string): string {
  return (input || "").replace(/\D/g, "").slice(0, 11);
}

/** Format digits progressively as "0301-1234567" while typing. */
export function formatPkPhone(input: string): string {
  const d = normalizePkDigits(input);
  if (d.length <= 4) return d;
  return `${d.slice(0, 4)}-${d.slice(4)}`;
}

/** Valid Pakistani mobile: 11 digits, starts with "03". */
export function isValidPkPhone(input: string): boolean {
  const d = normalizePkDigits(input);
  return d.length === 11 && d.startsWith("03");
}

/** Convert to wa.me international form: 92XXXXXXXXXX. Returns "" if invalid. */
export function toPkInternational(input: string): string {
  const d = normalizePkDigits(input);
  if (!isValidPkPhone(d)) return "";
  return `92${d.slice(1)}`; // drop leading 0, prepend 92
}
