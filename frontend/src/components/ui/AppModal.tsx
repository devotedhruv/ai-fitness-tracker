import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../Icon';

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  dismissible?: boolean;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export function AppModal({
  visible,
  onClose,
  title,
  subtitle,
  children,
  dismissible = true,
  maxWidth = 440,
  style,
}: AppModalProps) {
  const { colors, typography, radius, shadows } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={dismissible ? onClose : undefined}>
        <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  maxWidth,
                },
                shadows.lg,
                style,
              ]}
            >
              {(title || dismissible) && (
                <View style={[styles.header, { borderBottomColor: colors.divider }]}>
                  <View style={styles.titleCol}>
                    {title && (
                      <Text style={[typography.headingMedium, { color: colors.textPrimary }]}>
                        {title}
                      </Text>
                    )}
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
                      accessibilityLabel="Close"
                    >
                      <Icon name="x" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.body}>{children}</View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleCol: {
    flex: 1,
    marginRight: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 20,
  },
});
