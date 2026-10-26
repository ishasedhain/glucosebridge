import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SLOTS, getEnabled, setEnabled, sendTest } from '@/lib/reminders';

export default function Reminders() {
  const [on, setOn] = useState<string[]>([]);

  useEffect(() => {
    getEnabled().then(setOn);
  }, []);

  const denied = () =>
    Alert.alert('Notifications are off', 'Turn them on for Expo Go in your phone Settings.');

  const toggle = async (id: string) => {
    const next = on.includes(id) ? on.filter((x) => x !== id) : [...on, id];
    const ok = await setEnabled(next);
    if (!ok) return denied();
    setOn(next);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">Daily reminders</Text>
      <Text style={styles.sub}>Tap the times you want a reminder to check and log your sugar.</Text>
      {SLOTS.map((s) => {
        const selected = on.includes(s.id);
        return (
          <TouchableOpacity
            key={s.id}
            style={[styles.slot, selected && styles.slotOn]}
            onPress={() => toggle(s.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`${s.label} reminder at ${s.time}, ${selected ? 'on' : 'off'}`}
          >
            <Text style={styles.slotText}>
              {s.label} · {s.time}  {selected ? '✓ On' : 'Off'}
            </Text>
          </TouchableOpacity>
        );
      })}
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
  slot: { borderWidth: 3, borderColor: '#25365d', borderRadius: 12, padding: 14, minHeight: 60, justifyContent: 'center', marginTop: 8 },
  slotOn: { backgroundColor: '#6da67a', borderColor: '#6da67a' },
  slotText: { fontSize: 20, fontWeight: 'bold', color: '#25365d' },
  test: { borderWidth: 3, borderColor: '#6386ad', borderRadius: 12, padding: 14, minHeight: 60, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  testText: { fontSize: 20, fontWeight: 'bold', color: '#6386ad' },
});
