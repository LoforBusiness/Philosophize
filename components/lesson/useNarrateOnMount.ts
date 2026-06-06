import { useEffect } from 'react';
import * as Speech from 'expo-speech';
import { useUserDataStore } from '@/stores/userDataStore';
import { getBritishVoice } from '@/lib/voice';

// Speaks a one-off passage aloud when a component mounts (used for feedback
// panels). Respects the global voice toggle and uses the British voice.
export function useNarrateOnMount(text: string) {
  const enabled = useUserDataStore((s) => s.voiceEnabled);
  useEffect(() => {
    if (!enabled || !text) return;
    let cancelled = false;
    Speech.stop();
    getBritishVoice().then((voice) => {
      if (cancelled) return;
      try {
        Speech.speak(text, {
          voice: voice ?? undefined,
          rate: 0.9,
          pitch: 0.8,
          language: 'en-GB',
        });
      } catch {
        /* ignore — narration is best-effort */
      }
    });
    return () => {
      cancelled = true;
      Speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
