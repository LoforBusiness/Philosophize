// EVERY WORD A SCENE DRAWS OUTSIDE THE SPACE IT IS ALLOWED.
//
// A cinematic lesson gets a 400-unit-wide design space and declares a BAND — the
// vertical slice of it the player crops to and scales up. Anything drawn outside
// either one cannot be framed by ANY shot: the camera moves the scene under a
// fixed crop, it never widens it. So a caption two units above the band top is
// two units short on every beat of the lesson, for the whole life of the app, and
// no amount of camera work can rescue it.
//
// ── WHY THIS IS ITS OWN CHECK ────────────────────────────────────────────────
//
// The tour generator already refuses a station that cuts a word in half — and it
// SKIPS words outside the band while doing it, with a comment saying so: they are
// "unreachable at any shot", an H59 fault in the scene rather than a framing the
// camera chose. That reasoning is right and it left nobody holding the fault. Four
// words had been drawn outside the space for months, three of them in lessons a
// reader had complained about, and every validator was green.
//
// It reads the measurements already on disk (mustBoxes.ts.json), so it costs a
// few milliseconds and needs no browser. It is only as fresh as those
// measurements, which validate-cinematic's stamp is what guarantees.
//
//   npm run check:space
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const SIDE = path.join(DIR, 'mustBoxes.ts.json');
const STAGE_W = 400;

/** Half a unit, so a word drawn flush to an edge is not a finding. */
const EPS = 0.5;

if (!fs.existsSync(SIDE)) {
  console.log('\nno measurements on disk — run: node scripts/measure-must.mjs\n');
  process.exit(0);
}

const side = JSON.parse(fs.readFileSync(SIDE, 'utf8'));
const route = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
const comps = new Map([...route.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));

const sceneOf = (id) => {
  const c = comps.get(id);
  if (!c) return null;
  const base = c.replace(/Lesson$/, '');
  const low = `${base[0].toLowerCase()}${base.slice(1)}`;
  for (const n of [`${low}Scene.tsx`, `${c}.tsx`]) {
    const p = path.join(DIR, n);
    if (fs.existsSync(p)) return { file: n, src: fs.readFileSync(p, 'utf8') };
  }
  return null;
};

const rows = [];
let words = 0;
for (const [id, beats] of Object.entries(side.words ?? {})) {
  const sc = sceneOf(id);
  if (!sc) continue;
  // A lesson with no declared band is framed on the whole design space, which is
  // the widest crop there is — only the horizontal rule can bite.
  const m = /band=\{\[\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\]\}/.exec(sc.src);
  const top = m ? +m[1] : -Infinity;
  const bot = m ? +m[2] : Infinity;

  const seen = new Map();
  (beats ?? []).forEach((items, k) => {
    for (const it of items ?? []) {
      if (it.k !== 'text') continue;
      const [x, y, w, h] = it.b;
      const off = [];
      if (x < -EPS) off.push(`off the left by ${(-x).toFixed(1)}`);
      if (x + w > STAGE_W + EPS) off.push(`off the right by ${(x + w - STAGE_W).toFixed(1)}`);
      if (y < top - EPS) off.push(`above the band by ${(top - y).toFixed(1)}`);
      if (y + h > bot + EPS) off.push(`below the band by ${(y + h - bot).toFixed(1)}`);
      if (!off.length) continue;
      const key = `${it.t}|${off.join(', ')}`;
      if (!seen.has(key)) seen.set(key, { t: it.t, off: off.join(', '), beats: [], b: it.b });
      seen.get(key).beats.push(k);
    }
  });
  if (seen.size) {
    words += seen.size;
    rows.push({ id, file: sc.file, band: m ? [top, bot] : null, hits: [...seen.values()] });
  }
}

console.log('\nWORDS DRAWN WHERE NO SHOT CAN REACH THEM\n');
console.log(`  ${Object.keys(side.words ?? {}).length} lessons measured\n`);
rows.sort((a, b) => a.id.localeCompare(b.id));
for (const r of rows) {
  console.log(`  ${r.id}   ${r.file}${r.band ? `   band [${r.band[0]}, ${r.band[1]}]` : '   (no band)'}`);
  for (const h of r.hits) {
    console.log(`      ${h.off.padEnd(28)} b[${h.beats.join(',')}]  box ${JSON.stringify(h.b)}  ${JSON.stringify(h.t)}`);
  }
}

const ok = words === 0;
console.log(`\n  ${ok ? 'ok  ' : 'FAIL'}  no word is drawn outside the 400-wide stage or its lesson's band  ${words} ${words === 1 ? 'is' : 'are'}`);
console.log(ok
  ? '\nevery word a scene draws is somewhere a shot can hold it.\n'
  : '\nmove the word, or widen the band — the camera cannot reach it from here.\n');
process.exit(ok ? 0 : 1);
