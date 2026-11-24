import { Redirect } from 'expo-router';

import { VehicleDetailsScreen } from '@/screens/onboarding/vehicle-details-screen';
import { useAuthStore } from '@/shared/hooks/auth-store';

export default function VehicleDetailsRoute() {
  const status = useAuthStore((state) => state.status);
  return status === 'authenticated' ? <VehicleDetailsScreen /> : <Redirect href="/" />;
}
