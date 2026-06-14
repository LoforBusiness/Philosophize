import AsyncStorage from '@react-native-async-storage/async-storage';

// "Deletion tombstones": user ids whose account deletion was requested but whose
// cloud row deletion has NOT yet been confirmed (e.g. the delete happened
// offline). Kept in their own AsyncStorage key so they survive the local
// userDataStore wipe. On the next login as that user, useCloudSync refuses to
// adopt the surviving remote snapshot and re-attempts the deletion — so a failed
// erasure can never resurrect the user's data, while still letting the user
// delete + sign out offline (we never block them).
//
// A bare user id (UUID) is not sensitive, so plain AsyncStorage is fine.

const KEY = 'philosophize-deleted-accounts';

async function read(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

async function write(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* best-effort */
  }
}

export async function addTombstone(userId: string): Promise<void> {
  const ids = await read();
  if (!ids.includes(userId)) await write([...ids, userId]);
}

export async function removeTombstone(userId: string): Promise<void> {
  const ids = await read();
  if (ids.includes(userId)) await write(ids.filter((id) => id !== userId));
}

export async function hasTombstone(userId: string): Promise<boolean> {
  return (await read()).includes(userId);
}
