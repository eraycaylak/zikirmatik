import 'react-native-gesture-handler';
import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppContext } from './src/appContext';
import { colors } from './src/theme';
import { ZIKIRLER } from './src/data';
import { getSelectedZikir, saveSelectedZikir, getSettings } from './src/storage';

import HomeScreen from './src/screens/HomeScreen';
import ZikirlerScreen from './src/screens/ZikirlerScreen';
import HatirlaticiScreen from './src/screens/HatirlaticiScreen';
import StatsScreen from './src/screens/StatsScreen';
import ZikirlerimScreen from './src/screens/ZikirlerimScreen';
import GeceModuScreen from './src/screens/GeceModuScreen';
import ZikirDetailScreen from './src/screens/ZikirDetailScreen';
import AddZikirScreen from './src/screens/AddZikirScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  'Ana Sayfa': ['home', 'home-outline'],
  Zikirler: ['list', 'list-outline'],
  Hatırlatıcı: ['notifications', 'notifications-outline'],
  İstatistik: ['stats-chart', 'stats-chart-outline'],
  Zikirlerim: ['person', 'person-outline'],
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={TAB_ICONS[route.name][focused ? 0 : 1]} size={22} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Ana Sayfa" component={HomeScreen} />
      <Tab.Screen name="Zikirler" component={ZikirlerScreen} />
      <Tab.Screen name="Hatırlatıcı" component={HatirlaticiScreen} />
      <Tab.Screen name="İstatistik" component={StatsScreen} />
      <Tab.Screen name="Zikirlerim" component={ZikirlerimScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [selectedZikir, setSelectedZikirState] = useState(ZIKIRLER[0]);
  const [settings, setSettings] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const sel = await getSelectedZikir();
      if (sel) setSelectedZikirState(sel);
      setSettings(await getSettings());
      setReady(true);
    })();
  }, []);

  const selectZikir = useCallback(async (z) => {
    setSelectedZikirState(z);
    await saveSelectedZikir(z);
  }, []);

  const refreshSettings = useCallback(async () => setSettings(await getSettings()), []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <AppContext.Provider value={{ selectedZikir, selectZikir, settings, setSettings, refreshSettings }}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.primary,
              headerTitleStyle: { fontWeight: '700', color: colors.textDark },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="GeceModu" component={GeceModuScreen} options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'fade' }} />
            <Stack.Screen name="Detay" component={ZikirDetailScreen} options={{ title: 'Zikir Detayı' }} />
            <Stack.Screen name="YeniZikir" component={AddZikirScreen} options={{ title: 'Yeni Zikir Ekle', presentation: 'modal' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppContext.Provider>
    </SafeAreaProvider>
  );
}
