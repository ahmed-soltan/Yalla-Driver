// src/features/chat/ui/message-bubble.tsx
import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import type { ChatMessage } from '@/entities/chat/model/chat-types';
import { formatTime } from '@/shared/lib/format-date';

function statusText(m: ChatMessage): string {
  if (m.failed) return 'ما اتبعتتش · اضغط للإعادة';
  if (m.pending) return 'جاري الإرسال';
  return m.status === 'read' ? 'اتقرت' : 'اتبعتت';
}

export function MessageBubble({
  message,
  onRetry,
}: {
  message: ChatMessage;
  onRetry: (m: ChatMessage) => void;
}) {
  const mine = message.senderType === 'CAPTAIN';

  const bubble = (
    <View
      style={{
        maxWidth: '82%',
        alignSelf: mine ? 'flex-end' : 'flex-start',
        backgroundColor: mine ? BRAND.dark : BRAND.surface,
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 4,
        opacity: message.pending ? 0.7 : 1,
      }}>
      <Text style={{ color: mine ? BRAND.onPrimary : BRAND.text, fontSize: 16 }}>
        {message.text}
      </Text>
      <Text
        style={{
          color: message.failed ? BRAND.danger : mine ? 'rgba(255,255,255,0.7)' : BRAND.muted,
          fontSize: 11,
        }}>
        {formatTime(message.createdAt)}
        {mine ? ` · ${statusText(message)}` : ''}
      </Text>
    </View>
  );

  return message.failed ? (
    <Pressable
      onPress={() => onRetry(message)}
      accessibilityRole="button"
      accessibilityLabel="الرسالة ما اتبعتتش. اضغط لإعادة الإرسال"
      style={{ alignSelf: 'stretch' }}>
      {bubble}
    </Pressable>
  ) : (
    bubble
  );
}
