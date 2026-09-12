// ─────────────────────────────────────────────────────────────────────────────
// NARRATION: EVERY LINE THE APP SPEAKS IS THE LINE ON SCREEN, WHOLE AND CLEAN
//
//   npm run check:narration
//
// Offline, with no Google, no ffmpeg and no browser. For every narrated lesson it holds:
//
//   1. THE MANIFEST IS THE SCRIPT. Every spoken beat has a clip, no clip belongs to a
//      beat that is not spoken, and each line's text and length are the beat's and
//      the WAV's now.
//   2. EACH CLIP SAYS THOSE WORDS. assets/narration/renders.json records the words each
//      WAV was rendered from, and its SHA-256. A beat rewritten after its render fails
//      here, because make-narration on its own would time the old audio against the
//      new text.
//   3. EACH MP3 IS ITS WAV, by the hash encode-narration writes into it.
//   4. EACH TAKE IS CLEAN: no clipped run, no pile of clipped samples, no burst, a
//      pace that fits its words, and no stall. The limits, and the lines they were
//      calibrated on, are in scripts/lib/narration.mjs.
//
// It exists because a reader heard a burst and then a garbled voice in
// metaphysics-being-4 on 12 Sep 2026, and nothing had ever measured the audio.
// Counter-tested by `node scripts/countertest-narration.mjs`, in both directions.
// NARRATION_MANIFEST, NARRATION_ASSETS and NARRATION_ONLY exist for that test.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, ASSETS, MANIFEST, LESSONS, keyOf, requireOf, beatsOf, spoken, lineFaults, parseManifest, readRenders,
  weightOf, MAX_CLIP_RUN, MAX_CLIPS_IN_50MS, BURST_DBFS, PACE_MIN, PACE_MAX, MAX_PAUSE_S, MAX_EDGE_SILENCE_S,
} from './lib/narration.mjs';

const manifestFile = process.env.NARRATION_MANIFEST ? path.resolve(ROOT, process.env.NARRATION_MANIFEST) : MANIFEST;
const assets = process.env.NARRATION_ASSETS ? path.resolve(ROOT, process.env.NARRATION_ASSETS) : ASSETS;
const only = process.env.NARRATION_ONLY || null;

let fails = 0;
const ok = (m, d = '') => console.log(`  ok    ${m}${d ? `  ${d}` : ''}`);
const bad = (m, d = '') => { fails += 1; console.log(`  FAIL  ${m}${d ? `  ${d}` : ''}`); };

console.log('\nNARRATION\n');

const findings = [];
const note = (key, kind, say) => findings.push({ key, kind, say });

const { lessons, problems } = parseManifest(fs.readFileSync(manifestFile, 'utf8'));
for (const p of problems) note('manifest', 'MANIFEST', p);

const table = Object.keys(LESSONS).filter((id) => !only || id === only);
for (const id of table) {
  if (!lessons.has(id)) note(id, 'MISSING', 'in the LESSONS table and not in the manifest: install its lines, then run scripts/make-narration.mjs');
}
for (const id of lessons.keys()) {
  if (!LESSONS[id]) note(id, 'MANIFEST', 'in the manifest with no script in the LESSONS table');
}

const records = readRenders(assets);
const played = new Set();
let lines = 0;
const worst = {
  run: [0, '-'], clips: [0, '-'], loud: [-120, '-'], slow: [0, '-'], fast: [Infinity, '-'], pause: [0, '-'], edge: [0, '-'],
};
const keep = (slot, value, key, higher = true) => {
  if (higher ? value > worst[slot][0] : value < worst[slot][0]) worst[slot] = [value, key];
};

