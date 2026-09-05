// THE SEVENTEEN SCENES WHOSE REACTION DIED WITH THE PAD.
//
//   node scripts/wire-poll-react.mjs           # report
//   node scripts/wire-poll-react.mjs --write
//
// `rewire-react.mjs` handles the 34 lever->sort scenes, where a rename is enough
// because both controls carry one value along one authored scale. These are the
// other half, and they cannot be renamed: a `field` was a PAD, so the scene took
// two axes off it, and the `poll` that replaced it carries one number.
//
// What the poll does carry is WHICH OPTION, and every one of these questions is
// the pad's four quadrants written out as four sentences — "overwhelming, and
// shot through with terror" is the top-right corner in words. So each scene gets
// a small table per driven track: what that track reads at each option, in the
// order the AUTHOR declared them. `pickAt` (cinematicKit) reads the table at
// `pickPos`, which eases, so the picture TRAVELS between the named positions
// rather than cutting between four stills.
//
// ── EVERY TABLE BELOW IS DERIVED FROM THE OPTION'S OWN WORDS ────────────────
//
// Not from taste, and not from the old pad's geometry, which is gone. Each entry
// is read off the `reads` string against the track's own doc comment: valid3's
// STAMP is "VALID stamp shown (0/1)" and its options say "good form" or "broken
// form", so the table is exactly which options say good. That is what makes this
// checkable — the comment on each row is the sentence it came from.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'components/lesson/cinematic';
const WRITE = process.argv.includes('--write');

/**
 * base -> the tables to add and the reactions to repoint.
 *
 * `find` is matched inside the scene's `reacting ? … :` expression and replaced
 * by a read of `table`. `why` is the axis each table encodes, quoted from the
 * options.
 */
