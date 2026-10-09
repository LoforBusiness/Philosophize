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
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readTake, prosodyFaults, withStyle } from './prosody.mjs';

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
  // Economics & Finance — a DIALOGUE lesson: each line in its speaker's voice (cast.ts).
  'economics-foundations-1': 'econ1Script.ts',
  'economics-foundations-2': 'econ2Script.ts',
  'economics-foundations-3': 'econ3Script.ts',
  'economics-foundations-4': 'econ4Script.ts',
  'economics-foundations-5': 'econ5Script.ts',
  'economics-foundations-6': 'econ6Script.ts',
  'economics-foundations-7': 'econ7Script.ts',
  // One road per subject (2026-09-30): each subject's first lesson, all DIALOGUE lessons.
  'philosophy-foundations-1': 'phil1Script.ts',
  'philosophy-foundations-2': 'phil2Script.ts',
  'philosophy-foundations-3': 'phil3Script.ts',
  'philosophy-foundations-4': 'phil4Script.ts',
  'philosophy-foundations-5': 'phil5Script.ts',
  'philosophy-foundations-6': 'phil6Script.ts',
  'philosophy-foundations-7': 'phil7Script.ts',
  'psychology-foundations-1': 'psych1Script.ts',
  'psychology-foundations-2': 'psych2Script.ts',
  'psychology-foundations-3': 'psych3Script.ts',
  'psychology-foundations-4': 'psych4Script.ts',
  'psychology-foundations-5': 'psych5Script.ts',
  'psychology-foundations-6': 'psych6Script.ts',
  'psychology-foundations-7': 'psych7Script.ts',
  'personal-growth-foundations-1': 'growth1Script.ts',
  'personal-growth-foundations-2': 'growth2Script.ts',
  'personal-growth-foundations-3': 'growth3Script.ts',
  'personal-growth-foundations-4': 'growth4Script.ts',
  'personal-growth-foundations-5': 'growth5Script.ts',
  'personal-growth-foundations-6': 'growth6Script.ts',
  'personal-growth-foundations-7': 'growth7Script.ts',
  'business-foundations-1': 'biz1Script.ts',
  'business-foundations-2': 'biz2Script.ts',
  'business-foundations-3': 'biz3Script.ts',
  'business-foundations-4': 'biz4Script.ts',
  'business-foundations-5': 'biz5Script.ts',
  'business-foundations-6': 'biz6Script.ts',
  'business-foundations-7': 'biz7Script.ts',
  'science-foundations-1': 'sci1Script.ts',
  'science-foundations-2': 'sci2Script.ts',
  'science-foundations-3': 'sci3Script.ts',
  'science-foundations-4': 'sci4Script.ts',
  'science-foundations-5': 'sci5Script.ts',
  'science-foundations-6': 'sci6Script.ts',
  'science-foundations-7': 'sci7Script.ts',
  'history-foundations-1': 'hist1Script.ts',
  'history-foundations-2': 'hist2Script.ts',
  'history-foundations-3': 'hist3Script.ts',
  'history-foundations-4': 'hist4Script.ts',
  'history-foundations-5': 'hist5Script.ts',
  'history-foundations-6': 'hist6Script.ts',
  'history-foundations-7': 'hist7Script.ts',
  'history-caesar-1': 'caesar1Script.ts',
  'science-penicillin-1': 'fleming1Script.ts',
  'psychology-milgram-1': 'milgram1Script.ts',
  'philosophy-descartes-1': 'descartes1Script.ts',
  'personal-growth-endurance-1': 'endur1Script.ts',
  'economics-tulips-1': 'tulip1Script.ts',
  'business-amazon-1': 'amazon1Script.ts',
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

// ── ENDING A DIALOGUE TAKE (AP16) ───────────────────────────────────────────
//
// Chirp 3 HD trims a take to the voice, and more often than not it trims INTO the last
// word: 63% of 401 older takes end with their final 50 ms under 33 dB below their loudest.
// Asked for the same words with a long pause after them, it finishes the word and then
// falls silent — measured on three of the lines it had cut, all three ended 97–101 dB down
// with it, where a short pause left two of the three cut. So a dialogue line is rendered
// with `[pause long]` after it (a pause tag, which the AC rules allow in markup), and the
// silence that buys is then cut back to TAIL_KEEP_S so a line does not end in dead air.

/** The markup a dialogue line is rendered from: its own, with a long pause after it. */
export const endingMarkup = (markup) => (/\[pause(?: short| long)?\]\s*$/.test(markup) ? markup : `${markup} [pause long]`);

