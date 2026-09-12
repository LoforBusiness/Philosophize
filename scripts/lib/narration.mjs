// ─────────────────────────────────────────────────────────────────────────────
// NARRATION, SHARED: WHICH LESSONS SPEAK, WHAT EACH BEAT SAYS, WHERE EACH LINE SITS IN
// ITS LESSON'S AUDIO, AND WHETHER A TAKE IS FIT TO SHIP.
//
// scripts/install-narration.mjs takes a render into assets, scripts/encode-narration.mjs
// makes each lesson's MP3, scripts/make-narration.mjs writes the manifest and
// scripts/check-narration.mjs holds all of it in `npm run check`. All four read this
// file, so one table, one reading of a WAV, one layout and one set of limits serve them
// all.
//
// WHY A CLIP IS MEASURED AT ALL. On 12 Sep 2026 a reader heard, part way through
// metaphysics-being-4, "a loud sound, and then the voice becomes extremely distorted".
// The player had played exactly what Google sent. Beat 4's WAV carried a quarter-second
// burst at 5.25s, 2,502 samples pinned at full scale in runs up to 48 long, and speech
// smeared into noise after it. Chirp 3 HD never renders a line the same way twice, so a
// broken take is bad luck, and nothing between the render and the phone had measured
// one. The fix was a second take of the same words. The limits below make the next
// broken take a build error instead of something a reader finds.
//
// WHY A LESSON SHIPS AS ONE FILE. EAS Update takes at most 1,000 assets in one update.
// With a clip a line, the first 85 lessons had already put 710 narration clips into an
// update of 809 assets, and the whole library is 1,718 lines. So each line stays a WAV
// master here, and a lesson ships one MP3 with its lines laid end to end (layoutOf).
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ASSETS = path.join(ROOT, 'assets', 'narration');
export const MANIFEST = path.join(ROOT, 'lib', 'narration', 'manifest.ts');
const SCRIPTS = path.join(ROOT, 'components', 'lesson', 'cinematic');

/**
 * The narrated lessons, and the script each one plays: every lesson in the app, each
 * branch in reading order. A lesson added here needs its lines rendered and installed
 * before make-narration will run, and check:narration fails on a lesson the app can open
 * that is missing from this table.
 */
