import * as ImagePicker from 'expo-image-picker';
import { SERVER } from './config';

// How long to wait for the server before giving up (free hosting can take ~1 minute to wake up)
const TIMEOUT_MS = 60000;

// Pings the server so it wakes up before the user scans. Never shows errors.
export async function wakeServer() {
  try {
    await fetch(`${SERVER}/`);
  } catch (e) {
    // Ignore: this is only a warm-up
  }
}

// Takes a photo of the meter and asks the server to read the number.
// Returns the number, or null if the photo was cancelled or unreadable.
// Throws an Error whose message is one of:
// 'camera-denied', 'offline', 'timeout', 'server-error'
export async function scanMeter(): Promise<number | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) throw new Error('camera-denied');

  const result = await ImagePicker.launchCameraAsync({
    base64: true,
    quality: 0.5,
  });
  if (result.canceled) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${SERVER}/read-meter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: result.assets[0].base64 }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('server-error');
    const data = await res.json();
    return typeof data.value === 'number' ? data.value : null;
  } catch (e: any) {
    if (e?.message === 'server-error') throw e;
    if (e?.name === 'AbortError') throw new Error('timeout');
    throw new Error('offline');
  } finally {
    clearTimeout(timer);
  }
}
