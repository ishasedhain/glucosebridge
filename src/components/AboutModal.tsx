import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { clearConsent } from '../lib/consent';
import { clearAllReadings } from '../lib/storage';

type Props = {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

// Privacy & About screen with the medical disclaimer and a "Delete all my data" button.
export default function AboutModal({ visible, onClose, onDeleted }: Props) {
  // Asks for confirmation, then erases every reading from the phone.
  const wipe = () => {
    Alert.alert(
      'Delete all your data?',
      'This permanently removes every saved reading from this phone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllReadings();
            await clearConsent();
            onDeleted();
            Alert.alert('Done', 'All readings were deleted from this phone.', [
              { text: 'OK', onPress: onClose },
            ]);
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={onClose} accessibilityLabel="Close">
          <Text style={styles.close}>Close</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Privacy & About</Text>

        <Text style={styles.heading}>What Glucose Bridge is</Text>
        <Text style={styles.body}>
          A simple log for fingerstick blood sugar readings. You can scan your meter or type
          the number, then share a one-page summary with your doctor.
        </Text>

        <Text style={styles.heading}>Not medical advice</Text>
        <Text style={styles.body}>
          Glucose Bridge is a logging tool, not a medical device. It does not diagnose,
          treat, or give advice. Always check each reading against your meter and follow
          your doctor's guidance.
        </Text>

        <Text style={styles.heading}>Your data</Text>
        <Text style={styles.body}>
          Readings are stored only on this phone. There are no accounts, no ads, and no
          tracking. Deleting the app or tapping the button below erases your readings.
          Your PDF summary and family messages are only shared when you choose to send them.
        </Text>

        <Text style={styles.heading}>Scanning your meter</Text>
        <Text style={styles.body}>
          When you scan, the photo is sent to a server and then to Google's Gemini service
          to read the number. This app does not keep the photo. Google's free service may
          use submitted content to improve its products, so avoid scanning anything other
          than your meter screen.
        </Text>

        <Text style={styles.heading}>Who it is for</Text>
        <Text style={styles.body}>
          Intended for adults, or for children using it with a parent or guardian.
        </Text>

        <Text style={styles.heading}>Contact</Text>
        <Text style={styles.body}>Questions or feedback: CORRECT_EMAIL</Text>

        <TouchableOpacity
          style={styles.delete}
          onPress={wipe}
          accessibilityLabel="Delete all my data"
        >
          <Text style={styles.deleteText}>Delete all my data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close">
          <Text style={styles.closeBtnText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, backgroundColor: '#ebf1f8' },
  close: { fontSize: 22, color: '#6386ad', fontWeight: 'bold', marginBottom: 12 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#25365d', marginBottom: 8 },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#25365d', marginTop: 20 },
  body: { fontSize: 19, color: '#25365d', marginTop: 6, lineHeight: 27 },
  delete: { backgroundColor: '#b91c1c', borderRadius: 12, padding: 20, marginTop: 32, alignItems: 'center' },
  deleteText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  closeBtn: { borderWidth: 2, borderColor: '#25365d', borderRadius: 12, padding: 18, marginTop: 12, marginBottom: 40, alignItems: 'center' },
  closeBtnText: { color: '#25365d', fontSize: 22, fontWeight: 'bold' },
});