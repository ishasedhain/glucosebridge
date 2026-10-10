import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { exportPdf } from '@/lib/pdf';
import { computeStats, rangeColor } from '@/lib/stats';
import { getReadings, Reading } from '@/lib/storage';

export default function SummaryScreen() {
  const [readings, setReadings] = useState<Reading[]>([]);

  // Reload readings every time this tab is opened
  useFocusEffect(
    useCallback(() => {
      getReadings().then(setReadings);
    }, [])
  );

  const stats = computeStats(readings);

  // Makes the PDF and opens the share sheet
  const share = async () => {
    try {
      await exportPdf(readings);
    } catch (e) {
      Alert.alert('Could not make the PDF', 'Please try again.');
    }
  };

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.big}>No readings yet.</Text>
        <Text style={styles.sub2}>Add one on the Home tab.</Text>
      </View>
    );
  }

  const recent = readings.slice(-30);
  const chartMax = Math.max(250, ...recent.map(r => r.value));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Summary</Text>

      <Text style={styles.stat}>Average: {stats.avg} mg/dL</Text>
      <Text style={styles.stat}>Lowest: {stats.min}   Highest: {stats.max}</Text>
      <Text style={styles.stat}>Readings: {stats.count}</Text>

      <Text style={styles.sub}>Time in range</Text>
      <View
        style={styles.bar}
        accessibilityLabel={`Time in range: ${stats.pctLow} percent low, ${stats.pctInRange} percent in range, ${stats.pctHigh} percent high`}
      >
        <View style={{ flex: stats.pctLow || 0.001, backgroundColor: '#d97706' }} />
        <View style={{ flex: stats.pctInRange || 0.001, backgroundColor: '#0a7d3b' }} />
        <View style={{ flex: stats.pctHigh || 0.001, backgroundColor: '#dc2626' }} />
      </View>
      <Text style={styles.legend}>
        Low {stats.pctLow}% · In range {stats.pctInRange}% · High {stats.pctHigh}%
      </Text>
      <Text style={styles.note}>Target range: 70 to 180 mg/dL</Text>

      <Text style={styles.sub}>Last {recent.length} readings</Text>
      <View style={styles.chart} accessibilityLabel="Bar chart of your recent readings">
        {recent.map(r => (
          <View
            key={r.id}
            style={{
              flex: 1,
              marginHorizontal: 1,
              height: `${(r.value / chartMax) * 100}%`,
              backgroundColor: rangeColor(r.value),
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            }}
          />
        ))}
      </View>
      <Text style={styles.note}>Oldest on the left, newest on the right</Text>

      <TouchableOpacity
        style={styles.pdf}
        onPress={share}
        accessibilityLabel="Share one page summary as a PDF for your doctor"
      >
        <Text style={styles.pdfText}>Share one-page summary (PDF)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  big: { fontSize: 28, fontWeight: 'bold', color: '#111' },
  sub2: { fontSize: 20, color: '#444', marginTop: 8 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 16, color: '#111' },
  stat: { fontSize: 22, marginBottom: 6, color: '#111' },
  sub: { fontSize: 24, fontWeight: 'bold', marginTop: 28, marginBottom: 8, color: '#111' },
  bar: { flexDirection: 'row', height: 36, borderRadius: 8, overflow: 'hidden' },
  legend: { fontSize: 18, marginTop: 8, color: '#222' },
  note: { fontSize: 16, marginTop: 6, color: '#555' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 180, borderBottomWidth: 2, borderColor: '#333' },
  pdf: { backgroundColor: '#0a7d3b', borderRadius: 12, padding: 20, marginTop: 32, marginBottom: 40, alignItems: 'center' },
  pdfText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
});