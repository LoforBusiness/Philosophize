// U3 FOR THE VOICE: PUT EACH DEFECT BACK AND WATCH check:narration GO RED, AND STAGE
// THE SHAPES A GOOD TAKE HAS AND WATCH IT STAY SILENT.
//
//   node scripts/countertest-narration.mjs
//
// It copies one narrated lesson (its WAV masters, its lesson.mp3, its manifest block and
// its render records) into a temporary folder, damages one thing at a time, and runs the
// real check on the copy through NARRATION_ONLY, NARRATION_MANIFEST and NARRATION_ASSETS,
// and NARRATION_ROUTE for the stages about which lessons speak. A red run only counts if
// it names the KIND of finding the damage should cause, so a stage cannot pass because
// something else happened to go red, and a stage that names kinds which must NOT appear
// proves each limit fires on its own.
//
// Every stage asserts that its damage changed the file. A mutation that matched nothing
// scores as "silent", which reads exactly like a blind checker (see countertest-stamp).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, ASSETS, MANIFEST, LESSON_CLIP, parseWav, sha256hex, readRenders, writeRenders, encodingMark } from './lib/narration.mjs';

const LESSON = 'metaphysics-being-4';
const tmp = path.join(os.tmpdir(), 'philosophize-narration-ct');
const stagedAssets = path.join(tmp, 'assets');
const stagedManifest = path.join(tmp, 'manifest.ts');
const stagedRoute = path.join(tmp, 'route.tsx');

const manifestSrc = fs.readFileSync(MANIFEST, 'utf8').replace(/\r\n/g, '\n');
const block = manifestSrc.match(/^ {2}"metaphysics-being-4": \{\n[\s\S]*?^ {2}\},$/m);
if (!block) { console.error(`no ${LESSON} block in the manifest`); process.exit(1); }
const head = `${manifestSrc.slice(0, manifestSrc.indexOf('export const NARRATION'))}export const NARRATION: Record<string, Record<number, NarratedLine>> = {\n`;

function fresh() {
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(path.join(stagedAssets, LESSON), { recursive: true });
  for (const f of fs.readdirSync(path.join(ASSETS, LESSON))) {
    fs.copyFileSync(path.join(ASSETS, LESSON, f), path.join(stagedAssets, LESSON, f));
  }
  const mine = Object.fromEntries(Object.entries(readRenders()).filter(([k]) => k.startsWith(`${LESSON}/`)));
  writeRenders(mine, stagedAssets);
  fs.writeFileSync(stagedManifest, `${head}${block[0]}\n};\n`);
}

function run(env = {}) {
  try {
    const out = execFileSync(process.execPath, ['scripts/check-narration.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      env: { ...process.env, NARRATION_ONLY: LESSON, NARRATION_MANIFEST: stagedManifest, NARRATION_ASSETS: stagedAssets, ...env },
    });
    return { red: false, out };
  } catch (e) {
    return { red: true, out: `${e.stdout || ''}${e.stderr || ''}` };
  }
}

let failed = 0;
function expect(name, kind, { not = [], env = {} } = {}) {
  const got = run(env);
  const kinds = new Set([...got.out.matchAll(/^ {10}([A-Z][A-Z0-9 ]*[A-Z0-9]) +\S+: /gm)].map((m) => m[1]));
  const stray = not.filter((k) => kinds.has(k));
  const okay = kind ? got.red && kinds.has(kind) && !stray.length : !got.red;
  if (!okay) failed += 1;
  const want = kind ? `must go red with ${kind}${not.length ? `, and not ${not.join(' or ')}` : ''}` : 'must stay silent';
  console.log(`  ${okay ? 'ok  ' : 'FAIL'}  ${name}: ${want}`);
  if (!okay) {
    const lines = got.out.split('\n').filter((l) => /FAIL|^ {10}\S/.test(l)).slice(0, 8);
    console.log(lines.length ? lines.map((l) => `          ${l.trim()}`).join('\n') : `          (red: ${got.red}, nothing reported)`);
  }
}

// ── staging ─────────────────────────────────────────────────────────────────

const nn = (beat) => `beat-${String(beat).padStart(2, '0')}`;
const wavFile = (beat) => path.join(stagedAssets, LESSON, `${nn(beat)}.wav`);
const clipFile = path.join(stagedAssets, LESSON, LESSON_CLIP);

