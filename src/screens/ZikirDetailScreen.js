import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Background from '../components/Background';
import { colors, radius, spacing } from '../theme';
import { useApp } from '../appContext';

export default function ZikirDetailScreen({ route, navigation }) {
  const { zikir } = route.params;
  const { selectZikir } = useApp();

  const start = async () => {
    await selectZikir(zikir);
    navigation.navigate('Tabs', { screen: 'Ana Sayfa' });
  };

  return (
    <Background>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <View style={styles.card}>
          <Text style={styles.arabic}>{zikir.arabicName}</Text>
          <Text style={styles.name}>{zikir.name}</Text>
          {!!zikir.description && <Text style={styles.desc}>{zikir.description}</Text>}
        </View>
        <View style={styles.targetCard}>
          <Ionicons name="repeat" size={20} color={colors.accent} />
          <Text style={styles.targetText}>Önerilen: günde {zikir.targetCount} kere</Text>
        </View>
        {!!zikir.benefit && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fazileti</Text>
            <Text style={styles.benefit}>{zikir.benefit}</Text>
          </View>
        )}
        <TouchableOpacity style={styles.startBtn} onPress={start}>
          <Ionicons name="play" size={20} color={colors.white} />
          <Text style={styles.startText}>Bu zikri çek</Text>
        </TouchableOpacity>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  arabic: { fontSize: 32, color: colors.primary, textAlign: 'center', lineHeight: 52, marginBottom: spacing.sm },
  name: { fontSize: 20, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  desc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
  targetCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  targetText: { color: colors.textDark, fontWeight: '600' },
  section: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', marginBottom: 6 },
  benefit: { fontSize: 14, color: colors.text, lineHeight: 22 },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.lg },
  startText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
