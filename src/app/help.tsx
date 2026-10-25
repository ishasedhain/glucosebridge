import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen() {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

  const questions = [
    { id: '1', title: 'How do I add a reading?', answer: 'Tap the Add tab at the bottom, enter your glucose value, and save it.' },
    { id: '2', title: 'How do I scan my meter?', answer: 'Use the camera feature to take a clear photo of your glucose meter screen.' },
    { id: '3', title: 'The scan could not read my meter', answer: 'Ensure good lighting and make sure the numbers on the meter screen are fully visible and in focus.' },
    { id: '4', title: 'What do the colors mean?', answer: 'Green means in range (70-180). Orange means below 70. Red means above 180.' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Help</Text>
        <Ionicons name="settings-outline" size={24} color="#3B7A63" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          Green means in the standard range of 70 to 180. Orange means below 70. Red means above 180. Your doctor may set a different range for you, so please ask them.
        </Text>
      </View>

      <TouchableOpacity style={styles.stopButton}>
        <Text style={styles.stopButtonText}>Stop reading</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Tap a question</Text>

      {questions.map((q) => (
        <TouchableOpacity 
          key={q.id} 
          style={styles.questionCard}
          onPress={() => setSelectedQuestion(selectedQuestion === q.id ? null : q.id)}
        >
          <Text style={styles.questionText}>{q.title}</Text>
          {selectedQuestion === q.id && (
            <Text style={styles.answerText}>{q.answer}</Text>
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  card: {
    backgroundColor: '#E2E8F0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardText: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 22,
  },
  stopButton: {
    backgroundColor: '#DC2626',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
  },
  answerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});
