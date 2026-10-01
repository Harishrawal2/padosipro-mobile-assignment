import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { PadosiLogo } from '@/components/PadosiLogo';
import { authApi } from '@/api/auth.api';
import { extractApiError } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/utils/validation';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const { setAuthenticated } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitting(true);
    setApiError(null);
    try {
      const response = await authApi.login(data.email, data.password);
      await setAuthenticated(
        response.data.user,
        response.data.accessToken,
        response.data.refreshToken
      );
    } catch (err) {
      const { message, code } = extractApiError(err);
      if (code === 'EMAIL_NOT_VERIFIED') {
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { email: data.email },
        });
        return;
      }
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen padded>
      <View style={styles.content}>
        <View>
          <PadosiLogo showText size={56} />

          <View style={styles.header}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Sign in to your PadosiPro account to manage services and tasks.
            </Text>
          </View>

          <View style={styles.form}>
            {apiError ? (
              <View style={styles.apiError}>
                <Text style={styles.apiErrorText}>{apiError}</Text>
              </View>
            ) : null}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <Button
              label={submitting ? 'Signing In…' : 'Sign In'}
              loading={submitting}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
            <Text style={styles.footerLink}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: spacing.md,
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
  form: {
    gap: spacing.xs,
  },
  apiError: {
    backgroundColor: colors.errorLight,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  apiErrorText: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
