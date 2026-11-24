// src/entities/order/model/active-order-types.ts
// Mirrors docs/CAPTAIN_API_CONTRACT.md section 4.
import type {
  OrderPlace,
  ParcelOfferDetails,
  RideOfferDetails,
  StoreDeliveryOfferDetails,
} from '@/entities/offer/model/offer-types';

export type ActiveOrderStatus = 'ACCEPTED' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type CancelReason =
  'CUSTOMER_NOT_RESPONDING' | 'CUSTOMER_REQUESTED' | 'VEHICLE_PROBLEM' | 'OTHER';

export type Contact = { name: string; phone: string };
export type OrderReceipt = { amountPiastres: number; purchasedAt: string };

export type ActiveOrderPricing = {
  agreedFarePiastres: number;
  commissionRateBasisPoints: number;
  captainNetPiastres: number;
  /** Cash the captain must collect from the customer. null while unknown (store before receipt). */
  cashToCollectPiastres: number | null;
  /** Where the cash is collected. Backend owns this; the app never computes money. */
  collectAt: 'PICKUP' | 'DELIVERY' | null;
};

type ActiveBase = {
  orderId: string;
  orderNumber: string;
  status: ActiveOrderStatus;
  pickup: OrderPlace;
  destination: OrderPlace;
  pricing: ActiveOrderPricing;
  acceptedAt: string;
  cancelledBy: 'CUSTOMER' | 'CAPTAIN' | 'SYSTEM' | null;
};

export type ActiveRideOrder = ActiveBase & {
  serviceType: 'RIDE';
  details: RideOfferDetails;
  passenger: Contact;
};

export type ActiveParcelOrder = ActiveBase & {
  serviceType: 'PARCEL';
  details: ParcelOfferDetails;
  sender: Contact;
  receiver: Contact;
};

export type ActiveStoreDeliveryOrder = ActiveBase & {
  serviceType: 'STORE_DELIVERY';
  details: StoreDeliveryOfferDetails & { storePhone: string | null };
  customer: Contact;
  receipt: OrderReceipt | null;
};

export type ActiveOrder = ActiveRideOrder | ActiveParcelOrder | ActiveStoreDeliveryOrder;
