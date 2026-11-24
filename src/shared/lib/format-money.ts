// src/shared/lib/format-money.ts  (skip if you already have a formatter)
const integer = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat('ar-EG', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Money is stored in piasters. 5900 -> "٥٩ ج.م" */
export const formatMoney = (piasters: number) =>
  `${integer.format(Math.round(piasters / 100))} ج.م`;

export const formatNumber = (n: number) => integer.format(n);
export const formatRating = (n: number) => oneDecimal.format(n);
