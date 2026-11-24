// src/entities/captain/lib/document-alerts.ts
import { formatNumber } from '@/shared/lib/format-money';
import {
  documentTypeLabels,
  type CaptainRequiredDocument,
  type CaptainVerification,
} from '@/entities/captain/model/captain-types';

/** 1 -> "يوم", 2 -> "يومين", 5 -> "٥ أيام", 12 -> "١٢ يوم" */
function daysPhrase(n: number) {
  if (n === 1) return 'يوم';
  if (n === 2) return 'يومين';
  return n <= 10 ? `${formatNumber(n)} أيام` : `${formatNumber(n)} يوم`;
}

/** 0 -> "النهاردة", 1 -> "بكرة", 5 -> "بعد ٥ أيام" */
export function formatDaysLeft(days: number) {
  if (days === 0) return 'النهاردة';
  if (days === 1) return 'بكرة';
  return `بعد ${daysPhrase(days)}`;
}

/** Text for the expiry line of a document card, or null when nothing needs saying. */
export function expiryText(doc: CaptainRequiredDocument): string | null {
  if (doc.daysUntilExpiry == null) return null;
  const days = doc.daysUntilExpiry;
  if (doc.expiryState === 'EXPIRED') {
    const n = Math.abs(days);
    return n === 1 ? 'انتهت إمبارح' : `انتهت من ${daysPhrase(n)}`;
  }
  if (doc.expiryState === 'EXPIRING_SOON') {
    return days === 0
      ? 'بتنتهي النهاردة'
      : days === 1
        ? 'بتنتهي بكرة'
        : `بتنتهي بعد ${daysPhrase(days)}`;
  }
  return null;
}

export type DocumentWarning = {
  key: string;
  documentType: string;
  message: string;
  daysUntilExpiry: number;
};

/**
 * Documents that are still valid but close to expiry, soonest first.
 * Not blockers. Skipped when a replacement is already being reviewed.
 */
export function getDocumentWarnings(v: CaptainVerification): DocumentWarning[] {
  return v.requiredDocuments
    .filter(
      (d) =>
        d.expiryState === 'EXPIRING_SOON' &&
        d.status === 'VERIFIED' &&
        d.daysUntilExpiry != null &&
        !(
          d.replacement &&
          (d.replacement.status === 'PENDING' || d.replacement.status === 'UNDER_REVIEW')
        )
    )
    .map((d) => ({
      key: `EXPIRING_${d.type}`,
      documentType: d.type,
      message: `${documentTypeLabels[d.type] ?? d.type} هتنتهي ${formatDaysLeft(d.daysUntilExpiry as number)}`,
      daysUntilExpiry: d.daysUntilExpiry as number,
    }))
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}
