import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Background from '../components/Background';
import { colors, radius, spacing } from '../theme';
import { ZIKIRLER, ESMA } from '../data';
import {
  getCounts, getTodayTotal, getWeekTotal, getWeeklySeries,
  getTodayBreakdown, getCustomZikirler, resetAllProgress,
} from '../storage';

export default function StatsScreen() {
  const [today, setToday] = useState(0);
  const [week, setWeek] = useState(0);
  const [total, setTotal] = useState(0);
  const [series, setSeries] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [custom, setCustom] = useState([]);

  const load = useCallback(async () => {
    const counts = await getCounts();
    setTotal(Object.values(counts).reduce((a, b) => a + b, 0));
    setToday(await getTodayTotal());
    setWeek(await getWeekTotal());
    setSeries(await getWeeklySeries());
    setBreakdown(await getTodayBreakdown());
    setCustom(await getCustomZikirler());
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const nameOf = (id) => {
    const z = ZIKIRLER.find((x) => x.id === id);
    if (z) return z.name;
    if (String(id).startsWith('esma_')) return ESMA.find((e) => `esma_${e.id}` === id)?.name || id;
    return custom.find((c) => c.id === id)?.name || id;
  };

  const reset = () => {
    Alert.alert('Emin misiniz?', 'Tüm sayaç ve istatistikler silinecek. Geri alınamaz.', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sıfırla', style: 'destructive', onPress: async () => { await resetAllProgress(); load(); } },
    ]);
  };

  const maxBar = Math.max(1, ...series.map((s) => s.total));

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.h1}>İstatistik</Text>
              <Text style={styles.sub}>Zikir istatistikleriniz</Text>
            </View>
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Ionicons name="trash" size={18} color={colors.danger} />
              <Text style={styles.resetText}>Sıfırla</Text>
            </TouchableOpacity>
          </View>

          {/* 3 kart */}
          <View style={styles.cardsRow}>
            <LinearGradient colors={['#1E3D1F', '#2E5E32']} style={styles.gCard}>
              <Ionicons name="today" size={22} color="rgba(255,255,255,0.9)" />
              <Text style={styles.gNum}>{today.toLocaleString('tr-TR')}</Text>
              <Text style={styles.gLabel}>Bugün</Text>
            </LinearGradient>
            <LinearGradient colors={['#2E5E32', '#4A7C4E']} style={styles.gCard}>
              <Ionicons name="calendar" size={22} color="rgba(255,255,255,0.9)" />
              <Text style={styles.gNum}>{week.toLocaleString('tr-TR')}</Text>
              <Text style={styles.gLabel}>Bu Hafta</Text>
            </LinearGradient>
            <LinearGradient colors={['#4A7C4E', '#7BA77E']} style={styles.gCard}>
              <Ionicons name="infinite" size={22} color="rgba(255,255,255,0.9)" />
              <Text style={styles.gNum}>{total.toLocaleString('tr-TR')}</Text>
              <Text style={styles.gLabel}>Toplam</Text>
            </LinearGradient>
          </View>

          {/* Haftalık grafik */}
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Haftalık Görünüm</Text>
            <View style={styles.chart}>
              {series.map((s, i) => (
                <View key={i} style={styles.barCol}>
                  {s.isToday && s.total > 0 && <Text style={styles.barValue}>{s.total}</Text>}
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${(s.total / maxBar) * 100}%`, backgroundColor: s.isToday ? colors.primary : colors.primarySoft }]} />
                  </View>
                  <Text style={[styles.barDay, s.isToday && { color: colors.primary, fontWeight: '800' }]}>{s.day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bugünkü zikirler */}
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Bugünkü Zikirler</Text>
            {breakdown.length === 0 && <Text style={styles.empty}>Bugün henüz zikir çekmediniz.</Text>}
            {breakdown.map((item, i) => {
              const pct = today > 0 ? Math.round((item.total / today) * 100) : 0;
              return (
                <View key={item.id} style={styles.bItem}>
                  <View style={styles.bTop}>
                    <View style={styles.rank}><Text style={styles.rankText}>{i + 1}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bName} numberOfLines={1}>{nameOf(item.id)}</Text>
                      <Text style={styles.bCount}>{item.total} zikir</Text>
                    </View>
                    <Text style={styles.bPct}>{pct}%</Text>
                  </View>
                  <View style={styles.bTrack}><View style={[styles.bFill, { width: `${pct}%` }]} /></View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  h1: { fontSize: 30, fontWeight: '800', color: colors.textDark },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.dangerSoft, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 },
  resetText: { color: colors.danger, fontWeight: '700', fontSize: 13 },
  cardsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  gCard: { flex: 1, borderRadius: radius.lg, padding: spacing.md, alignItems: 'flex-start', gap: 6 },
  gNum: { fontSize: 26, fontWeight: '800', color: colors.white },
  gLabel: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  panel: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  panelTitle: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginBottom: spacing.md },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 180 },
  barCol: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barValue: { fontSize: 12, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  barTrack: { width: 22, flex: 1, backgroundColor: 'transparent', borderRadius: 11, justifyContent: 'flex-end', overflow: 'hidden', maxHeight: 130 },
  barFill: { width: '100%', borderRadius: 11, minHeight: 6 },
  barDay: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  bItem: { marginBottom: spacing.md },
  bTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rank: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontWeight: '800', color: colors.primary, fontSize: 13 },
  bName: { fontWeight: '700', color: colors.textDark },
  bCount: { fontSize: 12, color: colors.textMuted },
  bPct: { fontWeight: '800', color: colors.primary },
  bTrack: { height: 8, backgroundColor: colors.primarySoft, borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  bFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  empty: { color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
});
