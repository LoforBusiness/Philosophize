// ─────────────────────────────────────────────────────────────────────────────
// THE STICKMAN'S MOUTH — every line he has, measured in the box it lands in.
//
//   node scripts/check-quips.mjs          (npm run check:quips)
//
// Three pools of hand-written lines, and until this file existed nothing checked
// any of them for the one thing that can actually break:
//
//   · LOAFER_LINES        — the thought cloud on the reward screen
//   · streakMood's LINES  — what the mascot says on the streak tab
//   · userBio's pools     — the "who you're becoming" sentence on Profile
//
// ── WHY A CHECKER, FOR PROSE ────────────────────────────────────────────────
//
// Because two of the three sit in a box that CANNOT GROW, and the failure is
// silent in both directions. RewardLoafer's cloud is anchored from its bottom edge
// so that it hangs at the figure's head — which means a line that wraps to a
// fourth row does not push anything down, it grows UP, straight off the top of the
// block. And every line in that pool is hand-broken with `\n` to a width the file
// states in CHARACTERS, which is not a width at all: in Inter 12.5 "Wittgenstein"
// is 78px and "illiterate," is 51. Same twelve characters.
//
// So the lines are measured against the real advance widths out of the real .ttf
// (scripts/lib/ttfwidth.mjs, plain Node, no browser), against the real inner width
// of the real box, both read out of the components rather than retyped here. That
// last part is the bit that keeps this honest: if someone widens the cloud, this
// check follows it, and if someone widens it by mistake this check is what says so.
//
// ── COUNTER-TESTED ──────────────────────────────────────────────────────────
//
// Every rule below was confirmed by putting the defect back and watching it fail
// (§17's L8). Four went red on real defects while this file was being written —
// the mood pools at four lines, the bio openers at seven, a shipped line that
// stranded "tired." mid-sentence, and a shipped line reading "study without
// thought is useless", which the banned-word rule cannot tell from an insult. The
// rest were staged: a row over the box, a four-row cloud entry, a duplicate, a
// mascot line wrapping to four, and a character each face has no glyph for.
//
// The glyph counter-test is the one worth remembering, because it FAILED FIRST and
// the checker was right: Cyrillic was chosen as "something a handwriting face
// obviously will not have", and Caveat ships Cyrillic. A counter-test that stages
// the wrong defect proves nothing in either direction.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { loadFont, wrap } from './lib/ttfwidth.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.slice(1)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let fails = 0;
const ok = (msg, detail = '') => console.log(`  ok    ${msg}${detail ? `  — ${detail}` : ''}`);
const bad = (msg, detail = '') => { fails++; console.log(`  FAIL  ${msg}${detail ? `  — ${detail}` : ''}`); };

const INTER = loadFont('node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf');
const CAVEAT = loadFont('node_modules/@expo-google-fonts/caveat/700Bold/Caveat_700Bold.ttf');
const PLAYFAIR = loadFont('node_modules/@expo-google-fonts/playfair-display/400Regular/PlayfairDisplay_400Regular.ttf');

/**
 * Pull a quoted string array out of TypeScript source.
 *
 * Comments are stripped first, for the reason §17's L8 gives: a comment quoting
 * the very line it explains is indistinguishable from the line itself, and that
 * has already made one detector in this repo report a clean file as defective.
 */
