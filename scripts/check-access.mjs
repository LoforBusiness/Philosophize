// WHO MAY OPEN A LESSON — the rule, and the one way it can hurt somebody.
//
// `lessonAccess` decides whether a reader may open a lesson, and four surfaces
// ask it: the road's markers, the units drawer, the lesson route's own guard and
// a thinker's "lessons featuring". It is also a MONETISATION rule, so getting it
// wrong is not a visual defect — it either gives the Pass away or refuses a
// paying reader something they bought.
//
// The subtle one, and the reason this file exists: replaying a finished lesson
// is part of the Pass, which means FINISHING a lesson can take it away from a
// free reader. `unitDone` goes 3 → 4 and lesson 3 stops being the next one and
// becomes a replay. The lesson route holds a one-way latch for exactly that
// moment; without it the reader is thrown onto a paywall at the instant they
// complete a lesson. That transition is simulated below rather than trusted.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);
const TMP = path.join(os.tmpdir(), 'philosophize-access');
fs.mkdirSync(TMP, { recursive: true });

// data/index.ts pulls in the whole curriculum; `lessonAccess` needs none of it,
// so lift just that function out rather than mirroring the data tree.
const src = fs.readFileSync(path.join(REPO, 'data/index.ts'), 'utf8');
const m = /export function lessonAccess\([\s\S]*?\n}/.exec(src);
if (!m) {
  console.log('\n✗ lessonAccess is no longer in data/index.ts — this check is stale.\n');
  process.exit(1);
}
const out = path.join(TMP, 'access.mjs');
fs.writeFileSync(out, transform(m[0], { transforms: ['typescript'] }).code);
const { lessonAccess } = await import(pathToFileURL(out).href);

let bad = 0;
const ok = (pass, label, detail) => {
  if (!pass) bad++;
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};
const shape = (a) => `${a.open ? 'open' : 'shut'}${a.needsPass ? '+pass' : ''}`;

console.log('\nWHO MAY OPEN A LESSON\n');

// ── the table ────────────────────────────────────────────────────────────────
const cases = [
  // li, unitDone, startable, isPro,  expected
  [5, 3, true, true, 'shut'],           // ahead of you: nobody, not even paid
  [5, 3, true, false, 'shut'],
  [3, 3, true, false, 'open'],          // the next one, free, unit startable
  [3, 3, false, false, 'shut+pass'],    // the next one, free, a unit ahead
  [3, 3, false, true, 'shut+pass'],     // (paid is always startable in practice)
  [1, 3, true, true, 'open'],           // a replay, paid
  [1, 3, true, false, 'shut+pass'],     // a replay, free — the Pass would fix it
  [0, 32, true, false, 'shut+pass'],
];
for (const [li, done, startable, isPro, want] of cases) {
  const got = shape(lessonAccess(li, done, startable, isPro));
  ok(got === want, `li ${li} of ${done} done · ${isPro ? 'paid' : 'free'} · ${startable ? 'startable' : 'locked unit'}`,
    got === want ? got : `got ${got}, wanted ${want}`);
}

// ── a paying reader is never refused anything they have reached ─────────────
{
  let refused = 0;
  for (let done = 0; done <= 8; done++) {
    for (let li = 0; li <= done; li++) {
      if (!lessonAccess(li, done, true, true).open) refused++;
    }
  }
  ok(refused === 0, 'the Pass never refuses a lesson already reached', `${refused} refusals`);
}

// ── a paywall is only ever offered where money is the obstacle ──────────────
{
  const wrong = [];
  for (const isPro of [true, false]) {
    for (const startable of [true, false]) {
      for (let done = 0; done <= 6; done++) {
        for (let li = 0; li <= 10; li++) {
          const a = lessonAccess(li, done, startable, isPro);
          if (a.needsPass && li > done) wrong.push(`li ${li}>${done}`);
          if (a.needsPass && a.open) wrong.push('open and gated at once');
          if (a.needsPass && isPro && li < done) wrong.push('paid reader shown a paywall for a replay');
        }
      }
    }
  }
  ok(wrong.length === 0, 'no paywall in front of a lesson money cannot unlock', wrong.slice(0, 2).join('; ') || 'none');
}

// ── THE FLIP, and the latch that answers it ─────────────────────────────────
//
// Walk a free reader through finishing lesson 3 of a unit and check both halves:
// the rule really does close behind them (so the feature works), and the route's
// latch really does keep them in (so it does not hurt).
{
  const before = lessonAccess(3, 3, true, false);
  const after = lessonAccess(3, 4, true, false);
  ok(before.open && !after.open, 'finishing a lesson does close it behind a free reader',
    `${shape(before)} -> ${shape(after)}`);

  // the latch, as the route implements it: once open, stays open for the visit
  let everOpen = false;
  const visit = (live) => { if (live.open) everOpen = true; return everOpen ? { open: true, needsPass: false } : live; };
  const during = visit(before);
  const onFinish = visit(after);
  ok(during.open && onFinish.open, 'and the latch keeps them in the lesson they just finished',
    `${shape(during)} -> ${shape(onFinish)} (unlatched would be ${shape(after)})`);

  // a fresh visit later is correctly shut
  everOpen = false;
  ok(!visit(after).open, 'while a later visit to it is properly shut', shape(visit(after)));

  // and buying the Pass mid-lesson unlatches upward, not downward
  everOpen = false;
  const paidNow = visit(lessonAccess(3, 4, true, true));
  ok(paidNow.open, 'buying the Pass in the middle opens it at once', shape(paidNow));
}

// ── the route really does hold that latch ───────────────────────────────────
{
  const route = fs.readFileSync(
    path.join(REPO, 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx'), 'utf8');
  ok(/everOpen\.current = true/.test(route) && /everOpen\.current \?/.test(route),
    'the lesson route still carries the latch', 'remove it and finishing a lesson ejects a free reader');
}

console.log(bad ? `\n${bad} problem(s).\n` : '\nthe gate is sound.\n');
process.exit(bad ? 1 : 0);
