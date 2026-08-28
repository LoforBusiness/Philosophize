// HOW MANY TONAL MASSES DOES A SCENE ACTUALLY PUT ON THE STAGE?
//
// A reader named the two lessons they liked most — `political7` (Where Rights
// Come From) and `political8` (the fence) — and asked for what those have:
//
//   "I really like all the animations, all of the artwork and everything that
//    moves … the idea of adding different dark shading in there that the political
//    philosophy lesson has. It looks really good when there's different contrasts
//    of darker shading."
//
// Counted, the difference is exact, and it turns out not to be about animation at
// all. Those two scenes lay down ten and seven FILLED masses at intermediate
// values. Most of the corpus lays down one. A scene with one tone is an outline
// diagram on white — two values and no depth; a scene with four or five reads as
// objects standing in a space, which is the whole of what was being asked for.
//
// So this counts it, prints the flattest lessons in reading order so the work is
// pickable, and ratchets — the number of scenes below the floor may only go DOWN.
// Same shape as CARD_BUDGET and SOLID_FLOOR in check-cinematic (§5): the corpus is
// improved a batch at a time and cannot slip back between batches.
//
//   npm run check:shade
//
// It is a source count, so it costs milliseconds and needs no browser.
//
// ── AND IT HOLDS THE ONE RULE THE TONES COME WITH ───────────────────────────
//
// Type on a tone is INK. SOFT measures 5.1:1 on paper and 3.26:1 on STONE, 2.10:1
// on SHADE — under the floor, on a colour that passed its own check. That is the
// identical trap §19 records three times for metal tones reaching onto paper, and
// it is the one way these three greys could make a lesson WORSE rather than
// better, so it is checked rather than remembered.
import fs from 'node:fs';
import path from 'node:path';
import { softOnToneByBox } from './lib/tonefit.mjs';
import { softOnToneByNest } from './lib/tonenest.mjs';

const DIR = 'components/lesson/cinematic';

/**
 * The fills that count as a MASS, in order of weight.
 *
 * PAPER is not one: a white card is the absence of a tone, which is exactly why
 * political7's charter reads against its stone tablet. INK is not one either —
 * every scene already has ink, and a scene of ink and white is the flat case this
 * exists to find.
 */
const MASSES = ['RULE', 'STONE', 'SHADE', 'SOFT'];

/** Tones no SOFT text may sit on — derived from the ramp, not typed twice. */
const TOO_DARK_FOR_SOFT = ['STONE', 'SHADE', 'SOFT', 'INK'];

/**
 * THE FLOOR, AND IT IS A HIGH-WATER MARK.
 *
 * How many scenes are allowed to draw fewer than MIN_MASSES tonal fills. It may
 * only ever go DOWN — raising it is how "we will come back to it" becomes never.
 * 184 scenes, 81 of them at one mass and 48 at two when this was written; the
 * first batch of eighteen — three per branch, the flattest in reading order —
 * took it to 112.
 */
const MIN_MASSES = 3;
const FLAT_BUDGET = 0;

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('Scene.tsx')).sort();

