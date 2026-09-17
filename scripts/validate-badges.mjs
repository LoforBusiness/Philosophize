// ─────────────────────────────────────────────────────────────────────────────
// THE BADGE CHECKS.
//
// Four things that are invisible until someone is looking at the wrong pixel:
//
//   1. THE IDS ARE FROZEN. They are persisted in `earnedBadges` and merged as a
//      UNION with the Supabase snapshot on sign-in, so renaming one does not
//      rename anything — it strands the badge everybody holds and invents one
//      nobody does, which then pops at every existing reader as newly earned.
//      Compared here against a written-down roll, not against git, so the roll
//      survives a rebase.
//
//   2. THE MARK FITS INSIDE THE MEDAL. Six silhouettes, drawn alone and
//      dressed, and the recessed face is 8 units in from every edge. The
//      shield's point and the pennant's notch are the tight ones.
//      Geometry, not screenshots — the shapes come from the same zero-import
//      module the renderer draws from, so the check cannot pass a shape that has
//      since moved.
//
//   3. THE FLOURISH IS OUTSIDE THE MEDAL. Tier IV's wreath spent its whole life
//      curled behind the medal — eight of eighteen leaves invisible, and the
//      wreath smaller than the tier below it. Every check in this file was green
//      the entire time. See section 4.
//
//   4. EVERY TIER IS MORE, AND EVERYTHING FITS. Each tier draws more than the
//      one below it, no variant leaves its 100-unit box (a phone clips it
//      without a word), the stars clear the medal they crown, and a locked
//      badge carries no furniture at all.
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
  'the-gate', 'the-shield', 'the-ship', 'the-beacon', 'balance', 'delta-rise', 'dottarget-forty',
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
// Read the shapes out of the SAME module the renderer uses. It is deliberately
// import-free, so transpiling it by tsc itself is enough to run it — and a
// checker that mis-parses the file it is checking is worse than no checker.
const ts = (await import('typescript')).default;
const artSrc = fs.readFileSync(path.join(ROOT, 'components/shared/insigniaArt.ts'), 'utf8');
const js = ts.transpileModule(artSrc, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const A = {};
new Function('exports', js)(A);

// The materials, read the same way, so a tone check measures what ships.
const insSrc = fs.readFileSync(path.join(ROOT, 'constants/insignia.ts'), 'utf8');
const I = {};
new Function('exports', ts.transpileModule(insSrc, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(I);
const tonesFor = (tier) => A.tonesOf(I.ORDER[I.TIER_ORDER[tier - 1]]);

const FAMILIES = ['lessons', 'streak', 'thinkers', 'quotes', 'xp', 'mastery'];

console.log('mark clearance inside the recessed face, in units of the 100-box:\n');
console.log('  family      alone   dressed');
for (const f of FAMILIES) {
  const cells = [];
  for (const tier of [1, 2]) {
    const a = A.badgeArt(f, tier, tonesFor(tier));
    // The glyph's working box: a 32-unit glyph draws inside about 27 of it.
    const s = a.mark.size * 0.84, { cx, cy } = a.mark;
    let worst = Infinity;
    for (let i = 0; i <= 12; i++) {
      const u = (i * s) / 12;
      for (const [x, y] of [[cx - s / 2 + u, cy - s / 2], [cx - s / 2 + u, cy + s / 2], [cx - s / 2, cy - s / 2 + u], [cx + s / 2, cy - s / 2 + u]]) {
        const d = A.edgeDistance(a.face, x, y);
        worst = Math.min(worst, A.insidePoly(a.face, x, y) ? d : -d);
      }
    }
    cells.push(worst);
    // WHERE 1.5 COMES FROM: the face's own edge is the recess shadow, 2.6 units
    // deep, and a mark closer than a stroke's width to it reads as resting on
    // the rim rather than set in the face.
    if (worst < 1.5) {
      errs.push(`${f} ${tier === 1 ? 'alone' : 'dressed'}: the mark comes within ${worst.toFixed(1)} of the face's edge — shrink or move FAMILY_MARK.${f}`);
    }
    // …and the ribbon may not cross it.
    if (tier === 2 && cy + s / 2 > 84 - 6 - 0.5) {
      errs.push(`${f}: the mark reaches y ${(cy + s / 2).toFixed(1)}, into the ribbon at ${84 - 6}`);
    }
  }
  console.log(`  ${f.padEnd(12)}${cells.map((c) => c.toFixed(1).padStart(6)).join('   ')}`);
}

// ─── 4. the furniture is OUTSIDE the medal, and each tier is more of it ──────
//
// WHAT THIS EXISTS FOR. Tier IV's wreath once CLOSED over the medal's crown, and
// closing an arc means bending it inward, where the medal is: eight of its
// eighteen leaves sat entirely behind a medal and the whole thing reached less
// far than tier III's, so the higher tier wore the SMALLER wreath. Crossed
// swords failed the same way before it. The part of a flourish behind the medal
// is not subtle, it is absent, and the fragment that does show reads as a fault.
// Every number in this file was green the whole time; it took a contact sheet,
// and then a reader: "for the red badges … those white things on the side to be
// out more instead of behind, like what the green badge looks like."
console.log('\nthe laurel, against all six dressed medals:\n');
console.log('  wreath   leaves   behind a medal   worst clearance   reach / 50   top edge');
{
  const medals = FAMILIES.map((f) => [f, A.badgeArt(f, 3, tonesFor(3)).body]);
  const measure = (kind) => {
    const { leaves } = A.laurelLeaves(kind);
    const hidden = new Set();
    let worst = Infinity, where = '', reach = 0, top = 100;
    for (const [i, l] of leaves.entries()) {
      const a = (l.rot * Math.PI) / 180;
      reach = Math.max(reach, Math.abs(l.cx - 50) + Math.hypot(l.rx * Math.cos(a), l.ry * Math.sin(a)));
      top = Math.min(top, l.cy - Math.hypot(l.rx * Math.sin(a), l.ry * Math.cos(a)));
      for (const [f, poly] of medals) {
        const d = A.edgeDistance(poly, l.cx, l.cy);
        const clear = A.insidePoly(poly, l.cx, l.cy) ? -d : d;
        if (clear < 0) hidden.add(i);
        if (clear < worst) { worst = clear; where = `leaf ${i} on ${f}`; }
      }
    }
    return { marks: leaves.length, hidden: hidden.size, worst, where, reach, top };
  };
  const open = measure('open');
  const full = measure('full');
  for (const [name, r] of [['open', open], ['full', full]]) {
    console.log(
      `  ${name.padEnd(9)}${String(r.marks).padStart(5)}${String(r.hidden).padStart(15)}` +
      `${r.worst.toFixed(1).padStart(18)}${r.reach.toFixed(1).padStart(13)}${r.top.toFixed(1).padStart(11)}`,
    );
    if (r.hidden > 0) {
      errs.push(`the ${name} laurel has ${r.hidden} leaf${r.hidden === 1 ? '' : 'ves'} behind a medal (worst: ${r.where}) — a flourish drawn behind the medal is not subtle, it is absent`);
    }
    // 48, not 50: the leaf carries a 1.8-wide edge, half of it outside the ellipse.
    if (r.reach > 48) errs.push(`the ${name} laurel reaches ${r.reach.toFixed(1)} of the 48 the box allows — it will be clipped`);
  }
  // TIER IV MUST OUTRANK TIER III AS AN OBJECT, not merely as a colour.
  if (full.marks <= open.marks) errs.push(`the full laurel carries ${full.marks} leaves against the open one's ${open.marks} — tier IV must be more furniture than tier III`);
  if (full.reach <= open.reach) errs.push(`the full laurel reaches ${full.reach.toFixed(1)} against the open one's ${open.reach.toFixed(1)} — tier IV must be the bigger object`);
  if (full.top >= open.top) errs.push(`the full laurel tops out at y ${full.top.toFixed(1)}, no higher than the open one's ${open.top.toFixed(1)} — tier IV must stand taller`);
}

// Every tier draws more than the one below it, every variant stays inside its
// box, and the stars over a tier-IV crown clear the medal they crown.
console.log('\nparts per tier, and the box each variant fills:\n');
{
  const count = (nodes) => nodes.reduce((n, x) => n + (x.k === 'clip' ? 1 + count(x.kids) : 1), 0);
  const boxOf = (nodes) => {
    const b = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
    for (const n of nodes) {
      const half = n.k === 'line' ? n.w / 2 : 0;
      const nums = (n.d.match(/-?\d*\.?\d+/g) ?? []).map(Number);
      for (let i = 0; i + 1 < nums.length; i += 2) {
        b.x0 = Math.min(b.x0, nums[i] - half); b.x1 = Math.max(b.x1, nums[i] + half);
        b.y0 = Math.min(b.y0, nums[i + 1] - half); b.y1 = Math.max(b.y1, nums[i + 1] + half);
      }
    }
    return b;
  };
  for (const f of FAMILIES) {
    const seq = [];
    for (let tier = 1; tier <= 5; tier++) {
      const a = A.badgeArt(f, tier, tonesFor(tier));
      const all = [...a.back, ...a.medal, ...a.front];
      seq.push(count(all));
      // A clipped child cannot draw outside its clip, so the clip outline stands in for it.
      const b = boxOf(all.map((n) => (n.k === 'clip' ? { k: 'fill', d: n.d } : n)));
      if (b.x0 < 0 || b.y0 < 0 || b.x1 > 100 || b.y1 > 100) {
        errs.push(`${f} tier ${tier} leaves its box: x ${b.x0.toFixed(1)}…${b.x1.toFixed(1)}, y ${b.y0.toFixed(1)}…${b.y1.toFixed(1)}`);
      }
      if (tier === 4) {
        const medalTop = Math.min(...a.body.map((p) => p[1])) - 1.8;
        // the side stars sit lowest: centre 7 + 1, radius 4, half a 2.2 edge
        const starFoot = 7 + 1 + 4 + 1.1;
        if (starFoot > medalTop) errs.push(`${f}: the tier-IV stars reach y ${starFoot.toFixed(1)}, into the medal at ${medalTop.toFixed(1)}`);
      }
    }
    console.log(`  ${f.padEnd(12)}${seq.map((n) => String(n).padStart(5)).join('')}`);
    if (!seq.every((n, i) => i === 0 || n > seq[i - 1])) errs.push(`${f}: a tier draws no more than the one below it (${seq.join(' → ')})`);
  }
  // A LOCKED BADGE CARRIES NO FURNITURE — the ornament arrives when it is won.
  for (const f of FAMILIES) {
    const locked = A.badgeArt(f, 5, A.LOCKED);
    if (locked.back.length || locked.front.length) errs.push(`${f}: a locked tier-V badge still carries furniture`);
  }
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
