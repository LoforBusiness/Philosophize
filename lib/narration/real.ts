import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { NARRATION } from './manifest';
import { useNarrationStore, type NarrationPhase } from './store';
import type { NarrationProvider } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// THE VOICE, PLAYED.
//
// IMPORTS expo-audio AT MODULE SCOPE, so nothing may import this file directly — go
// through ./index, which wraps the require in a try (lib/sound/real.ts, same rule).
//
// It is not a `cue`. A cue is a moment the app marks, and since 11 Sep 2026 only two
// of them are heard (lib/feedback.ts); the narration is the lesson itself being read,
// one clip per spoken beat, and nothing else plays under it.
//
// The audio mode is the one the cues already set, stated again here because the
// narration may start before the cues have prepared: never take audio focus, play on
// a phone set to vibrate, and stop when the app leaves the screen.
// ─────────────────────────────────────────────────────────────────────────────

/** From `play()` to the first sample on a player that is already loaded. */
const LATENCY_MS = 60;
/** How long a line may wait for its clip to load before it is given up on. */
const LOAD_WAIT_MS = 1500;

let loadedLesson: string | null = null;
const players = new Map<number, AudioPlayer>();
let current: { lessonId: string; beat: number; player: AudioPlayer; cancel?: () => void } | null = null;
let modeSet = false;

const mark = (lessonId: string, beat: number, phase: NarrationPhase, at = Date.now()) =>
  useNarrationStore.setState({ lessonId, beat, phase, at });

function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
  }).catch(() => {});
}

function stop() {
  const c = current;
  if (!c) return;
  current = null;
  c.cancel?.();
  try { c.player.pause(); } catch {}
  const s = useNarrationStore.getState();
  if (s.lessonId === c.lessonId && s.beat === c.beat && s.phase === 'playing') mark(c.lessonId, c.beat, 'stopped');
}

function release() {
  stop();
  for (const p of players.values()) {
    try { p.remove(); } catch {}
  }
  players.clear();
  loadedLesson = null;
}

function prepare(lessonId: string) {
  if (loadedLesson === lessonId) return;
  release();
  const lines = NARRATION[lessonId];
  if (!lines) return;
  loadedLesson = lessonId;
  ensureMode();
  for (const [k, line] of Object.entries(lines)) {
    try {
      players.set(Number(k), createAudioPlayer(line.clip, { updateInterval: 100 }));
    } catch {
      // A clip that will not load leaves its beat silent and the rest narrated.
    }
  }
}

function play(lessonId: string, beat: number) {
  stop();
  prepare(lessonId);
  const player = players.get(beat);
  if (!player) { mark(lessonId, beat, 'failed'); return; }
  const me: NonNullable<typeof current> = { lessonId, beat, player };
  current = me;

  const begin = () => {
    if (current !== me) return;
    // Rewound first and started once the rewind lands: a line replayed after an
    // unmute would otherwise start from wherever it was paused.
    player.seekTo(0).then(() => {
      if (current !== me) return;
      player.play();
      mark(lessonId, beat, 'playing', Date.now() + LATENCY_MS);
    }).catch(() => {
      if (current === me) current = null;
      mark(lessonId, beat, 'failed');
    });
  };

  if (player.isLoaded) { begin(); return; }
  let timer: ReturnType<typeof setTimeout> | null = null;
  const sub = player.addListener('playbackStatusUpdate', (status) => {
    if (!status.isLoaded) return;
    cleanup();
    begin();
  });
  timer = setTimeout(() => {
    cleanup();
    if (current === me) { current = null; mark(lessonId, beat, 'failed'); }
  }, LOAD_WAIT_MS);
  function cleanup() {
    sub.remove();
    if (timer) { clearTimeout(timer); timer = null; }
  }
  me.cancel = cleanup;
}

export const realNarration: NarrationProvider = {
  isSupported: () => true,
  prepare,
  play,
  stop,
  release,
};
