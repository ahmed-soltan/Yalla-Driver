// src/screens/chat/chat-screen.tsx
import { ActivityIndicator, FlatList, Linking, Pressable, View } from 'react-native';
// Requires <KeyboardProvider> at the app root (you already depend on this package).
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { getActiveOrder } from '@/entities/order/api/active-order-api';
import { useOrderChat } from '@/features/chat/services/use-order-chat';
import { getChatPartner } from '@/features/chat/lib/chat-partner';
import { MessageBubble } from '@/features/chat/ui/message-bubble';
import { Composer } from '@/features/chat/ui/composer';
import { activeOrderKey } from '@/features/active-order/service/use-active-order';

export function ChatScreen({ orderId }: { orderId: string }) {
  const insets = useSafeAreaInsets();
  const chat = useOrderChat(orderId);
  const order = useQuery({
    queryKey: activeOrderKey(orderId),
    queryFn: () => getActiveOrder(orderId),
  }).data;
  const partner = order ? getChatPartner(order) : null;

  return (
    <KeyboardAvoidingView behavior="padding"style={{ flex: 1, backgroundColor: BRAND.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          gap: 8,
          paddingTop: insets.top + 8,
          paddingBottom: 10,
          paddingHorizontal: 8,
          borderBottomWidth: 1,
          borderBottomColor: BRAND.line,
        }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="رجوع"
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={26} color={BRAND.dark} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text
            accessibilityRole="header"
            style={{ color: BRAND.text, fontSize: 17, fontWeight: '700' }}>
            {partner?.name ?? 'المحادثة'}
          </Text>
          <Text style={{ color: BRAND.muted, fontSize: 12 }}>
            {chat.typing ? 'بيكتب...' : (partner?.role ?? '')}
          </Text>
        </View>
        {partner ? (
          <Pressable
            onPress={() => Linking.openURL(`tel:${partner.phone}`).catch(() => {})}
            accessibilityRole="button"
            accessibilityLabel={`اتصل بـ${partner.role}`}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: BRAND.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Phone size={22} color={BRAND.dark} />
          </Pressable>
        ) : null}
      </View>

      {/* Connection state */}
      {!chat.isLoading && !chat.isError && !chat.connected && chat.chatOpen ? (
        <View
          style={{ backgroundColor: BRAND.surface, paddingVertical: 8, alignItems: 'center' }}
          accessibilityLiveRegion="polite">
          <Text style={{ color: BRAND.muted, fontSize: 13 }}>
            بنحاول نوصّل... الرسائل هتتبعت أول ما النت يرجع
          </Text>
        </View>
      ) : null}

      {/* Body */}
      {chat.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={BRAND.primary} />
        </View>
      ) : chat.isError ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
          <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>
            ما قدرناش نحمّل المحادثة
          </Text>
          <Pressable
            onPress={() => chat.refetch()}
            accessibilityRole="button"
            accessibilityLabel="أعد المحاولة"
            style={{
              height: 50,
              paddingHorizontal: 28,
              borderRadius: 12,
              backgroundColor: BRAND.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ color: BRAND.onPrimary, fontSize: 16, fontWeight: '700' }}>
              أعد المحاولة
            </Text>
          </Pressable>
        </View>
      ) : chat.messages.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: BRAND.muted, fontSize: 15, textAlign: 'center' }}>
            لسه مفيش رسايل. ابدأ بأي رد سريع من تحت.
          </Text>
        </View>
      ) : (
        <FlatList
          inverted
          data={chat.messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble message={item} onRetry={chat.retry} />}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Composer, or closed notice */}
      {chat.chatOpen ? (
        <Composer
          disabled={chat.isLoading || chat.isError}
          onSend={(t) => chat.send(t)}
          onTyping={chat.notifyTyping}
        />
      ) : (
        <View
          style={{
            padding: 16,
            paddingBottom: insets.bottom + 16,
            alignItems: 'center',
            backgroundColor: BRAND.surface,
          }}>
          <Text style={{ color: BRAND.muted, fontSize: 14 }}>
            المحادثة اتقفلت بعد انتهاء الطلب.
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
