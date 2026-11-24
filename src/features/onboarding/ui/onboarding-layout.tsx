import { View } from 'react-native';

import { ScreenLayout } from '@/shared/ui/screen-layout';
import { Text } from '@/shared/ui/text';

const steps = ['بياناتك', 'المركبة', 'المستندات', 'المراجعة'];

export function OnboardingLayout({
  children,
  currentStep,
  completed = false,
  back = true,
}: {
  children: React.ReactNode;
  currentStep: 1 | 2 | 3 | 4;
  completed?: boolean;
  back?: boolean;
}) {
  return (
    <ScreenLayout back={back}>
      <OnboardingProgress currentStep={currentStep} completed={completed} />
      {children}
    </ScreenLayout>
  );
}

function OnboardingProgress({
  currentStep,
  completed,
}: {
  currentStep: 1 | 2 | 3 | 4;
  completed: boolean;
}) {
  return (
    <View
      className="mb-5 w-full"
      accessibilityLabel={`الخطوة ${currentStep} من ${steps.length}: ${steps[currentStep - 1]}`}>
      <View className="mb-3 flex-row-reverse items-center justify-between">
        <View className="flex-row-reverse items-center gap-2">
          <View className="size-2 rounded-full bg-secondary" />
          <Text className="text-xs font-semibold text-muted-foreground">رحلتك مع يلا</Text>
        </View>
        <Text className="text-xs font-semibold text-muted-foreground">
          الخطوة {currentStep} من {steps.length}
        </Text>
      </View>
      <View className="flex-row-reverse items-center">
        {steps.map((label, index) => {
          const step = index + 1;
          const stepCompleted = completed || step < currentStep;

          return (
            <View key={label} className="flex-1 flex-row-reverse items-center">
              <View
                className={`size-9 items-center justify-center rounded-full border-2 ${
                  stepCompleted
                    ? 'border-secondary bg-secondary'
                    : step === currentStep
                      ? 'border-primary bg-background'
                      : 'border-border bg-background'
                }`}>
                <Text
                  className={`text-sm font-bold ${
                    stepCompleted
                      ? 'text-white'
                      : step === currentStep
                        ? 'text-primary'
                        : 'text-muted-foreground'
                  }`}>
                  {step}
                </Text>
              </View>
              {step < steps.length && (
                <View
                  className={`h-0.5 flex-1 border-t border-dashed ${
                    stepCompleted ? 'border-secondary' : 'border-border'
                  }`}
                />
              )}
            </View>
          );
        })}
      </View>
      <View className="mt-2 flex-row-reverse items-center">
        {steps.map((label) => (
          <Text
            key={label}
            className="w-1/4 text-left text-[10px] font-medium text-muted-foreground">
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}
