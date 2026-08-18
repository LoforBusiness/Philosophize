// ─────────────────────────────────────────────────────────────────────────────
// WHO DOES EACH LESSON ACTUALLY TALK ABOUT?
//
//   node --import ./scripts/lib/register.mjs scripts/make-mentions.mjs
//   npm run make:mentions
//
// The Insights tab credited a philosopher for every lesson finished in their
// BRANCH: do one ethics lesson and all forty ethics thinkers moved up together.
// That is not a reading of what anyone likes, it is a reading of which tab they
// were in — and it is why the top-philosophers chart only really responded to
// opening someone's page in Thinkers.
//
// This derives the honest answer offline: for each lesson, which philosophers it
// names, and how strongly.
//
//   QUOTED (3) — the lesson carries their quote, by `philosopherId` on a quote
//                card or by `author` on a cinematic quote beat. The lesson is
//                built on them.
//   NAMED  (1) — their name appears in the lesson's own text or its script. They
//                are discussed, which is worth less than being the subject.
//
// It reads the app's REAL composed data through the resolve hook rather than
// scraping source for `id:` — scraping found 434 philosophers, then 515, against
// a true 322, and the phantom duplicates collapsed the unique-surname filter from
// 302 usable names to 3.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const M = (rel) => import(pathToFileURL(path.join(process.cwd(), rel)).href);
const { ALL_PHILOSOPHERS } = await M('data/philosophers.ts');
const { ALL_BRANCHES } = await M('data/index.ts');

const CIN = path.join(process.cwd(), 'components/lesson/cinematic');
const OUT = path.join(process.cwd(), 'data/lessonMentions.ts');
const dry = process.argv.includes('--dry');

export const QUOTED = 3;
export const NAMED = 1;

const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const surOf = (n) => n.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(-1)[0];

// ── WHICH NAMES ARE SAFE TO MATCH IN PROSE ──────────────────────────────────
//
// A surname only counts when exactly ONE philosopher has it — "Mill" is both
// J. S. and James Mill, and crediting the wrong one is worse than crediting
// neither — and when it is not also an ordinary English word. That second list is
// not fussiness: "Moore", "Bacon", "James", "Price", "Church", "Day" and "Long"
// all appear in these lessons meaning something else entirely, and every one would
// have quietly awarded a philosopher a lesson they are nowhere near.
const COMMON = new Set(['james', 'moore', 'bacon', 'young', 'wolf', 'good', 'best', 'law',
  'price', 'grant', 'church', 'lewis', 'day', 'west', 'long', 'strong', 'wright', 'more', 'paine', 'mill']);

const byName = new Map(ALL_PHILOSOPHERS.map((p) => [p.name.toLowerCase(), p.id]));
const surCount = new Map();
for (const p of ALL_PHILOSOPHERS) {
  const s = surOf(p.name);
  surCount.set(s, (surCount.get(s) ?? 0) + 1);
}
const bySur = new Map();
for (const p of ALL_PHILOSOPHERS) {
  const s = surOf(p.name);
  if (surCount.get(s) === 1 && s.length > 3 && !COMMON.has(s.toLowerCase())) bySur.set(s, p.id);
}

const route = fs.readFileSync(
  path.join(process.cwd(), 'app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx'), 'utf8');
const cinComp = new Map();
for (const m of route.matchAll(/'([a-z0-9-]+)':\s*([A-Za-z0-9_]+)/g)) cinComp.set(m[1], m[2]);

/** A cinematic lesson's narration lives in its script, not in the lesson object. */
const scriptFor = (id) => {
  const c = cinComp.get(id);
  if (!c) return '';
  const b = c.replace(/Lesson$/, '');
  const p = path.join(CIN, `${b[0].toLowerCase()}${b.slice(1)}Script.ts`);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
};

/**
 * The table, derived. EXPORTED and side-effect free, so check-mentions can re-derive
 * and compare — a checker that reads the file on disk and compares it to the file on
 * disk is a tautology, and this file's whole job is to be reproducible.
 */