/** Silence kept after the last sound of a take, once the long pause has done its work. */
export const TAIL_KEEP_S = 0.25;

/** A 16-bit mono WAV with its silence after the last sound cut to TAIL_KEEP_S. */
export function trimTail(buf) {
  const w = parseWav(buf);
  if (!w.pcm || !w.rate) return buf;
  const F = Math.max(1, Math.round(w.rate * 0.01));
  const nf = Math.floor(w.pcm.length / F);
  const db = new Float64Array(nf);
  let top = -120;
  for (let f = 0; f < nf; f += 1) {
    let e = 0;
    for (let k = f * F; k < (f + 1) * F; k += 1) e += w.pcm[k] * w.pcm[k];
    db[f] = 10 * Math.log10(e / F / (32768 * 32768) + 1e-12);
    if (db[f] > top) top = db[f];
  }
  let last = nf - 1;
  while (last > 0 && db[last] < top - 50) last -= 1;
  const keep = Math.min(w.pcm.length, (last + 1) * F + Math.round(w.rate * TAIL_KEEP_S));
  if (keep >= w.pcm.length) return buf;
  const pcm = w.pcm.subarray(0, keep);
  const out = Buffer.alloc(44 + pcm.length * 2);
  out.write('RIFF', 0, 'ascii'); out.writeUInt32LE(36 + pcm.length * 2, 4); out.write('WAVE', 8, 'ascii');
  out.write('fmt ', 12, 'ascii'); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(w.rate, 24); out.writeUInt32LE(w.rate * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36, 'ascii'); out.writeUInt32LE(pcm.length * 2, 40);
  for (let i = 0; i < pcm.length; i += 1) out.writeInt16LE(pcm[i], 44 + i * 2);
  return out;
}

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

// ── THE RELEASE: CHIRP STOPS INSIDE THE LAST SOUND, AND THE VOICE HAS TO LET GO ──
//
// A reader: *"at the end of the words under the stickman that are read out by the
// narrator … it will stop abruptly or not sound right at the very end of a sentence."*
//
// Measured over all 1,718 masters, Chirp 3 HD trims every take tight to the voice: the
// median silence after the last sound is ZERO, and 1,574 takes end within 50ms of it.
// 522 of them, in 215 lessons, end with their final 20ms still within 30 dB of the
// line's peak — the file stops inside the last word's own decay, and 32 of those are
// above −20 dB, which is a word cut off mid-sound (ethics-ethics-17 beat 0 is still at
// −8 dB on its last frame). Nothing here trims: install-narration stores Chirp's
// LINEAR16 as delivered. Laid straight against GAP_S of digital zero, every one of those
// is a step from speech to nothing in one sample, which an ear hears as a chop.
//
// So the encoder lays a RELEASE into the first RELEASE_S of each gap: the take's own
// last pitch period, continued and decayed. A voiced ending is periodic, so the sample
// after a take's last one is close to the one a period before it, and the seam has no
// step; an unvoiced one repeats a short grain instead, under a decay too fast to hear
// as a repeat. The release lives in the GAP, so no line's `at`, no `dur`, no word time
// and no WAV master moves — the masters and their hashes stay exactly what Chirp gave.
//
// And the player had the matching fault, which alone clipped EVERY line: it paused
// when the reported position reached `end − 0.05`, with no silence there to spend. It
// pauses after the release now (lib/narration/real.ts), and check:narration holds the
// two constants against each other.
/** How long the synthesised release after each take runs. */
export const RELEASE_S = 0.08;
export const RELEASE_SAMPLES = Math.round(WAV_RATE * RELEASE_S);
/**
 * What the encoder does to a lesson beyond laying WAVs end to end. It is part of the
 * tag, so a lesson encoded before the release existed is STALE MP3 rather than current.
 */
export const ENCODING = 'release-1';

/**
 * The release a take's end needs: RELEASE_SAMPLES that begin where `pcm` stops and fall
 * to zero. Pure, so the counter-test and the encoder produce the same samples.
 */
