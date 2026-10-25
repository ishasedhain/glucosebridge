import { Image, StyleSheet } from 'react-native';

// The full Glucose Bridge logo (icon and name), sized to the screen width.
export default function Logo() {
  return (
    <Image
      source={require('../../assets/images/gb-logo.png')}
      style={styles.logo}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Glucose Bridge"
    />
  );
}

const styles = StyleSheet.create({
  logo: { width: '100%', maxWidth: 380, aspectRatio: 1490 / 338, alignSelf: 'center', marginBottom: 12 },
});
