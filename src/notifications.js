import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const { status: req } = await Notifications.requestPermissionsAsync();
  return req === 'granted';
}

// Her gün belirli saatte tekrarlayan bildirim kur; identifier döner
export async function scheduleDaily(key, hour, minute, title, body) {
  if (Platform.OS === 'web') return null;
  return Notifications.scheduleNotificationAsync({
    identifier: key,
    content: { title, body },
    trigger: { hour, minute, repeats: true, type: Notifications.SchedulableTriggerInputTypes.DAILY },
  });
}

export async function cancel(key) {
  if (Platform.OS === 'web') return;
  try { await Notifications.cancelScheduledNotificationAsync(key); } catch {}
}
