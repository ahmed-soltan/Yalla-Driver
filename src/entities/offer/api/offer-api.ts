// src/entities/offer/api/offer-api.ts
import { request } from '@/shared/api/client';
import type { AcceptResult, CounterOffer, RejectReason } from '@/entities/offer/model/offer-types';

// One switch for this feature. Flip to false to hit the real backend.
const USE_MOCK = __DEV__;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function acceptOffer(orderId: string): Promise<AcceptResult> {
  if (USE_MOCK) {
    await wait(600);
    return { orderId, status: 'ACCEPTED', acceptedAt: new Date().toISOString() };
  }
  return request<AcceptResult>({ method: 'POST', url: `/orders/${orderId}/accept`, data: {} });
}

export async function rejectOffer(orderId: string, reason?: RejectReason): Promise<void> {
  if (USE_MOCK) {
    await wait(300);
    return;
  }
  await request<void>({ method: 'POST', url: `/orders/${orderId}/reject`, data: { reason } });
}

export async function counterOffer(
  orderId: string,
  input: { captainCounterFarePiastres: number; captainMessage?: string | null }
): Promise<CounterOffer> {
  if (USE_MOCK) {
    await wait(600);
    return {
      id: `counter-${orderId}`,
      orderId,
      status: 'PENDING',
      captainCounterFarePiastres: input.captainCounterFarePiastres,
      estimatedCaptainNetPiastres: Math.round(input.captainCounterFarePiastres * 0.85),
      expiresAt: new Date(Date.now() + 120000).toISOString(),
    };
  }
  return request<CounterOffer>({
    method: 'POST',
    url: `/orders/${orderId}/counteroffers`,
    data: input,
  });
}

/** True when the server says the offer is gone (expired, taken, cancelled). */
export function isOfferGone(error: unknown): boolean {
  return (error as { response?: { status?: number } })?.response?.status === 409;
}
