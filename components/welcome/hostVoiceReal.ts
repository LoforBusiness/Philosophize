import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { VOICE_LINES } from './welcomeVoice';

// ─────────────────────────────────────────────────────────────────────────────
// THE SEATED HOST'S VOICE, PLAYED.
//
// IMPORTS expo-audio AT MODULE SCOPE, so nothing may import this file directly — go
// through ./hostVoice, which wraps the require in a try (lib/narration/real.ts, same
// rule, same reason: a missing native module must never be a crash on launch).
//
// One MP3 holds all seven lines end to end (scripts/make-welcome-voice.mjs). A line
// plays by seeking to its `at` and pausing a little past its end, which lands in the
// silence the encoder laid after the take's release — the lessons' own construction
// (lib/narration/real.ts), including the pad that stops the last word being clipped.
//
// The screen starts each line on its own clock, so if a frame is dropped the words
// and the voice can never drift apart by more than one line's worth: every line
// re-anchors them.
// ─────────────────────────────────────────────────────────────────────────────

const CLIP = require('@/assets/welcome/voice/welcome.mp3');
/** How far past a take's last sample the line is paused. See END_PAD_S in lib/narration/real.ts. */
const END_PAD_S = 0.2;

let player: AudioPlayer | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;
let token = 0;

function prepare() {
  if (player) return;
  setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
  }).catch(() => {});
  try {
    player = createAudioPlayer(CLIP, { updateInterval: 50 });
  } catch {
    player = null;
  }
}

function stop() {
  token += 1;
  if (stopTimer) clearTimeout(stopTimer);
  stopTimer = null;
  try { player?.pause(); } catch {}
}

function playLine(i: number) {
  prepare();
  const line = VOICE_LINES[i];
  const p = player;
  if (!line || !p) return;
  stop();
  const me = token;
  const go = () => {
    if (me !== token) return;
    p.seekTo(line.at).then(() => {
      if (me !== token) return;
      p.play();
      stopTimer = setTimeout(() => {
        if (me !== token) return;
        try { p.pause(); } catch {}
      }, (line.dur + END_PAD_S) * 1000);
    }).catch(() => {});
  };
  if (p.isLoaded) { go(); return; }
  // Still loading: wait for it, but never longer than a line is worth — a voice that
  // arrives late would talk over the NEXT line's words.
  const started = Date.now();
  const poll = () => {
    if (me !== token) return;
    if (p.isLoaded) { go(); return; }
    if (Date.now() - started < 1200) setTimeout(poll, 50);
  };
  poll();
}

function release() {
  stop();
  try { player?.remove(); } catch {}
  player = null;
}

export const hostVoiceReal = { supported: true, prepare, playLine, stop, release };
