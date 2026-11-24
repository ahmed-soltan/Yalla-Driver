import { useState, type ReactNode } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';
import { ExternalLink, ShieldAlert, Sparkles } from 'lucide-react-native';

import type { AppVersionInfo, VersionUpdateState } from '@shared/services/app-version';
import { Text } from './text/text';

type AppVersionGateProps = {
  updateState: VersionUpdateState | null;
  children: ReactNode;
};

async function openDownloadUrl(info: AppVersionInfo) {
  try {
    if (!(await Linking.canOpenURL(info.downloadUrl))) {
      throw new Error('URL cannot be opened');
    }

    await Linking.openURL(info.downloadUrl);
  } catch {
    Alert.alert('تعذر فتح رابط التحديث', 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى.');
  }
}

export function AppVersionGate({ updateState, children }: AppVersionGateProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [isOptionalDismissed, setIsOptionalDismissed] = useState(false);

  if (
    !updateState ||
    updateState.status === 'up-to-date' ||
    (updateState.status === 'optional' && isOptionalDismissed)
  ) {
    return <>{children}</>;
  }

  const isMandatory = updateState.status === 'mandatory';
  const openUpdate = async () => {
    setIsOpening(true);
    await openDownloadUrl(updateState.info);
    setIsOpening(false);
  };

  if (!isMandatory) {
    return (
      <OptionalUpdatePrompt
        info={updateState.info}
        isOpening={isOpening}
        onUpdate={openUpdate}
        onLater={() => setIsOptionalDismissed(true)}
      />
    );
  }

  return (
    <View
      className="flex-1 items-center justify-center bg-background px-6"
      style={{ direction: 'rtl' }}>
      <View className="w-full max-w-[380px] items-center gap-5 rounded-3xl border border-orange-200 bg-card p-6">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-orange-100">
          <ShieldAlert size={30} color="#EA580C" />
        </View>
        <View className="items-center gap-2">
          <Text variant="title" className="text-center text-xl">
            تحديث مطلوب
          </Text>
          <Text className="text-center text-sm leading-6 text-muted-foreground">
            يجب تحديث التطبيق إلى الإصدار {updateState.info.minimumVersion} أو أحدث للمتابعة.
          </Text>
          <Text className="text-center text-xs text-muted-foreground">
            الإصدار الحالي: {updateState.currentVersion} | الإصدار الجديد:{' '}
            {updateState.info.latestVersion}
          </Text>
        </View>
        <Pressable
          onPress={openUpdate}
          disabled={isOpening}
          className="w-full flex-row-reverse items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 active:opacity-80 disabled:opacity-50">
          <ExternalLink size={17} color="#FFFFFF" />
          <Text className="font-cairo-bold text-sm text-primary-foreground">
            {isOpening ? 'جارٍ فتح رابط التحديث...' : 'تحديث التطبيق'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function OptionalUpdatePrompt({
  info,
  isOpening,
  onUpdate,
  onLater,
}: {
  info: AppVersionInfo;
  isOpening: boolean;
  onUpdate: () => Promise<void>;
  onLater: () => void;
}) {
  return (
    <View
      className="flex-1 items-center justify-center bg-black/45 px-6"
      style={{ direction: 'rtl' }}>
      <View className="w-full max-w-[380px] items-center gap-4 rounded-3xl bg-card p-6">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Sparkles size={26} color="#2563EB" />
        </View>
        <View className="items-center gap-2">
          <Text variant="heading" className="text-center">
            يتوفر تحديث جديد
          </Text>
          <Text className="text-center text-sm leading-6 text-muted-foreground">
            الإصدار {info.latestVersion} متاح الآن مع تحسينات جديدة.
          </Text>
        </View>
        <View className="w-full gap-2.5">
          <Pressable
            onPress={onUpdate}
            disabled={isOpening}
            className="w-full flex-row-reverse items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 active:opacity-80 disabled:opacity-50">
            <ExternalLink size={17} color="#FFFFFF" />
            <Text className="font-cairo-bold text-sm text-primary-foreground">
              {isOpening ? 'جارٍ فتح رابط التحديث...' : 'تحديث الآن'}
            </Text>
          </Pressable>
          <Pressable
            onPress={onLater}
            className="items-center rounded-2xl border border-border bg-card py-3.5 active:opacity-70">
            <Text className="font-cairo-bold text-sm">لاحقًا</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
