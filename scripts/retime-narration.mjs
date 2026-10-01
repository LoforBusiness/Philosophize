// ─────────────────────────────────────────────────────────────────────────────
// A DIALOGUE LINE BROUGHT UP TO PACE WITHOUT A NEW RENDER (LESSON_RULES AP17).
//
// The owner, 2026-10-01: the voices slowed down "so much where it sounds so bad", and
// *"if there's a way to change the speed … without using characters again then please
// do so."* Every take is already a clean, finished read; only its speed is wrong. So
// each line is cut at its sentence ends (which the pause tags guarantee are silences),
// each sentence that sits under its pace's aim is time-stretched up to it with PSOLA
// (pitch held, so the voice is the same person, just quicker), the sentences
// are joined again, and every pause is SET once more to its punctuation's length
// (prosody.shapePauses) — a comma still rests, a full stop longer, a question longer
// still. A sentence already at or over its aim is left exactly as it was: nothing is
// slowed down.
//
// Writes the takes and a job file; scripts/install-narration.mjs then holds each to the
// bands like any other take.
//   RETIME_PYTHON=<python with praat-parselmouth> node scripts/retime-narration.mjs <out dir> [--from <original takes dir>] <lesson id> …
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ASSETS, LESSONS, beatsOf, spoken, parseWav, readRenders, keyOf } from './lib/narration.mjs';
import { PACES, PAUSES, MIN_SYLLABLES, SENTENCE_SLACK, STRAY_MAX, STRAY_AIM, paceRates, readTake, sentencesOf, sentenceSpans, shapePauses, trimLead, wavOf, prosodyFaults } from './lib/prosody.mjs';

const FF = process.env.FFMPEG || 'ffmpeg';
const PY = process.env.RETIME_PYTHON || '';
const PSOLA = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), 'lib', 'psola.py');
// --from <dir>: read each take from a copy of the ORIGINAL renders. Stretch a take once,
// from what the voice gave; stretching an already-stretched take stacks the artifacts.
const argv = process.argv.slice(2);
const fromAt = argv.indexOf('--from');
const SRC = fromAt >= 0 ? argv.splice(fromAt, 2)[1] : ASSETS;
const [outDir, ...ids] = argv;
if (!outDir || !ids.length) { console.error('usage: node scripts/retime-narration.mjs <out dir> <lesson id> …'); process.exit(2); }
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'retime-'));
/** The most a sentence is sped up. Past this a stretch starts to sound processed. */
const MAX_F = 1.55;
/** A sentence too short to measure is sped up no more than this: in a short exclamation
 * ("Oh, no.") the drawn-out vowel is the intonation, not slow talking, and squeezing it
 * costs the most sound for the least pace. */
const SHORT_F = 1.2;
/** …and no more than this when the whole line needs it to reach its band. */
const SHORT_LINE_F = 1.4;
/** Silence kept after the last word. */
const TAIL_S = 0.25;

/**
 * One sentence, `f` times quicker, its pitch kept. PSOLA (Praat, through scripts/lib/psola.py)
 * when RETIME_PYTHON names a Python with praat-parselmouth: it cuts whole voice periods, so
 * the voice keeps its own waveform, and it measured cleanest (see psola.py). Rubberband
 * through ffmpeg otherwise, which smears the harmonics more and is the fallback only.
 */
function stretchAll(jobs, rate) {
  const todo = jobs.map((j, k) => ({ ...j, k })).filter((j) => Math.abs(j.f - 1) >= 0.004);
  const out = jobs.map((j) => j.seg);
  if (!todo.length) return out;
  const files = todo.map((j) => {
    const a = path.join(TMP, `a${j.k}.wav`), b = path.join(TMP, `b${j.k}.wav`);
    fs.writeFileSync(a, wavOf(j.seg, rate));
    return { a, b, j };
  });
  if (PY) {
    const r = spawnSync(PY, [PSOLA, ...files.flatMap(({ a, b, j }) => [a, b, j.f.toFixed(4)])]);
    if (r.status) throw new Error(`psola: ${r.stderr}`);
  } else {
    for (const { a, b, j } of files) {
      const r = spawnSync(FF, ['-y', '-loglevel', 'error', '-i', a, '-af', `rubberband=tempo=${j.f.toFixed(4)}:pitchq=quality`,
        '-ar', String(rate), '-ac', '1', '-c:a', 'pcm_s16le', b]);
      if (r.status) throw new Error(`ffmpeg: ${r.stderr}`);
    }
  }
  for (const { b, j } of files) {
    const w = parseWav(fs.readFileSync(b));
    if (w.rate !== rate) throw new Error(`stretch came back at ${w.rate} Hz, not ${rate}`);
    out[j.k] = w.pcm;
  }
  return out;
}

