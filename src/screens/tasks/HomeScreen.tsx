import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { TaskCard } from '@/components/TaskCard';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { Toast, type ToastType } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth.api';
import { storage } from '@/utils/storage';
import { colors } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import type { Task } from '@/types/task.types';

export default function HomeScreen() {
  const router = useRouter();
  const { notice } = useLocalSearchParams<{ notice?: string }>();
  const { tasks, loading, error, loadTasks } = useTasks();
  const { user, setUnauthenticated } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToastMsg = (message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => {
      if (notice === 'deleted') {
        showToastMsg('Task deleted successfully', 'delete');
      } else if (notice === 'created') {
        showToastMsg('Custom task created successfully', 'success');
      } else if (notice === 'saved') {
        showToastMsg('Services saved to profile', 'success');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [notice]);


  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning ☀️';
    if (hour >= 12 && hour < 17) return 'Good Afternoon 🌤️';
    if (hour >= 17 && hour < 22) return 'Good Evening 🌆';
    return 'Good Night 🌙';
  };

  const confirmLogout = async () => {
    setLoggingOut(true);
    try {
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Best-effort logout
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
      await setUnauthenticated();
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TaskCard
      task={item}
      onPress={() =>
        router.push({
          pathname: '/task-detail',
          params: { id: item.id },
        })
      }
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          My Tasks
          {tasks.length > 0 ? (
            <Text style={styles.taskCount}> ({tasks.length})</Text>
          ) : null}
        </Text>

        <View style={styles.headerButtonsRow}>
          <TouchableOpacity
            style={styles.addCustomBtn}
            onPress={() => router.push('/create-task')}
            activeOpacity={0.7}
          >
            <Text style={styles.addCustomBtnText}>+ Custom Task</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addTasksBtn}
            onPress={() => router.push('/task-selection')}
            activeOpacity={0.7}
          >
            <Text style={styles.addTasksBtnText}>+ Add Services</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) return <Loading fullScreen message="Loading your tasks…" />;

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <ConfirmModal
        visible={showLogoutModal}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.profileGreetingCol}
          onPress={() => router.push('/profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.greeting}>
            Hello, {user?.name?.split(' ')[0] ?? 'there'} 👋
          </Text>
          <Text style={styles.subGreeting}>
            {getGreeting()}
          </Text>
        </TouchableOpacity>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push('/account')}
          >
            <Text style={styles.profileBtnText}>Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Task list */}
      {error ? (
        <ErrorState message={error} onRetry={loadTasks} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState
              title="No tasks selected"
              message="You haven't added any tasks yet. Browse catalogue services or create your own custom task."
              actionLabel="+ Select Services"
              onAction={() => router.push('/task-selection')}
            />
          }
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl + spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileGreetingCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  subGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  profileBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  profileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: spacing.md,
  },
  listHeader: {
    gap: spacing.sm,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  taskCount: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  headerButtonsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  addCustomBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCustomBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  addTasksBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTasksBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
