import { useState, useCallback, useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getReadings, Reading } from '@/lib/storage';
import { wakeServer } from '@/lib/scan';
import ConsentModal from '@/components/ConsentModal';
import AboutModal from '@/components/AboutModal';
import LatestCard from '@/components/LatestCard';

// The first screen: shows the latest reading in plain words.
export default function TodayScreen() {
  const router = useRouter();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [aboutOpen, setAboutOpen] = useState(false);

  // Quietly wakes the server when the app opens
  useEffect(() => {
    wakeServer();
  }, []);

  // Loads readings, newest first
  const load = async () => setReadings((await getReadings()).reverse());
  useFocusEffect(useCallback(() => { load(); }, []));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ConsentModal />
      <AboutModal
        visible={aboutOpen}
        onClose={() => setAboutOpen(false)}
        onDeleted={load}
      />

      <Text style={styles.title} accessibilityRole="header">Today</Text>

      <LatestCard readings={readings} />

      <TouchableOpacity
        style={styles.add}
        onPress={() => router.navigate('/add')}
        accessibilityRole="button"
        accessibilityLabel="Add a reading"
      >
        <Text style={styles.addText}>Add a reading</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.help}
        onPress={() => router.navigate('/help')}
        accessibilityRole="button"
        accessibilityLabel="Need help? Ask a question"
      >
        <Text style={styles.helpText}>Need help? Ask a question</Text>
      </TouchableOpacity>

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
  help: { borderWidth: 3, borderColor: '#1a56db', borderRadius: 12, padding: 18, minHeight: 64, justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  helpText: { color: '#1a56db', fontSize: 24, fontWeight: 'bold' },
  add: { backgroundColor: '#0a7d3b', borderRadius: 12, padding: 20, minHeight: 68, justifyContent: 'center', alignItems: 'center' },
  addText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  disclaimer: { fontSize: 18, color: '#444', marginTop: 32, textAlign: 'center' },
  about: { borderWidth: 3, borderColor: '#111', borderRadius: 12, padding: 16, minHeight: 64, justifyContent: 'center', marginTop: 12, marginBottom: 40, alignItems: 'center' },
  aboutText: { color: '#111', fontSize: 22, fontWeight: 'bold' },
});
