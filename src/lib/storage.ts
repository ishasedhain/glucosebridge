import AsyncStorage from '@react-native-async-storage/async-storage';

export type Reading = { id: string; value: number; tag: string; time: string };
const KEY = 'readings';

// Returns every saved reading, oldest first.
export async function getReadings(): Promise<Reading[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

// Saves a new reading with the current time.
export async function addReading(value: number, tag: string) {
  const all = await getReadings();
  all.push({ id: Date.now().toString(), value, tag, time: new Date().toISOString() });
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

// Changes the value and tag of one saved reading (the time stays the same).
export async function updateReading(id: string, value: number, tag: string) {
  const all = await getReadings();
  const updated = all.map(r => (r.id === id ? { ...r, value, tag } : r));
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

// Removes one reading.
export async function deleteReading(id: string) {
  const all = await getReadings();
  await AsyncStorage.setItem(KEY, JSON.stringify(all.filter(r => r.id !== id)));
}

// Removes every reading (we'll use this for "Delete all my data" later).
export async function clearAllReadings() {
  await AsyncStorage.removeItem(KEY);
}