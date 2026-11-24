// src/features/active-order/ui/receipt-card.tsx
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { CircleCheck } from 'lucide-react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { formatMoney } from '@/shared/lib/format-money';
import { parseEgpToPiastres } from '@/shared/lib/parse-money';
import type { OrderReceipt } from '@/entities/order/model/active-order-types';
import { ImageUploader } from '@/shared/ui/file-upload/image-uploader';

type Props = {
  receipt: OrderReceipt | null;
  busy: boolean;
  failed: boolean;
  onSubmit: (input: { fileId: string; amountPiastres: number }) => void;
};

export function ReceiptCard({ receipt, busy, failed, onSubmit }: Props) {
  const [amountText, setAmountText] = useState('');
  const [problem, setProblem] = useState<string | null>(null);

  if (receipt) {
    return (
      <View
        accessible
        accessibilityLabel={`تم رفع الفاتورة بقيمة ${formatMoney(receipt.amountPiastres)}`}
        style={{
          flexDirection: 'row-reverse',
          alignItems: 'center',
          gap: 10,
          backgroundColor: BRAND.successBg,
          borderRadius: 12,
          padding: 12,
        }}>
        <CircleCheck size={22} color={BRAND.success} />
        <Text style={{ color: BRAND.success, fontSize: 15, fontWeight: '700' }}>
          تم رفع الفاتورة · {formatMoney(receipt.amountPiastres)}
        </Text>
      </View>
    );
  }

  const upload = (fileId: string) => {
    const amountPiastres = parseEgpToPiastres(amountText);
    if (amountPiastres == null) {
      setProblem('اكتب إجمالي الفاتورة بالجنيه الأول.');
      return;
    }
    setProblem(null);
    onSubmit({ fileId, amountPiastres });
  };

  return (
    <View
      style={{ borderWidth: 1, borderColor: BRAND.line, borderRadius: 12, padding: 12, gap: 10 }}>
      <Text style={{ color: BRAND.text, fontSize: 15, fontWeight: '700' }}>فاتورة المحل</Text>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
        <TextInput
          value={amountText}
          onChangeText={setAmountText}
          keyboardType="decimal-pad"
          placeholder="إجمالي الفاتورة"
          placeholderTextColor={BRAND.muted}
          editable={!busy}
          accessibilityLabel="إجمالي الفاتورة بالجنيه"
          style={{
            flex: 1,
            height: 50,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: BRAND.line,
            paddingHorizontal: 14,
            fontSize: 16,
            color: BRAND.text,
            textAlign: 'right',
          }}
        />
        <Text style={{ color: BRAND.muted, fontSize: 15 }}>ج.م</Text>
      </View>
      {problem || failed ? (
        <Text style={{ color: BRAND.danger, fontSize: 13 }}>
          {problem ?? 'ما قدرناش نرفع الفاتورة. جرب تاني.'}
        </Text>
      ) : null}
      <ImageUploader
        variant="compact"
        size="md"
        shape="square"
        imageSource="camera-and-gallery"
        label="رفع الفاتورة"
        disabled={busy}
        onUploadComplete={(fileId) => upload(fileId)}
        onError={() => setProblem('ما قدرناش نرفع صورة الفاتورة. جرب تاني.')}
      />
    </View>
  );
}
