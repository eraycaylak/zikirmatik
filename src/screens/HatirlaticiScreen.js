import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import Background from '../components/Background';
import { colors, radius, spacing } from '../theme';
import { AYETLER } from '../data';
import { getReminders, saveReminders } from '../storage';
import { ensurePermission, scheduleDaily, cancel } from '../notifications';

// Günün ayeti — tarihe göre sabit seçim
function ayetOfDay() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const day = Math.floor((new Date() - start) / 86400000);
  return AYETLER[day % AYETLER.length];
}

const PRAYERS = [
  { key: 'dailyVerse', icon: 'book', title: 'Günlük Ayet Bildirimi', desc: 'Her gün rastgele bir ayet', group: 'daily' },
  { key: 'sabah', icon: 'sunny', title: 'Sabah Namazı Sonrası', desc: 'Sabah zikirlerini çekme zamanı', group: 'prayer' },
  { key: 'ogle', icon: 'time', title: 'Öğle Namazı Sonrası', desc: 'Öğle zikirlerini çekme zamanı', group: 'prayer' },
  { key: 'ikindi', icon: 'time', title: 'İkindi Namazı Sonrası', desc: 'İkindi zikirlerini çekme zamanı', group: 'prayer' },
  { key: 'aksam', icon: 'time', title: 'Akşam Namazı Sonrası', desc: 'Akşam zikirlerini çekme zamanı', group: 'prayer' },
  { key: 'yatsi', icon: 'moon', title: 'Yatsı Namazı Sonrası', desc: 'Yatsı zikirlerini çekme zamanı', group: 'prayer' },
];

export default function HatirlaticiScreen() {
  const [rem, setRem] = useState(null);
  const ayet = ayetOfDay();

  useFocusEffect(useCallback(() => { (async () => setRem(await getReminders()))(); }, []));

  const toggle = async (key, val) => {
    if (val) {
      const ok = await ensurePermission();
      if (!ok) {
        Alert.alert('İzin gerekli', 'Hatırlatıcılar için bildirim izni vermelisiniz.');
        return;
      }
    }
    const item = rem[key];
    const next = { ...rem, [key]: { ...item, enabled: val } };
    setRem(next);
    await saveReminders(next);

    const [h, m] = (item.time || '09:00').split(':').map(Number);
    if (val) {
      const cfg = PRAYERS.find((p) => p.key === key);
      await scheduleDaily(key, h, m, 'Zikirmatik', cfg?.group === 'daily' ? 'Günün ayeti sizi bekliyor 🌿' : `${cfg.title} — zikir vakti 🤲`);
    } else {
      await cancel(key);
    }
  };

  if (!rem) return <Background><SafeAreaView style={{ flex: 1 }} /></Background>;

  const Row = ({ p }) => (
    <View style={styles.row}>
      <View style={[styles.rowIcon, p.group === 'daily' && { backgroundColor: '#FBE6CF' }]}>
        <Ionicons name={p.icon} size={20} color={p.group === 'daily' ? colors.streak : colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{p.title}</Text>
        <Text style={styles.rowDesc}>{rem[p.key].time} • {p.desc}</Text>
      </View>
      <Switch
        value={!!rem[p.key].enabled}
        onValueChange={(v) => toggle(p.key, v)}
        trackColor={{ true: colors.accent, false: colors.border }}
        thumbColor={rem[p.key].enabled ? colors.primary : '#f4f3f4'}
      />
    </View>
  );

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.h1}>Hatırlatıcı</Text>
          <Text style={styles.sub}>Zikir vakitlerini ayarlayın</Text>

          {/* Günün ayeti */}
          <View style={styles.verseCard}>
            <View style={styles.verseHead}>
              <Ionicons name="book" size={18} color={colors.primary} />
              <Text style={styles.verseHeadText}>Günün Ayeti</Text>
            </View>
            <Text style={styles.verseArabic}>{ayet.arabic}</Text>
            <Text style={styles.verseTr}>“{ayet.turkish}”</Text>
            <Text style={styles.verseSrc}>{ayet.source}</Text>
          </View>

          <Text style={styles.section}>Günlük Bildirimler</Text>
          <View style={styles.card}><Row p={PRAYERS[0]} /></View>

          <Text style={styles.section}>Namaz Sonrası Hatırlatıcılar</Text>
          <View style={styles.card}>
            {PRAYERS.slice(1).map((p, i) => (
              <View key={p.key}>
                {i > 0 && <View style={styles.sep} />}
                <Row p={p} />
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 30, fontWeight: '800', color: colors.textDark },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  verseCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.primary, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  verseHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  verseHeadText: { fontWeight: '800', color: colors.primary },
  verseArabic: { fontSize: 24, color: colors.primary, textAlign: 'right', lineHeight: 42 },
  verseTr: { fontSize: 15, color: colors.text, fontStyle: 'italic', marginTop: spacing.md },
  verseSrc: { fontSize: 13, color: colors.textMuted, fontWeight: '700', marginTop: 6 },
  section: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginTop: spacing.lg, marginBottom: spacing.sm },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.xs, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  rowIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  rowDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  sep: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
});