function wavBytes(pcm, rate, { channels = 1 } = {}) {
  const data = Buffer.alloc(pcm.length * 2);
  for (let i = 0; i < pcm.length; i += 1) data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(pcm[i]))), i * 2);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0, 'ascii');
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8, 'ascii');
  h.write('fmt ', 12, 'ascii');
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(channels, 22);
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * channels * 2, 28);
  h.writeUInt16LE(channels * 2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36, 'ascii');
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

/**
 * Rewrite one staged WAV. By default its entry in the lesson's MP3 tag and its render
 * record follow it, so only the damage itself can be what the check reports.
 */
function damage(beat, fn, { mp3 = true, record = true } = {}) {
  const before = fs.readFileSync(wavFile(beat));
  const w = parseWav(before);
  const staged = fn(Int16Array.from(w.pcm), w.rate);
  const after = Buffer.isBuffer(staged) ? staged : wavBytes(staged, w.rate);
  if (after.equals(before)) throw new Error(`the damage to ${nn(beat)} changed nothing`);
  fs.writeFileSync(wavFile(beat), after);
  if (mp3) {
    const m = fs.readFileSync(clipFile);
    const from = Buffer.from(`${nn(beat)}=${sha256hex(before)}@`);
    const at = m.indexOf(from);
    if (at < 0) throw new Error(`${LESSON_CLIP} lists no entry for ${nn(beat)}'s WAV`);
    Buffer.from(`${nn(beat)}=${sha256hex(after)}@`).copy(m, at);
    fs.writeFileSync(clipFile, m);
  }
  if (record) editRecords((r) => { r[`${LESSON}/${nn(beat)}`].wav = sha256hex(after); });
}

function editRecords(fn) {
  const r = readRenders(stagedAssets);
  const before = JSON.stringify(r);
  fn(r);
  if (JSON.stringify(r) === before) throw new Error('the staged records did not change');
  writeRenders(r, stagedAssets);
}

function editManifest(fn) {
  const before = fs.readFileSync(stagedManifest, 'utf8');
  const after = fn(before);
  if (after === before) throw new Error('the staged manifest did not change');
  fs.writeFileSync(stagedManifest, after);
}

function editClip(fn) {
  const before = fs.readFileSync(clipFile);
  const after = fn(before);
  if (after.equals(before)) throw new Error(`the staged ${LESSON_CLIP} did not change`);
  fs.writeFileSync(clipFile, after);
}

/** A deterministic noise source, so a failing stage fails the same way twice. */
function noise(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296 * 2 - 1; };
}

/** Where a beat's speech is loudest, so damage lands inside the voice rather than a pause. */
function loudestAt(pcm, len) {
  let best = 0, at = 0, e = 0;
  for (let i = 0; i < pcm.length; i += 1) {
    e += pcm[i] * pcm[i];
    if (i >= len) e -= pcm[i - len] * pcm[i - len];
    if (i >= len - 1 && e > best) { best = e; at = i - len + 1; }
  }
  return at;
}

console.log('\nCOUNTER-TESTING check:narration\n');

fresh();
expect('the lesson as it is', null);

// ── the take: each limit on its own, then the burst a reader actually heard ─────────
fresh();
damage(0, (pcm, rate) => { const at = Math.floor(pcm.length / 2); for (let i = 0; i < 20; i += 1) pcm[at + i] = 32767; return pcm; });
expect('twenty samples pinned at full scale', 'CLIPPED RUN', { not: ['CLIPPING', 'BURST'] });

fresh();
damage(0, (pcm) => { const at = Math.floor(pcm.length / 2); for (let k = 0; k < 80; k += 1) pcm[at + k * 14] = k % 2 ? 32767 : -32768; return pcm; });
expect('eighty lone clipped samples inside 50 ms', 'CLIPPING', { not: ['CLIPPED RUN', 'BURST'] });

fresh();
damage(0, (pcm, rate) => { const at = Math.floor(pcm.length / 2); for (let i = 0; i < rate * 0.1; i += 1) pcm[at + i] = (Math.floor(i / 24) % 2 ? 1 : -1) * 22000; return pcm; });
expect('a tenth of a second of loud tone that never clips', 'BURST', { not: ['CLIPPED RUN', 'CLIPPING'] });

fresh();
damage(2, (pcm, rate) => {
  const rnd = noise(7);
  const at = loudestAt(pcm, Math.round(rate * 0.25));
  for (let i = 0; i < rate * 0.25; i += 1) pcm[at + i] = Math.max(-32768, Math.min(32767, rnd() * 3 * 32768));
  return pcm;
});
expect('a quarter-second of clipped noise, like the take a reader heard', 'BURST');

