import * as Speech from 'expo-speech';
import { useUserDataStore } from '@/stores/userDataStore';

// Resolves the voice used for narration. A voice the user picked by hand in
// Settings always wins; otherwise we auto-select the best available "deep
// British male" voice from the device/browser TTS engine.

let cached: string | null | undefined; // undefined = unresolved, null = use default
let pending: Promise<string | null> | null = null;

const MALE_NAMES = [
  'daniel', 'arthur', 'george', 'oliver', 'brian', 'ryan',
  'thomas', 'james', 'jamie', 'rishi', 'mark', 'guy',
];

// Voices that read as deep / mature — a "middle-aged philosopher" timbre.
const DEEP_NAMES = ['daniel', 'arthur', 'george', 'brian', 'thomas', 'rishi', 'davis'];

function score(v: Speech.Voice): number {
  const name = (v.name || '').toLowerCase();
  const lang = (v.language || '').toLowerCase().replace('_', '-');
  let s = 0;
  if (lang.startsWith('en-gb')) s += 100;
  else if (lang.startsWith('en')) s += 10;
  else s -= 60;

  // Strongly prefer high-quality, natural-sounding engines — these are what
  // make narration sound human rather than robotic.
  if (/enhanced|premium|neural|natural/.test(name)) s += 85;
  if (name.includes('siri')) s += 70;

  if (name.includes('google uk english male')) s += 90;
  if (MALE_NAMES.some((n) => name.includes(n))) s += 80;
  if (DEEP_NAMES.some((n) => name.includes(n))) s += 35; // prefer a deeper timbre
  if (/\bmale\b/.test(name)) s += 50; // \bmale\b does NOT match "female"
  if (name.includes('female')) s -= 80;
  if (
    name.includes('uk') ||
    name.includes('british') ||
    name.includes('united kingdom') ||
    name.includes('great britain')
  )
    s += 25;
  return s;
}

async function resolve(): Promise<string | null> {
  // On web the voice list can be empty until `voiceschanged` fires; retry briefly.
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      if (voices && voices.length > 0) {
        const best = [...voices]
          .map((v) => ({ v, s: score(v) }))
          .sort((a, b) => b.s - a.s)[0];
        // Only use a real English voice; otherwise let the engine pick its default.
        return best && best.s > -50 ? best.v.identifier : null;
      }
    } catch {
      /* try again */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return null;
}

export async function getBritishVoice(): Promise<string | null> {
  // A hand-picked voice (Settings → Learning → Narration Voice) overrides auto.
  const manual = useUserDataStore.getState().settings?.voiceId;
  if (manual) return manual;
  if (cached !== undefined) return cached;
  if (!pending) {
    pending = resolve()
      .then((id) => {
        cached = id;
        pending = null;
        return id;
      })
      .catch(() => {
        cached = null;
        pending = null;
        return null;
      });
  }
  return pending;
}

export function getCachedBritishVoice(): string | null {
  return cached ?? null;
}

// ─── Two distinct voices (for the two-character story lesson) ────────────────
let cachedPair: [string | null, string | null] | undefined;
let pendingPair: Promise<[string | null, string | null]> | null = null;

async function resolvePair(): Promise<[string | null, string | null]> {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      if (voices && voices.length > 0) {
        const ranked = [...voices]
          .map((v) => ({ v, s: score(v) }))
          .filter((x) => x.s > -50)
          .sort((a, b) => b.s - a.s);
        if (ranked.length === 0) return [null, null];
        const a = ranked[0];
        // Prefer a second voice with a different name (a genuinely different timbre).
        const second =
          ranked.find((x) => x.v.identifier !== a.v.identifier && (x.v.name || '') !== (a.v.name || '')) ??
          ranked.find((x) => x.v.identifier !== a.v.identifier);
        return [a.v.identifier, second ? second.v.identifier : a.v.identifier];
      }
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return [null, null];
}

// Two best British male voices for a two-character reading. Falls back to the
// same voice twice (differentiated by pitch at the call site) if only one exists.
export async function getTwoBritishVoices(): Promise<[string | null, string | null]> {
  if (cachedPair !== undefined) return cachedPair;
  if (!pendingPair) {
    pendingPair = resolvePair()
      .then((p) => {
        cachedPair = p;
        pendingPair = null;
        return p;
      })
      .catch(() => {
        cachedPair = [null, null];
        pendingPair = null;
        return [null, null] as [string | null, string | null];
      });
  }
  return pendingPair;
}
