import { View } from 'react-native';
import AuthPanel from '@/components/shared/AuthPanel';
import WelcomeAnimation from '@/components/welcome/WelcomeAnimation';
import { useUserDataStore } from '@/stores/userDataStore';

// First screen on launch when there's no Supabase session. On the very first
// open we play the welcome animation once; afterwards (and on every later launch)
// it's the shared auth panel — the same panel that also backs /sign-in.
export default function AuthScreen() {
  const hydrated = useUserDataStore((s) => s._hasHydrated);
  const hasSeenWelcome = useUserDataStore((s) => s.hasSeenWelcome);

  // Wait for the persisted flag before deciding, so we never flash the auth panel
  // in front of the intro (or vice-versa).
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: '#FAFAF7' }} />;

  if (!hasSeenWelcome) return <WelcomeAnimation />;

  return <AuthPanel />;
}
