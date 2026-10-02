// THE HOME-SCREEN WIDGET, HELD TO ITS OWN BOX.
//
//   npm run check:widget
//
// The widget renders in a headless task to Android RemoteViews, where nothing can
// be measured and a text that runs out of lines just ends in an ellipsis. So every
// size decision is arithmetic (components/widget/widgetLayout.ts) and this runs
// the same arithmetic over everything the widget can ever say. Plain Node: the
// modules it reads are zero-import (sheet-widget.mjs loads them; this reuses it).
//
//   1  FACTS     every fact is short, ends with a full stop and has no "!", and is
//                shown WHOLE at a typical 4×2 (330×190) beside every line he can say.
//   2  LINES     every line fits two rows beside the biggest streak, and one row in
//                the 4×1 strip or it is left out; every status fits its row.
//   3  VOICE     no line is about how good the reader is (§7): he needles
//                attendance, never ability.
//   4  STATES    every pool and every status is reachable from real inputs, the
//                fact rotates round all seven subjects, and the week row is Monday
//                first with today, studied, rested, missed and future days right.
//   5  CONTRAST  type clears 4.5:1 on what it sits on; marks clear 3:1.
//
// Its first run failed nine things on the previous design, all real.
import { W, STATES } from './sheet-widget.mjs';

const { layoutWidget, factShown, wrapLines, textWidth, T } = W.layout;
const { LINES, FACT_ORDER, STATUS_TEXTS, widgetMood, weekOf, timeOfDay } = W.mood;
const { W: C, contrast, markFor, mix, STATUS_COLOR } = W.theme;

const fails = [];
const fail = (s) => fails.push(s);
const allLines = Object.entries(LINES).flatMap(([pool, list]) => list.map((l) => [pool, l.replace('{n}', '120').replace('{d}', '14')]));

