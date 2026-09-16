// ─────────────────────────────────────────────────────────────────────────────
// GIVE EVERY SCENE ITS LESSON'S BRANCH HUE.
//
// The stage's three greys become the same three tones in the lesson's own branch
// colour, at exactly the grey's luminance (see ./components/lesson/cinematic/
// stageTones.ts for why luminance is the contract). Every usage site is left
// untouched: only what RULE / STONE / SHADE RESOLVE TO changes, so no geometry
// moves, no caption's contrast moves, and no must-box stamp goes stale.
//
//   node scripts/hue-stage.mjs          report what it would do
//   node scripts/hue-stage.mjs --write  do it
//
// IDEMPOTENT. A scene already carrying `stageTone(` is left alone, so a second
// run changes nothing — the rule this repo learned the expensive way when two
// corpus codemods silently doubled their own work.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIR = path.join(process.cwd(), 'components/lesson/cinematic');
const WRITE = process.argv.includes('--write');
const TONES = ['RULE', 'STONE', 'SHADE'];

/** Scene-file prefix → the branch key `stageTone` takes. Mirrors stageTones.PREFIX. */
const PREFIX = {
  metaphysics: 'metaphysics', epistemology: 'epistemology', logic: 'logic',
  ethics: 'ethics', aesthetics: 'aesthetics', political: 'political-philosophy',
  valid: 'logic', strong: 'logic', knowHow: 'epistemology',
};

export const branchOf = (file) => PREFIX[file.replace(/[0-9]*Scene\.tsx$/, '')] ?? null;

/** The line index the last top-level import statement ENDS on. */
function lastImportEnd(lines) {
  let end = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^import[\s{]/.test(lines[i])) continue;
    let j = i;
    while (j < lines.length && !/;\s*$/.test(lines[j])) j += 1;
    end = Math.max(end, j);
    i = j;
  }
  return end;
}

/**
 * The whole edit, as a pure function of the source — which is what lets
 * `restamp-hue.mjs` PROVE a rewritten scene is only this edit: re-run it on the
 * committed text and the result must equal the file on disk, byte for byte.
 *
 * Returns `{ src }` or `{ skip: <reason> }`.
 */
export function hueScene(source, file) {
  let src = source;
  const branch = branchOf(file);

  if (src.includes('stageTone(')) return { skip: 'already hued' };
  if (!branch) return { skip: 'no branch for this filename' };
  if (src.includes('\r\n')) return { skip: 'CRLF — normalise first' };

  // The kit import is multi-line, so the brace content must be matched with a class
  // that CANNOT cross a brace. A `[\s\S]*?` here is non-greedy but unbounded: it
  // starts at the file's FIRST `import {` and runs through every import in between,
  // which is the exact trap CLAUDE.md records `addImport` falling into — and it
  // silently reformats the react-native import on its way past.
  const m = src.match(/import \{([^{}]*)\} from '\.\/cinematicKit';/);
  if (!m) return { skip: "no './cinematicKit' import" };
  if (/\/\/|\/\*/.test(m[1])) return { skip: 'comment inside the kit import' };

  const names = m[1].split(',').map((s) => s.trim()).filter(Boolean);
  const taken = TONES.filter((t) => names.includes(t));
  // Which of the three the file actually USES in its body (outside that import).
  const body = src.replace(m[0], '');
  const used = TONES.filter((t) => new RegExp(`\\b${t}\\b`).test(body));
  const need = [...new Set([...taken, ...used])];
  if (!need.length) return { skip: 'uses none of the three' };

  // A scene that already declares one of these names locally is a collision, not a
  // rewrite — report it rather than producing a file that will not compile.
  const clash = need.filter((t) => new RegExp(`^\\s*(const|let|var)\\s+${t}\\b`, 'm').test(body));
  if (clash.length) return { skip: `declares ${clash.join(', ')} locally` };

  const kept = names.filter((n) => !TONES.includes(n));
  const trailingNewline = /,\s*\n\s*$/.test(m[1]);
  const rewritten = `import { ${kept.join(', ')}${trailingNewline ? ',\n' : ' '}} from './cinematicKit';`;
  src = src.replace(m[0], rewritten);

  const lines = src.split('\n');
  const at = lastImportEnd(lines);
  if (at < 0) return { skip: 'could not find the import block' };

  const decl = [
    '',
    "// THE STAGE IS STRUCK IN THIS LESSON'S OWN BRANCH HUE (./stageTones).",
    '// Same three tones, same luminance to the third decimal — so every contrast',
    '// measured against the old greys still holds and nothing on the stage moved.',
    `const { ${need.join(', ')} } = stageTone('${branch}');`,
  ];
  lines.splice(at + 1, 0, ...decl);
  // The import goes immediately after the kit import it replaces part of.
  const kitEnd = lines.findIndex((l) => l.includes("} from './cinematicKit';"));
  lines.splice(kitEnd + 1, 0, "import { stageTone } from './stageTones';");
  return { src: lines.join('\n'), branch, need };
}

// ── the run ─────────────────────────────────────────────────────────────────
// Guarded, because `restamp-hue.mjs` imports `hueScene` to reproduce this edit as
// its proof and must not trip the codemod on the way in.
const ENTRY = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

const done = [];
const skipped = [];
if (ENTRY) {

for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('Scene.tsx'))) {
  const full = path.join(DIR, file);
  const out = hueScene(fs.readFileSync(full, 'utf8'), file);
  if (out.skip) { skipped.push([file, out.skip]); continue; }
  if (WRITE) fs.writeFileSync(full, out.src, 'utf8');
  done.push([file, out.branch, out.need.join('+')]);
}

console.log(`${WRITE ? 'REWROTE' : 'would rewrite'} ${done.length} scenes\n`);
const byBranch = {};
for (const [, b] of done) byBranch[b] = (byBranch[b] ?? 0) + 1;
for (const [b, n] of Object.entries(byBranch).sort()) console.log(`   ${b.padEnd(22)} ${n}`);
if (skipped.length) {
  console.log(`\nskipped ${skipped.length}:`);
  const why = {};
  for (const [, r] of skipped) why[r] = (why[r] ?? 0) + 1;
  for (const [r, n] of Object.entries(why)) console.log(`   ${String(n).padStart(3)}  ${r}`);
  for (const [f, r] of skipped.filter(([, r]) => !/already hued|uses none/.test(r))) console.log(`        ${f} — ${r}`);
}
}
