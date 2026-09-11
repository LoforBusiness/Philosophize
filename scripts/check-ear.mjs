// ─────────────────────────────────────────────────────────────────────────────
// GROUP AC — THE PARAGRAPH IS HEARD. GROUP AD — IT MUST NOT READ AS GENERATED.
//
//   npm run check:ear
//   node scripts/check-ear.mjs --list expanded     every hit for one rule
//   node scripts/check-ear.mjs --lesson ethics2    one lesson, every rule
//   node scripts/check-ear.mjs --json              counts only (the counter-test)
//
// The narration is written to be spoken — Chirp 3 HD, the en-GB voice Algieba, on
// by default (decided 11 Sep 2026; the audio pipeline is still being built) — with
// every word appearing as the voice reaches it. That changes what a
// sentence is for: it is heard once, with no going back, and it has to say on
// screen exactly what the voice says. The rules are in scripts/lib/earrules.mjs,
// shared with anything that lints one lesson, so the two cannot disagree.
//
// ── MEASURED BEFORE IT WAS WRITTEN ──────────────────────────────────────────
//
// Across 1,718 narration beats: 15 beats whose quotation marks did not close
// (the old sentence splitter deleted the closing mark), 2 sentences carried
// across a tap, 23 beats setting a word in CAPITALS, 21 sentences naming things
// with bare letters, 19 semicolons, and ~637 spelled-out forms against 3
// contractions. And almost none of the strongest research-backed markers of
// generated prose — which is why group AD is mostly zeros that keep it so.
//
// ── THREE KINDS OF RULE ──────────────────────────────────────────────────────
//
//   ZERO    a hit fails the build. These are the defects with no good instance.
//   BUDGET  a high-water mark that may only go DOWN — a spelled-out "is not" is
//           sometimes exactly right (AC4), a dash sometimes is an interruption
//           (AC7). The budget is what makes the NEXT one a decision.
//   LIST    printed for a person and never fails: whether a negation knocks down
//           a claim anybody holds (AD2) is not something a pattern can know.
//
// A stale budget fails too, like check:voice. A ratchet that can sit above the
// count lets the count drift back up to it without anyone deciding anything.
//
// Counter-tested by `node scripts/countertest-ear.mjs`.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { RULES, piecesOf, faultsOf } from './lib/earrules.mjs';

const DIR = process.env.EAR_DIR || 'components/lesson/cinematic';

// THE FOUR BUDGETS, SET FROM THE CORPUS AFTER THE REWRITE (11 Sep 2026). Before it:
// 1,272 spelled-out forms, 18 unframed quotations, 148 dashes, 270 intensifiers.
// What is left was kept on purpose, lesson by lesson — a "not" that is the claim,
// a maxim kept word for word, a dash that glosses — so each is a decision, and the
// next one has to be too.
/** AC4 — spelled-out forms left where the "not" or the "is" is the point. May only go DOWN. */
const EXPANDED_BUDGET = 407;
/** AC5 — quoted phrases with no spoken frame. May only go DOWN. */
const UNFRAMED_BUDGET = 9;
/** AC7 — dashes in narration, each one a real interruption. May only go DOWN. */
const DASH_BUDGET = 38;
/** AD6 — intensifiers that survived being asked what they change. May only go DOWN. */
const ADVERB_BUDGET = 57;
const BUDGETS = { EXPANDED_BUDGET, UNFRAMED_BUDGET, DASH_BUDGET, ADVERB_BUDGET };

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? (args[i + 1] ?? '') : null;
};
const LIST = flag('--list');
const LESSON = flag('--lesson');
const JSON_OUT = args.includes('--json');

const hits = new Map(RULES.map((r) => [r.id, []]));
let pieces = 0;
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('Script.ts')).sort()) {
  const stem = f.replace('Script.ts', '');
  if (LESSON && stem !== LESSON) continue;
  const src = fs.readFileSync(path.join(DIR, f), 'utf8').replace(/\r\n/g, '\n');
  for (const p of piecesOf(src)) {
    pieces += 1;
    for (const fault of faultsOf(p)) {
      for (const h of fault.hits) hits.get(fault.id).push({ stem, kind: p.kind, i: p.i, h, s: p.s });
    }
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify(Object.fromEntries([...hits].map(([k, v]) => [k, v.length]))));
  process.exit(0);
}

if (LIST) {
  const rows = hits.get(LIST);
  if (!rows) { console.log(`no rule "${LIST}" — ${RULES.map((r) => r.id).join(' · ')}`); process.exit(1); }
  for (const r of rows) console.log(`${r.stem}/${r.kind}#${r.i}  [${r.h}]  ${r.s.slice(0, 120)}`);
  console.log(`\n${rows.length} hit(s)`);
  process.exit(0);
}

console.log(`\ncheck:ear — the paragraph is heard (AC), and must not read as generated (AD)\n`);
console.log(`  ${pieces} pieces of prose${LESSON ? ` in ${LESSON}` : ''}\n`);

let fails = 0;
for (const r of RULES) {
  const rows = hits.get(r.id);
  const n = rows.length;
  let line;
  if (r.gate === 'zero') {
    const bad = n > 0;
    if (bad) fails += 1;
    line = `${bad ? 'FAIL' : 'ok  '}  ${r.rule.padEnd(4)} ${r.id.padEnd(11)} ${String(n).padStart(4)}  ${r.what}`;
  } else if (r.gate === 'budget') {
    const budget = BUDGETS[r.budget];
    const over = !LESSON && n > budget;
    const stale = !LESSON && n < budget;
    if (over || stale) fails += 1;
    line = `${over || stale ? 'FAIL' : 'ok  '}  ${r.rule.padEnd(4)} ${r.id.padEnd(11)} ${String(n).padStart(4)}  of ${budget} — ${r.what}`
      + (stale ? `\n        lower ${r.budget} to ${n} in scripts/check-ear.mjs` : '');
  } else {
    line = `list  ${r.rule.padEnd(4)} ${r.id.padEnd(11)} ${String(n).padStart(4)}  ${r.what}  (--list ${r.id})`;
  }
  console.log(`  ${line}`);
  if ((r.gate === 'zero' && n) || (LESSON && n && r.gate !== 'list')) {
    for (const x of rows.slice(0, LESSON ? 50 : 5)) console.log(`          ${x.stem}/${x.kind}#${x.i}  [${x.h}]  ${x.s.slice(0, 90)}`);
    if (!LESSON && rows.length > 5) console.log(`          … ${rows.length - 5} more (--list ${r.id})`);
  }
}

console.log(fails ? `\n${fails} failing.\n` : '\nthe narration is written to be heard.\n');
process.exit(LESSON ? 0 : (fails ? 1 : 0));
