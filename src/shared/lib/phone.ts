export function normalizeEgyptianPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (/^01\d{9}$/.test(digits)) return `+20${digits.slice(1)}`;
  if (/^20?1\d{9}$/.test(digits)) return `+${digits.startsWith('20') ? digits : `20${digits}`}`;
  return null;
}

export function formatPhoneForDisplay(value: string) {
  const digits = value.replace(/\D/g, '').replace(/^20/, '').replace(/^0/, '');
  return digits ? `01${digits.slice(-10)}` : value;
}
