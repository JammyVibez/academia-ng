import * as SecureStore from 'expo-secure-store';

/**
 * SecureStore wrappers. Failures are non-fatal: the session keeps working from
 * memory and simply will not survive an app restart.
 */
export async function readItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function writeItem(key: string, value: string | null): Promise<void> {
  try {
    if (value === null) await SecureStore.deleteItemAsync(key);
    else await SecureStore.setItemAsync(key, value);
  } catch {
    // Storage unavailable — ignore, in-memory state still works.
  }
}

export async function readJSON<T>(key: string): Promise<T | null> {
  const raw = await readItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJSON(key: string, value: unknown | null): Promise<void> {
  await writeItem(key, value === null ? null : JSON.stringify(value));
}
