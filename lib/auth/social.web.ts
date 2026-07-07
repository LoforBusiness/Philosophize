// Web / Expo Go stub for native social sign-in. Metro picks this file on web, so
// the native Apple/Google modules are never imported there and the build bundles.
// The auth screen hides the social buttons when socialAuthAvailable is false.

export type SocialResult = { status: 'success' | 'canceled' | 'error'; message?: string };

export const socialAuthAvailable: boolean = false;

export function configureGoogleSignIn() {
  /* no-op on web */
}

export async function isAppleSignInAvailable(): Promise<boolean> {
  return false;
}

export async function signInWithApple(): Promise<SocialResult> {
  return { status: 'error', message: 'Apple sign-in is only available in the mobile app.' };
}

export async function signInWithGoogle(): Promise<SocialResult> {
  return { status: 'error', message: 'Google sign-in is only available in the mobile app.' };
}

export async function signOutSocial(): Promise<void> {
  /* no native Google session on web */
}
