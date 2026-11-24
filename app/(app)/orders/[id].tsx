// app/(app)/orders/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { ActiveOrderScreen } from '@/screens/active-order/active-order-screen';

export default function ActiveOrderRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ActiveOrderScreen orderId={id} />;
}
