import { Star, UserRound } from 'lucide-react-native';
import { View } from 'react-native';

import type { CaptainProfile } from '@/entities/captain/model/captain-types';
import { Text } from '@/shared/ui/text';

export function ProfileSummaryCard({ profile }: { profile: CaptainProfile }) {
  return (
    <View className="mb-4 w-full rounded-3xl bg-primary p-5">
      <View className="flex-row-reverse  items-center gap-3">
        <View className="size-14 items-center justify-center rounded-full bg-white/20">
          <UserRound size={27} color="white" />
        </View>
        <View className="flex-1 items-end">
          <Text className="w-full text-right text-xl font-bold text-white">
            {profile.user.fullName}
          </Text>
          <Text className="mt-1 text-sm text-white/75">{profile.user.phoneNumber}</Text>
        </View>
      </View>
      <View className="mt-5 flex-row-reverse  gap-3">
        <View className="flex-1 rounded-2xl bg-white/15 p-3">
          <Text className="text-right text-xs text-white/75">التقييم</Text>
          <View className="mt-1 flex-row-reverse  items-center gap-1">
            <Star size={15} color="#FDE68A" fill="#FDE68A" />
            <Text className="font-bold text-white">{profile.rating.toFixed(1)}</Text>
          </View>
        </View>
        <View className="flex-1 rounded-2xl bg-white/15 p-3">
          <Text className="text-right text-xs text-white/75">إجمالي الرحلات</Text>
          <Text className="mt-1 text-right font-bold text-white">{profile.tripsCount}</Text>
        </View>
      </View>
    </View>
  );
}