/** Silence kept on the speech side of every cut, so a cut never lands in a word. */
const PAD_S = 0.015;

function build(pcm, rate, text, pace, factors) {
  const take = readTake(pcm, rate, text, pace);
  const F = take.frames.F;
  const spans = sentenceSpans(take, pcm.length, text, pace) ?? [[0, pcm.length]];
  const fs_ = spans.length === factors.length ? factors : [Math.max(...factors)];
  const fade = Math.round(rate * 0.005);
  const pad = Math.round(rate * PAD_S);
  // ONLY THE SPEECH IS STRETCHED. Each sentence is cut inside its own pauses, the runs of
  // speech are sped up and the silences between them kept as they were, so no pause can be
  // squeezed out of existence and nothing processes air; shapePauses then sets each one.
  // And each pause is SET here, to its mark's length, from the silence that was there: the
  // middle of it taken out, or zeros laid into the middle. Measured afterwards a stretched
  // pause can read short, because the take's loudest frame (and so its floor) moved.
  const wantAt = new Map();
  for (const m of take.marks) if (m.gap >= 0) wantAt.set(m.gap, PAUSES[m.kind].aim);
  const silence = (raw, want) => {
    const need = Math.max(0, Math.round(want * rate) - 2 * pad);
    if (need === raw.length) return raw;
    const out = new Int16Array(need);
    const h = Math.min(Math.floor(need / 2), Math.floor(raw.length / 2));
    out.set(raw.subarray(0, h), 0);
    out.set(raw.subarray(raw.length - h), need - h);
    return out;
  };
  const jobs = [];
  const plan = spans.map(([a, b], k) => {
    const pieces = [];
    let from = a;
    take.gaps.forEach((g, gi) => {
      const s0 = g.a * F + pad, s1 = g.b * F - pad;
      if (g.a * F < a || g.b * F > b || s1 <= s0) return;
      const want = wantAt.get(gi) ?? (g.len > STRAY_MAX ? STRAY_AIM : null);
      pieces.push({ job: jobs.push({ seg: pcm.subarray(from, s0), f: fs_[k] }) - 1 });
      pieces.push({ raw: want === null ? pcm.subarray(s0, s1) : silence(pcm.subarray(s0, s1), want) });
      from = s1;
    });
    pieces.push({ job: jobs.push({ seg: pcm.subarray(from, b), f: fs_[k] }) - 1 });
    return pieces;
  });
  const done = stretchAll(jobs, rate);
  const parts = plan.map((pieces, k) => {
    const chunks = pieces.map((p) => (p.raw ?? done[p.job]));
    const seg = new Int16Array(chunks.reduce((n, c) => n + c.length, 0));
    let o = 0;
    for (const c of chunks) { seg.set(c, o); o += c.length; }
    for (let i = 0; i < fade && i < seg.length; i += 1) {
      const g = i / fade;
      if (k > 0) seg[i] = Math.round(seg[i] * g);
      if (k < spans.length - 1) seg[seg.length - 1 - i] = Math.round(seg[seg.length - 1 - i] * g);
    }
    return seg;
  });
  // between sentences: the mark that ends each one (a question rests longer than a stop),
  // less the silence sentenceSpans left on either side of the cut
  const keep = 2 * Math.round(F * 3);
  const sents = sentencesOf(text, pace);
  const gaps = parts.slice(0, -1).map((_, k) => {
    const m = take.marks.find((x) => x.word === sents[k]?.to);
    return Math.max(0, Math.round((m ? PAUSES[m.kind].aim : PAUSES.stop.aim) * rate) - keep);
  });
  const out = new Int16Array(parts.reduce((n, p) => n + p.length, 0) + gaps.reduce((n, g) => n + g, 0));
  let at = 0;
  parts.forEach((p, k) => { out.set(p, at); at += p.length + (k < parts.length - 1 ? gaps[k] : 0); });
  // then measure, and set any pause that still reads outside its length
  let shaped = out;
  for (let r = 0; r < 3; r += 1) {
    const marks = readTake(shaped, rate, text, pace).marks;
    if (marks.every((m) => m.gap >= 0 && Math.abs(m.len - PAUSES[m.kind].aim) < 0.03)) break;
    shaped = shapePauses(shaped, rate, text, pace);
  }
  shaped = trimLead(shaped, rate, 0.1);
  // the silence after the last word, at its length
  const t = readTake(shaped, rate, text, pace);
  const end = (t.frames.last + 1) * t.frames.F + Math.round(rate * TAIL_S);
  if (end < shaped.length) shaped = shaped.slice(0, end);
  else if (end > shaped.length) { const p = new Int16Array(end); p.set(shaped); shaped = p; }
  return shaped;
}

