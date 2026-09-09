// GROUP AA — WHAT THE FIGURE WEARS, AND THE CAMERA THAT HAS TO FRAME IT.
//
// AA rather than a single letter because A–Z are used. This is genuinely a new
// area rather than an extension of one: group N is what the figure DOES, group Y
// is his relationship to the world around him, and neither covers what he has ON.
//
//   node scripts/check-wardrobe.mjs
//
// The figure is inside EVERY must-see box (`mustrule`: "the whole man, arms
// included, and every figure on stage"), so what he is WEARING changes what the
// camera has to frame and what the band has to contain. A hat is not decoration
// as far as the geometry is concerned; it is part of the man.
//
// `wardrobe.ts` was put into `muststamp` for an afternoon to catch this and taken
// back out, because a hash can only say that something changed and the honest
// response to that message is a multi-hour re-measure. This says WHAT is wrong,
// offline, in milliseconds.
//
// FOUR RULES:
//
//   AA1  every lesson's stored figure boxes were grown by the reach of the
//        costume it is actually wearing. Edit `wardrobe.ts` or the assignment
//        without re-running `make:wardrobe` and this is what goes red.
//   AA2  no costume pokes out of its lesson's declared BAND. `mustBox` CLAMPS
//        to the band, so a hat above it is not merely unframed — it is an H59
//        fault, and the camera cannot rescue it.
//   AA3  neighbours in reading order never dress the same. Group Q, applied to
//        the figure instead of to the script.
//   AA4  a GRAVE lesson wears nothing louder than a mortarboard. N11 one medium
//        over: a top hat and monocle on a lesson about slavery is the same
//        insult as a pratfall on one.
//   AA6  NO HAT FLOATS. Every costume with headwear must have a piece that
//        genuinely overlaps the head disc. A reader reported the first version's
//        top hat as "above his head, so it looks like it's floating", and they
//        were describing exact geometry: a brim whose bottom edge sits at y −20
//        is TANGENT to a circle of radius 20 — one point of contact, and a wedge
//        of blank paper either side of it.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { grave } from './lib/liveliness.mjs';
import { STAGE_W } from './lib/mustrule.mjs';
import { SOBER as RULE_SOBER } from './lib/wardroberule.mjs';


const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..');
const DIR = 'components/lesson/cinematic';
const K_FIG = 1.0;

