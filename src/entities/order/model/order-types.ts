// src/entities/order/model/order-types.ts
// Per BACKEND_API_CONTRACT: `serviceType` is the ONLY discriminator.
// Never use `type`, `orderType` or lowercase values.
export type ServiceType = 'RIDE' | 'STORE_DELIVERY' | 'PARCEL';

// ORDER.status in the contract: SEARCHING, ACCEPTED, ARRIVED, IN_PROGRESS,
// COMPLETED, CANCELLED, EXPIRED. History only shows the two finished ones.
export type OrderHistoryStatus = 'COMPLETED' | 'CANCELLED';
export type OrderHistoryFilter = 'ALL' | OrderHistoryStatus;

type OrderHistoryBase = {
  id: string;
  orderNumber: string; // "YL-10482"
  status: OrderHistoryStatus;
  createdAt: string; // ISO
  completedAt: string | null; // ISO, null when cancelled
  pickup: { label: string };
  destination: { label: string };
  grossPiastres: number; // what the passenger paid in cash
  captainNetPiastres: number; // what the captain keeps (RIDE: after the 15% commission)
  ratingStars: number | null; // ORDER_RATING.stars
};

// Each service carries different extra fields (RIDE_ORDER / STORE_DELIVERY_ORDER / PARCEL_ORDER).
export type RideHistoryItem = OrderHistoryBase & {
  serviceType: 'RIDE';
  vehicleType: string; // "CAR" | "MOTORCYCLE" | ...
};

export type StoreDeliveryHistoryItem = OrderHistoryBase & {
  serviceType: 'STORE_DELIVERY';
  storeName: string; // storeNameSnapshot
  itemsCount: number; // DELIVERY_ITEM rows
};

export type ParcelHistoryItem = OrderHistoryBase & {
  serviceType: 'PARCEL';
  packageType: string; // "DOCUMENTS" | ...
  packageSize: string; // "SMALL" | "MEDIUM" | "LARGE"
  isFragile: boolean;
};

export type OrderHistoryItem = RideHistoryItem | StoreDeliveryHistoryItem | ParcelHistoryItem;

export type OrderHistoryPage = {
  items: OrderHistoryItem[];
  nextCursor: string | null;
};
