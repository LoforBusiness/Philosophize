// RETAKE EVERY DIALOGUE LINE THAT IS NOT DELIVERED LIKE A PERSON TALKING (AP16).
//
//   node scripts/retake-delivery.mjs <render dir> [lesson-id …] [--tries=4] [--dry]
//
// For each spoken line of a dialogue lesson, the installed take is measured with the
// same rules check:narration holds (deliveryOf / deliveryFaults in scripts/lib/
// narration.mjs). A line that fails is rendered again through the character ledger
// (scripts/render-narration.mjs) at a speaking rate aimed at the middle of a person's
// pace — the take's own rate scaled by RATE_AIM over what it measured — and the new take
// is measured in turn. A take that still fails is asked for again at a nudged rate, a
// request Google has not seen, up to --tries times. Nothing is installed here: the render
// dir's job.json then holds only takes that pass, ready for
//   node scripts/install-narration.mjs <render dir>/job.json <render dir>
//
// The speaking rate a take was made at is not recorded, so the one it was asked for is
// read back from the ledger's own log line when there is one, else from the speaker's
// voice in cast.ts.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  ASSETS, LESSONS, beatsOf, spoken, keyOf, parseWav, deliveryOf, deliveryFaults, voiceFor, RATE_AIM,
} from './lib/narration.mjs';

const args = process.argv.slice(2);
const outDir = args.find((a) => !a.startsWith('--') && !LESSONS[a]);
if (!outDir) { console.error('usage: node scripts/retake-delivery.mjs <render dir> [lesson-id …] [--tries=4] [--dry]'); process.exit(2); }
const DRY = args.includes('--dry');
const TRIES = Number((args.find((a) => a.startsWith('--tries=')) ?? '--tries=4').split('=')[1]);
const picked = args.filter((a) => LESSONS[a]);
const lessons = (picked.length ? picked : Object.keys(LESSONS)).filter((id) =>
  beatsOf(LESSONS[id]).some((b) => b.speaker));

const measure = (file, text) => {
  const w = parseWav(fs.readFileSync(file));
  const d = deliveryOf(w.pcm, w.rate, text);
  return { d, faults: deliveryFaults(d) };
};
const aim = (rate, d) => {
  const next = rate * (RATE_AIM / d.rate);
  return Math.round(Math.min(1.2, Math.max(0.75, next)) * 100) / 100;
};

let rendered = 0, passed = 0, stuck = [];
for (const id of lessons) {
  const beats = beatsOf(LESSONS[id]);
  // what fails today, and the rate to ask for
  let todo = [];
  beats.forEach((b, i) => {
    if (!spoken(b) || !b.speaker) return;
    const file = path.join(ASSETS, `${keyOf(id, i)}.wav`);
    if (!fs.existsSync(file)) return;
    const { d, faults } = measure(file, b.text);
    if (!faults.length) return;
    const was = voiceFor(b.speaker).rate;
    todo.push({ i, text: b.text, was, rate: aim(was, d), why: faults.map((f) => f.kind).join(', '), d });
  });
  if (!todo.length) { console.log(`${id}: every line delivered like a person talking`); continue; }
  for (let t = 1; t <= TRIES && todo.length; t += 1) {
    // two takes at one rate are the same bytes, so a retry never repeats a rate
    for (const x of todo) x.tried = [...(x.tried ?? []), x.rate];
    console.log(`\n${id} · try ${t}: ${todo.map((x) => `${x.i}@${x.rate} (${x.why})`).join('  ')}`);
    if (DRY) break;
    execFileSync(process.execPath, ['scripts/render-narration.mjs', id, outDir, ...todo.map((x) => `${x.i}@${x.rate}`)], { stdio: 'inherit' });
    rendered += todo.length;
    const next = [];
    for (const x of todo) {
      const file = path.join(outDir, `${keyOf(id, x.i)}.wav`);
      if (!fs.existsSync(file)) { next.push(x); continue; }
      const { d, faults } = measure(file, x.text);
      if (!faults.length) { passed += 1; console.log(`  ok   beat ${x.i} @${x.rate}: ${d.rate.toFixed(2)} syl/s, ends ${(-d.endDb).toFixed(0)} dB down`); continue; }
      let r = faults.some((f) => f.kind === 'TOO FAST' || f.kind === 'TOO SLOW') ? aim(x.rate, d) : x.rate;
      while (x.tried.includes(r)) r = Math.round((r + (t % 2 ? -0.02 : 0.02)) * 100) / 100;
      console.log(`  again beat ${x.i} @${x.rate}: ${faults.map((f) => f.kind).join(', ')} → @${r}`);
      next.push({ ...x, rate: r, why: faults.map((f) => f.kind).join(', ') });
    }
    todo = next;
  }
  stuck.push(...todo.map((x) => `${keyOf(id, x.i)} (${x.why})`));
}

// the job keeps only takes that pass, so install-narration can take it whole
const jobFile = path.join(outDir, 'job.json');
if (!DRY && fs.existsSync(jobFile)) {
  const job = JSON.parse(fs.readFileSync(jobFile, 'utf8'));
  const keep = job.items.filter((it) => {
    const file = path.join(outDir, `${it.key}.wav`);
    return fs.existsSync(file) && !measure(file, it.text).faults.length;
  });
  fs.writeFileSync(jobFile, `${JSON.stringify({ items: keep }, null, 2)}\n`);
  console.log(`\njob: ${keep.length} passing take(s) in ${jobFile}`);
}
console.log(`\n${rendered} render(s), ${passed} passed${stuck.length ? `; still failing: ${stuck.join('; ')}` : ''}`);
process.exit(stuck.length ? 1 : 0);
