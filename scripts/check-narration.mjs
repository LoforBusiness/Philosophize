// ─────────────────────────────────────────────────────────────────────────────
// NARRATION: EVERY LESSON SPEAKS, AND EVERY LINE IT SPEAKS IS THE LINE ON SCREEN, WHOLE,
// CLEAN, AND WHERE ITS LESSON'S AUDIO HAS IT
//
//   npm run check:narration
//
// Offline, with no Google, no ffmpeg and no browser. It holds:
//
//   0. EVERY LESSON SPEAKS. Every lesson the lesson route can open (its CINEMATIC map)
//      is in the LESSONS table in scripts/lib/narration.mjs. One missing from it would
//      play in silence, with no mute button, and nothing else would notice.
//   1. THE MANIFEST IS THE SCRIPT. Every spoken beat has a line, no line belongs to a
//      beat that is not spoken, and each line's text, length and offset are the beat's,
//      the WAV's and the layout's now.
//   2. EACH LINE SAYS THOSE WORDS. assets/narration/renders.json records the words each
//      WAV was rendered from, and its SHA-256. A beat rewritten after its render fails
//      here, because make-narration on its own would time the old audio against the
//      new text.
//   3. EACH LESSON'S MP3 IS ITS WAVS. A lesson ships one lesson.mp3, and its tag lists
//      every line's WAV hash and where the line starts, as encode-narration wrote them.
//   4. EACH TAKE IS CLEAN: no clipped run, no pile of clipped samples, no burst, a
//      pace that fits its words, and no stall. The limits, and the lines they were
//      calibrated on, are in scripts/lib/narration.mjs.
//   5. A LINE ENDS, AND DOES NOT STOP. Chirp trims every take to the voice, so each
//      lesson MP3 must carry the synthesised release after every line (its tag opens
//      with the encoding), and the player must pause after that release and before the
//      next line — never as the line nears its end, which clipped every line in the app
//      until 16 Sep 2026 and was heard as sentences that "stop abruptly".
//
// It exists because a reader heard a burst and then a garbled voice in
// metaphysics-being-4 on 12 Sep 2026, and nothing had ever measured the audio.
// Counter-tested by `node scripts/countertest-narration.mjs`, in both directions.
// NARRATION_MANIFEST, NARRATION_ASSETS, NARRATION_ONLY and NARRATION_ROUTE exist for
// that test.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, ASSETS, MANIFEST, LESSONS, LESSON_CLIP, keyOf, requireOf, spoken, lessonLines, lineFaults, parseManifest,
  readRenders, weightOf, MAX_CLIP_RUN, MAX_CLIPS_IN_50MS, BURST_DBFS, PACE_MIN, PACE_MAX, MAX_PAUSE_S, MAX_EDGE_SILENCE_S,
  RELEASE_S, GAP_S,
} from './lib/narration.mjs';

const manifestFile = process.env.NARRATION_MANIFEST ? path.resolve(ROOT, process.env.NARRATION_MANIFEST) : MANIFEST;
const assets = process.env.NARRATION_ASSETS ? path.resolve(ROOT, process.env.NARRATION_ASSETS) : ASSETS;
const only = process.env.NARRATION_ONLY || null;
const route = process.env.NARRATION_ROUTE
  ? path.resolve(ROOT, process.env.NARRATION_ROUTE)
  : path.join(ROOT, 'app', '(app)', 'branches', '[branchSlug]', '[pathSlug]', 'lesson', '[lessonId].tsx');

let fails = 0;
const ok = (m, d = '') => console.log(`  ok    ${m}${d ? `  ${d}` : ''}`);
const bad = (m, d = '') => { fails += 1; console.log(`  FAIL  ${m}${d ? `  ${d}` : ''}`); };

console.log('\nNARRATION\n');

const findings = [];
const note = (key, kind, say) => findings.push({ key, kind, say });

