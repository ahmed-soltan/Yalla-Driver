// src/features/chat/model/use-order-chat.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMessages } from '@/entities/chat/api/chat-api';
import type { ChatHistory, ChatMessage } from '@/entities/chat/model/chat-types';
import { createChatSocket, type ChatSocket } from '../services/chat-socket';

const ACK_TIMEOUT_MS = 10000;

export function useOrderChat(orderId: string) {
  const client = useQueryClient();
  const key = useMemo(() => ['orders', 'messages', orderId] as const, [orderId]);
  const history = useQuery({ queryKey: key, queryFn: () => getMessages(orderId) });

  const [socket, setSocket] = useState<ChatSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [lastTypingSent, setLastTypingSent] = useState(0);

  // The query cache is the single store for messages, including pending local ones.
  const update = useCallback(
    (fn: (old: ChatHistory) => ChatHistory) =>
      client.setQueryData<ChatHistory>(key, (old) => (old ? fn(old) : old)),
    [client, key]
  );

  useEffect(() => {
    let typingTimer: ReturnType<typeof setTimeout> | undefined;
    let s: ChatSocket | null = null;

    s = createChatSocket({
      orderId,
      onOpen: (reconnected) => {
        setConnected(true);
        // Fill any gap from the time we were offline
        if (reconnected) client.invalidateQueries({ queryKey: key });
        s?.read();
      },
      onClose: () => setConnected(false),
      onEvent: (e) => {
        switch (e.type) {
          case 'message':
            update((old) =>
              old.items.some((m) => m.id === e.message.id)
                ? old
                : { ...old, items: [...old.items, e.message] }
            );
            setTyping(false);
            s?.read();
            break;
          case 'ack':
            update((old) => ({
              ...old,
              items: old.items.map((m) =>
                m.clientId === e.clientId
                  ? {
                      ...m,
                      id: e.id,
                      createdAt: e.createdAt,
                      pending: false,
                      failed: false,
                      status: 'sent',
                    }
                  : m
              ),
            }));
            break;
          case 'typing':
            setTyping(true);
            if (typingTimer) clearTimeout(typingTimer);
            typingTimer = setTimeout(() => setTyping(false), 3000);
            break;
          case 'read':
            update((old) => ({
              ...old,
              items: old.items.map((m) =>
                m.senderType === 'CAPTAIN' && !m.pending && !m.failed ? { ...m, status: 'read' } : m
              ),
            }));
            break;
          case 'closed':
            update((old) => ({ ...old, chatOpen: false }));
            break;
        }
      },
    });
    // eslint-disable-next-line
    setSocket(s);

    return () => {
      if (typingTimer) clearTimeout(typingTimer);
      s?.close();
      setSocket(null);
      setConnected(false);
    };
  }, [orderId, client, key, update]);

  const send = useCallback(
    (text: string, retryClientId?: string) => {
      const clean = text.trim();
      if (!clean) return;
      const clientId = retryClientId ?? `local-${Date.now()}`;
      const sent = connected && socket ? socket.send(clean, clientId) : false;

      const optimistic: ChatMessage = {
        id: clientId,
        clientId,
        senderType: 'CAPTAIN',
        senderId: 'me',
        text: clean,
        createdAt: new Date().toISOString(),
        status: 'sent',
        pending: sent,
        failed: !sent,
      };
      update((old) => ({
        ...old,
        items: retryClientId
          ? old.items.map((m) =>
              m.clientId === clientId ? { ...m, pending: sent, failed: !sent } : m
            )
          : [...old.items, optimistic],
      }));

      // No ack in time -> let the captain retry
      if (sent) {
        setTimeout(
          () =>
            update((old) => ({
              ...old,
              items: old.items.map((m) =>
                m.clientId === clientId && m.pending ? { ...m, pending: false, failed: true } : m
              ),
            })),
          ACK_TIMEOUT_MS
        );
      }
    },
    [connected, socket, update]
  );

  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (socket && now - lastTypingSent > 2000) {
      socket.typing();
      setLastTypingSent(now);
    }
  }, [socket, lastTypingSent]);

  // Newest first, because the list is inverted
  const messages = useMemo(
    () => [...(history.data?.items ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [history.data]
  );

  return {
    messages,
    chatOpen: history.data?.chatOpen ?? true,
    isLoading: history.isLoading,
    isError: history.isError,
    refetch: history.refetch,
    connected,
    typing,
    send,
    retry: (m: ChatMessage) => send(m.text, m.clientId),
    notifyTyping,
  };
}
