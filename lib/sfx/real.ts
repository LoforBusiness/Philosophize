import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { SFX, type SfxId } from './clips';
import type { SfxProvider } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// A LESSON'S SOUND EFFECTS, PLAYED (LESSON_RULES AT6).
//
// IMPORTS expo-audio AT MODULE SCOPE: go through ./index, never import this directly.
//
// One player per clip, loaded ahead (`prepare`), so a cue lands on its beat instead
// of after a load. The background bed is a looping player whose volume is RAMPED,
// never stepped: a bed that jumps when a line starts is a noise in its own right.
// The audio mode is the narration's, so the voice and these mix rather than fight
// for focus.
// ─────────────────────────────────────────────────────────────────────────────

/** How far the bed comes down while a line is said, and how fast it moves. */
const DUCK = 0.4;
const RAMP_MS = 450;
const STEP_MS = 30;

const players = new Map<SfxId, AudioPlayer>();
let bedId: SfxId | null = null;
let bedGain = 0;
let ducked = false;
const ramps = new Map<AudioPlayer, ReturnType<typeof setInterval>>();
let modeSet = false;

function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers', shouldPlayInBackground: false }).catch(() => {});
}

function playerOf(id: SfxId): AudioPlayer | null {
  let p = players.get(id);
  if (p) return p;
  try {
    p = createAudioPlayer(SFX[id].clip, { updateInterval: 250 });
    if (SFX[id].bed) p.loop = true;
    players.set(id, p);
    return p;
  } catch {
    return null;
  }
}

/** Move a player's volume to `to` over RAMP_MS; `done` runs when it gets there. */
function ramp(p: AudioPlayer, to: number, done?: () => void) {
  const old = ramps.get(p);
  if (old) clearInterval(old);
  const from = p.volume;
  const steps = Math.max(1, Math.round(RAMP_MS / STEP_MS));
  let k = 0;
  const h = setInterval(() => {
    k += 1;
    const u = k / steps;
    try { p.volume = from + (to - from) * (u * u * (3 - 2 * u)); } catch {}
    if (k >= steps) {
      clearInterval(h);
      ramps.delete(p);
      done?.();
    }
  }, STEP_MS);
  ramps.set(p, h);
}

const bedLevel = () => bedGain * (ducked ? DUCK : 1);

function prepare(ids: readonly SfxId[]) {
  ensureMode();
  for (const id of ids) playerOf(id);
}

function play(id: SfxId, gain = 1) {
  ensureMode();
  const p = playerOf(id);
  if (!p) return;
  // a fade still running on this player (a hush) would pull the new cue down with it
  const old = ramps.get(p);
  if (old) { clearInterval(old); ramps.delete(p); }
  try {
    p.volume = gain;
    p.seekTo(0).then(() => p.play()).catch(() => {});
  } catch {}
}

/** Every effect still sounding fades out and stops; the bed carries on. */
const HUSH_MS = 220;
function hush() {
  for (const [id, p] of players) {
    if (SFX[id].bed) continue;
    let playing = false;
    try { playing = p.playing; } catch {}
    if (!playing) continue;
    const from = p.volume;
    const steps = Math.max(1, Math.round(HUSH_MS / STEP_MS));
    let k = 0;
    const old = ramps.get(p);
    if (old) clearInterval(old);
    const h = setInterval(() => {
      k += 1;
      try { p.volume = from * (1 - k / steps); } catch {}
      if (k >= steps) {
        clearInterval(h);
        ramps.delete(p);
        try { p.pause(); } catch {}
      }
    }, STEP_MS);
    ramps.set(p, h);
  }
}

function bed(id: SfxId | null, gain = 0.5) {
  ensureMode();
  if (id === bedId) {
    bedGain = gain;
    const p = id ? players.get(id) : null;
    if (p) ramp(p, bedLevel());
    return;
  }
  // the old loop fades out under the new one, which fades in from silence
  const was = bedId ? players.get(bedId) : null;
  if (was) ramp(was, 0, () => { try { was.pause(); } catch {} });
  bedId = id;
  bedGain = gain;
  if (!id) return;
  const p = playerOf(id);
  if (!p) return;
  try {
    p.volume = 0;
    p.play();
  } catch {}
  ramp(p, bedLevel());
}

function duck(on: boolean) {
  if (ducked === on) return;
  ducked = on;
  const p = bedId ? players.get(bedId) : null;
  if (p) ramp(p, bedLevel());
}

function release() {
  for (const h of ramps.values()) clearInterval(h);
  ramps.clear();
  for (const p of players.values()) {
    try { p.pause(); p.remove(); } catch {}
  }
  players.clear();
  bedId = null;
  ducked = false;
}

export const realSfx: SfxProvider = { isSupported: () => true, prepare, play, bed, duck, hush, release };
