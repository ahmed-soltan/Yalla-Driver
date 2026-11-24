// src/features/home/model/go-online-blockers.ts
// `canGoOnline` from the backend is the source of truth. This only explains WHY
// in plain Arabic and points to the fix. It never decides permission.
import {
  documentTypeLabels,
  vehiclePhotoLabels,
  type CaptainVerification,
} from '@/entities/captain/model/captain-types';
import { DOCUMENTS_ROUTE, VEHICLE_ROUTE } from '../constants/home-constants';

export type GoOnlineBlocker = {
  key: string;
  message: string;
  fixLabel?: string;
  fixRoute?: string;
};

export function getGoOnlineBlockers(v: CaptainVerification): GoOnlineBlocker[] {
  if (v.canGoOnline) return [];

  if (v.status === 'SUSPENDED') {
    return [
      {
        key: 'SUSPENDED',
        message: `حسابك موقوف حاليًا${v.suspensionReason ? `: ${v.suspensionReason}` : ''}. تواصل مع الدعم عشان نفتحه.`,
      },
    ];
  }

  const list: GoOnlineBlocker[] = [];

  if (v.status === 'REJECTED') {
    list.push({
      key: 'REJECTED',
      message: v.rejectionReason ?? 'بياناتك اترفضت. راجع المستندات وصحّحها.',
      fixLabel: 'راجع المستندات',
      fixRoute: DOCUMENTS_ROUTE,
    });
  }

  for (const doc of v.requiredDocuments) {
    if (!doc.isRequired) continue; // optional documents never block
    const label = documentTypeLabels[doc.type] ?? doc.type;
    const route = `${DOCUMENTS_ROUTE}/${doc.type}`;
    const reviewing =
      doc.replacement != null &&
      (doc.replacement.status === 'PENDING' || doc.replacement.status === 'UNDER_REVIEW');

    if (doc.status === 'MISSING') {
      list.push({
        key: `DOC_${doc.type}`,
        message: `ارفع ${label} عشان نكمّل مراجعة حسابك.`,
        fixLabel: 'ارفع',
        fixRoute: route,
      });
    } else if (doc.status === 'REJECTED') {
      list.push({
        key: `DOC_${doc.type}`,
        message: doc.rejectionReason
          ? `${label} اترفضت: ${doc.rejectionReason}`
          : `${label} اترفضت. ارفعها تاني بصورة واضحة.`,
        fixLabel: 'ارفع تاني',
        fixRoute: route,
      });
    } else if (doc.status === 'EXPIRED') {
      list.push(
        reviewing
          ? { key: `DOC_${doc.type}`, message: `${label} منتهية، وبنراجع النسخة الجديدة.` }
          : {
              key: `DOC_${doc.type}`,
              message: `${label} منتهية. ارفع نسخة جديدة عشان ترجع تشتغل.`,
              fixLabel: 'ارفع الجديدة',
              fixRoute: route,
            }
      );
    }
  }

  if (v.vehicle.status === 'MISSING') {
    list.push({
      key: 'VEHICLE',
      message: 'ضيف بيانات مركبتك عشان تبدأ تشتغل.',
      fixLabel: 'ضيف المركبة',
      fixRoute: VEHICLE_ROUTE,
    });
  } else if (v.vehicle.status === 'REJECTED') {
    list.push({
      key: 'VEHICLE',
      message: v.vehicle.rejectionReason ?? 'بيانات المركبة اترفضت. صحّحها وابعتها تاني.',
      fixLabel: 'صحّح البيانات',
      fixRoute: VEHICLE_ROUTE,
    });
  }

  for (const photo of v.vehicle.photos) {
    if (photo.status === 'MISSING' || photo.status === 'REJECTED') {
      list.push({
        key: `PHOTO_${photo.type}`,
        message:
          photo.status === 'MISSING'
            ? `ارفع صورة المركبة ${vehiclePhotoLabels[photo.type]}.`
            : `صورة المركبة ${vehiclePhotoLabels[photo.type]} اترفضت${photo.rejectionReason ? `: ${photo.rejectionReason}` : '.'}`,
        fixLabel: 'ارفع الصورة',
        fixRoute: VEHICLE_ROUTE,
      });
    }
  }

  // Everything is submitted, nothing to fix: he is just waiting
  if (list.length === 0) {
    list.push({
      key: 'UNDER_REVIEW',
      message: 'بياناتك قيد المراجعة، وعادةً بتخلص في يوم لـ ٣ أيام. هنبلغك أول ما تتفعّل.',
    });
  }

  return list;
}
