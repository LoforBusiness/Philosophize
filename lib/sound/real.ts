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
// 2. `playsInSilentMode: false`. A phone on silent stays silent. These are
//    decorative, and decoration does not get to override the switch on the side
//    of the device.
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
  swish: require('../../assets/sound/swish.wav'),
  tap: require('../../assets/sound/tap.wav'),
  reward: require('../../assets/sound/reward.wav'),
} as const;

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
const THROTTLE: Record<Cue, number> = { step: 90, swish: 120, tap: 40, reward: 400 };
const lastAt: Partial<Record<Cue, number>> = {};

async function prepare() {
  if (ready) return;
  ready = true;
  try {
    await setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    });
  } catch {
    // An audio-mode failure must not cost us the sounds themselves.
  }
  for (const k of Object.keys(SOURCES) as Key[]) {
    try {
      const p = createAudioPlayer(SOURCES[k]);
      // Levels are baked into the files (see scripts/make-sounds.mjs), so this is
      // the one place to trim a cue that turns out loud in situ.
      p.volume = k === 'reward' ? 0.9 : 0.65;
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
  play: (cue: Cue) => {
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
