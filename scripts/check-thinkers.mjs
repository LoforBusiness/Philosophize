// THE THINKERS, AS NUMBERS — every stat the Thinkers tab and a philosopher's
// profile put on screen, re-derived here from the real records.
//
// It exists because those stats are computed from a HUMAN STRING. `lifespan` is
// written for a reader ("c. 4 BCE–65 CE", "c. 6th century BCE", "died 866 CE"),
// and a parser that copes with the 322 shapes present today will meet a
// twenty-seventh the first time somebody adds a philosopher. The failure mode is
// silent: a profile renders with a blank age and a dot at year zero, and nothing
// anywhere says so.
//
// So: `at` must be a real year for EVERY thinker, no exceptions, and the ones
// that legitimately have no age must be a known, counted set rather than a
// surprise.
//
//   node scripts/check-thinkers.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);
const TMP = path.join(os.tmpdir(), 'philosophize-thinkers-check');
mkdirSync(TMP, { recursive: true });

/** Transpile a whole directory tree of .ts into sibling .mjs, rewriting imports. */
function copyTree(rel) {
  const abs = path.join(REPO, rel);
  for (const n of readdirSync(abs)) {
    const p = path.join(abs, n);
    const r = path.join(rel, n);
    if (statSync(p).isDirectory()) { mkdirSync(path.join(TMP, r), { recursive: true }); copyTree(r); }
    else if (n.endsWith('.ts')) {
      mkdirSync(path.join(TMP, rel), { recursive: true });
      writeFileSync(
        path.join(TMP, r.replace(/\.ts$/, '.mjs')),
        transform(readFileSync(p, 'utf8'), { transforms: ['typescript'] }).code
          .replace(/(from\s+['"])(\.[^'"]*?)(['"])/g, (_m, a, b, c) => a + b + '.mjs' + c),
      );
    }
  }
}
mkdirSync(path.join(TMP, 'data'), { recursive: true });
copyTree('data');
// lifespan.ts has no imports at all, so it needs no rewriting.
writeFileSync(
  path.join(TMP, 'lifespan.mjs'),
  transform(readFileSync(path.join(REPO, 'lib/utils/lifespan.ts'), 'utf8'), { transforms: ['typescript'] }).code,
);

const P = await import(pathToFileURL(path.join(TMP, 'data/philosophers.mjs')).href);
const L = await import(pathToFileURL(path.join(TMP, 'lifespan.mjs')).href);
const ALL = P.ALL_PHILOSOPHERS;

let fails = 0;
const ok = (pass, label, detail) => {
  if (!pass) fails++;
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  ' + detail : ''}`);
};

console.log('\nTHE THINKERS\n');

const spans = ALL.map((p) => ({ p, l: L.parseLifespan(p.lifespan) }));

// ── 1. every thinker can be placed ──────────────────────────────────────────
const unplaced = spans.filter(({ l }) => !Number.isFinite(l.at) || l.at === 0);
ok(unplaced.length === 0, 'every thinker has a year to stand on',
  unplaced.slice(0, 6).map(({ p }) => `${p.name} "${p.lifespan}"`).join('; ')
    || `all ${ALL.length}, from ${L.yearLabel(Math.min(...spans.map((s) => s.l.at)))} `
       + `to ${L.yearLabel(Math.max(...spans.map((s) => s.l.at)))}`);

// ── 2. the timeline bounds are the real ones ────────────────────────────────
// FIRST_YEAR and LAST_YEAR are typed into lifespan.ts and scale every strip that
// draws a life. If a new thinker falls outside them the position clamps, and two
// different centuries start drawing at the same pixel.
const lo = Math.min(...spans.map((s) => s.l.at));
const hi = Math.max(...spans.map((s) => s.l.at));
ok(lo >= L.FIRST_YEAR && hi <= L.LAST_YEAR,
  'the timeline bounds still contain everybody',
  lo < L.FIRST_YEAR || hi > L.LAST_YEAR
    ? `data runs ${L.yearLabel(lo)}–${L.yearLabel(hi)}, bounds are ${L.yearLabel(L.FIRST_YEAR)}–${L.yearLabel(L.LAST_YEAR)} — widen them`
    : `${L.yearLabel(lo)}–${L.yearLabel(hi)} inside ${L.yearLabel(L.FIRST_YEAR)}–${L.yearLabel(L.LAST_YEAR)}`);

// ── 3. no life runs backwards ───────────────────────────────────────────────
// The trap this catches is real: "c. 4 BCE–65 CE" parsed with only the trailing
// era marker gives −4 → −65, a man who died 61 years before he was born.
const backwards = spans.filter(({ l }) => l.from !== null && l.to !== null && l.to < l.from);
ok(backwards.length === 0, 'nobody dies before they are born',
  backwards.map(({ p, l }) => `${p.name} "${p.lifespan}" → ${l.from}..${l.to}`).join('; ')
    || 'every two-ended span runs forwards');

