// GROUP AA — WHAT THE FIGURE WEARS: EVERY COSTUME PIECE SITS ON HIM PROPERLY.
//
// AA rather than a single letter because A–Z are used. Group N is what the figure
// DOES, group Y is his relationship to the world around him, and neither covers what
// he has ON.
//
//   node scripts/check-wardrobe.mjs
//
// THE COSTUME ROTATION IS GONE (2026-10-02). This file used to hold it too — AA1
// (the stored must-boxes grown by the costume's reach), AA2 (no costume past the
// band), AA3 (neighbours never dress alike), AA4 (a grave lesson dressed soberly),
// AA7 and AA10 (the visiting second figure) — all of them about the per-lesson
// costume table and the visitor that the narrated library carried. Both went with
// it. A dialogue lesson dresses each speaker in its own scene from the cast
// (`wear={BY_ID.….pieces}`), and check:dialogue (AP2) holds that.
//
// WHAT STAYS IS THE GEOMETRY OF THE PIECES, because the cast wears them:
//
//   AA6  NO HAT FLOATS. Every costume with headwear must have a piece that
//        genuinely overlaps the head disc. A reader reported the first version's
//        top hat as "above his head, so it looks like it's floating", and they
//        were describing exact geometry: a brim whose bottom edge sits at y −20
//        is TANGENT to a circle of radius 20 — one point of contact, and a wedge
//        of blank paper either side of it. (AA6b–d: a crown seats at its own
//        width, a paper seam severs nothing, a ring touches nothing.)
//   AA11 every costume fits the slots the figure draws, ink before paper.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..');
const DIR = 'components/lesson/cinematic';

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

const bad = { floats: [], slots: [] };

// AA6 — checked once per COSTUME rather than per lesson: it is a property of the
// geometry, not of who is wearing it.
const HEAD_R = 20;
// Half a unit. A crown may bite INTO the skull as deep as it likes (every hat
// here does, and that is what hides the seam); what it may not do is stop short.
// The tightest honest fit in the wardrobe is wide_brim at 0.22 units proud, so
// anything under half a unit is a rounding difference rather than a gap.
const SEAT_SLACK = 0.5;

// AA11 — A COSTUME HAS NO MORE PIECES THAN THE FIGURE HAS SLOTS. Stickman draws a
// costume through a FIXED number of hooks (WORN_SLOTS) and drops whatever is past it
// without a word, and this sheet-and-check side draws every piece — so an eleven-piece
// suit looked complete here and would have reached a phone as a bun and two shoulders.
{
  const stick = fs.readFileSync(path.join(REPO, DIR, 'Stickman.tsx'), 'utf8');
  const m = /const WORN_SLOTS = ([0-9]+);/.exec(stick);
  if (!m) bad.slots.push('Stickman.tsx declares no WORN_SLOTS to hold a costume to');
  else for (const c of W.COSTUMES) {
    if (c.pieces.length > +m[1]) bad.slots.push(`${c.id} has ${c.pieces.length} pieces and the figure draws ${m[1]}`);
    // PAPER is drawn over the ink it separates, so it has to come after it.
    const firstPaper = c.pieces.findIndex((q) => q.paper);
    if (firstPaper >= 0 && c.pieces.slice(firstPaper).some((q) => !q.paper && q.at !== 'handR' && q.at !== 'handL' && !q.ring)) {
      bad.slots.push(`${c.id} lists an ink piece after a paper one; the ink would cover the line`);
    }
  }
}
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

console.log('check:wardrobe — every costume piece sits on him properly\n');
console.log(`  ${W.COSTUMES.length} costumes`);

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
report('floats', 'AA6 no hat floats — headwear overlaps the skull', 'see seatY() in wardrobe.ts');
report('slots', 'AA11 every costume fits the slots the figure draws, ink before paper');
console.log(fails ? `\n✗ ${fails} rule(s) broken` : '\nall clear');
process.exit(fails ? 1 : 0);
