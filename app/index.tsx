import { View } from 'react-native';
import AuthPanel from '@/components/shared/AuthPanel';
import WelcomeAnimation from '@/components/welcome/WelcomeAnimation';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

// First screen on launch when there's no Supabase session. On the very first
// open we play the welcome animation once; afterwards (and on every later launch)
// it's the shared auth panel — the same panel that also backs /sign-in.
export default function AuthScreen() {
  const hydrated = useUserDataStore((s) => s._hasHydrated);
  const hasSeenWelcome = useUserDataStore((s) => s.hasSeenWelcome);
  // This screen mounts UNDERNEATH the animated launch screen, which covers the
  // whole boot for a few seconds. Without this the welcome's timeline would
  // start on mount and play its opening lines to a screen nobody can see.
  const launchDone = useUIStore((s) => s.launchDone);

  // Wait for the persisted flag before deciding, so we never flash the auth panel
  // in front of the intro (or vice-versa).
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: '#FAFAF7' }} />;

  // The welcome dissolves itself out before flipping hasSeenWelcome, so this
  // swap lands on a faded screen rather than cutting.
  if (!hasSeenWelcome) return <WelcomeAnimation start={launchDone} />;

  return <AuthPanel />;
}
