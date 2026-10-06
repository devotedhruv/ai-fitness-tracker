import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';

export interface TabItem {
  id: string;
  label: string;
  badge?: number | string;
  icon?: ReactNode;
}

export interface AppTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange?: (id: string) => void;
  onTabPress?: (id: string) => void;
  variant?: 'underline' | 'pills' | 'segment';
  scrollable?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppTabBar({
  tabs,
  activeTab,
  onTabChange,
  onTabPress,
  variant = 'underline',
  scrollable = false,
  style,
}: AppTabBarProps) {
  const handleTabPress = (id: string) => {
    if (onTabChange) onTabChange(id);
    if (onTabPress) onTabPress(id);
  };
  const { colors, typography, radius } = useTheme();

  const renderTab = (tab: TabItem) => {
    const isActive = tab.id === activeTab;

    if (variant === 'segment') {
      return (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.segmentItem,
            {
              backgroundColor: isActive ? colors.accent : 'transparent',
              borderRadius: radius.sm,
            },
          ]}
          onPress={() => handleTabPress(tab.id)}
          activeOpacity={0.8}
        >
          {tab.icon && <View style={styles.tabIcon}>{tab.icon}</View>}
          <Text
            style={[
              typography.buttonSmall,
              {
                color: isActive ? colors.onAccent : colors.textSecondary,
                fontWeight: isActive ? '800' : '600',
              },
            ]}
          >
            {tab.label}
          </Text>
          {tab.badge !== undefined && (
            <View
              style={[
                styles.badge,
                { backgroundColor: isActive ? colors.onAccent : colors.surfaceElevated },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: isActive ? colors.accent : colors.textPrimary },
                ]}
              >
                {tab.badge}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (variant === 'pills') {
      return (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.pillItem,
            {
              backgroundColor: isActive ? colors.accentMuted : colors.surfaceElevated,
              borderColor: isActive ? colors.accent : colors.border,
              borderRadius: radius.full,
            },
          ]}
          onPress={() => handleTabPress(tab.id)}
          activeOpacity={0.8}
        >
          {tab.icon && <View style={styles.tabIcon}>{tab.icon}</View>}
          <Text
            style={[
              typography.captionBold,
              {
                color: isActive ? colors.accent : colors.textSecondary,
              },
            ]}
          >
            {tab.label}
          </Text>
          {tab.badge !== undefined && (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <Text style={[styles.badgeText, { color: colors.onAccent }]}>{tab.badge}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    // Default 'underline' variant
    return (
      <TouchableOpacity
        key={tab.id}
        style={[
          styles.underlineItem,
          {
            borderBottomColor: isActive ? colors.accent : 'transparent',
            borderBottomWidth: isActive ? 2.5 : 0,
          },
        ]}
        onPress={() => handleTabPress(tab.id)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            typography.buttonSmall,
            {
              color: isActive ? colors.accent : colors.textSecondary,
              fontWeight: isActive ? '800' : '600',
            },
          ]}
        >
          {tab.label}
        </Text>
        {tab.badge !== undefined && (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.badgeText, { color: colors.onAccent }]}>{tab.badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const containerStyle = [
    variant === 'segment'
      ? [
          styles.segmentContainer,
          { backgroundColor: colors.surfaceElevated, borderColor: colors.border, borderRadius: radius.md },
        ]
      : variant === 'underline'
      ? [styles.underlineContainer, { borderBottomColor: colors.divider }]
      : styles.pillsContainer,
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, containerStyle]}
      >
        {tabs.map(renderTab)}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{tabs.map(renderTab)}</View>;
}

const styles = StyleSheet.create({
  underlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    width: '100%',
  },
  underlineItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  segmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderWidth: 1,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  pillsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pillItem: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabIcon: {
    marginRight: 6,
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
