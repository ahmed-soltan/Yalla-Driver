// src/entities/chat/api/chat-api.ts
import { request } from '@/shared/api/client';
import type { ChatHistory } from '@/entities/chat/model/chat-types';

const USE_MOCK = __DEV__;

export async function getMessages(orderId: string): Promise<ChatHistory> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      chatOpen: true,
      items: [
        {
          id: 'mock-m-1',
          senderType: 'PASSENGER',
          senderId: 'passenger-1',
          text: 'السلام عليكم، أنا واقف قدام البوابة',
          createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
          status: 'read',
        },
      ],
    };
  }
  const res = await request<ChatHistory>({ method: 'GET', url: `/orders/${orderId}/messages` });
  // The contract example uses lowercase statuses; accept either casing.
  return {
    ...res,
    items: res.items.map((m) => ({
      ...m,
      status: String(m.status).toLowerCase() as ChatHistory['items'][number]['status'],
    })),
  };
}
