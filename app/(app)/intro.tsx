import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import ScreenTransition from '@/components/shared/ScreenTransition';
import ProfessorIntro from '@/components/professor/ProfessorIntro';
import HardPaywall from '@/components/paywall/HardPaywall';
import { leaveIntro, type IntroFrom } from '@/components/professor/openIntro';
import { useUserDataStore } from '@/stores/userDataStore';
import { usePassState } from '@/stores/subscriptionStore';
import { C } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// THE PROFESSOR'S INTRO, AS A SCREEN.
//
// Reached only through `openIntro`, from Home's Quick Start or the Learn tab, and
// never pushed by anything on its own (2026-09-25). The film plays; when it ends or
// is skipped the flag is set, so neither door offers it again on this account. Then:
//
//   · a reader with the Pass, a trial, a reviewer account or the retired on-device
//     trial goes back to where they came from, which now shows the branches;
//   · a free reader meets the paywall (`source: intro`). Starting the trial or
//     buying, or closing it, goes back the same way — and with the Pass, the
//     branches are open.
// ─────────────────────────────────────────────────────────────────────────────

export default function IntroScreen() {
  const { from } = useLocalSearchParams<{ from?: IntroFrom }>();
  const markSeen = useUserDataStore((s) => s.markProfessorIntroSeen);
  const pass = usePassState();
  const [phase, setPhase] = useState<'film' | 'paywall'>('film');
  // Every hook is above this line (§17 rule 1).

  const leave = () => leaveIntro(from);

  if (phase === 'film') {
    return (
      <ScreenTransition bg={C.paper}>
        <ProfessorIntro
          onDone={() => {
            markSeen();
            if (pass.kind === 'free') setPhase('paywall');
            else leave();
          }}
        />
      </ScreenTransition>
    );
  }
  return (
    <ScreenTransition bg={C.paper}>
      <HardPaywall source="intro" onClose={leave} onUnlocked={leave} />
    </ScreenTransition>
  );
}