for (const id of table) {
  const entries = lessons.get(id);
  if (!entries) continue;
  const beats = beatsOf(LESSONS[id]);
  const spokenAt = new Set(beats.flatMap((b, i) => (spoken(b) ? [i] : [])));
  for (const i of spokenAt) {
    if (!entries.has(i)) note(keyOf(id, i), 'MISSING', 'a spoken beat with no clip, so the voice stops for a beat: render and install it');
  }
  for (const [i, e] of entries) {
    const key = keyOf(id, i);
    played.add(key);
    if (!spokenAt.has(i)) {
      note(key, 'NOT SPOKEN', beats[i] ? 'a clip for a beat that is a question, a quote or the summary' : `a clip for beat ${i} of a script with ${beats.length}`);
      continue;
    }
    const text = beats[i].text;
    if (e.clip !== requireOf(id, i)) note(key, 'MANIFEST', `plays ${e.clip}`);
    if (e.text !== text) note(key, 'MANIFEST', `says "${e.text}", and the beat now reads otherwise: run scripts/make-narration.mjs`);
    const wavFile = path.join(assets, `${key}.wav`);
    const mp3File = path.join(assets, `${key}.mp3`);
    if (!fs.existsSync(wavFile)) { note(key, 'MISSING', 'no WAV master'); continue; }
    const wav = fs.readFileSync(wavFile);
    const mp3 = fs.existsSync(mp3File) ? fs.readFileSync(mp3File) : null;
    const { faults, m } = lineFaults({ text, wav, mp3, record: records[key] });
    for (const f of faults) note(key, f.kind, f.say);
    lines += 1;
    if (!m) continue;
    if (Math.abs(e.dur - m.dur) > 0.011) note(key, 'LENGTH', `the manifest says ${e.dur}s and the WAV runs ${m.dur.toFixed(2)}s: run scripts/make-narration.mjs`);
    const tokens = text.match(/\S+/g) || [];
    if (e.words.length !== tokens.length) note(key, 'WORDS', `${e.words.length} word times for ${tokens.length} words`);
    else if (e.words.some((t, k) => !(t >= 0 && t <= e.dur) || (k > 0 && t < e.words[k - 1]))) note(key, 'WORDS', 'a word time out of order, or outside the clip');
    const pace = m.speechS / (weightOf(text) || 1);
    keep('run', m.maxRun, key);
    keep('clips', m.clips50, key);
    keep('loud', m.loudest50, key);
    keep('slow', pace, key);
    keep('fast', pace, key, false);
    keep('pause', m.pauseS, key);
    keep('edge', Math.max(m.leadS, m.tailS), key);
  }
}

// Nothing left behind: a record or a file no line plays is a take that will be mistaken
// for a current one.
const prefix = only ? `${only}/` : '';
for (const key of Object.keys(records)) {
  if (key.startsWith(prefix) && !played.has(key)) note(key, 'ORPHAN', 'a render record for a line the manifest does not play: remove the record and its files');
}
const dirs = only
  ? (fs.existsSync(path.join(assets, only)) ? [only] : [])
  : fs.readdirSync(assets, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
for (const dir of dirs) {
  for (const f of fs.readdirSync(path.join(assets, dir))) {
    const m = f.match(/^(beat-\d{2})\.(wav|mp3)$/);
    if (!m || !played.has(`${dir}/${m[1]}`)) note(`${dir}/${f}`, 'ORPHAN', 'a file no manifest entry plays');
  }
}

const GROUPS = [
  ['the manifest is the script', ['MANIFEST', 'MISSING', 'NOT SPOKEN', 'LENGTH', 'WORDS'],
    'every spoken beat has its line, and every line its beat'],
  ['each clip says the words on screen', ['RECORD', 'REWORDED'],
    'each WAV is the take recorded for its beat\'s current words'],
  ['each MP3 is encoded from its WAV', ['STALE MP3'], 'the word times were measured on what plays'],
  ['each take is clean', ['HEADER', 'CLIPPED RUN', 'CLIPPING', 'BURST', 'PACE', 'STALL', 'SILENCE'],
    'no clipped run, no burst, a pace that fits the words, no stall'],
  ['nothing is left behind', ['ORPHAN'], 'no record or file that no line plays'],
];
if (lines === 0) bad('measured no lines at all', 'a check that reads nothing must not look clean');
for (const [title, kinds, fine] of GROUPS) {
  const hits = findings.filter((f) => kinds.includes(f.kind));
  if (!hits.length) { ok(title, fine); continue; }
  bad(`${title}: ${hits.length} finding(s)`);
  for (const f of hits.slice(0, 25)) console.log(`          ${f.kind.padEnd(11)} ${f.key}: ${f.say}`);
  if (hits.length > 25) console.log(`          and ${hits.length - 25} more`);
}

const f1 = (x) => x.toFixed(1), f3 = (x) => x.toFixed(3), f2 = (x) => x.toFixed(2);
console.log(`\n  ${lines} line(s) measured. The worst of them against each limit:`);
console.log(`    longest clipped run     ${worst.run[0]} samples (${worst.run[1]}), limit ${MAX_CLIP_RUN}`);
console.log(`    most clipped in 50 ms   ${worst.clips[0]} (${worst.clips[1]}), limit ${MAX_CLIPS_IN_50MS}`);
console.log(`    loudest 50 ms           ${f1(worst.loud[0])} dBFS (${worst.loud[1]}), limit ${BURST_DBFS}`);
console.log(`    pace                    ${f3(worst.fast[0])} (${worst.fast[1]}) to ${f3(worst.slow[0])} (${worst.slow[1]}), limits ${PACE_MIN} to ${PACE_MAX}`);
console.log(`    longest pause           ${f2(worst.pause[0])}s (${worst.pause[1]}), limit ${MAX_PAUSE_S}`);
console.log(`    most silence at an end  ${f2(worst.edge[0])}s (${worst.edge[1]}), limit ${MAX_EDGE_SILENCE_S}`);

console.log(fails ? `\n${fails} failing.\n` : '\nevery narrated line is its beat, rendered clean.\n');
process.exit(fails ? 1 : 0);
