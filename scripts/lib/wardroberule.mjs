// WHO WEARS WHAT ON A GIVEN STAGE — one definition, three readers.
//
// `make-wardrobe` grows the must-see boxes by it, `check-wardrobe` verifies them
// against it, and `wardrobeContext.tsx` dresses the figures by it at runtime.
// Three copies of this arithmetic is exactly the shape `check:names` already
// guards against ("one rule, two readers, asserted rather than commented"), so
// the two scripts import it and the check ASSERTS that the component's copy of
// the roll still matches.
import fs from 'node:fs';
import path from 'node:path';

/**
 * The order a second figure's costume is picked from.
 *
 * Must stay identical to `ROLL` in components/lesson/cinematic/wardrobeContext.tsx.
 * `sameRollAs` below is what makes that a build failure rather than a comment.
 */
export const ROLL = ['dandy', 'scholar', 'magistrate', 'traveller', 'aesthete', 'gent', 'ringmaster', 'lecturer', 'stroller'];

/**
 * The second figure's look, derived from the lead's.
 *
 * Stepping a fixed distance through the roll makes it differ from the lead AND
 * from the lead's neighbours — otherwise the visitor in lesson 9 is dressed as
 * the mascot in lesson 10, which reads as the same figure having wandered in.
 */
export function secondFor(leadId) {
  const i = ROLL.indexOf(leadId);
  // A lead of `plain` is not in the roll, and its second should be the loudest
  // thing in the lesson — that is the whole point of another figure being there.
  return i < 0 ? 'dandy' : ROLL[(i + 4) % ROLL.length];
}

/** Does the component still use the same roll? */
export function sameRollAs(componentSrc) {
  const m = componentSrc.match(/const ROLL = \[([^\]]*)\]/);
  if (!m) return 'wardrobeContext.tsx has no ROLL to compare against';
  const theirs = [...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]);
  return theirs.join(',') === ROLL.join(',')
    ? null
    : `wardrobeContext.tsx ROLL is [${theirs.join(' ')}], this file has [${ROLL.join(' ')}]`;
}

/**
 * The widest costume a scene actually puts on stage.
 *
 * `mustBoxes` records one `fig` item per figure and does not say which figure is
 * which, so a box has to be grown by the LARGEST costume present. A scene with a
 * `role="second"` figure may put a bigger hat on stage than its lead wears;
 * over-growing a crowd figure's box by a few units costs a little zoom, and
 * under-growing the second's crops a hat.
 */
export function widestOn(dir, stem, leadId, reachOf, byId) {
  const lead = reachOf(byId[leadId] || { pieces: [] });
  const p = path.join(dir, `${stem}Scene.tsx`);
  if (!fs.existsSync(p)) return lead;
  if (!/role="second"/.test(fs.readFileSync(p, 'utf8'))) return lead;
  const sec = reachOf(byId[secondFor(leadId)] || { pieces: [] });
  return { up: Math.max(lead.up, sec.up), side: Math.max(lead.side, sec.side) };
}
