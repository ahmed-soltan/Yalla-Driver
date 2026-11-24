// app/(app)/chat/[orderId].tsx
import { useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '@/screens/chat/chat-screen';

export default function ChatRoute() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <ChatScreen orderId={orderId} />;
}
