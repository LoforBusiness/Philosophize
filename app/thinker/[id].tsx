import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUIStore } from '@/stores/uiStore';

// Deep-link target for the home-screen widget: philosophize://thinker/<id>.
// Parks the requested thinker in the UI store, then lands on the Thinkers tab.
// The Thinkers screen opens the profile sheet once it has actually mounted and
// painted (see philosophers/index.tsx) — a store handoff, not a timer, so it
// works on cold starts too and the sheet's slide-up never gets swallowed.
export default function ThinkerDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const setPendingPhilosopher = useUIStore((s) => s.setPendingPhilosopher);

  useEffect(() => {
    if (id) setPendingPhilosopher(id);
    router.replace('/(app)/philosophers');
  }, [id, setPendingPhilosopher]);

  return <View style={{ flex: 1, backgroundColor: '#FAFAF7' }} />;
}
