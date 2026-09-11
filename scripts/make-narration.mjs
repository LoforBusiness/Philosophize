// ─────────────────────────────────────────────────────────────────────────────
// NARRATION: WHICH CLIP PLAYS FOR WHICH BEAT, AND WHEN EACH WORD STARTS.
//
//   node scripts/make-narration.mjs
//
// Reads assets/narration/<lesson id>/beat-NN.wav and the lesson's script, and writes
// lib/narration/manifest.ts. It never calls Google: the clips are rendered through
// the character ledger (scripts/lib/ttsledger.mjs), and this only measures what was
// rendered.
//
// WHAT IS SPOKEN is a beat's own `text`, the teaching line under the figure. A quote
// beat, a question (its prompt and its explanation) and the summary card are not
// narrated. That was the user's call on 11 Sep 2026, for the first narrated lesson.
//
// THE WORD TIMES ARE ESTIMATES, because Chirp 3 HD returns none. The clip is cut
// into speech and silence on 10ms frames; each sentence or clause is matched to the
// pause nearest where its words' share of the speech says it should end; and inside
// that span each word gets time in proportion to its syllables. That is good to
// about a word, which is what a reveal needs.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ts = createRequire(import.meta.url)('typescript');
const OUT = path.join(ROOT, 'lib', 'narration', 'manifest.ts');

/**
 * The narrated lessons, and the script each one plays: the first two of every branch
 * in reading order, and ethics-ethics-9, the first lesson narrated.
 */
const LESSONS = {
  'logic-arguments-1': 'argumentScript.ts',
  'logic-arguments-2': 'builderScript.ts',
  'ethics-ethics-1': 'ethicsScript.ts',
  'ethics-ethics-2': 'ethics2Script.ts',
  'ethics-ethics-9': 'ethics9Script.ts',
  'epistemology-knowledge-1': 'epistemologyScript.ts',
  'epistemology-knowledge-3': 'epistemology2Script.ts',
  'metaphysics-being-1': 'metaphysicsScript.ts',
  'metaphysics-being-2': 'metaphysics2Script.ts',
  'aesthetics-aesthetics-1': 'aestheticsScript.ts',
  'aesthetics-aesthetics-2': 'aesthetics2Script.ts',
  'political-political-1': 'politicalScript.ts',
  'political-political-2': 'political2Script.ts',
};

const FRAME_S = 0.01;
/** Twelve quiet frames in a row inside the speech is a pause, not a consonant. */
const PAUSE_FRAMES = 12;

function beatsOf(file) {
  const src = fs.readFileSync(path.join(ROOT, 'components', 'lesson', 'cinematic', file), 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = {};
  new Function('exports', 'require', js)(mod, () => ({}));
  if (!Array.isArray(mod.BEATS)) throw new Error(`${file}: no BEATS export`);
  return mod.BEATS;
}

/**
 * A spoken beat: a teaching line under the figure, and nothing else on it. The two
 * lessons older than the shared player ask their questions as `tap` and `mc`.
 */
const spoken = (b) => typeof b.text === 'string' && b.text.trim().length > 0
  && !b.quote && !b.interact && !b.summary && !b.tap && !b.mc;

function readWav(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') throw new Error(`${file}: not a WAV`);
  let off = 12, fmt = null, data = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === 'fmt ') {
      fmt = { format: buf.readUInt16LE(body), channels: buf.readUInt16LE(body + 2), rate: buf.readUInt32LE(body + 4), bits: buf.readUInt16LE(body + 14) };
    }
    if (id === 'data') { data = buf.subarray(body, Math.min(buf.length, body + size)); break; }
    off = body + size + (size % 2);
  }
  if (!fmt || !data || fmt.format !== 1 || fmt.bits !== 16 || fmt.channels !== 1) throw new Error(`${file}: expected 16-bit mono PCM`);
  const n = Math.floor(data.length / 2);
  const samples = new Float64Array(n);
  for (let j = 0; j < n; j += 1) samples[j] = data.readInt16LE(j * 2) / 32768;
  return { rate: fmt.rate, samples };
}

