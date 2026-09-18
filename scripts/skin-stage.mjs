// THE PICTURE TAKES THE APP'S DEPTH KIT (group AG).
//
//   node scripts/skin-stage.mjs                     report
//   node scripts/skin-stage.mjs --only=political7,logic9 --write
//   node scripts/skin-stage.mjs --write             all of them
//
// Three edits per scene, and NONE of them moves a box — a radius, a shadow and a
// colour are the only things a stage can be given for free, which is what makes
// this affordable at all: the must-box stamps are renewed by proof
// (`restamp-lip`'s pattern) rather than by hours of re-measuring.
//
//   1. THE GROUND becomes a band with two edges rather than a flat fill: a lit
//      hairline along the top where the light catches the near edge, and the tone's
//      own SHADE along the foot where the floor turns away. 172 scenes lay the
//      identical floor, so it becomes one shared style (`stageSkin.floorStyle`).
//   2. THE LEDGE under a plate gains an ink drop below its hard shaded band, so the
//      plate casts onto what it stands on instead of only having a dark side.
//   3. THE CORNERS of a toned plate come up to `PLATE_RADIUS`, unless the plate is
//      small enough that rounding it would turn it into a capsule, or has drawn its
//      own corners on purpose.
//
// What it deliberately does NOT touch: a border WIDTH (that moves the content area
// inside the plate and can re-wrap a word — `check:fits`' whole subject), a tone
// (the luminance contract in `stageTones` is what keeps 244 scenes' captions
// legible), and anything a scene has already skinned.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { entriesOf, constsOf, valueOf } from './lip-stage.mjs';
import { massFills, MIN_MASSES } from './lib/masscount.mjs';

const DIR = 'components/lesson/cinematic';
const RADIUS = 8;

/** The import the codemod adds, and the tone handle the skin needs. */
const IMPORT = "import { floorStyle, lipOf, PLATE_FACE } from './stageSkin';";
const OLD_LIP = /^const LIP = `0px 3px 0px \$\{SHADE\}`;.*$/m;

/** The canonical floor, as `lip-stage` and the tonal pass left it in 172 scenes. */
const FLOOR_RE = /floor:\s*\{\s*position:\s*'absolute',\s*left:\s*0,\s*right:\s*0,\s*top:\s*GROUND,\s*bottom:\s*0,\s*backgroundColor:\s*RULE\s*,?\s*\}/;

/**
 * IS THIS STYLE A TILE — something that carries a word — rather than a MASS?
 *
 * The owner chose white faces for the tiles, and a mass must keep its tone: a white
 * stone is not a stone (A1), and `check:shade` counts filled tonal masses per scene,
 * so turning one white would delete it from the count.
 *
 * Told apart by CONSTRUCTION, not by name. A tile is bordered in ink, rounded,
 * small enough to hold a caption rather than to be scenery, and it CENTRES its
 * content — which is what a labelled box does and what a wall, a hull or a hill
 * never does. Anything whose size cannot be resolved is left alone.
 */
const SCENERY = /(wall|hill|stone|rock|hull|slab|block|mound|cliff|roof|tower|trunk|mass|ground|floor|earth|bed|pit|drum|barrel|cask|crate|body|head|leg|arm|torso|sky|sea|water|cloud|shelf|bench|table|desk|door|plinth|column|pillar|brick|step|stair|machine|hopper|chute|tray|funnel|pipe|vat|urn|jar|pot|bowl|cheese|bull|hen|zebra|cat|crow|bird|beast|heap|ash|pile|dust|track|rail|belt|conveyor|sack|bag|loaf|cake|brickwork|mud|sand)/i;

