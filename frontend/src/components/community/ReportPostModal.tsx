import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../tokens/ThemeContext';
import { Icon } from '../Icon';
import { socialApi } from '../../services/api';

interface ReportPostModalProps {
  visible: boolean;
  postId: string | null;
  onClose: () => void;
  onReportSubmitted?: () => void;
}

const REPORT_REASONS = [
  { id: 'SPAM', label: 'Spam or Commercial Promotion' },
  { id: 'HARASSMENT', label: 'Harassment or Bullying' },
  { id: 'INAPPROPRIATE', label: 'Inappropriate or Explicit Content' },
  { id: 'HATE_ABUSIVE', label: 'Hate Speech or Abusive Behavior' },
  { id: 'MISLEADING', label: 'Dangerous or Misleading Fitness Advice' },
  { id: 'OTHER', label: 'Other Guidelines Violation' },
];

export function ReportPostModal({
  visible,
  postId,
  onClose,
  onReportSubmitted,
}: ReportPostModalProps) {
  const { colors } = useTheme();

  const [selectedReason, setSelectedReason] = useState('SPAM');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!postId || submitting) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      await socialApi.reportPost(postId, {
        reason: selectedReason,
        notes: notes.trim() || undefined,
      });
      setSubmitted(true);
      onReportSubmitted?.();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedReason('SPAM');
    setNotes('');
    setSubmitted(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleReset}>
      <View style={[styles.backdrop, { backgroundColor: 'rgba(5, 8, 18, 0.8)' }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {submitted ? (
            <View style={styles.successContainer}>
              <View style={[styles.successIconWrap, { backgroundColor: colors.surfaceElevated }]}>
                <Icon name="check" size={32} color={colors.accent} />
              </View>
              <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Report Submitted</Text>
              <Text style={[styles.successText, { color: colors.textSecondary }]}>
                Thank you for helping keep our fitness community positive and supportive. Our moderators will review this post.
              </Text>
              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: colors.accent }]}
                onPress={handleReset}
              >
                <Text style={[styles.doneBtnText, { color: colors.onAccent }]}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleWrap}>
                  <Icon name="flag" size={20} color={colors.warning} />
                  <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Report Post</Text>
                </View>
                <TouchableOpacity onPress={handleReset} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Icon name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Why are you reporting this post? Your report is anonymous.
              </Text>

              {errorMsg ? (
                <View style={[styles.errorBox, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* Reason Selector */}
              <View style={styles.reasonsList}>
                {REPORT_REASONS.map((r) => {
                  const isSelected = selectedReason === r.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[
                        styles.reasonOption,
                        {
                          backgroundColor: isSelected ? colors.surfaceElevated : colors.backgroundSecondary,
                          borderColor: isSelected ? colors.accent : colors.border,
                        },
                      ]}
                      onPress={() => setSelectedReason(r.id)}
                    >
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? colors.accent : colors.mutedText,
                          },
                        ]}
                      >
                        {isSelected && (
                          <View style={[styles.radioFill, { backgroundColor: colors.accent }]} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.reasonLabel,
                          { color: isSelected ? colors.textPrimary : colors.textSecondary },
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Additional Notes */}
              <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                Additional details (optional)
              </Text>
              <TextInput
                style={[
                  styles.notesInput,
                  {
                    color: colors.textPrimary,
                    borderColor: colors.border,
                    backgroundColor: colors.backgroundSecondary,
                  },
                ]}
                placeholder="Provide any additional context for moderators..."
                placeholderTextColor={colors.mutedText}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
                maxLength={300}
              />

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: colors.border }]}
                  onPress={handleReset}
                  disabled={submitting}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    { backgroundColor: colors.error, opacity: submitting ? 0.6 : 1 },
                  ]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Report</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 17,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  errorBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
  },
  reasonsList: {
    gap: 8,
    marginBottom: 16,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioFill: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reasonLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 13,
    flex: 1,
  },
  notesLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesInput: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 13,
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 14,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    marginBottom: 8,
  },
  successText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  doneBtn: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  doneBtnText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 14,
  },
});
