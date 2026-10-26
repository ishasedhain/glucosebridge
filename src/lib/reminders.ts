import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'gb_reminder_times';

export type Slot = { id: string; hour: number; minute: number };

// Quick-pick times
export const PRESETS: Slot[] = [
  { id: 'morning', hour: 8, minute: 0 },
  { id: 'noon', hour: 12, minute: 0 },
  { id: 'evening', hour: 18, minute: 0 },
  { id: 'bedtime', hour: 21, minute: 0 },
];
export const PRESET_LABELS: Record<string, string> = {
  morning: 'Morning',
  noon: 'Midday',
  evening: 'Evening',
  bedtime: 'Bedtime',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Turns 14:05 into "2:05 PM"
export function formatTime(hour: number, minute: number): string {
  const ap = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${ap}`;
}

// Loads the saved reminder times
export async function getTimes(): Promise<Slot[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Saves the times and schedules one daily reminder for each. Returns false if notifications are not allowed.
export async function saveTimes(slots: Slot[]): Promise<boolean> {
  if (slots.length > 0) {
    const perm = await Notifications.requestPermissionsAsync();
    if (!perm.granted) return false;
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const s of slots) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Glucose Bridge', body: 'Time to check your blood sugar and log it.' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: s.hour,
        minute: s.minute,
      },
    });
  }
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(slots));
  } catch {}
  return true;
}

// Shows a reminder in 5 seconds (for testing and the demo video)
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
