import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// A simple drawn version of the Glucose Bridge logo.
export default function Logo() {
  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel="Glucose Bridge">
      <View style={styles.box}>
        <Ionicons name="water" size={30} color="#ffffff" />
      </View>
      <Text style={styles.name}>Glucose Bridge</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  box: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#6386ad', borderWidth: 4, borderColor: '#81a4cd', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 30, fontWeight: 'bold', color: '#25365d', marginLeft: 12, fontFamily: 'Georgia' },
});
