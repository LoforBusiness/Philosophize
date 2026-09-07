// GIVE EVERY EXTRA FIGURE ITS ROLE.
//
//   node scripts/make-figure-roles.mjs
//
// A scene mounts `<Stickman D={…} k={K_FIG} />` once per figure, and without a
// role they all read the LEAD's costume out of the wardrobe context. Left alone,
// `aesthetics7`'s two figures came out as identical dandies — twins in matching
// top hats, which is worse than both being plain, because it draws the eye to a
// coincidence rather than to a difference.
//
// ── THE PRINCIPAL IS NAMED, NOT POSITIONAL ──────────────────────────────────
//
// The first version of this assigned by MOUNT ORDER, and the mount order is
// paint order rather than importance. It made a citizen the lead of
// `politicalScene` and gave the SOVEREIGN — the one figure in that scene who
// should obviously be in a top hat — the crowd's empty costume. `political9`
// had the same shape.
//
// The corpus has a naming convention and it is reliable: the principal figure's
// bundle is `DF` (or `OF`, or `DSov` where the scene names its subject). So the
// principal is found BY NAME and dressed as the lead; a second figure in a
// two-hander is the opposing position and gets the second costume; three or more
// are a crowd and wear nothing.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
/** The bundle names a scene gives its subject. */
const PRINCIPAL = /^(DF|OF|DSov|F|FIG)$/;

/**
 * AND WHERE THE NAME RULE HAS NOTHING TO GO ON, THE ANSWER IS AUTHORED.
 *
 * 12 of the 20 two-figure scenes call their bundles something outside PRINCIPAL,
 * and the fallback below is MOUNT ORDER — paint order, which is not importance.
 * It made the DEMON the lead of epistemology2 over the doubter the reader is
 * standing in for, and after AA5b wired the reaction to the lead it would have
 * had that demon nodding approvingly at a correct answer: the picture
 * contradicting the lesson (A1).
 *
 * THE RULE, stated once so the twelve are not twelve separate opinions:
 *
 *   THE LEAD IS THE FIGURE THE READER IS STANDING IN FOR. Where neither figure is
 *   — two named positions arguing, two men swapping memories — it is the figure
 *   the COMPOSITION is built around, and the choice is pinned here rather than
 *   left to whoever is painted first.
 *
 * This decides two visible things: which figure wears the lead costume, and which
 * one answers you back.
 */
const LEAD = {
  // The reader is the one the art arrives at, not the one who made it.
  aesthetics2: 'DV',      // artist | VIEWER — Tolstoy's chain ends at the viewer
  aesthetics4: 'DV',      // artist | VIEWER — the artworld confers, and the reader is it
  aesthetics12: 'RF',     // poet | READER — the lesson is "Who Decides What Art Means?"
  epistemology2: 'DD',    // demon | DOUBTER — the demon is the antagonist deceiving them
  ethics32: 'DB',         // knower | BORROWER — the reader is the one borrowing a verdict
  logic32: 'DB',          // asker | CORNERED — the reader is the one asked the loaded question
  political2: 'DS',       // ruler | SUBJECT — the reader is governed, not governing
  // Neither figure is the reader; pinned to the composition's subject so that the
  // choice is recorded rather than guessed. Each already matched the guess.
  epistemology4: 'DE',    // empiricist | rationalist — symmetric; the empiricist opens
  ethics4: 'DA',          // two positions on one bar chart — symmetric
  ethics6: 'DD',          // the DECIDER is the reader at the footbridge
  metaphysics11: 'PF',    // prince | cobbler — the MEMORIES plate starts on the prince
  political3: 'DS',       // the SUBJECT is the reader; already correct
};

let files = 0;
let marked = 0;
const report = [];
const guesses = [];

