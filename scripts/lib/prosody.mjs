// ─────────────────────────────────────────────────────────────────────────────
// HOW A LINE IS SPOKEN: ITS SPEED, AND A PAUSE AT EVERY MARK (LESSON_RULES AP17).
//
// The owner, 2026-09-30, before the second lesson of every subject was made: *"I don't
// want the stick man to speak too slowly. I don't want the stick man to speak too fast.
// But … depending on what is said, I want you to know when … words should be said
// slower and when some words should be said faster. And of course, using punctuation
// correctly. If there's a comma, you should pause. If there's a period, you should
// pause a little bit longer … A question mark obviously is a question … This is
// extremely important to be done right."*
//
// Measured before anything here was written, on Chirp 3 HD, the same two lines in three
// forms (scratchpad/prosody-test.mjs):
//
//   · LEFT TO ITSELF THE VOICE IGNORES MOST COMMAS. Kore read "Wait, so if I swap the
//     labels, he picks the other cup? Oh, that's brilliant!" with two pauses for four
//     marks, the longest 0.29s. Algieba paused at its full stop for 1.06s, longer than a
//     person does, and at one comma for 0.67s, longer than most people pause at a stop.
//   · A PAUSE TAG MAKES THE PAUSE, BUT NOT AT A PERSON'S LENGTH. `[pause short]` after
//     each comma and `[pause]` after each stop gave a gap at every mark, at 0.12–0.65s
//     for a comma and 0.65–0.96s for a stop: the right PLACES, the wrong LENGTHS, and
//     different every take.
//
// So the voice is asked for a pause at every mark (markupOf), and then each pause is
// SET to a person's length in the audio itself (shapePauses), where it is exact and does
// not depend on the take. A comma rests about a sixth of a second, a full stop about
// twice that, a question a touch longer, because a listener needs the beat to hear that
// it was one. A pause the text does not ask for is shortened to a catch of breath.
//
// SPEED IS CHOSEN BY THE AUTHOR, PER SENTENCE, FROM WHAT IS SAID (`pace` on a beat):
// EVEN for an ordinary line, the idea included, and BRISK for a quick reaction, an
// interruption or a run of everyday examples. Each has its own band of syllables a
// second of speech (pauses taken out). The render asks for the speed and then measures
// each sentence, and retakes one outside its band.
//
// THERE IS NO SLOW (2026-10-01). There was, for the line that names the idea, at about
// 4.0 syllables a second, and the owner heard it: *"the narration slows down so much
// where it sounds so bad … I do not want this slow sounding talking … I want more medium
// pace or faster pace. And of course, I want punctuation to be met still."* A slowed
// line on a synthetic voice does not sound weighty, it sounds dragged. An idea is
// carried by the PAUSE at its marks, which shapePauses sets exactly, and never by
// stretching the words. The bands moved up with it: even is the medium pace, brisk is
// faster, and nothing is said under about 4.95. The owner asked for faster again the
// same day, so the bands rose once more and the pauses were shortened (a pause cut from
// silence costs the voice nothing, so it is the first place a line gets quicker).
//
// ZERO IMPORTS, like rig.ts and tone.ts: plain functions on 16-bit PCM, so the render,
// the install, the manifest and the check all read a take the same way.
// ─────────────────────────────────────────────────────────────────────────────

/** Syllables a second of speech, pauses taken out. `factor` scales the voice's own rate for a first take. */
/**
 * THE SPEED IS SLOWER THAN PHILOSOPHY 4's "BEING RIGHT" LINE (owner, 2026-10-02).
 *
 * *"the first couple interactions between the two with the speech narration being way
 * too fast … Where the speech becomes better is when the top hat stick man says, being
 * right isn't the same as knowing … What he says there is at a much better speed …
 * edit the rule so that the narration speech is slower than the example."* Measured on
 * the take he heard (archived whole in `PACE_REFERENCE.file`, so a re-voice cannot move
 * it): its first sentence, "Being right isn't the same as knowing.", runs 4.62 syllables
 * a second of speech, and the whole line 5.47. The lines he called too fast ran 5.2 to
 * 6.4. So:
 *   · EVEN aims at that first sentence (4.75), and its ceiling (5.1) is under the line;
 *   · BRISK is a touch quicker (5.1) and its ceiling (5.4) is still under the line;
 *   · the floor (4.45) stays above the slow band he rejected on 2026-10-01 (3.65–4.4,
 *     "the narration slows down so much where it sounds so bad").
 * `check:narration` re-measures the archived take and fails if the bands stop doing all
 * three. The bands before this were personal growth 2's (even 4.95–5.85, brisk 5.4–6.4).
 */
