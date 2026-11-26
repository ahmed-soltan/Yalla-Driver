// src/screens/profile/document-submit-screen.tsx
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/shared/ui/text';
import { DateField } from '@/shared/ui/date-field';
import { formatDate } from '@/shared/lib/format-date';
import { ImageUploader } from '@/shared/ui/file-upload/image-uploader';
import { BRAND } from '@/shared/config/theme';
import { documentTypeLabels, type DocumentFileSide } from '@/entities/captain/model/captain-types';
import { useSubmitDocument, useVerification } from '@/features/profile/service/use-captain-profile';
import { ScreenHeader } from '@/shared/ui/screen-layout';
import { TAB_BAR_CLEARANCE } from '@/shared/config/tab-bar';

const NUMBER_LABEL: Record<string, string> = {
  NATIONAL_ID: 'رقم البطاقة',
  DRIVING_LICENSE: 'رقم الرخصة',
};

const SERVER_ERRORS: Record<string, string> = {
  DOCUMENT_ALREADY_EXPIRED: 'تاريخ الانتهاء ده فات. اختار تاريخ صحيح من المستند.',
  MISSING_DOCUMENT_SIDE: 'لازم ترفع الوجهين.',
  SUBMISSION_ALREADY_OPEN: 'في نسخة تانية بتتراجع دلوقتي. استنى لحد ما نخلّص.',
};

function errorMessage(error: unknown): string {
  const code = (error as { response?: { data?: { code?: string } } })?.response?.data?.code;
  return (code && SERVER_ERRORS[code]) || 'ما قدرناش نبعت المستند. اتأكد من النت وجرب تاني.';
}

