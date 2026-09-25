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
// it is a fault. Walking and gestures get no haptic; only the cues the reader
// CAUSED do.
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// AND ONLY TWO CUES ARE HEARD.
//
// Decided 11 Sep 2026. Every lesson is going to be read aloud by a voice that is
// on by default, and nothing the app plays may land on top of it. So the footfalls,
// the gesture whooshes, the answer notes, the knock on a wrong answer, the clasp on
// a saved quote, the XP ticks, the badge bell, the streak seal and a scene's struck
// object all went silent here, in one table, and their clips were deleted.
//
// What is left is the end of a lesson: the reward chime, or the rank-up fanfare
// that replaces it. Both play after the last beat, when nothing is being read.
//
// AND SINCE 25 SEP 2026, THE STAMP ON THE DAY STREAK. The argument a third sound
// has to win is against the narration, and this one wins it the same way the
// other two do: the ceremony is a screen of its own after the last beat. It had
// been silent while the reward chime played underneath it, starting before the
// die had even landed; now the stamp is heard on the frame it strikes and the
// chime stands aside on that lesson (LessonReward.tsx). All three were chosen by
// ear — see the header of scripts/lib/chime.mjs.
//
// Every moment still calls `cue()`, because the haptics were never the problem
// and they keep doing their job. A fourth sound has to be argued against the
// narration first, and `check:sound` fails the build until it has been.
// ─────────────────────────────────────────────────────────────────────────────
const HEARD: Record<Cue, boolean> = {
  step: false,
  impact: false,
  whoosh: false,
  rethink: false,
  keep: false,
  right: false,
  tick: false,
  badge: false,
  seal: true,
  reward: true,
  rankup: true,
};

/**
 * How far into the lesson-complete sound its chord lands, in ms.
 *
 * It opens on a short swoosh, so a caller timing it to something that LANDS on
 * screen (the unit review's stamp) starts it this much early. A caller that only
 * marks a screen appearing plays it straight, because there the swoosh is the
 * screen arriving. Matches the 0.3 in `lessonComplete()` in scripts/make-sounds.mjs.
 */
export const REWARD_HIT_MS = 300;

/**
 * Whether a moment makes a sound. The lesson player asks before it schedules one,
 * so a silent footfall costs nothing per frame instead of a callback per step.
 */
export const heard = (name: Cue): boolean => HEARD[name];

type Buzz = 'light' | 'medium' | 'heavy' | 'success' | null;

const HAPTIC: Record<Cue, Buzz> = {
  // ── not caused by the reader, or far too frequent to be felt ───────────────
  step: null,     // ~2.5/sec while walking — a buzz here is a fault, not a texture
  impact: null,   // something in the SCENE is struck, not something they touched
  whoosh: null,   // the figure moves; the reader did not
  tick: null,     // fifteen in a row down the XP counter
  // ── the reader did something ───────────────────────────────────────────────
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
  // THE DAY IS STRUCK, and this is the one cue in the app whose whole point is
  // weight. `success` is the notification pattern -- two light taps, the buzz a
  // phone makes to confirm a form was submitted -- and it is wrong for a die
  // landing. A seal is a single heavy contact, so it takes the heaviest IMPACT
  // there is and lands on the frame the die touches the paper.
  seal: 'heavy',
};

/** Read once per call rather than subscribed: cues fire from animation frames. */
const on = () => useUserDataStore.getState().settings.soundEffects !== false;

/**
 * `step` is passed straight through to the sound layer. It chose a variant for the
 * two cues that had a ladder, the answer note and the XP tick, and both are silent
 * now; call sites still pass it so nothing has to change if one comes back. It
 * never affects the haptic.
 */
export function cue(name: Cue, step = 0) {
  if (!on()) return;
  if (HEARD[name]) sound.play(name, step);
  const buzz = HAPTIC[name];
  if (!buzz) return;
  // Fire-and-forget: haptics returns a promise that rejects on devices without a
  // motor, and an unhandled rejection from a decoration is not worth a crash.
  try {
    if (buzz === 'light') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (buzz === 'medium') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (buzz === 'heavy') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {}
}

/**
 * TOUCHED, BUT NOT HEARD.
 *
 * Navigating is not an event. Opening a branch or a tab is how you move through
 * the app rather than something that happens in it, and a click on every one of
 * those was the last of the small frequent sounds to go — after the page turn and
 * the walk's arrival, for the same reason.
 *
 * The HAPTIC stays, because it is not the thing that was objected to and it does
 * the useful half of the job: it confirms the press landed without adding to the
 * noise. This is deliberately not a `Cue` — a cue is a sound with a feel attached,
 * and there is no sound here to attach one to.
 */
export function touch() {
  try { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}

/** Warm the clips up. Called once the app is past its launch screen. */
export function prepareFeedback() {
  if (!on()) return;
  void sound.prepare();
}

/** Whether this binary can make a noise at all — Settings asks before offering. */
export const soundSupported = () => sound.isSupported();
