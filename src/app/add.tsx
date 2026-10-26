import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { addReading } from '@/lib/storage';
import { scanMeter } from '@/lib/scan';

const TAGS = ['Fasting', 'Before meal', 'After meal', 'Exercise'];

// Scan the meter or type a number, pick a tag, and save.
export default function AddScreen() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [tag, setTag] = useState(TAGS[0]);
  const [scanning, setScanning] = useState(false);
  const [slow, setSlow] = useState(false);

  // Saves the reading, then goes back to the Today tab
  const save = async () => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 20 || n > 600) {
      Alert.alert('Check the number', 'Enter a reading between 20 and 600.');
      return;
    }
    await addReading(n, tag);
    setValue('');
    router.navigate('/');
  };

  // Shows a friendly message for each kind of scan problem
  const showScanError = (code: string) => {
    if (code === 'camera-denied') {
      Alert.alert(
        'Camera is turned off',
        'Allow camera access in Settings to scan, or type the number in.',
        [
          { text: 'Type it in', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    } else if (code === 'offline') {
      Alert.alert('No connection', 'Could not reach the server. Check your internet, or type the number in.');
    } else if (code === 'timeout') {
      Alert.alert('Taking too long', 'The server did not answer. Try again in a minute, or type the number in.');
    } else if (code === 'server-error') {
      Alert.alert('Server is busy', 'It may be waking up. Wait a minute and try again, or type the number in.');
    } else {
      Alert.alert('Scan failed', 'Something went wrong. You can type the number in instead.');
    }
  };

  // Takes a photo of the meter and puts the number in the box to confirm
  const scan = async () => {
    const slowTimer = setTimeout(() => setSlow(true), 8000);
    try {
      setScanning(true);
      const n = await scanMeter();
      if (n === null) {
        Alert.alert("Couldn't read it", 'Try again with better light and the screen filling the photo, or type it in.');
        return;
      }
      setValue(String(n));
      Alert.alert('Please check', `Does your meter say ${n}? Fix it below if not, then tap Save.`);
    } catch (e) {
      showScanError((e as Error)?.message ?? '');
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setScanning(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title} accessibilityRole="header">Add Reading</Text>

      <TouchableOpacity
        style={styles.scan}
        onPress={scan}
        disabled={scanning}
        accessibilityRole="button"
        accessibilityLabel="Scan glucose meter with camera"
        accessibilityHint="Opens the camera. Point it at your meter screen."
        accessibilityState={{ disabled: scanning }}
      >
        <Text style={styles.btnText}>{scanning ? 'Reading...' : 'Scan Meter'}</Text>
      </TouchableOpacity>
      {scanning && slow && (
        <Text style={styles.wait} accessibilityLiveRegion="polite">
          Waking up the server. This can take up to a minute...
        </Text>
      )}
      <Text style={styles.hint}>Scanning needs internet. You can always type the number.</Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="mg/dL"
        placeholderTextColor="#666666"
        keyboardType="number-pad"
        accessibilityLabel="Glucose reading in milligrams per deciliter"
        accessibilityHint="Type the number from your meter"
      />

      <View style={styles.tags}>
        {TAGS.map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTag(t)}
            style={[styles.tag, tag === t && styles.tagOn]}
            accessibilityRole="button"
            accessibilityLabel={`Tag: ${t}`}
            accessibilityState={{ selected: tag === t }}
          >
            <Text style={[styles.tagText, tag === t && styles.tagTextOn]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.save}
        onPress={save}
        accessibilityRole="button"
        accessibilityLabel="Save reading"
      >
        <Text style={styles.btnTextDark}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  btnTextDark: { color: '#25365d', fontSize: 26, fontWeight: 'bold' },
  container: { padding: 24, paddingTop: 64, backgroundColor: '#ebf1f8' },
  title: { textAlign: 'center', fontSize: 28, fontWeight: 'bold', fontFamily: 'Georgia', marginBottom: 16, color: '#25365d' },
  hint: { fontSize: 18, color: '#3b4a6b', marginBottom: 12 },
  wait: { fontSize: 20, color: '#92400e', marginBottom: 8 },
  scan: { backgroundColor: '#6386ad', borderRadius: 12, padding: 20, minHeight: 68, justifyContent: 'center', marginBottom: 8, alignItems: 'center' },
  input: { fontSize: 38, borderWidth: 3, borderColor: '#25365d', borderRadius: 12, padding: 16, color: '#25365d' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  tag: { borderWidth: 3, borderColor: '#25365d', borderRadius: 12, paddingHorizontal: 16, minHeight: 64, justifyContent: 'center', marginRight: 8, marginBottom: 8 },
  tagOn: { backgroundColor: '#6386ad', borderColor: '#6386ad' },
  tagText: { fontSize: 22, color: '#25365d' },
  tagTextOn: { color: '#fff', fontWeight: 'bold' },
  save: { backgroundColor: '#6da67a', borderRadius: 12, padding: 20, minHeight: 68, justifyContent: 'center', marginTop: 16, marginBottom: 40, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
});