export const LESSONS = {
  'logic-arguments-1': 'argumentScript.ts',
  'logic-arguments-2': 'builderScript.ts',
  'logic-arguments-3': 'valid3Script.ts',
  'logic-arguments-4': 'strong4Script.ts',
  'logic-arguments-5': 'logic5Script.ts',
  'logic-arguments-6': 'logic6Script.ts',
  'logic-arguments-7': 'logic7Script.ts',
  'logic-arguments-8': 'logic8Script.ts',
  'logic-arguments-9': 'logic9Script.ts',
  'logic-arguments-10': 'logic10Script.ts',
  'logic-arguments-11': 'logic11Script.ts',
  'logic-arguments-12': 'logic12Script.ts',
  'logic-arguments-13': 'logic13Script.ts',
  'logic-arguments-14': 'logic14Script.ts',
  'logic-arguments-32': 'logic32Script.ts',
  'logic-arguments-15': 'logic15Script.ts',
  'logic-arguments-16': 'logic16Script.ts',
  'logic-arguments-17': 'logic17Script.ts',
  'logic-arguments-18': 'logic18Script.ts',
  'logic-arguments-19': 'logic19Script.ts',
  'logic-arguments-20': 'logic20Script.ts',
  'logic-arguments-31': 'logic31Script.ts',
  'logic-arguments-21': 'logic21Script.ts',
  'logic-arguments-22': 'logic22Script.ts',
  'logic-arguments-23': 'logic23Script.ts',
  'logic-arguments-24': 'logic24Script.ts',
  'logic-arguments-25': 'logic25Script.ts',
  'logic-arguments-26': 'logic26Script.ts',
  'logic-arguments-27': 'logic27Script.ts',
  'logic-arguments-28': 'logic28Script.ts',
  'logic-arguments-29': 'logic29Script.ts',
  'logic-arguments-30': 'logic30Script.ts',
  'logic-arguments-33': 'logic33Script.ts',
  'logic-arguments-34': 'logic34Script.ts',
  'logic-arguments-35': 'logic35Script.ts',
  'logic-arguments-36': 'logic36Script.ts',
  'logic-arguments-37': 'logic37Script.ts',
  'logic-arguments-38': 'logic38Script.ts',
  'logic-arguments-39': 'logic39Script.ts',
  'logic-arguments-40': 'logic40Script.ts',
  'logic-arguments-41': 'logic41Script.ts',
  'ethics-ethics-1': 'ethicsScript.ts',
  'ethics-ethics-2': 'ethics2Script.ts',
  'ethics-ethics-3': 'ethics3Script.ts',
  'ethics-ethics-4': 'ethics4Script.ts',
  'ethics-ethics-5': 'ethics5Script.ts',
  'ethics-ethics-6': 'ethics6Script.ts',
  'ethics-ethics-7': 'ethics7Script.ts',
  'ethics-ethics-8': 'ethics8Script.ts',
  'ethics-ethics-9': 'ethics9Script.ts',
  'ethics-ethics-10': 'ethics10Script.ts',
  'ethics-ethics-11': 'ethics11Script.ts',
  'ethics-ethics-12': 'ethics12Script.ts',
  'ethics-ethics-13': 'ethics13Script.ts',
  'ethics-ethics-14': 'ethics14Script.ts',
  'ethics-ethics-15': 'ethics15Script.ts',
  'ethics-ethics-16': 'ethics16Script.ts',
  'ethics-ethics-17': 'ethics17Script.ts',
  'ethics-ethics-18': 'ethics18Script.ts',
  'ethics-ethics-19': 'ethics19Script.ts',
  'ethics-ethics-20': 'ethics20Script.ts',
  'ethics-ethics-21': 'ethics21Script.ts',
  'ethics-ethics-22': 'ethics22Script.ts',
  'ethics-ethics-23': 'ethics23Script.ts',
  'ethics-ethics-24': 'ethics24Script.ts',
  'ethics-ethics-25': 'ethics25Script.ts',
  'ethics-ethics-26': 'ethics26Script.ts',
  'ethics-ethics-27': 'ethics27Script.ts',
  'ethics-ethics-28': 'ethics28Script.ts',
  'ethics-ethics-29': 'ethics29Script.ts',
  'ethics-ethics-30': 'ethics30Script.ts',
  'ethics-ethics-31': 'ethics31Script.ts',
  'ethics-ethics-32': 'ethics32Script.ts',
  'ethics-ethics-33': 'ethics33Script.ts',
  'ethics-ethics-34': 'ethics34Script.ts',
  'ethics-ethics-35': 'ethics35Script.ts',
  'ethics-ethics-36': 'ethics36Script.ts',
  'ethics-ethics-37': 'ethics37Script.ts',
  'ethics-ethics-38': 'ethics38Script.ts',
  'ethics-ethics-39': 'ethics39Script.ts',
  'ethics-ethics-40': 'ethics40Script.ts',
  'ethics-ethics-41': 'ethics41Script.ts',
  'epistemology-knowledge-1': 'epistemologyScript.ts',
  'epistemology-knowledge-3': 'epistemology2Script.ts',
  'epistemology-knowledge-4': 'epistemology4Script.ts',
  'epistemology-knowledge-5': 'epistemology5Script.ts',
  'epistemology-knowledge-6': 'epistemology6Script.ts',
  'epistemology-knowledge-7': 'epistemology7Script.ts',
  'epistemology-knowledge-8': 'epistemology8Script.ts',
  'epistemology-knowledge-9': 'epistemology9Script.ts',
  'epistemology-knowledge-10': 'epistemology10Script.ts',
  'epistemology-knowledge-2': 'knowHowScript.ts',
  'epistemology-knowledge-11': 'epistemology11Script.ts',
  'epistemology-knowledge-12': 'epistemology12Script.ts',
  'epistemology-knowledge-14': 'epistemology14Script.ts',
  'epistemology-knowledge-15': 'epistemology15Script.ts',
  'epistemology-knowledge-13': 'epistemology13Script.ts',
  'epistemology-knowledge-16': 'epistemology16Script.ts',
  'epistemology-knowledge-17': 'epistemology17Script.ts',
  'epistemology-knowledge-18': 'epistemology18Script.ts',
  'epistemology-knowledge-19': 'epistemology19Script.ts',
  'epistemology-knowledge-20': 'epistemology20Script.ts',
  'epistemology-knowledge-22': 'epistemology22Script.ts',
  'epistemology-knowledge-23': 'epistemology23Script.ts',
  'epistemology-knowledge-24': 'epistemology24Script.ts',
  'epistemology-knowledge-25': 'epistemology25Script.ts',
  'epistemology-knowledge-21': 'epistemology21Script.ts',
  'epistemology-knowledge-31': 'epistemology31Script.ts',
  'epistemology-knowledge-26': 'epistemology26Script.ts',
  'epistemology-knowledge-27': 'epistemology27Script.ts',
  'epistemology-knowledge-28': 'epistemology28Script.ts',
  'epistemology-knowledge-29': 'epistemology29Script.ts',
  'epistemology-knowledge-30': 'epistemology30Script.ts',
  'epistemology-knowledge-32': 'epistemology32Script.ts',
  'epistemology-knowledge-33': 'epistemology33Script.ts',
  'epistemology-knowledge-34': 'epistemology34Script.ts',
  'epistemology-knowledge-35': 'epistemology35Script.ts',
  'epistemology-knowledge-36': 'epistemology36Script.ts',
  'epistemology-knowledge-37': 'epistemology37Script.ts',
  'epistemology-knowledge-38': 'epistemology38Script.ts',
  'epistemology-knowledge-39': 'epistemology39Script.ts',
  'epistemology-knowledge-40': 'epistemology40Script.ts',
  'epistemology-knowledge-41': 'epistemology41Script.ts',
  'metaphysics-being-1': 'metaphysicsScript.ts',
  'metaphysics-being-2': 'metaphysics2Script.ts',
  'metaphysics-being-3': 'metaphysics3Script.ts',
  'metaphysics-being-4': 'metaphysics4Script.ts',
  'metaphysics-being-5': 'metaphysics5Script.ts',
  'metaphysics-being-6': 'metaphysics6Script.ts',
  'metaphysics-being-7': 'metaphysics7Script.ts',
  'metaphysics-being-8': 'metaphysics8Script.ts',
  'metaphysics-being-9': 'metaphysics9Script.ts',
  'metaphysics-being-10': 'metaphysics10Script.ts',
  'metaphysics-being-11': 'metaphysics11Script.ts',
  'metaphysics-being-12': 'metaphysics12Script.ts',
  'metaphysics-being-13': 'metaphysics13Script.ts',
  'metaphysics-being-14': 'metaphysics14Script.ts',
  'metaphysics-being-15': 'metaphysics15Script.ts',
  'metaphysics-being-16': 'metaphysics16Script.ts',
  'metaphysics-being-17': 'metaphysics17Script.ts',
  'metaphysics-being-18': 'metaphysics18Script.ts',
  'metaphysics-being-19': 'metaphysics19Script.ts',
  'metaphysics-being-31': 'metaphysics31Script.ts',
  'metaphysics-being-20': 'metaphysics20Script.ts',
  'metaphysics-being-21': 'metaphysics21Script.ts',
  'metaphysics-being-22': 'metaphysics22Script.ts',
  'metaphysics-being-23': 'metaphysics23Script.ts',
  'metaphysics-being-24': 'metaphysics24Script.ts',
  'metaphysics-being-25': 'metaphysics25Script.ts',
  'metaphysics-being-26': 'metaphysics26Script.ts',
  'metaphysics-being-27': 'metaphysics27Script.ts',
  'metaphysics-being-28': 'metaphysics28Script.ts',
  'metaphysics-being-29': 'metaphysics29Script.ts',
  'metaphysics-being-30': 'metaphysics30Script.ts',
  'metaphysics-being-32': 'metaphysics32Script.ts',
  'metaphysics-being-33': 'metaphysics33Script.ts',
  'metaphysics-being-34': 'metaphysics34Script.ts',
  'metaphysics-being-35': 'metaphysics35Script.ts',
  'metaphysics-being-36': 'metaphysics36Script.ts',
  'metaphysics-being-37': 'metaphysics37Script.ts',
  'metaphysics-being-38': 'metaphysics38Script.ts',
  'metaphysics-being-39': 'metaphysics39Script.ts',
  'metaphysics-being-40': 'metaphysics40Script.ts',
  'metaphysics-being-41': 'metaphysics41Script.ts',
  'aesthetics-aesthetics-1': 'aestheticsScript.ts',
  'aesthetics-aesthetics-2': 'aesthetics2Script.ts',
  'aesthetics-aesthetics-3': 'aesthetics3Script.ts',
  'aesthetics-aesthetics-4': 'aesthetics4Script.ts',
  'aesthetics-aesthetics-5': 'aesthetics5Script.ts',
  'aesthetics-aesthetics-6': 'aesthetics6Script.ts',
  'aesthetics-aesthetics-7': 'aesthetics7Script.ts',
  'aesthetics-aesthetics-8': 'aesthetics8Script.ts',
  'aesthetics-aesthetics-9': 'aesthetics9Script.ts',
  'aesthetics-aesthetics-10': 'aesthetics10Script.ts',
  'aesthetics-aesthetics-12': 'aesthetics12Script.ts',
  'aesthetics-aesthetics-13': 'aesthetics13Script.ts',
  'aesthetics-aesthetics-14': 'aesthetics14Script.ts',
  'aesthetics-aesthetics-15': 'aesthetics15Script.ts',
  'aesthetics-aesthetics-17': 'aesthetics17Script.ts',
  'aesthetics-aesthetics-18': 'aesthetics18Script.ts',
  'aesthetics-aesthetics-19': 'aesthetics19Script.ts',
  'aesthetics-aesthetics-20': 'aesthetics20Script.ts',
  'aesthetics-aesthetics-11': 'aesthetics11Script.ts',
  'aesthetics-aesthetics-16': 'aesthetics16Script.ts',
  'aesthetics-aesthetics-31': 'aesthetics31Script.ts',
  'aesthetics-aesthetics-21': 'aesthetics21Script.ts',
  'aesthetics-aesthetics-22': 'aesthetics22Script.ts',
  'aesthetics-aesthetics-23': 'aesthetics23Script.ts',
  'aesthetics-aesthetics-24': 'aesthetics24Script.ts',
  'aesthetics-aesthetics-25': 'aesthetics25Script.ts',
  'aesthetics-aesthetics-26': 'aesthetics26Script.ts',
  'aesthetics-aesthetics-27': 'aesthetics27Script.ts',
  'aesthetics-aesthetics-28': 'aesthetics28Script.ts',
  'aesthetics-aesthetics-29': 'aesthetics29Script.ts',
  'aesthetics-aesthetics-30': 'aesthetics30Script.ts',
  'aesthetics-aesthetics-32': 'aesthetics32Script.ts',
  'aesthetics-aesthetics-33': 'aesthetics33Script.ts',
  'aesthetics-aesthetics-34': 'aesthetics34Script.ts',
  'aesthetics-aesthetics-35': 'aesthetics35Script.ts',
  'aesthetics-aesthetics-36': 'aesthetics36Script.ts',
  'aesthetics-aesthetics-37': 'aesthetics37Script.ts',
  'aesthetics-aesthetics-38': 'aesthetics38Script.ts',
  'aesthetics-aesthetics-39': 'aesthetics39Script.ts',
  'aesthetics-aesthetics-40': 'aesthetics40Script.ts',
  'aesthetics-aesthetics-41': 'aesthetics41Script.ts',
  'political-political-1': 'politicalScript.ts',
  'political-political-2': 'political2Script.ts',
  'political-political-3': 'political3Script.ts',
  'political-political-4': 'political4Script.ts',
  'political-political-5': 'political5Script.ts',
  'political-political-6': 'political6Script.ts',
  'political-political-7': 'political7Script.ts',
  'political-political-8': 'political8Script.ts',
  'political-political-9': 'political9Script.ts',
  'political-political-10': 'political10Script.ts',
  'political-political-31': 'political31Script.ts',
  'political-political-11': 'political11Script.ts',
  'political-political-12': 'political12Script.ts',
  'political-political-13': 'political13Script.ts',
  'political-political-14': 'political14Script.ts',
  'political-political-15': 'political15Script.ts',
  'political-political-16': 'political16Script.ts',
  'political-political-17': 'political17Script.ts',
  'political-political-18': 'political18Script.ts',
  'political-political-19': 'political19Script.ts',
  'political-political-20': 'political20Script.ts',
  'political-political-21': 'political21Script.ts',
  'political-political-22': 'political22Script.ts',
  'political-political-23': 'political23Script.ts',
  'political-political-24': 'political24Script.ts',
  'political-political-25': 'political25Script.ts',
  'political-political-26': 'political26Script.ts',
  'political-political-27': 'political27Script.ts',
  'political-political-28': 'political28Script.ts',
  'political-political-29': 'political29Script.ts',
  'political-political-30': 'political30Script.ts',
  'political-political-32': 'political32Script.ts',
  'political-political-33': 'political33Script.ts',
  'political-political-34': 'political34Script.ts',
  'political-political-35': 'political35Script.ts',
  'political-political-36': 'political36Script.ts',
  'political-political-37': 'political37Script.ts',
  'political-political-38': 'political38Script.ts',
  'political-political-39': 'political39Script.ts',
  'political-political-40': 'political40Script.ts',
  'political-political-41': 'political41Script.ts',
};

