// THE HOST'S VOICE ON THE FIRST SCREEN — one MP3, and a word-timed table for it.
//
//   FFMPEG=<path to an ffmpeg with libmp3lame> node scripts/make-welcome-voice.mjs
//
// The seated welcome (components/welcome/SeatedWelcome.tsx) has its host say seven
// lines, read by the same Chirp 3 HD voice the lessons use (Algieba, en-GB). Each line
// was rendered on its own through the character ledger, so the pauses between lines are
// the SCREEN's to choose rather than the voice's, and each line could be given its own
// pace — slower for the Socrates quotation and slower again for the last line.
//
// What this does, and why each step is the lessons' own:
//
//   · reads the WAV masters in assets/welcome/voice/ (l1.wav … l7.wav, as Chirp gave
//     them — nothing here trims or alters a take);
//   · refuses a take with a burst, a clipped run, a stall or the wrong pace for its
//     words, through the SAME `audioFaults` check:narration judges lesson lines with;
//   · lays the takes end to end with the lessons' GAP_S of silence and the lessons'
//     synthesised RELEASE after each one, so no line ends on a click;
//   · encodes that once as a 64 kbps mono MP3, because one file is one asset and the
//     player seeks to each line, exactly as lib/narration/real.ts does;
//   · estimates when every word starts from the pauses inside its take (Chirp returns no
//     word timings), and writes components/welcome/welcomeVoice.ts.
//
// The WORDS live here, and only here. A `|` marks where the speech bubble turns to a
// new page, which is how a long line fits a bubble of three rows. The words must be the
// ones the take says; the punctuation is the delivery (an ellipsis is where he pauses).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  ROOT, WAV_RATE, GAP_SAMPLES, parseWav, releaseOf, measureAudio, audioFaults, wordWeight,
} from './lib/narration.mjs';

const DIR = path.join(ROOT, 'assets', 'welcome', 'voice');
const OUT_MP3 = path.join(DIR, 'welcome.mp3');
const OUT_TS = path.join(ROOT, 'components', 'welcome', 'welcomeVoice.ts');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

/** What he says, in order. `|` turns the bubble's page; it is not spoken. */
const LINES = [
  { key: 'l1', text: 'So… you want to learn philosophy?' },
  { key: 'l2', text: "Or possibly… you're already a well-distinguished individual, | getting back into it." },
  { key: 'l3', text: "Whichever the case, you're here to learn." },
  { key: 'l4', text: 'And I have the perfect program for you, | to achieve your goals in vast knowledge of the subject!' },
  { key: 'l5', text: 'The only thing I ask of you… is mental effort, and curiosity.' },
  { key: 'l6', text: 'As Socrates once said, | “The unexamined life is not worth living.”' },
  { key: 'l7', text: 'Thus begins your journey.' },
];