export const PACE_REFERENCE = {
  file: 'scripts/lib/pace-reference/philosophy-foundations-4-beat-03.wav',
  sha256: '375502e46b29cf8e8ebb3b54abdaba680d205872fed3f30a56e34424aa420475',
  text: 'Being right isn’t the same as knowing. To know something, your belief must be true, and you need a good reason for it.',
  /** The sentence the owner named as the speed he wants. */
  liked: 'Being right isn’t the same as knowing.',
  /** Under every band's ceiling: the whole line, which the owner asked to be slower than. */
  slowerThan: 5.47,
};
/** The slow band the owner rejected (2026-10-01): no band may reach down into it. */
export const REJECTED_SLOW_TOP = 4.4;
/**
 * The three paces a sentence can be said at (LESSON_RULES AP17, AP21). A sentence's pace
 * is chosen by what it DOES, not by the speaker (AP21's table):
 *   · brisk   a reaction, banter, an aside, a quick reply, gloating, annoyance, excitement
 *   · even    explaining, telling, asking, answering: most of what anybody says
 *   · weighty a new term the first time, a definition, the claim the lesson turns on, a
 *             name or number that must be caught, a quotation, something sincere. Scarce:
 *             at most WEIGHTY_MAX sentences a lesson, or it is just a slower lesson.
 * WEIGHTY sits inside the owner's limits (above REJECTED_SLOW_TOP, under the reference
 * line) and is about 5% under even's aim — the smallest change in tempo a listener can
 * hear (Quené 2007) — so it is heard as care, not as a slowed voice.
 */
export const PACES = {
  even: { aim: 4.75, min: 4.45, max: 5.1, factor: 1 },
  brisk: { aim: 5.1, min: 4.8, max: 5.4, factor: 1.07 },
  weighty: { aim: 4.52, min: 4.45, max: 4.8, factor: 0.95 },
};
export const PACE_NAMES = Object.keys(PACES);
/** At most this many sentences in one lesson are said `weighty` (AP21). */
export const WEIGHTY_MAX = 3;

/**
 * Where a render aims a sentence of `syllables` said at `pace` (AP21). People say a long
 * phrase faster than a short one and a short one slower, because the lengthened last
 * syllable is a bigger share of it (Yuan, Liberman & Cieri 2006; Quené 2008). So a short
 * sentence aims a little under its pace's aim and a long one a little over: 0.02 a second
 * per syllable either side of 12, up to ±0.15, never within 0.05 of the band's edges.
 */
export function aimOf(pace, syllables) {
  const band = PACES[pace] ?? PACES.even;
  const shift = Math.max(-0.15, Math.min(0.15, (syllables - 12) * 0.02));
  return Math.max(band.min + 0.05, Math.min(band.max - 0.05, band.aim + shift));
}
/**
 * How close to its aim a new take must land before the render keeps it (AP21): within 4%,
 * under the 5% a listener hears as a change of tempo. The band is what the CHECK holds (so
 * nothing already voiced moves); this is what a RENDER aims for, so that from one line to
 * the next a character never audibly speeds up or slows down unless the line asks him to.
 */
export const AIM_TOLERANCE = 0.04;

/**
 * How long the voice rests at each mark, in seconds of silence: where the render sets it
 * (`aim`) and the band a take must sit in. A stop is about twice a comma; a question rests a
 * little longer so it is heard as one; a dash or a colon sits between.
 */
export const PAUSES = {
  comma: { aim: 0.16, min: 0.11, max: 0.24 },
  dash: { aim: 0.2, min: 0.14, max: 0.28 },
  semi: { aim: 0.24, min: 0.16, max: 0.32 },
  colon: { aim: 0.26, min: 0.18, max: 0.36 },
  stop: { aim: 0.36, min: 0.28, max: 0.48 },
  exclaim: { aim: 0.36, min: 0.28, max: 0.48 },
  question: { aim: 0.42, min: 0.32, max: 0.55 },
  // a trailing-off or a hesitation: long enough to be heard as one (AP21); 0.7 and over
  // reads as reluctance (Kendrick & Torreira 2015), which is a choice, not a default
  ellipsis: { aim: 0.55, min: 0.32, max: 0.75 },
};
/** The marks that end a sentence: speed is chosen and measured between them. */
export const SENTENCE_END = new Set(['stop', 'exclaim', 'question', 'ellipsis']);
/** The tag the voice is asked for at each mark. */
const TAG = { comma: '[pause short]', dash: '[pause short]', semi: '[pause short]', colon: '[pause]', stop: '[pause]', exclaim: '[pause]', question: '[pause]', ellipsis: '[pause]' };

/** A pause where the text has no mark is a catch of breath at most. */
export let STRAY_MAX = 0.2;
export let STRAY_AIM = 0.1;
/** The shortest silence counted as a pause at all: a stop consonant's closure is shorter. */
export const MIN_GAP_S = 0.08;

