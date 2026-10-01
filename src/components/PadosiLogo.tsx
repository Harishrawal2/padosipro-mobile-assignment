import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';

interface PadosiLogoProps {
  showText?: boolean;
  size?: number;
}

export function PadosiLogo({ showText = true, size = 56 }: PadosiLogoProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.logoBox, { width: size, height: size, borderRadius: size * 0.28 }]}>
        <View style={styles.roofShape}>
          <Text style={styles.logoSymbol}>▲</Text>
        </View>
      </View>
      {showText ? <Text style={styles.brandText}>PadosiPro</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logoBox: {
    backgroundColor: '#073B2C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roofShape: {
    width: '60%',
    height: '60%',
    borderRadius: 8,
    backgroundColor: 'rgba(141, 170, 157, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#8DAA9D',
  },
  logoSymbol: {
    fontSize: 16,
    color: '#E6F4EE',
    fontWeight: '900',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
  },
});
