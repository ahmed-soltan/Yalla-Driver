// src/entities/order/api/order-api.ts
import { request } from '@/shared/api/client';
import type {
  OrderHistoryFilter,
  OrderHistoryItem,
  OrderHistoryPage,
} from '@/entities/order/model/order-types';

// One switch for this feature. Flip to false to hit the real backend.
const USE_MOCK = __DEV__;
const PAGE_SIZE = 15;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const PLACES = [
  'شارع سعد زغلول، شبين الكوم',
  'ميدان الساعة، شبين الكوم',
  'جامعة المنوفية',
  'كورنيش النيل، شبين الكوم',
  'مستشفى شبين الكوم التعليمي',
  'شارع جمال عبد الناصر',
  'محطة القطار',
  'حي الأربعين',
];
const STORES = ['مطعم الشرقاوي', 'صيدلية العزبي', 'سوبر ماركت الأمل', 'مخبز السلام'];
const SERVICE_ORDER = ['RIDE', 'STORE_DELIVERY', 'PARCEL', 'RIDE'] as const;

function makeItem(i: number): OrderHistoryItem {
  const cancelled = i % 7 === 3;
  const serviceType = SERVICE_ORDER[i % SERVICE_ORDER.length];
  const gross = 3000 + ((i * 1700) % 10000);
  // Commission (15%) is only specified for rides in the ERD (RIDE_FINANCIAL).
  const net = serviceType === 'RIDE' ? gross - Math.round(gross * 0.15) : gross;
  const when = new Date(Date.now() - i * 3.5 * 3600 * 1000).toISOString();

  const base = {
    id: `order-${i + 1}`,
    orderNumber: `YL-${10482 + i}`,
    status: cancelled ? ('CANCELLED' as const) : ('COMPLETED' as const),
    createdAt: when,
    completedAt: cancelled ? null : when,
    pickup: { label: PLACES[i % PLACES.length] },
    destination: { label: PLACES[(i + 3) % PLACES.length] },
    grossPiastres: cancelled ? 0 : gross,
    captainNetPiastres: cancelled ? 0 : net,
    ratingStars: cancelled || i % 5 === 0 ? null : 4 + (i % 3 === 0 ? 1 : 0),
  };

  if (serviceType === 'RIDE') {
    return { ...base, serviceType, vehicleType: 'CAR' };
  }
  if (serviceType === 'STORE_DELIVERY') {
    return { ...base, serviceType, storeName: STORES[i % STORES.length], itemsCount: 1 + (i % 4) };
  }
  return {
    ...base,
    serviceType,
    packageType: 'DOCUMENTS',
    packageSize: 'SMALL',
    isFragile: i % 6 === 0,
  };
}

const MOCK: OrderHistoryItem[] = Array.from({ length: 42 }, (_, i) => makeItem(i));

// ASSUMPTION: the contract only covers the passenger app. This captain endpoint is not in it.
export async function getOrderHistory(params: {
  filter: OrderHistoryFilter;
  cursor: string | null;
}): Promise<OrderHistoryPage> {
  if (USE_MOCK) {
    await wait(500);
    const all = MOCK.filter((o) => params.filter === 'ALL' || o.status === params.filter);
    const start = params.cursor ? Number(params.cursor) : 0;
    const next = start + PAGE_SIZE;
    return { items: all.slice(start, next), nextCursor: next < all.length ? String(next) : null };
  }
  return request<OrderHistoryPage>({
    method: 'GET',
    url: '/captain/orders',
    params: {
      scope: 'past',
      status: params.filter === 'ALL' ? undefined : params.filter,
      cursor: params.cursor ?? undefined,
      limit: PAGE_SIZE,
    },
  });
}
