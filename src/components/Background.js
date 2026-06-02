import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const bg = require('../../assets/bg.png');

// Tüm ekranlarda kullanılan botanik + cami silüetli krem arkaplan
export default function Background({ children, style }) {
  return (
    <ImageBackground source={bg} resizeMode="cover" style={[styles.bg, style]}>
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  overlay: { flex: 1 },
});
