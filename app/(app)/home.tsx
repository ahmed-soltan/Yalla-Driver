import { Redirect } from 'expo-router';

import { HomeScreen } from '@/screens/home/home-screen';
import { useAuthStore } from '@/shared/hooks/auth-store';

export default function HomeRoute() {
  const status = useAuthStore((state) => state.status);
  return status === 'authenticated' ? <HomeScreen /> : <Redirect href="/" />;
}
