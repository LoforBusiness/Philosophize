// Structural check for CINEMATIC lessons — the group-H rules in docs/LESSON_RULES.md.
// Sibling of validate-lessons.mjs, which does the same job for the card decks.
//
// These are the rules that are arithmetic, and the rule book's own policy is that
// arithmetic belongs in a check rather than in a sentence somebody has to remember:
//
//   H52  7–11 beats · exactly 1 quote · exactly 1 summary and it is last ·
//        the quote is not the hook, not a question beat, not last
//   H53  exactly two GRADED questions (mc + interact); extra interaction is a `tap`
//   H59  a band is declared, its bottom is the ground line + a little, and its
//        height has not quietly grown past the point where it costs on-screen size
//   H60  no scene declares a colour of its own
//   H63  no XP figure is typed into a string
//
// Run: node scripts/validate-cinematic.mjs
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'components', 'lesson', 'cinematic');

// The two lessons that predate the shared player carry their own copy of it, so they
// are exempt from the beat-shape rules (they are 26 and 14 beats of hand-built acts).
const LEGACY = new Set(['argument', 'builder']);

const problems = [];
const warnings = [];
const bands = [];
let ok = 0;

/** Split a BEATS array into its top-level beat objects. Crude but stable: every
 *  script in the directory is formatted with each beat opening on `  {`. */
function beatsOf(src) {
  return src.split('\n  {\n').slice(1).map((chunk) => chunk.split('\n  }')[0]);
}

// ── scripts ───────────────────────────────────────────────────────────────────
for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('Script.ts')).sort()) {
  const name = f.replace('Script.ts', '');
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const beats = beatsOf(src);
  const errs = [];
  const warns = [];

  const has = (b, key) => new RegExp(`^\\s{4}${key}:\\s*\\{`, 'm').test(b);
  const idxOf = (key) => beats.map((b, i) => (has(b, key) ? i : -1)).filter((i) => i >= 0);

  const graded = beats
    .map((b, i) => (has(b, 'mc') || has(b, 'interact') ? i : -1))
    .filter((i) => i >= 0);
  const quotes = idxOf('quote');
  const summaries = idxOf('summary');
  const n = beats.length;

  if (!LEGACY.has(name)) {
    if (n < 7 || n > 11) errs.push(`${n} beats (H52 wants 7–11, 8 is the house length)`);
    if (quotes.length !== 1) errs.push(`${quotes.length} quote beats, want exactly 1 (H52)`);
    if (quotes.length === 1) {
      const q = quotes[0];
      if (q === 0) errs.push('the quote is on the hook beat (H52)');
      if (q === n - 1) errs.push('the quote is the last beat (H52)');
      if (graded.includes(q)) errs.push(`the quote shares beat ${q} with a graded question (H52, D27)`);
    }
  }

  if (summaries.length !== 1) errs.push(`${summaries.length} summary beats, want exactly 1 (H52)`);
  else if (summaries[0] !== n - 1) errs.push(`the summary is beat ${summaries[0]} of ${n - 1}, must be last (H52)`);

  if (graded.length !== 2) {
    errs.push(
      `${graded.length} graded questions, want exactly 2 — a lesson pays ` +
        `${25 + graded.length * 10 + 15} XP instead of 60 (H53). An extra interaction is a \`tap\`.`,
    );
  }

  // Every beat must carry `dur`, because BaseBeat requires it — but flag nothing about
  // its VALUE: nothing reads it (H55).
  const durless = beats.filter((b) => !/^\s{4}dur:/m.test(b)).length;
  if (durless) errs.push(`${durless} beat(s) with no \`dur\` (the type requires one; H55)`);

  // D27 — THE DECK IS overflow:hidden AND FIXED. The answered state (prompt + pick +
  // explanation) is the tallest it ever gets, and an explanation past the bottom is
  // simply not readable. 290 is not a taste call: it is the longest explanation among
  // the 48 lessons that have been seen on a real phone, so anything at or under it is
  // safe by precedent. Six new lessons came in at a median of 327 and a max of 403 —
  // nine of twelve longer than ANY existing one — which is exactly the sort of drift
  // nobody notices while writing.
  for (const m of src.matchAll(/^\s*explain:\s*$\n\s*'(.*)',$/gm)) {
    if (m[1].length > 290) errs.push(`an explanation is ${m[1].length} chars; the deck holds ~290 (D27)`);
  }
  for (const m of src.matchAll(/^\s*explain: '(.*)',$/gm)) {
    if (m[1].length > 290) errs.push(`an explanation is ${m[1].length} chars; the deck holds ~290 (D27)`);
  }

  if (errs.length) problems.push([f, errs]);
  else ok++;
  if (warns.length) warnings.push([f, warns]);
}

