// WHO MAY OPEN A LESSON — the rule, and the one way it can hurt somebody.
//
// `lessonAccess` decides whether a reader may open a lesson, and four surfaces
// ask it: the road's markers, the units drawer, the lesson route's own guard and
// a thinker's "lessons featuring". It is also a MONETISATION rule, so getting it
// wrong is not a visual defect — it either gives the Pass away or refuses a
// paying reader something they bought.
//
// A HARD PAYWALL SINCE 2026-09-25. Every lesson needs the Scholar's Pass or its
// trial; everything else in the app is free. There is no free lesson left, so
// the old subtle case — finishing a lesson turning it into a paid replay — has
// gone with it. The case that replaces it is a TRIAL EXPIRING while a lesson is
// open: the live rule closes the lesson, and the route's one-way latch must hold
// it open for the rest of the visit. That transition is simulated below rather
// than trusted.
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

console.log('\nWHO MAY OPEN A LESSON (a hard paywall)\n');

// ── the table ────────────────────────────────────────────────────────────────
const cases = [
  // li, unitDone, startable, isPro,  expected
  [0, 0, true, false, 'shut+pass'],     // a free reader's very first lesson
  [0, 0, false, false, 'shut+pass'],
  [3, 3, true, false, 'shut+pass'],     // the next one, free
  [1, 3, true, false, 'shut+pass'],     // a replay, free
  [5, 3, true, false, 'shut+pass'],     // ahead, free: the Pass is still the reason
  [3, 3, true, true, 'open'],           // the next one, on the Pass
  [3, 3, false, true, 'open'],          // any unit may be started on the Pass
  [1, 3, true, true, 'open'],           // a replay, on the Pass
  [5, 3, true, true, 'shut'],           // not reached yet: closed, and no paywall
];
for (const [li, done, startable, isPro, want] of cases) {
  const got = shape(lessonAccess(li, done, startable, isPro));
  ok(got === want, `li ${li} of ${done} done · ${isPro ? 'pass' : 'free'} · ${startable ? 'startable' : 'unit ahead'}`,
    got === want ? got : `got ${got}, wanted ${want}`);
}

// ── a free reader opens nothing, and the Pass is always the reason ──────────
{
  const leaks = [];
  for (const startable of [true, false]) {
    for (let done = 0; done <= 8; done++) {
      for (let li = 0; li <= 10; li++) {
        const a = lessonAccess(li, done, startable, false);
        if (a.open) leaks.push(`li ${li} of ${done} open`);
        else if (!a.needsPass) leaks.push(`li ${li} of ${done} shut with no paywall`);
      }
    }
  }
  ok(leaks.length === 0, 'no lesson opens without the Pass, and every one offers it', leaks.slice(0, 2).join('; ') || 'none');
}

// ── a paying reader is never refused anything they have reached ─────────────
{
  let refused = 0;
  for (const startable of [true, false]) {
    for (let done = 0; done <= 8; done++) {
      for (let li = 0; li <= done; li++) {
        if (!lessonAccess(li, done, startable, true).open) refused++;
      }
    }
  }
  ok(refused === 0, 'the Pass never refuses a lesson already reached', `${refused} refusals`);
}

// ── a paywall is never shown to somebody who already has the Pass ───────────
{
  const wrong = [];
  for (const startable of [true, false]) {
    for (let done = 0; done <= 6; done++) {
      for (let li = 0; li <= 10; li++) {
        const a = lessonAccess(li, done, startable, true);
        if (a.needsPass) wrong.push(`li ${li} of ${done}`);
        if (a.needsPass && a.open) wrong.push('open and gated at once');
      }
    }
  }
  ok(wrong.length === 0, 'no paywall in front of a Pass holder', wrong.slice(0, 2).join('; ') || 'none');
}

// ── A TRIAL EXPIRING MID-LESSON, and the latch that answers it ──────────────
{
  const during = lessonAccess(3, 3, true, true);
  const lapsed = lessonAccess(3, 3, true, false);
  ok(during.open && !lapsed.open, 'losing the Pass does close a lesson under the live rule',
    `${shape(during)} -> ${shape(lapsed)}`);

  // the latch, as the route implements it: once open, stays open for the visit
  let everOpen = false;
  const visit = (live) => { if (live.open) everOpen = true; return everOpen ? { open: true, needsPass: false } : live; };
  const a = visit(during);
  const b = visit(lapsed);
  ok(a.open && b.open, 'and the latch keeps the reader in the lesson they are reading',
    `${shape(a)} -> ${shape(b)} (unlatched would be ${shape(lapsed)})`);

  everOpen = false;
  ok(!visit(lapsed).open, 'while a later visit without the Pass is properly shut', shape(visit(lapsed)));

  everOpen = false;
  ok(visit(lessonAccess(0, 0, true, true)).open, 'and starting the trial on the paywall opens it at once');
}

// ── the route really does hold that latch ───────────────────────────────────
{
  const route = fs.readFileSync(
    path.join(REPO, 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx'), 'utf8');
  ok(/everOpen\.current = true/.test(route) && /everOpen\.current \?/.test(route),
    'the lesson route still carries the latch', 'remove it and a trial ending ejects a reader mid-lesson');
}

console.log(bad ? `\n${bad} problem(s).\n` : '\nthe gate is sound.\n');
process.exit(bad ? 1 : 0);