function tile(name, body, t, kin) {
  if (!/backgroundColor:\s*STONE\b/.test(body)) return false;
  if (!/borderColor:\s*INK\b/.test(body)) return false;
  if (!/borderRadius/.test(body)) return false;
  // AND IT MAY NOT BE SCENERY BY NAME. No size test can tell a 90-unit labelled
  // tile from a 90-unit stone, and a white stone is not a stone (A1).
  if (SCENERY.test(name)) return false;
  const w = valueOf(body, 'width', t);
  const h = valueOf(body, 'height', t);
  if (h != null && h > 96) return false;
  if (w != null && w > 190) return false;
  if (h != null && h < 14) return false;
  // A ROUND THING IS AN OBJECT, NOT A TILE, and this is the test that catches the
  // ball, the coin, the wheel and the dial without anyone having to list them: a
  // radius of half the short side is a disc or a capsule, and those are things in
  // the world rather than boxes carrying a word. `plate` already reasons this way
  // about rounding, one rule over.
  const r = valueOf(body, 'borderRadius', t);
  const short = w != null && h != null ? Math.min(w, h) : null;
  if (r != null && short != null && Math.abs(r - short / 2) < 1.5) return false;
  // Belt and braces for the commonest shape: a box that centres something, or one
  // the scene has given its own caption style by the house convention (`node` and
  // `nodeText`), is a tile beyond doubt. Everything else that got this far is one
  // on the geometry, which is what keeps the corpus consistent — a reader meeting
  // white tiles in one lesson and toned ones in the next is worse than either.
  if (/(alignItems|justifyContent):\s*'center'/.test(body) || kin) return true;
  return true;
}

/** Is this style a plate — a toned, bordered, big-enough box? */
function plate(name, body, t) {
  if (!/backgroundColor:\s*(STONE|RULE|PAPER)\b/.test(body)) return null;
  if (!/borderColor:\s*INK\b/.test(body)) return null;
  if (/border(Top|Bottom)(Left|Right)Radius/.test(body)) return null;      // its own corners
  const m = body.match(/(?:^|[\s,{])borderRadius:\s*([\w. +\-*/()]+?)\s*(?:,|\n|})/);
  if (!m) return null;
  const r = valueOf(body, 'borderRadius', t);
  if (r == null || r >= RADIUS) return null;
  const w = valueOf(body, 'width', t);
  const h = valueOf(body, 'height', t);
  // A SMALL BOX MAY NOT BE ROUNDED INTO A CAPSULE, which is what Duolingo's own
  // "a quarter of the short side" guard is for: at radius 8 an 18-unit chip is a
  // pill and stops reading as a tile. Unknown sizes are left alone.
  if (w == null || h == null) return null;
  const short = Math.min(w, h);
  if (short < 24) return null;
  if (r > 0 && Math.abs(r - short / 2) < 1.5) return null;                 // a disc
  return { at: m.index + m[0].indexOf(m[1]), len: m[1].length, r, short };
}

