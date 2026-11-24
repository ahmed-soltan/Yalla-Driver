// src/shared/lib/format-trip.ts
const oneDecimal = new Intl.NumberFormat('ar-EG', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 });

/** 800 -> "٨٠٠ م", 7900 -> "٧٫٩ كم" */
export const formatDistance = (meters: number) =>
  meters < 1000
    ? `${integer.format(Math.round(meters / 10) * 10)} م`
    : `${oneDecimal.format(meters / 1000)} كم`;

/** 240 -> "٤ د" */
export const formatMinutes = (seconds: number) =>
  `${integer.format(Math.max(1, Math.round(seconds / 60)))} د`;

/** 95000 -> "١:٣٥" */
export const formatClock = (ms: number) => {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${integer.format(m)}:${integer.format(s).padStart(2, '٠')}`;
};
