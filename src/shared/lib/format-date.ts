// src/shared/lib/format-date.ts
const dateTime = new Intl.DateTimeFormat('ar-EG', {
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
});

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/** "٣ مارس، ٦:٤٠ م" */
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

const time = new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit' });

/** "٦:٤٠ م" */
export const formatTime = (iso: string) => time.format(new Date(iso));

const dateOnly = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

/** "yyyy-MM-dd" -> "١٥ مارس ١٩٩٠" (parsed as a local date, so the day never shifts) */
export const formatDateOnly = (yyyyMmDd: string) => dateOnly.format(new Date(`${yyyyMmDd}T00:00:00`));