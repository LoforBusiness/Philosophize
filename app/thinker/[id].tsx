import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUIStore } from '@/stores/uiStore';

// Deep-link target for the home-screen widget: philosophize://thinker/<id>.
// Lands here, drops the user on the Thinkers tab, and opens that philosopher's
// profile sheet (mounted globally in the root layout).
export default function ThinkerDeepLink() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const openPhilosopher = useUIStore((s) => s.openPhilosopher);

  useEffect(() => {
    router.replace('/(app)/philosophers');
    if (id) {
      // Let the navigation settle before opening the global sheet.
      const t = setTimeout(() => openPhilosopher(id), 60);
      return () => clearTimeout(t);
    }
  }, [id, openPhilosopher]);

  return <View style={{ flex: 1, backgroundColor: '#FAFAF7' }} />;
}
