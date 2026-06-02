import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme';

// Halka şeklinde sayaç (beyaz dolgu, yeşil ilerleme halkası)
export default function CircleCounter({ count, target, onPress, size = 250, dark = false }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = Math.min((count % target || (count > 0 ? target : 0)) / target, 1);
  const dash = c * progress;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ width: size, height: size }, pressed && { transform: [{ scale: 0.98 }] }]}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={dark ? '#222' : colors.border} strokeWidth={stroke} fill={dark ? 'transparent' : colors.card} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={dark ? '#3E7A42' : colors.primary}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.num, dark && { color: colors.nightText, fontSize: size * 0.34 }]}>{count}</Text>
        <View style={styles.labelRow}>
          {!dark && <View style={styles.dash} />}
          <Text style={[styles.label, dark && { color: colors.nightMuted }]}>
            {dark ? `/ ${target}` : 'zikir'}
          </Text>
          {!dark && <View style={styles.dash} />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  num: { fontSize: 84, fontWeight: '300', color: colors.primary },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -4 },
  label: { fontSize: 16, color: colors.textMuted, letterSpacing: 1 },
  dash: { width: 18, height: 1, backgroundColor: colors.textLight },
});
