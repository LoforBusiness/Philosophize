import { createContext, useContext, useRef, type ReactNode } from 'react';
import { useUserDataStore } from '@/stores/userDataStore';

interface NarrationCtx {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  /** The active narrator registers its play() so the header replay button can call it. */
  registerPlayer: (fn: (() => void) | null) => void;
  replay: () => void;
}

const Context = createContext<NarrationCtx | null>(null);

export function NarrationProvider({ children }: { children: ReactNode }) {
  const enabled = useUserDataStore((s) => s.voiceEnabled);
  const setEnabled = useUserDataStore((s) => s.setVoiceEnabled);
  const playerRef = useRef<(() => void) | null>(null);

  const value: NarrationCtx = {
    enabled,
    setEnabled,
    registerPlayer: (fn) => {
      playerRef.current = fn;
    },
    replay: () => {
      playerRef.current?.();
    },
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

// Safe outside a provider: narration simply stays off and text shows in full.
export function useNarration(): NarrationCtx {
  return (
    useContext(Context) ?? {
      enabled: false,
      setEnabled: () => {},
      registerPlayer: () => {},
      replay: () => {},
    }
  );
}
