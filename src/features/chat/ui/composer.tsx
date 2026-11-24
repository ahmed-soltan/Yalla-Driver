// src/features/chat/ui/composer.tsx
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';

// One tap while driving is safer than typing.
const QUICK_REPLIES = ['وصلت', 'أنا في الطريق', 'هوصل خلال ٥ دقايق', 'ممكن تتصل بيا؟'];

type Props = {
  disabled: boolean;
  onSend: (text: string) => void;
  onTyping: () => void;
};

export function Composer({ disabled, onSend, onTyping }: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const canSend = !disabled && text.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  return (
    <View
      style={{
        borderTopWidth: 1,
        borderTopColor: BRAND.line,
        backgroundColor: BRAND.background,
        paddingTop: 8,
        paddingBottom: insets.bottom + 8,
        gap: 8,
      }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {QUICK_REPLIES.map((q) => (
          <Pressable
            key={q}
            onPress={() => onSend(q)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`ابعت: ${q}`}
            style={{
              minHeight: 44,
              paddingHorizontal: 16,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: BRAND.line,
              justifyContent: 'center',
              opacity: disabled ? 0.5 : 1,
            }}>
            <Text style={{ color: BRAND.text, fontSize: 14, fontWeight: '700' }}>{q}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row-reverse',
          alignItems: 'flex-end',
          gap: 8,
          paddingHorizontal: 16,
        }}>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            onTyping();
          }}
          placeholder="اكتب رسالة"
          placeholderTextColor={BRAND.muted}
          multiline
          maxLength={1000}
          editable={!disabled}
          accessibilityLabel="اكتب رسالة"
          style={{
            flex: 1,
            minHeight: 48,
            maxHeight: 110,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: BRAND.line,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 12,
            fontSize: 16,
            color: BRAND.text,
            textAlign: 'right',
          }}
        />
        <Pressable
          onPress={submit}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="إرسال"
          accessibilityState={{ disabled: !canSend }}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: BRAND.primary,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canSend ? 1 : 0.4,
          }}>
          <Send size={20} color={BRAND.onPrimary} />
        </Pressable>
      </View>
    </View>
  );
}
