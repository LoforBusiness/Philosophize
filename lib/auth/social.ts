import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { supabase } from '@/lib/supabase/client';
import { identifyUser } from '@/lib/posthog';
import { useUserDataStore } from '@/stores/userDataStore';

// Native social sign-in (Apple + Google) → Supabase via the ID-token flow. On the
// web preview / Expo Go the .web.ts variant of this file is used instead, so the
// native modules below are never loaded there and the build still bundles.
//
// Both providers need a native dev/standalone build AND dashboard setup to work
// (Supabase providers + Apple Developer + Google Cloud). See docs/AUTH_SOCIAL_SETUP.md.

export type SocialResult = { status: 'success' | 'canceled' | 'error'; message?: string };

// True on native builds (real modules compiled in). The web stub sets this false
// so callers can hide the social buttons where they can't work.
export const socialAuthAvailable: boolean = true;

let googleConfigured = false;

// Configure Google once at app start. Safe to call repeatedly. Does nothing if the
// Web client id env var isn't set yet (the button then surfaces a clear error).
export function configureGoogleSignIn() {
  if (googleConfigured) return;
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) return;
  GoogleSignin.configure({
    webClientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  googleConfigured = true;
}

// Apple sign-in is iOS-only (the module doesn't support Android/web). The caller
// uses this to decide whether to render the Apple button at all.
export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function signInWithApple(): Promise<SocialResult> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) {
      return { status: 'error', message: 'Apple did not return an identity token.' };
    }
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    if (error) return { status: 'error', message: error.message };

    const user = data.session?.user;
    if (user) {
      identifyUser(user.id, { signup_method: 'apple' });
      // Apple returns name/email ONLY on the very first authorization — capture now.
      const displayName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ');
      const patch: { displayName?: string; email?: string } = {};
      if (displayName) patch.displayName = displayName;
      if (credential.email) patch.email = credential.email;
      if (Object.keys(patch).length) {
        useUserDataStore.getState().setProfile(patch);
        if (displayName) {
          try {
            await supabase.auth.updateUser({ data: { full_name: displayName } });
          } catch {
            /* non-fatal */
          }
        }
      }
    }
    // app/_layout.tsx onAuthStateChange routes into the app on SIGNED_IN.
    return { status: 'success' };
  } catch (e: any) {
    if (e?.code === 'ERR_REQUEST_CANCELED') return { status: 'canceled' };
    return { status: 'error', message: e?.message ?? 'Apple sign-in failed.' };
  }
}

export async function signInWithGoogle(): Promise<SocialResult> {
  try {
    configureGoogleSignIn();
    if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      return { status: 'error', message: 'Google sign-in isn’t configured yet.' };
    }
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return { status: 'canceled' };

    const idToken = response.data?.idToken;
    if (!idToken) return { status: 'error', message: 'Google did not return an ID token.' };

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) return { status: 'error', message: error.message };

    const user = data.session?.user;
    if (user) {
      identifyUser(user.id, { signup_method: 'google' });
      const meta = (user.user_metadata ?? {}) as Record<string, any>;
      const patch: { displayName?: string; email?: string } = {};
      const name = meta.full_name ?? meta.name;
      if (name) patch.displayName = name;
      if (user.email) patch.email = user.email;
      if (Object.keys(patch).length) useUserDataStore.getState().setProfile(patch);
    }
    return { status: 'success' };
  } catch (e: any) {
    if (
      isErrorWithCode(e) &&
      (e.code === statusCodes.SIGN_IN_CANCELLED || e.code === statusCodes.IN_PROGRESS)
    ) {
      return { status: 'canceled' };
    }
    return { status: 'error', message: e?.message ?? 'Google sign-in failed.' };
  }
}
