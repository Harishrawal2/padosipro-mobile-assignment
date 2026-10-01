import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { BackButton } from '@/components/BackButton';
import { PadosiLogo } from '@/components/PadosiLogo';
import { authApi } from '@/api/auth.api';
import { extractApiError } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { setAuthenticated } = useAuth();

  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setApiError('Please enter the 6-digit OTP');
      return;
    }
    if (!email) {
      setApiError('Email is missing. Please go back and try again.');
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      const response = await authApi.verifyOtp(email, otp);
      await setAuthenticated(
        response.data.user,
        response.data.accessToken,
        response.data.refreshToken
      );
    } catch (err) {
      const { message } = extractApiError(err);
      setApiError(message);
      setOtp('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || countdown > 0) return;
    setResending(true);
    setApiError(null);
    try {
      await authApi.resendOtp(email);
      setCountdown(RESEND_COOLDOWN);
    } catch (err) {
      const { message } = extractApiError(err);
      setApiError(message);
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(digits);
    if (apiError) setApiError(null);
  };

  return (
    <Screen padded>
      <View style={styles.container}>
        <View>
          <BackButton />
          <PadosiLogo showText={false} size={52} />

          <View style={styles.header}>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.subtitle}>
              We&apos;ve sent a code to <Text style={styles.emailText}>{email || 'your email'}</Text>. It expires in 10 minutes.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.fieldLabel}>6-digit code</Text>
            
            <TouchableOpacity
              style={styles.otpInputWrapper}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
            >
              <TextInput
                ref={inputRef}
                value={otp}
                onChangeText={handleOtpChange}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                style={styles.otpInputText}
                autoFocus
                placeholder="Enter 6-digit code"
                placeholderTextColor={colors.textTertiary}
              />
            </TouchableOpacity>

            <View style={styles.resendRow}>
              {countdown > 0 ? (
                <Text style={styles.countdownText}>Resend in {countdown}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend} disabled={resending}>
                  <Text style={styles.resendLink}>
                    {resending ? 'Sending…' : 'Resend code'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {apiError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{apiError}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            label={submitting ? 'Verifying…' : 'Verify OTP'}
            loading={submitting}
            onPress={handleVerify}
            disabled={otp.length !== OTP_LENGTH}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.xs,
    justifyContent: 'space-between',
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
  emailText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  form: {
    marginTop: spacing.xs,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  otpInputWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 52,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  otpInputText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 6,
  },
  resendRow: {
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  countdownText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  errorBox: {
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  footer: {
    paddingVertical: spacing.md,
  },
});
