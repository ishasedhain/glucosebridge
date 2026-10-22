import AboutModal from '@/components/AboutModal';
import ConsentModal from '@/components/ConsentModal';
import { scanMeter, wakeServer } from '@/lib/scan';
import {
  addReading,
  deleteReading,
  getReadings,
  Reading,
  updateReading,
} from '@/lib/storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

const TAGS = ['Fasting', 'Before meal', 'After meal', 'Exercise'];

export default function HomeScreen() {
  const [value, setValue] = useState('');
  const [tag, setTag] = useState(TAGS[0]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [scanning, setScanning] = useState(false);
  const [slow, setSlow] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Quietly wakes the server when the app opens
  useEffect(() => {
    wakeServer();
  }, []);

  // Loads readings, newest first
  const load = async () => setReadings((await getReadings()).reverse());
  useFocusEffect(useCallback(() => { load(); }, []));

  // Clears the form and leaves edit mode
  const resetForm = () => {
    setValue('');
    setEditingId(null);
  };

  // Saves a new reading, or updates the one being edited
  const save = async () => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 20 || n > 600) {
      Alert.alert('Check the number', 'Enter a reading between 20 and 600.');
      return;
    }
    if (editingId) {
      await updateReading(editingId, n, tag);
    } else {
      await addReading(n, tag);
    }
    resetForm();
    load();
  };

  // Loads a tapped reading into the form so it can be changed
  const startEdit = (r: Reading) => {
    setEditingId(r.id);
    setValue(String(r.value));
    setTag(r.tag);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Asks for confirmation, then deletes the reading being edited
  const remove = () => {
    if (!editingId) return;
    Alert.alert('Delete this reading?', `${value} mg/dL will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReading(editingId);
          resetForm();
          load();
        },
      },
    ]);
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
      Alert.alert(
        'No connection',
        'Could not reach the server. Check your internet, or type the number in.'
      );
    } else if (code === 'timeout') {
      Alert.alert(
        'Taking too long',
        'The server did not answer. Try again in a minute, or type the number in.'
      );
    } else if (code === 'server-error') {
      Alert.alert(
        'Server is busy',
        'It may be waking up. Wait a minute and try again, or type the number in.'
      );
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
        Alert.alert(
          "Couldn't read it",
          'Try again with better light and the screen filling the photo, or type it in.'
        );
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
    <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
      <ConsentModal />
      <AboutModal
        visible={aboutOpen}
        onClose={() => setAboutOpen(false)}
        onDeleted={() => {
          resetForm();
          load();
        }}
      />

      <Text style={styles.title} accessibilityRole="header">
        {editingId ? 'Edit Reading' : 'Add Reading'}
      </Text>

      <TouchableOpacity
        style={styles.scan}
        onPress={scan}
        disabled={scanning}
        accessibilityRole="button"
        accessibilityLabel="Scan glucose meter with camera"
        accessibilityHint="Opens the camera. Point it at your meter screen."
        accessibilityState={{ disabled: scanning }}
      >
        <Text style={styles.saveText}>{scanning ? 'Reading...' : 'Scan Meter'}</Text>
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
        accessibilityLabel={editingId ? 'Update reading' : 'Save reading'}
      >
        <Text style={styles.saveText}>{editingId ? 'Update Reading' : 'Save'}</Text>
      </TouchableOpacity>

      {editingId && (
        <View>
          <TouchableOpacity
            style={styles.cancel}
            onPress={resetForm}
            accessibilityRole="button"
            accessibilityLabel="Cancel editing"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.del}
            onPress={remove}
            accessibilityRole="button"
            accessibilityLabel="Delete this reading"
          >
            <Text style={styles.saveText}>Delete This Reading</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.subtitle} accessibilityRole="header">History</Text>
      <Text style={styles.hint}>Tap a reading to edit or delete it.</Text>
      {readings.map(r => (
        <TouchableOpacity
          key={r.id}
          onPress={() => startEdit(r)}
          style={[styles.rowBox, r.id === editingId && styles.rowOn]}
          accessibilityRole="button"
          accessibilityLabel={`${r.value} milligrams per deciliter, ${r.tag}, ${new Date(r.time).toLocaleString()}`}
          accessibilityHint="Double tap to edit or delete"
        >
          <Text style={styles.row}>
            {r.value} mg/dL · {r.tag} · {new Date(r.time).toLocaleString()}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.disclaimer}>
        GlucoseBridge is a logging tool, not medical advice.
      </Text>
      <TouchableOpacity
        style={styles.about}
        onPress={() => setAboutOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open privacy and about"
      >
        <Text style={styles.aboutText}>Privacy & About</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, backgroundColor: '#fff' },
  title: { fontSize: 34, fontWeight: 'bold', marginBottom: 16, color: '#111' },
  subtitle: { fontSize: 26, fontWeight: 'bold', marginTop: 32, marginBottom: 4, color: '#111' },
  hint: { fontSize: 18, color: '#444', marginBottom: 12 },
  wait: { fontSize: 20, color: '#92400e', marginBottom: 8 },
  scan: { backgroundColor: '#1a56db', borderRadius: 12, padding: 20, minHeight: 68, justifyContent: 'center', marginBottom: 8, alignItems: 'center' },
  input: { fontSize: 38, borderWidth: 3, borderColor: '#111', borderRadius: 12, padding: 16, color: '#111' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  tag: { borderWidth: 3, borderColor: '#111', borderRadius: 12, paddingHorizontal: 16, minHeight: 64, justifyContent: 'center', marginRight: 8, marginBottom: 8 },
  tagOn: { backgroundColor: '#1a56db', borderColor: '#1a56db' },
  tagText: { fontSize: 22, color: '#111' },
  tagTextOn: { color: '#fff', fontWeight: 'bold' },
  save: { backgroundColor: '#0a7d3b', borderRadius: 12, padding: 20, minHeight: 68, justifyContent: 'center', marginTop: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  cancel: { borderWidth: 3, borderColor: '#111', borderRadius: 12, padding: 18, minHeight: 64, justifyContent: 'center', marginTop: 12, alignItems: 'center' },
  cancelText: { color: '#111', fontSize: 24, fontWeight: 'bold' },
  del: { backgroundColor: '#b91c1c', borderRadius: 12, padding: 18, minHeight: 64, justifyContent: 'center', marginTop: 12, alignItems: 'center' },
  rowBox: { paddingVertical: 16, paddingHorizontal: 8, minHeight: 64, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#bbb', borderRadius: 8 },
  rowOn: { backgroundColor: '#e0e7ff' },
  row: { fontSize: 20, color: '#111' },
  disclaimer: { fontSize: 18, color: '#444', marginTop: 32, textAlign: 'center' },
  about: { borderWidth: 3, borderColor: '#111', borderRadius: 12, padding: 16, minHeight: 64, justifyContent: 'center', marginTop: 12, marginBottom: 40, alignItems: 'center' },
  aboutText: { color: '#111', fontSize: 22, fontWeight: 'bold' },
});