fresh();
damage(0, (pcm) => {
  // Chirp's own worst: 17 clipped samples in runs of at most 4, spread through the line.
  const runs = [4, 4, 4, 4, 1];
  runs.forEach((len, r) => { const at = Math.floor((pcm.length * (r + 1)) / (runs.length + 1)); for (let i = 0; i < len; i += 1) pcm[at + i] = 32767; });
  return pcm;
});
expect('seventeen clipped samples in short runs, as a good take has', null);

fresh();
damage(1, (pcm) => pcm.slice(0, Math.floor(pcm.length * 0.3)));
expect('a take that lost most of its words', 'PACE');

fresh();
damage(1, (pcm) => { const out = new Int16Array(pcm.length * 3); for (let k = 0; k < 3; k += 1) out.set(pcm, k * pcm.length); return out; });
expect('a take that said its line three times', 'PACE');

fresh();
damage(1, (pcm, rate) => { const at = Math.floor(pcm.length / 2); const out = new Int16Array(pcm.length + rate * 3); out.set(pcm.subarray(0, at), 0); out.set(pcm.subarray(at), at + rate * 3); return out; });
expect('three seconds of silence inside the speech', 'STALL');

fresh();
damage(1, (pcm, rate) => { const out = new Int16Array(pcm.length + rate * 1.5); out.set(pcm, rate * 1.5); return out; });
expect('a second and a half of silence before the voice', 'SILENCE');

fresh();
damage(1, (pcm) => wavBytes(pcm, 22050));
expect('a WAV at 22 kHz', 'HEADER');

fresh();
damage(1, (pcm, rate) => wavBytes(pcm, rate, { channels: 2 }));
expect('a WAV that says it is stereo', 'HEADER');

// ── the take is the one recorded, for these words, and its lesson's MP3 holds it ─────
fresh();
damage(0, (pcm) => { pcm[1000] += 1; return pcm; }, { mp3: false });
expect('a WAV changed after its lesson\'s MP3 was encoded', 'STALE MP3');

fresh();
editClip((m) => {
  const s = m.toString('latin1');
  const hit = s.match(/beat-02=[0-9a-f]{64}@(\d+\.\d{3});/);
  if (!hit) throw new Error(`${LESSON_CLIP} has no entry for beat-02`);
  const old = hit[1];
  const moved = `${old.slice(0, -1)}${(Number(old.slice(-1)) + 1) % 10}`;
  return Buffer.from(s.replace(hit[0], hit[0].replace(`@${old};`, `@${moved};`)), 'latin1');
});
expect('a lesson MP3 whose tag puts a line a millisecond away', 'STALE MP3', { not: ['OFFSET'] });

fresh();
fs.rmSync(clipFile);
expect('a lesson with no MP3 at all', 'STALE MP3');

// ── THE RELEASE AND THE PAUSE (a line that stopped dead at its very end) ─────
fresh();
editClip((m) => {
  const s = m.toString('latin1');
  if (!s.includes(encodingMark)) throw new Error(`${LESSON_CLIP} carries no ${encodingMark}`);
  return Buffer.from(s.replace(encodingMark, 'narration-lesson:'), 'latin1');
});
expect('a lesson MP3 encoded before the release existed', 'STALE MP3');

const realPlayer = fs.readFileSync(path.join(ROOT, 'lib', 'narration', 'real.ts'), 'utf8');
const stagedPlayer = path.join(tmp, 'real.ts');
function player(edit) {
  const out = edit(realPlayer);
  if (out === realPlayer) throw new Error('a player stage changed nothing');
  fs.writeFileSync(stagedPlayer, out);
  return { NARRATION_PLAYER: stagedPlayer };
}

fresh();
expect('the player that paused 50ms before every line ended, as shipped', 'PLAYER', {
  env: player((s) => s.replace('else if (heard && t >= end + END_PAD_S) finish();', 'else if (heard) finish();')),
});

fresh();
expect('a pause that lands inside the release', 'PLAYER', {
  env: player((s) => s.replace('const END_PAD_S = 0.2;', 'const END_PAD_S = 0.05;')),
});

fresh();
expect('a fallback that lands on the next line', 'PLAYER', {
  env: player((s) => s.replace('const END_SLACK_MS = 40;', 'const END_SLACK_MS = 200;')),
});

fresh();
expect('the player as it is', null, { env: { NARRATION_PLAYER: path.join(ROOT, 'lib', 'narration', 'real.ts') } });

fresh();
damage(0, (pcm) => { pcm[1000] += 1; return pcm; }, { record: false });
expect('a WAV that is not the take its record names', 'RECORD');