// ── A LESSON'S DELIVERY STYLE (AP22, 2026-10-07) ─────────────────────────────
//
// The owner sent a recording of Claude Code reading aloud and asked for the lessons to be
// spoken like it: *"not the actual voice, but the speed, the volume, the pauses, how it
// speaks."* Measured on that clip with this file's own reader (37 s, 105 words), against
// economics 1 and philosophy 1:
//
//   · THE OVERALL PACE IS THE SAME: 4.22 syllables a second with the pauses in, against
//     4.20 and 4.16. What differs is how the time is spent.
//   · ITS WORDS ARE QUICKER: 5.37 syllables a second of speech, against 4.78 and 4.80.
//   · IT PAUSES MORE AND LONGER, AND NEVER THE SAME TWICE: 21% of its time is silence
//     against 12%; a sentence ends on 0.3–0.5 s, a comma 0.2–0.3, a topic change 0.57,
//     and it takes a 0.3–0.5 s phrase break where a long sentence needs a breath, with no
//     comma there. The lessons rest exactly 0.36 at every stop and 0.16 at every comma.
//
// The owner had called words at 5.2–6.4 "way too fast" (2026-10-02), when the pauses were
// short; at the same word speed with longer pauses they asked for exactly this. So the
// pauses were the fault, and the CONVERSATIONAL style is the clip's numbers: quicker words,
// longer pauses that change with what comes next, and the voice's own phrase breaks kept.
//
// A lesson listed in LESSON_STYLE is rendered, shaped and checked under its style; every
// other lesson under the defaults above, untouched. `withStyle` swaps the tables in place
// for the length of one call and always puts them back.
export const STYLES = {
  conversational: {
    paces: {
      even: { aim: 5.35, min: 5.05, max: 5.7, factor: 1.12 },
      brisk: { aim: 5.6, min: 5.3, max: 5.95, factor: 1.17 },
      weighty: { aim: 5.05, min: 4.8, max: 5.3, factor: 1.06 },
    },
    pauses: {
      comma: { aim: 0.26, min: 0.16, max: 0.38 },
      dash: { aim: 0.3, min: 0.2, max: 0.42 },
      semi: { aim: 0.32, min: 0.22, max: 0.44 },
      colon: { aim: 0.36, min: 0.26, max: 0.48 },
      stop: { aim: 0.42, min: 0.3, max: 0.56 },
      exclaim: { aim: 0.4, min: 0.3, max: 0.56 },
      question: { aim: 0.48, min: 0.36, max: 0.62 },
      ellipsis: { aim: 0.6, min: 0.4, max: 0.8 },
    },
    // the voice's own breath between phrases is kept up to this; a longer one is set to the aim
    stray: { max: 0.42, aim: 0.32 },
    vary: true,
  },
  // NATURAL (2026-10-07): the owner heard one line four ways (scratchpad/voice-ab.mjs) —
  // as installed, at the voice's own speed, without pause tags, and untouched — and chose
  // the UNTOUCHED take: the plain words, one request, the voice's own rate (1.0), nothing
  // cut, set or stitched. Left alone, Zubenelgenubi rested at every mark (0.35, 0.51, 0.30)
  // and spoke at 5.2–5.4, near the Claude Code clip; every edit made it sound assembled.
  // So a NATURAL line is never edited. A take is asked for again only when it is broken —
  // its last word cut off, or a sentence run straight through — at a rate 1% either side,
  // because the same request returns the same bytes. These bands are wide on purpose: they
  // only catch a take that went wrong, they do not steer the voice.
  natural: {
    paces: {
      even: { aim: 5.2, min: 4.3, max: 6.1, factor: 1 },
      brisk: { aim: 5.4, min: 4.4, max: 6.3, factor: 1 },
      weighty: { aim: 5.0, min: 4.2, max: 6.0, factor: 1 },
    },
    pauses: {
      comma: { aim: 0.3, min: 0.08, max: 0.7 },
      dash: { aim: 0.3, min: 0.08, max: 0.8 },
      semi: { aim: 0.35, min: 0.1, max: 0.8 },
      colon: { aim: 0.4, min: 0.1, max: 0.9 },
      stop: { aim: 0.5, min: 0.18, max: 1.0 },
      exclaim: { aim: 0.5, min: 0.18, max: 1.0 },
      question: { aim: 0.55, min: 0.18, max: 1.1 },
      ellipsis: { aim: 0.7, min: 0.25, max: 1.3 },
    },
    stray: { max: 0.7, aim: 0.4 },
    vary: false,
    untouched: true,
    // a person runs through some commas; only a sentence end must have its breath
    commaOptional: true,
  },
};
/** Which lessons are spoken in a style other than the default. */
export const LESSON_STYLE = {
  'economics-foundations-1': 'natural',
};
const DEFAULT_STYLE = {
  paces: JSON.parse(JSON.stringify(PACES)),
  pauses: JSON.parse(JSON.stringify(PAUSES)),
  stray: { max: STRAY_MAX, aim: STRAY_AIM },
  vary: false,
  untouched: false,
  commaOptional: false,
};
let VARY = false;
let UNTOUCHED = false;
let COMMA_OPTIONAL = false;
/** True while the style in place leaves the voice's take exactly as it came. */
export const isUntouched = () => UNTOUCHED;
/** The lesson a key like "economics-foundations-1/beat-03" belongs to. */
export const lessonOfKey = (key) => String(key ?? '').split('/')[0];
function applyStyle(st) {
  for (const k of Object.keys(st.paces)) Object.assign(PACES[k], st.paces[k]);
  for (const k of Object.keys(st.pauses)) Object.assign(PAUSES[k], st.pauses[k]);
  STRAY_MAX = st.stray.max;
  STRAY_AIM = st.stray.aim;
  VARY = st.vary;
  UNTOUCHED = !!st.untouched;
  COMMA_OPTIONAL = !!st.commaOptional;
}
/** Put a lesson's style in place for the rest of the run (a render is one lesson). */
export function useStyleFor(lesson) {
  applyStyle(STYLES[LESSON_STYLE[lessonOfKey(lesson)]] ?? DEFAULT_STYLE);
}
/** Run `fn` under a lesson's style, then put the defaults back. */
export function withStyle(lesson, fn) {
  useStyleFor(lesson);
  try { return fn(); } finally { applyStyle(DEFAULT_STYLE); }
}
/** The style a lesson is spoken in. */
export const styleOf = (lesson) => LESSON_STYLE[lessonOfKey(lesson)] ?? 'default';

