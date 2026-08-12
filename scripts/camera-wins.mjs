// WHERE IS THE CAMERA CHEAPEST TO BUY BACK?
//
//   node scripts/camera-wins.mjs
//
// H60c protects the figure, the words and any non-bleeding art, and containShot
// pulls the shot back far enough to hold all of it. In scenes whose content runs
// edge to edge that means the shot cannot push at all: across the app the mean is
// 1.017 and 72% of beats sit at scale 1. That is the layouts, not the rule — and
// because containShot only ever LOOSENS, the movement returns by itself as soon as
// a layout stops demanding the whole stage. No camera has to be re-authored; move
// the outlying label, re-run measure-must, and the push is back.
//
// This says where that is worth doing. Offline, in a second, from the measurements
// already stored — no browser.
//
// For each lesson: the zoom its layout allows now, and the zoom it would allow if
// the single most extreme thing on each edge were pulled inboard. A big gap means
// one stray label is holding the whole lesson flat — an afternoon's nudge. A small
// gap means the content genuinely fills the stage and only a redesign would help.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = 'c:/Users/landy/Documents/Philosophize';
const DIR = path.join(ROOT, 'components/lesson/cinematic');
const ts = (await import(pathToFileURL(path.join(ROOT, 'node_modules/typescript/lib/typescript.js')).href)).default;
const tmp = path.join(ROOT, 'node_modules/.cache/camaudit');
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, 'camera.mjs'), ts.transpileModule(
  fs.readFileSync(path.join(DIR, 'camera.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } },
).outputText);
const C = await import(pathToFileURL(path.join(tmp, 'camera.mjs')).href);
const { mustBox } = await import(pathToFileURL(path.join(ROOT, 'scripts/lib/mustrule.mjs')).href);
const G = 500;

const { words } = JSON.parse(fs.readFileSync(path.join(DIR, 'mustBoxes.ts.json'), 'utf8'));
const comps = new Map([...fs.readFileSync(path.join(ROOT, 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx'), 'utf8')
  .matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));

/** Drop the one item that reaches furthest past each edge of the eventual box. */
function trimmed(items) {
  const keep = items.filter((it) => it.k !== 'art' || !it.bleed);
  if (keep.length < 4) return items;
  const drop = new Set();
  const by = (f) => keep.slice().sort(f)[0];
  drop.add(by((a, b) => a.b[0] - b.b[0]));
  drop.add(by((a, b) => (b.b[0] + b.b[2]) - (a.b[0] + a.b[2])));
  drop.add(by((a, b) => a.b[1] - b.b[1]));
  drop.add(by((a, b) => (b.b[1] + b.b[3]) - (a.b[1] + a.b[3])));
  return items.filter((it) => !drop.has(it));
}

const rows = [];
for (const [id, per] of Object.entries(words)) {
  const comp = comps.get(id); if (!comp) continue;
  const base = comp.replace(/Lesson$/, ''); const low = `${base[0].toLowerCase()}${base.slice(1)}`;
  const sceneP = path.join(DIR, `${low}Scene.tsx`); if (!fs.existsSync(sceneP)) continue;
  const src = fs.readFileSync(sceneP, 'utf8');
  const bm = src.match(/band=\{\[(\d+),\s*(\d+)\]\}/); if (!bm || !/camera=\{CAM\}/.test(src)) continue;
  const band = [+bm[1], +bm[2]];
  const xRaw = src.match(/const X = BEATS\.map\(\(b\) => b\.x \?\? ([A-Za-z_$][\w$]*|-?[\d.]+)\)/)?.[1];
  let xDef = Number(xRaw);
  if (xRaw && Number.isNaN(xDef)) xDef = +src.match(new RegExp(`const ${xRaw}\\s*=\\s*(-?[\\d.]+)`))[1];
  const chunks = fs.readFileSync(path.join(DIR, `${low}Script.ts`), 'utf8')
    .match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/)[1].split(/\n\s{2}\},?\s*\n?/).filter((c) => /\S/.test(c));
  const xs = chunks.map((c) => { const m = c.match(/(?:^\s{4}|[,{]\s*)x:\s*(-?[\d.]+)/m); return m ? +m[1] : xDef; });
  const kinds = chunks.map((c) => C.kindOf({
    summary: /^\s{4}summary:/m.test(c) || undefined, quote: /^\s{4}quote:/m.test(c) || undefined,
    mc: /^\s{4}mc:/m.test(c) || undefined, interact: /^\s{4}interact:/m.test(c) || undefined,
  }));
  const sm = src.match(/seedOf\('([^']+)'\)/);
  const shots = C.resolveMoves(C.followMoves(xs, kinds, sm ? C.seedOf(sm[1]) : 0, G), band, G);

  let now = 1, could = 1;
  per.forEach((items, i) => {
    if (!shots[i] || !items) return;
    const a = mustBox(items, null, 'all', band);
    const t = mustBox(trimmed(items), null, 'all', band);
    if (a) now = Math.max(now, C.containShot(shots[i], { x: a[0], y: a[1], w: a[2], h: a[3] }, band).s);
    if (t) could = Math.max(could, C.containShot(shots[i], { x: t[0], y: t[1], w: t[2], h: t[3] }, band).s);
  });
  rows.push({ id, now, could, gain: could - now, bandH: band[1] - band[0] });
}

console.log('\nCHEAPEST CAMERA TO BUY BACK — drop the single most extreme thing per edge\n');
console.log('  lesson                          now    could   gain   band');
for (const r of rows.sort((a, b) => b.gain - a.gain).slice(0, 14)) {
  console.log(`  ${r.id.padEnd(30)} ${r.now.toFixed(2)}   ${r.could.toFixed(2)}   +${r.gain.toFixed(2)}   ${r.bandH}`);
}
const big = rows.filter((r) => r.gain >= 0.10);
console.log(`\n  ${big.length} lessons would regain 0.10x or more from ONE nudge per edge.`);
console.log(`  ${rows.filter((r) => r.gain < 0.03).length} would gain almost nothing — their content genuinely fills the stage.`);
