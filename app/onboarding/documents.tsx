import { Redirect } from 'expo-router';

import { DocumentsScreen } from '@/screens/onboarding/documents-screen';
import { useAuthStore } from '@/shared/hooks/auth-store';

export default function DocumentsRoute() {
  const status = useAuthStore((state) => state.status);
  return status === 'authenticated' ? <DocumentsScreen /> : <Redirect href="/" />;
}