// ── 4. ages are human ───────────────────────────────────────────────────────
//
// 125, and the ceiling is deliberately loose, because THIS CHECK IS LOOKING FOR
// PARSE ERRORS AND NOT FACT-CHECKING HISTORY. A misread century or a dropped era
// marker produces something absurd — a negative age, or five hundred years — and
// that is what the bound is for. It is not for arguing with the record.
//
// Ramanuja is why the number is not 110. "c. 1017-1137" is his traditional
// dating, cited that way everywhere, and it makes him 120. The string parses
// exactly right; he simply has the longest life in the app. A tighter bound
// failed on correct data, which is the one thing a check must never do.
const aged = spans.filter(({ l }) => l.age !== null);
const silly = aged.filter(({ l }) => l.age < 15 || l.age > 125);
ok(silly.length === 0, 'and lived a plausible number of years',
  silly.map(({ p, l }) => `${p.name} ${l.age}`).join('; ')
    || `${aged.length} of ${ALL.length} have a real age, ${Math.min(...aged.map((s) => s.l.age))}–`
       + `${Math.max(...aged.map((s) => s.l.age))}, mean `
       + `${Math.round(aged.reduce((a, s) => a + s.l.age, 0) / aged.length)}`);

// ── 5. the ageless are a KNOWN set, not a surprise ──────────────────────────
//
// A budget rather than a zero, because some of these genuinely cannot have an
// age: a thinker dated "c. 6th century BCE" has no birth year to subtract, and
// inventing one to fill the slot would be the worst possible fix. What must not
// happen is the number growing quietly because somebody added a record in a new
// format and the profile shows a gap.
const AGELESS_BUDGET = 8;
const ageless = spans.filter(({ l }) => l.age === null);
if (ageless.length > AGELESS_BUDGET) {
  ok(false, 'the thinkers with no age are the ones that genuinely have none',
    `${ageless.length} against a budget of ${AGELESS_BUDGET}: `
      + ageless.map(({ p }) => `${p.name} "${p.lifespan}"`).join('; '));
} else {
  ok(true, 'the thinkers with no age are the ones that genuinely have none',
    `${ageless.length}/${AGELESS_BUDGET}: ${ageless.map(({ p }) => p.lifespan).join(', ')}`);
}

// ── 6. the contemporaries stat says something ───────────────────────────────
const withSpan = spans.filter(({ l }) => l.from !== null && l.to !== null);
const counts = withSpan.map(({ l }) => withSpan.filter(({ l: o }) => L.overlaps(l, o)).length - 1);
counts.sort((a, b) => a - b);
ok(counts[Math.floor(counts.length / 2)] >= 5,
  'a thinker has contemporaries worth naming',
  `median ${counts[Math.floor(counts.length / 2)]}, range ${counts[0]}–${counts[counts.length - 1]}`);

// ── 7. what the cards need in order to be drawn ─────────────────────────────
const noSymbol = ALL.filter((p) => !p.symbol || !p.symbol.trim());
ok(noSymbol.length === 0, 'every thinker has a symbol for their collection card',
  noSymbol.map((p) => p.name).join('; ') || `${ALL.length} symbols`);

const noBranch = ALL.filter((p) => !p.branchSlugs || p.branchSlugs.length === 0);
ok(noBranch.length === 0, 'and at least one branch to chart',
  noBranch.map((p) => p.name).join('; ')
    || `1–${Math.max(...ALL.map((p) => p.branchSlugs.length))} branches each`);

// ── 8. every quote still fits the home page that shows one a day ────────────
//
// Home's Daily Reflection steps its type down as a quote gets longer, so that a
// nine-word aphorism can be set large without the longest passage in the library
// being cut off mid-clause. The steps in components/home/DailyReflection.tsx are
// read out of the shipping component rather than restated, because a checker
// holding its own copy of a constant measures a layout that may no longer exist.
//
// The ceiling is the last step's characters-per-line times its numberOfLines. It
// matters because the failure is invisible from this end: a quote 60 characters
// longer than today's longest simply ends in an ellipsis on somebody's home
// screen, on one day, and nothing anywhere reports it.
{
  const src = readFileSync(path.join(REPO, 'components/home/DailyReflection.tsx'), 'utf8');
  // SCOPED TO THE STEPS ARRAY, not to the file. The first draft of this took the
  // last `fontSize:` anywhere in the source, which is the byline's 11 — so it
  // computed a 536-character ceiling from a size the quote is never set at, and
  // reported "ok" while measuring the wrong thing entirely.
  const steps = (src.match(/const STEPS = \[[\s\S]*?\n\];/) || [''])[0];
  const sizes = [...steps.matchAll(/fontSize:\s*([\d.]+)/g)].map((m) => Number(m[1]));
  const last = sizes.length ? Math.min(...sizes) : 0;
  const lines = Number((src.match(/numberOfLines=\{(\d+)\}/) || [])[1]);
  // 342dp of column (a 390dp phone less its margins) at Playfair italic's ~0.46em
  // average advance — the same arithmetic the component's own note sets out.
  const perLine = Math.floor(342 / (last * 0.46));
  const ceiling = perLine * lines;
  const quotes = ALL.flatMap((p) => p.quotes.map((q) => ({ n: q.text.length, who: p.name })));
  quotes.sort((a, b) => b.n - a.n);
  ok(last > 0 && lines > 0, 'the reflection still declares a smallest step and a line cap',
    `${last}pt × ${lines} lines`);
  ok(quotes[0].n <= ceiling, 'the longest quote in the library still fits it',
    `${quotes[0].n} chars (${quotes[0].who}), ceiling ${ceiling}`);
}

console.log(fails ? `\n${fails} problem(s).\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
