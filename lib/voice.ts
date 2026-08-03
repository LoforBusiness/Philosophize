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

/**
 * Everything we are allowed to judge a voice by, lowercased.
 *
 * THIS USED TO READ `v.name` ALONE, AND ON ANDROID THAT MATCHES NOTHING. iOS gives
 * voices human names — "Daniel", "Arthur (Enhanced)" — so name-matching worked, and
 * the whole table below was written against it. Android's Google engine does not:
 * the name IS the identifier, `en-gb-x-gbb-network`, with no person, no gender and
 * no quality word in it. So every en-GB voice scored exactly +100, the sort was a
 * tie, and the pick was whichever the OS happened to return first — which is how a
 * flat, compressed, possibly-female voice ended up reading the lessons.
 */
function tokens(v: Speech.Voice): string {
  return `${v.name || ''} ${v.identifier || ''}`.toLowerCase().replace(/_/g, '-');
}

/** True when the engine renders this voice at full quality rather than on-device. */
export function isHiFi(v: Speech.Voice): boolean {
  const t = tokens(v);
  return /-network\b/.test(t) || /enhanced|premium|neural|natural|siri/.test(t);
}

function score(v: Speech.Voice): number {
  const t = tokens(v);
  const lang = (v.language || '').toLowerCase().replace('_', '-');
  let s = 0;
  if (lang.startsWith('en-gb')) s += 100;
  else if (lang.startsWith('en')) s += 10;
  else s -= 60;

  // Strongly prefer high-quality, natural-sounding engines — these are what
  // make narration sound human rather than robotic.
  if (/enhanced|premium|neural|natural/.test(t)) s += 85;
  if (t.includes('siri')) s += 70;

  // Android ships two copies of its best voices under IDs that differ by one
  // word: `en-gb-x-gbb-network` against `en-gb-x-gbb-local`. The network one is
  // server-rendered and is the difference between "reads" and "buzzes"; the local
  // one is a small compressed fallback. Nothing in the NAME distinguishes them.
  if (/-network\b/.test(t)) s += 60;
  if (/-local\b/.test(t)) s -= 15;

  // Google's en-GB voices are identified by opaque code rather than by person:
  // gba, gbb, gbc, gbd, rjs. By ear gbb/gbd/rjs read male and gba/gbc female, but
  // that mapping is UNDOCUMENTED and has moved between engine versions — so it
  // only nudges the automatic pick. The Settings picker is what actually settles
  // it, because on this the ear is the only reliable instrument.
  if (/-x-(gbb|gbd|rjs)-/.test(t)) s += 55;
  if (/-x-(gba|gbc)-/.test(t)) s -= 30;

  if (t.includes('google uk english male')) s += 90;
  if (MALE_NAMES.some((n) => t.includes(n))) s += 80;
  if (DEEP_NAMES.some((n) => t.includes(n))) s += 35; // prefer a deeper timbre
  if (/\bmale\b/.test(t)) s += 50; // \bmale\b does NOT match "female"
  if (t.includes('female')) s -= 80;
  if (
    t.includes('uk') ||
    t.includes('british') ||
    t.includes('united kingdom') ||
    t.includes('great britain')
  )
    s += 25;
  return s;
}

/**
 * A readable label for a voice, for the Settings picker.
 *
 * An opaque Android code is turned into a letter — "British voice B" says nothing
 * false, where `en-gb-x-gbb-network` says nothing at all. A real name from iOS is
 * shown as it is.
 */
export function describeVoice(v: Speech.Voice): { title: string; sub: string } {
  const id = (v.identifier || '').toLowerCase();
  const name = (v.name || '').trim();
  const lang = `${v.language || ''} ${id}`.toLowerCase();
  const region = lang.includes('en-gb') || lang.includes('en_gb') ? 'British' : 'English';

  // An Android "name" looks like a language tag; a real name does not.
  const opaque = !name || /^[a-z]{2}[-_][a-z]{2}/i.test(name);
  const code = id.match(/-x-([a-z]{3})-/)?.[1];
  const title = !opaque
    ? name
    : code
      ? `${region} voice ${code.slice(-1).toUpperCase()}`
      : `${region} voice`;

  const net = /-network\b/.test(id);
  const sub = net
    ? 'Higher quality · rendered online'
    : isHiFi(v)
      ? 'Higher quality'
      : 'On-device · works offline';
  return { title, sub };
}

/**
 * Every voice worth offering, best first.
 *
 * Deliberately NOT filtered down to a shortlist. The scoring above is a guess made
 * from identifiers, and the whole reason this list exists is that the guess was
 * wrong on a real phone — so the reader gets to hear all of them and overrule it.
 */
export async function listNarrationVoices(): Promise<Speech.Voice[]> {
  let voices: Speech.Voice[] = [];
  // Same retry as `resolve`: the list can come back empty until the engine is up.
  for (let attempt = 0; attempt < 8 && voices.length === 0; attempt++) {
    try {
      voices = (await Speech.getAvailableVoicesAsync()) || [];
    } catch {
      /* try again */
    }
    if (voices.length === 0) await new Promise((r) => setTimeout(r, 250));
  }
  const seen = new Set<string>();
  return voices
    .map((v) => ({ v, s: score(v) }))
    .filter((x) => x.s > -50)
    .sort((a, b) => b.s - a.s)
    .filter((x) => {
      if (seen.has(x.v.identifier)) return false;
      seen.add(x.v.identifier);
      return true;
    })
    .map((x) => x.v);
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

/**
 * The on-device twin of a server-rendered Android voice, or null if there is none.
 *
 * `en-gb-x-gbb-network` and `en-gb-x-gbb-local` are the same voice: one rendered on
 * Google's servers, one squeezed onto the phone. The network one sounds better and
 * is what the picker ranks first — but it needs a connection, and a lesson on the
 * Underground has to keep talking.
 */
export function offlineTwin(id: string | null | undefined): string | null {
  if (!id) return null;
  return /-network$/.test(id) ? id.replace(/-network$/, '-local') : null;
}

/** Identifiers this device actually has, cached. Empty means "could not tell". */
let knownIds: Set<string> | undefined;
async function deviceHas(id: string): Promise<boolean> {
  if (knownIds === undefined) {
    try {
      const v = await Speech.getAvailableVoicesAsync();
      knownIds = new Set((v || []).map((x) => x.identifier));
    } catch {
      knownIds = new Set();
    }
  }
  // An empty set means the enumeration failed, not that the device has no voices.
  // Overriding the user's choice on that basis would be a guess dressed as a fact.
  return knownIds.size === 0 || knownIds.has(id);
}

export async function getBritishVoice(): Promise<string | null> {
  // A hand-picked voice (Settings → Narration) overrides auto.
  const manual = useUserDataStore.getState().settings?.voiceId;
  // A VOICE ID IS DEVICE-SPECIFIC, AND SETTINGS RIDE THE CLOUD SNAPSHOT. Signing in
  // on a new phone restores `voiceId` along with everything else, and that phone may
  // simply not have `en-gb-x-gbb-network`. Android answers a missing voice with
  // silence rather than an error, so the failure would look exactly like the feature
  // being broken. Check first, and fall through to the automatic pick if it is gone.
  if (manual && (await deviceHas(manual))) return manual;
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
