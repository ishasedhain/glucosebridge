import { useState, useCallback } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { askHelp } from '@/lib/help';

// Quick answers that work with no internet.
const QUICK = [
  {
    q: 'How do I add a reading?',
    a: 'Tap the Add tab. Tap Scan Meter and point the camera at your meter screen, or type the number. Check that it matches your meter, pick a tag like Fasting, then tap Save.',
  },
  {
    q: 'What do the colors mean?',
    a: 'Green means in the standard range of 70 to 180. Orange means below 70. Red means above 180. Your doctor may set a different range for you, so please ask them.',
  },
  {
    q: 'How do I send it to my family?',
    a: 'On the Today tab, tap Send to family. Choose Messages or another app, then send.',
  },
  {
    q: 'How do I fix a mistake?',
    a: 'Go to the History tab and tap the reading. Change the number and tap Update Reading, or tap Delete This Reading.',
  },
  {
    q: 'How do I show my doctor?',
    a: 'Go to the Summary tab and scroll down. Tap Share one-page summary, then send or print it for your doctor.',
  },
];

// A help screen: quick answers, or ask your own question by typing or by using the keyboard microphone.
export default function HelpScreen() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Stop talking when leaving this screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        Speech.stop();
        setSpeaking(false);
      };
    }, [])
  );

  // Shows an answer and reads it out loud
  const show = (text: string) => {
    setAnswer(text);
    Speech.stop();
    setSpeaking(true);
    Speech.speak(text, {
      language: 'en-US',
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  // Sends the typed or spoken question to the server
  const ask = async () => {
    const q = question.trim();
    if (!q) return;
    setBusy(true);
    const a = await askHelp(q);
    setBusy(false);
    show(
      a ??
        'I could not reach the helper right now. Please try one of the buttons above, or try again in a minute.'
    );
  };

  const stop = () => {
    Speech.stop();
    setSpeaking(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title} accessibilityRole="header">Help</Text>

      <Text style={styles.sub}>Tap a question</Text>
      {QUICK.map(item => (
        <TouchableOpacity
          key={item.q}
          style={styles.quick}
          onPress={() => show(item.a)}
          accessibilityRole="button"
          accessibilityLabel={item.q}
        >
          <Text style={styles.quickText}>{item.q}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sub}>Or ask your own question</Text>
      <Text style={styles.hint}>
        Tap the microphone on your keyboard to speak. Please do not include your name or other personal details.
      </Text>
      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="Type or speak your question"
        placeholderTextColor="#666666"
        multiline
        accessibilityLabel="Your question"
      />
      <TouchableOpacity
        style={styles.ask}
        onPress={ask}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Ask the helper"
      >
        <Text style={styles.askText}>{busy ? 'Thinking...' : 'Ask'}</Text>
      </TouchableOpacity>

      {answer !== '' && (
        <>
          <Text style={styles.answer} accessibilityLiveRegion="polite">{answer}</Text>
          {speaking && (
            <TouchableOpacity style={styles.stop} onPress={stop} accessibilityRole="button" accessibilityLabel="Stop reading">
              <Text style={styles.askText}>Stop reading</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <Text style={styles.note}>
        This helper only explains how to use the app. For health questions, please ask your doctor or pharmacist. In an emergency, call 911.
      </Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

import { View } from 'react-native';

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, backgroundColor: '#ebf1f8' },
  title: { fontSize: 34, fontWeight: 'bold', color: '#25365d', marginBottom: 8 },
  sub: { fontSize: 24, fontWeight: 'bold', color: '#25365d', marginTop: 20, marginBottom: 8 },
  hint: { fontSize: 18, color: '#3b4a6b', marginBottom: 10 },
  quick: { borderWidth: 3, borderColor: '#6386ad', borderRadius: 12, padding: 16, minHeight: 64, justifyContent: 'center', marginBottom: 10 },
  quickText: { fontSize: 22, color: '#25365d', fontWeight: 'bold' },
  input: { fontSize: 24, borderWidth: 3, borderColor: '#25365d', borderRadius: 12, padding: 14, minHeight: 110, color: '#25365d', textAlignVertical: 'top' },
  ask: { backgroundColor: '#6386ad', borderRadius: 12, padding: 18, minHeight: 64, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  stop: { backgroundColor: '#b91c1c', borderRadius: 12, padding: 16, minHeight: 60, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  askText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  answer: { fontSize: 24, color: '#25365d', lineHeight: 34, marginTop: 20, padding: 16, backgroundColor: '#dbe6f3', borderRadius: 12 },
  note: { fontSize: 18, color: '#3b4a6b', marginTop: 24, lineHeight: 26 },
});