// 0. Every lesson speaks. The map is read the way validate-cinematic reads it. Under
// NARRATION_ONLY with no staged route the counter-test is looking at one lesson, and this
// is skipped.
let routed = [];
if (!only || process.env.NARRATION_ROUTE) {
  const map = fs.readFileSync(route, 'utf8').split('const CINEMATIC')[1]?.split('\n};')[0] ?? '';
  routed = [...map.matchAll(/['"]([a-z]+(?:-[a-z]+)+-\d+)['"]\s*:\s*\w+/g)].map((m) => m[1]);
  if (!routed.length) note(path.relative(ROOT, route), 'UNVOICED', 'read no lessons out of the CINEMATIC map: a check that reads nothing must not look clean');
  for (const id of routed) {
    if (!LESSONS[id]) note(id, 'UNVOICED', 'a lesson the app opens with no voice: render its spoken beats through the character ledger, add it to LESSONS, then install, encode and run make-narration');
  }
}

const { lessons, problems } = parseManifest(fs.readFileSync(manifestFile, 'utf8'));
for (const p of problems) note('manifest', 'MANIFEST', p);

const table = Object.keys(LESSONS).filter((id) => !only || id === only);
for (const id of table) {
  if (!lessons.has(id)) note(id, 'MISSING', 'in the LESSONS table and not in the manifest: install its lines, encode, then run scripts/make-narration.mjs');
}
for (const id of lessons.keys()) {
  if (!LESSONS[id]) note(id, 'MANIFEST', 'in the manifest with no script in the LESSONS table');
}

const records = readRenders(assets);
const played = new Set();
let lines = 0, files = 0;
const worst = {
  run: [0, '-'], clips: [0, '-'], loud: [-120, '-'], slow: [0, '-'], fast: [Infinity, '-'], pause: [0, '-'], edge: [0, '-'],
};
const keep = (slot, value, key, higher = true) => {
  if (higher ? value > worst[slot][0] : value < worst[slot][0]) worst[slot] = [value, key];
};

for (const id of table) {
  const entries = lessons.get(id);
  if (!entries) continue;
  const { beats, lines: ls, missing } = lessonLines(id, assets);
  const spokenAt = new Set(beats.flatMap((b, i) => (spoken(b) ? [i] : [])));
  const byBeat = new Map(ls.map((l) => [l.beat, l]));
  const clipFile = path.join(assets, id, LESSON_CLIP);
  const clip = fs.existsSync(clipFile) ? fs.readFileSync(clipFile) : null;
  if (clip) files += 1;
  for (const i of missing) note(keyOf(id, i), 'MISSING', 'no WAV master for a spoken beat');
  for (const i of spokenAt) {
    if (!entries.has(i)) note(keyOf(id, i), 'MISSING', 'a spoken beat with no line, so the voice stops for a beat: render and install it');
  }
  for (const [i, e] of entries) {
    const key = keyOf(id, i);
    played.add(key);
    if (!spokenAt.has(i)) {
      note(key, 'NOT SPOKEN', beats[i] ? 'a line for a beat that is a question, a quote or the summary' : `a line for beat ${i} of a script with ${beats.length}`);
      continue;
    }
    const text = beats[i].text;
    if (e.clip !== requireOf(id)) note(key, 'MANIFEST', `plays ${e.clip}, where every line of a lesson plays ${requireOf(id)}`);
    if (e.text !== text) note(key, 'MANIFEST', `says "${e.text}", and the beat now reads otherwise: run scripts/make-narration.mjs`);
    const l = byBeat.get(i);
    if (!l) continue;
    const at = missing.length ? e.at : l.at;
    if (!missing.length && Math.abs(e.at - l.at) > 0.0005) {
      note(key, 'OFFSET', `the manifest starts this line at ${e.at.toFixed(3)}s and it lands at ${l.at.toFixed(3)}s in ${LESSON_CLIP}: run scripts/encode-narration.mjs, then scripts/make-narration.mjs`);
    }
    const { faults, m } = lineFaults({ text, wav: l.wav, record: records[key], clip, beat: i, at });
    for (const f of faults) note(key, f.kind, f.say);
    lines += 1;
    if (!m) continue;
    if (Math.abs(e.dur - m.dur) > 0.011) note(key, 'LENGTH', `the manifest says ${e.dur}s and the WAV runs ${m.dur.toFixed(2)}s: run scripts/make-narration.mjs`);
    const tokens = text.match(/\S+/g) || [];
    if (e.words.length !== tokens.length) note(key, 'WORDS', `${e.words.length} word times for ${tokens.length} words`);
    else if (e.words.some((t, k) => !(t >= 0 && t <= e.dur) || (k > 0 && t < e.words[k - 1]))) note(key, 'WORDS', 'a word time out of order, or outside the line');
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
// for a current one, and a one-line clip from before a lesson shipped whole is an asset
// the update would carry for nothing.
const prefix = only ? `${only}/` : '';
for (const key of Object.keys(records)) {
  if (key.startsWith(prefix) && !played.has(key)) note(key, 'ORPHAN', 'a render record for a line the manifest does not play: remove the record and its files');
}
const dirs = only
  ? (fs.existsSync(path.join(assets, only)) ? [only] : [])
  : fs.readdirSync(assets, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
for (const dir of dirs) {
  for (const f of fs.readdirSync(path.join(assets, dir))) {
    const wav = f.match(/^(beat-\d{2})\.wav$/);
    if (wav && played.has(`${dir}/${wav[1]}`)) continue;
    if (f === LESSON_CLIP && lessons.has(dir) && LESSONS[dir]) continue;
    note(`${dir}/${f}`, 'ORPHAN', /^beat-\d{2}\.mp3$/.test(f)
      ? 'a one-line clip from before each lesson shipped as one file: run scripts/encode-narration.mjs, which removes it'
      : 'a file no manifest entry plays');
  }
}

// 5. A LINE IS PAUSED AFTER ITS RELEASE AND BEFORE THE NEXT LINE. The player's numbers
// live in lib/narration/real.ts, which imports expo-audio and cannot be loaded here, so
// they are read out of its text. A pause before `end` clips the last word of every line
// — Chirp leaves no silence there to spend — and one past GAP_S plays the next line's
// first word. NARRATION_PLAYER points the counter-test at a damaged copy.
const playerFile = process.env.NARRATION_PLAYER
  ? path.resolve(ROOT, process.env.NARRATION_PLAYER)
  : path.join(ROOT, 'lib', 'narration', 'real.ts');
let timing = '';
{
  const src = fs.readFileSync(playerFile, 'utf8');
  const who = path.relative(ROOT, playerFile).replace(/\\/g, '/');
  const num = (name) => { const m = src.match(new RegExp(String.raw`const ${name} = ([\d.]+);`)); return m ? Number(m[1]) : NaN; };
  const pad = num('END_PAD_S');
  const slack = num('END_SLACK_MS') / 1000;
  const lat = num('LATENCY_MS') / 1000;
  const late = pad + slack + lat;
  if (![pad, slack, lat].every(Number.isFinite)) note(who, 'PLAYER', 'END_PAD_S, END_SLACK_MS or LATENCY_MS could not be read out of the player');
  else {
    if (/else if \(heard\)\s*finish\(\)/.test(src)) note(who, 'PLAYER', 'the status listener pauses as soon as the line nears its end, which clips its last sound');
    if (pad < RELEASE_S + 0.03) note(who, 'PLAYER', `END_PAD_S ${pad}s does not clear the ${RELEASE_S}s release after every take`);
    if (late > GAP_S - 0.05) note(who, 'PLAYER', `the fallback pause lands ${late.toFixed(2)}s past a line, into the next one at ${GAP_S}s`);
    timing = `release ${RELEASE_S}s · pause +${pad}s · fallback +${late.toFixed(2)}s · next line +${GAP_S}s`;
  }
}

const GROUPS = [
  ['a line is paused after its release and before the next line', ['PLAYER'], timing],
  ['every lesson speaks', ['UNVOICED'], `every lesson the app opens has its voice${routed.length ? ` (${routed.length})` : ''}`],
  ['the manifest is the script', ['MANIFEST', 'MISSING', 'NOT SPOKEN', 'LENGTH', 'WORDS', 'OFFSET'],
    'every spoken beat has its line, where its lesson\'s audio has it'],
  ['each line says the words on screen', ['RECORD', 'REWORDED'],
    'each WAV is the take recorded for its beat\'s current words'],
  ['each lesson\'s MP3 is built from its WAVs', ['STALE MP3'], 'every line\'s hash and offset are in its lesson\'s file'],
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
console.log(`\n  ${lines} line(s) measured, in ${files} lesson file(s). The worst of them against each limit:`);
console.log(`    longest clipped run     ${worst.run[0]} samples (${worst.run[1]}), limit ${MAX_CLIP_RUN}`);
console.log(`    most clipped in 50 ms   ${worst.clips[0]} (${worst.clips[1]}), limit ${MAX_CLIPS_IN_50MS}`);
console.log(`    loudest 50 ms           ${f1(worst.loud[0])} dBFS (${worst.loud[1]}), limit ${BURST_DBFS}`);
console.log(`    pace                    ${f3(worst.fast[0])} (${worst.fast[1]}) to ${f3(worst.slow[0])} (${worst.slow[1]}), limits ${PACE_MIN} to ${PACE_MAX}`);
console.log(`    longest pause           ${f2(worst.pause[0])}s (${worst.pause[1]}), limit ${MAX_PAUSE_S}`);
console.log(`    most silence at an end  ${f2(worst.edge[0])}s (${worst.edge[1]}), limit ${MAX_EDGE_SILENCE_S}`);

console.log(fails ? `\n${fails} failing.\n` : '\nevery lesson speaks, and every narrated line is its beat, rendered clean.\n');
process.exit(fails ? 1 : 0);