/** A beat's line, named: "metaphysics-being-4/beat-04". Its WAV master is that name. */
export const keyOf = (lessonId, i) => `${lessonId}/beat-${String(i).padStart(2, '0')}`;
/** The one audio file a lesson ships, in its own folder. */
export const LESSON_CLIP = 'lesson.mp3';
/** The path the manifest requires a lesson's audio by. Every line of the lesson names it. */
export const requireOf = (lessonId) => `../../assets/narration/${lessonId}/${LESSON_CLIP}`;

export function beatsOf(file) {
  const ts = createRequire(import.meta.url)('typescript');
  const src = fs.readFileSync(path.join(SCRIPTS, file), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = {};
  new Function('exports', 'require', js)(mod, () => ({}));
  if (!Array.isArray(mod.BEATS)) throw new Error(`${file}: no BEATS export`);
  return mod.BEATS;
}

/**
 * A spoken beat: a teaching line under the figure, and nothing else on it. A quote, a
 * question and the summary are not narrated (the user's call on 11 Sep 2026). The two
 * lessons older than the shared player ask their questions as `tap` and `mc`.
 */
export const spoken = (b) => typeof b.text === 'string' && b.text.trim().length > 0
  && !b.quote && !b.interact && !b.summary && !b.tap && !b.mc;

/**
 * How long a word takes to say, in rough units: its vowel groups, or its digits for a
 * number, which is read out group by group. make-narration spreads word times by it,
 * and the PACE limit below divides by it.
 */
export const wordWeight = (w) => {
  const digits = (w.match(/\d/g) || []).length;
  if (digits) return digits;
  return Math.max(1, (w.toLowerCase().match(/[aeiouy]+/g) || []).length) + 0.25;
};
export const weightOf = (text) => (text.match(/\S+/g) || []).reduce((n, w) => n + wordWeight(w), 0);

export const sha256hex = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// ── READING A WAV ────────────────────────────────────────────────────────────

/** Chirp 3 HD's LINEAR16: 16-bit mono PCM at 24 kHz. */
export const WAV_RATE = 24000;

export function parseWav(buf) {
  const w = { riff: false, format: 0, channels: 0, rate: 0, bits: 0, pcm: null, truncated: false };
  if (buf.length < 12 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') return w;
  w.riff = true;
  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === 'fmt ' && body + 16 <= buf.length) {
      w.format = buf.readUInt16LE(body);
      w.channels = buf.readUInt16LE(body + 2);
      w.rate = buf.readUInt32LE(body + 4);
      w.bits = buf.readUInt16LE(body + 14);
    }
    if (id === 'data') {
      w.truncated = body + size > buf.length;
      const len = Math.min(size, buf.length - body) & ~1;
      // A copy that starts at offset 0: an Int16Array cannot sit on an odd byte offset,
      // and a small Buffer shares a pool at any offset at all.
      w.pcm = new Int16Array(buf.buffer.slice(buf.byteOffset + body, buf.byteOffset + body + len));
      break;
    }
    off = body + size + (size % 2);
  }
  return w;
}

