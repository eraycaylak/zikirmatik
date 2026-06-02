import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { AYETLER } from '../data';

export default function AyetlerScreen() {
  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: spacing.md }}
      data={AYETLER}
      keyExtractor={(a) => String(a.id)}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.arabic}>{item.arabic}</Text>
          <Text style={styles.turkish}>“{item.turkish}”</Text>
          <Text style={styles.source}>— {item.source}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  arabic: { fontSize: 24, color: colors.primary, textAlign: 'right', lineHeight: 42, marginBottom: spacing.md },
  turkish: { fontSize: 15, color: colors.text, fontStyle: 'italic', lineHeight: 24 },
  source: { fontSize: 13, color: colors.accent, fontWeight: '700', marginTop: spacing.sm, textAlign: 'right' },
});
