// ─────────────────────────────────────────────────────────────────────────────
// WHICH PHILOSOPHER NAMES APPEAR IN THE NARRATION, AND WHERE.
//
//   npm run make:names        writes data/lessonNames.ts
//
// The deck under the stickman names people constantly — "Hume grants the
// variety", "Plato hung it up here" — and until now those were plain words in a
// paragraph. They are the one thing on the screen a reader might want to stop
// and ask about, and the app already knows who they are.
//
// ── WHY IT IS GENERATED RATHER THAN MATCHED AT RUN TIME ─────────────────────
//
// The rules for when a surname may be believed are not obvious and they are
// already written down once, in make-mentions: a surname counts only when
// exactly ONE philosopher has it, when it is longer than three characters, and
// when it is not also an ordinary English word. That last list is not fussiness
// — "Moore", "Bacon", "James", "Price", "Church", "Day" and "Long" all appear in
// these lessons meaning something else entirely.
//
// Re-deriving that in the app would be a second copy of the rule, and the second
// copy is the one that goes stale. So the same rules run here, once, and the app
// gets a lookup.
//
// ── AND IT SCANS THE NARRATION ONLY ─────────────────────────────────────────
//
// `make-mentions` searches the whole lesson blob, because for crediting a
// thinker it does not matter where their name sits. Here it does: this table
// decides what is DRAWN, so a name that appears only in an `explain` or a
// control's `reads` must not produce a highlight in a paragraph that never
// mentions them.
import fs from 'node:fs';
import path from 'node:path';
import { ALL_PHILOSOPHERS } from '../data/philosophers.ts';

const CIN = 'components/lesson/cinematic';
const ROUTE = 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx';

const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const surOf = (n) => n.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(-1)[0];

// Copied deliberately from make-mentions, and `check:names` asserts the two
// lists are identical — one rule, two readers, and the checker is what keeps
// them one rule.
export const COMMON = new Set(['james', 'moore', 'bacon', 'young', 'wolf', 'good', 'best', 'law',
  'price', 'grant', 'church', 'lewis', 'day', 'west', 'long', 'strong', 'wright', 'more', 'paine', 'mill']);

const surCount = new Map();
for (const p of ALL_PHILOSOPHERS) {
  const s = surOf(p.name);
  surCount.set(s, (surCount.get(s) ?? 0) + 1);
}
// ── FOUR NAMES THE GENERAL RULE REFUSES AND THIS CORPUS RESOLVES ────────────
//
// The three tests above are the right defaults and they are why "Bacon" is not
// automatically a philosopher. They also refuse four names this app's narration
// uses constantly, which reads as a bug on the screen: Aristotle coloured and
// tappable in one lesson, Mill plain text in the next.
//
// Measured before overriding, not assumed. Every sentence in the corpus using
// these four was printed and read — sixteen of them, across twelve lessons —
// and not one is the ordinary word:
//
//   "Mill drew the line — power may be used against you only to prevent harm"
//   "Bacon wanted to use it."   "Moore holds up his hand and says he knows this."
//   "Amartya Sen and Martha Nussbaum answer differently."
//
// So the override is a statement about THIS corpus, not a loosening of the rule.
// Mill and Bacon are shared surnames and the choice of which one is a judgement:
// the ethics and political lessons are all On Liberty and Utilitarianism, and
// epistemology-knowledge-5 names Francis Bacon in full two sentences earlier.
// `check:names` re-derives each id against the roster, so a typo here is a build
// failure rather than a name that silently stops being tappable.
const OVERRIDE = new Map([
  ['Mill', 'john-stuart-mill'],   // shared with James Mill; never him here
  ['Bacon', 'francis-bacon'],     // shared with Roger Bacon; named in full first
  ['Moore', 'ge-moore'],          // in COMMON as an ordinary word, and never one
  ['Sen', 'amartya-sen'],         // three letters, so under the length floor
]);

