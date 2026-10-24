import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Reading } from '@/lib/storage';
import { statusFor } from '@/lib/status';
import { familyMessage } from '@/lib/family';

type Props = { readings: Reading[] }; // newest first

// Big card showing the latest reading in plain words, with a button to text it to family.
export default function LatestCard({ readings }: Props) {
  if (readings.length === 0) {
    return (
      <View style={[styles.card, { borderColor: '#555', backgroundColor: '#f3f4f6' }]}>
        <Text style={styles.small}>Your latest reading</Text>
        <Text style={styles.plain}>
          No readings yet. Go to the Add tab to scan your meter or type a number.
        </Text>
      </View>
    );
  }

  const latest = readings[0];
  const st = statusFor(latest.value);

  // Opens the phone's share sheet with a short message for family
  const sendToFamily = async () => {
    try {
      await Share.share({ message: familyMessage(readings) });
    } catch (e) {
      // The user closed the share sheet or sharing failed. Nothing to do.
    }
  };

  return (
    <View style={[styles.card, { borderColor: st.color, backgroundColor: st.bg }]}>
      <Text style={styles.small}>Your latest reading</Text>
      <Text
        style={styles.big}
        accessibilityLabel={`${latest.value} milligrams per deciliter`}
      >
        {latest.value} <Text style={styles.unit}>mg/dL</Text>
      </Text>
      <Text style={styles.label}>{st.label}</Text>
      <Text style={styles.plain}>{st.note}</Text>
      <Text style={styles.when}>
        {latest.tag} · {new Date(latest.time).toLocaleString()}
      </Text>

      <TouchableOpacity
        style={styles.share}
        onPress={sendToFamily}
        accessibilityRole="button"
        accessibilityLabel="Send this reading to family"
        accessibilityHint="Opens your messages so you can text a short update"
      >
        <Text style={styles.shareText}>Send to family</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 3, borderLeftWidth: 12, borderRadius: 14, padding: 18, marginBottom: 20 },
  small: { fontSize: 20, color: '#111', fontWeight: 'bold' },
  big: { fontSize: 56, fontWeight: 'bold', color: '#111', marginTop: 4 },
  unit: { fontSize: 24, fontWeight: 'normal' },
  label: { fontSize: 26, fontWeight: 'bold', color: '#111', marginTop: 4 },
  plain: { fontSize: 20, color: '#111', marginTop: 6, lineHeight: 28 },
  when: { fontSize: 18, color: '#333', marginTop: 8 },
  share: { backgroundColor: '#1a56db', borderRadius: 12, padding: 16, minHeight: 64, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  shareText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});
