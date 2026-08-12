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

const OUT = path.join('components', 'lesson', 'cinematic', 'mustBoxes.ts');
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
const { text, boxes } = renderTable(words, stamps ?? {});
fs.writeFileSync(OUT, text);

const n = Object.values(boxes).reduce((a, p) => a + p.filter(Boolean).length, 0);
const t = Object.values(boxes).reduce((a, p) => a + p.length, 0);
console.log(`regenerated ${OUT}: ${Object.keys(boxes).length} lessons · ${n}/${t} beats carry a box`);
