import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { colors } from '../theme';
import { useApp } from '../appContext';
import { recordCount, getSettings } from '../storage';

export default function GeceModuScreen({ navigation }) {
  const { selectedZikir } = useApp();
  const [count, setCount] = useState(0);
  const vibrationRef = useRef(true);
  const target = selectedZikir?.targetCount || 33;
  const progress = Math.min((count % target || (count > 0 ? target : 0)) / target, 1);

  useEffect(() => { (async () => { vibrationRef.current = (await getSettings()).vibration !== false; })(); }, []);

  const inc = async () => {
    setCount((c) => {
      const next = c + 1;
      if (vibrationRef.current) {
        if (next % target === 0) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return next;
    });
    await recordCount(selectedZikir.id, 1);
  };
  const undo = async () => { if (count <= 0) return; setCount((c) => Math.max(0, c - 1)); await recordCount(selectedZikir.id, -1); };
  const reset = () => setCount(0);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={16}>
            <Ionicons name="close" size={28} color="#bbb" />
          </TouchableOpacity>
          <Text style={styles.title}>{selectedZikir.name}</Text>
          <View style={{ width: 28 }} />
        </View>

        <Pressable style={styles.tapArea} onPress={inc}>
          <Text style={styles.num}>{count}</Text>
          <Text style={styles.target}>/ {target}</Text>
        </Pressable>

        <View style={styles.bottom}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.hint}>Ekranın herhangi bir yerine dokun</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.circleBtn} onPress={reset}>
              <Ionicons name="refresh" size={22} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn} onPress={undo}>
              <Ionicons name="arrow-undo" size={22} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.nightBg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  title: { color: '#ddd', fontSize: 18, fontWeight: '600' },
  tapArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  num: { color: colors.nightText, fontSize: 120, fontWeight: '200' },
  target: { color: colors.nightMuted, fontSize: 26, marginTop: -10 },
  bottom: { paddingHorizontal: 40, paddingBottom: 30 },
  progressTrack: { height: 3, backgroundColor: '#222', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3E7A42' },
  hint: { color: colors.nightMuted, textAlign: 'center', marginTop: 16, fontSize: 13 },
  btnRow: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginTop: 24 },
  circleBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
});
