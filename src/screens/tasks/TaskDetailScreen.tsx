import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { Toast, type ToastType } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import { taskApi } from '@/api/task.api';
import { extractApiError } from '@/api/client';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import type { Task, TaskStatus } from '@/types/task.types';

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<TaskStatus>('PENDING');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Toast State
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToastMsg = (message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  };

  const loadTask = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await taskApi.getTaskById(id);
      setTask(data.data);
      setTitle(data.data.title);
      setDescription(data.data.description || '');
      setCategory(data.data.category || '');
      setStatus(data.data.status);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      loadTask();
    }, 0);
    return () => clearTimeout(timer);
  }, [id]);


  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!id || !task || task.status === newStatus) return;
    try {
      const updated = await taskApi.updateTask(id, { status: newStatus });
      setTask(updated.data);
      setStatus(newStatus);
      showToastMsg(`Status updated to ${newStatus.replace('_', ' ')}!`, 'success');
    } catch (err) {
      showToastMsg(extractApiError(err).message, 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!id || !title.trim()) {
      showToastMsg('Task title cannot be empty', 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await taskApi.updateTask(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        status,
      });
      setTask(updated.data);
      setIsEditing(false);
      showToastMsg('Task updated successfully!', 'success');
    } catch (err) {
      showToastMsg(extractApiError(err).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteTask = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await taskApi.deleteTask(id);
      setShowDeleteModal(false);
      router.replace({
        pathname: '/(app)/home',
        params: { notice: 'deleted' },
      });
    } catch (err) {
      setShowDeleteModal(false);
      showToastMsg(extractApiError(err).message, 'error');
      setDeleting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/home');
    }
  };

  if (loading) return <Loading fullScreen message="Loading task details…" />;
  if (error || !task) {
    return (
      <Screen scroll={false} padded={false}>
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={{ width: 64 }} />
        </View>
        <ErrorState message={error || 'Task not found'} onRetry={loadTask} />
      </Screen>
    );
  }

  const getStatusColor = (s: TaskStatus) => {
    switch (s) {
      case 'COMPLETED':
        return { bg: '#DEF7EC', text: '#03543F' };
      case 'IN_PROGRESS':
        return { bg: '#E1EFFE', text: '#1E429F' };
      default:
        return { bg: '#FEF08A', text: '#854D0E' };
    }
  };

  const currentStatusStyle = getStatusColor(task.status);

  return (
    <Screen scroll={false} padded={false}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDeleteTask}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Prominent Fixed Top Navigation Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Home</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{isEditing ? 'Edit Task' : 'Task Details'}</Text>

        <TouchableOpacity
          style={styles.editToggleBtn}
          onPress={() => setIsEditing(!isEditing)}
          activeOpacity={0.7}
        >
          <Text style={styles.editToggleText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {!isEditing ? (
          /* View Task Mode */
          <View style={styles.card}>
            {/* Category Chip & Status Badge */}
            <View style={styles.badgeRow}>
              {task.category ? (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{task.category}</Text>
                </View>
              ) : <View />}

              <View style={[styles.statusBadge, { backgroundColor: currentStatusStyle.bg }]}>
                <Text style={[styles.statusText, { color: currentStatusStyle.text }]}>
                  {task.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.taskTitle}>{task.title}</Text>

            {/* Description */}
            <View style={styles.descSection}>
              <Text style={styles.sectionLabel}>DESCRIPTION</Text>
              <Text style={styles.descText}>
                {task.description || 'No detailed description provided for this task.'}
              </Text>
            </View>

            {/* Status Switcher Buttons */}
            <View style={styles.statusSwitchSection}>
              <Text style={styles.sectionLabel}>UPDATE STATUS</Text>
              <View style={styles.statusButtonGroup}>
                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    task.status === 'PENDING' && styles.statusOptionActive,
                  ]}
                  onPress={() => handleStatusChange('PENDING')}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      task.status === 'PENDING' && styles.statusOptionTextActive,
                    ]}
                  >
                    Pending
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    task.status === 'IN_PROGRESS' && styles.statusOptionActive,
                  ]}
                  onPress={() => handleStatusChange('IN_PROGRESS')}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      task.status === 'IN_PROGRESS' && styles.statusOptionTextActive,
                    ]}
                  >
                    In Progress
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusOption,
                    task.status === 'COMPLETED' && styles.statusOptionActive,
                  ]}
                  onPress={() => handleStatusChange('COMPLETED')}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      task.status === 'COMPLETED' && styles.statusOptionTextActive,
                    ]}
                  >
                    Completed
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Details */}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.metaText}>
                Updated: {new Date(task.updatedAt).toLocaleDateString()}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionGroup}>
              <Button
                label="Edit Details"
                onPress={() => setIsEditing(true)}
                variant="outline"
                style={styles.editBtn}
              />
              <Button
                label={deleting ? 'Deleting…' : 'Delete Task'}
                loading={deleting}
                onPress={() => setShowDeleteModal(true)}
                variant="outline"
                style={styles.deleteBtn}
              />
            </View>
          </View>
        ) : (
          /* Edit Task Mode */
          <View style={styles.card}>
            <Input
              label="Task Title *"
              placeholder="e.g. Plumbing Repair"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="Category"
              placeholder="e.g. Maintenance, Cleaning, Repair"
              value={category}
              onChangeText={setCategory}
            />

            <Input
              label="Description"
              placeholder="Add task details or notes..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={{ minHeight: 80 }}
            />

            <View style={styles.statusSwitchSection}>
              <Text style={styles.sectionLabel}>STATUS</Text>
              <View style={styles.statusButtonGroup}>
                {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as TaskStatus[]).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusOption,
                      status === s && styles.statusOptionActive,
                    ]}
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
              label={saving ? 'Saving…' : 'Save Changes'}
              loading={saving}
              onPress={handleSaveEdit}
              style={styles.saveBtn}
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  editToggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  editToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 28,
  },
  descSection: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 0.8,
  },
  descText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  statusSwitchSection: {
    gap: spacing.xs,
  },
  statusButtonGroup: {
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  actionGroup: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  editBtn: {
    width: '100%',
  },
  deleteBtn: {
    width: '100%',
  },
  saveBtn: {
    marginTop: spacing.md,
  },
});