export function DocumentSubmitScreen({ type }: { type: string }) {
  const insets = useSafeAreaInsets();
  const verification = useVerification();
  const submit = useSubmitDocument();
  const doc = verification.data?.requiredDocuments.find((d) => d.type === type);

  const [frontId, setFrontId] = useState<string | null>(null);
  const [backId, setBackId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState('');
  const [number, setNumber] = useState('');
  const [problem, setProblem] = useState<string | null>(null);

  if (verification.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BRAND.background,
        }}>
        <ActivityIndicator color={BRAND.primary} />
      </View>
    );
  }

  if (!doc) {
    return (
      <View style={{ flex: 1, backgroundColor: BRAND.background }}>
        <ScreenHeader title="المستند" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: BRAND.text, fontSize: 16, fontWeight: '700' }}>
            المستند ده مش موجود.
          </Text>
        </View>
      </View>
    );
  }

  const label = documentTypeLabels[doc.type] ?? doc.type;
  const today = format(new Date(), 'yyyy-MM-dd');

  const hint =
    doc.status === 'VERIFIED'
      ? 'النسخة الحالية هتفضل شغالة لحد ما نراجع النسخة الجديدة.'
      : doc.status === 'EXPIRED'
        ? 'المستند الحالي منتهي. مش هتقدر تشتغل لحد ما نقبل نسخة جديدة.'
        : doc.status === 'REJECTED' && doc.rejectionReason
          ? doc.rejectionReason
          : null;

  const onSubmit = () => {
    if (!frontId)
      return setProblem(doc.requiresBackSide ? 'ارفع الوجه الأمامي.' : 'ارفع صورة المستند.');
    if (doc.requiresBackSide && !backId) return setProblem('ارفع الوجه الخلفي.');
    if (doc.requiresExpiryDate && !expiresAt) return setProblem('اختار تاريخ انتهاء المستند.');
    if (doc.requiresExpiryDate && expiresAt < today)
      return setProblem(SERVER_ERRORS.DOCUMENT_ALREADY_EXPIRED);
    setProblem(null);

    const files: { side: DocumentFileSide; fileId: string }[] = doc.requiresBackSide
      ? [
          { side: 'FRONT', fileId: frontId },
          { side: 'BACK', fileId: backId as string },
        ]
      : [{ side: 'SINGLE', fileId: frontId }];

    submit.mutate(
      {
        documentType: doc.type,
        vehicleId: doc.vehicleId,
        expiresAt: doc.requiresExpiryDate ? expiresAt : undefined,
        documentNumber: number.trim() || undefined,
        files,
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'تم إرسال المستند للمراجعة' });
          router.back();
        },
        onError: (e) => setProblem(errorMessage(e)),
      }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: BRAND.background, paddingTop: insets.top + 20, paddingBottom: TAB_BAR_CLEARANCE  }}>
      <ScreenHeader title={label} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, gap: 20 }}>
        {hint ? (
          <View style={{ backgroundColor: BRAND.surface, borderRadius: 12, padding: 12 }}>
            <Text style={{ color: BRAND.text, fontSize: 14 }}>{hint}</Text>
          </View>
        ) : null}

        <View style={{ gap: 8 }}>
          <Text style={{ color: BRAND.text, fontSize: 14, fontWeight: '700' }}>
            {doc.requiresBackSide ? 'الوجه الأمامي' : 'صورة المستند'}
          </Text>
          <ImageUploader
            variant="compact"
            size="md"
            shape="square"
            imageSource="camera-and-gallery"
            label={doc.requiresBackSide ? 'رفع الوجه الأمامي' : 'رفع الصورة'}
            disabled={submit.isPending}
            onUploadComplete={(fileId) => setFrontId(fileId)}
            onError={() => setProblem('ما قدرناش نرفع الصورة. جرب تاني.')}
          />
        </View>

        {doc.requiresBackSide ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: BRAND.text, fontSize: 14, fontWeight: '700' }}>الوجه الخلفي</Text>
            <ImageUploader
              variant="compact"
              size="md"
              shape="square"
              imageSource="camera-and-gallery"
              label="رفع الوجه الخلفي"
              disabled={submit.isPending}
              onUploadComplete={(fileId) => setBackId(fileId)}
              onError={() => setProblem('ما قدرناش نرفع الصورة. جرب تاني.')}
            />
          </View>
        ) : null}

        {doc.requiresExpiryDate ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: BRAND.text, fontSize: 14, fontWeight: '700' }}>
              تاريخ انتهاء المستند
            </Text>
            <DateField
              value={expiresAt ? new Date(`${expiresAt}T00:00:00`) : undefined}
              onChange={(date) => setExpiresAt(formatDate(date))}
              placeholder="اختار تاريخ الانتهاء"
              label="تاريخ انتهاء المستند"
              minimumDate={new Date()}
              maximumDate={null}
              defaultDate={new Date()}
            />
            <Text style={{ color: BRAND.muted, fontSize: 12 }}>
              اكتب التاريخ المطبوع على المستند. بنراجعه قبل ما نقبل المستند.
            </Text>
          </View>
        ) : null}

        {NUMBER_LABEL[doc.type] ? (
          <View style={{ gap: 8 }}>
            <Text style={{ color: BRAND.text, fontSize: 14, fontWeight: '700' }}>
              {NUMBER_LABEL[doc.type]} (اختياري)
            </Text>
            <TextInput
              value={number}
              onChangeText={setNumber}
              keyboardType="number-pad"
              editable={!submit.isPending}
              accessibilityLabel={NUMBER_LABEL[doc.type]}
              style={{
                height: 52,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: BRAND.line,
                paddingHorizontal: 14,
                fontSize: 16,
                color: BRAND.text,
                textAlign: 'left',
              }}
            />
          </View>
        ) : null}

        {problem ? <Text style={{ color: BRAND.danger, fontSize: 14 }}>{problem}</Text> : null}
      </ScrollView>

      <View
        style={{
          padding: 20,
          paddingBottom: insets.bottom + 10,
          borderTopWidth: 1,
          borderTopColor: BRAND.line,
        }}>
        <Pressable
          onPress={onSubmit}
          disabled={submit.isPending}
          accessibilityRole="button"
          accessibilityLabel="إرسال للمراجعة"
          accessibilityState={{ disabled: submit.isPending, busy: submit.isPending }}
          style={{
            height: 48,
            borderRadius: 14,
            backgroundColor: BRAND.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {submit.isPending ? (
            <ActivityIndicator color={BRAND.onPrimary} />
          ) : (
            <Text style={{ color: BRAND.onPrimary, fontSize: 15, fontWeight: '700' }}>
              إرسال للمراجعة
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