export function derive() {
const table = {};
const tally = new Map();
let lessons = 0, withAny = 0, quoted = 0, named = 0;

for (const b of ALL_BRANCHES) {
  for (const u of b.paths) {
    for (const l of u.lessons) {
      lessons++;
      const found = new Map();
      const words = JSON.stringify(l);
      for (const m of words.matchAll(/"philosopherId":"([a-z0-9-]+)"/g)) found.set(m[1], QUOTED);
      const blob = `${words}\n${scriptFor(l.id)}`;
      for (const m of blob.matchAll(/author:\s*'([^']+)'/g)) {
        const pid = byName.get(m[1].toLowerCase());
        if (pid && !found.has(pid)) found.set(pid, QUOTED);
      }
      for (const [s, pid] of bySur) {
        if (found.has(pid)) continue;
        if (new RegExp(`\\b${esc(s)}\\b`).test(blob)) found.set(pid, NAMED);
      }
      if (!found.size) continue;
      withAny++;
      // Heaviest first, so a reader of the generated file sees who the lesson is
      // about before who it merely mentions.
      const rows = [...found.entries()].sort((a, b2) => b2[1] - a[1] || a[0].localeCompare(b2[0]));
      table[l.id] = rows;
      for (const [pid, w] of rows) {
        if (w === QUOTED) quoted++; else named++;
        tally.set(pid, (tally.get(pid) ?? 0) + 1);
      }
    }
  }
}

  return { table, tally, lessons, withAny, quoted, named };
}

/** The generated file's text, from a derived table. Also exported for the checker. */
export function render(table) {
const body = Object.keys(table).sort().map((id) =>
  `  '${id}': [${table[id].map(([p, w]) => `['${p}', ${w}]`).join(', ')}],`).join('\n');

const file = `// GENERATED by scripts/make-mentions.mjs — do not hand-edit.
//
// Which philosophers each lesson is about, and how strongly:
//   ${QUOTED} — QUOTED. The lesson carries their words (a quote card's philosopherId,
//       or a cinematic quote beat's author). It is built on them.
//   ${NAMED} — NAMED. Their name appears in the lesson's text or script. Discussed,
//       which is worth less than being the subject.
//
// This replaces "every philosopher in the branch gets credit for every lesson in
// it", under which one ethics lesson moved all forty ethics thinkers up together.
//
// Regenerate after writing or editing a lesson:  npm run make:mentions

export type Mention = readonly [philosopherId: string, weight: number];

export const MENTION_QUOTED = ${QUOTED};
export const MENTION_NAMED = ${NAMED};

export const LESSON_MENTIONS: Record<string, readonly Mention[]> = {
${body}
};

/** The philosophers a finished lesson should credit. Empty for a lesson naming none. */
export function mentionsFor(lessonId: string): readonly Mention[] {
  return LESSON_MENTIONS[lessonId] ?? [];
}
`;
  return file;
}

// ── CLI below; importing this module writes nothing ─────────────────────────
//
// Guarded because check-mentions.mjs imports `derive` and `render` to re-derive the
// table and compare it with the file on disk. A module that regenerated on import
// would make that comparison a tautology — the checker would rewrite the file it was
// about to check and always agree with itself.
if (process.argv.some((a) => a.endsWith('make-mentions.mjs'))) {
  const { table, tally, lessons, withAny, quoted, named } = derive();
  if (!dry) fs.writeFileSync(OUT, render(table));
  const rows = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`\n${dry ? 'would generate' : 'generated'} data/lessonMentions.ts`);
  console.log(`  ${withAny} of ${lessons} lessons name a philosopher`);
  console.log(`  ${quoted} quoted · ${named} named · ${rows.length} of ${ALL_PHILOSOPHERS.length} philosophers appear`);
  console.log(`  most discussed: ${rows.slice(0, 5).map(([p, n]) => `${p} (${n})`).join(' · ')}`);
  console.log('');
}
