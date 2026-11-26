// src/shared/ui/captain-tab-bar.tsx
import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardList, House, User, Wallet, type LucideIcon } from 'lucide-react-native';

import { Text } from '@/shared/ui/text';
import { BRAND } from '@/shared/config/theme';
import { useTabBarStore } from '@/shared/model/tab-bar-store';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

// Only these routes appear, in this order. Any other file under (tabs) stays hidden.
const TABS: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: 'home', label: 'الرئيسية', Icon: House },
  { name: 'trips', label: 'الرحلات', Icon: ClipboardList },
  { name: 'stats', label: 'الإحصائيات', Icon: Wallet },
  { name: 'profile', label: 'الملف الشخصي', Icon: User },
];

const BAR_HEIGHT = 64;

export function CaptainTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const hidden = useTabBarStore((s) => s.hidden);

  if (hidden) return null;

  const focusedKey = state.routes[state.index]?.key;

  return (
    <View
      style={{
        position: 'absolute',
        start: 0,
        end: 0,
        bottom: insets.bottom,
        height: BAR_HEIGHT,
        flexDirection: 'row-reverse',
        backgroundColor: BRAND.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: BRAND.line,
        padding: 6,
      }}>
      {TABS.map(({ name, label, Icon }) => {
        const route = state.routes.find((r) => r.name === name);
        if (!route) return null;
        const focused = route.key === focusedKey;
        const color = focused ? BRAND.primary : BRAND.muted;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            Haptics.selectionAsync().catch(() => {});
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: focused }}
            style={{
              flex: 1,
              minHeight: 44,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              backgroundColor: focused ? BRAND.primarySoft : 'transparent',
            }}>
            <Icon size={22} color={color} strokeWidth={focused ? 2.4 : 2} />
            <Text
              numberOfLines={1}
              style={{ color, fontSize: 11, fontWeight: focused ? '700' : '500' }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
