// src/features/profile/ui/document-card.tsx
import { Pressable, View } from 'react-native';
import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { formatDateOnly } from '@/shared/lib/format-date';
import {
  documentTypeLabels,
  type CaptainRequiredDocument,
} from '@/entities/captain/model/captain-types';
import { StatusChip } from './status-chip';
import { expiryText } from '@/entities/captain/lib/captain-alerts';

function actionLabel(doc: CaptainRequiredDocument): { label: string; strong: boolean } {
  if (doc.status === 'MISSING') return { label: 'ارفع المستند', strong: true };
  if (doc.status === 'REJECTED') return { label: 'ارفع تاني', strong: true };
  if (doc.status === 'EXPIRED') return { label: 'ارفع نسخة جديدة', strong: true };
  if (doc.expiryState === 'EXPIRING_SOON') return { label: 'جدّد المستند', strong: true };
  return { label: 'استبدل المستند', strong: false };
}

export function DocumentCard({
  doc,
  onPress,
}: {
  doc: CaptainRequiredDocument;
  onPress: () => void;
}) {
  const label = documentTypeLabels[doc.type] ?? doc.type;
  const expiry = expiryText(doc);
  const reviewing =
    doc.replacement != null &&
    (doc.replacement.status === 'PENDING' || doc.replacement.status === 'UNDER_REVIEW');
  const action = actionLabel(doc);
  const expiryColor = doc.expiryState === 'EXPIRED' ? BRAND.danger : BRAND.primary;

  return (
    <View
      style={{
        backgroundColor: BRAND.background,
        borderWidth: 1,
        borderColor: BRAND.line,
        borderRadius: 16,
        padding: 16,
        gap: 10,
      }}>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>{label}</Text>
          {!doc.isRequired ? (
            <Text style={{ color: BRAND.muted, fontSize: 12 }}>اختياري</Text>
          ) : null}
        </View>
        <StatusChip status={doc.status} />
      </View>

      {doc.expiresAt ? (
        <View style={{ gap: 2 }}>
          <Text style={{ color: BRAND.muted, fontSize: 13 }}>
            تاريخ الانتهاء: {formatDateOnly(doc.expiresAt)}
          </Text>
          {expiry ? (
            <Text style={{ color: expiryColor, fontSize: 13, fontWeight: '700' }}>{expiry}</Text>
          ) : null}
        </View>
      ) : null}

      {doc.status === 'REJECTED' && doc.rejectionReason ? (
        <Text style={{ color: BRAND.danger, fontSize: 13 }}>{doc.rejectionReason}</Text>
      ) : null}

      {doc.replacement?.status === 'REJECTED' && doc.replacement.rejectionReason ? (
        <Text style={{ color: BRAND.danger, fontSize: 13 }}>
          النسخة الجديدة اترفضت: {doc.replacement.rejectionReason}
        </Text>
      ) : null}

      {reviewing ? (
        <Text style={{ color: BRAND.muted, fontSize: 13 }}>
          {doc.status === 'VERIFIED' || doc.status === 'EXPIRED'
            ? 'بنراجع النسخة الجديدة، وهنبلغك أول ما نخلّص.'
            : 'بنراجع المستند، وهنبلغك أول ما نخلّص.'}
        </Text>
      ) : null}

      {doc.canReplace ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${action.label}: ${label}`}
          style={{
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: action.strong ? BRAND.primary : BRAND.background,
            borderWidth: action.strong ? 0 : 1,
            borderColor: BRAND.line,
          }}>
          <Text
            style={{
              color: action.strong ? BRAND.onPrimary : BRAND.text,
              fontSize: 13,
              fontWeight: '700',
            }}>
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
