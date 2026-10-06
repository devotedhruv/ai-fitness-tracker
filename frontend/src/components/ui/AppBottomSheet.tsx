import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Icon } from '../Icon';

export interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  dismissible?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AppBottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  dismissible = true,
  style,
}: AppBottomSheetProps) {
  const { colors, typography, radius } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissible ? onClose : undefined}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.sheet,
                {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.border,
                  borderTopLeftRadius: radius.xxl,
                  borderTopRightRadius: radius.xxl,
                  paddingBottom: Math.max(insets.bottom, 20),
                },
                style,
              ]}
            >
              {/* Handle Bar */}
              <View style={styles.handleContainer}>
                <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
              </View>

              {/* Optional Header */}
              {title && (
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                  <View style={styles.titleCol}>
                    <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
                      {title}
                    </Text>
                    {subtitle && (
                      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                        {subtitle}
                      </Text>
                    )}
                  </View>
                  {dismissible && (
                    <TouchableOpacity
                      onPress={onClose}
                      style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Close sheet"
                    >
                      <Icon name="x" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.content}>{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    borderTopWidth: 1,
    maxHeight: '90%',
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  titleCol: {
    flex: 1,
    marginRight: 10,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