export function headerFaults(w) {
  if (!w.riff) return ['not a RIFF WAVE file'];
  const out = [];
  if (w.format !== 1 || w.bits !== 16 || w.channels !== 1) out.push(`format ${w.format}, ${w.bits}-bit, ${w.channels} channel(s): expected 16-bit mono PCM`);
  if (w.rate !== WAV_RATE) out.push(`${w.rate} Hz: expected ${WAV_RATE}`);
  if (!w.pcm || w.pcm.length === 0) out.push('no audio in it');
  if (w.truncated) out.push('its data chunk runs past the end of the file');
  return out;
}

// ── WHERE EACH LINE SITS IN ITS LESSON'S AUDIO ───────────────────────────────
//
// A lesson's spoken lines, in beat order, end to end with GAP_S of silence between one
// line and the next. The player seeks to a line's `at` and pauses at `at + dur`, and a
// pause that lands a little late lands in the gap rather than on the next line's first
// word. encode-narration builds the file from this layout, make-narration writes `at`
// from it and check:narration holds both to it, so none of the three can place a line
// somewhere the others do not.

/** Silence between one line and the next in a lesson's file. */
export const GAP_S = 0.4;
export const GAP_SAMPLES = Math.round(WAV_RATE * GAP_S);

/** Where each line starts: `start` in samples, `at` in seconds to the millisecond. */
export function layoutOf(lines) {
  let start = 0;
  return lines.map(({ beat, samples }) => {
    const out = { beat, start, at: Math.round((start / WAV_RATE) * 1000) / 1000 };
    start += samples + GAP_SAMPLES;
    return out;
  });
}

