import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { PRESETS, PRESET_LABELS, Slot, formatTime, getTimes, saveTimes, sendTest } from '@/lib/reminders';

const byTime = (a: Slot, b: Slot) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute);

export default function Reminders() {
  const [times, setTimes] = useState<Slot[]>([]);
  const [hour12, setHour12] = useState(9);
  const [minute, setMinute] = useState(0);
  const [pm, setPm] = useState(false);

  useEffect(() => {
    getTimes().then(setTimes);
  }, []);

  const denied = () =>
    Alert.alert('Notifications are off', 'Turn them on for Expo Go in your phone Settings.');

  // Saves a new list of times
  const update = async (next: Slot[]) => {
    const sorted = [...next].sort(byTime);
    if (!(await saveTimes(sorted))) return denied();
    setTimes(sorted);
  };

  const togglePreset = (p: Slot) =>
    update(times.some((t) => t.id === p.id) ? times.filter((t) => t.id !== p.id) : [...times, p]);

  const addCustom = () => {
    const hour = (hour12 % 12) + (pm ? 12 : 0);
    if (times.some((t) => t.hour === hour && t.minute === minute)) {
      return Alert.alert('Already added', 'You already have a reminder at that time.');
    }
    update([...times, { id: `c-${hour}-${minute}`, hour, minute }]);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">Daily reminders</Text>
      <Text style={styles.sub}>Pick a quick time, or set your own.</Text>

      {PRESETS.map((p) => {
        const selected = times.some((t) => t.id === p.id);
        return (
          <TouchableOpacity
            key={p.id}
            style={[styles.slot, selected && styles.slotOn]}
            onPress={() => togglePreset(p)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${PRESET_LABELS[p.id]} reminder at ${formatTime(p.hour, p.minute)}, ${selected ? 'on' : 'off'}`}
          >
            <Text style={styles.slotText}>
              {PRESET_LABELS[p.id]} · {formatTime(p.hour, p.minute)}  {selected ? '✓ On' : 'Off'}
            </Text>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.heading}>Set your own time</Text>
      <View style={styles.row}>
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.step} onPress={() => setHour12(hour12 === 1 ? 12 : hour12 - 1)} accessibilityRole="button" accessibilityLabel="Earlier hour">
            <Text style={styles.stepText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.value} accessibilityLabel={`Hour ${hour12}`}>{hour12}</Text>
          <TouchableOpacity style={styles.step} onPress={() => setHour12(hour12 === 12 ? 1 : hour12 + 1)} accessibilityRole="button" accessibilityLabel="Later hour">
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.colon}>:</Text>
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.step} onPress={() => setMinute(minute === 0 ? 55 : minute - 5)} accessibilityRole="button" accessibilityLabel="Earlier minute">
            <Text style={styles.stepText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.value} accessibilityLabel={`Minute ${minute}`}>{String(minute).padStart(2, '0')}</Text>
          <TouchableOpacity style={styles.step} onPress={() => setMinute(minute === 55 ? 0 : minute + 5)} accessibilityRole="button" accessibilityLabel="Later minute">
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.ampm} onPress={() => setPm(!pm)} accessibilityRole="button" accessibilityLabel={`Switch AM or PM. Now ${pm ? 'PM' : 'AM'}`}>
          <Text style={styles.ampmText}>{pm ? 'PM' : 'AM'}</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={addCustom} accessibilityRole="button" accessibilityLabel={`Add reminder at ${hour12}:${String(minute).padStart(2, '0')} ${pm ? 'PM' : 'AM'}`}>
        <Text style={styles.addText}>Add {hour12}:{String(minute).padStart(2, '0')} {pm ? 'PM' : 'AM'}</Text>
      </TouchableOpacity>

      {times.filter((t) => t.id.startsWith('c-')).map((t) => (
        <View key={t.id} style={styles.custom}>
          <Text style={styles.customText}>{formatTime(t.hour, t.minute)}</Text>
          <TouchableOpacity onPress={() => update(times.filter((x) => x.id !== t.id))} accessibilityRole="button" accessibilityLabel={`Remove reminder at ${formatTime(t.hour, t.minute)}`}>
            <Text style={styles.remove}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={styles.test}
        onPress={async () => {
          if (!(await sendTest())) denied();
          else Alert.alert('Reminder set', 'You will get a test reminder in 5 seconds.');
        }}
        accessibilityRole="button"
        accessibilityLabel="Send me a test reminder"
      >
        <Text style={styles.testText}>Send me a test reminder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 24, padding: 18, borderRadius: 12, borderWidth: 3, borderColor: '#25365d', backgroundColor: '#ffffff' },
  title: { fontSize: 24, fontWeight: 'bold', fontFamily: 'Georgia', color: '#25365d' },
  sub: { fontSize: 18, color: '#3b4a6b', marginTop: 6, marginBottom: 12 },
  heading: { fontSize: 20, fontWeight: 'bold', color: '#25365d', marginTop: 20, marginBottom: 8 },
  slot: { borderWidth: 3, borderColor: '#25365d', borderRadius: 12, padding: 14, minHeight: 60, justifyContent: 'center', marginTop: 8 },
  slotOn: { backgroundColor: '#6da67a', borderColor: '#6da67a' },
  slotText: { fontSize: 20, fontWeight: 'bold', color: '#25365d' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center' },
  step: { width: 48, height: 56, borderWidth: 3, borderColor: '#25365d', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 28, fontWeight: 'bold', color: '#25365d' },
  value: { fontSize: 28, fontWeight: 'bold', color: '#25365d', minWidth: 44, textAlign: 'center' },
  colon: { fontSize: 28, fontWeight: 'bold', color: '#25365d' },
  ampm: { width: 64, height: 56, borderRadius: 12, backgroundColor: '#6386ad', alignItems: 'center', justifyContent: 'center' },
  ampmText: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  addBtn: { backgroundColor: '#6da67a', borderRadius: 12, padding: 14, minHeight: 60, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  addText: { fontSize: 20, fontWeight: 'bold', color: '#25365d' },
  custom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 3, borderColor: '#6da67a', borderRadius: 12, padding: 14, marginTop: 8 },
  customText: { fontSize: 20, fontWeight: 'bold', color: '#25365d' },
  remove: { fontSize: 18, fontWeight: 'bold', color: '#b14a4a' },
  test: { borderWidth: 3, borderColor: '#6386ad', borderRadius: 12, padding: 14, minHeight: 60, justifyContent: 'center', alignItems: 'center', marginTop: 18 },
  testText: { fontSize: 20, fontWeight: 'bold', color: '#6386ad' },
});
