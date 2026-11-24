import { Redirect } from 'expo-router';

import { useAuthStore } from '@/shared/hooks/auth-store';
import { ProfileScreen } from '@/screens/profile/profile-screen';

export default function CaptainProfileRoute() {
  const status = useAuthStore((state) => state.status);
  return status === 'authenticated' ? <ProfileScreen /> : <Redirect href="/" />;
}
