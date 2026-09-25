import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import type { Cue, SoundProvider } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// THE SOUNDS, PLAYED. THERE ARE THREE.
//
// IMPORTS expo-audio AT MODULE SCOPE, which is exactly why nothing may import
// this file directly — go through ./index, which wraps the require in a try. On a
// binary built before expo-audio was a dependency the native module is absent and
// this file throws on the way in; catching that is the difference between "the
// app is quiet until they update" and "the app crashes on launch for everyone
// still on build 16". Same rule, same reason, as lib/notifications (§22).
//
// ONLY THE CUES lib/feedback.ts HEARS HAVE A CLIP. Since 11 Sep 2026 that has
// been the end of a lesson only, so nothing plays over the narration, and the
// other sixteen clips were deleted. Since 25 Sep it is three: the lesson-complete
// hit, the stamp on the day streak and the rank-up. A cue with no clip here is
// simply silent. `check:sound` holds this list and feedback.ts's HEARD table to the
// same three.
//
// ── THE THREE DECISIONS THAT MATTER ─────────────────────────────────────────
//
// 1. `mixWithOthers`. The app must never take audio focus. Someone reading
//    philosophy on a bus is very likely playing music, and a chime that pauses
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
//    decodes the file, and doing that on every play would decode a clip that has
//    already been decoded. Rewinding costs nothing.
// ─────────────────────────────────────────────────────────────────────────────

const SOURCES = {
  reward: require('../../assets/sound/reward.wav'),
  rankup: require('../../assets/sound/rankup.wav'),
  seal: require('../../assets/sound/seal.wav'),
} as const;

type Key = keyof typeof SOURCES;

const players: Partial<Record<Key, AudioPlayer>> = {};
let ready = false;
let enabled = true;

/**
 * The floor between two hits of the same cue, in ms.
 *
 * Only a runaway guard now: each sound fires at most once a lesson. Without it a
 * repeated call would rewind the clip to zero before it got past its attack, which
 * is a buzz rather than a second chime.
 */
const THROTTLE: Record<Key, number> = { reward: 400, rankup: 800, seal: 800 };
const lastAt: Partial<Record<Key, number>> = {};

/**
 * Per-clip trim, and since 2026-09-25 it does real work. The three clips are all
 * mastered to the same peak, so measured on their loudest 400ms the lesson hit is
 * −9.9 dB, the rank-up −10.7 and the stamp −12.6. Left there, the sound heard
 * after every lesson would be the loudest thing the app plays, and the rank-up —
 * the rare one — would sound SMALLER than it.
 *
 * So the everyday sound comes down to where the old chime sat (−14.9 dB) and the
 * rank-up stays on top: about −14.3, −13.9 and −11.1.
 */
const LEVEL: Record<Key, number> = { reward: 0.6, seal: 0.7, rankup: 0.95 };

const hasClip = (cue: Cue): cue is Key => Object.prototype.hasOwnProperty.call(SOURCES, cue);

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
      p.volume = LEVEL[k];
      players[k] = p;
    } catch {
      // A single clip that will not decode leaves the other working.
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
    if (!enabled || !hasClip(cue)) return;
    const now = Date.now();
    if (now - (lastAt[cue] ?? 0) < THROTTLE[cue]) return;
    lastAt[cue] = now;
    if (!ready) { void prepare(); return; }
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
