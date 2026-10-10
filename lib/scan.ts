import * as ImagePicker from 'expo-image-picker';
import { SERVER } from './config';

export async function scanMeter(): Promise<number | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) throw new Error('camera-denied');

  const result = await ImagePicker.launchCameraAsync({
    base64: true,
    quality: 0.5,
  });
  if (result.canceled) return null;

  const res = await fetch(`${SERVER}/read-meter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_base64: result.assets[0].base64 }),
  });
  const data = await res.json();
  return data.value ?? null;
}