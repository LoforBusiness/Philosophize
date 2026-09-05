// ─────────────────────────────────────────────────────────────────────────────
// PROPOSE THE ONE PHRASE PER LESSON WORTH REMEMBERING.
//
//   node scripts/make-focus.mjs              # print the proposals for review
//   node scripts/make-focus.mjs --top 3      # print the runners-up too
//   node scripts/make-focus.mjs --write      # write data/lessonFocus.ts
//   node scripts/make-focus.mjs --write --keep   # keep hand-edited entries
//
// ── IT RANKS, IT DOES NOT JUDGE ─────────────────────────────────────────────
//
// The same stance `scripts/survey-lessons.mjs` takes, and for the same reason:
// nothing countable can tell you which sentence of a lesson is its point. What a
// scorer CAN do is put the two or three plausible ones at the top of a list of
// 186, which is small enough for a person to read. Every proposal here is meant
// to be read and about a third of them to be replaced by hand — a table that was
// generated and never looked at would be exactly the "AI-sounding words" §19
// records a reader catching on the welcome screen.
//
// ── WHAT IT LOOKS FOR ───────────────────────────────────────────────────────
//
// A maxim is a GENERAL CLAIM, in the present tense, that would survive being cut
// out of the lesson. That is measurable in three signals, and the negative ones
// matter more than the positive:
//
//   IT MUST NOT BE THE SET-UP. Narrative beats are past tense and particular
//   ("Athens watches Oedipus work out that he killed his own father"). The claim
//   they are building to is the one that generalises.
//
//   IT MUST NOT CARRY A NAME. A phrase containing a philosopher already has one
//   mark on it — the era colour — and two emphases on one span is not more
//   emphatic, it is a mess. This is also why the name index is loaded here
//   rather than approximated: the check has to agree with what actually renders.
//
//   IT MUST NOT BE AN INSTRUCTION. "Tap the one that…" is the question talking.
//   Those beats are excluded outright, but the phrasing leaks into narration too.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import { wiredLessons, scriptFor, readScript, decomment, beatsBody, beatChunks } from './lib/gestures.mjs';

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const KEEP = args.includes('--keep');
const TOP = Number(args[args.indexOf('--top') + 1]) || 1;

const OUT = 'data/lessonFocus.ts';

// A LESSON WITH NO GOOD CANDIDATE GETS NO MARK, and that is the point of a floor.
// A highlighter on a merely-acceptable sentence is worse than none: it tells the
// reader that the prop in the story is the thing to carry away. So the bar is set
// where the proposals stop being maxims, and whatever falls below it is printed
// as needing a hand.
const MIN = Number(process.env.FOCUS_MIN || 9);