for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Scene.tsx'))) {
  const p = path.join(DIR, f);
  const src = fs.readFileSync(p, 'utf8');
  const hits = [...src.matchAll(/<Stickman\b([^>]*?)D=\{([A-Za-z0-9_]+)\}/g)];
  if (hits.length < 2) continue;

  const names = hits.map((h) => h[2]);
  const stem = f.replace('Scene.tsx', '');
  const authored = LEAD[stem] ? names.indexOf(LEAD[stem]) : -1;
  if (LEAD[stem] && authored < 0) {
    console.error(`${f}: LEAD says '${LEAD[stem]}' but this scene mounts ${names.join(', ')}`);
    process.exitCode = 1;
    continue;
  }
  let lead = authored >= 0 ? authored : names.findIndex((n) => PRINCIPAL.test(n));
  // AND WHEN THE NAME RULE FINDS NOTHING, IT FALLS BACK TO MOUNT ORDER — WHICH IS
  // THE VERY THING THE HEADER ABOVE SAYS WAS WRONG. `PRINCIPAL` lists five names,
  // and 12 of the 20 two-figure scenes call their bundles something else, so for
  // those the "principal" was decided by paint order after all, silently. It got
  // one plainly wrong: epistemology2 names its figures DM and DD, so the DEMON —
  // the antagonist who is deceiving the reader — was made the lead over the
  // doubter who stands in for them.
  //
  // The guess is still made, because a role is better than none and refusing
  // would leave those scenes' second figures reading the lead's costume. But it
  // is now REPORTED rather than silent: a guess a person can see is a guess a
  // person can correct, and a list of twelve is short enough to work through.
  const guessed = lead < 0;
  if (guessed) lead = 0;

  // The one other figure in a two-hander is the argument's other side. In a
  // crowd, everybody who is not the principal is the crowd.
  const roles = names.map((_, i) => {
    if (i === lead) return null;
    if (hits.length === 2) return 'second';
    return 'crowd';
  });

  // STRIP FIRST, THEN WRITE. The original only ADDED a role where none was
  // present, which is right while the lead never changes and useless the moment
  // it does: an authored lead could never take over from a guessed one, because
  // the guessed one's `role=` was already there and every mount was skipped.
  // Clearing them makes this idempotent in both directions.
  let out = src.replace(/(<Stickman)\s+role="[a-z]+"/g, '$1');
  // Stripping does not reorder the mounts, so index i still names the same
  // bundle it did in `names` — asserted rather than assumed.
  const fresh = [...out.matchAll(/<Stickman\b([^>]*?)D=\{([A-Za-z0-9_]+)\}/g)];
  if (fresh.length !== names.length || fresh.some((h, i) => h[2] !== names[i])) {
    console.error(`${f}: mounts changed while stripping roles — refusing to write`);
    process.exitCode = 1;
    continue;
  }
  for (let i = fresh.length - 1; i >= 0; i -= 1) {
    if (!roles[i]) continue;
    const cut = fresh[i].index + '<Stickman'.length;
    out = `${out.slice(0, cut)} role="${roles[i]}"${out.slice(cut)}`;
    marked += 1;
  }
  if (guessed) guesses.push(`  ${f.replace('Scene.tsx', '').padEnd(18)} lead ${names[lead]} (mounted first) over ${names.filter((_, i) => i !== lead).join(', ')}`);
  if (out !== src) {
    fs.writeFileSync(p, out);
    files += 1;
    report.push(`  ${f.replace('Scene.tsx', '').padEnd(16)} lead ${names[lead]}  ·  ${names.filter((_, i) => roles[i]).map((n, i) => `${n}=${roles.filter(Boolean)[i]}`).join(' ')}`);
  }
}
console.log(`${marked} extra figure(s) given a role across ${files} scene(s)\n`);
for (const r of report) console.log(r);

if (guesses.length) {
  console.log(`\n${guesses.length} scene(s) had NO principal name to go on, so the lead is PAINT ORDER:\n`);
  for (const g of guesses) console.log(g);
  console.log(`
  These decide which figure wears the lead costume. Paint order is not importance
  — it once made a citizen the lead of politicalScene and handed the sovereign the
  crowd's empty costume, and it made the DEMON the lead of epistemology2 over the
  doubter who stands in for the reader. Read each one and, where the guess is
  wrong, name the principal bundle DF (or OF/DSov/F/FIG) so this stops guessing.`);
}
