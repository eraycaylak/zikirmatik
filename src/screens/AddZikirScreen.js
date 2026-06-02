import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';
import { getCustomZikirler, saveCustomZikirler } from '../storage';

export default function AddZikirScreen({ navigation }) {
  const [name, setName] = useState('');
  const [arabic, setArabic] = useState('');
  const [desc, setDesc] = useState('');
  const [target, setTarget] = useState('33');

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Eksik bilgi', 'Lütfen zikir adını girin.');
      return;
    }
    const t = parseInt(target, 10);
    const zikir = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      arabicName: arabic.trim(),
      description: desc.trim(),
      targetCount: isNaN(t) || t < 1 ? 33 : t,
      benefit: '',
      category: 'custom',
      custom: true,
    };
    const list = await getCustomZikirler();
    await saveCustomZikirler([...list, zikir]);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Text style={styles.label}>Zikir Adı *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="örn. Sübhanallah" placeholderTextColor={colors.textLight} />

      <Text style={styles.label}>Arapça Yazılışı</Text>
      <TextInput style={[styles.input, styles.arabicInput]} value={arabic} onChangeText={setArabic} placeholder="سُبْحَانَ اللَّهِ" placeholderTextColor={colors.textLight} />

      <Text style={styles.label}>Açıklama</Text>
      <TextInput style={styles.input} value={desc} onChangeText={setDesc} placeholder="Kısa anlam" placeholderTextColor={colors.textLight} />

      <Text style={styles.label}>Hedef Adet</Text>
      <TextInput style={styles.input} value={target} onChangeText={setTarget} keyboardType="number-pad" placeholder="33" placeholderTextColor={colors.textLight} />

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Ionicons name="checkmark" size={20} color={colors.white} />
        <Text style={styles.saveText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 6, marginTop: spacing.md },
  input: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, color: colors.text, fontSize: 15 },
  arabicInput: { fontSize: 20, textAlign: 'right' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.xl },
  saveText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
