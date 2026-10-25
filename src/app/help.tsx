import { useState, useCallback } from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';

// Common questions and answers. They work with no internet.
const QUICK = [
  {
    q: 'How do I add a reading?',
    a: 'Tap the Add tab. Tap Scan Meter and point the camera at your meter screen, or type the number. Check that it matches your meter, pick a tag like Fasting, then tap Save.',
  },
  {
    q: 'How do I scan my meter?',
    a: 'On the Add tab, tap Scan Meter. Hold the phone steady with the meter screen filling the photo, in good light with no glare. The number appears in the box. Always check that it matches your meter before you save.',
  },
  {
    q: 'The scan could not read my meter',
    a: 'Try again with better light and the meter screen filling the photo. Move so there is no glare on the screen. If it still does not work, you can type the number in yourself.',
  },
  {
    q: 'What do the colors mean?',
    a: 'Green means in the standard range of 70 to 180. Orange means below 70. Red means above 180. Your doctor may set a different range for you, so please ask them.',
  },
  {
    q: 'What are the tags for?',
    a: 'Tags tell the app when you checked, like Fasting, Before meal, After meal, or Exercise. Pick the one that fits. The Summary uses them to show patterns, like readings after meals compared with before meals.',
  },
  {
    q: 'How do I fix a mistake?',
    a: 'Go to the History tab and tap the reading. Change the number and tap Update Reading.',
  },
  {
    q: 'How do I delete a reading?',
    a: 'Go to the History tab and tap the reading. Then tap Delete This Reading.',
  },
  {
    q: 'How do I send it to my family?',
    a: 'On the Today tab, tap Send to family. Choose Messages or another app, then send.',
  },
  {
    q: 'How do I show my doctor?',
    a: 'Go to the Summary tab and scroll down. Tap Share one-page summary, then send or print it for your doctor.',
  },
  {
    q: 'What is Hear my summary?',
    a: 'On the Summary tab, tap Hear my summary and the app reads your summary out loud. This helps if the words are hard to read.',
  },
  {
    q: 'Does it work without internet?',
    a: 'Yes, mostly. Typing a reading, History, the Summary, and the one-page summary all work without internet. Only Scan Meter needs internet. If you have no internet, just type the number.',
  },
  {
    q: 'The camera does not work',
    a: 'The app needs your permission to use the camera. Go to your phone Settings, find this app, and turn on Camera. You can also type your number in without the camera.',
  },
  {
    q: 'Is my information private?',
    a: 'Your readings stay on your phone. There are no accounts. A meter photo is only used to read the number. On the Today tab you can tap Privacy and About to learn more.',
  },
  {
    q: 'How do I delete all my data?',
    a: 'On the Today tab, tap Privacy and About, then tap Delete all my data. This erases every reading on your phone.',
  },
  {
    q: 'My number looks very high or low',
    a: 'This app cannot give medical advice. Please follow your doctor or pharmacist instructions. If you feel very sick or think it is an emergency, call 911.',
  },
];

// A help screen: tap a common question to read the answer and hear it out loud.
export default function HelpScreen() {
  const [answer, setAnswer] = useState('');
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

  // Stops the voice
  const stop = () => {
    Speech.stop();
    setSpeaking(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title} accessibilityRole="header">Help</Text>

      {answer !== '' && (
        <>
          <Text style={styles.answer} accessibilityLiveRegion="polite">{answer}</Text>
          {speaking && (
            <TouchableOpacity style={styles.stop} onPress={stop} accessibilityRole="button" accessibilityLabel="Stop reading">
              <Text style={styles.stopText}>Stop reading</Text>
            </TouchableOpacity>
          )}
        </>
      )}

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

      <Text style={styles.note}>
        This helper only explains how to use the app. For health questions, please ask your doctor or pharmacist. In an emergency, call 911.
      </Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, backgroundColor: '#ebf1f8' },
  title: { textAlign: 'center', fontSize: 28, fontWeight: 'bold', fontFamily: 'Georgia', color: '#25365d', marginBottom: 8 },
  sub: { fontSize: 24, fontWeight: 'bold', color: '#25365d', marginTop: 20, marginBottom: 8 },
  quick: { borderWidth: 3, borderColor: '#6386ad', borderRadius: 12, padding: 16, minHeight: 64, justifyContent: 'center', marginBottom: 10 },
  quickText: { fontSize: 22, color: '#25365d', fontWeight: 'bold' },
  stop: { backgroundColor: '#b91c1c', borderRadius: 12, padding: 16, minHeight: 60, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  stopText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  answer: { fontSize: 24, color: '#25365d', lineHeight: 34, marginTop: 12, padding: 16, backgroundColor: '#dbe6f3', borderRadius: 12 },
  note: { fontSize: 18, color: '#3b4a6b', marginTop: 24, lineHeight: 26 },
});