function strings(src) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const out = [];
  const re = /(['"])((?:\\.|(?!\1)[^\\])*)\1/g;
  let m;
  while ((m = re.exec(clean))) out.push(m[2].replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"'));
  return out;
}

/** A number out of a StyleSheet, so the budgets track the components. */
function num(src, key, where) {
  const m = new RegExp(`${key}:\\s*(-?[\\d.]+)`).exec(src);
  if (!m) { bad(`could not read ${key} from ${where}`); return NaN; }
  return parseFloat(m[1]);
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. THE REWARD SCREEN'S THOUGHT CLOUD
// ═════════════════════════════════════════════════════════════════════════════
console.log('\nthe thought cloud (reward screen)\n');
{
  const src = read('components/gamification/RewardLoafer.tsx');
  const block = src.slice(src.indexOf('export const LOAFER_LINES'), src.indexOf('];', src.indexOf('export const LOAFER_LINES')));
  const lines = strings(block);

  // The box, read out of the component. maxWidth less its two paddings and its two
  // borders is the width a row of text actually gets.
  const maxWidth = num(src, 'maxWidth', 'the cloud');
  const padX = num(src, 'paddingHorizontal', 'the cloud');
  const border = num(src, 'borderWidth', 'the cloud');
  const size = num(src.slice(src.indexOf('cloudText:')), 'fontSize', 'the cloud text');
  const inner = maxWidth - padX * 2 - border * 2;

  // ── HOW MANY ROWS THE BLOCK CAN HOLD ──────────────────────────────────────
  //
  // Derived, not chosen. The cloud sits `CLOUD_B` up from the bottom of a block
  // `H` tall, so the tallest it can be is H − CLOUD_B, and the file's own comment
  // records that three rows clear the top edge by 6px while a fourth would not.
  const H = parseFloat(/const H = ([\d.]+)/.exec(src)[1]);
  const lineH = num(src.slice(src.indexOf('cloudText:')), 'lineHeight', 'the cloud text');
  const padY = num(src, 'paddingVertical', 'the cloud');
  const CLOUD_B = 56; // H − (HEAD_Y + 32), the anchor in the component
  const room = H - CLOUD_B;
  const maxRows = Math.floor((room - padY * 2 - border * 2) / lineH);

  if (lines.length >= 100) ok(`${lines.length} lines in the pool`);
  else bad(`only ${lines.length} lines — one repeated is a label, not a voice`);

  if (new Set(lines).size === lines.length) ok('no line appears twice');
  else {
    const seen = new Set(), dupes = [];
    for (const l of lines) { if (seen.has(l)) dupes.push(l); seen.add(l); }
    bad(`${dupes.length} duplicate line(s)`, JSON.stringify(dupes[0]));
  }

  // ── EVERY HAND-BROKEN ROW FITS ────────────────────────────────────────────
  const over = [];
  const tall = [];
  let widest = 0, widestRow = '';
  for (const L of lines) {
    const rows = L.split('\n');
    if (rows.length > maxRows) tall.push(L);
    for (const r of rows) {
      const w = INTER.width(r, size);
      if (w > widest) { widest = w; widestRow = r; }
      if (w > inner) over.push([r, w]);
    }
  }
  if (!over.length) {
    ok(`every row fits the ${inner}px cloud`, `widest ${widest.toFixed(1)}px — ${JSON.stringify(widestRow)}`);
  } else {
    bad(`${over.length} row(s) wider than the ${inner}px cloud`,
      `${JSON.stringify(over[0][0])} at ${over[0][1].toFixed(1)}px`);
  }
  // ── EVERY CHARACTER EXISTS IN THE FACE ────────────────────────────────────
  //
  // A character the font does not carry reaches the reader as a tofu box, and the
  // width rule above cannot see it: `.notdef` is narrow, so a row of them measures
  // comfortably inside budget. Typographic quotes and dashes are what actually
  // turn up in hand-written copy.
  const gaps = new Set();
  for (const L of lines) for (const ch of INTER.missing(L.split('\n').join(''))) gaps.add(ch);
  if (!gaps.size) ok('every character exists in Inter');
  else bad(`${gaps.size} character(s) Inter has no glyph for`, [...gaps].map((c) => JSON.stringify(c)).join(' '));

  if (!tall.length) ok(`no entry exceeds ${maxRows} rows`, `the block holds ${room}px above the anchor`);
  else bad(`${tall.length} entr(y/ies) over ${maxRows} rows — the cloud grows UP, off the block`,
    JSON.stringify(tall[0]));

  // ── NO ORPHANED TAIL (D30) ────────────────────────────────────────────────
  //
  // The defect this is about is the one the component's own comment records:
  // "Descartes doubted all." broke and stranded "all." on a row of its own, mid
  // sentence, which reads as a rendering fault.
  //
  // THE FIRST DRAFT OF THIS RULE COULD NOT TELL THE DESIGN FROM THE DEFECT, which
  // is the exact trap §21 records check-intro falling into. It flagged any short
  // final row — and caught "This is not a\npersonality.\nYet." and "Epictetus was
  // a\nslave. You are\ntired.", which are not defects at all. A short word alone
  // after a full stop is THE PUNCHLINE, and it is most of this character's timing.
  //
  // So a tail is only orphaned when the row above it does NOT end a sentence: the
  // break falls inside the thought rather than between two of them.
  const ENDS_SENTENCE = /[.!?…:—]["')\]]?$/;
  const orphans = lines.filter((L) => {
    const rows = L.split('\n');
    if (rows.length < 2) return false;
    const last = rows[rows.length - 1], prev = rows[rows.length - 2];
    if (ENDS_SENTENCE.test(prev)) return false;
    if (last.split(' ').length > 1 || last.length > 6) return false;
    return INTER.width(`${prev} ${last}`, size) <= inner;
  });
  if (!orphans.length) ok('no line strands a short tail that would have fitted above');
  else {
    bad(`${orphans.length} orphaned break(s)`);
    for (const o of orphans) console.log(`          ${JSON.stringify(o)}`);
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. THE STREAK MASCOT
// ═════════════════════════════════════════════════════════════════════════════
console.log('\nthe streak mascot\n');
{
  const src = read('lib/utils/streakMood.ts');
  const block = src.slice(src.indexOf('const LINES'), src.indexOf('export function lineFor'));
  const mascot = read('components/gamification/StreakMascot.tsx');

  const maxWidth = num(mascot.slice(mascot.indexOf('saidWrap:')), 'maxWidth', 'the mascot line');
  const padX = num(mascot.slice(mascot.indexOf('saidWrap:')), 'paddingHorizontal', 'the mascot line');
  const size = num(mascot.slice(mascot.indexOf('said:')), 'fontSize', 'the mascot line');

  // ── MEASURED ON THE NARROW PHONE, NOT THE IDEAL ONE ───────────────────────
  //
  // `maxWidth: 300` only binds when the screen is wide enough to grant it. The
  // streak body pads SPACE[3] a side, so a 390dp phone leaves 358 and the cap
  // holds — but a 320dp one leaves 288, and the block is 12px narrower than the
  // number every line was written against. §19 records the same lesson costing a
  // real defect: "PER ACTIVE DAY" measured fine at 390 and wrapped at 360, and the
  // narrow phone is the one it broke on. So the budget is the narrow case.
  const NARROW_DP = 320;
  const bodyPad = 16; // SPACE[3], streak.tsx `body`
  const inner = Math.min(maxWidth, NARROW_DP - bodyPad * 2) - padX * 2;

  // Per mood, so a mood cannot be quietly left thin while the total looks healthy.
  const moods = [...block.matchAll(/^\s{2}(\w+):\s*\[([\s\S]*?)^\s{2}\],/gm)];
  if (moods.length === 6) ok('all six moods still have their own pool');
  else bad(`found ${moods.length} mood pools, expected 6`);

  const all = [];
  let thin = 0;
  for (const [, mood, body] of moods) {
    const pool = strings(body);
    all.push(...pool);
    if (pool.length >= 10) ok(`${mood}: ${pool.length} lines`);
    else { thin++; bad(`${mood}: only ${pool.length} lines`, 'a mood a reader sits in for days needs more than a handful'); }
  }
  if (!thin && all.length) ok(`${all.length} mascot lines in total`);

  if (new Set(all).size === all.length) ok('no mascot line appears twice');
  else {
    const seen = new Set(), dupes = [];
    for (const l of all) { if (seen.has(l)) dupes.push(l); seen.add(l); }
    bad(`${dupes.length} duplicate mascot line(s)`, JSON.stringify(dupes[0]));
  }

  // ── IT WRAPS TO THREE ROWS AT MOST ────────────────────────────────────────
  //
  // The hero on the streak tab is not a fixed-height box, so a fourth row does not
  // clip — it SHOVES, and what it shoves is the 72px count that is the whole point
  // of the screen. Three is what the shipped corpus already sits inside.
  const MAX_ROWS = 3;
  const long = [];
  let worst = 0, worstLine = '';
  for (const L of all) {
    const rows = wrap(L, size, inner, CAVEAT);
    if (rows.length > worst) { worst = rows.length; worstLine = L; }
    if (rows.length > MAX_ROWS) long.push([L, rows.length]);
  }
  // Caveat is a 753-glyph handwriting face against Inter's 2818, so it is much the
  // likelier of the two to be missing something a writer reaches for.
  const gaps = new Set();
  for (const L of all) for (const ch of CAVEAT.missing(L)) gaps.add(ch);
  if (!gaps.size) ok('every character exists in Caveat');
  else bad(`${gaps.size} character(s) Caveat has no glyph for`, [...gaps].map((c) => JSON.stringify(c)).join(' '));

  if (!long.length) ok(`every line wraps to ${MAX_ROWS} rows or fewer`, `worst ${worst} — ${JSON.stringify(worstLine)}`);
  else bad(`${long.length} line(s) wrap past ${MAX_ROWS} rows and push the count down`,
    `${JSON.stringify(long[0][0])} → ${long[0][1]} rows`);
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. HE NEEDLES ATTENDANCE, NEVER ABILITY — ACROSS ALL THREE POOLS
// ═════════════════════════════════════════════════════════════════════════════
//
// check-streak already held this over streakMood. It never covered the reward
// screen or the bio, which are the two a reader meets FIRST and the two most
// likely to land on somebody's very first lesson.
console.log('\nthe one hard line\n');
{
  const BANNED = /\b(stupid|dumb|idiot|idiotic|useless|hopeless|pathetic|bad at|no good at|too slow|never learn|failure|moron|thick|simpleton)\b/i;
  const pools = [
    ['the thought cloud', 'components/gamification/RewardLoafer.tsx', 'export const LOAFER_LINES', '];'],
    ['the mascot', 'lib/utils/streakMood.ts', 'const LINES', 'export function lineFor'],
    ['the bio', 'lib/utils/userBio.ts', 'const ARCHETYPE', 'export function generateUserBio'],
  ];
  let hits = 0;
  for (const [name, file, from, to] of pools) {
    const src = read(file);
    const start = src.indexOf(from);
    const block = src.slice(start, src.indexOf(to, start + from.length));
    const offenders = strings(block).filter((l) => l.length > 6 && BANNED.test(l));
    if (offenders.length) { hits++; bad(`${name}: ${offenders.length} line(s) attack ability, not attendance`, JSON.stringify(offenders[0])); }
  }
  if (!hits) ok('every line in all three pools needles attendance, not ability');
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. THE BIO'S POOLS
// ═════════════════════════════════════════════════════════════════════════════
//
// No box to overflow here — the card grows — so the only thing worth holding is
// that no branch is left thin. A reader whose top interest is aesthetics reads
// from the aesthetics pool and nothing else, so a pool of four is a bio that
// repeats every fourth refresh however large the file looks in total.
console.log('\nthe bio\n');
{
  const src = read('lib/utils/userBio.ts');
  const arch = src.slice(src.indexOf('const ARCHETYPE:'), src.indexOf('const ARCHETYPE_GENERIC'));
  const branches = [...arch.matchAll(/^\s{2}'?([\w-]+)'?:\s*\[([\s\S]*?)^\s{2}\],/gm)];
  if (branches.length === 6) ok('all six branches have an archetype pool');
  else bad(`found ${branches.length} archetype pools, expected 6`);

  let thin = 0;
  for (const [, slug, body] of branches) {
    const pool = strings(body);
    if (pool.length >= 12) ok(`${slug}: ${pool.length} openers`);
    else { thin++; bad(`${slug}: only ${pool.length} openers`, 'the opener is the first thing read, so it is the repetition a reader notices'); }
  }

  for (const [name, from] of [['generic openers', 'const ARCHETYPE_GENERIC'], ['closers', 'const MICRO'], ['blank slate', 'const BLANK_SLATE']]) {
    const start = src.indexOf(from);
    const pool = strings(src.slice(start, src.indexOf('];', start)));
    if (pool.length >= 8) ok(`${name}: ${pool.length}`);
    else { thin++; bad(`${name}: only ${pool.length}`); }
  }

  // ── AND THE BIO IS SET IN PLAYFAIR, NOT INTER ─────────────────────────────
  //
  // Every one of these pools is thick with typographic quotes and em dashes,
  // because the voice wants them. Playfair carries all of them, but the point of
  // checking is that nothing in the source says so, and the failure is a tofu box
  // in the middle of a sentence about the reader.
  const all = strings(src.slice(src.indexOf('const ARCHETYPE:'), src.indexOf('export function generateUserBio')));
  const bioGaps = new Set();
  for (const l of all) for (const ch of PLAYFAIR.missing(l)) bioGaps.add(ch);
  if (!bioGaps.size) ok('every character exists in Playfair Display');
  else bad(`${bioGaps.size} character(s) Playfair has no glyph for`, [...bioGaps].map((c) => JSON.stringify(c)).join(' '));

  if (new Set(all).size === all.length) ok('no bio phrase appears twice');
  else {
    const seen = new Set(), dupes = [];
    for (const l of all) { if (seen.has(l)) dupes.push(l); seen.add(l); }
    bad(`${dupes.length} duplicate bio phrase(s)`, JSON.stringify(dupes[0]));
  }
}

console.log(fails ? `\n${fails} failing.\n` : '\nall clear.\n');
process.exit(fails ? 1 : 0);
