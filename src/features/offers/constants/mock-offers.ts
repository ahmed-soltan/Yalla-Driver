// src/features/offers/services/mock-offers.ts  (dev only)
import type { OrderOffer } from '@/entities/offer/model/offer-types';
import { OFFER_TIMEOUT_MS } from './offer-constants';

export function makeMockOffer(i: number): OrderOffer {
  const orderId = `mock-${Date.now()}-${i}`;
  const base = {
    offerId: `offer-${orderId}`,
    orderId,
    orderNumber: `YL-${20000 + i}`,
    pickupDistanceMeters: 1200,
    pickupEtaSeconds: 240,
    tripDistanceMeters: 7900,
    tripDurationSeconds: 1080,
    expiresAt: new Date(Date.now() + OFFER_TIMEOUT_MS).toISOString(),
  };
  const place = (label: string, lat: number, lng: number) => ({ label, location: { lat, lng } });

  switch (i % 3) {
    case 0:
      return {
        ...base,
        serviceType: 'RIDE',
        pickup: place('شارع سعد زغلول، شبين الكوم', 30.5538, 31.0129),
        destination: place('جامعة المنوفية', 30.5662, 31.0251),
        pricing: {
          currency: 'EGP',
          farePiastres: 10000,
          commissionRateBasisPoints: 1500,
          estimatedCaptainNetPiastres: 8500,
          canCounter: true,
          minCounterFarePiastres: 10000,
          maxCounterFarePiastres: 15000,
        },
        details: { vehicleType: 'CAR', passengerNote: 'واقف قدام البوابة' },
      };
    case 1:
      return {
        ...base,
        serviceType: 'STORE_DELIVERY',
        pickup: place('مطعم الشرقاوي، ميدان الساعة', 30.5632, 31.0087),
        destination: place('حي الأربعين', 30.5587, 31.0142),
        tripDistanceMeters: 2100,
        tripDurationSeconds: 420,
        pricing: {
          currency: 'EGP',
          farePiastres: 1500,
          commissionRateBasisPoints: 0,
          estimatedCaptainNetPiastres: 1500,
          canCounter: false,
          minCounterFarePiastres: null,
          maxCounterFarePiastres: null,
        },
        details: {
          storeName: 'مطعم الشرقاوي',
          items: [
            { name: 'برجر فراخ', quantity: 2, unit: 'قطعة', details: 'من غير بصل' },
            { name: 'بطاطس كبيرة', quantity: 1, unit: 'وجبة', details: null },
            { name: 'بيبسي', quantity: 2, unit: 'علبة', details: null },
            { name: 'صوص ثوم', quantity: 1, unit: 'علبة', details: null },
          ],
          estimatedItemsAmountPiastres: 14000,
          customerInstructions: 'الدور التالت، الجرس مش شغال',
        },
      };
    default:
      return {
        ...base,
        serviceType: 'PARCEL',
        pickup: place('محطة القطار', 30.5538, 31.0129),
        destination: place('شارع جمال عبد الناصر', 30.5587, 31.0142),
        tripDistanceMeters: 6400,
        tripDurationSeconds: 900,
        pricing: {
          currency: 'EGP',
          farePiastres: 4000,
          commissionRateBasisPoints: 0,
          estimatedCaptainNetPiastres: 4000,
          canCounter: false,
          minCounterFarePiastres: null,
          maxCounterFarePiastres: null,
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
      };
  }
}
