import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'consent-v1';

// True if the user already tapped "I understand" on the first-launch screen.
export async function hasConsented(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEY)) === 'yes';
}

// Remembers that the user accepted.
export async function setConsented() {
  await AsyncStorage.setItem(KEY, 'yes');
}

// Forgets the consent (used by "Delete all my data").
export async function clearConsent() {
  await AsyncStorage.removeItem(KEY);
}