function wordStarts(samples, rate, text) {
  const tokens = text.match(/\S+/g) || [];
  const FRAME = Math.max(1, Math.round(rate * FRAME_S));
  const nf = Math.floor(samples.length / FRAME);
  const db = new Float64Array(nf);
  let top = -120;
  for (let f = 0; f < nf; f += 1) {
    let s = 0;
    for (let j = f * FRAME; j < (f + 1) * FRAME; j += 1) s += samples[j] * samples[j];
    db[f] = 10 * Math.log10(s / FRAME + 1e-12);
    if (db[f] > top) top = db[f];
  }
  const floor = Math.max(top - 32, -50);
  const voiced = Array.from(db, (d) => d > floor);
  const first = voiced.indexOf(true);
  const last = voiced.lastIndexOf(true);
  if (first < 0 || tokens.length === 0) return tokens.map(() => 0);

  // The pauses inside the speech, and the stretches of speech between them.
  const gaps = [];
  let quietFrom = -1;
  for (let f = first; f <= last; f += 1) {
    if (!voiced[f]) {
      if (quietFrom < 0) quietFrom = f;
    } else {
      if (quietFrom >= 0 && f - quietFrom >= PAUSE_FRAMES) gaps.push([quietFrom, f]);
      quietFrom = -1;
    }
  }
  const segs = [];
  let from = first;
  for (const [a, b] of gaps) { segs.push([from, a]); from = b; }
  segs.push([from, last + 1]);

  // A number is read out digit-group by digit-group ("nineteen forty"), so it weighs
  // what its digits do; a word weighs its vowel groups.
  const weight = (w) => {
    const digits = (w.match(/\d/g) || []).length;
    if (digits) return digits;
    return Math.max(1, (w.toLowerCase().match(/[aeiouy]+/g) || []).length) + 0.25;
  };
  // Spread words over the SPEECH in a list of segments, skipping the pauses between.
  const place = (idx, list) => {
    const total = list.reduce((n, [a, b]) => n + (b - a), 0);
    const wsum = idx.reduce((n, k) => n + weight(tokens[k]), 0) || 1;
    const out = [];
    let acc = 0;
    for (const k of idx) {
      let rem = (acc / wsum) * total;
      let at = list[0][0];
      for (const [a, b] of list) {
        if (rem <= b - a) { at = a + rem; break; }
        rem -= b - a;
        at = b;
      }
      out.push([k, at]);
      acc += weight(tokens[k]);
    }
    return out;
  };

  const phrases = [];
  let cur = [];
  tokens.forEach((w, k) => {
    cur.push(k);
    if (/[.,;:?!…]["”’')\]]*$/.test(w)) { phrases.push(cur); cur = []; }
  });
  if (cur.length) phrases.push(cur);

  const starts = new Array(tokens.length).fill(first);
  const everywhere = new Map(place(tokens.map((_, k) => k), segs));

  // Each clause boundary takes the pause nearest where the words say it should be,
  // in order, leaving enough pauses for the boundaries still to come.
  let chosen = null;
  if (phrases.length > 1 && gaps.length >= phrases.length - 1) {
    chosen = [];
    let next = 0;
    for (let p = 1; p < phrases.length; p += 1) {
      const est = everywhere.get(phrases[p][0]);
      const lastUsable = gaps.length - (phrases.length - 1 - p);
      let best = -1, bestD = Infinity;
      for (let g = next; g < lastUsable; g += 1) {
        const d = Math.abs((gaps[g][0] + gaps[g][1]) / 2 - est);
        if (d < bestD) { bestD = d; best = g; }
      }
      if (best < 0) { chosen = null; break; }
      chosen.push(best);
      next = best + 1;
    }
  }

  if (chosen) {
    let s0 = 0;
    phrases.forEach((ph, p) => {
      const s1 = p < chosen.length ? chosen[p] + 1 : segs.length;
      for (const [k, at] of place(ph, segs.slice(s0, s1))) starts[k] = at;
      s0 = s1;
    });
  } else {
    for (const [k, at] of everywhere) starts[k] = at;
  }

  let prev = 0;
  return starts.map((f) => {
    const t = Math.max(prev, Math.round(f) * FRAME_S);
    prev = t;
    return Math.round(t * 100) / 100;
  });
}

let fails = 0;
const blocks = [];
for (const [lessonId, scriptFile] of Object.entries(LESSONS)) {
  const beats = beatsOf(scriptFile);
  const entries = [];
  beats.forEach((b, i) => {
    if (!spoken(b)) return;
    const rel = `assets/narration/${lessonId}/beat-${String(i).padStart(2, '0')}.wav`;
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) { console.log(`  MISSING ${rel}`); fails += 1; return; }
    const { rate, samples } = readWav(abs);
    const dur = samples.length / rate;
    const words = wordStarts(samples, rate, b.text);
    const tokens = b.text.match(/\S+/g) || [];
    if (words.length !== tokens.length) { console.log(`  FAIL ${rel}: ${words.length} times for ${tokens.length} words`); fails += 1; return; }
    entries.push({ i, rel, dur, words, text: b.text });
    console.log(`  ${lessonId} beat ${i}  ${dur.toFixed(2)}s  ${tokens.map((w, k) => `${w}@${words[k].toFixed(2)}`).join(' ')}`);
  });
  blocks.push({ lessonId, entries });
}
if (fails) {
  console.log(`\n${fails} problem(s); the manifest was not written.`);
  process.exit(1);
}

const body = blocks.map(({ lessonId, entries }) => [
  `  ${JSON.stringify(lessonId)}: {`,
  ...entries.map((e) => [
    `    ${e.i}: {`,
    `      clip: require('../../${e.rel}'),`,
    `      dur: ${e.dur.toFixed(2)},`,
    `      text: ${JSON.stringify(e.text)},`,
    `      words: [${e.words.map((w) => w.toFixed(2)).join(', ')}],`,
    `    },`,
  ].join('\n')),
  `  },`,
].join('\n')).join('\n');

fs.writeFileSync(OUT, `// GENERATED by scripts/make-narration.mjs. Do not edit by hand.
//
// Which lessons are narrated, the clip for each spoken beat, and when each word of it
// starts (estimated from the clip; see the script). A lesson that is not here is not
// narrated, and plays exactly as it did before narration existed.
import type { NarratedLine } from './types';

export const NARRATION: Record<string, Record<number, NarratedLine>> = {
${body}
};
`);
console.log(`\nwrote ${path.relative(ROOT, OUT)}: ${blocks.reduce((n, b) => n + b.entries.length, 0)} line(s) in ${blocks.length} lesson(s)`);
