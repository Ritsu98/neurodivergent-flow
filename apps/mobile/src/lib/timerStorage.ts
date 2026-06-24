import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getStoredTimerEnd(storageKey: string): Promise<number | null> {
  const stored = await AsyncStorage.getItem(storageKey);
  if (!stored) return null;
  const end = Number(stored);
  if (!Number.isFinite(end) || end <= Date.now()) {
    await AsyncStorage.removeItem(storageKey);
    return null;
  }
  return end;
}

export async function setStoredTimerEnd(storageKey: string, end: number): Promise<void> {
  await AsyncStorage.setItem(storageKey, String(end));
}

export async function clearStoredTimerEnd(storageKey: string): Promise<void> {
  await AsyncStorage.removeItem(storageKey);
}

export async function clearStoredTimerEnds(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
}
