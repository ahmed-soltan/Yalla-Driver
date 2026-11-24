import { Redirect } from 'expo-router';

import { ProfileScreen } from '@/screens/onboarding/profile-screen';
import { useAuthStore } from '@/shared/hooks/auth-store';

export default function ProfileRoute() {
  const status = useAuthStore((state) => state.status);
  return status === 'authenticated' ? <ProfileScreen /> : <Redirect href="/" />;
}
