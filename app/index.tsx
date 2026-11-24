import { Redirect } from 'expo-router';

import { useAuthStore } from '@/shared/hooks/auth-store';
import { WelcomeScreen } from '@/screens/auth/welcome-screen';

export default function IndexRoute() {
  const status = useAuthStore((state) => state.status);
  const requiresProfileCompletion = useAuthStore((state) => state.requiresProfileCompletion);
  const onboardingComplete = useAuthStore((state) => state.onboardingComplete);

  if (status === 'checking') {
    return null;
  }

  if (status === 'unauthenticated') return <WelcomeScreen />;

  console.log(requiresProfileCompletion)

  return (
    <Redirect
      href={
        (requiresProfileCompletion
          ? '/onboarding/profile'
          : onboardingComplete
            ? '/(app)/home'
            : '/onboarding/permissions') as never
      }
    />
  );
}
