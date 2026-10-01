import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { Screen } from '@/components/Screen';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth.api';
import { storage } from '@/utils/storage';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function AccountScreen() {
  const { user, setUnauthenticated } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

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
      <ConfirmModal
        visible={showLogoutModal}
        title="Sign Out"
        message="Are you sure you want to sign out of your PadosiPro account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        loading={loggingOut}
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <BackButton />

          <View style={styles.header}>
            <Text style={styles.title}>Account</Text>
          </View>

          <View style={styles.cardsList}>
            {/* Card 1: Signed in as */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Signed in as</Text>
              <Text style={styles.signedInNumber}>
                {user?.mobileNumber ? `+91 ${user.mobileNumber}` : user?.email || 'Authenticated User'}
              </Text>
            </View>

            {/* Card 2: Your Profile Info */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Your Profile</Text>
              <Text style={styles.lmTitle}>{user?.name || 'PadosiPro User'}</Text>
              <Text style={styles.lmSubtitle}>{user?.businessName || 'Business Owner'}</Text>
              {user?.address ? <Text style={styles.lmNotes}>Address: {user.address}</Text> : null}
              {user?.email ? <Text style={styles.lmNotes}>Email: {user.email}</Text> : null}
            </View>

            {/* Card 3: Household */}
            <View style={[styles.card, styles.householdRow]}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>👥</Text>
              </View>
              <View style={styles.householdContent}>
                <Text style={styles.householdTitle}>Household</Text>
                <Text style={styles.householdSubtitle}>
                  Family members your LM should know about
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>

            {/* Card 4: Wallet */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Wallet</Text>
              <Text style={styles.walletTitle}>Coming soon</Text>
              <Text style={styles.walletSubtitle}>
                Wallet top-up isn&apos;t turned on yet. Your Lifestyle Manager can still handle requests and send you the bill directly in the meantime.
              </Text>
            </View>

            {/* Sign Out Button */}
            <Button
              label="Sign Out"
              variant="outline"
              onPress={() => setShowLogoutModal(true)}
              style={styles.signOutBtn}
            />
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  cardsList: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  signedInNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  lmTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  lmSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  lmNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  householdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E6F4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    color: colors.primary,
  },
  householdContent: {
    flex: 1,
  },
  householdTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  householdSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    color: colors.textTertiary,
    fontWeight: '400',
  },
  walletTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  walletSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  signOutBtn: {
    marginTop: spacing.sm,
    borderColor: colors.error,
  },
});
