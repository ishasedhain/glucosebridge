import { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getReadings, updateReading, deleteReading, Reading } from '@/lib/storage';
import { rangeColor } from '@/lib/stats';

const TAGS = ['Fasting', 'Before meal', 'After meal', 'Exercise'];

// All saved readings. Tap one to change or delete it.
export default function HistoryScreen() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [tag, setTag] = useState(TAGS[0]);
  const scrollRef = useRef<ScrollView>(null);

  // Loads readings, newest first
  const load = async () => setReadings((await getReadings()).reverse());
  useFocusEffect(
    useCallback(() => {
      load();
      setEditingId(null);
    }, [])
  );

  // Opens the edit panel for a tapped reading
  const startEdit = (r: Reading) => {
    setEditingId(r.id);
    setValue(String(r.value));
    setTag(r.tag);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Saves the changes
  const save = async () => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 20 || n > 600) {
      Alert.alert('Check the number', 'Enter a reading between 20 and 600.');
      return;
    }
    if (editingId) await updateReading(editingId, n, tag);
    setEditingId(null);
    load();
  };

  // Asks first, then deletes
  const remove = () => {
    if (!editingId) return;
    Alert.alert('Delete this reading?', `${value} mg/dL will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReading(editingId);
          setEditingId(null);
          load();
        },
      },
    ]);
  };

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title} accessibilityRole="header">History</Text>

      {editingId && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Edit Reading</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            accessibilityLabel="Glucose reading in milligrams per deciliter"
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
          <TouchableOpacity style={styles.save} onPress={save} accessibilityRole="button" accessibilityLabel="Update reading">
            <Text style={styles.btnText}>Update Reading</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancel} onPress={() => setEditingId(null)} accessibilityRole="button" accessibilityLabel="Cancel editing">
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.del} onPress={remove} accessibilityRole="button" accessibilityLabel="Delete this reading">
            <Text style={styles.btnText}>Delete This Reading</Text>
          </TouchableOpacity>
        </View>
      )}

      {readings.length === 0 && (
        <Text style={styles.empty}>No readings yet. Go to the Add tab to save your first one.</Text>
      )}
      {readings.length > 0 && <Text style={styles.hint}>Tap a reading to edit or delete it.</Text>}

      {readings.map(r => (
        <TouchableOpacity
          key={r.id}
          onPress={() => startEdit(r)}
          style={[styles.rowBox, { borderLeftColor: rangeColor(r.value) }, r.id === editingId && styles.rowOn]}
          accessibilityRole="button"
          accessibilityLabel={`${r.value} milligrams per deciliter, ${r.tag}, ${new Date(r.time).toLocaleString()}`}
          accessibilityHint="Double tap to edit or delete"
        >
          <Text style={styles.rowValue}>{r.value} mg/dL</Text>
          <Text style={styles.row}>{r.tag} · {new Date(r.time).toLocaleString()}</Text>
        </TouchableOpacity>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, backgroundColor: '#ebf1f8' },
  title: { fontSize: 34, fontWeight: 'bold', marginBottom: 12, color: '#25365d' },
  hint: { fontSize: 18, color: '#3b4a6b', marginBottom: 12 },
  empty: { fontSize: 22, color: '#25365d', marginTop: 12, lineHeight: 30 },
  panel: { borderWidth: 3, borderColor: '#6386ad', borderRadius: 14, padding: 16, marginBottom: 20, backgroundColor: '#dbe6f3' },
  panelTitle: { fontSize: 26, fontWeight: 'bold', color: '#25365d', marginBottom: 10 },
  input: { fontSize: 38, borderWidth: 3, borderColor: '#25365d', borderRadius: 12, padding: 14, color: '#25365d', backgroundColor: '#ebf1f8' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 },
  tag: { borderWidth: 3, borderColor: '#25365d', borderRadius: 12, paddingHorizontal: 14, minHeight: 60, justifyContent: 'center', marginRight: 8, marginBottom: 8, backgroundColor: '#ebf1f8' },
  tagOn: { backgroundColor: '#6386ad', borderColor: '#6386ad' },
  tagText: { fontSize: 20, color: '#25365d' },
  tagTextOn: { color: '#fff', fontWeight: 'bold' },
  save: { backgroundColor: '#25365d', borderRadius: 12, padding: 18, minHeight: 64, justifyContent: 'center', marginTop: 10, alignItems: 'center' },
  cancel: { borderWidth: 3, borderColor: '#25365d', borderRadius: 12, padding: 16, minHeight: 60, justifyContent: 'center', marginTop: 10, alignItems: 'center', backgroundColor: '#ebf1f8' },
  cancelText: { color: '#25365d', fontSize: 22, fontWeight: 'bold' },
  del: { backgroundColor: '#b91c1c', borderRadius: 12, padding: 16, minHeight: 60, justifyContent: 'center', marginTop: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  rowBox: { paddingVertical: 14, paddingHorizontal: 12, minHeight: 68, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#81a4cd', borderLeftWidth: 10 },
  rowOn: { backgroundColor: '#dbe6f3' },
  rowValue: { fontSize: 26, fontWeight: 'bold', color: '#25365d' },
  row: { fontSize: 18, color: '#25365d', marginTop: 2 },
});
