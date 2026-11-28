// src/features/notifications/lib/notification-routes.ts
import type { Href } from 'expo-router';
import { activeOrderHref, chatHref, homeHref, profileHref } from '@/shared/lib/routes';

/** The `data` object of every push the backend sends (docs/CAPTAIN_API_CONTRACT.md section 7). */
export type PushData = {
  type?: string;
  orderId?: string;
  offerId?: string;
  documentType?: string;
};

const profileTab = '/(app)/(tabs)/profile' as Href;

/** Where tapping the notification should lead. null: just open the app. */
export function routeForNotification(data: PushData): Href | null {
  switch (data.type) {
    case 'NEW_ORDER_REQUEST':
      return homeHref; // the offer card appears there
    case 'ORDER_CANCELLED':
      return data.orderId ? activeOrderHref(data.orderId) : homeHref;
    case 'CHAT_MESSAGE':
      return data.orderId ? chatHref(data.orderId) : null;
    case 'DOCUMENT_EXPIRING':
    case 'DOCUMENT_EXPIRED':
    case 'DOCUMENT_APPROVED':
    case 'DOCUMENT_REJECTED':
      return data.documentType ? profileHref.document(data.documentType) : profileHref.documents;
    case 'VERIFICATION_APPROVED':
    case 'ACCOUNT_SUSPENDED':
    case 'SYSTEM':
      return profileTab;
    default:
      return null;
  }
}

export const isAccountType = (type?: string) =>
  type === 'DOCUMENT_EXPIRING' ||
  type === 'DOCUMENT_EXPIRED' ||
  type === 'DOCUMENT_APPROVED' ||
  type === 'DOCUMENT_REJECTED' ||
  type === 'VERIFICATION_APPROVED' ||
  type === 'ACCOUNT_SUSPENDED';
