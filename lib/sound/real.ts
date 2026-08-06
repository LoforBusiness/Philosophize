import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import type { Cue, SoundProvider } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// THE SOUNDS, PLAYED.
//
// IMPORTS expo-audio AT MODULE SCOPE, which is exactly why nothing may import
// this file directly — go through ./index, which wraps the require in a try. On a
// binary built before expo-audio was a dependency the native module is absent and
// this file throws on the way in; catching that is the difference between "the
// app is quiet until they update" and "the app crashes on launch for everyone
// still on build 16". Same rule, same reason, as lib/notifications (§22).
//
// ── THE THREE DECISIONS THAT MATTER ─────────────────────────────────────────
//
// 1. `mixWithOthers`. The app must never take audio focus. Someone reading
//    philosophy on a bus is very likely playing music, and a footstep that pauses
//    their album is a reason to uninstall. Expo documents this mode as the one
//    for "sound effects, UI feedback, or short audio clips", and on Android it
//    means no focus request at all.
//
// 2. `playsInSilentMode: TRUE`, and the false version of this shipped and made the
//    whole feature silent for a real reader on a real phone.
//
//    The reasoning behind `false` was "a phone on silent stays silent; decoration
//    does not override the switch on the side of the device." That is an iOS mental
//    model and it is wrong here. expo-audio's own docs are explicit: "On Android,
//    when false, playback is suppressed when the ringer mode is silent OR VIBRATE."
//
//    Vibrate is not a request for silence on Android — it is where an enormous
//    number of phones simply live, all day. Ringer mode governs ringtones and
//    notifications; the media stream is separate, which is why YouTube and Spotify
//    play perfectly well on a phone set to vibrate. Opting into `false` extended
//    ringtone suppression to media and made every cue in the app inaudible for
//    anyone whose phone was not actively ringing. The symptom was exact and
//    complete: haptics fired, nothing was heard.
//
//    The reader already has the control this was trying to give them, and it is a
//    better one — the media volume slider, plus a Sound toggle in Settings.
//
// 3. PLAYERS ARE MADE ONCE AND REWOUND, not created per hit. `createAudioPlayer`
//    decodes the file; doing that on every footfall would allocate a player twice
//    a second while walking. Rewinding costs nothing.
// ─────────────────────────────────────────────────────────────────────────────

// Two footfalls, alternated — one sample repeated at walking cadence turns into a
// typewriter within three steps.
const SOURCES = {
  stepA: require('../../assets/sound/step-a.wav'),
  stepB: require('../../assets/sound/step-b.wav'),
  settle: require('../../assets/sound/settle.wav'),
  impact: require('../../assets/sound/impact.wav'),
  // Three fingertips, by how weighty the control is: wood for a card or button,
  // glass for a switch, card for a light row. Chosen with `step` at the call site.
  tap: require('../../assets/sound/tap.wav'),
  tapGlass: require('../../assets/sound/tap-glass.wav'),
  tapCard: require('../../assets/sound/tap-card.wav'),
  // Three gestures, by how the hand is actually moving — see gestures.ts.
  whoosh1: require('../../assets/sound/whoosh-1.wav'),
  whoosh2: require('../../assets/sound/whoosh-2.wav'),
  whoosh3: require('../../assets/sound/whoosh-3.wav'),
  reward: require('../../assets/sound/reward.wav'),
  page: require('../../assets/sound/page.wav'),
  // The correct-answer note, up the D triad. A run of right answers climbs it and
  // then holds at the top — see `play`.
  right1: require('../../assets/sound/right-1.wav'),
  right2: require('../../assets/sound/right-2.wav'),
  right3: require('../../assets/sound/right-3.wav'),
  rethink: require('../../assets/sound/rethink.wav'),
  keep: require('../../assets/sound/keep.wav'),
  tick1: require('../../assets/sound/tick-1.wav'),
  tick2: require('../../assets/sound/tick-2.wav'),
  tick3: require('../../assets/sound/tick-3.wav'),
  badge: require('../../assets/sound/badge.wav'),
  rankup: require('../../assets/sound/rankup.wav'),
} as const;

