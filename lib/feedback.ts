import * as Haptics from 'expo-haptics';
import { sound, type Cue } from './sound';
import { useUserDataStore } from '@/stores/userDataStore';

// ─────────────────────────────────────────────────────────────────────────────
// ONE CALL PER MOMENT, TWO CHANNELS OUT.
//
// Everything in the app that wants to be felt or heard calls `cue()`. It decides
// what that moment gets, which is the only way the two stay in step: a sound
// added at one call site and a buzz added at another drift into a product where
// some taps click and others rumble.
//
// WHY BOTH, AND WHY IT MATTERS RIGHT NOW. `expo-haptics` has been in the binary
// since the first commit, so it works for everyone on Play today. `expo-audio` is
// new, and §22's rule is absolute — an over-the-air update cannot add a native
// module to a binary that lacks one — so every current reader gets silence until
// a new build ships. Routing both through here means this update is still worth
// publishing: the taps and the reward acquire a feel now, and grow a voice when
// the binary catches up. Nothing has to be re-wired then.
//
// NOT EVERY CUE BUZZES. A footfall is the obvious trap: the stickman takes about
// two steps a second, and a phone that vibrates twice a second is not atmosphere,
// it is a fault. Walking and gestures are sound-only; only the two cues the
// reader CAUSED get a haptic.
// ─────────────────────────────────────────────────────────────────────────────

type Buzz = 'light' | 'success' | null;

const HAPTIC: Record<Cue, Buzz> = {
  step: null,     // ~2/sec while walking — a buzz here is a fault, not a texture
  swish: null,    // ambient, not caused by the reader
  tap: 'light',   // they touched something; it answers
  reward: 'success',
};

/** Read once per call rather than subscribed: cues fire from animation frames. */
const on = () => useUserDataStore.getState().settings.soundEffects !== false;

export function cue(name: Cue) {
  if (!on()) return;
  sound.play(name);
  const buzz = HAPTIC[name];
  if (!buzz) return;
  // Fire-and-forget: haptics returns a promise that rejects on devices without a
  // motor, and an unhandled rejection from a decoration is not worth a crash.
  try {
    if (buzz === 'light') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}

/** Warm the clips up. Called once the app is past its launch screen. */
export function prepareFeedback() {
  if (!on()) return;
  void sound.prepare();
}

/** Whether this binary can make a noise at all — Settings asks before offering. */
export const soundSupported = () => sound.isSupported();
