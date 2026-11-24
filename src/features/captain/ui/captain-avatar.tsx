import { useAuthStore } from '@/shared/hooks/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { Text } from '@/shared/ui/text/text';
import { Link } from 'expo-router';

export function CaptainAvatar() {
  const user = useAuthStore((state) => state.user);

  return (
    <Link href={'/profile'}>
      <Avatar alt="صورة الملف الشخصي" className="size-14 border-2 border-white bg-black">
        <AvatarImage source={{ uri: user?.avatarUrl ?? '' }} />
        <AvatarFallback className=" bg-black">
          <Text variant="title" className="text-white">
            {user?.fullName?.charAt(0) ?? ''}
          </Text>
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}