// ── when each word starts ───────────────────────────────────────────────────
// The estimator scripts/make-narration.mjs uses, restated: quiet stretches of 120ms or
// more inside the speech are pauses; each clause boundary (a word ending in punctuation)
// takes the pause nearest where the words' weights say it should fall, in order; and the
// words inside a clause are spread over its speech by weight.
const FRAME_S = 0.01;
const PAUSE_FRAMES = 12;
function wordStarts(pcm, rate, tokens) {
  const FRAME = Math.round(rate * FRAME_S);
  const nf = Math.floor(pcm.length / FRAME);
  const db = new Float64Array(nf);
  let top = -120;
  for (let f = 0; f < nf; f += 1) {
    let s = 0;
    for (let j = f * FRAME; j < (f + 1) * FRAME; j += 1) { const v = pcm[j] / 32768; s += v * v; }
    db[f] = 10 * Math.log10(s / FRAME + 1e-12);
    if (db[f] > top) top = db[f];
  }
  const floor = Math.max(top - 32, -50);
  const voiced = Array.from(db, (d) => d > floor);
  const first = voiced.indexOf(true);
  const last = voiced.lastIndexOf(true);
  const gaps = [];
  let q = -1;
  for (let f = first; f <= last; f += 1) {
    if (!voiced[f]) { if (q < 0) q = f; } else { if (q >= 0 && f - q >= PAUSE_FRAMES) gaps.push([q, f]); q = -1; }
  }
  const segs = [];
  let from = first;
  for (const [a, b] of gaps) { segs.push([from, a]); from = b; }
  segs.push([from, last + 1]);
  const place = (idx, list) => {
    const total = list.reduce((n, [a, b]) => n + (b - a), 0);
    const wsum = idx.reduce((n, k) => n + wordWeight(tokens[k]), 0) || 1;
    let acc = 0;
    return idx.map((k) => {
      let rem = (acc / wsum) * total;
      let at = list[0][0];
      for (const [a, b] of list) { if (rem <= b - a) { at = a + rem; break; } rem -= b - a; at = b; }
      acc += wordWeight(tokens[k]);
      return [k, at];
    });
  };
  const phrases = [];
  let cur = [];
  tokens.forEach((w, k) => { cur.push(k); if (/[.,;:?!…]["”’')\]]*$/.test(w)) { phrases.push(cur); cur = []; } });
  if (cur.length) phrases.push(cur);
  const everywhere = new Map(place(tokens.map((_, k) => k), segs));
  let starts = tokens.map((_, k) => everywhere.get(k));
  if (phrases.length > 1 && gaps.length >= phrases.length - 1) {
    const chosen = [];
    let next = 0;
    for (let p = 1; p < phrases.length; p += 1) {
      const est = everywhere.get(phrases[p][0]);
      const lastUsable = gaps.length - (phrases.length - 1 - p);
      let best = -1, bestD = Infinity;
      for (let g = next; g < lastUsable; g += 1) {
        const d = Math.abs((gaps[g][0] + gaps[g][1]) / 2 - est);
        if (d < bestD) { bestD = d; best = g; }
      }
      if (best < 0) { chosen.length = 0; break; }
      chosen.push(best);
      next = best + 1;
    }
    if (chosen.length === phrases.length - 1) {
      const m = new Array(tokens.length).fill(first);
      let s0 = 0;
      phrases.forEach((ph, p) => {
        const s1 = p < chosen.length ? chosen[p] + 1 : segs.length;
        for (const [k, at] of place(ph, segs.slice(s0, s1))) m[k] = at;
        s0 = s1;
      });
      starts = m;
    }
  }
  let prev = 0;
  return starts.map((f) => {
    const t = Math.max(prev, Math.round(f) * FRAME_S);
    prev = t;
    return Math.round(t * 100) / 100;
  });
}

function wavOf(pcm) {
  const b = Buffer.alloc(44 + pcm.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + pcm.length * 2, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(WAV_RATE, 24); b.writeUInt32LE(WAV_RATE * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(pcm.length * 2, 40);
  for (let i = 0; i < pcm.length; i += 1) b.writeInt16LE(pcm[i], 44 + i * 2);
  return b;
}

let fails = 0;
const takes = [];
let start = 0;
for (const l of LINES) {
  const file = path.join(DIR, `${l.key}.wav`);
  if (!fs.existsSync(file)) { console.log(`  MISSING ${path.relative(ROOT, file)}`); fails += 1; continue; }
  const w = parseWav(fs.readFileSync(file));
  if (!w.pcm || w.rate !== WAV_RATE) { console.log(`  ${l.key}: not a ${WAV_RATE} Hz mono LINEAR16 WAV`); fails += 1; continue; }
  const spoken = l.text.replace(/\|/g, ' ').replace(/\s+/g, ' ').trim();
  const faults = audioFaults(measureAudio(w.pcm, w.rate), spoken);
  if (faults.length) { for (const f of faults) console.log(`  ${f.kind} ${l.key}: ${f.say}`); fails += 1; continue; }
  const tokens = spoken.split(' ');
  // Page starts, as word indexes: the first word of every page.
  const pages = [0];
  let n = 0;
  for (const part of l.text.split('|').slice(0, -1)) { n += part.trim().split(/\s+/).length; pages.push(n); }
  const words = wordStarts(w.pcm, w.rate, tokens);
  takes.push({ ...l, spoken, tokens, pages, words, pcm: w.pcm, start, at: Math.round((start / WAV_RATE) * 1000) / 1000, dur: w.pcm.length / WAV_RATE });
  start += w.pcm.length + GAP_SAMPLES;
}
if (fails) { console.log(`\n${fails} problem(s); nothing was written.`); process.exit(1); }

const pcm = new Int16Array(start);
for (const t of takes) { pcm.set(t.pcm, t.start); pcm.set(releaseOf(t.pcm), t.start + t.pcm.length); }
const tmp = path.join(os.tmpdir(), 'ashmere-welcome-voice.wav');
fs.writeFileSync(tmp, wavOf(pcm));
const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-i', tmp, '-map_metadata', '-1',
  '-c:a', 'libmp3lame', '-b:a', '64k', '-ac', '1', OUT_MP3], { encoding: 'utf8' });
fs.rmSync(tmp, { force: true });
if (r.status !== 0 || !fs.existsSync(OUT_MP3)) { console.log(`  ffmpeg failed: ${r.error ? r.error.message : r.stderr}`); process.exit(1); }

const q = (s) => JSON.stringify(s);
const body = takes.map((t) => `  {\n    text: ${q(t.spoken)},\n    pages: [${t.pages.join(', ')}],\n    at: ${t.at},\n    dur: ${t.dur.toFixed(3)},\n    words: [${t.words.join(', ')}],\n  },`).join('\n');
fs.writeFileSync(OUT_TS, `// GENERATED by scripts/make-welcome-voice.mjs — do not edit by hand.
//
// The seated host's seven lines on the first screen, as they sit in
// assets/welcome/voice/welcome.mp3. Zero imports, so the timeline that reads this can
// be stepped in plain Node.
//
//   text   what he says, as the speech bubble shows it
//   pages  the index of the first word on each page of the bubble
//   at     where the line starts in the MP3, seconds
//   dur    how long the take runs, seconds
//   words  when each word starts, seconds from the start of the line (estimated from
//          the pauses in the take; Chirp 3 HD returns no word timings)

export interface VoiceLine {
  text: string;
  pages: number[];
  at: number;
  dur: number;
  words: number[];
}

export const VOICE_LINES: VoiceLine[] = [
${body}
];
`);
for (const t of takes) console.log(`  ${t.key} @${t.at.toFixed(3)}s ${t.dur.toFixed(2)}s  ${t.tokens.map((w, k) => `${w}@${t.words[k].toFixed(2)}`).join(' ')}`);
console.log(`\n${takes.length} lines · ${(pcm.length / WAV_RATE).toFixed(2)}s · ${(fs.statSync(OUT_MP3).size / 1024).toFixed(0)} KB → ${path.relative(ROOT, OUT_MP3)}`);
