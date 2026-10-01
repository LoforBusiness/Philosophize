// COUNTER-TEST FOR AP17: put each fault back into a real installed take and watch
// prosody.mjs catch it — and watch the take itself pass.
//
//   node scripts/countertest-prosody.mjs
//
// Nothing here touches the working tree: every defect is made in memory from the WAV
// master of economics-foundations-1 beat 3, a two-pace line ("…all do. That gap is
// called scarcity.") with two commas and a full stop inside it.
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS, keyOf, parseWav } from './lib/narration.mjs';
import { readTake, prosodyFaults } from './lib/prosody.mjs';

const ID = 'economics-foundations-1', BEAT = 3;
const TEXT = 'Your wants never run out, but your money, your time and the bread on that stall all do. That gap is called scarcity.';
const PACE = ['even', 'even'];
const w = parseWav(fs.readFileSync(path.join(ASSETS, `${keyOf(ID, BEAT)}.wav`)));
const R = w.rate;
const kinds = (pcm) => prosodyFaults(readTake(pcm, R, TEXT, PACE), TEXT).map((f) => f.kind);
const take = readTake(w.pcm, R, TEXT, PACE);
const F = take.frames.F;
const cat = (...parts) => { const out = new Int16Array(parts.reduce((n, p) => n + p.length, 0)); let at = 0; for (const p of parts) { out.set(p, at); at += p.length; } return out; };
const zeros = (s) => new Int16Array(Math.round(R * s));
const gapOf = (k) => take.gaps[take.marks[k].gap];

// A pause fault is CAUGHT whichever name it comes back under: with a comma's silence gone,
// the aligner may lay the comma on a stop consonant's 0.1 s closure (PAUSE) rather than
// on nothing (NO PAUSE), and a silence added mid-phrase may take the comma's place and
// leave the real one stray. Every one of those is a fault on the line.
const PAUSING = ['NO PAUSE', 'PAUSE', 'STRAY PAUSE'];
const cases = [
  ['the take as installed', w.pcm, []],
  ['a comma the voice ran through', (() => { const g = gapOf(0); return cat(w.pcm.subarray(0, g.a * F), w.pcm.subarray(g.b * F)); })(), PAUSING],
  ['a comma held for 0.6 s', (() => { const g = gapOf(0); return cat(w.pcm.subarray(0, g.a * F), zeros(0.6), w.pcm.subarray(g.b * F)); })(), ['PAUSE']],
  ['a full stop of 0.1 s', (() => { const g = gapOf(2); return cat(w.pcm.subarray(0, g.a * F), zeros(0.1), w.pcm.subarray(g.b * F)); })(), ['PAUSE']],
  ['a silence where the text has no mark', (() => { const g = gapOf(0); const at = Math.round((g.a * F) / 2); return cat(w.pcm.subarray(0, at), zeros(0.5), w.pcm.subarray(at)); })(), PAUSING],
  ['the whole line a fifth too fast', (() => { const n = Math.round(w.pcm.length / 1.25); const o = new Int16Array(n); for (let i = 0; i < n; i += 1) o[i] = w.pcm[Math.min(w.pcm.length - 1, Math.round(i * 1.25))]; return o; })(), ['TOO FAST']],
  ['the whole line a fifth too slow', (() => { const n = Math.round(w.pcm.length * 1.3); const o = new Int16Array(n); for (let i = 0; i < n; i += 1) o[i] = w.pcm[Math.min(w.pcm.length - 1, Math.round(i / 1.3))]; return o; })(), ['TOO SLOW']],
  ['the take cut inside its last word', w.pcm.subarray(0, (take.frames.last - 4) * F), ['CUT OFF']],
];

let bad = 0;
for (const [name, pcm, want] of cases) {
  const got = new Set(kinds(pcm));
  const ok = want.length ? (want === PAUSING ? want.some((k) => got.has(k)) : want.every((k) => got.has(k))) : got.size === 0;
  if (!ok) bad += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}: ${want.length ? `wants ${want.join(', ')}` : 'wants nothing'}, got ${[...got].join(', ') || 'nothing'}`);
}
console.log(bad ? `\n${bad} counter-test(s) not caught.\n` : '\nevery fault is caught, and the real take passes.\n');
process.exit(bad ? 1 : 0);