const SPEC = {
  aesthetics13: {
    tables: [['POLL_CHAIN', [1, 0, 1, 0], 'the provenance is what separates them — drawn where the PAINTERS differ']],
    swap: [['dragPos2.value', 'POLL_CHAIN']],
  },
  aesthetics2: {
    tables: [['POLL_FELT', [1, 0, 1, 0], 'the tears are REAL ones']],
    swap: [['dragPos2.value', 'POLL_FELT']],
  },
  aesthetics31: {
    tables: [['POLL_STR', [1, 1, 4, 4], 'strings left: HARD leaves one, EASY leaves four']],
    swap: [['4 - dragPos.value * 3', 'POLL_STR']],
  },
  aesthetics6: {
    tables: [
      ['POLL_VAST', [1, 0, 1, 0], 'the mountain is OVERWHELMING'],
      ['POLL_FLOWER', [0, 1, 1, 0], 'the flower stands where there is NOTHING TO FEAR'],
    ],
    swap: [['dragPos.value', 'POLL_VAST'], ['1 - dragPos2.value', 'POLL_FLOWER']],
  },
  epistemology14: {
    tables: [
      ['POLL_VAT', [1, 1, 0, 0], 'TWO worlds rather than one'],
      ['POLL_LEAP', [1, 0, 1, 0], 'ONE experience across them, which is what the leap spans'],
    ],
    swap: [['dragPos2.value', 'POLL_VAT'], ['dragPos.value', 'POLL_LEAP']],
  },
  epistemology20: {
    tables: [['POLL_WIRES', [0, 1, 0, 1], 'the source is JUST PASSING IT ON, so the wires show']],
    swap: [['1 - dragPos.value', 'POLL_WIRES']],
  },
  ethics31: {
    tables: [
      ['POLL_LADDER', [1, 1, 2, 2], 'how far it reaches: COULD NOT is short, COULD HAVE is tall enough'],
      ['POLL_DUTY', [1, 0, 1, 1], 'the lamp is lit wherever you are still ANSWERABLE'],
    ],
    swap: [['(1 - dragPos.value) * 2', 'POLL_LADDER'], ['dragPos2.value', 'POLL_DUTY']],
  },
  ethics7: {
    tables: [['POLL_GLANCE', [1, 1, 0, 0], 'the badge sits over BOTH cars only where the choices were identical']],
    swap: [['1 - (1 - dragPos.value) * tr', 'POLL_GLANCE']],
  },
  logic16: {
    tables: [
      ['POLL_DAWNS', [5, 1, 5, 1], 'how many mornings the option claims'],
      ['POLL_ARROW', [0, 0, 1, 1], 'the CROW → SUN arrow, drawn only where the option says CAUSE'],
    ],
    swap: [['dragPos2.value * 6', 'POLL_DAWNS'], ['dragPos.value', 'POLL_ARROW']],
  },
  metaphysics14: {
    tables: [['POLL_MARKS', [1, 1, 0, 0], 'the world marks fill in where the option says TRUE IN EVERY WORLD']],
    swap: [['dragPos2.value', 'POLL_MARKS']],
  },
  metaphysics32: {
    tables: [
      ['POLL_ORBS', [0, 1, 1, 0], 'two spheres stand apart only where the option says DIFFERENT PLACES'],
      ['POLL_TAG', [0, 0, 1, 1], 'the label sticks only where the option says they are DIFFERENT'],
    ],
    swap: [['dragPos2.value', 'POLL_ORBS'], ['1 - dragPos.value', 'POLL_TAG']],
  },
  metaphysics8: {
    tables: [
      ['POLL_CHAIN', [0, 1, 1, 0], 'the run holds where the option says EVERY LINK HOLDS'],
      ['POLL_MARK', [1, 0, 1, 0], 'YOUR CHOICE stands where the option leaves people FREE'],
    ],
    swap: [['dragPos.value', 'POLL_CHAIN'], ['dragPos2.value', 'POLL_MARK']],
  },
  political13: {
    tables: [['POLL_TAG', [1, 0, 0, 0], 'a setback that nobody consented to — harm rather than offence']],
    swap: [['dragPos.value * (1 - dragPos2.value) * tr', 'POLL_TAG']],
  },
  political15: {
    tables: [['POLL_NIGHT', [1, 0, 1, 0], 'night stays over the option that is done HIDDEN']],
    swap: [['1 - dragPos.value * tr', 'POLL_NIGHT']],
  },
  political8: {
    tables: [
      ['POLL_PILE', [1, 0, 1, 0], 'the spare crates stay stacked where the shares are IDENTICAL'],
      ['POLL_MARKS', [1, 0, 0, 1], 'the badges matter where SOMEBODY STILL CANNOT SEE'],
    ],
    swap: [['dragPos.value', 'POLL_PILE'], ['dragPos2.value', 'POLL_MARKS']],
  },
  valid3: {
    tables: [
      ['POLL_STAMP', [0, 1, 1, 0], 'VALID is stamped on the options that say GOOD FORM'],
      ['POLL_FLAW', [0, 0, 1, 1], 'the ✗ shows on the options that say FALSE CONCLUSION'],
    ],
    swap: [['dragPos.value', 'POLL_STAMP'], ['1 - dragPos2.value', 'POLL_FLAW']],
  },
};

const done = [];
const failed = [];

