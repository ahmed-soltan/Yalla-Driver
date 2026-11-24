// src/features/chat/lib/chat-partner.ts
import type { ActiveOrder } from '@/entities/order/model/active-order-types';

/**
 * Who the captain chats with: the customer who placed the order.
 * ASSUMPTION for PARCEL: the sender placed the order (the receiver is not an app user).
 */
export function getChatPartner(order: ActiveOrder): { name: string; phone: string; role: string } {
  switch (order.serviceType) {
    case 'RIDE':
      return { ...order.passenger, role: 'الراكب' };
    case 'PARCEL':
      return { ...order.sender, role: 'العميل' };
    case 'STORE_DELIVERY':
      return { ...order.customer, role: 'العميل' };
  }
}
