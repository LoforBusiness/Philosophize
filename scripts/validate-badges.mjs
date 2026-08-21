// ─────────────────────────────────────────────────────────────────────────────
// THE BADGE CHECKS.
//
// Three things that are invisible until someone is looking at the wrong pixel:
//
//   1. THE IDS ARE FROZEN. They are persisted in `earnedBadges` and merged as a
//      UNION with the Supabase snapshot on sign-in, so renaming one does not
//      rename anything — it strands the badge everybody holds and invents one
//      nobody does, which then pops at every existing reader as newly earned.
//      Compared here against a written-down roll, not against git, so the roll
//      survives a rebase.
//
//   2. THE MARK FITS INSIDE THE MEDAL. Six silhouettes and three tiers is
//      eighteen combinations, and the tier-III hatch band eats 9 units off every
//      edge. The shield's point and the pennant's notch are the tight ones.
//      Geometry, not screenshots — the shapes come from the same zero-import
//      module the renderer draws from, so the check cannot pass a shape that has
//      since moved.
//
//   3. THE OUTLINE LENGTH IS NOT SHORT. `LEN` is the dasharray the draw-on
//      animation runs against; if it is under the true perimeter then part of
//      the medal is already inked on the first frame, which reads as a bug
//      rather than as a flourish.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errs = [];
const warns = [];

// ─── 1. the frozen roll ──────────────────────────────────────────────────────
// Fifty ids, as shipped. A badge may be renamed, re-glyphed, re-tiered and its
// criterion rewritten — but this list may not change without a migration.
// The roll, as shipped. A badge may be renamed, re-glyphed, re-tiered and its
// criterion rewritten — but an id may not leave this list without a migration.
//
// It went from fifty to sixty-eight when the case was rebalanced for
// difficulty. Every one of the original fifty is still in it: the eighteen
// additions are appended, and nothing was dropped, which is the only kind of
// change to this list that needs no migration at all — an id nobody holds yet
// cannot be stranded.
const FROZEN = [
  'first-light', 'star-pupil', 'arch-of-wisdom', 'true-north', 'the-pillars',
  'grid-thinker', 'ascent', 'summit', 'the-great-question', 'turning-point',
  'lamp-bearer', 'moonlit-path', 'solar-mind', 'the-hourglass', 'deep-roots',
  'the-willow', 'the-keep', 'the-fortress', 'oval-seeker', 'crowned-star',
  'circle-of-stars', 'crossed-paths', 'the-colosseum', 'the-lens', 'the-infinite',
  'half-circle', 'open-page', 'the-vessel', 'flourish', 'the-amphora',
  'the-vessel-ii', 'the-rings', 'facets', 'mandala', 'compass-rose',
  'bright-star', 'radiant-mind', 'the-crown', 'diamond-eye', 'star-of-david',
  'the-gate', 'the-shield', 'balance', 'delta-rise', 'dottarget-forty',
  'target-hundred', 'the-anvil', 'crossroads', 'the-arch', 'the-fountain',
  'peak-climber', 'marble-pillar', 'the-obelisk-ii', 'the-keystone', 'tender-heart',
  'lotus-bloom', 'deep-well', 'the-first-whole', 'three-whole', 'the-whole-tree',
  'moonrise', 'the-ages', 'order-bronze', 'order-jade', 'order-lapis',
  'order-crimson', 'order-amethyst', 'order-aurum',
];

const src = fs.readFileSync(path.join(ROOT, 'data/badges.ts'), 'utf8');
const badges = [...src.matchAll(
  /id: '([^']+)', name: '(?:[^']|\\')*'|id: '([^']+)', name: "[^"]*"/g,
)].map((m) => m[1] ?? m[2]);
// Simpler and exact: every `id: '…'` inside the BADGES array.
const ids = [...src.slice(src.indexOf('export const BADGES')).matchAll(/^\s{4}id: '([^']+)',/gm)]
  .map((m) => m[1]);

const missing = FROZEN.filter((id) => !ids.includes(id));
const invented = ids.filter((id) => !FROZEN.includes(id));
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (missing.length) errs.push(`badge ids dropped (they are persisted + cloud-synced): ${missing.join(', ')}`);
if (invented.length) errs.push(`badge ids invented without a migration: ${invented.join(', ')}`);
if (dupes.length) errs.push(`duplicate badge ids: ${[...new Set(dupes)].join(', ')}`);
if (ids.length !== FROZEN.length) errs.push(`expected ${FROZEN.length} badges, found ${ids.length}`);

// Every glyph must exist, and no two badges may share a mark — the badges are
// meant to be fifty distinct objects.
const glyphs = [...src.slice(src.indexOf('export const BADGES')).matchAll(/glyph: '([^']+)'/g)].map((m) => m[1]);
const glyphSrc = fs.readFileSync(path.join(ROOT, 'components/shared/Glyph.tsx'), 'utf8');
const cases = new Set([...glyphSrc.matchAll(/case '([a-z]+)':/g)].map((m) => m[1]));
const noCase = [...new Set(glyphs)].filter((g) => !cases.has(g));
if (noCase.length) errs.push(`glyphs with no case in Glyph.tsx: ${noCase.join(', ')}`);
const sharedMarks = [...new Set(glyphs.filter((g, i) => glyphs.indexOf(g) !== i))];
if (sharedMarks.length) warns.push(`two badges share a mark: ${sharedMarks.join(', ')}`);

