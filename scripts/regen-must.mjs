// Rebuild mustBoxes.ts from a measurement sidecar, without a browser.
//
// measure-must.mjs keeps every word it measured, not only the box it derived — so
// the must-see rule in scripts/lib/mustrule.mjs can be changed and the whole table
// regenerated in a second instead of in an hour. This is that second path.
//
//   node scripts/regen-must.mjs [components/lesson/cinematic/mustBoxes.ts.json]
import fs from 'node:fs';
import path from 'node:path';
import { renderTable } from './lib/mustrule.mjs';

const DIR = path.join('components', 'lesson', 'cinematic');
/** Each lesson's declared band — mustBox clamps to it, so regen needs it too. */
function bandMap() {
  const src = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
  const out = new Map();
  for (const m of src.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)) {
    const base = m[2].replace(/Lesson$/, '');
    const low = `${base[0].toLowerCase()}${base.slice(1)}`;
    for (const f of [path.join(DIR, `${low}Scene.tsx`), path.join(DIR, `${m[2]}.tsx`)]) {
      if (!fs.existsSync(f)) continue;
      const b = fs.readFileSync(f, 'utf8').match(/band=\{\[(\d+),\s*(\d+)\]\}/);
      if (b) { out.set(m[1], [+b[1], +b[2]]); break; }
    }
  }
  return out;
}

const OUT = path.join(DIR, 'mustBoxes.ts');
const raw = process.argv[2] ?? `${OUT}.json`;
if (!fs.existsSync(raw)) {
  console.error(`no measurements at ${raw} — run: node scripts/measure-must.mjs`);
  process.exit(1);
}
const { words, stamps } = JSON.parse(fs.readFileSync(raw, 'utf8'));
if (!words) {
  console.error(`${raw} predates per-word measurement — re-run measure-must.mjs`);
  process.exit(1);
}
const { text, boxes } = renderTable(words, stamps ?? {}, 'all', bandMap());
fs.writeFileSync(OUT, text);

const n = Object.values(boxes).reduce((a, p) => a + p.filter(Boolean).length, 0);
const t = Object.values(boxes).reduce((a, p) => a + p.length, 0);
console.log(`regenerated ${OUT}: ${Object.keys(boxes).length} lessons · ${n}/${t} beats carry a box`);
