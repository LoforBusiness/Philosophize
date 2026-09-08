//   node scripts/pick-bubble-work.mjs
//
// Which lessons the bubble harness should look at, now that a lesson shows two
// thoughts rather than six: the ones whose figure walks FURTHEST on a beat that
// still carries one, so the follow rule has something to measure at all.
import { loadTs } from './lib/loadts.mjs';
import { walkOf, sceneOf } from './lib/scenefig.mjs';
import { corpus } from './lib/gestures.mjs';

const { THOUGHTS } = await loadTs('data/lessonThoughts.ts');
const L = corpus();
const rows = [];
let unwired = 0;
for (const l of L) {
  const row = THOUGHTS[l.id];
  if (!row) continue;
  const walk = await walkOf(l.id);
  if (!walk) continue;
  // ONLY SCENES THAT HAND THE PLAYER THEIR TRACK. `CinematicPlayer` derives the
  // live figure x from `walk={X}`, so in a scene that declares X and never passes
  // it the bubble CANNOT follow him — `figX` reports 0 and the box rests where it
  // was measured. That is a real gap and a separate one; putting such a lesson in
  // this worklist would fail the follow rule for a reason the bubble cannot fix.
  if (!/walk=\{X\}/.test(sceneOf(l.id) || '')) { unwired += 1; continue; }
  let best = 0; let at = -1;
  row.at.forEach((a, i) => {
    if (!a || !row.say[i] || l.beats[i].graded || i === 0) return;
    const d = Math.abs((walk[i] ?? 0) - (walk[i - 1] ?? 0));
    if (d > best) { best = d; at = i; }
  });
  if (at >= 0) rows.push({ id: l.id, walk: Math.round(best), at, n: row.at.filter((a, i) => a && row.say[i] && !l.beats[i].graded).length });
}
rows.sort((a, b) => b.walk - a.walk);
console.log('top walks under a shown thought:');
for (const r of rows.slice(0, 14)) console.log(`  '${r.id}',`.padEnd(34) + `// ${r.walk} units, beat ${r.at}`);
console.log(`\n${rows.filter((r) => r.walk > 55).length} lessons walk more than 55 units under a thought`);
// SAID OUT LOUD. 86 scenes declare an X track and never hand it to the player; 83
// of those never move the figure, so there is nothing to follow and nothing is
// wrong. THREE do walk him — metaphysics-being-2, ethics-ethics-5 and
// aesthetics-aesthetics-17 — and in those the bubble cannot follow, because the
// player derives the live figure x from that prop and reports 0 without it. (The
// footfalls do not sound there either: same prop, same cause.) Excluded here so
// the follow rule is not failed for a reason the bubble cannot fix, and named so
// the gap is a known three rather than a silent absence.
console.log(`${unwired} scene(s) declare an X track and never pass it to the player — excluded`);