/**
 * A lesson's spoken lines as its WAV masters stand now: for each, its beat, key, text,
 * WAV and length, and, when no spoken beat is missing its WAV, where it starts. `dir`
 * is the assets folder, which the counter-test stages elsewhere.
 */
export function lessonLines(lessonId, dir = ASSETS) {
  const beats = beatsOf(LESSONS[lessonId]);
  const lines = [];
  const missing = [];
  beats.forEach((b, i) => {
    if (!spoken(b)) return;
    const key = keyOf(lessonId, i);
    const file = path.join(dir, `${key}.wav`);
    if (!fs.existsSync(file)) { missing.push(i); return; }
    const wav = fs.readFileSync(file);
    const w = parseWav(wav);
    lines.push({ beat: i, key, text: b.text, wav, samples: w.pcm ? w.pcm.length : 0 });
  });
  if (!missing.length) layoutOf(lines).forEach((l, k) => { lines[k].start = l.start; lines[k].at = l.at; });
  return { beats, lines, missing };
}

/** A line's entry in its lesson MP3's tag: its beat, its WAV's SHA-256 and where it starts. */
export const entryOf = (beat, sha, at) => `beat-${String(beat).padStart(2, '0')}=${sha}@${at.toFixed(3)}`;
/** The ID3 comment a lesson's MP3 carries. Every entry ends in ';', so none is a prefix of another. */
export const lessonTagOf = (entries) => `narration-lesson:${entries.map((e) => `${e};`).join('')}`;

