import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Palette } from '@/constants/theme';
import { useSavedParks } from '@/context/saved-parks-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { savedParks } = useSavedParks();
  const savedCount = savedParks.length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home tab',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'States',
          tabBarLabel: 'States',
          tabBarAccessibilityLabel: 'States tab',
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="paperplane.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="lifecycle"
        options={{
          title: 'Saved Parks',
          tabBarLabel: 'Saved Parks',
          tabBarAccessibilityLabel: 'Saved parks tab',
          tabBarBadge: savedCount > 0 ? savedCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
            color: colorScheme === 'dark' ? Palette.plum : '#ffffff',
          },
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={28}
              name="clock.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="states/[stateCode]"
        options={{
          href: null,
          headerShown: true,
          title: 'States',
        }}
      />
      <Tabs.Screen
        name="parks/[parkCode]"
        options={{
          href: null,
          headerShown: true,
          title: 'Park Profile',
        }}
      />
    </Tabs>
  );
}
