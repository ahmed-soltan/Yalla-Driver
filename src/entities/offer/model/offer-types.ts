// src/entities/offer/model/offer-types.ts
// Mirrors docs/CAPTAIN_API_CONTRACT.md section 2.
import type { ServiceType } from '@/entities/order/model/order-types';

export type OrderPlace = { label: string; location: { lat: number; lng: number } };

export type OfferPricing = {
  currency: 'EGP';
  /** RIDE: passenger's offered fare. PARCEL / STORE_DELIVERY: the service fee. */
  farePiastres: number;
  commissionRateBasisPoints: number;
  estimatedCaptainNetPiastres: number;
  canCounter: boolean;
  minCounterFarePiastres: number | null;
  maxCounterFarePiastres: number | null;
};

type OfferBase = {
  offerId: string;
  orderId: string;
  orderNumber: string;
  pickup: OrderPlace;
  destination: OrderPlace;
  pickupDistanceMeters: number;
  pickupEtaSeconds: number;
  tripDistanceMeters: number;
  tripDurationSeconds: number;
  pricing: OfferPricing;
  expiresAt: string; // ISO, this captain's deadline
};

export type RideOfferDetails = { vehicleType: string; passengerNote: string | null };

export type ParcelOfferDetails = {
  packageType: string;
  packageSize: string;
  description: string | null;
  quantity: number;
  isFragile: boolean;
  declaredValuePiastres: number;
  paidBy: 'SENDER' | 'RECEIVER';
  deliveryNotes: string | null;
};

export type StoreDeliveryOfferDetails = {
  storeName: string;
  items: { name: string; quantity: number; unit: string; details: string | null }[];
  estimatedItemsAmountPiastres: number;
  customerInstructions: string | null;
};

export type RideOffer = OfferBase & { serviceType: 'RIDE'; details: RideOfferDetails };
export type ParcelOffer = OfferBase & { serviceType: 'PARCEL'; details: ParcelOfferDetails };
export type StoreDeliveryOffer = OfferBase & {
  serviceType: 'STORE_DELIVERY';
  details: StoreDeliveryOfferDetails;
};

export type OrderOffer = RideOffer | ParcelOffer | StoreDeliveryOffer;
export type OrderOfferServiceType = OrderOffer['serviceType'] & ServiceType;

/** An offer plus the moment this device received it (for the countdown bar). */
export type QueuedOffer = OrderOffer & { receivedAt: number };

export type RejectReason = 'FARE_TOO_LOW' | 'TOO_FAR' | 'BUSY' | 'OTHER';

export type AcceptResult = { orderId: string; status: 'ACCEPTED'; acceptedAt: string };

export type CounterOffer = {
  id: string;
  orderId: string;
  status: 'PENDING';
  captainCounterFarePiastres: number;
  estimatedCaptainNetPiastres: number;
  expiresAt: string;
};
