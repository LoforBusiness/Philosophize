// ─────────────────────────────────────────────────────────────────────────────
// THE PARAGRAPH IS HEARD — groups AC and AD of the rule book, as code.
//
//   npm run check:ear        holds them across the corpus
//
// One definition, two readers, for the reason `liveliness.mjs` gives: a rule
// written twice is two rules, and they drift. Anything that lints ONE lesson
// imports `faultsOf` from here rather than keeping its own copy.
//
// ── WHY THE NARRATION IS HELD TO ITS OWN STANDARD ────────────────────────────
//
// `beat.text` is written to be spoken by Google's Chirp 3 HD voice (Algieba,
// en-GB) — decided 11 Sep 2026, on by default and mutable, each word appearing on
// screen as the voice reaches it. The audio pipeline is still being built; these
// rules hold now, because the lessons written today are the ones it will read.
// So every word on screen has to be a word the voice says (AC1), and every
// sentence has to work heard once, with no going back (AC2–AC9).
//
// `explain` and a summary's `closing` are NOT spoken. They share only the rules
// about reading as generated (AD) and about contractions (AC4): a deck whose
// verdict switches register from the paragraph above it reads as two authors.
//
// ── EVERY PATTERN IS A REGEX LITERAL ────────────────────────────────────────
//
// This toolchain halves backslashes inside strings (LESSON_RULES §13, "four
// probes in a row reported a clean corpus"), and a pattern built from a string
// silently matches nothing — which reports a clean corpus with total confidence.
// ─────────────────────────────────────────────────────────────────────────────

/** Beat-level narration sits at FOUR spaces; a quotation's `text` sits deeper and is the source's own words. */
const TEXT = /(?:^|\n) {4}text:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g;
const EXPLAIN = /\bexplain:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g;
const CLOSING = /\bclosing:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g;

