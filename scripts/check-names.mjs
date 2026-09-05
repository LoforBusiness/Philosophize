// ─────────────────────────────────────────────────────────────────────────────
// THE NAME INDEX IS DERIVED, SO IT CAN GO STALE.
//
//   npm run check:names
//
// `data/lessonNames.ts` says which words in which lesson's narration are
// philosophers, and the deck draws exactly those in their era's colour with a
// snapshot behind them. It is generated from the scripts, which means the one
// thing that can go wrong is the thing no screen will report: a lesson gains a
// paragraph naming Hume, nobody re-runs `make:names`, and Hume is plain text in
// that lesson and coloured in the four beside it. The reader sees an app that
// highlights names inconsistently, which is worse than one that never did.
//
// So this re-derives the table and compares. Three rules:
//
//   1. UP TO DATE. Re-deriving must produce the file that is on disk.
//   2. ONE RULE, TWO READERS. `make-names` and `make-mentions` both decide when
//      a bare surname may be believed, and the header of each says they agree.
//      A comment is not an assertion; this is. If they drift, a name is tappable
//      in the deck and uncredited in the thinker's own record, or the reverse.
//   3. EVERY ID IS REAL. An override or a roster edit that leaves a dangling id
//      renders a name in INK with a snapshot card that never opens — which looks
//      exactly like a name the index simply does not know.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { ALL_PHILOSOPHERS } from '../data/philosophers.ts';
import { derive, render, COMMON as NAMES_COMMON } from './make-names.mjs';

const OUT = 'data/lessonNames.ts';
const read = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const fail = [];

// ── 1. up to date ────────────────────────────────────────────────────────────
const { table, lessons, hits } = derive();
const want = render(table).replace(/\r\n/g, '\n');
if (!fs.existsSync(OUT)) fail.push(`${OUT} is missing — run npm run make:names`);
else if (read(OUT) !== want) fail.push(`${OUT} is STALE — run npm run make:names`);

// ── 2. one rule, two readers ─────────────────────────────────────────────────
//
// Read out of make-mentions' source rather than imported: that script runs a
// whole scan at import time, and a checker must not do the work it is checking.
const mentions = read('scripts/make-mentions.mjs');
const m = mentions.match(/const COMMON = new Set\(\[([\s\S]*?)\]\)/);
if (!m) fail.push('scripts/make-mentions.mjs: no COMMON list found — has it been renamed?');
else {
  const theirs = new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
  const ours = NAMES_COMMON;
  const onlyOurs = [...ours].filter((w) => !theirs.has(w));
  const onlyTheirs = [...theirs].filter((w) => !ours.has(w));
  if (onlyOurs.length || onlyTheirs.length) {
    fail.push('COMMON has drifted between make-names and make-mentions:'
      + (onlyOurs.length ? `\n      only in make-names:    ${onlyOurs.join(', ')}` : '')
      + (onlyTheirs.length ? `\n      only in make-mentions: ${onlyTheirs.join(', ')}` : ''));
  }
}

// ── 3. every id is real ──────────────────────────────────────────────────────
const known = new Set(ALL_PHILOSOPHERS.map((p) => p.id));
let names = 0;
for (const [id, rows] of Object.entries(table)) {
  for (const [surface, pid] of rows) {
    names++;
    if (!known.has(pid)) fail.push(`${id}: "${surface}" resolves to '${pid}', which is not a philosopher`);
  }
}

console.log(`check:names — ${Object.keys(table).length} of ${lessons} lessons name somebody; `
  + `${hits} name forms, ${names} checked`);
if (fail.length) {
  console.log(`\n${fail.length} PROBLEM${fail.length === 1 ? '' : 'S'}:`);
  for (const f of fail) console.log(`  ${f}`);
  process.exit(1);
}
