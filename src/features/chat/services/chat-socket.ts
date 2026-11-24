// src/features/chat/services/chat-socket.ts
import Constants from 'expo-constants';
// ASSUMPTION: same token source as order-hub.ts. Point it at your auth store / secure-store.
import type { ChatMessage } from '@/entities/chat/model/chat-types';
import { secureStorage, storageKeys } from '@/shared/lib/storage';

export const USE_MOCK_CHAT = __DEV__;

// Server events, per BACKEND_API_CONTRACT section 9.
export type ChatServerEvent =
  | { type: 'message'; message: ChatMessage }
  | { type: 'ack'; clientId: string; id: string; createdAt: string }
  | { type: 'typing' }
  | { type: 'read'; at: string }
  | { type: 'closed' };

export type ChatSocket = {
  /** Returns false when the socket is not open (the message was NOT sent). */
  send: (text: string, clientId: string) => boolean;
  typing: () => void;
  read: () => void;
  close: () => void;
};

type Options = {
  orderId: string;
  onEvent: (event: ChatServerEvent) => void;
  /** `reconnected` is true for every open after the first one. */
  onOpen: (reconnected: boolean) => void;
  onClose: () => void;
};

function createMockSocket(opts: Options): ChatSocket {
  let closed = false;
  const timers: ReturnType<typeof setTimeout>[] = [];
  const later = (ms: number, fn: () => void) => {
    timers.push(setTimeout(() => !closed && fn(), ms));
  };
  later(300, () => opts.onOpen(false));

  return {
    send: (_text, clientId) => {
      later(400, () =>
        opts.onEvent({
          type: 'ack',
          clientId,
          id: `mock-${Date.now()}`,
          createdAt: new Date().toISOString(),
        })
      );
      later(1000, () => opts.onEvent({ type: 'read', at: new Date().toISOString() }));
      later(1800, () => opts.onEvent({ type: 'typing' }));
      later(3500, () =>
        opts.onEvent({
          type: 'message',
          message: {
            id: `mock-in-${Date.now()}`,
            senderType: 'PASSENGER',
            senderId: 'passenger-1',
            text: 'تمام، أنا مستنيك',
            createdAt: new Date().toISOString(),
            status: 'sent',
          },
        })
      );
      return true;
    },
    typing: () => {},
    read: () => {},
    close: () => {
      closed = true;
      timers.forEach(clearTimeout);
    },
  };
}

/** Opens the order chat. Reconnects with exponential backoff; close() never reconnects. */
export function createChatSocket(opts: Options): ChatSocket {
  if (USE_MOCK_CHAT) return createMockSocket(opts);

  let ws: WebSocket | null = null;
  let closedByUs = false;
  let attempt = 0;
  let everOpened = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = () => {
    const delay = Math.min(15000, 1000 * 2 ** attempt);
    attempt += 1;
    timer = setTimeout(connect, delay);
  };

  async function connect() {
    const base = Constants.expoConfig?.extra?.chatWsUrl as string | undefined;
    const accessToken = await secureStorage.get(storageKeys.accessToken)
    if (closedByUs || !base) return;
    if (closedByUs) return;
    if (!accessToken) {
      schedule();
      return;
    }
    ws = new WebSocket(
      `${base}/orders/${opts.orderId}/chat?token=${encodeURIComponent(accessToken)}`
    );
    ws.onopen = () => {
      opts.onOpen(everOpened);
      everOpened = true;
      attempt = 0;
    };
    ws.onmessage = (e) => {
      try {
        opts.onEvent(JSON.parse(String(e.data)) as ChatServerEvent);
      } catch {
        // ignore malformed frames
      }
    };
    ws.onclose = () => {
      opts.onClose();
      if (!closedByUs) schedule();
    };
    ws.onerror = () => {};
  }

  const sendRaw = (payload: object) => {
    if (ws?.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(payload));
    return true;
  };

  connect();

  return {
    send: (text, clientId) => sendRaw({ type: 'send', clientId, text }),
    typing: () => void sendRaw({ type: 'typing' }),
    read: () => void sendRaw({ type: 'read' }),
    close: () => {
      closedByUs = true;
      if (timer) clearTimeout(timer);
      ws?.close();
    },
  };
}
