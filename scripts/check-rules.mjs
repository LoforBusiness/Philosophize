// ─────────────────────────────────────────────────────────────────────────────
// THE RULE BOOK IS PART OF THE PRODUCT, SO IT GETS A CHECKER TOO
//
//   npm run check:rules
//
// Group U says a rule without a checker is a wish, and until now the file that
// says so was the one thing in the repo nothing re-derived. That matters more than
// it sounds: `docs/LESSON_RULES.md` is what an author reads BEFORE writing a
// lesson, so a stale line there does not cause one defect, it causes the next
// twenty. A wrong rule is worse than a missing one — it is obeyed.
//
// This is `check:bible` pointed at the rule book. It does not judge prose; it
// checks the things that go stale on their own, every one of which has already
// gone stale here at least once:
//
//   1. AN ID IS AN ADDRESS (U4). Two rules at one address means neither can be
//      cited, and the file records it happening twice — T4 was used for tap rings
//      and for tone, and `check:lift` shipped calling its rule "E1" into a group
//      that already ran E33–E37c.
//   2. A CITED CHECK MUST EXIST. §21 records `MapChart.tsx` pointing at
//      `scripts/check-intro.mjs` for months before anybody wrote it — a citation
//      to a check nobody could run.
//   3. A CITED SCRIPT MUST EXIST, for the same reason: half the rules here end
//      "run `node scripts/…`", and a renamed file makes the instruction a dead end.
//   4. A CROSS-REFERENCE MUST RESOLVE. A rule that cites a rule that is not there
//      reads as depth and delivers nothing.
//   5. A CITED CONSTANT MUST EXIST. The budgets are the load-bearing half of U2 —
//      CARD_BUDGET, SOLID_FLOOR and the rest — and a budget named here but not in
//      the code is a ratchet nobody is turning.
//   6. A CITED COSTUME AND A CITED MOVE CODE MUST EXIST, because both vocabularies
//      have been edited since the rules about them were written.
//
// Counter-tested by `node scripts/countertest-rules.mjs`, in both directions.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\//, '')), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const RULES = process.env.RULES_FILE || 'docs/LESSON_RULES.md';

let fails = 0;
const ok = (m, d = '') => console.log(`  ok    ${m}${d ? `  ${d}` : ''}`);
const bad = (m, d = '') => { fails += 1; console.log(`  FAIL  ${m}${d ? `  ${d}` : ''}`); };

console.log('\nTHE RULE BOOK\n');

const src = read(RULES);
// Prose is not checked, but a fenced block is not prose — it is code somebody may
// copy, and the ids inside it are examples rather than citations.
const fenced = [];
const body = src.replace(/```[\s\S]*?```/g, (m) => { fenced.push(m); return '\n'; });