export function releaseOf(pcm, rate = WAV_RATE) {
  const L = Math.round(rate * RELEASE_S);
  const out = new Int16Array(L);
  const n = pcm ? pcm.length : 0;
  if (n < rate * 0.02) return out;
  // The last pitch period, by normalised autocorrelation over the final 40ms, in the
  // range a speaking voice uses (70–400 Hz).
  const W = Math.min(n, Math.round(rate * 0.04));
  const lo = Math.round(rate / 400);
  const hi = Math.min(Math.round(rate / 70), W - 1);
  let best = 0;
  let P = 0;
  for (let p = lo; p <= hi; p += 1) {
    let num = 0, a = 0, b = 0;
    for (let i = n - W + p; i < n; i += 1) {
      const x = pcm[i], y = pcm[i - p];
      num += x * y; a += x * x; b += y * y;
    }
    const r = num / Math.sqrt(a * b + 1e-9);
    if (r > best) { best = r; P = p; }
  }
  // Unvoiced, or no clear period: a 12ms grain, which the decay ends inside two repeats.
  if (best < 0.5 || P === 0) P = Math.round(rate * 0.012);

  // THE SEAM. An integer period drifts out of phase at the end of a word, where pitch
  // and formants are both moving — measured, 452 takes had a bigger jump into the
  // release than into plain silence. So the period is allowed to move a few samples
  // either way, to whichever continues the take's last value AND its last slope best.
  const x1 = pcm[n - 1];
  const x2 = pcm[n - 2];
  const want = 2 * x1 - x2;               // where the take was heading next
  const slope = x1 - x2;
  const J = Math.max(2, Math.round(P / 8));
  let Pb = P;
  let cost = Infinity;
  for (let q = Math.max(2, P - J); q <= Math.min(n - 2, P + J); q += 1) {
    const a = pcm[n - q];
    const c = Math.abs(a - want) + Math.abs((pcm[n - q + 1] - a) - slope);
    if (c < cost) { cost = c; Pb = q; }
  }
  // Whatever step is left is taken out over ~3ms, which is below where an ear hears a
  // transient and far shorter than the release itself.
  const d = want - pcm[n - Pb];
  const fix = rate * 0.003;

  const tau = rate * 0.018;               // a vowel's own release, about 18ms
  const land = Math.round(rate * 0.01);   // and the last 10ms straight down to zero
  for (let k = 0; k < L; k += 1) {
    let g = Math.exp(-k / tau);
    if (L - k < land) g *= (L - k) / land;
    const v = pcm[n - Pb + (k % Pb)] + d * Math.exp(-k / fix);
    out[k] = Math.max(-32768, Math.min(32767, Math.round(v * g)));
  }
  return out;
}

/** A line's entry in its lesson MP3's tag: its beat, its WAV's SHA-256 and where it starts. */
export const entryOf = (beat, sha, at) => `beat-${String(beat).padStart(2, '0')}=${sha}@${at.toFixed(3)}`;
/** The marker every current lesson MP3's tag opens with. */
export const encodingMark = `narration-lesson:${ENCODING};`;
/**
 * The ID3 comment a lesson's MP3 carries: the encoding first, then every line. Every
 * entry ends in ';', so none is a prefix of another.
 */
export const lessonTagOf = (entries) => `${encodingMark}${entries.map((e) => `${e};`).join('')}`;

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

// ── HOW A LINE IS DELIVERED: A PERSON, TALKING (LESSON_RULES AP16) ──────────
//
// The owner, 2026-09-30, on the seven dialogue lessons: the speech *"ended abruptly …
// before the narration actually finished talking"*, and *"the speed of how fast words
// are said make it seem really real or really not real … form the words of how long
// pauses happen and how fast words are spoken to sound as real as a human would."*
//
// Measured on all 59 lines first, and both were real:
//
//   · THIRTEEN TAKES STOPPED MID-WORD. Chirp 3 HD sometimes ends a take while the last
//     word is still sounding — its final 50 ms at 15–28 dB under the line's loudest
//     frame, where every take that ends on its own has fallen 40 dB or more. Eleven of
//     the thirteen were the top hat's (Algieba at 0.95). The release the encoder lays
//     after a take (RELEASE_S) smooths a click; it cannot finish a word.
//   · THE SPEED RAN FROM 3.8 TO 6.3 SYLLABLES A SECOND OF SPEECH. Relaxed conversation
//     is about 4 to 5 (articulation rate: syllables over time spent speaking, pauses
//     taken out). Above 5.0 the voice gabbles — *"How lovely. And how often will you
//     water it?"* was 6.25 — and under 3.9 it drags.
//
// So a DIALOGUE take (every lesson made from now on, AP12) must end on its own, speak at
// a person's pace, and PAUSE AT EVERY SENTENCE END: a full stop the voice runs straight
// through is the other half of sounding read out. A retake is a new request (see above):
// the speaking rate that brings a line into the band is the nudge.

