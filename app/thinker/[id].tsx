import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUIStore } from '@/stores/uiStore';

// Deep-link target for the home-screen widget: philosophize://thinker/<id>.
// Parks the requested thinker in the UI store, then lands on Home, which opens the
// profile sheet once it has focus and has painted (see its pending-thinker effect)
// — a store handoff, not a timer, so it works on cold starts too and the sheet's
// slide-up never gets swallowed. It landed on the Thinkers tab until that tab went
// (2026-09-29); the widget is compiled into the installed app, so this link has to
// keep working whatever the tabs are.
export default function ThinkerDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setPendingPhilosopher = useUIStore((s) => s.setPendingPhilosopher);

  useEffect(() => {
    if (id) setPendingPhilosopher(id);
    router.replace('/(app)');
  }, [id, setPendingPhilosopher]);

  return <View style={{ flex: 1, backgroundColor: '#FAFAF7' }} />;
}
