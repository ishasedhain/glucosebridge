import AsyncStorage from '@react-native-async-storage/async-storage';

export type Reading = { id: string; value: number; tag: string; time: string };
const KEY = 'readings';

export async function getReadings(): Promise<Reading[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addReading(value: number, tag: string) {
  const all = await getReadings();
  all.push({ id: Date.now().toString(), value, tag, time: new Date().toISOString() });
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}