/** The last 50 ms of a take, against its loudest 10 ms frame: 15–28 dB when cut off, ≤ −40 when it ends. */
export const END_DROP_DB = 33;
/** Syllables per second of SPEECH (pauses taken out). A person talking: about 4 to 5. */
export const RATE_MIN = 3.9;
export const RATE_MAX = 5.0;
/** Where a retake aims: the middle of a person's pace. */
export const RATE_AIM = 4.5;
/** The shortest silence that counts as the breath at a sentence end. */
export const SENTENCE_PAUSE_S = 0.25;

/** A word's syllables, by vowel groups — close enough to rank a line's pace. */
export function syllablesOf(word) {
  let w = String(word).toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const m = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}

/** Sentence ends INSIDE a line: a full stop, question or exclamation mark, or colon, with more to say after it. */
export const sentenceBreaks = (text) => (String(text).match(/[.!?:](?=["’”)]?\s+\S)/g) || []).length;

/** How a take is delivered: its pace, its pauses, and how it ends. */
export function deliveryOf(pcm, rate, text) {
  const F = Math.max(1, Math.round(rate * 0.01));
  const nf = Math.floor(pcm.length / F);
  const frame = new Float64Array(nf);
  let top = -120;
  for (let f = 0; f < nf; f += 1) {
    let e = 0;
    for (let k = f * F; k < (f + 1) * F; k += 1) e += pcm[k] * pcm[k];
    frame[f] = 10 * Math.log10(e / F / (32768 * 32768) + 1e-12);
    if (frame[f] > top) top = frame[f];
  }
  const floor = Math.max(top - 32, -50);
  let first = -1, last = -1;
  for (let f = 0; f < nf; f += 1) if (frame[f] > floor) { if (first < 0) first = f; last = f; }
  const pauses = [];
  let quiet = 0;
  for (let f = first; f >= 0 && f <= last; f += 1) {
    if (frame[f] > floor) { if (quiet >= 12) pauses.push(quiet / 100); quiet = 0; } else quiet += 1;
  }
  const spanS = first < 0 ? 0 : (last - first + 1) / 100;
  const talkS = Math.max(0.1, spanS - pauses.reduce((a, p) => a + p, 0));
  const syl = (String(text).match(/\S+/g) || []).reduce((a, w) => a + syllablesOf(w), 0);
  const tail = frame.slice(Math.max(0, nf - 5));
  let tailE = 0;
  for (const d of tail) tailE += 10 ** (d / 10);
  const endDb = 10 * Math.log10(tailE / Math.max(1, tail.length) + 1e-12) - top;
  return {
    rate: syl / talkS,
    pauses,
    breaths: pauses.filter((p) => p >= SENTENCE_PAUSE_S).length,
    breaks: sentenceBreaks(text),
    endDb,
  };
}

/** What makes a dialogue take sound read out rather than spoken, as { kind, say }. */
export function deliveryFaults(d) {
  const out = [];
  if (d.endDb > -END_DROP_DB) out.push({ kind: 'CUT OFF', say: `the take stops while the last word is still sounding: its last 50 ms is ${(-d.endDb).toFixed(0)} dB under its loudest, where a finished take falls ${END_DROP_DB} or more — retake it` });
  if (d.rate > RATE_MAX) out.push({ kind: 'TOO FAST', say: `${d.rate.toFixed(2)} syllables a second of speech, over a person's ${RATE_MAX} — retake at a slower speaking rate` });
  if (d.rate < RATE_MIN) out.push({ kind: 'TOO SLOW', say: `${d.rate.toFixed(2)} syllables a second of speech, under a person's ${RATE_MIN} — retake at a quicker speaking rate` });
  if (d.breaths < d.breaks) out.push({ kind: 'NO BREATH', say: `${d.breaks} sentence end(s) inside the line and only ${d.breaths} pause(s) of ${SENTENCE_PAUSE_S}s or more — a voice that runs through a full stop is reading, not talking: mark the stop with [pause] in the beat's markup` });
  return out;
}

/**
 * How a DIALOGUE take falls short of a person talking. A beat that states its `pace` is
 * held to AP17 — its speed per sentence and a pause of a person's length at every mark
 * (scripts/lib/prosody.mjs); one that does not, to AP16's coarser test.
 */
export function spokenFaults(pcm, rate, text, pace, sha = null, lesson = null) {
  if (pace === undefined) return deliveryFaults(deliveryOf(pcm, rate, text));
  const faults = withStyle(lesson, () => prosodyFaults(readTake(pcm, rate, text, pace), text));
  return sha && PACE_ALLOWANCE[sha] ? faults.filter((f) => f.kind !== 'TOO FAST' && f.kind !== 'TOO SLOW') : faults;
}

/**
 * Takes let through with a SPEED fault and nothing else, pinned by the WAV's SHA-256, so
 * a new take of the line is held to the band again. 2026-10-07: every lesson was re-voiced
 * in the natural style (AP22) and the eleven old pins went with their takes. One is left,
 * and it is the MEASURE that is wrong, not the take: the voice ran through the comma in
 * "Of course you do, nobody…", so the reader matched that comma to the full stop's pause
 * and the stop to the comma after "way,", and the second sentence measured 21 syllables
 * a second. The list may only shrink: check:narration fails one more, and an entry whose
 * take is no longer installed.
 */
export const PACE_ALLOWANCE = {
};
export const PACE_ALLOWANCE_MAX = 0;

// ── WHAT EACH TAKE WAS RENDERED FROM ────────────────────────────────────────
//
// assets/narration/renders.json: for every installed WAV, the words it was rendered
// from and its SHA-256. scripts/install-narration.mjs writes it. It exists because the
// manifest cannot say it: make-narration copies a beat's CURRENT text into the manifest
// and times the clip against it, so a line rewritten after its render would reveal the
// new words while the voice said the old ones, and every check would still agree.

// ── WHOSE VOICE A LINE IS IN ────────────────────────────────────────────────
//
// A narrated lesson is read in one voice; a DIALOGUE lesson (LESSON_RULES group AP)
// in each speaker's own, from components/lesson/cinematic/cast.ts. A take rendered in
// the wrong one plays perfectly and says the right words, so nothing downstream can
// hear the mistake: install-narration refuses it here, and renders.json keeps the
// voice so check:dialogue can re-derive it later.
const CAST_TS = path.join(ROOT, 'components', 'lesson', 'cinematic', 'cast.ts');
const { voiceFor } = await import(pathToFileURL(CAST_TS).href);
export { voiceFor };

/**
 * Why a take in `voice` may not stand for `beat`, or null when it may. A narrated
 * beat's take may leave the voice unnamed (every take before dialogue lessons did).
 */
export function voiceFault(beat, voice) {
  const want = voiceFor(beat.speaker).name;
  if (!voice) return beat.speaker ? `${beat.speaker} speaks as ${want}, and the take names no voice` : null;
  return voice === want ? null : `rendered as ${voice}, but ${beat.speaker ?? 'the narrator'} speaks as ${want}`;
}

export const RENDERS_FILE = 'renders.json';

export function readRenders(dir = ASSETS) {
  const file = path.join(dir, RENDERS_FILE);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
}

export function writeRenders(records, dir = ASSETS) {
  const sorted = {};
  for (const key of Object.keys(records).sort()) {
    const { text, wav, voice } = records[key];
    sorted[key] = voice ? { text, wav, voice } : { text, wav };
  }
  fs.writeFileSync(path.join(dir, RENDERS_FILE), `${JSON.stringify(sorted, null, 2)}\n`);
}

/**
 * Everything that makes one installed line unfit to ship: its WAV's header, whether its
 * render record names these words and this WAV, whether its lesson's MP3 lists this WAV at
 * this offset, and whether the take is clean. `clip` is the lesson's MP3 (or null when
 * there is none). make-narration and check-narration both call this, so the two cannot
 * disagree about a line.
 */
export function lineFaults({ text, wav, record, clip, beat, at, dialogue = false, pace, lesson = null }) {
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
  } else if (!clip.includes(encodingMark)) {
    faults.push({ kind: 'STALE MP3', say: `its lesson's ${LESSON_CLIP} was encoded without the release after each take (${ENCODING}), so the line stops dead where Chirp trimmed it: run scripts/encode-narration.mjs` });
  }
  let m = null;
  if (w.pcm && w.pcm.length && w.rate) {
    m = measureAudio(w.pcm, w.rate);
    faults.push(...audioFaults(m, text));
    // A DIALOGUE line is a person talking, so it is also held to how it is delivered (AP16).
    if (dialogue) faults.push(...spokenFaults(w.pcm, w.rate, text, pace, sha, lesson));
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