const unq = (s) => s.replace(/\\(['"\\])/g, '$1');

/** Every piece of prose a script carries that these rules judge, in source order per kind. */
export function piecesOf(src) {
  const out = [];
  for (const [kind, re] of [['text', TEXT], ['explain', EXPLAIN], ['closing', CLOSING]]) {
    re.lastIndex = 0;
    let m;
    let i = 0;
    while ((m = re.exec(src))) out.push({ kind, i: i++, s: unq(m[2]) });
  }
  return out;
}

/**
 * Initials ("J. L. Austin", "A. J. Ayer") are not sentences — but a single letter
 * before a full stop is not always an initial. The first version protected every
 * `X. Y`, so "call it A. But the sentence…" and "they cross at C. Line AB…" were
 * each read as one sentence, which hid a bare letter A from AC1 and a sentence
 * from J1. A letter counts as an initial only when another initial sits next to
 * it: before it, or straight after it.
 */
const protect = (s) => s
  .replace(/\b([A-Z])\.\s(?=[A-Z]\.)/g, '$1<> ')
  .replace(/([A-Z]<>\s)([A-Z])\.\s(?=[A-Z])/g, '$1$2<> ');
export const wordsOf = (s) => s.match(/[A-Za-z0-9][A-Za-z0-9’'-]*/g) || [];
/**
 * Sentences, split AFTER any closing mark and only where the next one starts.
 *
 * The old splitter — `(?<=[.!?])["')\]]?\s+`, in split-beats and check-words —
 * put the optional closing quote INSIDE the separator, so every split after a
 * quoted question deleted the quote mark, and it split `Not "what do I do?" but
 * "who am I becoming?"` in the middle of one sentence (AC2).
 */
export const sentencesOf = (s) => protect(s)
  .split(/(?<=[.!?…]["”’')\]]?)\s+(?=["“‘'(]?[A-Z0-9])/)
  .map((x) => x.replace(/<>/g, '.'))
  .filter((x) => /[A-Za-z0-9]/.test(x));

// ── AC1 · every word on screen is a word the voice says ─────────────────────

/** Initialisms a person says as letters, and nothing else. */
const CAPS_OK = new Set(['BCE', 'CE', 'BC', 'AD', 'TV', 'DNA', 'UK', 'US', 'USA', 'OK', 'IQ', 'AI']);
function capsHits(s) {
  const out = [];
  for (const m of s.matchAll(/\b[A-Z]{2,}\b/g)) {
    if (CAPS_OK.has(m[0])) continue;
    const before = s.slice(Math.max(0, m.index - 12), m.index);
    // A line segment named by its two ends is spoken as two letters, which is right.
    if (m[0].length === 2 && /\b(?:line|side|segment|edge)\s$/i.test(before)) continue;
    out.push(m[0]);
  }
  return out;
}

function digitHits(s) {
  const out = [];
  for (const m of s.matchAll(/\b\d[\d,.]*(?:st|nd|rd|th|s)?\b/g)) {
    const tok = m[0];
    const after = s.slice(m.index + tok.length, m.index + tok.length + 5);
    const year = Number(tok.slice(0, 4));
    if (/^\d{4}s?$/.test(tok) && year >= 1000 && year <= 2099) continue;   // a year, said as a year
    if (/^\d{2,4}$/.test(tok) && /^\s(?:BCE|CE|BC|AD)\b/.test(after)) continue; // 350 BCE
    out.push(tok);
  }
  return out;
}

/** Nouns that make a following capital letter a label, not an article. */
const LABEL_NOUN = /\b(?:point|road|side|sphere|box|card|option|line|plan|claim|set|premise|case|world|room|door|path|group|town|island|person|patient|machine|column|row|bin|tray|figure|statement|sentence|coin|urn|bag|jar|ball|shape|square|circle|triangle|ship|planet|country|city|village|drug|policy|theory|view|answer|choice|button|lever|track|brain|body|copy|twin|clock|chair|table|cup|bottle|stone|animal|creature)\s$/i;
function letterAHits(s) {
  const out = [];
  for (const sen of sentencesOf(s)) {
    for (const m of sen.matchAll(/\bA\b/g)) {
      const before = sen.slice(0, m.index);
      if (!/[A-Za-z]/.test(before)) continue;                 // sentence-initial article
      if (/["“‘(]\s*$/.test(before)) continue;                // a quoted sentence starting
      if (/^\.\s?[A-Z]/.test(sen.slice(m.index + 1))) continue; // an initial: A. J. Ayer
      if (LABEL_NOUN.test(before)) continue;
      out.push(`…${sen.slice(Math.max(0, m.index - 18), m.index + 12)}…`);
    }
  }
  return out;
}

// ── AC2 · a beat holds whole sentences, and its quotes close inside it ──────

function quoteHits(s) {
  const straight = (s.match(/"/g) || []).length;
  const open = (s.match(/“/g) || []).length;
  const close = (s.match(/”/g) || []).length;
  return straight % 2 === 1 || open !== close ? [s.slice(0, 48)] : [];
}

function cutHits(s) {
  const t = s.trim();
  const out = [];
  if (/^["“‘'(]?[a-z]/.test(t)) out.push(`starts mid-sentence: ${t.slice(0, 28)}`);
  if (!/[.!?]["”’')\]]?$/.test(t)) out.push(`ends mid-sentence: ${t.slice(-28)}`);
  return out;
}

// ── AC4 · contract by default ────────────────────────────────────────────────

const EXPANDED = /\b(?:is|are|was|were|do|does|did|has|have|had|could|would|should|will|must|need) not\b|\bcannot\b|\b(?:it|that|there|here|what|who|he|she) is\b|\b(?:you|they|we) are\b|\bI am\b|\b(?:you|they|we|I) (?:will|would|have|had)\b|\blet us\b/gi;

// ── AC5 · say it before you quote it ─────────────────────────────────────────

const FRAME = /\b(?:says?|said|saying|ask(?:s|ed|ing)?|call(?:s|ed|ing)?|word|words|line|lines|put it|wr(?:ote|ites|iting)|reads?|sentence|claim|claims|name|named|phrase|question|answers?|answered|repl(?:y|ies|ied)|tells?|told|rule|motto|slogan|label|sign|verdict|promise|thought|idea|view|instruction|test|formula|shout(?:s|ed)?|insist(?:s|ed)?|announce(?:s|d)?|declare(?:s|d)?|thinks?|believes?|believed|argues?|argued|hears?|heard|notice|stop at|go(?:es)? back to|heading|title|asking)\b[^"“”]{0,40}$/i;
function unframedHits(s) {
  const out = [];
  for (const m of s.matchAll(/["“]([^"“”]{2,})["”]/g)) {
    const before = s.slice(Math.max(0, m.index - 60), m.index);
    if (FRAME.test(before)) continue;
    out.push(m[0]);
  }
  return out;
}

// ── AC6 · nothing long before the subject (a worklist, not a gate) ──────────

const OPENER = /^["“]?(?:If|When|Whenever|Although|Though|Because|Since|While|Whereas|Unless|After|Before|Once|Until|Even if|Even though|As long as)\b/;
function openerHits(s) {
  const out = [];
  for (const sen of sentencesOf(s)) {
    if (!OPENER.test(sen)) continue;
    const comma = sen.indexOf(',');
    if (comma < 0) continue;
    if (wordsOf(sen.slice(0, comma)).length >= 8) out.push(sen.slice(0, 60));
  }
  return out;
}

// ── AC7 · a pause is a full stop ─────────────────────────────────────────────

const DASH = /—|–|\s-\s/g;

// ── AC10 · nothing written for the voice alone ──────────────────────────────

const FILLER = /\b(?:um+|uh+|erm|hmm+)\b|\byou (?:might|may) be wondering\b|\bthink of it (?:as|like)\b/gi;

// ── AD · it must not read as generated ──────────────────────────────────────

const TAIL = /,\s+(?:highlighting|underscoring|emphasi[sz]ing|reflecting|showcasing|illustrating|demonstrating|signal(?:l)?ing|cementing|solidifying|fostering|paving the way|contributing to)\b/gi;
const SERVES = /\b(?:serves?|served|functions?) as (?:a|an|the)\b|\b(?:is|was|remains) a testament to\b/gi;
const VOCAB = /\b(?:delv(?:e|es|ed|ing)|tapestr(?:y|ies)|testament|underscor(?:e|es|ed|ing)|pivotal|intricac(?:y|ies)|intricate|realm|foster(?:s|ed|ing)?|meticulous(?:ly)?|showcas(?:e|es|ed|ing)|vibrant|interplay|garner(?:s|ed|ing)?|bolster(?:s|ed|ing)?|multifaceted|palpable|amidst|additionally|moreover|furthermore|notably|crucial|nuanced)\b/gi;
const UNNAMED = /\b(?:some|many|most) (?:critics|scholars|philosophers|thinkers|experts|commentators|people) (?:argue|say|believe|contend|claim|suggest)\b|\bit (?:has been|is often) (?:argued|said|claimed)\b/gi;
const STAGED = /\b(?:(?:deeply|profoundly|incredibly|endlessly) (?:nuanced|complex)|no (?:easy|simple) answers?|it['’]s complicated|depends on how (?:you|one|we) define|lasting legacy|broader (?:implications|significance)|plays? an? (?:crucial|key|vital|pivotal) role)\b/gi;
const TRIAD = /\b[\w’'-]+(?:\s[\w’'-]+){0,2},\s[\w’'-]+(?:\s[\w’'-]+){0,2},?\s(?:and|or)\s[\w’'-]+/gi;
const ATTRIB = /\b[A-Z][a-z]+ (?:(?:notes|observes|remarks) that|posits|contends|asserts|opines)\b/g;
const ADVERB = /\b(?:simply|exactly|actually|quietly|genuinely|plainly|really|truly|perfectly|literally|honestly|obviously|clearly|surely|precisely|entirely|completely|deliberately)\b/gi;
const TROPES = /\b(?:here['’]s the (?:thing|kicker|catch|twist|truth)|the (?:reality|kicker) is|it['’]s worth (?:noting|mentioning)|it['’]s important to (?:note|remember)|that said|in (?:summary|conclusion|essence)|at its core|let['’]s (?:dive|delve|break)|imagine a world|and that changes everything|plot twist)\b|\bhonestly\?/gi;
const NEGATE = /\b(?:isn['’]t|is not|wasn['’]t|was not|aren['’]t|are not|doesn['’]t|does not)\b[^.?!]{1,60}[.?!]\s+(?:It|That|This|They|He|She)(?:['’]s|['’]re| is| was| are| does)\b|,\s*not\s+(?:a|an|the|by|in|on|for|from|with|because|just|only)?\s*[\w’'-]+|\bnot (?:just|only|merely|simply)\b/gi;

/**
 * THREE SHORT SENTENCES RUNNING, WHERE SHORT IS THREE WORDS OR FEWER.
 *
 * It was two words first, and the counter-test failed on the catalogue's own
 * example — "Openly. In a book. As a priest." — whose last fragment is three.
 * Two fragments stay silent at any length: "Three people. One fence." opens
 * `political8`, the lesson the reader holds up as the standard (AD7).
 */
function fragmentHits(s) {
  const lens = sentencesOf(s).map((x) => wordsOf(x).length);
  for (let k = 2; k < lens.length; k += 1) {
    if (lens[k] <= 3 && lens[k - 1] <= 3 && lens[k - 2] <= 3) return [s.slice(0, 48)];
  }
  return [];
}

const all = (re) => (s) => s.match(re) || [];
const ALL_KINDS = ['text', 'explain', 'closing'];

/**
 * gate: 'zero'   — any hit fails the build.
 *       'budget' — a high-water mark in check-ear.mjs, named by `budget`.
 *       'list'   — a worklist for a person; never fails.
 */
export const RULES = [
  { id: 'caps', rule: 'AC1', kinds: ['text'], gate: 'zero', what: 'a word in CAPITALS for emphasis — Chirp 3 HD has no emphasis, so end the sentence on the word instead (AC3)', find: capsHits },
  { id: 'symbol', rule: 'AC1', kinds: ['text'], gate: 'zero', what: 'a symbol the voice has to translate — write the word', find: all(/[%&\/+=×→·<>@#*~^|]/g) },
  { id: 'digits', rule: 'AC1', kinds: ['text'], gate: 'zero', what: 'a numeral that is not a year — write it as it is said', find: digitHits },
  { id: 'letter-a', rule: 'AC1', kinds: ['text'], gate: 'zero', what: 'the letter A used as a name, which a voice reads as the article — give it its noun (point A)', find: letterAHits },
  { id: 'quotes', rule: 'AC2', kinds: ALL_KINDS, gate: 'zero', what: 'a quotation mark that does not close inside its own piece', find: quoteHits },
  { id: 'cut', rule: 'AC2', kinds: ['text'], gate: 'zero', what: 'a sentence carried across a tap — each beat is its own audio clip', find: cutHits },
  { id: 'expanded', rule: 'AC4', kinds: ALL_KINDS, gate: 'budget', budget: 'EXPANDED_BUDGET', what: 'a spelled-out form where a contraction is the spoken default', find: all(EXPANDED) },
  { id: 'unframed', rule: 'AC5', kinds: ['text'], gate: 'budget', budget: 'UNFRAMED_BUDGET', what: 'a quoted phrase with no spoken frame — quotation marks are silent', find: unframedHits },
  { id: 'opener', rule: 'AC6', kinds: ['text'], gate: 'list', what: 'eight or more words before the subject', find: openerHits },
  { id: 'ellipsis', rule: 'AC7', kinds: ['text'], gate: 'zero', what: 'an ellipsis — to Chirp 3 HD it is hesitation, on screen it is trailing off', find: all(/…|\.\.\./g) },
  { id: 'semicolon', rule: 'AC7', kinds: ['text'], gate: 'zero', what: 'a semicolon — a mark for the eye; use a full stop', find: all(/;/g) },
  { id: 'parens', rule: 'AC7', kinds: ['text'], gate: 'zero', what: 'a parenthesis — nobody hears the brackets', find: all(/[()]/g) },
  { id: 'two-dashes', rule: 'AC7', kinds: ['text'], gate: 'zero', what: 'two dashes in one beat', find: (s) => ((s.match(DASH) || []).length >= 2 ? [s.slice(0, 48)] : []) },
  { id: 'dash', rule: 'AC7', kinds: ['text'], gate: 'budget', budget: 'DASH_BUDGET', what: 'a dash — only for a real interruption inside one sentence', find: all(DASH) },
  { id: 'filler', rule: 'AC10', kinds: ALL_KINDS, gate: 'zero', what: 'filler written to sound spoken', find: all(FILLER) },
  { id: 'tail', rule: 'AD1', kinds: ALL_KINDS, gate: 'zero', what: 'a ", highlighting…" tail announcing significance', find: all(TAIL) },
  { id: 'serves-as', rule: 'AD1', kinds: ALL_KINDS, gate: 'zero', what: '"serves as" / "a testament to" where "is" is the word', find: all(SERVES) },
  { id: 'vocab', rule: 'AD1', kinds: ALL_KINDS, gate: 'zero', what: 'a word the research measures as model vocabulary', find: all(VOCAB) },
  { id: 'unnamed', rule: 'AD3', kinds: ALL_KINDS, gate: 'zero', what: 'an unnamed source — say who', find: all(UNNAMED) },
  { id: 'staged', rule: 'AD3', kinds: ALL_KINDS, gate: 'zero', what: 'staged complexity — name the positions instead', find: all(STAGED) },
  // A WORKLIST, NOT A GATE. As a zero it fired on its first run at `political`,
  // where one of the two "lists" is Hobbes's own "nasty, brutish, and short" and
  // the other is a clause boundary ("between us, fear and rivalry") the pattern
  // cannot tell from a list. A real three is fine (AD4); only a person can say
  // which threes are rhythm, so quotations are stripped and the rest is printed.
  { id: 'triads', rule: 'AD4', kinds: ['text'], gate: 'list', what: 'two lists of three in one beat — is each a real three?', find: (s) => { const bare = s.replace(/["“][^"”]*["”]/g, ' '); return (bare.match(TRIAD) || []).length >= 2 ? [bare.slice(0, 48)] : []; } },
  { id: 'attribution', rule: 'AD5', kinds: ALL_KINDS, gate: 'zero', what: 'a synonym for "says" — notes, observes, posits', find: all(ATTRIB) },
  { id: 'adverb', rule: 'AD6', kinds: ALL_KINDS, gate: 'budget', budget: 'ADVERB_BUDGET', what: 'an intensifier that changes no claim', find: all(ADVERB) },
  { id: 'fragments', rule: 'AD7', kinds: ['text'], gate: 'zero', what: 'three fragments in a row', find: fragmentHits },
  { id: 'tropes', rule: 'AD7', kinds: ALL_KINDS, gate: 'zero', what: 'a stock phrase — "here\u2019s the thing", "that said"', find: all(TROPES) },
  { id: 'negation', rule: 'AD2', kinds: ['text', 'explain'], gate: 'list', what: 'a negation — does somebody actually hold the thing knocked down?', find: all(NEGATE) },
];

/** The faults one piece of prose carries. */
export function faultsOf(piece) {
  const out = [];
  for (const r of RULES) {
    if (!r.kinds.includes(piece.kind)) continue;
    const hits = r.find(piece.s);
    if (hits.length) out.push({ id: r.id, rule: r.rule, gate: r.gate, what: r.what, hits });
  }
  return out;
}
