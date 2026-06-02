import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Background from '../components/Background';
import CircleCounter from '../components/CircleCounter';
import { colors, radius, spacing } from '../theme';
import { useApp } from '../appContext';
import { ZIKIRLER } from '../data';
import { recordCount, getTodayTotal, getWeekTotal, getStreak, getSettings } from '../storage';

export default function HomeScreen({ navigation }) {
  const { selectedZikir, selectZikir } = useApp();
  const [count, setCount] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [auto, setAuto] = useState(false);
  const settingsRef = useRef({ vibration: true });
  const autoRef = useRef(null);

  const target = selectedZikir?.targetCount || 33;

  const reload = useCallback(async () => {
    setTodayTotal(await getTodayTotal());
    setWeekTotal(await getWeekTotal());
    setStreak(await getStreak());
    settingsRef.current = await getSettings();
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));
  useEffect(() => { setCount(0); }, [selectedZikir]);
  useEffect(() => () => clearInterval(autoRef.current), []);

  const doIncrement = useCallback(async () => {
    setCount((c) => {
      const next = c + 1;
      if (settingsRef.current?.vibration !== false) {
        if (next % target === 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return next;
    });
    const res = await recordCount(selectedZikir.id, 1);
    setTodayTotal(res.todayTotal);
    setWeekTotal(await getWeekTotal());
  }, [selectedZikir, target]);

  const undo = async () => {
    if (count <= 0) return;
    setCount((c) => Math.max(0, c - 1));
    const res = await recordCount(selectedZikir.id, -1);
    setTodayTotal(res.todayTotal);
    setWeekTotal(await getWeekTotal());
  };

  const resetTur = () => {
    setCount(0);
    if (settingsRef.current?.vibration !== false) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const toggleAuto = () => {
    if (auto) {
      clearInterval(autoRef.current);
      setAuto(false);
    } else {
      setAuto(true);
      autoRef.current = setInterval(doIncrement, 1200);
    }
  };

  const switchZikir = (dir) => {
    const idx = ZIKIRLER.findIndex((z) => z.id === selectedZikir.id);
    const base = idx < 0 ? 0 : idx;
    const next = (base + dir + ZIKIRLER.length) % ZIKIRLER.length;
    selectZikir(ZIKIRLER[next]);
  };

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Üst bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.topIcon} onPress={() => navigation.navigate('GeceModu')}>
              <Ionicons name="moon-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.brand}>
              <Ionicons name="moon" size={14} color={colors.primary} style={{ transform: [{ rotate: '20deg' }] }} />
              <Text style={styles.brandText}>ZİKİRMATİK</Text>
            </View>
            <TouchableOpacity style={styles.topIcon} onPress={() => navigation.navigate('İstatistik')}>
              <Ionicons name="stats-chart" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Seçili zikir pill */}
          <TouchableOpacity style={styles.zikirPill} activeOpacity={0.85} onPress={() => navigation.navigate('Zikirler')}>
            <View style={styles.swapCircle}>
              <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.zikirName} numberOfLines={1}>{selectedZikir.name}</Text>
              <Text style={styles.zikirSub}>{target} defa</Text>
            </View>
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥 {streak} gün</Text>
              </View>
            )}
            <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <Text style={styles.kaaba}>🕋</Text>

          {/* Sayaç + yan oklar */}
          <View style={styles.counterRow}>
            <TouchableOpacity style={styles.chevron} onPress={() => switchZikir(-1)}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <CircleCounter count={count} target={target} onPress={doIncrement} size={250} />
            <TouchableOpacity style={styles.chevron} onPress={() => switchZikir(1)}>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Aksiyon butonları */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.sideBtn} onPress={resetTur}>
              <Ionicons name="refresh" size={22} color={colors.primary} />
              <Text style={styles.sideLabel}>Sıfırla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.plusBtn} onPress={doIncrement} activeOpacity={0.85}>
              <Ionicons name="add" size={44} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.sideBtn} onPress={undo}>
              <Ionicons name="arrow-undo" size={22} color={colors.primary} />
              <Text style={styles.sideLabel}>Geri Al</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>👆 Yuvarlağa veya + butonuna dokun</Text>

          {/* Oto sayım */}
          <TouchableOpacity style={[styles.autoBtn, auto && styles.autoBtnActive]} onPress={toggleAuto}>
            <Ionicons name={auto ? 'pause' : 'play'} size={16} color={auto ? colors.white : colors.primary} />
            <Text style={[styles.autoText, auto && { color: colors.white }]}>Oto Sayım</Text>
          </TouchableOpacity>

          {/* Bugün / Bu hafta kartı */}
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('İstatistik')} activeOpacity={0.85}>
            <View style={styles.calIcon}><Ionicons name="calendar" size={22} color={colors.white} /></View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Bugün</Text>
              <Text style={styles.statValue}>{todayTotal.toLocaleString('tr-TR')} <Text style={styles.statUnit}>zikir</Text></Text>
            </View>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Bu hafta</Text>
              <Text style={styles.statValue}>{weekTotal.toLocaleString('tr-TR')} <Text style={styles.statUnit}>zikir</Text></Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg, alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingVertical: spacing.sm },
  topIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandText: { fontSize: 18, fontWeight: '800', color: colors.primary, letterSpacing: 2 },
  zikirPill: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.pill, padding: spacing.sm, paddingRight: spacing.md, width: '100%', marginTop: spacing.sm, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  swapCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  zikirName: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  zikirSub: { fontSize: 12, color: colors.textMuted },
  streakBadge: { backgroundColor: colors.streakSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  streakText: { color: colors.streak, fontWeight: '700', fontSize: 12 },
  kaaba: { fontSize: 26, marginTop: spacing.md },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  chevron: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', marginHorizontal: -8, zIndex: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.lg },
  sideBtn: { alignItems: 'center', gap: 4, width: 64 },
  sideLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  plusBtn: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primaryDark, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: spacing.lg },
  autoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 1.5, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 10, marginTop: spacing.md },
  autoBtnActive: { backgroundColor: colors.primary },
  autoText: { color: colors.primary, fontWeight: '700' },
  statCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, width: '100%', marginTop: spacing.lg, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  calIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  statCol: { flex: 1 },
  statLabel: { fontSize: 12, color: colors.textMuted },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  statUnit: { fontSize: 12, fontWeight: '400', color: colors.textMuted },
});
