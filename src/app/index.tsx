import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { scanMeter } from '../../lib/scan';
import { addReading, getReadings, Reading } from '../../lib/storage';

const TAGS = ['Fasting', 'Before meal', 'After meal', 'Exercise'];

export default function HomeScreen() {
  const [value, setValue] = useState('');
  const [tag, setTag] = useState(TAGS[0]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [scanning, setScanning] = useState(false);

  const load = async () => setReadings((await getReadings()).reverse());
  useFocusEffect(useCallback(() => { load(); }, []));

  const save = async () => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 20 || n > 600) {
      Alert.alert('Check the number', 'Enter a reading between 20 and 600.');
      return;
    }
    await addReading(n, tag);
    setValue('');
    load();
  };

  const scan = async () => {
    try {
      setScanning(true);
      const n = await scanMeter();
      if (n === null) {
        Alert.alert("Couldn't read it", 'Try again with better light, or type it in.');
        return;
      }
      setValue(String(n));
      Alert.alert('Please check', `Does your meter say ${n}? Fix it below if not, then tap Save.`);
    } catch (e) {
      Alert.alert('Scan failed', 'Check camera permission and that the server is running, or type it in.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Reading</Text>

      <TouchableOpacity
        style={styles.scan}
        onPress={scan}
        disabled={scanning}
        accessibilityLabel="Scan glucose meter with camera"
      >
        <Text style={styles.saveText}>{scanning ? 'Reading...' : 'Scan Meter'}</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="mg/dL"
        placeholderTextColor="#666666"
        keyboardType="number-pad"
        accessibilityLabel="Glucose reading in milligrams per deciliter"
      />

      <View style={styles.tags}>
        {TAGS.map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTag(t)}
            style={[styles.tag, tag === t && styles.tagOn]}
            accessibilityLabel={`Tag: ${t}`}
          >
            <Text style={[styles.tagText, tag === t && styles.tagTextOn]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.save} onPress={save} accessibilityLabel="Save reading">
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>History</Text>
      {readings.map(r => (
        <Text key={r.id} style={styles.row}>
          {r.value} mg/dL · {r.tag} · {new Date(r.time).toLocaleString()}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 24, fontWeight: 'bold', marginTop: 32, marginBottom: 8 },
  scan: { backgroundColor: '#1a56db', borderRadius: 12, padding: 20, marginBottom: 16, alignItems: 'center' },
  input: { fontSize: 36, borderWidth: 2, borderColor: '#333', borderRadius: 12, padding: 16, color: '#111' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  tag: { borderWidth: 2, borderColor: '#333', borderRadius: 12, padding: 14, marginRight: 8, marginBottom: 8 },
  tagOn: { backgroundColor: '#1a56db', borderColor: '#1a56db' },
  tagText: { fontSize: 20, color: '#111' },
  tagTextOn: { color: '#fff' },
  save: { backgroundColor: '#0a7d3b', borderRadius: 12, padding: 20, marginTop: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  row: { fontSize: 18, paddingVertical: 8, color: '#222' },
});