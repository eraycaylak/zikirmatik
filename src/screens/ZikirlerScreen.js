import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Background from '../components/Background';
import { colors, radius, spacing } from '../theme';
import { ZIKIRLER, ESMA, CATEGORIES } from '../data';
import { useApp } from '../appContext';

const esmaToZikir = (e) => ({
  id: `esma_${e.id}`,
  name: e.name,
  arabicName: e.arabic,
  targetCount: e.recommendedCount || 33,
  description: e.meaning,
  benefit: e.benefit,
  category: 'esma',
});

export default function ZikirlerScreen({ navigation }) {
  const { selectedZikir, selectZikir } = useApp();
  const [seg, setSeg] = useState('zikirler');
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');

  let list = seg === 'zikirler'
    ? (cat === 'all' ? ZIKIRLER : ZIKIRLER.filter((z) => z.category === cat))
    : ESMA.map(esmaToZikir);

  if (query.trim()) {
    const q = query.toLocaleLowerCase('tr-TR');
    list = list.filter((z) => z.name.toLocaleLowerCase('tr-TR').includes(q));
  }

  const onCardPress = async (z) => {
    if (selectedZikir?.id === z.id) {
      navigation.navigate('Ana Sayfa');
    } else {
      await selectZikir(z);
    }
  };

  const renderItem = ({ item }) => {
    const active = selectedZikir?.id === item.id;
    return (
      <TouchableOpacity style={[styles.card, active && styles.cardActive]} activeOpacity={0.85} onPress={() => onCardPress(item)}>
        <View style={styles.cardTop}>
          <View style={styles.cardHead}>
            <Text style={styles.cardArabic} numberOfLines={2}>{item.arabicName}</Text>
            {active && <View style={styles.activeTag}><Text style={styles.activeTagText}>Aktif</Text></View>}
          </View>
        </View>
        <Text style={styles.cardName}>{item.name}</Text>
        {!!item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
        <View style={styles.cardBottom}>
          {!!item.benefit && <Text style={styles.cardBenefit} numberOfLines={2}>✦ {item.benefit}</Text>}
          <View style={styles.targetBadge}>
            <Ionicons name="repeat" size={13} color={colors.primary} />
            <Text style={styles.targetText}>{item.targetCount}x</Text>
          </View>
        </View>
        {active && (
          <TouchableOpacity style={styles.selectedBtn} onPress={() => navigation.navigate('Ana Sayfa')}>
            <Ionicons name="checkmark-circle" size={18} color={colors.white} />
            <Text style={styles.selectedText}>Seçili zikir</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={styles.headerWrap}>
          <Text style={styles.h1}>Zikirler</Text>
          <Text style={styles.sub}>Zikir seçin ve çekmeye başlayın</Text>

          {/* Segment */}
          <View style={styles.segment}>
            <TouchableOpacity style={[styles.segBtn, seg === 'zikirler' && styles.segActive]} onPress={() => setSeg('zikirler')}>
              <Ionicons name="list" size={16} color={seg === 'zikirler' ? colors.white : colors.primary} />
              <Text style={[styles.segText, seg === 'zikirler' && styles.segTextActive]}>Zikirler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.segBtn, seg === 'esma' && styles.segActive]} onPress={() => setSeg('esma')}>
              <Ionicons name="star" size={16} color={seg === 'esma' ? colors.white : colors.primary} />
              <Text style={[styles.segText, seg === 'esma' && styles.segTextActive]}>99 İsim</Text>
            </TouchableOpacity>
          </View>

          {/* Kategori çipleri */}
          {seg === 'zikirler' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.md }}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity key={c.id} style={[styles.chip, cat === c.id && styles.chipActive]} onPress={() => setCat(c.id)}>
                  <Text style={[styles.chipText, cat === c.id && styles.chipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  h1: { fontSize: 30, fontWeight: '800', color: colors.textDark },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  segment: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  segBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  segActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  segText: { color: colors.primary, fontWeight: '700' },
  segTextActive: { color: colors.white },
  chipScroll: { marginTop: spacing.md, flexGrow: 0 },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: colors.white },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 2 },
  cardTop: { flexDirection: 'row' },
  cardHead: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-start', gap: spacing.sm },
  cardArabic: { fontSize: 24, color: colors.primary, textAlign: 'right', flexShrink: 1, lineHeight: 40 },
  activeTag: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  activeTagText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  cardName: { fontSize: 19, fontWeight: '800', color: colors.primaryDark, marginTop: spacing.sm },
  cardDesc: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  cardBottom: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.sm, gap: spacing.sm },
  cardBenefit: { flex: 1, fontSize: 13, color: colors.accent, fontStyle: 'italic', lineHeight: 19 },
  targetBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.cardAlt, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  targetText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  selectedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 12, marginTop: spacing.md },
  selectedText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
