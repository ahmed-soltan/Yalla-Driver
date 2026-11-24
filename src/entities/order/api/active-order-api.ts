// src/entities/order/api/active-order-api.ts
import { request } from '@/shared/api/client';
import type { ActiveOrder, CancelReason } from '@/entities/order/model/active-order-types';

// One switch for this feature. Flip to false to hit the real backend.
const USE_MOCK = __DEV__;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- Mock state machine (dev only) ----------
const mockOrders = new Map<string, ActiveOrder>();

function seedMock(orderId: string): ActiveOrder {
  const i = Number(orderId.split('-')[2]) || 0;
  const place = (label: string, lat: number, lng: number) => ({ label, location: { lat, lng } });
  const base = {
    orderId,
    orderNumber: `YL-${20000 + i}`,
    status: 'ACCEPTED' as const,
    acceptedAt: new Date().toISOString(),
    cancelledBy: null,
  };
  switch (i % 3) {
    case 0:
      return {
        ...base,
        serviceType: 'RIDE',
        pickup: place('شارع سعد زغلول، شبين الكوم', 30.5538, 31.0129),
        destination: place('جامعة المنوفية', 30.5662, 31.0251),
        pricing: {
          agreedFarePiastres: 10000,
          commissionRateBasisPoints: 1500,
          captainNetPiastres: 8500,
          cashToCollectPiastres: 10000,
          collectAt: 'DELIVERY',
        },
        details: { vehicleType: 'CAR', passengerNote: 'واقف قدام البوابة' },
        passenger: { name: 'أحمد محمود', phone: '01000000001' },
      };
    case 1:
      return {
        ...base,
        serviceType: 'STORE_DELIVERY',
        pickup: place('مطعم الشرقاوي، ميدان الساعة', 30.5632, 31.0087),
        destination: place('حي الأربعين', 30.5587, 31.0142),
        pricing: {
          agreedFarePiastres: 1500,
          commissionRateBasisPoints: 0,
          captainNetPiastres: 1500,
          cashToCollectPiastres: null,
          collectAt: 'DELIVERY',
        },
        details: {
          storeName: 'مطعم الشرقاوي',
          storePhone: '01000000003',
          items: [
            { name: 'برجر فراخ', quantity: 2, unit: 'قطعة', details: 'من غير بصل' },
            { name: 'بطاطس كبيرة', quantity: 1, unit: 'وجبة', details: null },
            { name: 'بيبسي', quantity: 2, unit: 'علبة', details: null },
          ],
          estimatedItemsAmountPiastres: 14000,
          customerInstructions: 'الدور التالت، الجرس مش شغال',
        },
        customer: { name: 'منى السيد', phone: '01000000002' },
        receipt: null,
      };
    default:
      return {
        ...base,
        serviceType: 'PARCEL',
        pickup: place('محطة القطار', 30.5538, 31.0129),
        destination: place('شارع جمال عبد الناصر', 30.5587, 31.0142),
        pricing: {
          agreedFarePiastres: 4000,
          commissionRateBasisPoints: 0,
          captainNetPiastres: 4000,
          cashToCollectPiastres: 4000,
          collectAt: 'PICKUP',
        },
        details: {
          packageType: 'DOCUMENTS',
          packageSize: 'SMALL',
          description: 'ملفات مهمة',
          quantity: 1,
          isFragile: false,
          declaredValuePiastres: 0,
          paidBy: 'SENDER',
          deliveryNotes: 'كلّم المستلم لما توصل',
        },
        sender: { name: 'خالد إبراهيم', phone: '01000000004' },
        receiver: { name: 'سارة علي', phone: '01000000005' },
      };
  }
}

function mockGet(orderId: string): ActiveOrder {
  const existing = mockOrders.get(orderId);
  if (existing) return existing;
  const fresh = seedMock(orderId);
  mockOrders.set(orderId, fresh);
  return fresh;
}

function mockPatch(orderId: string, patch: Partial<ActiveOrder>): ActiveOrder {
  const next = { ...mockGet(orderId), ...patch } as ActiveOrder;
  mockOrders.set(orderId, next);
  return next;
}

// ---------- API ----------
export async function getActiveOrder(orderId: string): Promise<ActiveOrder> {
  if (USE_MOCK) {
    await wait(300);
    return mockGet(orderId);
  }
  return request<ActiveOrder>({ method: 'GET', url: `/captain/orders/${orderId}` });
}

/** The order the captain is currently working on, or null. */
export async function getCurrentActiveOrder(): Promise<ActiveOrder | null> {
  if (USE_MOCK) {
    await wait(200);
    return (
      [...mockOrders.values()].find((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED') ??
      null
    );
  }
  const res = await request<ActiveOrder | undefined>({
    method: 'GET',
    url: '/captain/orders/active',
  });
  return res ?? null;
}

export async function markArrived(orderId: string): Promise<ActiveOrder> {
  if (USE_MOCK) {
    await wait(500);
    return mockPatch(orderId, { status: 'ARRIVED' });
  }
  return request<ActiveOrder>({ method: 'POST', url: `/orders/${orderId}/arrived`, data: {} });
}

export async function startOrder(
  orderId: string,
  collectedPiastres?: number
): Promise<ActiveOrder> {
  if (USE_MOCK) {
    await wait(500);
    return mockPatch(orderId, { status: 'IN_PROGRESS' });
  }
  return request<ActiveOrder>({
    method: 'POST',
    url: `/orders/${orderId}/start`,
    data: collectedPiastres == null ? {} : { collectedPiastres },
  });
}

export async function completeOrder(
  orderId: string,
  collectedPiastres?: number
): Promise<ActiveOrder> {
  if (USE_MOCK) {
    await wait(600);
    return mockPatch(orderId, { status: 'COMPLETED' });
  }
  return request<ActiveOrder>({
    method: 'POST',
    url: `/orders/${orderId}/complete`,
    data: collectedPiastres == null ? {} : { collectedPiastres },
  });
}

export async function cancelOrder(orderId: string, reason: CancelReason): Promise<ActiveOrder> {
  if (USE_MOCK) {
    await wait(500);
    return mockPatch(orderId, { status: 'CANCELLED', cancelledBy: 'CAPTAIN' });
  }
  return request<ActiveOrder>({
    method: 'POST',
    url: `/orders/${orderId}/cancel`,
    data: { reason },
  });
}

/** STORE_DELIVERY only. */
export async function submitReceipt(
  orderId: string,
  input: { fileId: string; amountPiastres: number; purchasedAt: string }
): Promise<ActiveOrder> {
  if (USE_MOCK) {
    await wait(500);
    const current = mockGet(orderId);
    if (current.serviceType !== 'STORE_DELIVERY') return current;
    return mockPatch(orderId, {
      receipt: { amountPiastres: input.amountPiastres, purchasedAt: input.purchasedAt },
      pricing: {
        ...current.pricing,
        cashToCollectPiastres: input.amountPiastres + current.pricing.agreedFarePiastres,
      },
    } as Partial<ActiveOrder>);
  }
  return request<ActiveOrder>({ method: 'POST', url: `/orders/${orderId}/receipt`, data: input });
}