// ── IS THE TAKE CLEAN ────────────────────────────────────────────────────────
//
// Calibrated on 12 Sep 2026 against 402 rendered lines: the broken take above and 401
// good ones. Each limit sits well clear of both, and scripts/check-narration.mjs prints
// the corpus's worst value beside every limit on each run, so the margins can be read
// rather than remembered.
//
// THE REST OF THE LIBRARY TESTED THEM THE SAME DAY. Of the 1,316 takes rendered after
// those 402, install-narration refused three, and every one was a blast on the first
// word after a sentence-ending pause: ethics-ethics-8 beat 9 (a run of 31, 429 clipped in
// 50 ms, −2.9 dBFS), political-political-12 beat 2 (a run of 60, 836, −1.0) and
// political-political-16 beat 4 (159 clipped in 50 ms, −5.1). The worst good values below
// are across all 1,718 good lines.
//
// A RETAKE MUST BE A REQUEST GOOGLE HAS NOT SEEN. Asked for the same words with the same
// settings, it returns the same bytes. Stating the default sample rate outright was new
// enough for two of those three lines; political-political-16 beat 4 came back identical
// with that, and again with the default speaking rate stated, and only a speaking rate of
// 0.99 gave a new take. Compare a retake's SHA-256 with the refused one before judging it.
//
// WHAT THESE CANNOT HEAR is a take that garbles without a burst. Two spectral measures
// were built for it (flatness over a stretch, and its share of the loud frames) and both
// ranked the known-bad line 41st and 132nd, so neither is here. Listening (AC11) still
// catches what this cannot.

/** A sample at least this close to full scale is clipped. */
export const CLIP_LEVEL = 32000;
/**
 * The longest run of clipped samples a take may carry. Chirp's own peaks touch the
 * ceiling for a sample or a few: 7 at worst across the good lines. The two broken takes
 * ran 48 and 31. Twelve is half a millisecond.
 */
export const MAX_CLIP_RUN = 12;
/** Clipped samples inside any 50 ms: 19 at worst in a good line, 842 and 429 in the broken takes. */
export const MAX_CLIPS_IN_50MS = 64;
/**
 * The loudest any 50 ms may average, in dB below full scale. Speech is peaks and
 * valleys, so even Chirp's loudest syllable averages about 7 dB under its peak: −6.6 at
 * worst. A burst is flat against the ceiling, and the broken takes measured −1.1 and −2.9.
 */
export const BURST_DBFS = -4;
/**
 * Seconds of speech per unit of word weight: 0.107 to 0.379 across the good lines.
 * Outside this band a take has lost words or repeated them, or the clip belongs to
 * another line. Coarse on purpose: no bad take of that kind has been measured yet, so it
 * is set well outside the good ones.
 */
export const PACE_MIN = 0.09;
export const PACE_MAX = 0.5;
/** The longest silence inside the speech: 1.50s at worst in a good line. */
export const MAX_PAUSE_S = 2.5;
/** Silence before the voice starts or after it stops: 0.28s at worst. */
export const MAX_EDGE_SILENCE_S = 1;

const WINDOW_S = 0.05;
const FULL_SCALE_SQ = 32768 * 32768;