function retime(pcm, rate, text, pace) {
  const take = readTake(pcm, rate, text, pace);
  let f = take.sentences.map((s) => {
    if (!s.rate) return 1;
    const want = PACES[s.pace].aim / s.rate;
    return Math.min(s.syllables >= MIN_SYLLABLES ? MAX_F : SHORT_F, Math.max(1, want));
  });
  let out = build(pcm, rate, text, pace, f);
  for (let round = 0; round < 6; round += 1) {
    const now = readTake(out, rate, text, pace);
    const was = f.slice();
    f = f.map((x, k) => {
      const s = now.sentences[k];
      if (!s?.rate || s.syllables < 5) return x;
      const aim = PACES[s.pace].aim;
      if (s.rate >= aim - 0.08) return x;
      const cap = s.syllables >= MIN_SYLLABLES ? MAX_F : SHORT_F;
      return Math.max(x, Math.min(cap, x * (aim / s.rate)));
    });
    // and everything said at one pace, together, inside that pace's band
    for (const [p, r] of paceRates(now)) {
      const band = PACES[p];
      const k = r.rate < band.min + 0.05 ? band.aim / r.rate : r.rate > band.max - 0.05 ? band.aim / r.rate : 1;
      if (k === 1) continue;
      f = f.map((x, j) => {
        const s = now.sentences[j];
        if (s?.pace !== p) return x;
        if (k < 1) return Math.max(1, x * k);
        // a short sentence may go further here than on its own (the line needs it), and no
        // long one is pushed over its own ceiling to make up for a short one beside it
        let cap = s.syllables >= MIN_SYLLABLES ? MAX_F : SHORT_LINE_F;
        if (s.rate && s.syllables >= MIN_SYLLABLES) cap = Math.min(cap, x * ((band.max + SENTENCE_SLACK - 0.1) / s.rate));
        return Math.max(x, Math.min(cap, x * k));
      });
    }
    if (f.every((x, j) => Math.abs(x - was[j]) < 0.004)) break;
    out = build(pcm, rate, text, pace, f);
  }
  return { out, f };
}

fs.mkdirSync(outDir, { recursive: true });
const records = readRenders();
const items = [];
let faulty = 0;
for (const id of ids) {
  if (!LESSONS[id]) throw new Error(`${id} is not in LESSONS`);
  beatsOf(LESSONS[id]).forEach((b, i) => {
    if (!spoken(b) || !b.speaker) return;
    const key = keyOf(id, i);
    const w = parseWav(fs.readFileSync(path.join(SRC, `${key}.wav`)));
    const before = readTake(w.pcm, w.rate, b.text, b.pace);
    const { out, f } = retime(w.pcm, w.rate, b.text, b.pace);
    const after = readTake(out, w.rate, b.text, b.pace);
    const faults = prosodyFaults(after, b.text);
    if (faults.length) faulty += 1;
    const dest = path.join(outDir, `${key}.wav`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, wavOf(out, w.rate));
    items.push({ key, text: b.text, voice: records[key]?.voice });
    const r = (t) => t.sentences.map((s) => (s.rate ? s.rate.toFixed(2) : '–')).join('/');
    console.log(`${faults.length ? 'FAULT' : 'ok   '} ${key} ${(w.pcm.length / w.rate).toFixed(2)}s→${(out.length / w.rate).toFixed(2)}s  ${r(before)} → ${r(after)}  ×${f.map((x) => x.toFixed(2)).join('/')}`);
    for (const x of faults) console.log(`        ${x.kind}: ${x.say}`);
  });
}
fs.writeFileSync(path.join(outDir, 'job.json'), `${JSON.stringify({ items }, null, 2)}\n`);
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`\n${items.length} line(s) written to ${outDir}; ${faulty} still faulted. Next: node scripts/install-narration.mjs ${path.join(outDir, 'job.json')} ${outDir}`);