// ── 1 FACTS ─────────────────────────────────────────────────────────────────
let nFacts = 0;
for (const [subject, list] of Object.entries(W.facts)) {
  if (!FACT_ORDER.includes(subject)) fail(`FACTS  "${subject}" is not in FACT_ORDER, so it is never shown`);
  if (!W.subjects.some((s) => s.slug === subject)) fail(`FACTS  "${subject}" is not a subject in data/subjects.ts`);
  if (!W.icons.ICONS[subject]) fail(`FACTS  "${subject}" has no Material Symbol in widgetIcons.ts`);
  if (list.length < 10) fail(`FACTS  ${subject} has ${list.length} facts; 10 at least, or a reader sees repeats inside a fortnight`);
  for (const f of list) {
    nFacts += 1;
    if (f.length > 100) fail(`FACTS  ${subject}: ${f.length} chars (max 100): "${f}"`);
    if (!/[.?"”]$/.test(f)) fail(`FACTS  ${subject}: does not end with a full stop: "${f}"`);
    if (f.includes('!')) fail(`FACTS  ${subject}: an exclamation mark: "${f}"`);
    const short = allLines.find(([, l]) => !factShown(330, 190, 120, l, f));
    if (short) fail(`FACTS  ${subject}: not shown whole at 330×190 beside "${short[1]}": "${f}"`);
  }
}
for (const s of FACT_ORDER) if (!W.facts[s]) fail(`FACTS  FACT_ORDER names "${s}" and there are no facts for it`);

// ── 2 LINES ─────────────────────────────────────────────────────────────────
for (const [pool, line] of allLines) {
  const L = layoutWidget(330, 190, 120, line, '');
  if (L.mode !== 'full' || !L.lineLines) fail(`LINES  ${pool}: more than two rows beside the streak at 330×190: "${line}"`);
}
for (const s of STATUS_TEXTS) {
  // The status sits beside an 18dp mark in the full widget, alone in the 2×2.
  const L = layoutWidget(330, 190, 120, '', '');
  if (textWidth(s, T.status.size, 800) > L.leftW - 24) fail(`LINES  status "${s}" is wider than its row at 330×190`);
  if (textWidth(s, 12.5, 800) > 172 - 28) fail(`LINES  status "${s}" is wider than the 2×2`);
  if (textWidth(s, 14, 800) > 320 - 24 - 80 - 14) fail(`LINES  status "${s}" is wider than the 4×1 strip`);
}

// ── 3 VOICE ─────────────────────────────────────────────────────────────────
// The same refusal check:quips holds the mascot's other pools to.
const ABILITY = /\b(stupid|dumb|idiot|slow learner|not smart|bad at|terrible|hopeless|useless|lazy|failure|you fail|clueless|can'?t learn|give up)\b/i;
for (const [pool, line] of allLines) {
  if (ABILITY.test(line)) fail(`VOICE  ${pool}: aimed at ability, not attendance: "${line}"`);
  if (line.includes('!')) fail(`VOICE  ${pool}: no exclamation marks: "${line}"`);
}

// ── 4 STATES ────────────────────────────────────────────────────────────────
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const seenPools = new Set(), seenStatus = new Set(), seenSubjects = new Set();
for (let day = 0; day < 14; day++) {
  for (let h = 0; h < 24; h++) {
    const now = new Date(2026, 9, 1 + day, h, 15);
    for (const [streak, away, rest] of [[0, null, 0], [5, 0, 0], [5, 1, 0], [0, 1, 0], [9, 2, 1], [0, 2, 0], [0, 5, 0], [0, 20, 0]]) {
      const last = away == null ? null : key(new Date(2026, 9, 1 + day - away));
      const m = widgetMood({ now, streak, lastLessonDate: last, restHeld: rest }, W.facts);
      seenSubjects.add(m.subject);
      seenStatus.add(m.status);
      if (!m.fact) fail(`STATES  no fact at ${now.toISOString()}`);
      if (/\{[nd]\}/.test(m.line)) fail(`STATES  an unfilled placeholder: "${m.line}"`);
      if (m.state === 'lapsed' && m.streak !== 0) fail('STATES  a lapsed streak shows a number');
      if (m.week.length !== 7) fail('STATES  the week row is not seven days');
      for (const [pool, list] of Object.entries(LINES)) if (list.some((l) => l.replace(/\{[nd]\}/g, '') === m.line.replace(/\d+/g, ''))) seenPools.add(pool);
      if (timeOfDay(h) !== m.tod) fail('STATES  tod disagrees with timeOfDay');
    }
  }
}
for (const pool of Object.keys(LINES)) if (!seenPools.has(pool)) fail(`STATES  the "${pool}" lines can never be shown`);
for (const s of STATUS_TEXTS) if (!seenStatus.has(s)) fail(`STATES  the status "${s}" can never be shown`);
for (const s of FACT_ORDER) if (!seenSubjects.has(s)) fail(`STATES  ${s} never comes round`);
{
  // Thursday 15 Oct 2026: Mon 12 studied, Tue 13 rested, Wed 14 missed, Thu today.
  const thu = new Date(2026, 9, 15, 10);
  const wk = weekOf(thu, ['2026-10-12'], ['2026-10-13'], null);
  const want = ['done', 'rest', 'missed', 'today', 'future', 'future', 'future'];
  if (wk.join() !== want.join()) fail(`STATES  week row for Thu 15 Oct is ${wk.join()}, want ${want.join()} (Monday first)`);
  if (weekOf(thu, [], [], '2026-10-15')[3] !== 'todayDone') fail('STATES  a lesson done today does not mark today done');
  if (weekOf(new Date(2026, 9, 18, 10), [], [], null)[6] !== 'today') fail('STATES  Sunday is not the last day of the week row');
}

// ── 5 CONTRAST ──────────────────────────────────────────────────────────────
const need = (fg, bg, floor, what) => { const r = contrast(fg, bg); if (r < floor) fail(`CONTRAST  ${what}: ${r.toFixed(2)}:1, floor ${floor}`); };
need(C.on, C.bg, 4.5, 'the streak and status on the container');
need(C.soft, C.bg, 4.5, 'his line on the container');
need(C.on, C.pill, 4.5, 'the fact on its pill');
for (const [tone, col] of Object.entries(STATUS_COLOR)) need(col, C.bg, 4.5, `the ${tone} status`);
need(C.ember, C.bg, 3, 'the flame');
need(C.out, C.bg, 3, 'a grey flame');
need(C.ember, C.pill, 3, 'a studied day on the week pill');
need(C.on, C.pill, 3, "today's ring");
need('#FFFFFF', C.ember, 3, "a studied day's letter");
need(C.bg, C.rest, 3, "a rest day's letter");
need(C.soft, mix(C.pill, C.on, 0.14), 3, "a missed day's letter");
for (const s of W.subjects) need(markFor(s.hue), C.pill, 3, `${s.short} mark on the fact pill`);

// ── report ──────────────────────────────────────────────────────────────────
if (fails.length) {
  console.log(`check:widget — ${fails.length} problem${fails.length > 1 ? 's' : ''}\n`);
  for (const f of fails) console.log(`  ${f}`);
  process.exit(1);
}
console.log(`check:widget — ${nFacts} facts across ${FACT_ORDER.length} subjects shown whole beside all ${allLines.length} lines at 4×2; `
  + `${Object.keys(LINES).length} pools and ${STATUS_TEXTS.length} statuses reachable over ${STATES.length} sheet states and a fortnight of clock; the week is Monday first; every word clears 4.5:1.`);
