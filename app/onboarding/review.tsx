import { Redirect } from 'expo-router';

import { ReviewScreen } from '@/screens/onboarding/review-screen';
import { useAuthStore } from '@/shared/hooks/auth-store';

export default function ReviewRoute() {
  const status = useAuthStore((state) => state.status);
  return status === 'authenticated' ? <ReviewScreen /> : <Redirect href="/" />;
}
