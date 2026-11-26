// src/entities/captain/api/captain-home-api.ts
// Only what Home adds. Profile and verification calls stay in your captain-api.ts.
import type {
  CaptainLocationPoint,
  CaptainTodaySummary,
} from '@/entities/home/model/home-types';
import { request } from '@/shared/api/client';

// One switch for this feature. Flip to false to hit the real backend.
const USE_MOCK = __DEV__;

let mockOnline = false;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getTodaySummary(): Promise<CaptainTodaySummary> {
  if (USE_MOCK) {
    await wait(400);
    return {
      earningsPiastres: 21500,
      goalPiastres: 50000,
      trips: 4,
      demandHint: 'طلب عالي في حي الأربعين',
    };
  }
  return request<CaptainTodaySummary>({ method: 'GET', url: '/captain/today' });
}

export async function setAvailability(online: boolean): Promise<{ isOnline: boolean }> {
  if (USE_MOCK) {
    await wait(600);
    mockOnline = online;
    return { isOnline: mockOnline };
  }
  return request<{ isOnline: boolean }>({
    method: 'POST',
    url: '/captain/availability',
    data: { online },
  });
}

export async function sendLocation(point: CaptainLocationPoint): Promise<void> {
  // if (USE_MOCK) return;
  await request<void>({ method: 'POST', url: '/captain/location', data: point });
}