const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href
);
const TMP = path.join(os.tmpdir(), 'ph-ckwardrobe');
fs.mkdirSync(TMP, { recursive: true });
const emit = (rel, name) => {
  const src = transform(fs.readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code
    .replace(/(from\s+['"])\.\/([A-Za-z0-9_-]+)(['"])/g, '$1./$2.mjs$3');
  fs.writeFileSync(path.join(TMP, name), src);
  return pathToFileURL(path.join(TMP, name)).href;
};
const W = await import(emit('components/lesson/cinematic/wardrobe.ts', 'wardrobe.mjs'));
const TABLE = await import(emit('data/lessonWardrobe.ts', 'lessonWardrobe.mjs'));

const side = JSON.parse(fs.readFileSync(path.join(REPO, DIR, 'mustBoxes.ts.json'), 'utf8'));
const route = fs.readFileSync(
  path.join(REPO, 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx'), 'utf8',
);

const lessons = [];
for (const m of route.matchAll(/'([a-z-]+-[a-z]+-(\d+))':\s*([A-Za-z0-9]+)/g)) {
  const comp = m[3].replace(/Lesson$/, '');
  lessons.push({
    id: m[1], n: +m[2], branch: m[1].split('-')[0],
    stem: `${comp[0].toLowerCase()}${comp.slice(1)}`,
  });
}

function bandOf(stem) {
  for (const f of [`${stem}Scene.tsx`, `${stem[0].toUpperCase()}${stem.slice(1)}Lesson.tsx`]) {
    const p = path.join(REPO, DIR, f);
    if (!fs.existsSync(p)) continue;
    const m = fs.readFileSync(p, 'utf8').match(/band=\{\[(\d+),\s*(\d+)\]\}/);
    if (m) return [+m[1], +m[2]];
  }
  return null;
}
function textOf(stem) {
  const p = path.join(REPO, DIR, `${stem}Script.ts`);
  if (!fs.existsSync(p)) return '';
  return [...fs.readFileSync(p, 'utf8')
    .matchAll(/\b(?:text|explain|prompt|cite|reads):\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g)]
    .map((m) => m[2]).join(' ');
}

const SOBER = new Set(RULE_SOBER);
const applied = side.wardrobeReach || {};
const bad = { stale: [], band: [], twins: [], heavy: [], unknown: [], floats: [], visitor: [] };

/**
 * The visitor cues, if any. AA7 checks HIM where he stands, which `fits` cannot:
 * that test measures against the LEAD's recorded boxes, and a visitor stands
 * somewhere else entirely — often near a stage edge, where a wide satchel that
 * cleared the lead's position pokes straight out of the stage.
 */
const VIS = {};
{
  const f = path.join(REPO, 'data/lessonVisitor.ts');
  if (fs.existsSync(f)) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/'([a-z-]+-[a-z]+-\d+)':\s*\{ enter: (\d+), x: (-?\d+)/g)) {
      VIS[m[1]] = { enter: +m[2], x: +m[3] };
    }
  }
}
const preExisting = [];

// AA6 — checked once per COSTUME rather than per lesson: it is a property of the
// geometry, not of who is wearing it.
const HEAD_R = 20;
// Half a unit. A crown may bite INTO the skull as deep as it likes (every hat
// here does, and that is what hides the seam); what it may not do is stop short.
// The tightest honest fit in the wardrobe is wide_brim at 0.22 units proud, so
// anything under half a unit is a rounding difference rather than a gap.
const SEAT_SLACK = 0.5;
for (const c of W.COSTUMES) {
  // HEADWEAR, not everything anchored to the head. A monocle's CHAIN hangs to
  // y +33 and satisfies any overlap test on its own, so with the chain counted
  // `dandy` passed while wearing the very hat a reader called floating. A crown,
  // a brim, a board or a cap is WIDE; a chain, a tassel and its bob are not.
  const head = c.pieces.filter((p) => p.at === 'head' && !p.paper && !p.ring && p.w >= 20 && p.y < 0);
  if (!head.length) continue;
  // The deepest point any head piece reaches. Negative y is up, so the piece that
  // overlaps the skull most is the one with the LARGEST y + h/2.
  const deepest = Math.max(...head.map((p) => p.y + p.h / 2));
  if (deepest < -HEAD_R + 2) {
    bad.floats.push(`${c.id} (${c.label}): its lowest headwear reaches y ${deepest.toFixed(1)}, and the head's crown is at ${-HEAD_R} — it rests on one point, or clear of the head entirely`);
  }

  // AA6b — REACHING THE SKULL IS NOT THE SAME AS SITTING ON IT, and the rule above
  // cannot tell the two apart. It asks only whether some headwear descends far
  // enough to overlap the head; a crown WIDER than the skull overlaps it easily
  // while its own bottom corners bridge open paper. `flat_cap` was 44 across with
  // its bottom edge at −11 — 6.6 units above the −4.4 a 44-wide crown seats at —
  // and passed AA6 for the whole life of the costume, in 42 lessons, reading as a
  // slab balanced on his head. seatY inverts, so this is arithmetic, not taste:
  // a crown's bottom edge belongs at seatY(its own width).
  const crown = head.slice().sort((a, b) => b.h - a.h)[0];
  const bottom = crown.y + crown.h / 2;
  const seat = W.seatY(crown.w, HEAD_R);
  if (seat - bottom > SEAT_SLACK) {
    bad.floats.push(`${c.id} (${c.label}): its crown is ${crown.w} wide with its bottom edge at y ${bottom.toFixed(1)}, `
      + `but a crown that wide seats at ${seat.toFixed(1)} — ${(seat - bottom).toFixed(1)} units of paper under its corners`);
  }

  // AA6c — A PAPER SEAM IS DRAWN LAST, SO IT CUTS WHATEVER IT CROSSES. The seam
  // exists to draw the cap's lower edge where crown and skull would otherwise be
  // one ink mass. Run across a piece that continues BELOW it, it severs that
  // piece instead: flat_cap's peak ran y −14..−10 through a seam at −11 and its
  // base was cut off, so the peak read as a bar floating in the slot.
  //
  // A SEAM IS A HORIZONTAL RULE; A STRAP IS A VERTICAL ONE, and the first draft
  // could not tell them apart — it reported the satchel, whose own `paper` piece
  // is a 2x12 rotated line drawn DOWN the bag to read as a strap. That one is
  // deliberate and severs nothing, because the bag continues either side of it.
  // An edge-drawing seam is wide and thin and unrotated; anything else is a mark.
  // AA6d — A RING MUST TOUCH NOTHING. The one ring in the wardrobe is the monocle,
  // and it only reads as a lens while it is a closed loop hanging in clear paper.
  // Its top edge sat inside the brim band of BOTH hats it is paired with, so on
  // dandy and aesthete alike the lens fused with the brim and read as a handle on
  // the side of his head. This is the silhouette rule again: two objects that
  // touch are one object, and the one they make is not either of them.
  for (const ring of c.pieces.filter((p) => p.ring)) {
    for (const p of c.pieces) {
      if (p === ring || p.paper || p.at !== ring.at) continue;
      const xOver = Math.min(ring.x + ring.w / 2, p.x + p.w / 2) - Math.max(ring.x - ring.w / 2, p.x - p.w / 2);
      const yOver = Math.min(ring.y + ring.h / 2, p.y + p.h / 2) - Math.max(ring.y - ring.h / 2, p.y - p.h / 2);
      // Its own cord is meant to hang out of it; everything else is a collision.
      const isCord = p.w <= 3 && p.h >= ring.h / 2;
      if (xOver > 0 && yOver > 0 && !isCord) {
        bad.floats.push(`${c.id} (${c.label}): its ring overlaps a ${p.w}x${p.h} piece by ${xOver.toFixed(1)}x${yOver.toFixed(1)} units `
          + `— a closed loop touching a bar reads as a handle, not a lens`);
      }
    }
  }

  for (const seam of c.pieces.filter((p) => p.paper && !p.rot && p.w > p.h * 3)) {
    const sT = seam.y - seam.h / 2, sB = seam.y + seam.h / 2;
    for (const p of c.pieces) {
      if (p.paper || p.at !== seam.at) continue;
      const pT = p.y - p.h / 2, pB = p.y + p.h / 2;
      const yOver = Math.min(sB, pB) - Math.max(sT, pT);
      const xOver = Math.min(seam.x + seam.w / 2, p.x + p.w / 2) - Math.max(seam.x - seam.w / 2, p.x - p.w / 2);
      if (yOver > 0 && xOver > 0 && pB > sB + 0.01) {
        bad.floats.push(`${c.id} (${c.label}): its paper seam is ruled across a ${p.w}x${p.h} ink piece that continues `
          + `${(pB - sB).toFixed(1)} units below the seam — the seam is drawn last, so that piece is cut in two`);
      }
    }
  }
}

const byBranch = {};
for (const L of lessons) (byBranch[L.branch] = byBranch[L.branch] || []).push(L);

for (const b of Object.keys(byBranch).sort()) {
  const run = byBranch[b].sort((a, c) => a.n - c.n);
  let prev = null;
  for (const L of run) {
    const [id, secId] = TABLE.WARDROBE[L.id] || [];
    const cos = W.BY_ID[id];
    const sec = W.BY_ID[secId];
    if (!cos || !sec) { bad.unknown.push(`${L.id} → ["${id}", "${secId}"]`); continue; }

    // AA1 — the stored boxes hold the costume they claim to.
    // THE WIDEST COSTUME ON THAT STAGE. `mustBoxes` records one `fig` item per
    // figure and does not say which is which, so the box has to hold the largest.
    const rl = W.reachOf(cos);
    const rs = W.reachOf(sec);
    const want = { up: Math.max(rl.up, rs.up), side: Math.max(rl.side, rs.side) };
    const got = applied[L.id] || { up: 0, side: 0 };
    if (Math.abs(want.up - got.up) > 0.01 || Math.abs(want.side - got.side) > 0.01) {
      bad.stale.push(`${L.id} wears ${id}: boxes grown by up ${got.up.toFixed(0)}/side ${got.side.toFixed(0)}, geometry now wants up ${want.up.toFixed(0)}/side ${want.side.toFixed(0)}`);
    }

    // AA2 — nothing pokes out of the band. Measured against the BARE figure, by
    // taking back off whatever the boxes were already grown by.
    const band = bandOf(L.stem);
    if (band) {
      // ONLY WHAT THE COSTUME ADDS. Two lessons draw the BARE figure outside their
      // own band already — `metaphysics-being-11` by 24 units — and that is an H59
      // fault belonging to the scene, not to the wardrobe. Blaming a hat for it
      // would be a checker that cannot tell the defect it owns from the one next
      // to it, which is how a real finding gets buried under a wrong one. The
      // overflow is REPORTED, and only an overflow the costume causes FAILS.
      for (const items of side.words[L.id] || []) {
        let bare = 0;
        let over = 0;
        for (const it of items || []) {
          if (it.k !== 'fig') continue;
          // A SYNTHETIC VISITOR BOX IS AN OUTPUT, NOT A MEASUREMENT. It was built
          // from the visitor's own costume at his own x; un-growing it by the
          // LEAD's reach and re-growing it here compares two different things and
          // reports the difference as a fault. AA7 checks him properly.
          if (it.v) continue;
          const y = it.b[1] + got.up * K_FIG;
          const x = it.b[0] + got.side * K_FIG;
          const w = it.b[2] - 2 * got.side * K_FIG;
          bare = Math.max(bare, band[0] - y, -x, x + w - STAGE_W);
          over = Math.max(
            over,
            band[0] - (y - want.up * K_FIG),
            want.side * K_FIG - x,
            x + w + want.side * K_FIG - STAGE_W,
          );
        }
        if (bare > 0.5) { preExisting.push(`${L.id} draws the BARE figure ${bare.toFixed(0)} units outside its band (H59, not the wardrobe)`); break; }
        if (over > 0.5) { bad.band.push(`${L.id} (${id}) reaches ${over.toFixed(0)} units outside its band`); break; }
      }
    }

    // AA7 — the visitor, at his own x, with his own costume.
    const cue = VIS[L.id];
    if (cue && band) {
      const rs2 = W.reachOf(sec);
      for (let b = cue.enter; b < (side.words[L.id] || []).length; b += 1) {
        const lead = (side.words[L.id][b] || []).find((it) => it.k === 'fig' && !it.v);
        if (!lead) continue;
        const w = lead.b[2] - 2 * got.side * K_FIG;
        const top = lead.b[1] + got.up * K_FIG;
        const over = Math.max(
          rs2.side * K_FIG - (cue.x - w / 2),
          cue.x + w / 2 + rs2.side * K_FIG - STAGE_W,
          band[0] - (top - rs2.up * K_FIG),
        );
        if (over > 0.5) { bad.visitor.push(`${L.id}: the visitor at x ${cue.x} in ${secId} reaches ${over.toFixed(0)} units past the stage or band`); break; }
      }
    }

    // AA3 / AA4
    if (prev && prev === id && id !== 'plain') bad.twins.push(`${L.id} dresses as the lesson before it (${id})`);
    if (!SOBER.has(id) && grave(textOf(L.stem))) bad.heavy.push(`${L.id} is a grave lesson wearing ${id}`);
    prev = id;
  }
}

console.log('check:wardrobe — the costume and the camera\n');
const worn = lessons.filter((L) => (TABLE.WARDROBE[L.id] || ['plain'])[0] !== 'plain').length;
console.log(`  ${lessons.length} lessons · ${worn} dressed · ${lessons.length - worn} the bare mascot`);

let fails = 0;
const report = (key, rule, note) => {
  const rows = bad[key];
  if (!rows.length) { console.log(`  ok    ${rule}`); return; }
  fails += 1;
  console.log(`  FAIL  ${rule}  — ${rows.length}`);
  for (const r of rows.slice(0, 8)) console.log(`          ${r}`);
  if (rows.length > 8) console.log(`          … and ${rows.length - 8} more`);
  if (note) console.log(`        ${note}`);
};
report('unknown', 'AA  every lesson wears a costume that exists');
report('stale', 'AA1 the stored figure boxes hold the costume', 'run: npm run make:wardrobe');
report('band', 'AA2 no costume reaches outside its lesson band (H59)');
report('twins', 'AA3 neighbours never dress the same (Q)');
report('heavy', 'AA4 a grave lesson wears nothing loud (N11)');
report('floats', 'AA6 no hat floats — headwear overlaps the skull', 'see seatY() in wardrobe.ts');
report('visitor', 'AA7 the visitor fits where he actually stands', 'run: npm run make:visitor && npm run make:wardrobe');

if (preExisting.length) {
  console.log(`\n  ~ ${preExisting.length} lesson(s) already draw the BARE figure outside their own band.`);
  console.log('    That is H59 and belongs to the scene, not to the wardrobe — reported so it is');
  console.log('    not lost, and not failed here so it cannot bury a real costume defect:');
  for (const r of preExisting) console.log(`      ${r}`);
}
console.log(fails ? `\n✗ ${fails} rule(s) broken` : '\nall clear');
process.exit(fails ? 1 : 0);
