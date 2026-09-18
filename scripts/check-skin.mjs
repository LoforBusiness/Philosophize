// ─────────────────────────────────────────────────────────────────────────────
// THE PICTURE KEEPS THE APP'S DEPTH KIT (group AG).
//
//   npm run check:skin
//
// The owner asked for the lessons to look like the rest of the app — *"that
// gamified, that really clean, gamified depth look"* — and chose white tile faces
// from three rendered options. `skin-stage` applied it to 239 scenes in one pass.
// This is what stops it drifting back one scene at a time, which is how the corpus
// came to have 237 scenes using STONE and four using SHADE before T7.
//
// It is all static, so it costs milliseconds: the kit is four decorations in one
// zero-import module, and a scene either reads them or it does not.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { skinScene } from './skin-stage.mjs';

const DIR = 'components/lesson/cinematic';
const SKIN = fs.readFileSync(path.join(DIR, 'stageSkin.ts'), 'utf8');
const STICK = fs.readFileSync(path.join(DIR, 'Stickman.tsx'), 'utf8');

let bad = 0;
const rule = (ok, msg, detail = '') => {
  if (ok) console.log(`  ok  ${msg}${detail ? `  ${detail}` : ''}`);
  else { bad += 1; console.log(`  ✗   ${msg}${detail ? `  ${detail}` : ''}`); }
};

console.log('THE STAGE\'S DEPTH KIT (group AG)\n');

// ── 1 · the kit itself ───────────────────────────────────────────────────────
rule(/export const PLATE_FACE = '#FFFFFF'/.test(SKIN),
  'a tile\'s face is white, as the owner chose from the three renders');
rule(/inset 0px 1\.5px 0px rgba\(255, 255, 255, 0\.85\)/.test(SKIN),
  'a plate is lit along its top edge, from inside its own box');
rule(/0px 4px 0px \$\{tone\.SHADE\}/.test(SKIN),
  'and stands on a hard ledge of its own shaded tone — not a blur');
rule(/borderRadius: h \/ 2/.test(SKIN) && /34 \* k/.test(SKIN),
  'the shadow under a figure is a PILL, sized from his own scale',
  'Duolingo: "never an oval, because ovals imply perspective"');
rule(/borderTopWidth: 1\.5/.test(SKIN) && /inset 0px -7px 0px \$\{tone\.SHADE\}/.test(SKIN),
  'the ground is a band with a lit near edge and a shaded foot');
// ZERO REACT, like `rig.ts` and `tone.ts`, so a checker can read it in plain Node.
rule(!/from 'react|StyleSheet/.test(SKIN), 'the kit imports no React and no StyleSheet');

// ── 2 · the figure stands on something ───────────────────────────────────────
rule(/pill: pillStyle\(k\)/.test(STICK) && /S\.pill, a\.pill/.test(STICK),
  'every figure in every lesson draws his own pill shadow');
rule(STICK.indexOf('S.pill, a.pill') < STICK.indexOf('S.limbBone, a.thighL'),
  'and draws it BEFORE any limb, so he stands in front of it');

// ── 3 · every scene reads the kit ────────────────────────────────────────────
const scenes = fs.readdirSync(DIR).filter((f) => f.endsWith('Scene.tsx'));
const unskinned = [];
const toSkin = [];
const tanTiles = [];
const oldLip = [];
const rawFloor = [];
for (const f of scenes) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  if (!/stageTone\(/.test(src)) continue;                       // no tone, no skin
  // NOT "does it import the kit" — 5 scenes have a tone and nothing for the kit to
  // do (no plate, no floor, no ledge), and requiring the import of them reported a
  // clean corpus as broken. The codemod itself is the authority: a scene is
  // unskinned when running it would still change something.
  if (!/from '\.\/stageSkin'/.test(src)) {
    const r = skinScene(src.replace(/\r\n/g, '\n'));
    if (!r.skip) { unskinned.push(f); toSkin.push(f); }
    continue;
  }
  if (/const LIP = `0px 3px 0px \$\{SHADE\}`/.test(src)) oldLip.push(f);
  if (/floor:\s*\{\s*position:\s*'absolute',\s*left:\s*0,\s*right:\s*0,\s*top:\s*GROUND,\s*bottom:\s*0,\s*backgroundColor:\s*RULE/.test(src)) rawFloor.push(f);
  // A TILE THAT WENT BACK TO A TONED FACE. The pairing is the one `skin-stage`
  // uses: a bordered, rounded box that centres a word. A mass is exempt by
  // construction, which is why this reads the same three properties and not a name.
  for (const m of src.matchAll(/\{[^{}]*backgroundColor:\s*STONE\b[^{}]*\}/g)) {
    const b = m[0];
    if (!/borderColor:\s*INK\b/.test(b)) continue;
    if (!/borderRadius/.test(b)) continue;
    if (!/(alignItems|justifyContent):\s*'center'/.test(b)) continue;
    const h = b.match(/height:\s*(\d+(?:\.\d+)?)/);
    if (h && Number(h[1]) > 96) continue;
    tanTiles.push(f);
    break;
  }
}
rule(!unskinned.length, 'every scene the kit has something to do in reads it',
  unskinned.length ? `run skin-stage on ${unskinned.slice(0, 6).join(', ')}` : '');
rule(!oldLip.length, 'no scene declares the old un-lit ledge',
  oldLip.length ? oldLip.slice(0, 6).join(', ') : '');
rule(!rawFloor.length, 'no scene lays a flat floor with no edges',
  rawFloor.length ? rawFloor.slice(0, 6).join(', ') : '');
// A RATCHET, NOT A ZERO, AND THE NUMBER IS THE CAP'S DOING RATHER THAN A SHORTFALL.
//
// A white face SPENDS a tonal mass (`masscount`), and `check:shade` holds every
// scene to three. So a scene with nothing spare keeps its toned tiles — which is
// the correct answer rather than a compromise, because a white card needs something
// to read against (political7's charter on its stone tablet).
//
// Lowering it therefore means giving one of those scenes another MASS, not painting
// its tile white: the two rules are answering the same question from opposite ends.
const TAN_BUDGET = 47;
rule(tanTiles.length <= TAN_BUDGET,
  `${tanTiles.length} scene(s) still put a word on a toned tile  budget ${TAN_BUDGET}`,
  tanTiles.length > TAN_BUDGET ? tanTiles.slice(0, 8).join(', ') : '');
if (tanTiles.length < TAN_BUDGET) console.log(`      lower TAN_BUDGET to ${tanTiles.length}`);

console.log(bad ? '\nfailed.' : '\nall clear.');
process.exit(bad ? 1 : 0);
