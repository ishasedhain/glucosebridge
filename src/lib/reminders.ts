import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'gb_reminders';

export const SLOTS = [
  { id: 'morning', label: 'Morning', time: '8:00 AM', hour: 8, minute: 0 },
  { id: 'noon', label: 'Midday', time: '12:00 PM', hour: 12, minute: 0 },
  { id: 'evening', label: 'Evening', time: '6:00 PM', hour: 18, minute: 0 },
  { id: 'bedtime', label: 'Bedtime', time: '9:00 PM', hour: 21, minute: 0 },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function getEnabled(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function setEnabled(ids: string[]): Promise<boolean> {
  if (ids.length > 0) {
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return false;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const slot of SLOTS) {
    if (!ids.includes(slot.id)) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Glucose Bridge', body: 'Time to check your blood sugar and log it.' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: slot.hour,
        minute: slot.minute,
      },
    });
  }
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
  return true;
}

export async function sendTest(): Promise<boolean> {
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Glucose Bridge', body: 'Time to check your blood sugar and log it.' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
    },
  });
  return true;
}