export function measureAudio(pcm, rate) {
  const n = pcm.length;
  const sq = new Float64Array(n + 1);
  const clipped = new Int32Array(n + 1);
  let run = 0, maxRun = 0, maxRunAt = 0;
  for (let i = 0; i < n; i += 1) {
    const v = pcm[i];
    sq[i + 1] = sq[i] + v * v;
    const c = v >= CLIP_LEVEL || v <= -CLIP_LEVEL ? 1 : 0;
    clipped[i + 1] = clipped[i] + c;
    if (c) {
      run += 1;
      if (run > maxRun) { maxRun = run; maxRunAt = (i + 1 - run) / rate; }
    } else run = 0;
  }
  const dbOf = (energy, len) => 10 * Math.log10(energy / len / FULL_SCALE_SQ + 1e-12);

  const W = Math.min(n, Math.round(rate * WINDOW_S));
  const STEP = Math.max(1, Math.round(rate * 0.01));
  let loudest = -120, loudestAt = 0, clips = 0, clipsAt = 0;
  if (W > 0) {
    for (let s = 0; s + W <= n; s += STEP) {
      const db = dbOf(sq[s + W] - sq[s], W);
      if (db > loudest) { loudest = db; loudestAt = s / rate; }
      const c = clipped[s + W] - clipped[s];
      if (c > clips) { clips = c; clipsAt = s / rate; }
    }
  }

  // Speech and silence on 10ms frames, against the floor make-narration's word timing
  // uses: 32 dB under the loudest frame, and never below −50.
  const F = Math.max(1, Math.round(rate * 0.01));
  const nf = Math.floor(n / F);
  const frame = new Float64Array(nf);
  let top = -120;
  for (let f = 0; f < nf; f += 1) {
    frame[f] = dbOf(sq[(f + 1) * F] - sq[f * F], F);
    if (frame[f] > top) top = frame[f];
  }
  const floor = Math.max(top - 32, -50);
  let first = -1, last = -1, quiet = 0, pause = 0;
  for (let f = 0; f < nf; f += 1) {
    if (frame[f] > floor) {
      if (first < 0) first = f;
      else if (quiet > pause) pause = quiet;
      last = f;
      quiet = 0;
    } else if (first >= 0) quiet += 1;
  }
  return {
    dur: n / rate,
    maxRun, maxRunAt,
    clips50: clips, clips50At: clipsAt,
    loudest50: loudest, loudest50At: loudestAt,
    speechS: first < 0 ? 0 : ((last + 1 - first) * F) / rate,
    leadS: first < 0 ? n / rate : (first * F) / rate,
    tailS: first < 0 ? n / rate : (n - (last + 1) * F) / rate,
    pauseS: (pause * F) / rate,
  };
}

/** What is wrong with a take, as { kind, say }. `text` is the line it should say. */
export function audioFaults(m, text) {
  const out = [];
  const at = (t) => `at ${t.toFixed(2)}s`;
  if (m.maxRun > MAX_CLIP_RUN) out.push({ kind: 'CLIPPED RUN', say: `${m.maxRun} samples in a row at full scale ${at(m.maxRunAt)}, over ${MAX_CLIP_RUN}` });
  if (m.clips50 > MAX_CLIPS_IN_50MS) out.push({ kind: 'CLIPPING', say: `${m.clips50} clipped samples inside 50 ms ${at(m.clips50At)}, over ${MAX_CLIPS_IN_50MS}` });
  if (m.loudest50 > BURST_DBFS) out.push({ kind: 'BURST', say: `50 ms averaging ${m.loudest50.toFixed(1)} dBFS ${at(m.loudest50At)}, where speech stays under ${BURST_DBFS}` });
  if (typeof text === 'string') {
    const weight = weightOf(text);
    const pace = weight ? m.speechS / weight : 0;
    if (!(pace >= PACE_MIN && pace <= PACE_MAX)) {
      out.push({ kind: 'PACE', say: `${m.speechS.toFixed(2)}s of speech for these words is ${pace.toFixed(3)}s a unit, outside ${PACE_MIN} to ${PACE_MAX}: words lost or repeated, or another line's clip` });
    }
  }
  if (m.pauseS > MAX_PAUSE_S) out.push({ kind: 'STALL', say: `a ${m.pauseS.toFixed(2)}s silence inside the speech, over ${MAX_PAUSE_S}s` });
  if (Math.max(m.leadS, m.tailS) > MAX_EDGE_SILENCE_S) {
    out.push({ kind: 'SILENCE', say: `${m.leadS.toFixed(2)}s before the voice and ${m.tailS.toFixed(2)}s after it, over ${MAX_EDGE_SILENCE_S}s at an end` });
  }
  return out;
}

