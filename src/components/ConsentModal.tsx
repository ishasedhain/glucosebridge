import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { hasConsented, setConsented } from '@/lib/consent';

// Full-screen notice shown the first time the app opens.
// The user must tap "I understand" before using the app.
export default function ConsentModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    hasConsented().then(ok => setVisible(!ok));
  }, []);

  const accept = async () => {
    await setConsented();
    setVisible(false);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Before you start</Text>

        <Text style={styles.heading}>What this app does</Text>
        <Text style={styles.body}>
          GlucoseBridge helps you keep a log of your blood sugar readings and make a
          one-page summary to share with your doctor.
        </Text>

        <Text style={styles.heading}>Not medical advice</Text>
        <Text style={styles.body}>
          This is a logging tool only. It does not diagnose anything or tell you what to do.
          Always follow your doctor's guidance.
        </Text>

        <Text style={styles.heading}>Your readings stay on your phone</Text>
        <Text style={styles.body}>
          There are no accounts. Your saved readings are stored only on this phone.
        </Text>

        <Text style={styles.heading}>About scanning</Text>
        <Text style={styles.body}>
          When you scan your meter, the photo is sent to a server and to Google's Gemini
          service only to read the number. The photo is not saved by this app. Always check
          that the number matches your meter before saving.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={accept}
          accessibilityLabel="I understand and want to continue"
        >
          <Text style={styles.buttonText}>I understand</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 72, backgroundColor: '#fff' },
  title: { fontSize: 34, fontWeight: 'bold', color: '#111', marginBottom: 12 },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#111', marginTop: 20 },
  body: { fontSize: 19, color: '#222', marginTop: 6, lineHeight: 27 },
  button: { backgroundColor: '#0a7d3b', borderRadius: 12, padding: 20, marginTop: 32, marginBottom: 40, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
});