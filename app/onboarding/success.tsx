import { Redirect } from 'expo-router';

import { SuccessScreen } from '@/screens/onboarding/success-screen';
import { useAuthStore } from '@/shared/hooks/auth-store';

export default function SuccessRoute() {
  const status = useAuthStore((state) => state.status);
  return status === 'authenticated' ? <SuccessScreen /> : <Redirect href="/" />;
}