// ── 1 · every rule has one address ──────────────────────────────────────────
// TWO FORMATS, because the file has two eras. Groups A–H were written as bold
// inline rules — `**A1. What the text says…**` — and everything from J on is a
// markdown heading. Reading only the headings makes every citation into Part 1
// look broken, which is what the first run reported: thirty of them.
// TWO FORMATS, because the file has two eras. Groups A–H were written as bold
// inline rules — `**A1. What the text says…**` — and everything from J on is a
// markdown heading. Reading only the headings makes every citation into Part 1
// look broken, which is what the first run reported: thirty of them.
const headed = [...src.matchAll(/^#{2,4} ([A-Z]{1,2}\d+[a-z]?) [·—-]/gm)].map((m) => m[1]);
const bolded = [...src.matchAll(/^\*\*([A-Z]{1,2}\d+[a-z]?)\. /gm)].map((m) => m[1]);
const heads = [...headed, ...bolded];

// A RESTATEMENT IS NOT A COLLISION, and the first draft could not tell them
// apart — it reported nine, of which six were Part 1 naming a rule that gets a
// full section later (C18, H57–H60). That is the file working as intended: the
// short form where an author is scanning, the long form where they need the
// reasoning. What U4 is about is two DIFFERENT rules at one address, which is
// always two of the SAME kind — two headings, or two bold rules — because that
// is what happens when somebody reaches for the next free number in a group and
// does not grep first.
const dupes = [];
for (const list of [headed, bolded]) {
  const seen = new Set();
  for (const id of list) { if (seen.has(id)) dupes.push(id); else seen.add(id); }
}
if (dupes.length) bad(`${dupes.length} rule id(s) used twice (U4)`, [...new Set(dupes)].join(' · '));
else ok(`all ${heads.length} rule ids are unique`, `an id is an address (U4) — ${headed.length} headed, ${bolded.length} in Part 1`);

// ── 2 · every check it names is a real npm script ───────────────────────────
const pkg = JSON.parse(read('package.json'));
const scripts = new Set(Object.keys(pkg.scripts || {}));
const named = [...new Set([...body.matchAll(/\b(?:npm run |`)((?:check|make|sheet):[a-z-]+)/g)].map((m) => m[1]))];
const missingScript = named.filter((n) => !scripts.has(n));
if (missingScript.length) bad(`${missingScript.length} named command(s) are not in package.json`, missingScript.join(' · '));
else ok(`all ${named.length} commands the rules name exist`, 'a citation to a check nobody can run is worse than none');

// ── 3 · every script path it names is on disk ───────────────────────────────
const paths = [...new Set([...body.matchAll(/\b(scripts\/[\w./-]+\.mjs)/g)].map((m) => m[1]))];
const missingPath = paths.filter((p) => !fs.existsSync(path.join(ROOT, p)));
if (missingPath.length) bad(`${missingPath.length} script path(s) do not exist`, missingPath.join(' · '));
else ok(`all ${paths.length} script paths the rules name exist`);

// ── 4 · every rule it cites is a rule that exists ───────────────────────────
//
// Only where the citation is unambiguous: a bare capital-plus-digits is also how
// this file writes co-ordinates, colours and versions, so the pattern is anchored
// on the shapes a citation actually takes — "see H60c", "(D31)", "rule 1b".
const ids = new Set(heads);
// WHICH GROUPS EXIST — from the "## Group X" headings AND from the letters of
// every rule this file actually heads. Reading only the headings was the first
// draft and it reported SEVENTY citations as broken, because groups A–H predate
// the "## Group" convention entirely: a detector that fires on a third of the
// file has told you nothing (LESSON_RULES Part 3), so it is calibrated against
// the citations whose answer is already known before it is believed.
const groupOnly = new Set([
  ...[...src.matchAll(/^## Group ([A-Z]{1,2}) /gm)].map((m) => m[1]),
  ...heads.map((h) => h.match(/^([A-Z]{1,2})/)[1]),
]);
const cited = new Set();
for (const m of body.matchAll(/(?:\bsee |\brule |\(|, |; )([A-Z]{1,2}\d+[a-z]?)(?=[)\s.,;:]|$)/g)) cited.add(m[1]);
const unknown = [...cited].filter((c) => {
  if (ids.has(c)) return false;
  // A group letter with a number this file never headed — but the group exists —
  // is a rule that was folded into prose rather than a broken address, and this
  // file has a lot of those. Only flag a citation whose GROUP does not exist.
  const g = c.match(/^([A-Z]{1,2})/)[1];
  return !groupOnly.has(g) && !ids.has(c);
});
if (unknown.length) bad(`${unknown.length} citation(s) point at a group that does not exist`, unknown.slice(0, 6).join(' · '));
else ok(`every rule citation names a group this file actually has`, `${cited.size} citations`);

// ── 5 · every budget it names is a constant in the code ─────────────────────
const codeText = ['scripts', 'components/lesson/cinematic', 'constants', 'data', 'lib']
  .flatMap((d) => walk(path.join(ROOT, d)))
  .filter((f) => /\.(mjs|ts|tsx)$/.test(f))
  .map((f) => fs.readFileSync(f, 'utf8'))
  .join('\n');
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
// AN UNDERSCORE IS WHAT MAKES IT A CONSTANT RATHER THAN A WORD IN CAPITALS.
// Without that the pattern also catches strings the rules QUOTE off the screen —
// the first run flagged `PHILOSOPHERS`, which is not a constant at all but one of
// five strings a broken probe kept reporting from the reward modal. Every budget
// this rule exists to protect is underscored: CARD_BUDGET, SOLID_FLOOR,
// WALK_SPEED, MIN_VERSION_CODE, FREE_DAILY_LESSON_LIMIT.
const consts = [...new Set([...body.matchAll(/`([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+)`/g)].map((m) => m[1]))];
const missingConst = consts.filter((c) => !new RegExp(`\\b${c}\\b`).test(codeText));
if (missingConst.length) bad(`${missingConst.length} named constant(s) are not in the code`, missingConst.join(' · '));
else ok(`all ${consts.length} constants the rules name exist in the code`, 'a budget nobody turns is not a ratchet');

// ── 6 · every costume it names is in the wardrobe ───────────────────────────
const ward = read(process.env.WARDROBE_FILE || 'components/lesson/cinematic/wardrobe.ts');
const costumes = new Set([...ward.matchAll(/\{ id: '([a-z]+)', label:/g)].map((m) => m[1]));
const RETIRED = /RETIRED_/.test(ward);
const namedCostumes = [...new Set([...body.matchAll(/`(plain|dandy|gent|scholar|magistrate|traveller|aesthete|lecturer|stroller|ringmaster)`/g)].map((m) => m[1]))];
const goneCostume = namedCostumes.filter((c) => !costumes.has(c));
if (goneCostume.length) bad(`${goneCostume.length} costume(s) named here are not in the wardrobe`, goneCostume.join(' · '));
else ok(`all ${namedCostumes.length} costumes the rules name are in the wardrobe`, `${costumes.size} exist${RETIRED ? ', retired pieces kept and unreferenced' : ''}`);

// ── 7 · a rule that says something was LEFT ALONE has to still be true ──────
//
// The one class of staleness that actively misleads: a rule recording a deferred
// debt reads as "do not spend time here", so it survives long after the debt is
// paid. moves.ts rule 1b said the first living shelf "was left alone on purpose"
// for weeks after a reader complained about exactly it. There is no way to check
// the general form, so this checks the instance that bit: if no used act still
// hangs its hands inside the trunk, no rule may say the shelf was left alone.
const moves = read('components/lesson/cinematic/moves.ts');
// READ ONLY THE SOURCE, NEVER THIS FILE. U7 exists to be written down, and writing
// it means QUOTING the retired note — so testing the rule book too made the rule
// fire on its own explanation. A checker that cannot tell an assertion from a
// quotation of a dead one is the boxiness metric again.
const shelfLeft = /(the first shelf|the twenty acts)[^.]{0,80}(were|was) (left alone|deliberately left)/i.test(moves);
const { loadRig } = await import('./lib/loadrig.mjs');
const { corpus } = await import('./lib/gestures.mjs');
const { RIG, MOVES } = await loadRig();
const CLEAR = RIG.STR.torso / 2 + RIG.STR.limb / 2;
const used = new Set();
for (const l of corpus()) for (const b of l.beats) used.add(b.code);
let inside = 0;
for (let act = 59; act <= 78; act += 1) {
  const code = act + 99;
  if (!used.has(code) && !used.has(act + 299)) continue;
  let r = 0;
  for (const t of [0, 0.7, 1.4, 2.1, 2.8, 3.5, 4.2]) {
    const s = MOVES.emoteAny(code, t);
    for (const f of [s.fistL, s.fistR]) if (f) r = Math.max(r, Math.abs(f.x));
  }
  if (r < CLEAR) inside += 1;
}
if (inside && !shelfLeft) bad(`${inside} used act(s) of the first living shelf still hang inside the trunk and no rule says so`);
else if (!inside && shelfLeft) bad('a rule still says the first living shelf was left alone, and it no longer is', 'a deferred-debt note that outlives the debt reads as "do not look here"');
else ok(inside ? `${inside} shelf act(s) still inside the trunk, and a rule says so` : 'the first living shelf is out of the trunk, and no rule claims otherwise');

// ── 8 · A NUMBER THE CHECKLIST QUOTES IS THE NUMBER THE CHECKER ENFORCES ────
//
// Part 2 is the list an author actually works through, so a threshold that has
// moved in the code and not here is read as the rule. It had already happened:
// J11 raised the reading-ease floor from 55 to 60 and SAYS SO in its own section,
// while the checklist twenty pages later still asked for 55 — two rules in one
// file disagreeing, with the stale one in the place people read.
//
// Only thresholds that are a single named constant somewhere. The table is short
// on purpose: a pairing nobody can re-derive is a comment, and this file already
// has plenty.
const PAIRS = [
  { what: 'the reading-ease floor', file: 'scripts/check-plain.mjs', konst: 'EASE_FLOOR', in: /reading ease (\d+) or better/ },
  { what: 'the pointer ceiling', file: 'scripts/check-plain.mjs', konst: 'POINTER_CEIL', in: /under (\d+)% of\s+the words are/, scale: 100 },
];
const drifted = [];
for (const p of PAIRS) {
  const m = body.match(p.in);
  if (!m) { drifted.push(`${p.what}: the checklist no longer states it`); continue; }
  const code = read(p.file).match(new RegExp(`const ${p.konst} = ([\\d.]+)`));
  if (!code) { drifted.push(`${p.what}: ${p.konst} is gone from ${p.file}`); continue; }
  const want = Number(code[1]) * (p.scale || 1);
  if (Number(m[1]) !== want) drifted.push(`${p.what}: the rules say ${m[1]}, ${p.konst} is ${want}`);
}
if (drifted.length) bad(`${drifted.length} threshold(s) in the checklist disagree with the checker`, drifted.join(' · '));
else ok(`every threshold the checklist quotes matches its checker`, `${PAIRS.length} re-derived`);

console.log(fails ? `\n${fails} failing.\n` : '\nthe rule book still describes the app.\n');
process.exit(fails ? 1 : 0);
