import { Redirect } from 'expo-router';

export default function SignInRoute() {
  return <Redirect href={'/(auth)/phone?mode=login' as never} />;
}