// ── scenes ────────────────────────────────────────────────────────────────────
for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('Scene.tsx')).sort()) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const errs = [];
  const warns = [];

  // H60 — the only colours are the four in cinematicKit.
  const hexes = [...new Set(src.match(/#[0-9A-Fa-f]{3,8}\b/g) ?? [])];
  if (hexes.length) errs.push(`declares its own colour(s) ${hexes.join(', ')} — use INK/PAPER/SOFT/RULE (H60)`);

  // H63 — no XP figure typed into a string.
  const xp = src.match(/\+\s?\d+\s?XP/g);
  if (xp) errs.push(`hard-coded XP text ${[...new Set(xp)].join(', ')} — derive it from constants/xp (H63)`);

  // H59 — the band. A scene with a CAMERA is exempt from the bottom rule, because
  // D25 requires its band be measured after the transform — ethicsScene's ground line
  // legitimately lands at screen y 322 under a 1.14 zoom. Anything else with a bottom
  // away from the ground line has simply mis-measured.
  const hasCamera = /transform:\s*\[[^\]]*\{\s*scale:/.test(src);
  const band = src.match(/band=\{\[(\d+),\s*(\d+)\]\}/);
  if (!band) {
    errs.push('no band declared — the lesson renders letterboxed at 1.15× (H59, D25)');
  } else {
    const [t, b] = [+band[1], +band[2]];
    bands.push({ f, h: b - t });
    if (b < 500 || b > 525) {
      if (hasCamera) {
        warns.push(`band bottom ${b} is off the ground line, which is right IF it was measured after the camera — say so in the header (D25, A5)`);
      } else {
        errs.push(`band bottom ${b} — the ground line is 500 and this scene has no camera, so it belongs in 508–518 (H59)`);
      }
    }
  }

  if (errs.length) problems.push([f, errs]);
  else ok++;
  if (warns.length) warnings.push([f, warns]);
}

// ── the balance, and the one-way ratchet ──────────────────────────────────────
// THE DIRECTION IS ONE-WAY. Cinematic lessons are replacing the card decks, not
// sitting beside them — so no new card-only lesson is ever written, and existing
// ones get converted branch by branch until there are none left. That is a policy
// nobody can be expected to remember three months from now, so it is counted here:
//
//   · every branch carries the SAME lesson count and the SAME cinematic count
//     (§5). Level, or it shows on the Learn cards.
//   · CARD_BUDGET is a high-water mark that may only ever go DOWN. Converting a
//     lesson lowers it; adding a card-only lesson raises it and fails here. When
//     it reaches 0 the takeover is done and this whole block can go.
//   · SOLID_FLOOR is the second ratchet, and the one that enforces READING ORDER:
//     the combined length of the unbroken cinematic run at the FRONT of each
//     branch. It may only go UP. Converting a lesson from behind the frontier
//     lowers CARD_BUDGET without moving this, and the check says so.
const CARD_BUDGET = 90;
const SOLID_FLOOR = 79;

const ROUTE = path.join(
  process.cwd(), 'app', '(app)', 'branches', '[branchSlug]', '[pathSlug]', 'lesson', '[lessonId].tsx',
);
const routeSrc = fs.readFileSync(ROUTE, 'utf8');
const mapBody = routeSrc.split('const CINEMATIC')[1]?.split('\n};')[0] ?? '';
const wired = new Set([...mapBody.matchAll(/'([a-z-]+-[a-z]+-\d+)':/g)].map((m) => m[1]));

const BRANCHES = path.join(process.cwd(), 'data', 'branches');
const tally = [];
for (const branch of fs.readdirSync(BRANCHES).sort()) {
  const paths = path.join(BRANCHES, branch, 'paths');
  if (!fs.existsSync(paths)) continue;
  // READING ORDER comes out of the unit index, not the directory listing — the
  // filesystem is alphabetical and the reader is not.
  const unitDir = fs.readdirSync(paths)[0];
  const idx = fs.readFileSync(path.join(paths, unitDir, 'index.ts'), 'utf8');
  const imports = {};
  for (const m of idx.matchAll(/^import (\w+) from '\.\/lessons\/([^']+)';/gm)) imports[m[1]] = m[2];
  const order = [...idx.matchAll(/lessons: \[([^\]]*)\]/g)]
    .flatMap((m) => m[1].split(',').map((s) => s.trim()).filter(Boolean));

  let lessons = 0, cine = 0, solid = 0, frontier = null;
  for (const name of order) {
    const file = path.join(paths, unitDir, 'lessons', `${imports[name]}.ts`);
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, 'utf8');
    const id = src.match(/^ {2}id: '([^']+)',/m)?.[1];
    if (!id) continue;
    lessons++;
    if (wired.has(id)) {
      cine++;
      if (frontier === null) solid++;
    } else if (frontier === null) {
      // The title comes out of SOURCE, so its escapes arrive as two characters.
      const title = (src.match(/^ {2}title: '(.*)',/m)?.[1] ?? '').replace(/\\'/g, "'");
      frontier = `${id}  ${title}`;
    }
  }
  tally.push({ branch, lessons, cine, solid, frontier });
}

if (tally.length) {
  const errs = [];
  const nL = [...new Set(tally.map((t) => t.lessons))];
  const nC = [...new Set(tally.map((t) => t.cine))];
  const show = (key) => tally.map((t) => `${t.branch} ${t[key]}`).join(' · ');
  if (nL.length !== 1) errs.push(`branches hold different lesson counts — ${show('lessons')} (§5)`);
  if (nC.length !== 1) errs.push(`branches hold different cinematic counts — ${show('cine')} (§5)`);

  const cards = tally.reduce((a, t) => a + t.lessons - t.cine, 0);
  if (cards > CARD_BUDGET) {
    errs.push(
      `${cards} card-only lessons, up from ${CARD_BUDGET}. The direction is one-way: ` +
        'a NEW lesson is always cinematic, and this number only ever falls (§5, §17).',
    );
  } else if (cards < CARD_BUDGET) {
    errs.push(
      `${cards} card-only lessons left, down from ${CARD_BUDGET} — good. ` +
        'Lower CARD_BUDGET in this file to lock the gain in.',
    );
  }

  // READING ORDER (§5): the converted region must be a contiguous run from the
  // front of each branch, so a reader never steps from a scene back into cards.
  const solid = tally.reduce((a, t) => a + t.solid, 0);
  if (solid < SOLID_FLOOR) {
    errs.push(
      `the solid front is ${solid}, down from ${SOLID_FLOOR} — a lesson was un-wired ` +
        'from inside the converted run (§5)',
    );
  } else if (solid > SOLID_FLOOR) {
    errs.push(`the solid front is ${solid}, up from ${SOLID_FLOOR} — good. Raise SOLID_FLOOR to lock it in.`);
  } else if (cards < CARD_BUDGET) {
    errs.push(
      'lessons were converted but the solid front did not move: they were taken from ' +
        'BEHIND the frontier. Convert in reading order (§5) — the next one in each ' +
        'branch is listed above.',
    );
  }

  const total = tally.reduce((a, t) => a + t.lessons, 0);
  const cine = tally.reduce((a, t) => a + t.cine, 0);
  console.log(
    `\ntakeover: ${cine}/${total} cinematic (${Math.round((cine / total) * 100)}%) · ` +
      `${cards} card decks left · solid front ${solid} · ` +
      `${tally.length} branches at ${tally[0].lessons}/${tally[0].cine}`,
  );
  console.log('next to convert, in reading order:');
  for (const t of tally) {
    console.log(`  ${t.branch.padEnd(22)}${t.frontier ?? '— branch fully converted —'}`);
  }
  if (errs.length) problems.push(['the branch balance', errs]);
}

// ── report ────────────────────────────────────────────────────────────────────
for (const [f, warns] of warnings) {
  console.log(`~ ${f}`);
  for (const w of warns) console.log(`    ${w}`);
}

// The band budget, stated rather than nagged about. Every one of these is a
// deliberate call; the point is to show a new lesson where it sits against the pack
// before it settles on a band it did not have to pay for (H59).
if (bands.length) {
  const fit = (h) => Math.min(923 / 400, 647 / h);
  const hs = bands.map((b) => b.h).sort((a, b) => a - b);
  const worst = bands.reduce((a, b) => (b.h > a.h ? b : a));
  const free = bands.filter((b) => b.h <= 280).length;
  console.log(
    `\nband budget: median ${hs[hs.length >> 1]} → ${fit(hs[hs.length >> 1]).toFixed(2)}× · ` +
      `${free}/${bands.length} at the free 2.31× (h ≤ 280) · ` +
      `tallest ${worst.h} in ${worst.f} → ${fit(worst.h).toFixed(2)}×`,
  );
}
if (problems.length) {
  console.log('');
  for (const [f, errs] of problems) {
    console.log(`✗ ${f}`);
    for (const e of errs) console.log(`    ${e}`);
  }
  console.log(`\n${ok} clean, ${problems.length} with problems.`);
  process.exit(1);
}
console.log(`\n${ok} cinematic files clean${warnings.length ? `, ${warnings.length} with warnings` : ''}.`);
