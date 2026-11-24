// app/(app)/profile/documents/[type].tsx
import { useLocalSearchParams } from 'expo-router';
import { DocumentSubmitScreen } from '@/screens/profile/document-submit-screen';

export default function DocumentSubmitRoute() {
  const { type } = useLocalSearchParams<{ type: string }>();
  return <DocumentSubmitScreen type={type} />;
}
