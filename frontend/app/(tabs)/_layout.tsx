import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../src/theme';
import { Icon, IconName } from '../../src/components/Icon';

interface TabIconProps {
  icon: IconName;
  focused: boolean;
  label: string;
}

function TabIcon({ icon, focused, label }: TabIconProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.iconContainer}>
      <Icon
        name={icon}
        size={22}
        color={focused ? colors.primary : colors.textMuted}
      />
      <Text
        style={[
          typography.captionBold,
          {
            color: focused ? colors.primary : colors.textMuted,
            fontSize: 11,
            marginTop: 4,
            fontWeight: focused ? '800' : '600',
          },
        ]}
      >
        {label}
      </Text>
      {focused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon icon="today" focused={focused} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="train"
        options={{
          title: 'Workouts',
          tabBarIcon: ({ focused }) => <TabIcon icon="train" focused={focused} label="Workouts" />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ focused }) => <TabIcon icon="community" focused={focused} label="Community" />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => <TabIcon icon="progress" focused={focused} label="Progress" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon icon="profile" focused={focused} label="Profile" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