// ── WHAT EACH TAKE WAS RENDERED FROM ────────────────────────────────────────
//
// assets/narration/renders.json: for every installed WAV, the words it was rendered
// from and its SHA-256. scripts/install-narration.mjs writes it. It exists because the
// manifest cannot say it: make-narration copies a beat's CURRENT text into the manifest
// and times the clip against it, so a line rewritten after its render would reveal the
// new words while the voice said the old ones, and every check would still agree.

export const RENDERS_FILE = 'renders.json';

export function readRenders(dir = ASSETS) {
  const file = path.join(dir, RENDERS_FILE);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
}

export function writeRenders(records, dir = ASSETS) {
  const sorted = {};
  for (const key of Object.keys(records).sort()) sorted[key] = { text: records[key].text, wav: records[key].wav };
  fs.writeFileSync(path.join(dir, RENDERS_FILE), `${JSON.stringify(sorted, null, 2)}\n`);
}

/**
 * Everything that makes one installed line unfit to ship: its WAV's header, whether its
 * render record names these words and this WAV, whether its lesson's MP3 lists this WAV at
 * this offset, and whether the take is clean. `clip` is the lesson's MP3 (or null when
 * there is none). make-narration and check-narration both call this, so the two cannot
 * disagree about a line.
 */
export function lineFaults({ text, wav, record, clip, beat, at }) {
  const faults = [];
  const w = parseWav(wav);
  for (const say of headerFaults(w)) faults.push({ kind: 'HEADER', say });
  const sha = sha256hex(wav);
  if (!record) faults.push({ kind: 'RECORD', say: 'no render record: install takes with scripts/install-narration.mjs' });
  else {
    if (record.text !== text) faults.push({ kind: 'REWORDED', say: `the take was rendered from "${record.text}": the voice would say words the screen no longer shows, so render the line again` });
    if (record.wav !== sha) faults.push({ kind: 'RECORD', say: 'this WAV is not the take its record names: install takes with scripts/install-narration.mjs' });
  }
  if (!clip || !clip.includes(`${entryOf(beat, sha, at)};`)) {
    faults.push({ kind: 'STALE MP3', say: `its lesson's ${LESSON_CLIP} is missing, or does not hold this WAV at ${at.toFixed(3)}s: run scripts/encode-narration.mjs` });
  }
  let m = null;
  if (w.pcm && w.pcm.length && w.rate) {
    m = measureAudio(w.pcm, w.rate);
    faults.push(...audioFaults(m, text));
  }
  return { faults, m, w, sha };
}

// ── READING THE MANIFEST BACK ───────────────────────────────────────────────

/**
 * The generated lib/narration/manifest.ts, read back line by line in the exact shape
 * make-narration writes. An entry it cannot read is a problem, and so is a count that
 * disagrees with the file's require() calls: a reader that quietly finds nothing would
 * report every lesson clean.
 */
export function parseManifest(src) {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const lessons = new Map();
  const problems = [];
  let lesson = null;
  for (let k = 0; k < lines.length; k += 1) {
    let m = lines[k].match(/^ {2}("[a-z0-9-]+"): \{$/);
    if (m) {
      lesson = JSON.parse(m[1]);
      if (lessons.has(lesson)) problems.push(`${lesson} appears twice`);
      lessons.set(lesson, new Map());
      continue;
    }
    m = lines[k].match(/^ {4}(\d+): \{$/);
    if (!m || !lesson) continue;
    const clip = (lines[k + 1] || '').match(/^ {6}clip: require\('([^']+)'\),$/);
    const at = (lines[k + 2] || '').match(/^ {6}at: ([\d.]+),$/);
    const dur = (lines[k + 3] || '').match(/^ {6}dur: ([\d.]+),$/);
    const text = (lines[k + 4] || '').match(/^ {6}text: (".*"),$/);
    const words = (lines[k + 5] || '').match(/^ {6}words: \[([^\]]*)\],$/);
    if (!clip || !at || !dur || !text || !words) { problems.push(`${lesson} beat ${m[1]}: an entry not in the shape make-narration writes`); continue; }
    lessons.get(lesson).set(Number(m[1]), {
      clip: clip[1],
      at: Number(at[1]),
      dur: Number(dur[1]),
      text: JSON.parse(text[1]),
      words: words[1].trim() ? words[1].split(',').map(Number) : [],
    });
    k += 5;
  }
  const requires = (src.match(/require\(/g) || []).length;
  const read = [...lessons.values()].reduce((n, l) => n + l.size, 0);
  if (read !== requires) problems.push(`read ${read} entries from a file with ${requires} require() calls`);
  return { lessons, problems };
}