/**
 * How long to rest at mark `m`, under a style that varies its pauses. A person's pause
 * follows what comes NEXT: a breath before a long sentence, a short beat before a short
 * one, a little longer before "and", "but" or "so" turns a sentence, a little less between
 * the items of a list. Always inside the mark's band, and the same for the same line.
 */
function pauseAimOf(m, words, sentences) {
  const p = PAUSES[m.kind];
  if (!VARY) return p.aim;
  let aim = p.aim;
  if (SENTENCE_END.has(m.kind)) {
    const next = sentences.find((s) => s.from === m.word + 1);
    if (next && next.syllables >= 12) aim += 0.08;
    else if (next && next.syllables < 6) aim -= 0.07;
  } else if (m.kind === 'comma') {
    const after = String(words[m.word + 1] ?? '').toLowerCase().replace(/[^a-z]/g, '');
    const sent = sentences.find((s) => m.word >= s.from && m.word <= s.to);
    const commas = sent ? words.slice(sent.from, sent.to + 1).filter((w) => /,$/.test(w)).length : 0;
    if (['and', 'but', 'so', 'or', 'because', 'then', 'when', 'which'].includes(after)) aim += commas >= 2 && after === 'and' ? 0 : 0.06;
    else if (commas >= 2) aim -= 0.05;
  }
  return Math.max(p.min + 0.02, Math.min(p.max - 0.02, aim));
}
/** The last 50 ms of a take against its loudest frame: a finished word has fallen this far (AP16). */
export const END_DROP_DB = 33;
/**
 * A sentence this short is too few syllables to measure a speed from on its own. Speed
 * is held two ways: everything said at one pace TOGETHER must sit in that pace's band,
 * and any one sentence of MIN_SYLLABLES or more within SENTENCE_SLACK of it. People speed
 * up and slow down a little sentence to sentence, and a voice that never did would be
 * the flat read this exists to prevent.
 */
export const MIN_SYLLABLES = 8;
export const SENTENCE_SLACK = 0.35;

// Not "no.": in dialogue it ends a sentence ("Oh, no."), and read as "No. 5" it hid the
// stop the render cuts its throwaway tail word at, so no take of that line could finish.
const ABBREV = /^(?:mr|mrs|ms|dr|st|vs|etc|e\.g|i\.e)\.$/i;
const CLOSERS = /["’”)\]]+$/;

/** A word's syllables, by vowel groups — close enough to measure a line's speed. */
export function syllablesOf(word) {
  let w = String(word).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!w) return 0;
  if (/^\d+$/.test(w)) return Math.max(1, w.length);
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const m = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, m ? m.length : 1);
}

/** The mark a word ends on, or null. A dash standing alone marks the word before it. */
export function markOf(word) {
  const w = String(word).replace(CLOSERS, '');
  if (/^[—–-]+$/.test(w)) return 'dash';
  if (/(?:…|\.\.\.)$/.test(w)) return 'ellipsis';
  if (/\?$/.test(w)) return 'question';
  if (/!$/.test(w)) return 'exclaim';
  if (/\.$/.test(w)) return ABBREV.test(w) ? null : 'stop';
  if (/:$/.test(w)) return 'colon';
  if (/;$/.test(w)) return 'semi';
  if (/,$/.test(w)) return 'comma';
  if (/[—–]$/.test(w)) return 'dash';
  return null;
}

/**
 * The mark a voice rests at after word `i`, or null. A comma before the one word that
 * ends its sentence is a TAG — "No charge, mate." · "Thanks, though." · "Oh, no." — and
 * people run straight through it; asked to pause there, a voice sounds like it lost its
 * place (measured: Zubenelgenubi ran through "does, mate" and "charge, mate" on every
 * one of eight requests, each with a firmer tag than the last).
 */
export function spokenMarkOf(words, i) {
  const kind = markOf(words[i]);
  if (kind !== 'comma' || i + 1 >= words.length) return kind;
  const next = i + 1 === words.length - 1 || SENTENCE_END.has(markOf(words[i + 1]) ?? '');
  return next ? null : kind;
}

/**
 * The line read as words and the marks between them: every word with its syllables, and
 * every mark INSIDE the line (not the one that ends it) with the syllables said before it.
 */
