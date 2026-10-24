import { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { getReadings, Reading } from '@/lib/storage';
import { computeStats, rangeColor } from '@/lib/stats';
import { getInsights, spokenSummary } from '@/lib/insights';
import { exportPdf } from '@/lib/pdf';

export default function SummaryScreen() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [speaking, setSpeaking] = useState(false);

  // Reload readings every time this tab is opened, and stop talking when leaving
  useFocusEffect(
    useCallback(() => {
      getReadings().then(setReadings);
      return () => {
        Speech.stop();
        setSpeaking(false);
      };
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

  // Starts or stops reading the summary out loud
  const toggleSpeech = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(spokenSummary(readings), {
      language: 'en-US',
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
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
  const insights = getInsights(readings);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title} accessibilityRole="header">Summary</Text>

      <TouchableOpacity
        style={styles.hear}
        onPress={toggleSpeech}
        accessibilityRole="button"
        accessibilityLabel={speaking ? 'Stop reading my summary' : 'Read my summary out loud'}
      >
        <Text style={styles.btnText}>{speaking ? 'Stop reading' : 'Hear my summary'}</Text>
      </TouchableOpacity>

      <Text style={styles.stat}>Average: {stats.avg} mg/dL</Text>
      <Text style={styles.stat}>Lowest: {stats.min}   Highest: {stats.max}</Text>
      <Text style={styles.stat}>Readings: {stats.count}</Text>

      <Text style={styles.sub} accessibilityRole="header">Time in range</Text>
      <View
        style={styles.bar}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Time in range: ${stats.pctLow} percent low, ${stats.pctInRange} percent in range, ${stats.pctHigh} percent high`}
      >
        <View style={{ flex: stats.pctLow || 0.001, backgroundColor: '#d97706' }} />
        <View style={{ flex: stats.pctInRange || 0.001, backgroundColor: '#0a7d3b' }} />
        <View style={{ flex: stats.pctHigh || 0.001, backgroundColor: '#dc2626' }} />
      </View>
      <Text style={styles.legend}>
        Low {stats.pctLow}% · In range {stats.pctInRange}% · High {stats.pctHigh}%
      </Text>
      <Text style={styles.note}>Standard range used: 70 to 180 mg/dL (ask your doctor for yours)</Text>

      <Text style={styles.sub} accessibilityRole="header">Last {recent.length} readings</Text>
      <View
        style={styles.chart}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Bar chart of your last ${recent.length} readings, oldest to newest. Average ${stats.avg}, lowest ${stats.min}, highest ${stats.max}.`}
      >
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

      <Text style={styles.sub} accessibilityRole="header">Patterns</Text>
      {insights.map((line, i) => (
        <Text key={i} style={styles.insight}>• {line}</Text>
      ))}
      <Text style={styles.note}>
        These are patterns in your own readings, not medical advice.
      </Text>

      <TouchableOpacity
        style={styles.pdf}
        onPress={share}
        accessibilityRole="button"
        accessibilityLabel="Share one page summary as a PDF for your doctor"
      >
        <Text style={styles.btnText}>Share one-page summary (PDF)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  big: { fontSize: 30, fontWeight: 'bold', color: '#111' },
  sub2: { fontSize: 22, color: '#333', marginTop: 8 },
  title: { fontSize: 34, fontWeight: 'bold', marginBottom: 12, color: '#111' },
  stat: { fontSize: 24, marginBottom: 8, color: '#111' },
  sub: { fontSize: 26, fontWeight: 'bold', marginTop: 28, marginBottom: 8, color: '#111' },
  bar: { flexDirection: 'row', height: 40, borderRadius: 8, overflow: 'hidden' },
  legend: { fontSize: 20, marginTop: 8, color: '#111' },
  note: { fontSize: 18, marginTop: 6, color: '#444' },
  insight: { fontSize: 21, marginBottom: 8, color: '#111', lineHeight: 28 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 180, borderBottomWidth: 2, borderColor: '#111' },
  hear: { backgroundColor: '#1a56db', borderRadius: 12, padding: 18, minHeight: 64, justifyContent: 'center', marginBottom: 16, alignItems: 'center' },
  pdf: { backgroundColor: '#0a7d3b', borderRadius: 12, padding: 20, minHeight: 68, justifyContent: 'center', marginTop: 32, marginBottom: 40, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});
