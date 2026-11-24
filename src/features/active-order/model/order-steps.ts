// src/features/active-order/model/order-steps.ts
import type { ActiveOrder, Contact } from '@/entities/order/model/active-order-types';

export type StepAction = 'arrived' | 'start' | 'complete';

export type Step = {
  title: string;
  hint: string;
  target: 'pickup' | 'destination';
  targetLabel: string;
  actionLabel: string;
  action: StepAction;
};

/** What the captain must do now. null once the order is finished. */
export function getStep(order: ActiveOrder): Step | null {
  if (order.status === 'COMPLETED' || order.status === 'CANCELLED') return null;
  const s = order.status;

  switch (order.serviceType) {
    case 'RIDE':
      if (s === 'ACCEPTED')
        return {
          title: 'روح للراكب',
          hint: `${order.passenger.name} مستنيك عند نقطة الالتقاء`,
          target: 'pickup',
          targetLabel: 'نقطة الالتقاء',
          actionLabel: 'وصلت',
          action: 'arrived',
        };
      if (s === 'ARRIVED')
        return {
          title: 'استنى الراكب',
          hint: 'ابدأ المشوار أول ما الراكب يركب',
          target: 'pickup',
          targetLabel: 'نقطة الالتقاء',
          actionLabel: 'ابدأ المشوار',
          action: 'start',
        };
      return {
        title: 'وصّل الراكب',
        hint: 'خد الراكب لوجهته',
        target: 'destination',
        targetLabel: 'الوجهة',
        actionLabel: 'أنهي المشوار',
        action: 'complete',
      };

    case 'PARCEL':
      if (s === 'ACCEPTED')
        return {
          title: 'روح لاستلام الشحنة',
          hint: `المرسل: ${order.sender.name}`,
          target: 'pickup',
          targetLabel: 'نقطة الاستلام',
          actionLabel: 'وصلت للمرسل',
          action: 'arrived',
        };
      if (s === 'ARRIVED')
        return {
          title: 'استلم الشحنة',
          hint: 'اتأكد من الشحنة قبل ما تتحرك',
          target: 'pickup',
          targetLabel: 'نقطة الاستلام',
          actionLabel: 'استلمت الشحنة',
          action: 'start',
        };
      return {
        title: 'سلّم الشحنة',
        hint: `المستلم: ${order.receiver.name}`,
        target: 'destination',
        targetLabel: 'نقطة التسليم',
        actionLabel: 'سلّمت الشحنة',
        action: 'complete',
      };

    case 'STORE_DELIVERY':
      if (s === 'ACCEPTED')
        return {
          title: 'روح المحل',
          hint: order.details.storeName,
          target: 'pickup',
          targetLabel: 'المحل',
          actionLabel: 'وصلت المحل',
          action: 'arrived',
        };
      if (s === 'ARRIVED')
        return {
          title: 'اشتري الطلبات',
          hint: 'ارفع فاتورة المحل بعد ما تدفع',
          target: 'pickup',
          targetLabel: 'المحل',
          actionLabel: 'ابدأ التوصيل',
          action: 'start',
        };
      return {
        title: 'وصّل الطلب للعميل',
        hint: order.customer.name,
        target: 'destination',
        targetLabel: 'عنوان العميل',
        actionLabel: 'سلّمت الطلب',
        action: 'complete',
      };
  }
}

/** Who the captain can call right now. */
export function getContact(order: ActiveOrder): (Contact & { role: string }) | null {
  const atPickup = order.status === 'ACCEPTED' || order.status === 'ARRIVED';
  switch (order.serviceType) {
    case 'RIDE':
      return { ...order.passenger, role: 'الراكب' };
    case 'PARCEL':
      return atPickup
        ? { ...order.sender, role: 'المرسل' }
        : { ...order.receiver, role: 'المستلم' };
    case 'STORE_DELIVERY':
      if (atPickup) {
        return order.details.storePhone
          ? { name: order.details.storeName, phone: order.details.storePhone, role: 'المحل' }
          : null;
      }
      return { ...order.customer, role: 'العميل' };
  }
}