// Copy that has to fit a 112px cell and a two-line name.
const names = [...src.slice(src.indexOf('export const BADGES')).matchAll(/^\s{4}id: '[^']+', name: (.+),$/gm)]
  .map((m) => m[1].slice(1, -1));
for (const n of names) if (n.length > 26) errs.push(`badge name over 26 chars: "${n}" (${n.length})`);
const caps = [...src.matchAll(/^\s{4}caption: (.+),$/gm)].map((m) => m[1].slice(1, -1));
for (const c of caps) if (c.length > 64) errs.push(`caption over 64 chars: "${c}" (${c.length})`);

// ─── 2 & 3. the geometry ─────────────────────────────────────────────────────
// Read the shapes out of the SAME module the renderer uses, transpiled by hand:
// it is deliberately import-free, so stripping the types is enough to run it.
// Transpiled by tsc itself rather than by a hand-rolled regex strip — the module
// is import-free precisely so this works, and a checker that mis-parses the file
// it is checking is worse than no checker.
const ts = (await import('typescript')).default;
const shapeSrc = fs.readFileSync(path.join(ROOT, 'components/shared/badgeShapes.ts'), 'utf8');
const js = ts.transpileModule(shapeSrc, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const exports = {};
new Function('exports', js)(exports);
const mod = exports;

const FAMILIES = ['lessons', 'streak', 'thinkers', 'quotes', 'xp', 'mastery'];

const inside = (poly, x, y) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};
/** Shortest distance from a point to the polygon's edge. */
const edgeDist = (poly, x, y) => {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [x1, y1] = poly[j], [x2, y2] = poly[i];
    const dx = x2 - x1, dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)));
  }
  return best;
};

console.log('mark clearance inside the medal, in units of the 100-box:\n');
console.log('  family      tier I   tier II  tier III');
for (const f of FAMILIES) {
  const side = mod.GLYPH_SCALE[f] * 100;
  const cy = 50 + mod.GLYPH_DY[f] * 100;
  // The mark's own box, sampled around its rim — corners are the tight case.
  const box = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    box.push([50 - side / 2 + t * side, cy - side / 2]);
    box.push([50 - side / 2 + t * side, cy + side / 2]);
    box.push([50 - side / 2, cy - side / 2 + t * side]);
    box.push([50 + side / 2, cy - side / 2 + t * side]);
  }
  const cells = [];
  for (const tier of [1, 2, 3]) {
    // Tier I is bounded by the outline; II and III by their inner rule, since
    // the mark must not touch the second line or sit under the hatch band.
    const poly = mod.outlinePoints(f, tier === 1 ? 0 : mod.INNER[tier]);
    let worst = Infinity;
    for (const [x, y] of box) {
      const d = edgeDist(poly, x, y);
      worst = Math.min(worst, inside(poly, x, y) ? d : -d);
    }
    cells.push(worst);
    // WHERE 3.0 COMES FROM, so it is a measurement and not a taste. The rule the
    // mark is closing on is 1.4 wide (±0.7 from its centreline) and the mark's own
    // stroke is 2 units in a 32-unit glyph box, which at these scales is ~2.5
    // wide (±1.25). Touching therefore starts at 1.95, and 3.0 leaves about a
    // stroke of daylight between the two so it reads as a border rather than as
    // the mark resting on it.
    if (worst < 3.0) {
      errs.push(
        `${f} tier ${tier}: the mark comes within ${worst.toFixed(1)} of the ` +
        `${tier === 1 ? 'outline' : 'inner rule'} — shrink GLYPH_SCALE.${f} or move GLYPH_DY.${f}`,
      );
    }
  }
  console.log(`  ${f.padEnd(12)}${cells.map((c) => c.toFixed(1).padStart(6)).join('   ')}`);
}

// The dasharray must be at least the true perimeter, or the shape is partly
// drawn before the animation starts.
console.log('\noutline length vs the LEN the draw-on runs against:\n');
console.log('  family      true   LEN   slack');
for (const f of FAMILIES) {
  const poly = mod.outlinePoints(f, 0, 400);
  let per = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    per += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  const len = mod.LEN[f];
  const slack = ((len / per - 1) * 100);
  console.log(`  ${f.padEnd(12)}${per.toFixed(0).padStart(5)}${String(len).padStart(6)}${(slack.toFixed(1) + '%').padStart(8)}`);
  if (len < per) errs.push(`LEN.${f} is ${len} but the outline is ${per.toFixed(0)} — part of it is inked at draw 0`);
  else if (slack > 25) warns.push(`LEN.${f} overshoots by ${slack.toFixed(0)}% — the draw finishes early`);
}

console.log('');
for (const w of warns) console.log(`~ ${w}`);
for (const e of errs) console.log(`✗ ${e}`);
if (errs.length) {
  console.log(`\n${errs.length} problem${errs.length === 1 ? '' : 's'}.`);
  process.exit(1);
}
// Derived, not typed. This line read "50 badges … 18 medal variants" for a
// sixty-eight badge case with thirty variants — a summary that states a count
// it did not count is the same class of thing as the checks in this file exist
// to catch.
const variants = new Set(
  [...src.slice(src.indexOf('export const BADGES')).matchAll(/family: '([a-z]+)', tier: (\d)/g)]
    .map((m) => m[1] + m[2]),
);
console.log(`${ids.length} badges, ${new Set(glyphs).size} distinct marks, ${variants.size} medal variants clean.`);
