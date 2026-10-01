import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SectionList,
  Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { BackButton } from '@/components/BackButton';
import { Loading } from '@/components/Loading';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { Toast, type ToastType } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useTasks } from '@/hooks/useTasks';
import { extractApiError } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { TaskCatalogueItem } from '@/types/task.types';
import type { AuthUser } from '@/types/auth.types';

export default function TaskSelectionScreen() {
  const { groupedCatalogue, tasks, loading, error, loadCatalogue, loadTasks, selectTasks } = useTasks();
  const { updateUser, user } = useAuth();
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
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
      loadCatalogue();
      loadTasks();
    }, [loadCatalogue, loadTasks])
  );

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current && tasks && tasks.length > 0 && groupedCatalogue.length > 0) {
      const initialIds = new Set<string>();
      for (const t of tasks) {
        for (const group of groupedCatalogue) {
          for (const item of group.items) {
            if (item.title === t.title) {
              initialIds.add(item.id);
            }
          }
        }
      }
      setSelectedIds(initialIds);
      hasInitializedRef.current = true;
    }
  }, [tasks, groupedCatalogue]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return groupedCatalogue;
    const q = searchQuery.toLowerCase();
    return groupedCatalogue
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.shortDescription.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groupedCatalogue, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleConfirmSave = async () => {
    if (selectedIds.size === 0) {
      showToastMsg('Please select at least one task to continue', 'error');
      return;
    }
    setSaving(true);
    try {
      await selectTasks(Array.from(selectedIds));
      if (user) {
        updateUser({ ...user, profileCompleted: true } as AuthUser);
      }
      setShowConfirmModal(false);
      router.replace({
        pathname: '/home',
        params: { notice: 'saved' },
      });
    } catch (err) {
      setShowConfirmModal(false);
      showToastMsg(extractApiError(err).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading fullScreen message="Loading services catalogue…" />;
  if (error) return <ErrorState message={error} onRetry={loadCatalogue} />;

  const renderItem = ({ item }: { item: TaskCatalogueItem }) => {
    const selected = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.itemCard, selected && styles.itemCardSelected]}
        onPress={() => toggleSelect(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
          <Text style={[styles.iconText, selected && styles.iconTextSelected]}>✓</Text>
        </View>
        <View style={styles.itemLeft}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemDesc} numberOfLines={2}>
            {item.shortDescription}
          </Text>
        </View>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: { category: string } }) => (
    <View style={styles.categoryHeader}>
      <Text style={styles.categoryTitle}>{section.category}</Text>
    </View>
  );

  const sections = filteredSections.map((g) => ({
    category: g.category,
    data: g.items,
  }));

  return (
    <Screen padded scroll={false}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <ConfirmModal
        visible={showConfirmModal}
        title="Confirm Services Selection"
        message={`You've selected ${selectedIds.size} service(s). Save them to your profile?`}
        confirmText="Save Services"
        cancelText="Cancel"
        loading={saving}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmModal(false)}
      />

      <View style={styles.container}>
        <BackButton />

        <View style={styles.header}>
          <Text style={styles.title}>What do you need help with?</Text>
          <Text style={styles.subtitle}>
            Pick a category, then choose a service. You can add details next.
          </Text>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search services…"
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>Clear</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {sections.length === 0 ? (
          <EmptyState
            title="No services found"
            message={
              searchQuery
                ? `No services match "${searchQuery}"`
                : 'No services available'
            }
            actionLabel={searchQuery ? 'Clear Search' : undefined}
            onAction={searchQuery ? () => setSearchQuery('') : undefined}
          />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.list}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.footer}>
          <Button
            label={
              saving
                ? 'Saving…'
                : selectedIds.size === 0
                ? 'Select Services Above'
                : `Continue (${selectedIds.size})`
            }
            loading={saving}
            onPress={handleConfirmSave}
            disabled={selectedIds.size === 0}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.sm,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs + 2,
    minHeight: 44,
  },
  clearIcon: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  list: {
    paddingBottom: spacing.md,
  },
  categoryHeader: {
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.md,
  },
  itemCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F4FAF7',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSelected: {
    backgroundColor: colors.primary,
  },
  iconText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '700',
  },
  iconTextSelected: {
    color: '#FFFFFF',
  },
  itemLeft: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
});