/** Strip comments, for the reason L8 gives: a comment that quotes a fill is not a fill. */
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const rows = [];
const softOnTone = [];
for (const f of files) {
  const src = strip(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const used = new Map();
  for (const m of src.matchAll(/backgroundColor:\s*([A-Z_][A-Z_0-9]*)/g)) {
    if (MASSES.includes(m[1])) used.set(m[1], (used.get(m[1]) ?? 0) + 1);
  }
  const fills = [...used.values()].reduce((a, b) => a + b, 0);
  rows.push({ id: f.replace('Scene.tsx', ''), fills, tones: used.size, used });

  // SOFT type inside a style object that also carries a dark fill. Style objects
  // are the unit because a fill and its text colour live in different ones — this
  // catches the common shape, where a scene declares `slab: { backgroundColor:
  // STONE }` and `slabText: { color: SOFT }` right beside it.
  for (const m of src.matchAll(/(\w+):\s*\{([^{}]*backgroundColor:\s*([A-Z_][A-Z_0-9]*)[^{}]*)\}/g)) {
    if (!TOO_DARK_FOR_SOFT.includes(m[3])) continue;
    // A FILL ONLY CARRIES TEXT IF IT IS BIG ENOUGH TO. `political32`'s `mark` is a
    // 3.5 × 22 tick with its label printed BELOW it on a `marginTop`, and the first
    // version of this rule reported it as cream-on-ink. A box that cannot hold a
    // word is not a ground for one.
    const w = /\bwidth:\s*(\d+(?:\.\d+)?)/.exec(m[2]);
    const h = /\bheight:\s*(\d+(?:\.\d+)?)/.exec(m[2]);
    if (w && +w[1] < 24) continue;
    if (h && +h[1] < 12) continue;
    const sib = new RegExp(`${m[1]}Text:\\s*\\{[^{}]*color:\\s*SOFT`, 'm');
    if (sib.test(src)) softOnTone.push(`${f}  ${m[1]} is ${m[3]} and ${m[1]}Text is SOFT`);
  }

  // AND THE SAME RULE BY GEOMETRY, because the pairing above depends on somebody
  // naming the caption after the fill. epistemology23 calls the hopper caption
  // `hopText`, so toning the hopper produced a 3.26:1 caption that this file
  // called clean. Overlap is what is actually true.
  for (const hit of softOnToneByBox(fs.readFileSync(path.join(DIR, f), 'utf8'), f)) {
    if (!softOnTone.some((x) => x.startsWith(hit.split('  ')[0]) && x.includes(hit.split(' is ')[0].split('  ').pop()))) softOnTone.push(hit);
  }

  // AND A THIRD TIME BY THE TREE, because the two above met on one style and
  // both missed it. ethics31's lamp is `lampBox` filled STONE with `lampOff`
  // inside it: the name rule wants `lampBoxText`, and the box rule needs
  // coordinates, which `lampOff` has none of — it is position:'absolute' and
  // centred by its parent. It shipped at 3.26:1 in one state and 3.27:1 in the
  // other while this file printed that no SOFT type sits on a tone.
  //
  // A word is on whatever its nearest painted ANCESTOR paints. That is what the
  // other two were approximating, and it is the one of the three with no blind
  // spot — it needs neither a naming convention nor a resolvable box.
  for (const hit of softOnToneByNest(fs.readFileSync(path.join(DIR, f), 'utf8'), f)) {
    const who = hit.split('  ')[1].split(' is ')[0];
    if (!softOnTone.some((x) => x.startsWith(f) && x.includes(who))) softOnTone.push(hit);
  }
}

rows.sort((a, b) => a.fills - b.fills || a.id.localeCompare(b.id));
const flat = rows.filter((r) => r.fills < MIN_MASSES);

console.log('\nTONAL MASS ON THE STAGE\n');
const hist = new Map();
for (const r of rows) hist.set(r.fills, (hist.get(r.fills) ?? 0) + 1);
const keys = [...hist.keys()].sort((a, b) => a - b);
console.log(`  ${rows.length} scenes · fills per scene:`);
for (const k of keys) console.log(`      ${String(k).padStart(2)} ${'█'.repeat(Math.min(60, hist.get(k)))} ${hist.get(k)}`);

const best = rows.slice().sort((a, b) => b.fills - a.fills).slice(0, 4);
console.log(`\n  the richest: ${best.map((r) => `${r.id} (${r.fills})`).join(' · ')}`);
console.log(`  the two the reader named: political7 (${rows.find((r) => r.id === 'political7')?.fills}) · political8 (${rows.find((r) => r.id === 'political8')?.fills})`);

console.log(`\n  ${flat.length} scene(s) draw fewer than ${MIN_MASSES} tonal fills, budget ${FLAT_BUDGET}`);
if (flat.length) {
  console.log('  the flattest, which are the ones to do next:');
  for (const r of flat.slice(0, 12)) console.log(`      ${r.id.padEnd(22)} ${r.fills} fill(s)  ${[...r.used.keys()].join(', ') || '—'}`);
  if (flat.length > 12) console.log(`      … and ${flat.length - 12} more`);
}

console.log('');
for (const m of softOnTone) console.log(`  FAIL  ${m}`);
console.log(softOnTone.length
  ? '  SOFT is 3.26:1 on STONE and 2.10:1 on SHADE. Type on a tone is INK.'
  : '  ok    no SOFT type sits on a tone it cannot be read against');

const over = flat.length > FLAT_BUDGET;
console.log(`  ${over ? 'FAIL' : 'ok  '}  the flat count is a high-water mark  ${flat.length} of ${FLAT_BUDGET}`);
if (over) console.log('\n  a scene got flatter, or a new one arrived with one tone. Give it masses (see cinematicKit).');
else if (flat.length < FLAT_BUDGET) console.log(`\n  lower FLAT_BUDGET to ${flat.length} in scripts/check-shade.mjs — a budget that still says the old number is a debt.`);
console.log('');
process.exit(over || softOnTone.length ? 1 : 0);
