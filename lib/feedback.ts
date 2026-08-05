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

type Buzz = 'light' | 'medium' | 'success' | null;

const HAPTIC: Record<Cue, Buzz> = {
  // ── not caused by the reader, or far too frequent to be felt ───────────────
  step: null,     // ~2.5/sec while walking — a buzz here is a fault, not a texture
  settle: null,   // the walk stopping; still not something the reader did
  impact: null,   // something in the SCENE is struck, not something they touched
  tick: null,     // fifteen in a row down the XP counter. Sound only.
  // ── the reader did something ───────────────────────────────────────────────
  tap: 'light',   // they touched something; it answers
  page: 'light',  // the beat advances under their thumb
  keep: 'light',  // a quote goes into the library
  // ── the reader was answered ────────────────────────────────────────────────
  //
  // A WRONG ANSWER GETS A SINGLE SOFT THUMP, NOT `Warning`. The warning pattern is
  // two sharp pulses and it is the buzz a phone makes when you have done something
  // it disapproves of. Picking the tempting answer in a philosophy lesson is not
  // that — the explanation underneath is the point of the whole card, and the
  // device should not editorialise before the reader has read it.
  rethink: 'medium',
  right: 'success',
  reward: 'success',
  // The badge is PRESSED into the paper, so it gets an impact rather than a
  // notification — and it usually lands while the reward chime's success buzz is
  // still fading, which two successes in a row would smear into one long rumble.
  badge: 'medium',
  rankup: 'success',
};

/** Read once per call rather than subscribed: cues fire from animation frames. */
const on = () => useUserDataStore.getState().settings.soundEffects !== false;

/**
 * `step` is passed straight through to the sound layer, which uses it for the two
 * cues that have a ladder: how far up the triad a correct answer sounds, and where
 * the XP counter is in its cycle. It never affects the haptic — a run of right
 * answers should climb audibly, not buzz harder each time.
 */
export function cue(name: Cue, step = 0) {
  if (!on()) return;
  sound.play(name, step);
  const buzz = HAPTIC[name];
  if (!buzz) return;
  // Fire-and-forget: haptics returns a promise that rejects on devices without a
  // motor, and an unhandled rejection from a decoration is not worth a crash.
  try {
    if (buzz === 'light') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (buzz === 'medium') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
