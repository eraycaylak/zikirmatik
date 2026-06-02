import AsyncStorage from '@react-native-async-storage/async-storage';

// Orijinal uygulamadaki kayıt anahtarları (mevcut kullanıcı verisi korunur)
export const KEYS = {
  COUNTS: 'zikirmatik_counts',
  DAILY_STATS: 'zikirmatik_daily_stats',
  SELECTED_ZIKIR: 'zikirmatik_selected_zikir',
  SETTINGS: 'zikirmatik_settings',
  CUSTOM: 'zikirmatik_custom_zikirler',
  DAILY_VERSE: 'zikirmatik_daily_verse',
  REMINDERS: 'zikirmatik_reminders',
};

export const DEFAULT_SETTINGS = {
  vibration: true,
  sound: false,
  nightMode: false,
};

export const DEFAULT_REMINDERS = {
  dailyVerse: { enabled: false, time: '09:00' },
  sabah: { enabled: false, time: '06:00' },
  ogle: { enabled: false, time: '13:00' },
  ikindi: { enabled: false, time: '16:30' },
  aksam: { enabled: false, time: '19:30' },
  yatsi: { enabled: false, time: '21:00' },
};

export function todayString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function getJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
async function setJSON(key, val) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

// ---- Ayarlar ----
export const getSettings = async () => ({ ...DEFAULT_SETTINGS, ...(await getJSON(KEYS.SETTINGS, {})) });
export const saveSettings = (s) => setJSON(KEYS.SETTINGS, s);

// ---- Hatırlatıcılar ----
export const getReminders = async () => ({ ...DEFAULT_REMINDERS, ...(await getJSON(KEYS.REMINDERS, {})) });
export const saveReminders = (r) => setJSON(KEYS.REMINDERS, r);

// ---- Zikir başına toplam sayım ----
export const getCounts = () => getJSON(KEYS.COUNTS, {});
export const saveCounts = (c) => setJSON(KEYS.COUNTS, c);

// ---- Günlük istatistik ----
export const getDailyStats = () => getJSON(KEYS.DAILY_STATS, {});
export const saveDailyStats = (s) => setJSON(KEYS.DAILY_STATS, s);

// ---- Seçili zikir ----
export const getSelectedZikir = () => getJSON(KEYS.SELECTED_ZIKIR, null);
export const saveSelectedZikir = (z) => setJSON(KEYS.SELECTED_ZIKIR, z);

// ---- Özel zikirler ----
export const getCustomZikirler = () => getJSON(KEYS.CUSTOM, []);
export const saveCustomZikirler = (list) => setJSON(KEYS.CUSTOM, list);

// Sayaç artır / azalt (geri al) + günlük istatistik
export async function recordCount(zikirId, delta = 1) {
  const counts = await getCounts();
  counts[zikirId] = Math.max(0, (counts[zikirId] || 0) + delta);
  await saveCounts(counts);

  const stats = await getDailyStats();
  const t = todayString();
  if (!stats[t]) stats[t] = { total: 0, byZikir: {} };
  stats[t].total = Math.max(0, stats[t].total + delta);
  stats[t].byZikir[zikirId] = Math.max(0, (stats[t].byZikir[zikirId] || 0) + delta);
  await saveDailyStats(stats);

  return { total: counts[zikirId], todayTotal: stats[t].total };
}

export async function getTodayTotal() {
  const stats = await getDailyStats();
  return stats[todayString()]?.total || 0;
}

// Bu hafta (son 7 gün) toplamı
export async function getWeekTotal() {
  const stats = await getDailyStats();
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    sum += stats[todayString(d)]?.total || 0;
  }
  return sum;
}

// Son 7 günün serisi [{ day: 'Pzt', total, isToday }]
const TR_DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
export async function getWeeklySeries() {
  const stats = await getDailyStats();
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ day: TR_DAYS[d.getDay()], total: stats[todayString(d)]?.total || 0, isToday: i === 0 });
  }
  return out;
}

// Üst üste zikir çekilen gün sayısı (streak)
export async function getStreak() {
  const stats = await getDailyStats();
  let streak = 0;
  const d = new Date();
  // bugün boşsa dünden başla
  if (!stats[todayString(d)]?.total) d.setDate(d.getDate() - 1);
  while (stats[todayString(d)]?.total > 0) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// Bugün çekilen zikirlerin dökümü [{id, total}]
export async function getTodayBreakdown() {
  const stats = await getDailyStats();
  const by = stats[todayString()]?.byZikir || {};
  return Object.entries(by).map(([id, total]) => ({ id, total })).sort((a, b) => b.total - a.total);
}

export async function resetAllProgress() {
  await AsyncStorage.removeItem(KEYS.DAILY_STATS);
  await AsyncStorage.removeItem(KEYS.COUNTS);
}
