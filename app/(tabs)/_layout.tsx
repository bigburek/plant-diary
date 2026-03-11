import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import Icon, { IconName } from '@/components/icon';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeContext';

function TabIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={26} color={color} />
    </View>
  );
}

export default function TabLayout() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const C = Colors[theme];

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  if (loading || !user) return null;

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: C.tint,
          tabBarInactiveTintColor: C.tabIconDefault,
          tabBarStyle: {
            backgroundColor: C.background,
            borderTopColor: C.accent,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'My Plants',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="home" focused={focused} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: 'Add',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="plus" focused={focused} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="search" focused={focused} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="user" focused={focused} color={color} />
            ),
          }}
        />
        {/* Hide scan from tab bar - keep as accessible screen */}
        <Tabs.Screen
          name="scan"
          options={{ href: null }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});