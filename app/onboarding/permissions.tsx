import { Redirect } from 'expo-router';

import { useAuthStore } from '@/shared/hooks/auth-store';
import { PermissionsScreen } from '@/screens/onboarding/permissions-screen';

export default function PermissionsRoute() {
  const status = useAuthStore((state) => state.status);
  return status === 'authenticated' ? <PermissionsScreen /> : <Redirect href="/" />;
}
