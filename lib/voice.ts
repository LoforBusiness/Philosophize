import * as Speech from 'expo-speech';

// Resolves the best available "deep British male" voice from the device/browser
// TTS engine. Free, no API key. Falls back gracefully when none is installed.

let cached: string | null | undefined; // undefined = unresolved, null = use default
let pending: Promise<string | null> | null = null;

const MALE_NAMES = [
  'daniel', 'arthur', 'george', 'oliver', 'brian', 'ryan',
  'thomas', 'james', 'jamie', 'rishi', 'mark', 'guy',
];

function score(v: Speech.Voice): number {
  const name = (v.name || '').toLowerCase();
  const lang = (v.language || '').toLowerCase().replace('_', '-');
  let s = 0;
  if (lang.startsWith('en-gb')) s += 100;
  else if (lang.startsWith('en')) s += 10;
  else s -= 60;

  if (name.includes('google uk english male')) s += 90;
  if (MALE_NAMES.some((n) => name.includes(n))) s += 60;
  if (/\bmale\b/.test(name)) s += 40; // \bmale\b does NOT match "female"
  if (name.includes('female')) s -= 60;
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
