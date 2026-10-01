// ─────────────────────────────────────────────────────────────────────────────
// A DIALOGUE LINE BROUGHT UP TO PACE WITHOUT A NEW RENDER (LESSON_RULES AP17).
//
// The owner, 2026-10-01: the voices slowed down "so much where it sounds so bad", and
// *"if there's a way to change the speed … without using characters again then please
// do so."* Every take is already a clean, finished read; only its speed is wrong. So
// each line is cut at its sentence ends (which the pause tags guarantee are silences),
// each sentence that sits under its pace's aim is time-stretched up to it with
// rubberband (pitch held, so the voice is the same person, just quicker), the sentences
// are joined again, and every pause is SET once more to its punctuation's length
// (prosody.shapePauses) — a comma still rests, a full stop longer, a question longer
// still. A sentence already at or over its aim is left exactly as it was: nothing is
// slowed down.
//
// Writes the takes and a job file; scripts/install-narration.mjs then holds each to the
// bands like any other take.
//   FFMPEG=<ffmpeg with librubberband> node scripts/retime-narration.mjs <out dir> <lesson id> …
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ASSETS, LESSONS, beatsOf, spoken, parseWav, readRenders, keyOf } from './lib/narration.mjs';
import { PACES, PAUSES, MIN_SYLLABLES, paceRates, readTake, sentenceSpans, shapePauses, trimLead, wavOf, prosodyFaults } from './lib/prosody.mjs';

const FF = process.env.FFMPEG || 'ffmpeg';
const [outDir, ...ids] = process.argv.slice(2);
if (!outDir || !ids.length) { console.error('usage: node scripts/retime-narration.mjs <out dir> <lesson id> …'); process.exit(2); }
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'retime-'));
/** The most a sentence is sped up. Past this a stretch starts to sound processed. */
const MAX_F = 1.45;
/** A sentence too short to measure is sped up no more than this. */
const SHORT_F = 1.3;
/** Silence kept after the last word. */
const TAIL_S = 0.25;

function stretch(seg, rate, f) {
  if (Math.abs(f - 1) < 0.004) return seg;
  const a = path.join(TMP, 'a.wav'), b = path.join(TMP, 'b.wav');
  fs.writeFileSync(a, wavOf(seg, rate));
  const r = spawnSync(FF, ['-y', '-loglevel', 'error', '-i', a, '-af', `rubberband=tempo=${f.toFixed(4)}:pitchq=quality`,
    '-ar', String(rate), '-ac', '1', '-c:a', 'pcm_s16le', b]);
  if (r.status) throw new Error(`ffmpeg: ${r.stderr}`);
  return parseWav(fs.readFileSync(b)).pcm;
}

function build(pcm, rate, text, pace, factors) {
  const take = readTake(pcm, rate, text, pace);
  const spans = sentenceSpans(take, pcm.length, text, pace) ?? [[0, pcm.length]];
  const fs_ = spans.length === factors.length ? factors : [Math.max(...factors)];
  const gap = Math.round(rate * PAUSES.stop.aim);
  const fade = Math.round(rate * 0.005);
  const parts = spans.map(([a, b], k) => {
    const seg = Int16Array.from(stretch(pcm.subarray(a, b), rate, fs_[k]));
    for (let i = 0; i < fade && i < seg.length; i += 1) {
      const g = i / fade;
      if (k > 0) seg[i] = Math.round(seg[i] * g);
      if (k < spans.length - 1) seg[seg.length - 1 - i] = Math.round(seg[seg.length - 1 - i] * g);
    }
    return seg;
  });
  const out = new Int16Array(parts.reduce((n, p) => n + p.length, 0) + gap * (parts.length - 1));
  let at = 0;
  parts.forEach((p, k) => { out.set(p, at); at += p.length + (k < parts.length - 1 ? gap : 0); });
  let shaped = trimLead(shapePauses(out, rate, text, pace), rate, 0.1);
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
      return Math.min(cap, x * (aim / s.rate));
    });
    // and everything said at one pace, together, inside that pace's band
    for (const [p, r] of paceRates(now)) {
      const band = PACES[p];
      const k = r.rate < band.min + 0.05 ? band.aim / r.rate : r.rate > band.max - 0.05 ? band.aim / r.rate : 1;
      if (k === 1) continue;
      f = f.map((x, j) => (now.sentences[j]?.pace !== p ? x
        : k > 1 ? Math.min(MAX_F, x * k) : Math.max(1, x * k)));
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
    const w = parseWav(fs.readFileSync(path.join(ASSETS, `${key}.wav`)));
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
