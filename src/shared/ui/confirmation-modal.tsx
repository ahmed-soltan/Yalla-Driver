import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleHelp, type LucideIcon } from 'lucide-react-native';
import { BRAND } from '@/shared/config/theme';
import { Text } from '@/shared/ui/text';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  highlightedValue?: string;
  icon?: LucideIcon;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationModal({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'رجوع',
  highlightedValue,
  icon: Icon = CircleHelp,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: Props) {
  const insets = useSafeAreaInsets();
  const confirmColor = confirmVariant === 'danger' ? BRAND.danger : BRAND.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: Math.max(insets.top, insets.bottom, 24),
        }}>
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(31,41,51,0.52)',
          }}
        />
        <View
          accessibilityViewIsModal
          style={{
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
            gap: 16,
            padding: 24,
            borderRadius: 24,
            backgroundColor: BRAND.background,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 12,
          }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: BRAND.primarySoft,
            }}>
            <Icon size={30} color={confirmColor} strokeWidth={2} />
          </View>

          <View style={{ width: '100%', gap: 8 }}>
            <Text
              accessibilityRole="header"
              style={{
                color: BRAND.text,
                fontSize: 20,
                fontWeight: '700',
                textAlign: 'center',
                lineHeight: 28,
              }}>
              {title}
            </Text>
            <Text style={{ color: BRAND.muted, fontSize: 15, lineHeight: 24, textAlign: 'center' }}>
              {description}
            </Text>
          </View>

          {highlightedValue ? (
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: BRAND.surface,
              }}>
              <Text
                style={{
                  color: BRAND.text,
                  fontSize: 22,
                  fontWeight: '700',
                  textAlign: 'center',
                  lineHeight: 30,
                }}>
                {highlightedValue}
              </Text>
            </View>
          ) : null}

          <View style={{ width: '100%', flexDirection: 'row-reverse', gap: 10 }}>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              style={{
                flex: 1,
                minHeight: 52,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                backgroundColor: confirmColor,
              }}>
              <Text style={{ color: BRAND.onPrimary, fontSize: 15, fontWeight: '700' }}>
                {confirmLabel}
              </Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              style={{
                flex: 1,
                minHeight: 52,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 14,
                borderWidth: 1,
                borderColor: BRAND.line,
                backgroundColor: BRAND.background,
              }}>
              <Text style={{ color: BRAND.text, fontSize: 15, fontWeight: '700' }}>
                {cancelLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
