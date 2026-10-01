import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { BackButton } from '@/components/BackButton';
import { Toast, type ToastType } from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import { userApi } from '@/api/user.api';
import { authApi } from '@/api/auth.api';
import { storage } from '@/utils/storage';
import { extractApiError } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { profileSchema, type ProfileFormData } from '@/utils/validation';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { AuthUser } from '@/types/auth.types';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser, setUnauthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(!user?.profileCompleted);
  const [submitting, setSubmitting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [toast, setToast] = useState<{ visible: boolean; message: string; type: ToastType }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showToastMsg = (message: string, type: ToastType = 'success') => {
    setToast({ visible: true, message, type });
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      mobileNumber: user?.mobileNumber ?? '',
      address: user?.address ?? '',
      businessName: user?.businessName ?? '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setSubmitting(true);
    try {
      const response = await userApi.updateProfile({
        name: data.name,
        mobileNumber: data.mobileNumber,
        address: data.address,
        businessName: data.businessName || undefined,
      });

      updateUser({
        ...response.data,
        isVerified: user?.isVerified ?? true,
      } as AuthUser);

      showToastMsg('Profile saved successfully!', 'success');
      setIsEditing(false);

      if (!user?.profileCompleted) {
        setTimeout(() => {
          router.replace('/task-selection');
        }, 800);
      }
    } catch (err) {
      showToastMsg(extractApiError(err).message, 'error');
    } finally {
      setSubmitting(false);
    }
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

  return (
    <Screen padded scroll={false}>
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

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {user?.profileCompleted ? <BackButton /> : null}

          <View style={styles.header}>
            <Text style={styles.title}>
              {user?.profileCompleted ? 'My Profile' : 'A few details'}
            </Text>
            <Text style={styles.subtitle}>
              {user?.profileCompleted
                ? 'Manage your account details and preferences.'
                : 'So your Lifestyle Manager can coordinate visits and deliveries smoothly.'}
            </Text>
          </View>

          {!isEditing && user?.profileCompleted ? (
            <View style={styles.card}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Full Name</Text>
                <Text style={styles.detailValue}>{user.name || 'Not provided'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mobile Number</Text>
                <Text style={styles.detailValue}>{user.mobileNumber || 'Not provided'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{user.address || 'Not provided'}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Business Name</Text>
                <Text style={styles.detailValue}>{user.businessName || 'None'}</Text>
              </View>

              <Button
                label="Edit Profile"
                onPress={() => setIsEditing(true)}
                style={styles.actionBtn}
              />

              <TouchableOpacity
                style={styles.logoutRow}
                onPress={() => setShowLogoutModal(true)}
              >
                <Text style={styles.logoutRowText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name *"
                    placeholder="As you would like us to use"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="mobileNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Mobile Number *"
                    placeholder="e.g. 9876543210"
                    keyboardType="phone-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.mobileNumber?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Address & Area *"
                    placeholder="Road, area, landmark"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.address?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="businessName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Business / Building Name (optional)"
                    placeholder="e.g. Sharma Electronics or Gate Tower"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.businessName?.message}
                  />
                )}
              />
            </View>
          )}
        </ScrollView>

        {(isEditing || !user?.profileCompleted) ? (
          <View style={styles.footerContainer}>
            {!user?.profileCompleted ? (
              <Text style={styles.helperText}>Enter your details to continue.</Text>
            ) : null}
            <Button
              label={submitting ? 'Saving…' : 'Save & Continue'}
              loading={submitting}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
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
  },
  form: {
    gap: spacing.xs,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: spacing.sm,
  },
  detailRow: {
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actionBtn: {
    marginTop: spacing.md,
  },
  logoutRow: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  logoutRowText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  footerContainer: {
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
  },
});
