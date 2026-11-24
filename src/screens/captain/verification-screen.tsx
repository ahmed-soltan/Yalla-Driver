import { useRouter } from 'expo-router';
import { CheckCircle2, CircleAlert, Clock3 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { useCaptainVerification } from '@/features/captain/services/use-captain-verification';
import { useResubmitCaptainDocument } from '@/features/captain/services/use-resubmit-captain-document';
import { documentTypeLabels } from '@/entities/captain/model/captain-types';
import { DocumentUploader } from '@/shared/ui/file-upload/document-uploader';
import { ScreenHeader, ScreenLayout } from '@/shared/ui/screen-layout';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

const statusLabels: Record<string, string> = {
  VERIFIED: 'تم التحقق',
  UNDER_REVIEW: 'قيد المراجعة',
  PENDING: 'في انتظار المراجعة',
  MISSING: 'غير موجود',
  REJECTED: 'مرفوض',
};

export function VerificationScreen({ locked = false }: { locked?: boolean }) {
  const router = useRouter();
  const verification = useCaptainVerification();
  const resubmitDocument = useResubmitCaptainDocument();
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<string, { fileId: string; url: string }>
  >({});

  if (verification.isPending) {
    return (
      <ScreenLayout back={!locked}>
        <Text className="mt-8 text-right text-muted-foreground">جاري تحميل حالة التحقق...</Text>
      </ScreenLayout>
    );
  }

  if (!verification.data) {
    return (
      <ScreenLayout back={!locked}>
        <Text className="mt-8 text-right text-destructive">تعذر تحميل حالة التحقق.</Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout back={!locked}>
      <ScreenHeader
        title="حالة التحقق"
        subtitle="تابع حالة بياناتك ومستنداتك ومركبتك."
        back={false}
      />
      <StatusRow label="الحالة العامة" status={verification.data.status} />
      {verification.data.requiredDocuments.map((document) => (
        <View key={document.type}>
          <StatusRow
            label={documentTypeLabels[document.type] ?? document.type}
            status={document.status}
          />
          {(document.status === 'REJECTED' || document.status === 'MISSING') && (
            <View className="mb-4 rounded-2xl border border-border bg-card p-4">
              <Text className="mb-3 w-full text-right text-sm text-muted-foreground">
                {document.status === 'REJECTED'
                  ? 'أعد رفع المستند لتقديمه للمراجعة مرة أخرى.'
                  : 'ارفع المستند المطلوب لإكمال التحقق.'}
              </Text>
              <DocumentUploader
                name={document.type}
                acceptedTypes={['pdf', 'jpg', 'jpeg', 'png']}
                label="رفع المستند"
                description="اختر نسخة واضحة من المستند"
                onUploadComplete={(fileId, url) =>
                  setUploadedFiles((current) => ({
                    ...current,
                    [document.type]: { fileId, url },
                  }))
                }
              />
              {uploadedFiles[document.type] && (
                <Button
                  className="mt-3 min-h-12 w-full rounded-xl"
                  disabled={resubmitDocument.isPending}
                  onPress={() =>
                    resubmitDocument.mutate({
                      documentType: document.type,
                      vehicleId: document.vehicleId,
                      files: [
                        {
                          side: document.requiresBackSide ? 'FRONT' : 'SINGLE',
                          fileId: uploadedFiles[document.type].fileId,
                        },
                      ],
                    })
                  }>
                  <Text className="font-bold text-primary-foreground">
                    {resubmitDocument.isPending ? 'جاري التقديم...' : 'تقديم المستند للمراجعة'}
                  </Text>
                </Button>
              )}
              {resubmitDocument.isError && (
                <Text className="mt-2 w-full text-right text-sm text-destructive">
                  تعذر تقديم المستند. حاول مرة أخرى.
                </Text>
              )}
            </View>
          )}
        </View>
      ))}
      <StatusRow label="المركبة" status={verification.data.vehicle.status} />
      {verification.data.rejectionReason && (
        <Text className="mt-3 w-full rounded-2xl bg-destructive/10 p-4 text-right text-destructive">
          {verification.data.rejectionReason}
        </Text>
      )}
      <View className="flex-1" />
      {!locked && (
        <Button className="mt-6 min-h-14 w-full rounded-2xl" onPress={() => router.back()}>
          <Text className="font-bold text-primary-foreground">رجوع</Text>
        </Button>
      )}
    </ScreenLayout>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  const verified = status === 'VERIFIED';
  const rejected = status === 'REJECTED';
  const Icon = verified ? CheckCircle2 : rejected ? CircleAlert : Clock3;
  const color = verified ? '#15803D' : rejected ? '#DC2626' : '#B7791F';

  return (
    <View className="mb-3 w-full flex-row-reverse  items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <Icon size={21} color={color} />
      <Text className="flex-1 text-right font-semibold">{label}</Text>
      <Text className="text-sm text-muted-foreground">{statusLabels[status] ?? status}</Text>
    </View>
  );
}
