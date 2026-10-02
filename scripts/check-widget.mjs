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
//   1  FACTS     every fact is true-shaped (short, a full stop, no "!") and fits
//                WHOLE at the smallest split size, and fits with his line under it
//                at a typical 4×2.
//   2  LINES     every line he can say fits his foot (two rows) and the 2×2's
//                column, with no word wider than the column.
//   3  VOICE     no line is about how good the reader is (§7): he needles
//                attendance, never ability.
//   4  STATES    every state and every pool is reachable from real inputs, every
//                pose it names was generated, and the fact rotates round all seven
//                subjects.
//   5  CONTRAST  every word clears 4.5:1 on what it sits on; the figure clears 3:1
//                against the ground he stands on.
//
// Its first run failed nine things, all real: five lines cut off on the smallest
// widget, an evening ground the figure vanished into, and a kicker at 4.42:1.
import { W, STATES } from './sheet-widget.mjs';

const { layoutWidget, wrapLines, textWidth, PAD, FOOT, SPLIT_MIN_W, SPLIT_MIN_H } = W.layout;
const { SCENES } = W.scenes;
const { LINES, FACT_ORDER, widgetMood, timeOfDay } = W.mood;

const fails = [];
const fail = (s) => fails.push(s);

// ── 1 FACTS ─────────────────────────────────────────────────────────────────
const SMALL = [SPLIT_MIN_W, SPLIT_MIN_H];
const TYPICAL = [300, 150];
const LONGEST_LINE = Object.values(LINES).flat().reduce((a, b) => (b.length > a.length ? b : a), '').replace('{n}', '120').replace('{d}', '14');
let nFacts = 0;
for (const [subject, list] of Object.entries(W.facts)) {
  if (!FACT_ORDER.includes(subject)) fail(`FACTS  "${subject}" is not in FACT_ORDER, so it is never shown`);
  if (!W.subjects.some((s) => s.slug === subject)) fail(`FACTS  "${subject}" is not a subject in data/subjects.ts`);
  if (list.length < 10) fail(`FACTS  ${subject} has ${list.length} facts; 10 at least, or a reader sees repeats inside a fortnight`);
  for (const f of list) {
    nFacts += 1;
    if (f.length > 100) fail(`FACTS  ${subject}: ${f.length} chars (max 100): "${f}"`);
    if (!/[.?"”]$/.test(f)) fail(`FACTS  ${subject}: does not end with a full stop: "${f}"`);
    if (f.includes('!')) fail(`FACTS  ${subject}: an exclamation mark: "${f}"`);
    for (const [w, h] of [SMALL, TYPICAL]) {
      const L = layoutWidget(w, h, f, LONGEST_LINE);
      const inner = L.rightW - PAD.l - PAD.r;
      if (wrapLines(f, L.factSize, inner) > L.factLines) fail(`FACTS  ${subject}: cut off at ${w}×${h}: "${f}"`);
      if (w === TYPICAL[0] && L.footLines === 0) fail(`FACTS  ${subject}: at ${w}×${h} his line has to be dropped to fit: "${f}"`);
      if (L.factSize < 11.5) fail(`FACTS  ${subject}: set below 11.5sp at ${w}×${h}`);
    }
  }
}
for (const s of FACT_ORDER) if (!W.facts[s]) fail(`FACTS  FACT_ORDER names "${s}" and there are no facts for it`);

// ── 2 LINES ─────────────────────────────────────────────────────────────────
const allLines = Object.entries(LINES).flatMap(([pool, list]) => list.map((l) => [pool, l.replace('{n}', '120').replace('{d}', '14')]));
for (const [pool, line] of allLines) {
  const inner = TYPICAL[0] - Math.round(Math.max(96, TYPICAL[0] * 0.37)) - PAD.l - PAD.r;
  if (wrapLines(line, FOOT.size, inner, 800) > 2) fail(`LINES  ${pool}: three rows under the fact: "${line}"`);
  for (const [w, h] of [[160, 160], [180, 110], [250, 110]]) {
    const L = layoutWidget(w, h, '', line);
    if (wrapLines(line, L.lineSize, L.textW, 800) > L.lineLines) fail(`LINES  ${pool}: cut off at ${w}×${h}: "${line}"`);
    const widest = Math.max(...line.split(/\s+/).map((wd) => textWidth(wd, L.lineSize, 800)));
    if (widest > L.textW) fail(`LINES  ${pool}: a word wider than the column at ${w}×${h}: "${line}"`);
  }
}

// ── 3 VOICE ─────────────────────────────────────────────────────────────────
// The same refusal check:quips holds the mascot's other three pools to.
const ABILITY = /\b(stupid|dumb|idiot|slow learner|not smart|bad at|terrible|hopeless|useless|lazy|failure|you fail|clueless|can'?t learn|give up)\b/i;
for (const [pool, line] of allLines) if (ABILITY.test(line)) fail(`VOICE  ${pool}: aimed at ability, not attendance: "${line}"`);
for (const [pool, line] of allLines) if (line.includes('!')) fail(`VOICE  ${pool}: no exclamation marks: "${line}"`);

// ── 4 STATES ────────────────────────────────────────────────────────────────
const WIDGET_POSES = W.poses;
const seenPools = new Set();
const seenSubjects = new Set();
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
for (let day = 0; day < 14; day++) {
  for (let h = 0; h < 24; h++) {
    const now = new Date(2026, 9, 1 + day, h, 15);
    for (const [streak, away, rest] of [[0, null, 0], [5, 0, 0], [5, 1, 0], [0, 1, 0], [9, 2, 1], [0, 2, 0], [0, 5, 0], [0, 20, 0]]) {
      const last = away == null ? null : key(new Date(2026, 9, 1 + day - away));
      const m = widgetMood({ now, streak, lastLessonDate: last, restHeld: rest }, W.facts);
      seenSubjects.add(m.subject);
      if (!WIDGET_POSES[m.pose]) fail(`STATES  pose "${m.pose}" (${m.state}, ${m.tod}) was never generated — run npm run make:widget-poses`);
      if (!m.fact) fail(`STATES  no fact at ${now.toISOString()}`);
      if (/\{[nd]\}/.test(m.line)) fail(`STATES  an unfilled placeholder: "${m.line}"`);
      if (m.state === 'lapsed' && m.streak !== 0) fail('STATES  a lapsed streak shows a number');
      for (const [pool, list] of Object.entries(LINES)) if (list.some((l) => l.replace(/\{[nd]\}/g, '') === m.line.replace(/\d+/g, ''))) seenPools.add(pool);
      if (timeOfDay(h) !== m.tod) fail('STATES  tod disagrees with timeOfDay');
    }
  }
}
for (const pool of Object.keys(LINES)) if (!seenPools.has(pool)) fail(`STATES  the "${pool}" lines can never be shown`);
for (const s of FACT_ORDER) if (!seenSubjects.has(s)) fail(`STATES  ${s} never comes round`);

// ── 5 CONTRAST ──────────────────────────────────────────────────────────────
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const need = (fg, bg, floor, what) => { const r = ratio(fg, bg); if (r < floor) fail(`CONTRAST  ${what}: ${r.toFixed(2)}:1, floor ${floor}`); };
for (const [name, P] of Object.entries(SCENES)) {
  need(P.pillFg, P.pillBg, 4.5, `${name} streak pill`);
  need(P.text, P.sky, 4.5, `${name} line on the sky`);
  need(P.text, P.far, 4.5, `${name} line where it can reach the far hills`);
  need(P.figure, P.ground, 3, `${name} figure on the ground`);
  need(P.figure, P.near, 3, `${name} figure on the near hills`);
  need(P.figure, P.sky, 3, `${name} figure on the sky`);
}
const PAPER = '#FBFAF6';
need('#1A1A1A', PAPER, 4.5, 'the fact');
need('#5C574F', PAPER, 4.5, 'his line, calm');
need('#A8401F', PAPER, 4.5, 'his line, urgent');
for (const s of W.subjects) need(W.scenes.inkFor(s.hue, PAPER), PAPER, 4.5, `${s.short} kicker`);

// ── report ──────────────────────────────────────────────────────────────────
if (fails.length) {
  console.log(`check:widget — ${fails.length} problem${fails.length > 1 ? 's' : ''}\n`);
  for (const f of fails) console.log(`  ${f}`);
  process.exit(1);
}
console.log(`check:widget — ${nFacts} facts across ${FACT_ORDER.length} subjects and ${allLines.length} lines fit their boxes; `
  + `${Object.keys(LINES).length} pools all reachable over ${STATES.length} sheet states and a fortnight of clock; every word clears 4.5:1.`);
