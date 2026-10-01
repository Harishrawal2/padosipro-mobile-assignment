import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { BackButton } from '@/components/BackButton';
import { Toast, type ToastType } from '@/components/Toast';

import { taskApi } from '@/api/task.api';
import { extractApiError } from '@/api/client';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import type { TaskStatus } from '@/types/task.types';

export default function CreateTaskScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<TaskStatus>('PENDING');

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToastMsg = (message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      showToastMsg('Task title is required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await taskApi.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        status,
      });
      router.replace({
        pathname: '/home',
        params: { notice: 'created' },
      });
    } catch (err) {
      showToastMsg(extractApiError(err).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <Screen padded scroll={false}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <View style={{ flex: 1 }}>
        <BackButton />
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>Add New Custom Task</Text>
        </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Input
            label="Task Title *"
            placeholder="e.g. Electrical Inspection"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Category (optional)"
            placeholder="e.g. Electrical, Plumbing, Cleaning"
            value={category}
            onChangeText={setCategory}
          />

          <Input
            label="Description (optional)"
            placeholder="Enter additional notes or specifics..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ minHeight: 80 }}
          />

          <View style={styles.statusSection}>
            <Text style={styles.label}>INITIAL STATUS</Text>
            <View style={styles.statusGroup}>
              {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as TaskStatus[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.statusOption, status === s && styles.statusOptionActive]}
                  onPress={() => setStatus(s)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === s && styles.statusOptionTextActive,
                    ]}
                  >
                    {s.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            label={submitting ? 'Creating Task…' : 'Create Task'}
            loading={submitting}
            onPress={handleCreate}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </View>
  </Screen>
);
}



const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  statusSection: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  statusGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  statusOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  statusOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statusOptionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});
