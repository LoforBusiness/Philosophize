import { createClient } from '@supabase/supabase-js';
import { supabaseSecureStorage } from './secureStorage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Session (incl. the refresh token) is kept in the OS Keychain/Keystore on
    // native via expo-secure-store, falling back to AsyncStorage on web/failure.
    storage: supabaseSecureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
