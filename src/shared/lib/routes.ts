// src/shared/lib/routes.ts
import type { Href } from 'expo-router';

export const activeOrderHref = (orderId: string) => `/(app)/orders/${orderId}` as Href;
export const homeHref = '/(app)/home' as Href;

export const chatHref = (orderId: string) => `/(app)/chat/${orderId}` as Href;

// ASSUMPTIONS: replace with your real route paths.
export const authHref = '/(auth)/login' as Href; // where logout sends the captain
export const vehicleFormHref = '/(onboarding)/vehicle' as Href; // your onboarding vehicle form
export const profileHref = {
  documents: '/(app)/profile/documents' as Href,
  document: (type: string) => `/(app)/profile/documents/${type}` as Href,
  vehicle: '/(app)/profile/vehicle' as Href,
  edit: '/(app)/profile/edit' as Href,
};

export const orderDetailsHref = (orderId: string) => `/(app)/order-details/${orderId}` as Href;