for (const [base, spec] of Object.entries(SPEC)) {
  const p = path.join(DIR, `${base}Scene.tsx`);
  if (!fs.existsSync(p)) { failed.push(`${base} — no scene file`); continue; }
  let src = fs.readFileSync(p, 'utf8');

  if (!/const REACT = BEATS\.map\(\(b\) => \(b\.interact\?\.field \? 1 : 0\)\);/.test(src)) {
    failed.push(`${base} — REACT does not read interact.field (already done?)`);
    continue;
  }

  // 1. the flag now names the control the script actually ships
  src = src.replace(
    'const REACT = BEATS.map((b) => (b.interact?.field ? 1 : 0));',
    'const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));',
  );

  // 2. the tables, right under the flag
  const head = [
    '',
    '// WHAT THE MACHINE READS AT EACH OPTION, in the order the BALLOT DECLARES them',
    '// (never the shuffled row order — see SceneApi.pickPos). This question used to',
    '// be a pad, and its options are still that pad\'s corners written out as',
    '// sentences, so each row below is read straight off one option\'s own words.',
    ...spec.tables.flatMap(([name, vals, why]) => [
      `// ${why}`,
      `const ${name} = [${vals.join(', ')}];`,
    ]),
  ].join('\n');
  src = src.replace(
    'const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));',
    `const REACT = BEATS.map((b) => (b.interact?.poll ? 1 : 0));\n${head}`,
  );

  // 3. every reaction reads its table instead of an axis that no longer exists
  let n = 0;
  for (const [find, table] of spec.swap) {
    const at = src.indexOf(`reacting ? ${find}`);
    if (at < 0) { failed.push(`${base} — could not find "reacting ? ${find}"`); n = -1; break; }
    src = src.replace(`reacting ? ${find}`, `reacting ? pickAt(${table}, pickPos.value)`);
    n += 1;
  }
  if (n < 0) continue;

  // 4. the imports and the signature
  // The cinematicKit import block, whose formatting varies from scene to scene —
  // one line, two lines, and a different member order in each. Add to the NAMES,
  // not to a line, or fourteen of these silently do not match.
  const imp = /import \{([\s\S]*?)\} from '\.\/cinematicKit';/.exec(src);
  if (!imp) { failed.push(`${base} — no cinematicKit import`); continue; }
  if (!/\bpickAt\b/.test(imp[1])) {
    src = src.replace(imp[0], `import {${imp[1].replace(/,?\s*$/, ', pickAt,\n')}} from './cinematicKit';`);
    if (!/pickAt/.test(/import \{([\s\S]*?)\} from '\.\/cinematicKit';/.exec(src)?.[1] ?? '')) {
      failed.push(`${base} — could not add the pickAt import`); continue;
    }
  }
  const stillDrag = /\bdragPos\.value/.test(src);
  const stillDrag2 = /\bdragPos2\.value/.test(src);
  src = src.replace(/(export default function \w+\(\{[^}]*?)\bdragPos, dragPos2\b([^}]*\}: SceneApi\))/,
    `$1${[stillDrag && 'dragPos', stillDrag2 && 'dragPos2', 'pickPos'].filter(Boolean).join(', ')}$2`);
  src = src.replace(/(export default function \w+\(\{[^}]*?)\bdragPos2\b([^}]*\}: SceneApi\))/,
    stillDrag2 ? '$1dragPos2, pickPos$2' : '$1pickPos$2');
  src = src.replace(/(export default function \w+\(\{[^}]*?)\bdragPos\b(?!2)([^}]*\}: SceneApi\))/,
    stillDrag ? '$1dragPos, pickPos$2' : '$1pickPos$2');

  const sig = src.split('\n').find((l) => l.startsWith('export default function')) ?? '';
  if (!/pickPos/.test(sig)) { failed.push(`${base} — could not add pickPos to the signature: ${sig.slice(0, 90)}`); continue; }
  if (/\bpickPos\b.*\bpickPos\b/.test(sig)) { failed.push(`${base} — pickPos added twice: ${sig.slice(0, 90)}`); continue; }

  if (WRITE) fs.writeFileSync(p, src, { encoding: 'utf8' });
  done.push(`${base} (${spec.tables.length} table${spec.tables.length === 1 ? '' : 's'})`);
}

console.log(`${WRITE ? 'wired' : 'would wire'} ${done.length} poll scenes`);
for (const d of done) console.log(`    ${d}`);
if (failed.length) { console.log(`\n${failed.length} not done:`); for (const f of failed) console.log(`    ${f}`); }
if (!WRITE) console.log('\n  --write to apply');
