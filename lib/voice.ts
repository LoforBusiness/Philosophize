import * as Speech from 'expo-speech';

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

// `listNarrationVoices` lived here — every voice the device had, best first, for a
// Settings picker to offer. It served its purpose: the list is how the narrator was
// found, by hearing all of them side by side on the real lesson text. Once that
// answer was known the list became a menu with one right item on it, so both are
// gone. `score` stays, because the fallback in `resolve` still needs to rank what
// is present when the chosen voice is absent.

/**
 * THE NARRATOR. Google's en-GB voice "B" — the one the lessons are read in.
 *
 * This is a fixed decision about the product, not a preference. It was chosen by
 * listening to every voice a phone offered, side by side, on the real lesson text;
 * the app should sound like itself on every device rather than like whatever the
 * local engine happened to rank first.
 *
 * The chain below exists because the choice CANNOT ALWAYS BE HONOURED. Voice ids
 * are supplied by the device, and `en-gb-x-gbb-network` is a Google Speech Services
 * voice: a Samsung engine, an iPhone, or a phone with no Google TTS will not have
 * it. Hard-coding one id and stopping there would mean silence on those devices —
 * and Android reports a missing voice as silence rather than as an error, so the
 * failure would be invisible. Hence: the voice, then the same voice on-device, then
 * the best-scoring English voice present, then the engine's own default.
 */
const NARRATOR = /-x-gbb-/;

async function resolve(): Promise<string | null> {
  // On web the voice list can be empty until `voiceschanged` fires; retry briefly.
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      if (voices && voices.length > 0) {
        const id = (v: Speech.Voice) => (v.identifier || '').toLowerCase();
        const narrator =
          voices.find((v) => NARRATOR.test(id(v)) && /-network$/.test(id(v))) ??
          voices.find((v) => NARRATOR.test(id(v)));
        if (narrator) return narrator.identifier;

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
 * The voice object currently narrating, for Settings to name. Null when the device
 * gave us nothing and the engine's own default is doing the reading.
 */
export async function getNarratorVoice(): Promise<Speech.Voice | null> {
  const want = await getBritishVoice();
  if (!want) return null;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return (voices || []).find((v) => v.identifier === want) ?? null;
  } catch {
    return null;
  }
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

export async function getBritishVoice(): Promise<string | null> {
  // NO MANUAL OVERRIDE. `settings.voiceId` used to be consulted here, written by a
  // picker in Settings that listed every voice the device had. The picker did its
  // job — it was how the narrator above was chosen — and then the choice was made,
  // so the list became a menu with one right answer on it. The key is gone from
  // AppSettings too, so sanitizeSettings() prunes it from AsyncStorage and the cloud
  // snapshot rather than syncing a dead string forever (§22).
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