fresh();
editRecords((r) => { delete r[`${LESSON}/beat-00`]; });
expect('a take with no render record', 'RECORD');

fresh();
editRecords((r) => { r[`${LESSON}/beat-00`].text = 'Words the screen no longer shows.'; });
expect('a take rendered from words the beat has since lost', 'REWORDED');

// ── the manifest is the script ──────────────────────────────────────────────
fresh();
editManifest((s) => s.replace(/^( {4}0: \{\n {6}clip: .*\n {6}at: .*\n {6}dur: .*\n {6}text: )".*"(,)$/m, '$1"Some other words entirely."$2'));
expect('a manifest line whose text is not the beat\'s', 'MANIFEST');

fresh();
editManifest((s) => s.replace(/^ {4}1: \{\n(?: {6}.*\n){5} {4}\},\n/m, ''));
expect('a spoken beat with no line', 'MISSING');

fresh();
editManifest((s) => s.replace(/^( {4}4: \{\n(?: {6}.*\n){5} {4}\},\n)/m, (m) => `${m}${m.replace(/^ {4}4: \{/, '    5: {')}`));
expect('a line for a beat that is not spoken', 'NOT SPOKEN');

fresh();
editManifest((s) => s.replace(/^( {4}0: \{\n {6}clip: .*\n {6}at: .*\n {6}dur: )([\d.]+)(,)$/m, (m, a, d, c) => `${a}${(Number(d) + 1).toFixed(2)}${c}`));
expect('a manifest length a second longer than its WAV', 'LENGTH');

fresh();
editManifest((s) => s.replace(/^( {4}2: \{\n {6}clip: .*\n {6}at: )([\d.]+)(,)$/m, (m, a, v, c) => `${a}${(Number(v) + 0.5).toFixed(3)}${c}`));
expect('a manifest line that starts half a second from where its lesson\'s audio has it', 'OFFSET', { not: ['STALE MP3'] });

fresh();
editManifest((s) => s.replace(/^( {4}0: \{\n {6}clip: require\(')[^']+('\),)$/m, `$1../../assets/narration/${LESSON}/beat-00.mp3$2`));
expect('a line that plays a clip of its own instead of its lesson\'s file', 'MANIFEST');

fresh();
editManifest((s) => s.replace(/^( {4}0: \{\n(?: {6}.*\n){4} {6}words: \[)(.*), [\d.]+(\],)$/m, '$1$2$3'));
expect('a line with one word time missing', 'WORDS');

fresh();
editManifest((s) => s.replace(/^( {4}0: \{\n {6}clip: .*\n {6}at: .*\n {6}dur: )[\d.]+,$/m, '$1NaN,'));
expect('an entry not in the shape make-narration writes', 'MANIFEST');

// ── every lesson speaks ─────────────────────────────────────────────────────
fresh();
fs.writeFileSync(stagedRoute, `const CINEMATIC = {\n  '${LESSON}': StagedScene,\n};\n`);
expect('a route whose every lesson has its voice', null, { env: { NARRATION_ROUTE: stagedRoute } });

fresh();
fs.writeFileSync(stagedRoute, `const CINEMATIC = {\n  '${LESSON}': StagedScene,\n  'metaphysics-being-999': StagedScene,\n};\n`);
expect('a lesson the app can open with no voice', 'UNVOICED', { env: { NARRATION_ROUTE: stagedRoute } });

fresh();
fs.writeFileSync(stagedRoute, 'const NOTHING = {\n};\n');
expect('a route the check can read no lessons out of', 'UNVOICED', { env: { NARRATION_ROUTE: stagedRoute } });

// ── nothing left behind ─────────────────────────────────────────────────────
fresh();
fs.copyFileSync(wavFile(0), wavFile(9));
expect('a stray WAV no line plays', 'ORPHAN');

fresh();
fs.copyFileSync(clipFile, path.join(stagedAssets, LESSON, 'beat-00.mp3'));
expect('a one-line clip left from before a lesson shipped as one file', 'ORPHAN');

fresh();
editRecords((r) => { r[`${LESSON}/beat-09`] = { text: 'Nobody says this.', wav: '0'.repeat(64) }; });
expect('a render record for a line that is not played', 'ORPHAN');

fresh();
expect('the lesson as it is, after every stage', null);

fs.rmSync(tmp, { recursive: true, force: true });
console.log(failed ? `\n${failed} stage(s) did not behave.\n` : '\ncheck:narration fails on every staged defect, and on nothing a good take does.\n');
process.exit(failed ? 1 : 0);
