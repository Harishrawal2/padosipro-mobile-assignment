import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';

interface BackButtonProps {
  onPress?: () => void;
  title?: string;
  style?: ViewStyle;
}

export function BackButton({ onPress, title = 'Back', style }: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/home');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={styles.icon}>‹</Text>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingRight: 12,
    marginBottom: 16,
    gap: 4,
  },
  icon: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 22,
    marginTop: -2,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    lineHeight: 22,
  },
});
