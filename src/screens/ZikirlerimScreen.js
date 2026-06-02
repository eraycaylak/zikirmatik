import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import Background from '../components/Background';
import { colors, radius, spacing } from '../theme';
import { useApp } from '../appContext';
import { getCustomZikirler, saveCustomZikirler } from '../storage';

export default function ZikirlerimScreen({ navigation }) {
  const { selectedZikir, selectZikir } = useApp();
  const [list, setList] = useState([]);

  useFocusEffect(useCallback(() => { (async () => setList(await getCustomZikirler()))(); }, []));

  const remove = (z) => {
    Alert.alert('Sil', `"${z.name}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        const next = list.filter((x) => x.id !== z.id);
        setList(next);
        await saveCustomZikirler(next);
      } },
    ]);
  };

  const choose = async (z) => { await selectZikir(z); navigation.navigate('Ana Sayfa'); };

  const Header = () => (
    <View style={styles.headerWrap}>
      <Text style={styles.h1}>Zikirlerim</Text>
      <Text style={styles.sub}>Kendi özel zikirlerini ekle ve yönet</Text>
    </View>
  );

  if (list.length === 0) {
    return (
      <Background>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <Header />
          <View style={styles.empty}>
            <View style={styles.emptyCircle}><Ionicons name="add" size={40} color={colors.primary} /></View>
            <Text style={styles.emptyTitle}>Henüz özel zikir eklemedin</Text>
            <Text style={styles.emptyDesc}>Kendi zikir, dua veya virdinizi ekleyerek kişiselleştirilmiş bir deneyim yaşayın.</Text>
            <TouchableOpacity style={styles.bigBtn} onPress={() => navigation.navigate('YeniZikir')}>
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.bigBtnText}>İlk Zikrini Ekle</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Background>
    );
  }

  return (
    <Background>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <FlatList
          data={list}
          keyExtractor={(z) => String(z.id)}
          ListHeaderComponent={Header}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: 90 }}
          renderItem={({ item }) => {
            const active = selectedZikir?.id === item.id;
            return (
              <TouchableOpacity style={[styles.card, active && styles.cardActive]} activeOpacity={0.85} onPress={() => choose(item)}>
                <View style={{ flex: 1 }}>
                  {!!item.arabicName && <Text style={styles.cardArabic}>{item.arabicName}</Text>}
                  <Text style={styles.cardName}>{item.name}</Text>
                  {!!item.description && <Text style={styles.cardDesc}>{item.description}</Text>}
                  <Text style={styles.cardTarget}>Hedef: {item.targetCount}x</Text>
                </View>
                <TouchableOpacity onPress={() => remove(item)} hitSlop={12} style={styles.trash}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('YeniZikir')}>
          <Ionicons name="add" size={30} color={colors.white} />
        </TouchableOpacity>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  headerWrap: { paddingTop: spacing.sm, paddingBottom: spacing.sm },
  h1: { fontSize: 30, fontWeight: '800', color: colors.textDark },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, marginTop: -40 },
  emptyCircle: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  emptyDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 },
  bigBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: 14, marginTop: spacing.lg },
  bigBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardActive: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primarySoft },
  cardArabic: { fontSize: 20, color: colors.primary, textAlign: 'right' },
  cardName: { fontSize: 17, fontWeight: '800', color: colors.primaryDark, marginTop: 2 },
  cardDesc: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  cardTarget: { fontSize: 12, color: colors.accent, fontWeight: '700', marginTop: 4 },
  trash: { padding: spacing.sm },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
});
