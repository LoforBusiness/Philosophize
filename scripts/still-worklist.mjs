// WHICH TAPS LEAVE THE PICTURE ALONE — the worklist for group AH.
//
//   node scripts/still-worklist.mjs                 every lesson, counts only
//   node scripts/still-worklist.mjs logic            one branch, with the detail
//   node scripts/still-worklist.mjs logic-arguments-7
//
// A reader asked for *"a different animation for every time the user taps the
// screen in every lesson"*, having noticed that the first three lessons of each
// branch already do it. Counted: **612 taps across 213 lessons change nothing in
// the picture.** The figure moves (group AF now moves the whole man), a pen mark or
// a thought may appear, but the drawing itself holds.
//
// `check:idle` counts the taps where NOTHING at all moves and holds them at zero.
// This is the other question — the one the reader actually asked — and it prints
// what an author needs to answer it, per beat:
//
//   · the words the beat says, which is where its event has to come from (A1);
//   · what the stage is already drawing, out of `mustBoxes.ts.json`;
//   · the channels the script declares, with the value this beat and the last one
//     hold, so an existing track can be moved rather than a new one invented;
//   · whether the beat is narrated, and for how long.
//
// It is all offline — no Metro, no browser — so it costs milliseconds.
import fs from 'node:fs';
import path from 'node:path';
import { LESSONS, beatsOf, parseManifest } from './lib/narration.mjs';
import { poseTrack, poseTracks } from './lib/posetrack.mjs';
import { PROSE } from './lib/marks.mjs';

const DIR = 'components/lesson/cinematic';
const J = JSON.parse(fs.readFileSync(path.join(DIR, 'mustBoxes.ts.json'), 'utf8'));
const NARRATION = Object.fromEntries(
  [...parseManifest(fs.readFileSync('lib/narration/manifest.ts', 'utf8')).lessons]
    .map(([id, m]) => [id, Object.fromEntries(m)]),
);

const arg = process.argv[2] || '';
const want = (id) => !arg || id === arg || id.startsWith(`${arg}-`);

const rows = [];
for (const [id, file] of Object.entries(LESSONS)) {
  const stem = file.replace(/Script\.ts$/, '');
  if (!fs.existsSync(`${DIR}/${stem}Scene.tsx`)) continue;
  const one = poseTrack(DIR, stem);
  const pose = new Set((one ? [one] : poseTracks(DIR, stem)).map((t) => t.field));
  const beats = beatsOf(file);
  const still = [];
  for (let i = 1; i < beats.length; i += 1) {
    const a = beats[i - 1];
    const b = beats[i];
    if (b.interact || b.mc || b.tap || b.quote || b.summary) continue;
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])]
      .filter((k) => !PROSE.has(k) && !pose.has(k));
    const moved = keys.filter((k) => JSON.stringify(a[k] ?? null) !== JSON.stringify(b[k] ?? null));
    if (moved.length) continue;
    still.push({ i, a, b, keys });
  }
  if (still.length) rows.push({ id, stem, beats, still });
}

const total = rows.reduce((n, r) => n + r.still.length, 0);
console.log(`${total} still tap(s) across ${rows.length} lessons\n`);

if (!arg) {
  const byBranch = new Map();
  for (const r of rows) {
    const br = r.id.split('-')[0];
    const [t, l] = byBranch.get(br) ?? [0, 0];
    byBranch.set(br, [t + r.still.length, l + 1]);
  }
  for (const [br, [t, l]] of [...byBranch].sort((x, y) => y[1][0] - x[1][0])) {
    console.log(`  ${br.padEnd(14)} ${String(t).padStart(3)} taps in ${l} lessons`);
  }
  console.log('\n  pass a branch or a lesson id for the detail');
  process.exit(0);
}

for (const r of rows.filter((x) => want(x.id))) {
  const words = J.words[r.id] || [];
  const lines = NARRATION[r.id] || {};
  console.log('='.repeat(78));
  console.log(`### ${r.stem}   (${r.id})   ${r.beats.length} beats · ${r.still.length} still`);
  for (const s of r.still) {
    const dur = lines[s.i]?.dur;
    console.log(`\n [${s.i}] ${dur ? `${dur.toFixed(1)}s` : 'unnarrated'}`);
    console.log(`   says  : ${(s.b.text || '').replace(/\s+/g, ' ')}`);
    const stage = (words[s.i] || []).filter((it) => it.t).map((it) => it.t).join(' · ');
    if (stage) console.log(`   stage : ${stage.slice(0, 220)}`);
    // The channels this beat holds, so an author can move one rather than add one.
    const held = s.keys.map((k) => `${k}=${JSON.stringify(s.b[k] ?? s.a[k])}`).join('  ');
    if (held) console.log(`   holds : ${held.slice(0, 300)}`);
  }
  console.log('');
}
