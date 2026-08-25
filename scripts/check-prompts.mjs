// Are the questions followable? — group I of docs/LESSON_RULES.md, as arithmetic.
//
// Groups A–H are about the picture. This is about the sentence next to it, and it
// exists because a reader said the questions were the moments they felt confused.
// The three rules here are the ones that can be counted:
//
//   I71  the prompt names something that is ON THE SCREEN
//   I72  no back-reference to a sentence that has scrolled away
//   I73  one idea, under 18 words
//
// Each carries a HIGH-WATER MARK rather than a hard zero, the same shape as
// CARD_BUDGET and UNRINGED_BUDGET: the debts were inherited, they may only fall,
// and a new lesson cannot add to them.
//
// Run: node scripts/check-prompts.mjs
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'components', 'lesson', 'cinematic');

// ── the budgets. DOWN ONLY. ──────────────────────────────────────────────────
const LONG_BUDGET = 0;      // prompts over 18 words
const VAGUE_BUDGET = 0;     // prompts pointing at something off-screen

const MAX_WORDS = 18;

// A prompt may point at "the one", "that claim", "this line" only if it also names
// the thing on stage. These are the phrases that, alone, ask the reader to hold a
// sentence they can no longer see.
const VAGUE = /\b(that|this|the) (line|claim|move|step|idea|point|statement|sentence|rule|answer)\b|\bthe above\b|\bit belongs?\b/i;

// Something a reader can actually look at. Deliberately broad: the point is that
// SOME concrete noun appears, not that we can enumerate every scene's props.
const CONCRETE = /\b(board|pan|door|lever|card|box|jar|scale|scales|path|lamp|switch|tile|panel|shelf|seat|cup|bell|gate|rung|step|steps|map|maps|pipe|pipes|tray|trays|gauge|needle|column|columns|bar|bars|plate|plates|figure|figures|child|children|coin|coins|key|keys|book|books|line|lines|slice|slices|block|blocks|button|buttons|label|labels|sign|signs|wall|window|chair|table|rope|cage|jarful|bulb|dial|arrow|arrows|circle|square|shape|shapes|face|faces|hand|hands|room|rooms|clock|mirror|lock|brick|bricks|stone|stones|thread|track|tracks|rail|rails|bag|bottle|glass|beam|plank|ladder|bridge|tower|flag|torch|candle|knot|chain|wheel|cog|spring|weight|weights|pile|stack|heap|list|grid|cell|cells|tank|valve|drum|drop|drops|seed|plant|tree|leaf|leaves|animal|dog|cow|bird|note|notes|person|people|worker|workers|player|players|voter|voters|judge|juror|guard|prisoner|door)s?\b/i;

const rows = [];
for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('Script.ts')).sort()) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const name = f.replace('Script.ts', '');
  for (const kind of ['interact', 'mc', 'tap']) {
    const re = new RegExp(`\\b${kind}:\\s*\\{\\s*[\\r\\n]+\\s*prompt:\\s*(['"])((?:(?!\\1)[\\s\\S])*)\\1`, 'g');
    for (const m of src.matchAll(re)) {
      // Does this block print its own answers? See the note on `vague` below.
      // ANY of the six controls counts, not just the deck: `drag`, `lever`,
      // `plot`, `split` and `field` all draw their labels and their live readout
      // directly under the art, which is the whole basis of the exemption.
      const cards = /\n\s{6}(?:cards|drag|lever|plot|split|field):\s*[[{]/.test(src.slice(m.index, m.index + 1400));
      rows.push({ name, kind, prompt: m[2], cards });
    }
  }
}

const words = (s) => s.trim().split(/\s+/).length;
const long = rows.filter((r) => words(r.prompt) > MAX_WORDS);
// A prompt is only "vague" if it leans on a back-reference AND names nothing you
// can look at. "Which board does that line belong on" names a board, so the
// reader has somewhere to point even while the phrasing is loose.
//
// INTERACT ONLY, and that is the whole point of the rule rather than a softening
// of it. I71 exists because the reader has to FIND the target among the scenery.
// An `mc` prints its options as labelled buttons directly under the prompt, so
// "What follows about the rain?" is perfectly followable there — the answers are
// the three things in front of you. Applying the rule to mc flagged three
// perfectly clear questions and would have had them rewritten to say less.
// AND NOT AN INTERACT THAT CARRIES ITS OWN CONTROL, for exactly the reason given
// above for `mc`. `interact` used to mean one thing — find the target in the
// scenery — and now means several: that, or two short choices printed under the
// art, or one of the four analogue controls. All of them put the answers in front
// of the reader just as the old A/B/C/D deck did, so "What follows about the
// rain?" is followable there and naming a stage object is not required.
// Converting the deck brought three such prompts under this rule and would have
// had them rewritten to say less — the same mistake the mc exemption records.
//
// The list started as `cards` alone, and stayed that way while `drag` was rare.
// Converting 127 lessons is what exposed it: a `split` prints two named sides and
// a live sentence above the seam, which is MORE on screen than a deck offers, and
// two perfectly followable prompts were reported as pointing at nothing. When the
// lessons gain a new way to answer, the rule about prompts gains one too (L7).
const vague = rows.filter(
  (r) => r.kind === 'interact' && !r.cards && VAGUE.test(r.prompt) && !CONCRETE.test(r.prompt),
);

console.log(`${rows.length} question prompts across ${new Set(rows.map((r) => r.name)).size} lessons`);
console.log(`  mean ${(rows.reduce((a, r) => a + words(r.prompt), 0) / rows.length).toFixed(1)} words`);

let fail = false;
const report = (label, list, budget, rule) => {
  if (list.length > budget) {
    fail = true;
    console.log(`\n${rule}: ${list.length} ${label}, budget ${budget}:`);
    for (const r of list) console.log(`   ${r.name}/${r.kind}  ${words(r.prompt)}w  ${r.prompt}`);
  } else if (list.length) {
    console.log(`\n${rule} debt: ${list.length}/${budget} ${label} — ` +
      list.map((r) => `${r.name}/${r.kind}`).join(', ') + '\n  Fix one and lower the budget. It may never go up.');
  } else {
    console.log(`  ok   ${rule}: no ${label}`);
  }
};

report(`prompts over ${MAX_WORDS} words`, long, LONG_BUDGET, 'I73');
report('prompts pointing at something off-screen', vague, VAGUE_BUDGET, 'I72/I71');

if (fail) {
  console.log('\nSee group I in docs/LESSON_RULES.md. A prompt is a question the reader');
  console.log('can answer by LOOKING — name the thing on the stage, and keep it short.');
  process.exit(1);
}
console.log('\nEvery question prompt is short and points at something on the screen.');
