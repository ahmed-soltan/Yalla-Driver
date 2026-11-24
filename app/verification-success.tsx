import { Redirect } from 'expo-router';

import { VerificationSuccessScreen } from '@/screens/captain/verification-success-screen';
import { useAuthStore } from '@/shared/hooks/auth-store';

export default function VerificationSuccessRoute() {
  const status = useAuthStore((state) => state.status);

  return status === 'authenticated' ? <VerificationSuccessScreen /> : <Redirect href="/" />;
}
