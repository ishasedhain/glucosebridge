import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import AboutModal from '@/components/AboutModal';
import ConsentModal from '@/components/ConsentModal';
import { scanMeter } from '@/lib/scan';
import {
  addReading,
  deleteReading,
  getReadings,
  Reading,
  updateReading,
} from '@/lib/storage';

const TAGS = ['Fasting', 'Before meal', 'After meal', 'Exercise'];

export default function HomeScreen() {
  const [value, setValue] = useState('');
  const [tag, setTag] = useState(TAGS[0]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [scanning, setScanning] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

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

  // Takes a photo of the meter and puts the number in the box to confirm
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

      <Text style={styles.title}>{editingId ? 'Edit Reading' : 'Add Reading'}</Text>

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

      <TouchableOpacity
        style={styles.save}
        onPress={save}
        accessibilityLabel={editingId ? 'Update reading' : 'Save reading'}
      >
        <Text style={styles.saveText}>{editingId ? 'Update Reading' : 'Save'}</Text>
      </TouchableOpacity>

      {editingId && (
        <View>
          <TouchableOpacity
            style={styles.cancel}
            onPress={resetForm}
            accessibilityLabel="Cancel editing"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.del}
            onPress={remove}
            accessibilityLabel="Delete this reading"
          >
            <Text style={styles.saveText}>Delete This Reading</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.subtitle}>History</Text>
      <Text style={styles.hint}>Tap a reading to edit or delete it.</Text>
      {readings.map(r => (
        <TouchableOpacity
          key={r.id}
          onPress={() => startEdit(r)}
          style={[styles.rowBox, r.id === editingId && styles.rowOn]}
          accessibilityLabel={`${r.value} milligrams per deciliter, ${r.tag}. Tap to edit.`}
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
        accessibilityLabel="Open privacy and about"
      >
        <Text style={styles.aboutText}>Privacy & About</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 16, color: '#111' },
  subtitle: { fontSize: 24, fontWeight: 'bold', marginTop: 32, marginBottom: 4, color: '#111' },
  hint: { fontSize: 16, color: '#555', marginBottom: 8 },
  scan: { backgroundColor: '#1a56db', borderRadius: 12, padding: 20, marginBottom: 16, alignItems: 'center' },
  input: { fontSize: 36, borderWidth: 2, borderColor: '#333', borderRadius: 12, padding: 16, color: '#111' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  tag: { borderWidth: 2, borderColor: '#333', borderRadius: 12, padding: 14, marginRight: 8, marginBottom: 8 },
  tagOn: { backgroundColor: '#1a56db', borderColor: '#1a56db' },
  tagText: { fontSize: 20, color: '#111' },
  tagTextOn: { color: '#fff' },
  save: { backgroundColor: '#0a7d3b', borderRadius: 12, padding: 20, marginTop: 16, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  cancel: { borderWidth: 2, borderColor: '#333', borderRadius: 12, padding: 18, marginTop: 12, alignItems: 'center' },
  cancelText: { color: '#111', fontSize: 22, fontWeight: 'bold' },
  del: { backgroundColor: '#b91c1c', borderRadius: 12, padding: 18, marginTop: 12, alignItems: 'center' },
  rowBox: { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  rowOn: { backgroundColor: '#e0e7ff' },
  row: { fontSize: 18, color: '#222' },
  disclaimer: { fontSize: 16, color: '#555', marginTop: 32, textAlign: 'center' },
  about: { borderWidth: 2, borderColor: '#333', borderRadius: 12, padding: 16, marginTop: 12, marginBottom: 40, alignItems: 'center' },
  aboutText: { color: '#111', fontSize: 20, fontWeight: 'bold' },
});