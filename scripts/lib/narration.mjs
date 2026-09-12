// ─────────────────────────────────────────────────────────────────────────────
// NARRATION, SHARED: WHICH LESSONS SPEAK, WHAT EACH BEAT SAYS, AND WHETHER A CLIP IS
// FIT TO SHIP.
//
// scripts/install-narration.mjs takes a render into assets, scripts/encode-narration.mjs
// makes the MP3s, scripts/make-narration.mjs writes the manifest and
// scripts/check-narration.mjs holds all of it in `npm run check`. All four read this
// file, so one table, one reading of a WAV and one set of limits serve them all.
//
// WHY A CLIP IS MEASURED AT ALL. On 12 Sep 2026 a reader heard, part way through
// metaphysics-being-4, "a loud sound, and then the voice becomes extremely distorted".
// The player had played exactly what Google sent. Beat 4's WAV carried a quarter-second
// burst at 5.25s, 2,502 samples pinned at full scale in runs up to 48 long, and speech
// smeared into noise after it. Chirp 3 HD never renders a line the same way twice, so a
// broken take is bad luck, and nothing between the render and the phone had measured
// one. The fix was a second take of the same words. The limits below make the next
// broken take a build error instead of something a reader finds.
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
 * The narrated lessons, and the script each one plays: the first two units of every
 * branch, in reading order. ethics-ethics-9 was the first lesson narrated, a day before
 * the rest of its unit. A lesson added here needs its lines rendered and installed
 * before make-narration will run.
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
};

/** A beat's clip, named: "metaphysics-being-4/beat-04". */
export const keyOf = (lessonId, i) => `${lessonId}/beat-${String(i).padStart(2, '0')}`;
/** The path the manifest requires that clip by. */
export const requireOf = (lessonId, i) => `../../assets/narration/${keyOf(lessonId, i)}.mp3`;

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
/** What an MP3 carries once scripts/encode-narration.mjs has encoded it from this WAV. */
export const tagOf = (wav) => `wav-sha256:${sha256hex(wav)}`;

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

// ── IS THE TAKE CLEAN ────────────────────────────────────────────────────────
//
// Calibrated on 12 Sep 2026 against 402 rendered lines: the broken take above and 401
// good ones. Each limit sits well clear of both, and scripts/check-narration.mjs prints
// the corpus's worst value beside every limit on each run, so the margins can be read
// rather than remembered.
//
// THE SECOND UNITS TESTED THEM THE SAME DAY. Of 308 new takes, one was a second burst
// (ethics-ethics-8 beat 9: a 200 ms blast where "Carol" should start, a run of 31, 429
// clipped in 50 ms, −2.9 dBFS) and install-narration refused it. The other 307 stayed
// inside every limit, and the worst good values below are across all 709 good lines.
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
 * render record names these words and this WAV, whether its MP3 was encoded from this
 * WAV, and whether the take is clean. make-narration and check-narration both call this,
 * so the two cannot disagree about a line.
 */
export function lineFaults({ text, wav, mp3, record }) {
  const faults = [];
  const w = parseWav(wav);
  for (const say of headerFaults(w)) faults.push({ kind: 'HEADER', say });
  const sha = sha256hex(wav);
  if (!record) faults.push({ kind: 'RECORD', say: 'no render record: install takes with scripts/install-narration.mjs' });
  else {
    if (record.text !== text) faults.push({ kind: 'REWORDED', say: `the take was rendered from "${record.text}": the voice would say words the screen no longer shows, so render the line again` });
    if (record.wav !== sha) faults.push({ kind: 'RECORD', say: 'this WAV is not the take its record names: install takes with scripts/install-narration.mjs' });
  }
  if (!mp3 || !mp3.includes(`wav-sha256:${sha}`)) faults.push({ kind: 'STALE MP3', say: 'missing, or not encoded from this WAV: run scripts/encode-narration.mjs' });
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
    const dur = (lines[k + 2] || '').match(/^ {6}dur: ([\d.]+),$/);
    const text = (lines[k + 3] || '').match(/^ {6}text: (".*"),$/);
    const words = (lines[k + 4] || '').match(/^ {6}words: \[([^\]]*)\],$/);
    if (!clip || !dur || !text || !words) { problems.push(`${lesson} beat ${m[1]}: an entry not in the shape make-narration writes`); continue; }
    lessons.get(lesson).set(Number(m[1]), {
      clip: clip[1],
      dur: Number(dur[1]),
      text: JSON.parse(text[1]),
      words: words[1].trim() ? words[1].split(',').map(Number) : [],
    });
    k += 4;
  }
  const requires = (src.match(/require\(/g) || []).length;
  const read = [...lessons.values()].reduce((n, l) => n + l.size, 0);
  if (read !== requires) problems.push(`read ${read} entries from a file with ${requires} require() calls`);
  return { lessons, problems };
}
