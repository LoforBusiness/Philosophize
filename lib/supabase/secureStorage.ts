import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage adapter for the Supabase auth session. On native it keeps the session
// (including the long-lived refresh token) in the OS Keychain / Keystore via
// expo-secure-store instead of plaintext AsyncStorage. SecureStore caps a single
// value at ~2KB, so a full session blob is split across chunk keys.
//
// Every path is DEFENSIVE so it can never lock a user out:
//   • any SecureStore failure falls back to AsyncStorage,
//   • a pre-existing AsyncStorage session is still read (so old sessions keep
//     working and migrate to SecureStore on the next write).
//
// On web SecureStore doesn't exist, so we use AsyncStorage (localStorage) exactly
// as before. (A web build should additionally use HttpOnly cookies + a strict CSP.)

const isWeb = Platform.OS === 'web';
const CHUNK = 1800; // max UTF-8 BYTES per SecureStore value (under its ~2KB limit)
const META = '__chunked__:'; // marks a chunked value; followed by the chunk count
const okKey = (k: string) => /^[A-Za-z0-9._-]+$/.test(k); // SecureStore key charset

// UTF-8 byte length of a string (falls back to code-unit length if TextEncoder
// is unavailable). SecureStore's limit is in bytes, not JS characters.
function byteLen(s: string): number {
  try {
    return new TextEncoder().encode(s).length;
  } catch {
    return s.length;
  }
}

// Split a string into pieces each <= maxBytes UTF-8 bytes, never cutting a
// multi-byte character (so plain concatenation reassembles the original).
function splitByBytes(value: string, maxBytes: number): string[] {
  let enc: TextEncoder | null = null;
  try {
    enc = new TextEncoder();
  } catch {
    enc = null;
  }
  if (!enc) {
    const out: string[] = [];
    for (let i = 0; i < value.length; i += maxBytes) out.push(value.slice(i, i + maxBytes));
    return out;
  }
  const out: string[] = [];
  let cur = '';
  let curBytes = 0;
  for (const ch of value) {
    const b = enc.encode(ch).length;
    if (cur && curBytes + b > maxBytes) {
      out.push(cur);
      cur = '';
      curBytes = 0;
    }
    cur += ch;
    curBytes += b;
  }
  if (cur) out.push(cur);
  return out;
}

async function deleteAll(key: string) {
  let head: string | null = null;
  try {
    head = await SecureStore.getItemAsync(key);
  } catch {
    head = null;
  }
  if (head && head.startsWith(META)) {
    const n = parseInt(head.slice(META.length), 10) || 0;
    for (let i = 0; i < n; i++) {
      try {
        await SecureStore.deleteItemAsync(`${key}.${i}`);
      } catch {
        /* ignore */
      }
    }
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* ignore */
  }
}

export const supabaseSecureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb || !okKey(key)) return AsyncStorage.getItem(key);
    try {
      const head = await SecureStore.getItemAsync(key);
      // Not in SecureStore yet → a legacy AsyncStorage session or a write that
      // fell back. Read it through so the user stays signed in.
      if (head == null) return AsyncStorage.getItem(key);
      if (!head.startsWith(META)) return head;
      const n = parseInt(head.slice(META.length), 10) || 0;
      let out = '';
      for (let i = 0; i < n; i++) {
        const part = await SecureStore.getItemAsync(`${key}.${i}`);
        if (part == null) return AsyncStorage.getItem(key); // corrupt → fall back
        out += part;
      }
      return out;
    } catch {
      return AsyncStorage.getItem(key);
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb || !okKey(key)) return AsyncStorage.setItem(key, value);
    try {
      await deleteAll(key); // clear any previous (possibly chunked) value
      // Drop any legacy AsyncStorage copy so reads can't pick up a stale session.
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      if (byteLen(value) <= CHUNK) {
        await SecureStore.setItemAsync(key, value);
        return;
      }
      const parts = splitByBytes(value, CHUNK);
      for (let i = 0; i < parts.length; i++) {
        await SecureStore.setItemAsync(`${key}.${i}`, parts[i]);
      }
      await SecureStore.setItemAsync(key, `${META}${parts.length}`);
    } catch {
      // Never lock the user out: fall back to AsyncStorage if SecureStore fails.
      try {
        await AsyncStorage.setItem(key, value);
      } catch {
        /* ignore */
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb || !okKey(key)) return AsyncStorage.removeItem(key);
    await deleteAll(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