export function readLine(text) {
  const words = String(text).match(/\S+/g) || [];
  const syl = words.map(syllablesOf);
  const total = syl.reduce((a, b) => a + b, 0);
  const marks = [];
  let before = 0;
  words.forEach((w, i) => {
    before += syl[i];
    if (i === words.length - 1) return;
    const kind = spokenMarkOf(words, i);
    if (!kind) return;
    // a dash standing alone belongs to the gap before it; never count one mark twice
    if (kind === 'dash' && /^[—–-]+$/.test(w) && marks.length && marks[marks.length - 1].word === i - 1) return;
    marks.push({ word: i, kind, before, after: words[i + 1 === words.length ? i : i + 1] });
  });
  return { words, syl, total, marks };
}

/** The line's sentences, each with the speed it is said at (`pace` is one name or one per sentence). */
export function sentencesOf(text, pace) {
  const { words, syl, marks } = readLine(text);
  const out = [];
  let start = 0;
  const ends = marks.filter((m) => SENTENCE_END.has(m.kind)).map((m) => m.word);
  for (const e of [...ends, words.length - 1]) {
    const ws = words.slice(start, e + 1);
    out.push({ from: start, to: e, text: ws.join(' '), syllables: syl.slice(start, e + 1).reduce((a, b) => a + b, 0) });
    start = e + 1;
  }
  const paces = Array.isArray(pace) ? pace : out.map(() => pace);
  out.forEach((s, k) => { s.pace = paces[k]; });
  return out;
}

/** Why a beat's `pace` is not usable, or null. */
export function paceFault(text, pace) {
  if (pace === undefined) return 'has no `pace`: say whether the line is even (an ordinary line, the idea included) or brisk (a reaction, an aside, a list)';
  const n = sentencesOf(text, 'even').length;
  if (Array.isArray(pace)) {
    if (pace.length !== n) return `has ${pace.length} paces for ${n} sentence(s): give one a sentence, or one for the line`;
    const bad = pace.find((p) => !PACES[p]);
    return bad ? `pace "${bad}" is not one of ${PACE_NAMES.join(', ')}` : null;
  }
  return PACES[pace] ? null : `pace "${pace}" is not one of ${PACE_NAMES.join(', ')}`;
}

/**
 * The markup the voice is asked for: the line's own words with a pause tag after every
 * mark, and a long pause after the last word so the voice finishes it (AP16). With the
 * tags taken out it is the text exactly.
 */
export function markupOf(text, strong = new Set()) {
  const words = String(text).match(/\S+/g) || [];
  const out = [];
  words.forEach((w, i) => {
    out.push(w);
    if (i === words.length - 1) return;
    const kind = spokenMarkOf(words, i);
    // a dash standing alone takes the tag after it; the word before it then takes none.
    // A mark the voice ran through last time is asked for more firmly: its length is set
    // afterwards anyway, so a firmer tag costs nothing but the request.
    if (kind && !(markOf(words[i + 1]) === 'dash' && /^[—–-]+$/.test(words[i + 1]))) out.push(strong.has(i) ? '[pause]' : TAG[kind]);
  });
  out.push('[pause long]');
  return out.join(' ');
}

// ── READING A TAKE ───────────────────────────────────────────────────────────

function framesOf(pcm, rate) {
  const F = Math.max(1, Math.round(rate * 0.01));
  const nf = Math.floor(pcm.length / F);
  const db = new Float64Array(nf);
  let top = -120;
  for (let f = 0; f < nf; f += 1) {
    let e = 0;
    for (let k = f * F; k < (f + 1) * F; k += 1) e += pcm[k] * pcm[k];
    db[f] = 10 * Math.log10(e / F / (32768 * 32768) + 1e-12);
    if (db[f] > top) top = db[f];
  }
  const floor = Math.max(top - 32, -50);
  let first = -1, last = -1;
  for (let f = 0; f < nf; f += 1) if (db[f] > floor) { if (first < 0) first = f; last = f; }
  return { F, nf, db, top, floor, first, last };
}

/**
 * Lay each mark of the line onto a silence in the take, in order. A mark lands on the
 * gap nearest where its share of the syllables falls in the talking time; a mark the
 * voice ran through gets no gap, and a gap no mark asked for is a stray.
 */
function align(marks, total, gaps) {
  const talk = gaps.length ? gaps[gaps.length - 1].talkAfter : 1;
  const sPos = marks.map((m) => m.before / Math.max(1, total));
  const gPos = gaps.map((g) => g.talkBefore / Math.max(1e-6, talk));
  const B = marks.length, G = gaps.length;
  const SKIP_MARK = 0.14;
  // A silence as long as a short comma (0.11 s) is a pause somebody meant; skipping one costs
  // more than leaving a mark unmatched, so a real comma is never dropped for a nearer one.
  const skipGap = (g) => 0.01 + Math.max(0, g.len - 0.1) * 3;
  const cost = Array.from({ length: B + 1 }, () => new Float64Array(G + 1).fill(Infinity));
  const move = Array.from({ length: B + 1 }, () => new Int8Array(G + 1));
  cost[0][0] = 0;
  for (let b = 0; b <= B; b += 1) {
    for (let g = 0; g <= G; g += 1) {
      const c = cost[b][g];
      if (!Number.isFinite(c)) continue;
      if (b < B && g < G) {
        const v = c + Math.abs(sPos[b] - gPos[g]);
        if (v < cost[b + 1][g + 1]) { cost[b + 1][g + 1] = v; move[b + 1][g + 1] = 1; }
      }
      if (b < B && c + SKIP_MARK < cost[b + 1][g]) { cost[b + 1][g] = c + SKIP_MARK; move[b + 1][g] = 2; }
      if (g < G && c + skipGap(gaps[g]) < cost[b][g + 1]) { cost[b][g + 1] = c + skipGap(gaps[g]); move[b][g + 1] = 3; }
    }
  }
  const at = new Array(B).fill(-1);
  for (let b = B, g = G; b > 0 || g > 0;) {
    const m = move[b][g];
    if (m === 1) { at[b - 1] = g - 1; b -= 1; g -= 1; } else if (m === 2) b -= 1; else g -= 1;
  }
  return at;
}