export function skinScene(src) {
  const tone = src.match(/^const \{([^}]*)\} = stageTone\('([a-z-]+)'\);$/m);
  if (!tone) return { src, skip: 'no stage tone' };
  if (src.includes("from './stageSkin'")) return { src, skip: 'already skinned' };
  const t = constsOf(src);
  let out = src;
  let rounded = 0;
  let faced = 0;

  // ── HOW MANY TILES MAY GO WHITE AT ALL ────────────────────────────────────
  //
  // A WHITE CARD IS THE ABSENCE OF A TONE, and `check:shade` says so in its own
  // words: "PAPER is not one: a white card is the absence of a tone, which is
  // exactly why political7's charter reads against its stone tablet." So facing a
  // tile SPENDS the scene's tonal mass — and facing them all took 105 scenes below
  // the three-mass floor that exists because a reader said the pictures were flat.
  //
  // The look and that rule are both right, and this is where they meet: a scene may
  // spend down to `MIN_MASSES` and no further, smallest tiles first, because the
  // smallest is the one most likely to be a label and the largest is the one most
  // likely to be the thing the label is about. A scene with nothing spare keeps its
  // toned tiles, which is the correct answer rather than a compromise: there is
  // nothing there for a white card to read against.
  // COUNTED BY `check:shade`'S OWN FUNCTION, not by a second implementation of it.
  // The first draft of this cap re-counted the masses here and disagreed with the
  // check about the very first scene it was tested on — 0 against 1 — so it let 102
  // scenes fall below the floor while reporting that it had held them.
  let spare = Math.max(0, massFills(out).fills - MIN_MASSES);

  // 3 · the corners and the faces, back to front so the offsets hold
  const edits = [];
  const names = new Set(entriesOf(out).map((e) => e.name));
  const captioned = (n) => [...names].some((m) => m !== n
    && m.toLowerCase().startsWith(n.toLowerCase())
    && /(text|label|cap|word|name|title|read)$/i.test(m));
  const faces = [];
  for (const e of entriesOf(out)) {
    const body = out.slice(e.start, e.end);
    const p = plate(e.name, body, t);
    if (p) edits.push({ at: e.start + p.at, len: p.len, to: String(Math.min(RADIUS, Math.round(p.short / 3))), kind: 'radius' });
    if (tile(e.name, body, t, captioned(e.name))) {
      // ONE MATCH, ONE INDEX — `search` and then an anchored re-match is the same
      // expression written twice, and a word boundary so a constant that merely
      // begins with STONE (political7 declares `STONE_L`) is not read as the tone.
      const m = body.match(/backgroundColor:\s*STONE\b/);
      if (!m) continue;
      const w = valueOf(body, 'width', t);
      const h = valueOf(body, 'height', t);
      const area = (w ?? 120) * (h ?? 40);
      faces.push({ at: e.start + m.index, len: m[0].length, to: 'backgroundColor: PLATE_FACE', kind: 'face', area });
    }
  }
  // Smallest first, and only as many as the scene can afford.
  for (const fc of faces.sort((a, b) => a.area - b.area)) {
    if (spare <= 0) break;
    spare -= 1;
    edits.push(fc);
  }
  for (const e of edits.sort((a, b) => b.at - a.at)) {
    if (e.kind === 'radius' && Number(e.to) <= 2) continue;
    out = `${out.slice(0, e.at)}${e.to}${out.slice(e.at + e.len)}`;
    if (e.kind === 'radius') rounded += 1; else faced += 1;
  }

  // 1 · the ground
  const floored = FLOOR_RE.test(out);
  if (floored) out = out.replace(FLOOR_RE, 'floor: floorStyle(TONE, GROUND)');

  // 2 · the ledge, and the tone handle both it and the floor read
  const toneNames = tone[1].split(',').map((s) => s.trim()).filter(Boolean);
  const need = [...new Set([...toneNames, 'SHADE'])];
  const lipped = OLD_LIP.test(out);
  out = out.replace(
    tone[0],
    `const TONE = stageTone('${tone[2]}');\nconst { ${need.join(', ')} } = TONE;`,
  );
  if (lipped) out = out.replace(OLD_LIP, 'const LIP = lipOf(TONE);   // the ledge a toned plate stands on (scripts/skin-stage.mjs)');

  if (!rounded && !floored && !lipped && !faced) return { src, skip: 'nothing to skin' };
  // The import goes beside the tone's own, which every skinned scene already has.
  const anchor = out.match(/^import \{[^}]*\} from '\.\/stageTones';$/m);
  if (!anchor) return { src, skip: 'no stageTones import' };
  out = out.replace(anchor[0], `${anchor[0]}\n${IMPORT}`);
  return { src: out, rounded, floored, lipped, faced };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const WRITE = process.argv.includes('--write');
  const only = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('Scene.tsx'))
    .filter((f) => !only.length || only.includes(f.replace('Scene.tsx', '')));
  let done = 0; let rounded = 0; let floors = 0; let lips = 0; let faces = 0;
  const skips = {};
  for (const f of files) {
    const p = path.join(DIR, f);
    const src = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    const r = skinScene(src);
    if (r.skip) { skips[r.skip] = (skips[r.skip] ?? 0) + 1; continue; }
    done += 1; rounded += r.rounded; floors += r.floored ? 1 : 0; lips += r.lipped ? 1 : 0; faces += r.faced;
    if (WRITE) fs.writeFileSync(p, r.src);
  }
  console.log(`${done} scene(s) skinned of ${files.length}`);
  console.log(`  ${rounded} plate(s) given a real corner · ${faces} tile(s) given a white face · ${floors} ground(s) given two edges · ${lips} ledge(s) given a drop`);
  console.log(`  skipped: ${Object.entries(skips).map(([k, n]) => `${k} ${n}`).join(' · ') || 'none'}`);
  if (!WRITE) console.log('\n(dry run — pass --write)');
}