/** The variant ladders. Indexed by the `step` argument; the last entry repeats. */
const RIGHT = ['right1', 'right2', 'right3'] as const;
const TICK = ['tick1', 'tick2', 'tick3'] as const;
/** wood · glass · card — by the weight of the control that was touched. */
const TAP = ['tap', 'tapGlass', 'tapCard'] as const;
/** sleeve · fast hand · heavy swing — by the measured speed of the gesture. */
const WHOOSH = ['whoosh1', 'whoosh2', 'whoosh3'] as const;

type Key = keyof typeof SOURCES;

const players: Partial<Record<Key, AudioPlayer>> = {};
let ready = false;
let enabled = true;
let footToggle = 0;

/**
 * The floor between two hits of the same cue, in ms.
 *
 * Without it a fast tapper machine-guns the same player: each hit rewinds the
 * clip to zero, so instead of overlapping taps you get one clip that never gets
 * past its attack — a buzz. Per-cue, because a footfall's natural rate is much
 * slower than a tap's.
 */
const THROTTLE: Record<Cue, number> = {
  step: 90, settle: 200, impact: 400, whoosh: 150,
  tap: 40, page: 90, rethink: 200, keep: 150,
  // 25ms, well under the counter's own cadence: the throttle is here to stop a
  // runaway, not to thin the run. Thinning it would make the count stutter.
  tick: 25,
  right: 200, reward: 400, badge: 200, rankup: 800,
};
const lastAt: Partial<Record<Cue, number>> = {};

/**
 * Per-clip trim. The MIX is baked into the files — `finish(buf, peak)` in
 * scripts/make-sounds.mjs is where a cue's loudness relative to the others is
 * decided — so this only exists to lift the three that are meant to dominate the
 * moment they play in. Everything else shares one level on purpose: a per-cue
 * volume table is how a sound set drifts out of balance one nudge at a time.
 */
const LEVEL: Partial<Record<Key, number>> = { reward: 0.9, badge: 0.9, rankup: 0.95 };

async function prepare() {
  if (ready) return;
  ready = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    });
  } catch {
    // An audio-mode failure must not cost us the sounds themselves.
  }
  for (const k of Object.keys(SOURCES) as Key[]) {
    try {
      const p = createAudioPlayer(SOURCES[k]);
      p.volume = LEVEL[k] ?? 0.65;
      players[k] = p;
    } catch {
      // A single clip that will not decode leaves the rest working.
    }
  }
}

function fire(key: Key) {
  const p = players[key];
  if (!p) return;
  try {
    // Rewind first: a player still running from the previous hit would otherwise
    // ignore play() entirely.
    void p.seekTo(0);
    p.play();
  } catch {
    // Never let a decorative sound take down the frame that triggered it.
  }
}

export const realSound: SoundProvider = {
  isSupported: () => true,
  prepare,
  setEnabled: (on) => { enabled = on; },
  play: (cue: Cue, step = 0) => {
    if (!enabled) return;
    const now = Date.now();
    if (now - (lastAt[cue] ?? 0) < THROTTLE[cue]) return;
    lastAt[cue] = now;
    if (!ready) { void prepare(); return; }
    if (cue === 'step') {
      footToggle ^= 1;
      fire(footToggle ? 'stepA' : 'stepB');
      return;
    }
    // A run of correct answers CLIMBS and then holds at the top — clamped, so a
    // ten-question lesson does not need ten notes.
    if (cue === 'right') { fire(RIGHT[Math.min(Math.max(step | 0, 0), RIGHT.length - 1)]); return; }
    // The variant is the CALLER'S measurement, not a preference: how weighty the
    // control is, and how fast the hand was actually moving.
    if (cue === 'tap') { fire(TAP[Math.min(Math.max(step | 0, 0), TAP.length - 1)]); return; }
    if (cue === 'whoosh') { fire(WHOOSH[Math.min(Math.max(step | 0, 0), WHOOSH.length - 1)]); return; }
    // The counter CYCLES, so the rise is continuous however long the count runs.
    if (cue === 'tick') { fire(TICK[(((step | 0) % TICK.length) + TICK.length) % TICK.length]); return; }
    fire(cue);
  },
  release: () => {
    for (const k of Object.keys(players) as Key[]) {
      try { players[k]?.remove(); } catch {}
      delete players[k];
    }
    ready = false;
  },
};