/**
 * Everything about how a take is spoken: each gap (seconds), which mark it stands for,
 * the speed of each sentence and of the whole, and how far the last 50 ms has fallen.
 */
export function readTake(pcm, rate, text, pace = 'even') {
  const fr = framesOf(pcm, rate);
  const { db, floor, first, last, top, nf, F } = fr;
  const minGap = Math.round(MIN_GAP_S * 100);
  const gaps = [];
  let q = 0;
  for (let f = Math.max(first, 0); first >= 0 && f <= last + 1; f += 1) {
    if (f <= last && db[f] <= floor) { q += 1; continue; }
    if (q >= minGap) gaps.push({ a: f - q, b: f, len: q / 100 });
    q = 0;
  }
  // talking time before and after each gap, every gap of MIN_GAP_S or more taken out
  let talked = 0, prev = first;
  for (const g of gaps) {
    talked += (g.a - prev) / 100;
    g.talkBefore = talked;
    prev = g.b;
  }
  const talk = first < 0 ? 0 : talked + (last + 1 - prev) / 100;
  for (const g of gaps) g.talkAfter = talk;

  const line = readLine(text);
  const at = align(line.marks, line.total, gaps);
  const matched = new Set(at.filter((g) => g >= 0));
  const marks = line.marks.map((m, k) => ({ ...m, gap: at[k], len: at[k] >= 0 ? gaps[at[k]].len : 0 }));
  const strays = gaps.map((g, k) => ({ ...g, k })).filter((g) => !matched.has(g.k));

  // each sentence's speed: its syllables over its own talking time
  const sentences = sentencesOf(text, pace);
  const edges = [first];
  for (const s of sentences.slice(0, -1)) {
    const m = marks.find((x) => x.word === s.to);
    edges.push(m && m.gap >= 0 ? gaps[m.gap] : null);
  }
  sentences.forEach((s, k) => {
    const startF = k === 0 ? first : (edges[k] ? edges[k].b : null);
    const next = k + 1 < sentences.length ? edges[k + 1] : null;
    const endF = k + 1 < sentences.length ? (next ? next.a : null) : last + 1;
    if (startF === null || endF === null || startF < 0) { s.rate = null; return; }
    const inside = gaps.filter((g) => g.a >= startF && g.b <= endF).reduce((a, g) => a + g.len, 0);
    const t = Math.max(0.05, (endF - startF) / 100 - inside);
    s.rate = s.syllables / t;
  });

  const tail = db.slice(Math.max(0, nf - 5));
  let e = 0;
  for (const d of tail) e += 10 ** (d / 10);
  const endDb = 10 * Math.log10(e / Math.max(1, tail.length) + 1e-12) - top;
  return { gaps, marks, strays, sentences, rate: line.total / Math.max(0.1, talk), talk, endDb, frames: { F, first, last } };
}

/**
 * The speed of everything said at each pace, together: its syllables over its talking
 * time. Only a pace with MIN_SYLLABLES between its sentences, so a lone "Oh!" is not a
 * speed.
 */
export function paceRates(take) {
  const by = new Map();
  for (const s of take.sentences) {
    if (!s.rate) continue;
    const r = by.get(s.pace) ?? { syl: 0, secs: 0 };
    r.syl += s.syllables; r.secs += s.syllables / s.rate;
    by.set(s.pace, r);
  }
  const out = new Map();
  for (const [p, r] of by) if (r.syl >= MIN_SYLLABLES) out.set(p, { rate: r.syl / r.secs, syllables: r.syl });
  return out;
}

