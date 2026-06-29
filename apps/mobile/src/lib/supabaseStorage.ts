import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthStorageAdapter } from '@neurodivergent-flow/api';

export const supabaseAuthStorage: AuthStorageAdapter = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};