const bySur = new Map();
for (const p of ALL_PHILOSOPHERS) {
  const s = surOf(p.name);
  if (surCount.get(s) === 1 && s.length > 3 && !COMMON.has(s.toLowerCase())) bySur.set(s, p.id);
}
const byId = new Map(ALL_PHILOSOPHERS.map((p) => [p.id, p]));
for (const [sur, pid] of OVERRIDE) {
  if (!byId.has(pid)) throw new Error(`make-names: OVERRIDE '${sur}' names no philosopher '${pid}'`);
  bySur.set(sur, pid);
}
const byFull = new Map(ALL_PHILOSOPHERS.map((p) => [p.name, p.id]));

const route = fs.readFileSync(ROUTE, 'utf8');
const comp = new Map();
for (const m of route.matchAll(/'([a-z0-9-]+)':\s*([A-Za-z0-9_]+)/g)) comp.set(m[1], m[2]);

const scriptFor = (id) => {
  const c = comp.get(id);
  if (!c) return null;
  const b = c.replace(/Lesson$/, '');
  const p = path.join(CIN, `${b[0].toLowerCase()}${b.slice(1)}Script.ts`);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n') : null;
};

/** Every narration string a lesson draws under the figure. */
function narration(src) {
  const out = [];
  const body = src.match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
  if (!body) return out;
  for (const m of body[1].matchAll(/(?:^|[\s{,])text:\s*'((?:[^'\\]|\\.)*)'/g)) {
    out.push(m[1].replace(/\\'/g, "'"));
  }
  return out;
}

export function derive() {
  const table = {};
  let lessons = 0, hits = 0;
  for (const [id] of comp) {
    const src = scriptFor(id);
    if (!src) continue;
    lessons++;
    const text = narration(src).join('\n');
    if (!text) continue;
    const found = new Map();
    // FULL NAMES FIRST, so "David Hume" is one highlight rather than a stray
    // "David" beside a linked "Hume".
    for (const [full, pid] of byFull) {
      if (full.includes(' ') && new RegExp(`\\b${esc(full)}\\b`).test(text)) found.set(full, pid);
    }
    for (const [sur, pid] of bySur) {
      if (new RegExp(`\\b${esc(sur)}\\b`).test(text)) found.set(sur, pid);
    }
    if (!found.size) continue;
    // Longest first: the matcher tries them in order, so a full name must be
    // offered before the surname it contains.
    const rows = [...found.entries()].sort((a, b) => b[0].length - a[0].length || a[0].localeCompare(b[0]));
    table[id] = rows;
    hits += rows.length;
  }
  return { table, lessons, hits };
}

export function render(table) {
  const body = Object.keys(table).sort().map((id) =>
    `  '${id}': [${table[id].map(([n, p]) => `['${n.replace(/'/g, "\\'")}', '${p}']`).join(', ')}],`).join('\n');
  return `// GENERATED by scripts/make-names.mjs — do not hand-edit.
//
// Every philosopher name that appears in a lesson's NARRATION, with the id it
// resolves to. The deck draws these in their era's colour and opens a one-line
// snapshot when one is tapped (see components/lesson/cinematic/NarrationText).
//
// Narration only — not \`explain\`, not a control's \`reads\`. This table decides
// what is DRAWN, so a name that appears somewhere else must not colour a
// paragraph that never mentions them.
//
// The rules for believing a surname live in scripts/make-mentions.mjs and are
// re-used here: unique across all 322, longer than three characters, and not an
// ordinary English word. Regenerate with:  npm run make:names

export type LessonName = readonly [surface: string, philosopherId: string];

/** Longest surface form first — the matcher takes them in order. */
export const LESSON_NAMES: Record<string, readonly LessonName[]> = {
${body}
};
`;
}

if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/')
  || process.argv[1]?.endsWith('make-names.mjs')) {
  const { table, lessons, hits } = derive();
  fs.writeFileSync('data/lessonNames.ts', render(table), 'utf8');
  console.log(`\nwrote data/lessonNames.ts`);
  console.log(`  ${Object.keys(table).length} of ${lessons} lessons name a philosopher in their narration`);
  console.log(`  ${hits} name forms in all\n`);
}
