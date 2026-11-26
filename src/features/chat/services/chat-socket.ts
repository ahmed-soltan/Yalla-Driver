// src/features/chat/services/chat-socket.ts
// Order chat over its own SignalR hub (separate from the order hub).
// Protocol: docs/CAPTAIN_API_CONTRACT.md section 5. The rest of the app (hook, screen) only
// sees ChatServerEvent, so the transport can change without touching them.
import * as signalR from '@microsoft/signalr';
import Constants from 'expo-constants';
import type { ChatMessage } from '@/entities/chat/model/chat-types';
import { secureStorage, storageKeys } from '@/shared/lib/storage';

export const USE_MOCK_CHAT = __DEV__;

export type ChatServerEvent =
  | { type: 'message'; message: ChatMessage }
  | { type: 'ack'; clientId: string; id: string; createdAt: string }
  | { type: 'typing' }
  | { type: 'read'; at: string }
  | { type: 'closed' }
  // Raised by this client when the server rejected SendMessage (not a hub event)
  | { type: 'send_failed'; clientId: string };

export type ChatSocket = {
  /** Returns false when the connection is not open (the message was NOT sent). */
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

// Hub -> client payloads (camelCase JSON). Every one carries the orderId.
type HubMessage = { orderId: string; message: ChatMessage };
type HubAck = { orderId: string; clientId: string; id: string; createdAt: string };
type HubRead = { orderId: string; at: string };
type HubOrder = { orderId: string };

const retryDelay = (attempt: number) => Math.min(15000, 1000 * 2 ** attempt);

/**
 * Opens the order chat. Reconnects forever with exponential backoff (max 15 s);
 * close() stops it for good. A SignalR group is lost when the connection drops, so the
 * order is joined again after every reconnect.
 */
export function createChatSocket(opts: Options): ChatSocket {
  if (USE_MOCK_CHAT) return createMockSocket(opts);

  const url = Constants.expoConfig?.extra?.chatHubUrl as string | undefined;
  if (!url) return { send: () => false, typing: () => {}, read: () => {}, close: () => {} };

  let closedByUs = false;
  let everOpened = false;
  let attempt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: async () => (await secureStorage.get(storageKeys.accessToken)) ?? '',
    })
    // Never give up (the default policy stops after four attempts)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (ctx) => retryDelay(ctx.previousRetryCount),
    })
    .build();

  const mine = (payload: HubOrder) => payload.orderId === opts.orderId;

  connection.on(
    'ChatMessage',
    (p: HubMessage) => mine(p) && opts.onEvent({ type: 'message', message: p.message })
  );
  connection.on(
    'ChatMessageAck',
    (p: HubAck) =>
      mine(p) &&
      opts.onEvent({ type: 'ack', clientId: p.clientId, id: p.id, createdAt: p.createdAt })
  );
  connection.on('ChatTyping', (p: HubOrder) => mine(p) && opts.onEvent({ type: 'typing' }));
  connection.on('ChatRead', (p: HubRead) => mine(p) && opts.onEvent({ type: 'read', at: p.at }));
  connection.on('ChatClosed', (p: HubOrder) => mine(p) && opts.onEvent({ type: 'closed' }));

  connection.onreconnecting(() => opts.onClose());
  connection.onreconnected(async () => {
    try {
      await connection.invoke('JoinOrderChat', opts.orderId);
      opts.onOpen(true);
    } catch {
      // Could not rejoin: drop the connection so the retry loop starts over
      connection.stop().catch(() => {});
    }
  });
  connection.onclose(() => {
    opts.onClose();
    if (!closedByUs) timer = setTimeout(start, retryDelay(attempt++));
  });

  async function start() {
    if (closedByUs) return;
    try {
      await connection.start();
      if (closedByUs) {
        await connection.stop();
        return;
      }
      await connection.invoke('JoinOrderChat', opts.orderId);
      attempt = 0;
      opts.onOpen(everOpened);
      everOpened = true;
    } catch {
      if (closedByUs) return;
      // Joining can fail after start(); reset to Disconnected so start() can run again
      await connection.stop().catch(() => {});
      timer = setTimeout(start, retryDelay(attempt++));
    }
  }

  start();

  const isOpen = () => connection.state === signalR.HubConnectionState.Connected;

  return {
    send: (text, clientId) => {
      if (!isOpen()) return false;
      connection
        .invoke('SendMessage', { orderId: opts.orderId, clientId, text })
        .catch(() => opts.onEvent({ type: 'send_failed', clientId }));
      return true;
    },
    typing: () => {
      if (isOpen()) connection.send('Typing', opts.orderId).catch(() => {});
    },
    read: () => {
      if (isOpen()) connection.send('MarkRead', opts.orderId).catch(() => {});
    },
    close: () => {
      closedByUs = true;
      if (timer) clearTimeout(timer);
      connection.stop().catch(() => {});
    },
  };
}
