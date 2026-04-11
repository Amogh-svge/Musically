/**
 * Build a query string from plain object params (skips empty / null / undefined).
 * @param {Record<string, string | number | boolean | undefined | null>} params
 */
export function buildQuery(params) {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== "",
  );
  if (entries.length === 0) {
    return "";
  }
  return new URLSearchParams(
    Object.fromEntries(entries.map(([k, v]) => [k, String(v)])),
  ).toString();
}
