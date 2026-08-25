// NO WORD ON THE STAGE MAY BE TOO SMALL TO READ.
//
// The stage is a 400-wide design space fitted into the box the player gives it:
//
//     fit = min(stageW / STAGE_W, stageH / bandH)
//
// On a 390-wide phone the width binds at about 0.935 for most lessons — but a
// lesson with a TALL band is bound by its height instead, and then EVERYTHING it
// draws shrinks, labels included. `logic-arguments-8` declares 8.5pt captions in
// a 493-unit band, and they reach the reader at 5.1pt.
//
// That is not a small caption. It is the defect the reader reported as:
//
//   "the words in questions or the words in boxes or words in general above the
//    stickman aren't visible. It's just blank boxes."
//
// Nothing in the repo could see it. The must-see sweep records every word that
// reached the screen, so it reported these lessons as fully lettered — the words
// WERE there, at a size that is a grey texture rather than a word. A checker that
// asks "is there text" will always pass this; the question has to be "how big is
// it when it lands".
//
// ── WHY THE FLOOR IS A RENDERED SIZE AND NOT A DECLARED ONE ─────────────────
//
// Declared size means nothing on its own: 7pt in a 210-unit band is bigger than
// 9pt in a 493-unit one. Only `declared × fit` is a fact about what the reader
// sees, and it is computable offline from the scene's own `band={[a, b]}`.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const STAGE_W = 400;
/** A 390x844 phone: the body after the header and tap strip, and the stage's 42 parts of it (L6). */
const PHONE_W = 390;
const STAGE_H = 0.42 * 700;
const SIDE = 8;

/** The smallest a bold, letter-spaced caption may reach the reader, in points. */
const FLOOR = 8.0;
/** High-water mark. Lower it as scenes are fixed; never raise it. */
const SMALL_BUDGET = 0;

const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const comp = new Map([...route.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));

export const sceneOf = (id) => {
  const c = comp.get(id);
  if (!c) return null;
  const base = c.replace(/Lesson$/, '');
  const low = `${base[0].toLowerCase()}${base.slice(1)}`;
  for (const f of [path.join(DIR, `${low}Scene.tsx`), path.join(DIR, `${c}.tsx`)]) {
    if (fs.existsSync(f)) return f;
  }
  return null;
};

/** Comments quote font sizes; strip them before counting (the L8 lesson). */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

export function measure() {
  const rows = [];
  for (const id of comp.keys()) {
    const f = sceneOf(id);
    if (!f) continue;
    const src = fs.readFileSync(f, 'utf8');
    const band = /band=\{\[(\d+),\s*(\d+)\]\}/.exec(src);
    if (!band) continue;
    const bandH = +band[2] - +band[1];
    const fit = Math.min((PHONE_W - SIDE * 2) / STAGE_W, STAGE_H / bandH);
    const sizes = [...strip(src).matchAll(/fontSize:\s*([\d.]+)/g)].map((m) => +m[1]);
    if (!sizes.length) continue;
    const under = sizes.filter((s) => s * fit < FLOOR);
    rows.push({
      id, file: path.basename(f), bandH, fit,
      smallest: Math.min(...sizes), rendered: Math.min(...sizes) * fit,
      under: under.length, need: FLOOR / fit,
    });
  }
  return rows;
}

const RUN_DIRECTLY = (process.argv[1] ?? '').replace(/\\/g, '/').endsWith('scripts/check-legible.mjs');
if (RUN_DIRECTLY) {
  const rows = measure().sort((a, b) => a.rendered - b.rendered);
  const bad = rows.filter((r) => r.under > 0);
  const total = bad.reduce((a, r) => a + r.under, 0);

  console.log('\nNO WORD TOO SMALL TO READ\n');
  console.log(`  ${rows.length} scenes, measured on a ${PHONE_W}-wide phone`);
  console.log(`  smallest type anywhere ${rows[0].rendered.toFixed(1)}pt · median ${rows[Math.floor(rows.length / 2)].rendered.toFixed(1)}pt\n`);

  const ok = total <= SMALL_BUDGET;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  no more than ${SMALL_BUDGET} label(s) land under ${FLOOR}pt  ${total} do, across ${bad.length} scene(s)`);
  for (const r of bad.slice(0, 40)) {
    console.log(`        ${r.rendered.toFixed(1)}pt  ${r.id.padEnd(26)} band ${String(r.bandH).padStart(3)} · fit ${r.fit.toFixed(2)} · raise anything under ${r.need.toFixed(1)}pt`);
  }
  if (ok && total < SMALL_BUDGET) console.log(`        ${total} now — lower SMALL_BUDGET to ${total} to lock it in`);
  console.log(ok ? '\nevery word on every stage is big enough to read.\n' : '\na label that small is a blank box to the reader.\n');
  process.exit(ok ? 0 : 1);
}
