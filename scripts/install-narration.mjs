// ─────────────────────────────────────────────────────────────────────────────
// NARRATION: TAKE A RENDER INTO THE APP, OR REFUSE IT.
//
//   node scripts/install-narration.mjs <job.json> <render dir> [--dry-run]
//
// The render itself happens outside the repo, because every Text-to-Speech request goes
// through the character ledger. It leaves <render dir>/<lesson id>/beat-NN.wav for each
// item of <job.json>, and each item carries the words its clip was rendered from:
//
//   { "items": [{ "key": "metaphysics-being-4/beat-04", "text": "…", "encodings": ["LINEAR16"] }] }
//
// A take is copied into assets/narration only if its words are the beat's text in the
// script right now, the beat is spoken, the WAV is 16-bit mono 24 kHz PCM, and the take
// passes every limit in scripts/lib/narration.mjs. Each installed take is recorded in
// assets/narration/renders.json with its words and its SHA-256. That record is how
// check:narration later knows that the words a clip says are still the words on screen.
//
// Every item is judged before anything is copied, so a job goes in whole or not at all.
// A refused take is rendered again, never repaired: cutting a burst out leaves the
// garbled speech the model made around it, and the word times come from this WAV.
//
// Then: FFMPEG=<path> node scripts/encode-narration.mjs, node scripts/make-narration.mjs,
// and npm run check:narration.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import {
  ASSETS, LESSONS, beatsOf, spoken, parseWav, headerFaults, measureAudio, audioFaults, weightOf, sha256hex,
  readRenders, writeRenders,
} from './lib/narration.mjs';

const DRY = process.argv.includes('--dry-run');
const [jobPath, renderDir] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!jobPath || !renderDir) {
  console.error('usage: node scripts/install-narration.mjs <job.json> <render dir> [--dry-run]');
  process.exit(2);
}
const job = JSON.parse(fs.readFileSync(jobPath, 'utf8'));
const items = Array.isArray(job.items) ? job.items : [];
if (!items.length) { console.error(`${jobPath} has no items`); process.exit(1); }

const scripts = new Map();
const plan = [];
let refused = 0;
for (const it of items) {
  const why = [];
  const m = /^([a-z0-9-]+)\/beat-(\d{2})$/.exec(it.key ?? '');
  if (!m) why.push('the key is not <lesson id>/beat-NN');
  else if (!LESSONS[m[1]]) why.push('the lesson is not in the LESSONS table in scripts/lib/narration.mjs: add it and its script there first');
  else {
    if (!scripts.has(m[1])) scripts.set(m[1], beatsOf(LESSONS[m[1]]));
    const beat = scripts.get(m[1])[Number(m[2])];
    if (!beat || !spoken(beat)) why.push(`beat ${Number(m[2])} is not a spoken beat`);
    else if (beat.text !== it.text) why.push(`rendered from "${it.text}", and the beat now reads "${beat.text}"`);
  }
  const src = path.join(renderDir, `${it.key}.wav`);
  let wav = null, measured = null;
  if (!fs.existsSync(src)) why.push(`no take at ${src}`);
  else {
    wav = fs.readFileSync(src);
    const w = parseWav(wav);
    why.push(...headerFaults(w));
    if (w.pcm && w.pcm.length && w.rate) {
      measured = measureAudio(w.pcm, w.rate);
      why.push(...audioFaults(measured, it.text).map((f) => `${f.kind}: ${f.say}`));
    }
  }
  if (why.length) {
    refused += 1;
    console.log(`  REFUSED ${it.key}\n          ${why.join('\n          ')}`);
    continue;
  }
  plan.push({ key: it.key, text: it.text, wav });
  const pace = measured.speechS / weightOf(it.text);
  console.log(`  ok      ${it.key}  ${measured.dur.toFixed(2)}s · longest clipped run ${measured.maxRun} · loudest 50 ms ${measured.loudest50.toFixed(1)} dBFS · pace ${pace.toFixed(3)} · longest pause ${measured.pauseS.toFixed(2)}s`);
}

if (refused) {
  console.log(`\n${refused} of ${items.length} refused, so nothing was installed. Render a refused line again; do not repair it.`);
  process.exit(1);
}
if (DRY) {
  console.log(`\n${plan.length} take(s) would be installed (--dry-run: nothing was copied).`);
  process.exit(0);
}
const records = readRenders();
for (const p of plan) {
  const dest = path.join(ASSETS, `${p.key}.wav`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, p.wav);
  records[p.key] = { text: p.text, wav: sha256hex(p.wav) };
}
writeRenders(records);
console.log(`\ninstalled ${plan.length} take(s) and recorded them in assets/narration/renders.json.`);
console.log('next: FFMPEG=<path> node scripts/encode-narration.mjs, then node scripts/make-narration.mjs, then npm run check:narration');