// ── the names, so a proposal never lands on one ───────────────────────────────
const NAMES = (() => {
  const src = fs.existsSync('data/lessonNames.ts') ? readScript('data/lessonNames.ts') : '';
  const out = new Map();
  for (const m of src.matchAll(/'([a-z0-9-]+)':\s*\[([\s\S]*?)\],\n/g)) {
    out.set(m[1], [...m[2].matchAll(/\['([^']+)',/g)].map((x) => x[1]));
  }
  return out;
})();

const unquote = (raw) => raw
  .replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\`/g, '`')
  .replace(/\\n/g, '\n').replace(/\\\\/g, '\\');

/** The beat-level `text:` — at exactly four spaces, so a `say:` bubble's own text is not it. */
function beatText(chunk) {
  const m = chunk.match(/\n {4}text:\s*'((?:[^'\\]|\\.)*)'/)
    || chunk.match(/\n {4}text:\s*"((?:[^"\\]|\\.)*)"/)
    || chunk.match(/\n {4}text:\s*`((?:[^`\\]|\\.)*)`/);
  return m ? unquote(m[1]) : null;
}

const WORDS = (t) => t.split(/\s+/).filter(Boolean).length;

// A claim rather than a narration: present tense, general subject.
const GENERAL = /\b(is|are|means|meant|cannot|can|never|always|only|must|nothing|no one|every|any|all|becomes|stays|remains|counts|depends|makes|does not|doesn|isn|comes down to|either)\b/i;
// The lesson addressing the reader — these lessons do it constantly and it is
// where the punchlines live ("you cannot reason your way out of a tune").
const SECOND = /\byou(r|rs)?\b/i;
// A conclusion marker: the clause AFTER one of these is the payoff.
const TURN = /\b(because|so that|and that is|which is why|that is why|so|but)\b/i;
const ORDER = /^(tap|drag|set|choose|slide|pick|move|put|place|watch|notice|look|imagine|suppose|say|try)\b/i;

// ── THE NARRATIVE SIGNATURE ─────────────────────────────────────────────────
//
// The first two drafts kept nominating sentences like "You glance outside and
// rain is falling", "On road B the child is there", "Then they meet, and you are
// born". Every one is a fine sentence and none is a maxim — they are the STORY,
// and a highlighter on the story tells the reader to remember a prop.
//
// What separates them is measurable and it is mostly tense and deixis: a maxim
// is present-tense and unanchored, a narration beat is past-tense or pinned to a
// moment ("now", "then", "here") or to a labelled thing in the scene ("road B",
// "trap two", "the third jar").
const PAST = /\b(was|were|had|did|thought|said|wanted|drew|walked|watched|asked|held|took|gave|made|saw|came|went|knew|built|wrote|called|left|put|found|showed)\b|\w+ed\b/i;
const DEICTIC = /^(now|then|here|there|so|next|first|second|third|finally|meanwhile|today|once)\b|\b(this|that|these|those|his|her|their|its) \w+ (is|are|was|were)\b/i;
const LABEL = /\b(road|trap|case|jar|box|door|lever|card|column|row|option|step|lesson|figure|panel)\s+(one|two|three|four|five|[A-Z0-9])\b/i;

/** Content words of a phrase, for comparing against the lesson's own summary. */
const CONTENT = (t) => new Set(
  t.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w)),
);
const STOP = new Set(['this', 'that', 'these', 'those', 'they', 'them', 'then', 'than', 'with', 'from',
  'have', 'been', 'were', 'what', 'when', 'will', 'your', 'you', 'about', 'into', 'over', 'because',
  'which', 'their', 'there', 'here', 'does', 'each', 'only', 'just', 'also', 'more', 'most', 'some',
  'thing', 'things', 'something', 'anything', 'nothing', 'someone', 'anyone', 'everyone']);

/** The lesson's own summary points — the distillation somebody already wrote. */
function summaryWords(chunks) {
  const out = [];
  for (const c of chunks) {
    if (!/\n {4}summary:/.test(c)) continue;
    for (const m of c.matchAll(/'((?:[^'\\]|\\.)*)'/g)) out.push(unquote(m[1]));
  }
  return out.map(CONTENT);
}

// A TAIL MUST STAND ALONE OR IT IS NOT A MAXIM, and the first draft proved it:
// cutting after every comma and conjunction produced "and never saw a thing",
// "the other says it is not", "is a name for socially approved habits" — spans
// that are ordinary English inside their sentence and gibberish with a
// highlighter round them. The reader meets the mark as a thing to carry away
// from the sentence it came out of, so it has to survive being taken out of it.
const LEAD_BAN = /^(and|but|so|or|nor|yet|because|which|that|then|than|who|whom|whose|where|while|if|when|as|since|though|although|until|unless|about|into|onto|over|under|is|are|was|were|be|been|being|has|have|had|do|does|did|to|of|in|on|at|by|with|from|also|too|just|even|still|again|instead|rather|thus|hence|therefore|however|meanwhile|otherwise)\b/i;

/** Candidate spans of one beat's text: whole sentences, and the clause after a turn. */
function candidates(text) {
  const out = [];
  const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  for (const s of sentences) {
    // A QUESTION IS NEVER THE MAXIM, and it took a rendered list to notice that
    // the score could not see one: the terminal punctuation is stripped to make
    // the span, and the rejection test then ran on the stripped copy. So "Why is
    // there something rather than nothing?" arrived as a confident proposal. The
    // sentence is judged before it is cut, not after.
    if (/\?\s*$/.test(s)) continue;
    const bare = s.replace(/[.!?]+$/, '').trim();
    if (bare) out.push(bare);
    // The half after a comma, dash or conjunction — a maxim is often the tail of
    // a sentence whose head is the set-up.
    for (const m of bare.matchAll(/(?:,|—|--)\s+|(?:\bbecause\b|\bso\b|\bbut\b|\band that is\b|\bwhich is why\b)\s+/gi)) {
      const tail = bare.slice(m.index + m[0].length).trim();
      if (tail && !LEAD_BAN.test(tail)) out.push(tail);
    }
  }
  return [...new Set(out)];
}

function score(phrase, { names, at, of: total, summary }) {
  const n = WORDS(phrase);
  if (n < 4 || n > 14) return -1;
  if (/[?]/.test(phrase)) return -1;
  if (ORDER.test(phrase)) return -1;
  // A quotation mark inside the span means the sentence was carrying somebody
  // else's words, and half of a quoted phrase is the worst thing to highlight.
  if (/["“”„«»]/.test(phrase)) return -1;
  for (const nm of names) if (phrase.includes(nm)) return -1;

  let s = 0;
  // A whole sentence beats a tail, all else equal — it is already known to stand
  // on its own, which is the property a tail has to be argued into.
  if (/^[A-Z]/.test(phrase)) s += 2;
  if (GENERAL.test(phrase)) s += 3;
  if (SECOND.test(phrase)) s += 2;
  if (TURN.test(phrase)) s += 1;
  // A punchline lands late in the lesson and late in its own sentence, but the
  // very last narration beat is usually the hand-off to the summary.
  const where = total > 1 ? at / (total - 1) : 0;
  s += where > 0.35 && where < 0.92 ? 2 : 0;
  // Six to ten words is where a memorable line sits; longer reads as a paragraph
  // wearing a highlighter.
  s += n >= 5 && n <= 10 ? 2 : 0;
  // The story, not the point.
  if (PAST.test(phrase)) s -= 4;
  if (DEICTIC.test(phrase)) s -= 3;
  if (LABEL.test(phrase)) s -= 4;

  // THE LESSON ALREADY DISTILLED ITSELF. Its summary points are three authored
  // one-liners saying what it was about, so a narration sentence that restates
  // one of them is the sentence those points were drawn from. This is the single
  // strongest signal available and it costs nothing — the text is already there.
  const cw = CONTENT(phrase);
  let best = 0;
  for (const pt of summary) {
    let shared = 0;
    for (const w of cw) if (pt.has(w)) shared++;
    if (cw.size) best = Math.max(best, shared / Math.min(cw.size, pt.size || 1));
  }
  s += Math.round(best * 9);

  return s;
}

const lessons = wiredLessons();
const rows = [];
for (const [id, comp] of lessons) {
  const p = scriptFor(comp);
  if (!p) continue;
  const body = beatsBody(decomment(readScript(p)));
  if (!body) { rows.push({ id, err: 'no BEATS' }); continue; }
  const chunks = beatChunks(body);
  const names = NAMES.get(id) ?? [];
  const summary = summaryWords(chunks);

  const pool = [];
  chunks.forEach((chunk, i) => {
    // Never on a beat carrying a question, a quote or the summary.
    if (/\n {4}(interact|quote|summary|tap):/.test(chunk)) return;
    const text = beatText(chunk);
    if (!text) return;
    for (const c of candidates(text)) {
      const sc = score(c, { names, at: i, of: chunks.length, summary });
      if (sc >= MIN) pool.push({ beat: i, phrase: c, sc, text });
    }
  });
  pool.sort((a, b) => b.sc - a.sc || WORDS(a.phrase) - WORDS(b.phrase));
  rows.push({ id, picks: pool.slice(0, TOP), any: pool.length });
}

const good = rows.filter((r) => r.picks && r.picks.length);
if (!WRITE) {
  for (const r of rows) {
    if (r.err) { console.log(`${r.id}  !! ${r.err}`); continue; }
    if (!r.picks.length) { console.log(`${r.id}  -- NOTHING SCORED`); continue; }
    console.log(`${r.id}`);
    for (const pk of r.picks) console.log(`   b${pk.beat} [${pk.sc}] ${pk.phrase}`);
  }
  console.log(`\n${good.length}/${rows.length} lessons have a proposal; ` +
    `${rows.length - good.length} need one written by hand.`);
} else {
  const held = new Map();
  if (KEEP && fs.existsSync(OUT)) {
    const cur = readScript(OUT);
    for (const m of cur.matchAll(/'([a-z0-9-]+)':\s*\{\s*beat:\s*(\d+),\s*phrase:\s*'((?:[^'\\]|\\.)*)',?\s*\}/g)) {
      held.set(m[1], { beat: Number(m[2]), phrase: unquote(m[3]) });
    }
  }
  const head = readScript(OUT).split('export const LESSON_FOCUS')[0];
  const lines = [];
  for (const r of rows) {
    const kept = held.get(r.id);
    const pick = kept ?? (r.picks && r.picks[0] ? { beat: r.picks[0].beat, phrase: r.picks[0].phrase } : null);
    if (!pick) continue;
    lines.push(`  '${r.id}': { beat: ${pick.beat}, phrase: '${pick.phrase.replace(/'/g, "\\'")}' },`);
  }
  fs.writeFileSync(OUT, `${head}export const LESSON_FOCUS: Record<string, LessonFocus> = {\n${lines.join('\n')}\n};\n`);
  console.log(`${OUT}: ${lines.length} lessons (${held.size} kept by hand)`);
}
