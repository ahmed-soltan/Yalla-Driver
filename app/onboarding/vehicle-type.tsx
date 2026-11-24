import { Redirect } from 'expo-router';

import { VehicleTypeScreen } from '@/screens/onboarding/vehicle-type-screen';
import { useAuthStore } from '@/shared/hooks/auth-store';

export default function VehicleTypeRoute() {
  const status = useAuthStore((state) => state.status);
  return status === 'authenticated' ? <VehicleTypeScreen /> : <Redirect href="/" />;
}
