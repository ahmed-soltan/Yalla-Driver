// src/shared/lib/parse-money.ts
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** "135" / "٢٣٫٥" / "23.50" -> piastres. Returns null if invalid or zero. */
export function parseEgpToPiastres(input: string): number | null {
  const normalized = input
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[٫,،]/g, '.')
    .trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const piastres = Math.round(parseFloat(normalized) * 100);
  return piastres > 0 ? piastres : null;
}