/** What makes a take sound read out rather than spoken, as { kind, say }. */
export function prosodyFaults(take, text) {
  const out = [];
  if (take.endDb > -END_DROP_DB) out.push({ kind: 'CUT OFF', say: `the take stops while the last word is still sounding: its last 50 ms is ${(-take.endDb).toFixed(0)} dB under its loudest, where a finished take falls ${END_DROP_DB} or more` });
  const words = String(text).match(/\S+/g) || [];
  for (const m of take.marks) {
    const p = PAUSES[m.kind];
    const where = `after "${words[m.word]}"`;
    // an untouched voice's own phrasing stands: where it runs two sentences together, that
    // is how it says them (natural style, the owner's pick); every other style must pause
    if (m.gap < 0 && (UNTOUCHED || (COMMA_OPTIONAL && !SENTENCE_END.has(m.kind)))) continue;
    if (m.gap < 0) out.push({ kind: 'NO PAUSE', say: `the voice runs straight through the ${m.kind} ${where}; it must rest ${p.min}–${p.max}s there` });
    else if (m.len < p.min - 0.005 || m.len > p.max + 0.005) out.push({ kind: 'PAUSE', say: `rests ${m.len.toFixed(2)}s at the ${m.kind} ${where}, where a person rests ${p.min}–${p.max}s` });
  }
  for (const g of take.strays) {
    if (g.len > STRAY_MAX + 0.005) out.push({ kind: 'STRAY PAUSE', say: `a ${g.len.toFixed(2)}s silence ${(g.a / 100).toFixed(2)}s in, where the text has no mark: a pause the reader cannot see is a voice losing its place` });
  }
  for (const s of take.sentences) {
    if (s.rate === null || s.syllables < MIN_SYLLABLES) continue;
    const band = PACES[s.pace] ?? PACES.even;
    const said = `"${s.text.length > 40 ? `${s.text.slice(0, 40)}…` : s.text}"`;
    const hi = band.max + SENTENCE_SLACK, lo = band.min - SENTENCE_SLACK;
    if (s.rate > hi) out.push({ kind: 'TOO FAST', say: `${said} runs ${s.rate.toFixed(2)} syllables a second, over ${hi.toFixed(2)} for one ${s.pace} sentence` });
    if (s.rate < lo) out.push({ kind: 'TOO SLOW', say: `${said} runs ${s.rate.toFixed(2)} syllables a second, under ${lo.toFixed(2)} for one ${s.pace} sentence` });
  }
  for (const [p, r] of paceRates(take)) {
    const band = PACES[p] ?? PACES.even;
    if (r.rate > band.max) out.push({ kind: 'TOO FAST', say: `what is said ${p} runs ${r.rate.toFixed(2)} syllables a second together, over ${band.max}` });
    if (r.rate < band.min) out.push({ kind: 'TOO SLOW', say: `what is said ${p} runs ${r.rate.toFixed(2)} syllables a second together, under ${band.min}` });
  }
  return out;
}

// ── SETTING EVERY PAUSE TO A PERSON'S LENGTH ─────────────────────────────────

/**
 * The take with each pause set to its length: a mark's to its `aim`, a stray one longer
 * than STRAY_MAX down to STRAY_AIM. Silence is taken out of the MIDDLE of a gap with a
 * 10 ms cross-fade, or zeros are laid into its quietest 10 ms, so the decay of the word
 * before and the onset of the word after are never touched.
 */
export function shapePauses(pcm, rate, text, pace = 'even') {
  const take = readTake(pcm, rate, text, pace);
  const F = take.frames.F;
  const want = new Map();
  const words = String(text).match(/\S+/g) || [];
  for (const m of take.marks) if (m.gap >= 0) want.set(m.gap, pauseAimOf(m, words, take.sentences));
  take.gaps.forEach((g, k) => { if (!want.has(k) && g.len > STRAY_MAX) want.set(k, STRAY_AIM); });
  let out = Int16Array.from(pcm);
  const order = [...want.keys()].sort((x, y) => y - x);
  const XF = Math.round(rate * 0.01);
  for (const k of order) {
    const g = take.gaps[k];
    const a = g.a * F, b = g.b * F;
    const have = b - a, need = Math.round(want.get(k) * rate);
    if (Math.abs(have - need) < rate * 0.01) continue;
    if (have > need) {
      // cut (have - need) samples from the middle, cross-fading across the seam
      const cut = have - need;
      const s = a + Math.floor((have - cut) / 2);
      const e = s + cut;
      const next = new Int16Array(out.length - cut);
      next.set(out.subarray(0, s), 0);
      next.set(out.subarray(e), s);
      for (let i = 0; i < XF && s - XF + i >= 0 && e - XF + i < out.length; i += 1) {
        const t = i / XF;
        next[s - XF + i] = Math.round(out[s - XF + i] * (1 - t) + out[e - XF + i] * t);
      }
      out = next;
    } else {
      // lay zeros into the gap's quietest 10 ms
      let best = a, bestE = Infinity;
      for (let s = a; s + F <= b; s += F) {
        let e = 0;
        for (let i = s; i < s + F; i += 1) e += out[i] * out[i];
        if (e < bestE) { bestE = e; best = s; }
      }
      const at = best + Math.floor(F / 2);
      const add = need - have;
      const next = new Int16Array(out.length + add);
      next.set(out.subarray(0, at), 0);
      next.set(out.subarray(at), at + add);
      out = next;
    }
  }
  return out;
}

// ── FINISHING THE LAST WORD ──────────────────────────────────────────────────
//
// Chirp 3 HD often ends a take INSIDE its last word, and a long pause asked for after it
// does not always stop that (AP16 found it did; on the paced lines it failed one take in
// five, and a retake fails the same way as often as not). Measured on "One squeaky wheel.
// That's all I asked you to fix.", three requests ending in [pause long] came back with
// the last 50 ms at −48, −52 and −27 dB: the third stops in the hiss of "fix".
//
// A voice never trims a word that has more coming after it. So the request carries ONE
// more short word after the long pause, and the audio is cut in the silence before it:
// the line's own last word always finishes, and the extra one is never kept. What is
// installed is the line's words and nothing else, which readTake re-derives (a word left
// on would put the speech out of its pace and its last mark out of place).

