import { Redirect } from 'expo-router';

import { VerificationScreen } from '@/screens/captain/verification-screen';
import { useAuthStore } from '@/shared/hooks/auth-store';

export default function VerificationRoute() {
  const status = useAuthStore((state) => state.status);
  return status === 'authenticated' ? <VerificationScreen /> : <Redirect href="/" />;
}
