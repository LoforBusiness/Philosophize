import { View } from 'react-native';
import AuthPanel from '@/components/shared/AuthPanel';
import WelcomeAnimation, { WELCOME_VERSION } from '@/components/welcome/WelcomeAnimation';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

// First screen on launch when there's no Supabase session. On the very first
// open we play the welcome animation once; afterwards (and on every later launch)
// it's the shared auth panel — the same panel that also backs /sign-in.
export default function AuthScreen() {
  const hydrated = useUserDataStore((s) => s._hasHydrated);
  // WHICH intro they have seen, not whether they have seen one. A boolean could
  // never be re-opened, so the intro was unreachable by over-the-air update: a new
  // install plays it from the bundle inside the APK before the download lands, and
  // latches the flag on the way out. Comparing versions means bumping
  // WELCOME_VERSION reaches everyone without a store release.
  const welcomeVersion = useUserDataStore((s) => s.welcomeVersion);
  // This screen mounts UNDERNEATH the animated launch screen, which covers the
  // whole boot for a few seconds. Without this the welcome's timeline would
  // start on mount and play its opening lines to a screen nobody can see.
  const launchDone = useUIStore((s) => s.launchDone);

  // Wait for the persisted flag before deciding, so we never flash the auth panel
  // in front of the intro (or vice-versa).
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: '#FAFAF7' }} />;

  // The welcome dissolves itself out before recording the version, so this swap
  // lands on a faded screen rather than cutting.
  //
  // A signed-in reader also passes through here for a moment on boot, with a stored
  // version of 0, and does NOT get the intro: the launch screen only finishes once
  // `authChecked` is true, `start` is tied to that, and the redirect into (app) has
  // been issued by then. So the intro is mounted but never started, underneath a
  // launch screen that is still covering the whole window.
  if (welcomeVersion < WELCOME_VERSION) return <WelcomeAnimation start={launchDone} />;

  return <AuthPanel />;
}