/** Said after the line, in its own sentence, and cut away. */
export const TAIL_WORD = 'Right.';

/** The markup for a line, with the throwaway word after its long pause. */
export const requestOf = (text, strong) => `${markupOf(text, strong)} ${TAIL_WORD}`;

/**
 * The take cut back to the line: everything up to the silence after its last word, with
 * `keepS` of that silence kept. Null when the take has no silence there to cut in.
 */
export function cutTail(pcm, rate, text, keepS = 0.25) {
  const full = `${text} ${TAIL_WORD}`;
  const n = sentencesOf(full, 'even').length;
  const take = readTake(pcm, rate, full, new Array(n).fill('even'));
  const lastWord = (String(text).match(/\S+/g) || []).length - 1;
  const m = take.marks.find((x) => x.word === lastWord);
  if (!m || m.gap < 0) return null;
  const g = take.gaps[m.gap];
  const F = take.frames.F;
  return pcm.slice(0, Math.min(g.b * F - Math.round(rate * 0.03), g.a * F + Math.round(rate * keepS)));
}

// ── A LINE SAID AT TWO SPEEDS ────────────────────────────────────────────────
//
// Chirp's speaking rate is one number for a whole request, and a sentence asked for on
// its own is a worse take than the same sentence in its line: measured on "That gap is
// called scarcity.", four requests of it alone came back trimmed into its last word,
// where the whole line asked for once ended cleanly. So a line with two paces is asked
// for WHOLE at each pace, and each sentence is taken from the take at its own pace, cut
// inside the silence at the sentence end (which the tags guarantee) and joined there.

/** Where each sentence of a take begins and ends, in samples; null when a sentence end has no pause to cut in. */
export function sentenceSpans(take, pcmLength, text, pace) {
  const F = take.frames.F;
  const sents = sentencesOf(text, pace);
  const keep = Math.round(F * 3);
  const spans = [];
  let from = 0;
  for (let k = 0; k < sents.length; k += 1) {
    if (k === sents.length - 1) { spans.push([from, pcmLength]); break; }
    const m = take.marks.find((x) => x.word === sents[k].to);
    if (!m || m.gap < 0) return null;
    const g = take.gaps[m.gap];
    spans.push([from, Math.min(pcmLength, g.a * F + keep)]);
    from = Math.max(0, g.b * F - keep);
  }
  return spans;
}

/**
 * One line from several takes of it: sentence k from `takes[pace_k]` ({ pcm, take }),
 * joined across a sentence-end silence with a 5 ms fade either side of each cut. The
 * pauses are set afterwards by shapePauses, like any other take.
 */
export function spliceSentences(takes, text, pace, rate) {
  const sents = sentencesOf(text, pace);
  const spans = {};
  for (const p of new Set(sents.map((s) => s.pace))) {
    spans[p] = sentenceSpans(takes[p].take, takes[p].pcm.length, text, pace);
    if (!spans[p]) return null;
  }
  const gap = Math.round(rate * PAUSES.stop.aim);
  const fade = Math.round(rate * 0.005);
  const parts = sents.map((s, k) => {
    const [a, b] = spans[s.pace][k];
    const seg = Int16Array.from(takes[s.pace].pcm.subarray(a, b));
    for (let i = 0; i < fade && i < seg.length; i += 1) {
      const g = i / fade;
      if (k > 0) seg[i] = Math.round(seg[i] * g);
      if (k < sents.length - 1) seg[seg.length - 1 - i] = Math.round(seg[seg.length - 1 - i] * g);
    }
    return seg;
  });
  const total = parts.reduce((n, p) => n + p.length, 0) + gap * (parts.length - 1);
  const out = new Int16Array(total);
  let at = 0;
  parts.forEach((p, k) => { out.set(p, at); at += p.length + (k < parts.length - 1 ? gap : 0); });
  return out;
}

/** A 16-bit mono WAV of `pcm`. */
export function wavOf(pcm, rate) {
  const out = Buffer.alloc(44 + pcm.length * 2);
  out.write('RIFF', 0, 'ascii'); out.writeUInt32LE(36 + pcm.length * 2, 4); out.write('WAVE', 8, 'ascii');
  out.write('fmt ', 12, 'ascii'); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36, 'ascii'); out.writeUInt32LE(pcm.length * 2, 40);
  for (let i = 0; i < pcm.length; i += 1) out.writeInt16LE(pcm[i], 44 + i * 2);
  return out;
}

/** `pcm` with its silence before the first sound cut to `keepS`. */
export function trimLead(pcm, rate, keepS = 0.05) {
  const fr = framesOf(pcm, rate);
  if (fr.first < 0) return pcm;
  const from = Math.max(0, fr.first * fr.F - Math.round(rate * keepS));
  return pcm.subarray(from);
}
