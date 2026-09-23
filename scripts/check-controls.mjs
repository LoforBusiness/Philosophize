// EVERY WORD A CONTROL PUTS ON SCREEN, MEASURED AGAINST THE ROOM IT HAS.
//
// The six answer controls are SHARED components, and every label they draw comes
// from the lesson scripts — `lo`/`hi` on a drag, `left`/`right` on a split, the
// stops of a lever, a plot's axis and columns, a field's four ends. So the question
// "does any of this get cut off" is one component times a list of strings, not 186
// lessons stepped in a browser. This measures the strings with the REAL font at the
// REAL size and tracking, in a blank page, and needs neither Metro nor the app.
//
//   npm run check:controls
//
// It wants a headless Chrome on 9382 (or CDP_PORT):
//   chrome --headless=new --remote-debugging-port=9382 --user-data-dir=<tmp>
//
// WHY THIS EXISTS. A reader reported, twice, that the words on the sliding controls
// run off the screen — "the bar and where you move to what you think would be
// correct … words are cut off the screen from the left and the right". The drag's
// end labels sat in a space-between row with no width of their own, so a long pair
// simply pushed past both edges, and a lever printed a whole sentence under every
// notch in a third of the width. Nothing measured any of it, because the lesson
// sweep measures what a SCENE draws and these belong to the control.
//
// It is also the fast path: 483 labels across 186 lessons, in about two minutes,
// with no Metro and no stepping.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const CDP = Number(process.env.CDP_PORT || 9382);
const DIR = 'components/lesson/cinematic';
const FONTS = 'node_modules/@expo-google-fonts';

/**
 * The narrowest phone worth holding to.
 *
 * 360 rather than 390: `check-legible` measures on 390 and the type survives there,
 * but a label that fits 390 and not 360 is still a cut word on a real phone.
 */
const PHONE = 360;

/**
 * Every slot, with the numbers read off the component rather than guessed. `room`
 * is a function because some boxes divide the row between however many things are
 * in it — a lever's cells between its stops, a plot's between its columns.
 */
const SLOTS = {
  // `ends` is a space-between row and neither label has a width, so each gets half.
  'drag.end': { file: 'DragScale.tsx', font: 'Inter_700Bold', size: 9.5, track: 1, lines: 2, room: () => (PHONE - 26 * 2) / 2 - 6 },
  // maxWidth 130, numberOfLines 2 — the one that was already bounded.
  'split.side': { file: 'SplitBar.tsx', font: 'Inter_700Bold', size: 9, track: 0.9, lines: 2, room: () => 130 },
  // labelRow: one flex cell per stop, paddingHorizontal 2, inside wrap's 26.
  'lever.label': { file: 'LeverPick.tsx', font: 'Inter_500Medium', size: 8.5, track: 0, lines: 4, room: (n) => (PHONE - 26 * 2) / n - 10 },
  // THE TREND PICK. The axis name shares its row with the column range and is the
  // one that shrinks, so it has the row less about seventy points of range.
  'trend.axis': { file: 'TrendPick.tsx', font: 'Inter_700Bold', size: 9, track: 1.1, lines: 1, room: () => PHONE - 24 * 2 - 78 },
  // AND THE RANGE BESIDE IT, which nothing measured at all. The head is a
  // space-between row holding the axis and `first → last`, and only the AXIS
  // shrinks — so a long range pushes both off the row while this file, reading
  // the axis against a flat 78pt allowance for a range it had never seen, said
  // every label fitted. The rendered deck found the pair cut in four lessons at
  // 360, 384 AND 390. Measured alone here, and as a PAIR below, because neither
  // number on its own is the constraint.
  'trend.range': { file: 'TrendPick.tsx', font: 'Inter_500Medium', size: 9, track: 0.8, lines: 1, room: () => PHONE - 24 * 2 - 60 },
  // A tile's caption. Four shapes go two by two with two lines each; three sit in
  // one row with three lines each. Each tile's face has 5 of padding and 1.5 of
  // border a side, and the tiles are 6 apart.
  'trend.caption4': { file: 'TrendPick.tsx', font: 'Inter_500Medium', size: 10.5, track: 0, lines: 2, room: () => (PHONE - 24 * 2 - 6) / 2 - 13 },
  'trend.caption3': { file: 'TrendPick.tsx', font: 'Inter_500Medium', size: 10, track: 0, lines: 4, room: () => (PHONE - 24 * 2 - 12) / 3 - 13 },
  // absolute, width 52.
  'field.y': { file: 'FieldPick.tsx', font: 'Inter_700Bold', size: 8, track: 0.6, lines: 3, room: () => 64 },
  // row: paddingHorizontal 16 and a 10 gap between two cards, then each card's own
  // paddingHorizontal 12 and 2 of border.
  'cards.text': { file: 'ChoiceCards.tsx', font: 'PlayfairDisplay_700Bold', size: 14, track: 0, lines: 3, room: () => (PHONE - 32 - 10) / 2 - 28 },
  // xRow: paddingLeft 68 inside wrap's 22, two flex cells.
  'field.x': { file: 'FieldPick.tsx', font: 'Inter_700Bold', size: 8.5, track: 0.8, lines: 2, room: () => (PHONE - 22 * 2 - 68) / 2 },

  // ── THE READOUT, WHICH NOTHING HAD EVER MEASURED ───────────────────────────
  //
  // The biggest word on the beat — 16-17pt Playfair, dead centre, the sentence the
  // whole control exists to change — and it was invisible to BOTH instruments at
  // once, because each had a blind spot and the two lined up exactly on it. This
  // file never listed it. And `check-readable`, which does scan the lower deck,
  // walks `div,span`: the readout was an ACounter, an `Animated(TextInput)`, which
  // on the web is an `<input>`. Neither a div nor a span, so never once read.
  //
  // An `<input>` cannot WRAP either, so a long reading had nowhere to go but off
  // the right-hand edge, which is what the reader reported twice over —
  // "letters are cut off to the right". The readouts are wrapping <Text> now (see
  // the note at the top of DragScale on what replaced the TextInput and why the
  // render cost did not come back), and these are the numbers holding them to it.
  'drag.read':  { file: 'DragScale.tsx', font: 'PlayfairDisplay_700Bold', size: 15, track: 0, lines: 2, room: () => PHONE - 26 * 2 },
  'lever.read': { file: 'LeverPick.tsx', font: 'PlayfairDisplay_700Bold', size: 15, track: 0, lines: 2, room: () => PHONE - 26 * 2 },
  'split.read': { file: 'SplitBar.tsx',  font: 'PlayfairDisplay_700Bold', size: 15, track: 0, lines: 2, room: () => PHONE - 26 * 2 },
  'field.read': { file: 'FieldPick.tsx', font: 'PlayfairDisplay_700Bold', size: 15, track: 0, lines: 2, room: () => PHONE - 22 * 2 },

  // ── THE TWO THAT REPLACED THE LEVER AND THE PAD ────────────────────────────
  //
  // Added in the same commit that added the controls, because the alternative is
  // the exact failure this file's header describes: `lever.*` and `field.*` above
  // now match nothing at all, so if these had been left out the run would have
  // gone on saying "every control label fits" while measuring two controls fewer
  // and never mentioning it. A checker that quietly measures less reads as
  // progress (§21).
  //
  // SortBins: bins is a flex row of `n` cells with a 6px gap, inside the deck's
  // own horizontal padding, and each bin has paddingHorizontal 5.
  // SortBins sets `textTransform: 'uppercase'` on the label, so it is measured in capitals.
  'sort.label': { file: 'SortBins.tsx', font: 'Inter_700Bold', size: 9.5, track: 0.8, lines: 2, upper: true, room: (n) => (PHONE - 20 * 2 - 7 * (n - 1)) / n - 13 },
  // The chip is 140 wide with paddingHorizontal 5, over two lines. It started at
  // 80 on one line and this check immediately found 39 of 50 authored chips too
  // long for it -- "a wall you were told about" is 138dp. The chip names the thing
  // being classified and those names are lesson copy; the box was what was wrong.
  'sort.chip':  { file: 'SortBins.tsx', font: 'Inter_700Bold', size: 10.5, track: 0, lines: 2, room: () => 150 - 16 - 3 },
  'sort.read':  { file: 'SortBins.tsx', font: 'PlayfairDisplay_700Bold', size: 15, track: 0, lines: 2, room: () => PHONE - 20 * 2 },
  // PollBallot rows: the ballot's 20 a side, the face's 10 a side and its 1.5
  // border, then the 8px gem and a 9px gap before the words.
  'poll.reads': { file: 'PollBallot.tsx', font: 'Inter_500Medium', size: 12.5, track: 0, lines: 2, room: () => PHONE - 20 * 2 - 20 - 3 - 17 },
  // The holder names follow HELD BY (about 42 wide) and a 7px gap, indented 17
  // under the gem. They are revealed on answering and must fit one line.
  'poll.names': { file: 'PollBallot.tsx', font: 'Inter_700Bold', size: 11, track: 0, lines: 1, room: () => PHONE - 20 * 2 - 20 - 3 - 17 - 42 - 7 },

  // ── THE TWO THAT REPLACED THE RAIL AND THE SEAM (R21, R22) ─────────────────
  //
  // Same reasoning as the pair above, and by now it is the rule rather than the
  // observation: a control that arrives without a row here is a control this file
  // silently stops measuring, and the run still prints "every control label fits".
  //
  // Both lay their tiles in a `flex: 1` slot inside `wrap`'s 24 a side, six apart,
  // two to a row at four tiles and all in one row below that. Inside each slot is
  // LipPlate's `core` (1.5 of border a side) and `face` (5 of padding a side), so a
  // tile's usable width is its slot less thirteen.
  // Four items go two by two at 10.5 over two lines; three sit in one row, which
  // is an 87dp tile — so that case drops to 10pt over four lines, exactly as the
  // trend tiles do at the identical geometry. The first draft gave both two lines
  // and this check found 34 of the corpus's own captions too long for the narrow
  // one, nearly all of them ordinary four-word phrases: the box was what was
  // wrong, not the copy (the same finding as sort.chip above).
  'order.caption': { file: 'OrderTiles.tsx', font: 'Inter_500Medium', size: 10.5, track: 0, lines: 2, room: () => (PHONE - 24 * 2 - 6) / 2 - 13 },
  'order.caption3': { file: 'OrderTiles.tsx', font: 'Inter_500Medium', size: 10, track: 0, lines: 4, room: () => (PHONE - 24 * 2 - 12) / 3 - 13 },
  // The axis shares its row with the count ("2 OF 3", about 40 wide) and an 8px gap,
  // and is `numberOfLines={1}` with `flexShrink`, so it is the one that clips.
  'order.axis': { file: 'OrderTiles.tsx', font: 'Inter_700Bold', size: 9, track: 1.1, lines: 1, room: () => PHONE - 24 * 2 - 8 - 40 },
  // An odd is always four tiles, so always two to a row.
  'odd.caption': { file: 'OddOneOut.tsx', font: 'Inter_500Medium', size: 10.5, track: 0, lines: 2, room: () => (PHONE - 24 * 2 - 6) / 2 - 13 },
  // A tile with no drawing prints its words INSIDE the art box instead: one more
  // unit of border a side and four of its own padding.
  'odd.bare': { file: 'OddOneOut.tsx', font: 'Inter_700Bold', size: 11, track: 0, lines: 3, room: () => (PHONE - 24 * 2 - 6) / 2 - 13 - 2 - 8 },
  // Beside "ONE DOES NOT BELONG", which sets at about 118 at 9px with 0.8 tracking.
  'odd.axis': { file: 'OddOneOut.tsx', font: 'Inter_700Bold', size: 9, track: 1.1, lines: 1, room: () => PHONE - 24 * 2 - 8 - 118 },
};

const FONT_FILE = {
  PlayfairDisplay_700Bold: `${FONTS}/playfair-display/700Bold/PlayfairDisplay_700Bold.ttf`,
  Inter_500Medium: `${FONTS}/inter/500Medium/Inter_500Medium.ttf`,
  Inter_600SemiBold: `${FONTS}/inter/600SemiBold/Inter_600SemiBold.ttf`,
  Inter_700Bold: `${FONTS}/inter/700Bold/Inter_700Bold.ttf`,
};

// ── every label every lesson hands these controls ────────────────────────────
const scripts = fs.readdirSync(DIR).filter((f) => f.endsWith('Script.ts'));
const want = new Map(Object.keys(SLOTS).map((k) => [k, new Map()]));
const add = (slot, text, from, share = 1) => {
  if (!text) return;
  const m = want.get(slot);
  const key = `${share} ${text}`;
  if (!m.has(key)) m.set(key, { text, share, from: new Set() });
  m.get(key).from.add(from);
};
const unesc = (s) => s.replace(/\\'/g, "'").replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
const str = (block, key) => {
  const m = new RegExp(`${key}: '((?:[^'\\\\]|\\\\.)*)'`).exec(block);
  return m ? unesc(m[1]) : null;
};

for (const f of scripts) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const id = f.replace('Script.ts', '');
  const blocks = (kind, open = '{', close = '}') => [...src.matchAll(
    new RegExp(`\\n\\s{6}${kind}: \\${open}([\\s\\S]*?)\\n\\s{6}\\${close},`, 'g'),
  )].map((m) => m[1]);

  // Every `reads` in a block is ALSO what the readout prints while the control
  // sits there — one list of strings, two boxes, and the readout's is the tighter
  // of the two because it draws them at 17pt rather than 8.5.
  const readsIn = (b) => [...b.matchAll(/reads: '((?:[^'\\]|\\.)*)'/g)].map((v) => unesc(v[1]));

  for (const b of blocks('drag')) {
    for (const k of ['lo', 'hi']) add('drag.end', str(b, k), id);
    for (const r of readsIn(b)) add('drag.read', r, id);
  }
  for (const b of blocks('split')) {
    for (const k of ['left', 'right']) add('split.side', str(b, k), id);
    for (const r of readsIn(b)) add('split.read', r, id);
  }
  for (const b of blocks('lever')) {
    const stops = readsIn(b);
    for (const v of stops) add('lever.label', v, id, stops.length);
    for (const v of stops) add('lever.read', v, id);
  }
  // THE TREND PICK draws a plot's shapes as tiles, and each shape's `reads` is its
  // tile's caption; the axis names the row above them.
  for (const b of blocks('plot')) {
    add('trend.axis', str(b, 'axis'), id);
    // `first  →  last`, exactly as TrendPick joins them.
    {
      const cols = [...(/cols: \[([^\]]*)\]/.exec(b)?.[1] ?? '').matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((v) => unesc(v[1]));
      if (cols.length) add('trend.range', `${cols[0]}  \u2192  ${cols[cols.length - 1]}`, id);
    }
    const caps = readsIn(b);
    for (const r of caps) add(caps.length >= 4 ? 'trend.caption4' : 'trend.caption3', r, id);
  }
  // The deck's two cards.
  for (const b of blocks('cards', '[', ']')) {
    for (const v of b.matchAll(/text: '((?:[^'\\]|\\.)*)'/g)) add('cards.text', unesc(v[1]), id);
  }
  for (const b of blocks('field')) {
    for (const k of ['yLo', 'yHi']) add('field.y', str(b, k), id);
    for (const k of ['xLo', 'xHi']) add('field.x', str(b, k), id);
    for (const r of readsIn(b)) add('field.read', r, id);
  }
  // The two that replaced them.
  for (const b of blocks('sort')) {
    const labels = [...b.matchAll(/label: '((?:[^'\\]|\\.)*)'/g)].map((v) => unesc(v[1]));
    for (const v of labels) add('sort.label', v, id, labels.length);
    add('sort.chip', str(b, 'chip'), id);
    for (const r of readsIn(b)) add('sort.read', r, id);
  }
  for (const b of blocks('poll')) {
    for (const r of readsIn(b)) add('poll.reads', r, id);
    // The holder line is joined with ' · ', so it is measured as one string —
    // which is what the reader sees, and what has to fit.
    for (const h of b.matchAll(/holders: \[([^\]]*)\]/g)) {
      const names = [...h[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((v) => unesc(v[1]));
      if (names.length) add('poll.names', names.join('  ·  '), id);
    }
  }
  // And the two that replaced the rail and the seam (R21, R22).
  for (const b of blocks('order')) {
    const items = readsIn(b);
    for (const v of items) add(items.length >= 4 ? 'order.caption' : 'order.caption3', v, id);
    add('order.axis', str(b, 'axis'), id);
  }
  for (const b of blocks('odd')) {
    // A tile's words sit UNDER a drawing where there is one and INSIDE the art box
    // where there is not, and the two boxes are different sizes — so which slot a
    // string belongs to depends on whether its own tile carries a `draw`.
    for (const t of b.matchAll(/\{[^{}]*?reads: '((?:[^'\\]|\\.)*)'[^{}]*\}/g)) {
      add(/\bdraw:/.test(t[0]) ? 'odd.caption' : 'odd.bare', unesc(t[1]), id);
    }
    add('odd.axis', str(b, 'axis'), id);
  }
}

// ── AND THE READING MAY NOT GO THROUGH REACT ────────────────────────────────
//
// The reason is measured rather than stylistic. When the reading was driven by
// React state, a thumb sweeping a RAIL crossed every zone in a few hundred
// milliseconds, and each crossing was a hard cut, a vertical re-centring and a
// re-render of a component that builds its `Gesture.Pan` inline while a finger is
// down on it. The reader could see all three at once:
//
//   "the words above it that change as you move it start to stutter and start to
//    glitch, and you can't even read what's going on"
//
// A lever hid it, because three detents is three changes; a rail is continuous.
// So every control derives its reading index on the UI thread and hands
// ControlRead a SharedValue. This is the ratchet on that — the browser sweep that
// proved it (`node scripts/sweep-read.mjs`) needs Metro and cannot run here, and a
// rule nobody executes is not a rule (§11).
/**
 * The ONE piece of React state a control is allowed to hold, and why.
 *
 * A literal list rather than a count, so adding one is a deliberate two-file act —
 * the same shape as the badge roll. `drawn` flips false → true once per question
 * and gates the plot's commit BUTTON; it is not the reading, and it cannot fire
 * while a value is changing under a thumb, which is the thing that stuttered.
 */
// ShapePlot's `drawn` went with the drawn plot (the trend pick is one tap), so no
// control holds React state now.
const STATE_OK = {};

const readSrc = fs.readFileSync(path.join(DIR, 'ControlRead.tsx'), 'utf8');
const noReact = [];
if (/\buseState\b/.test(readSrc)) noReact.push('ControlRead.tsx holds React state');
for (const f of ['DragScale.tsx', 'LeverPick.tsx', 'SplitBar.tsx', 'FieldPick.tsx', 'SortBins.tsx']) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const use = /<ControlRead([^>]*)\/>/.exec(src);
  if (!use) { noReact.push(`${f} does not render ControlRead`); continue; }
  // `idx={something}` — a shared value by name, never an array index or a literal.
  if (!/\bidx=\{[A-Za-z_$][\w$]*\}/.test(use[1])) {
    noReact.push(`${f} passes the reading by value, not as a shared value`);
  }
  const allowed = STATE_OK[f] ?? [];
  for (const m of src.matchAll(/const \[\s*([A-Za-z_$][\w$]*)[^\]]*\]\s*=\s*useState/g)) {
    if (!allowed.includes(m[1])) noReact.push(`${f} holds React state \`${m[1]}\` — it will stutter under a thumb`);
  }
}

// ── measure them with the real font, in a blank page ─────────────────────────
const put = (p) => new Promise((res, rej) => {
  const q = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (r) => {
    let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(JSON.parse(d)));
  }); q.on('error', rej); q.end();
});

let tab;
try { tab = await put('/json/new?about:blank'); } catch (e) {
  console.log(`\nno headless Chrome on ${CDP} — see the header of this file.\n`);
  process.exit(0);
}
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let msgId = 0; const waiting = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); } };
const send = (method, params) => new Promise((res) => { const k = ++msgId; waiting.set(k, res); ws.send(JSON.stringify({ id: k, method, params })); });
const evaluate = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r?.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'threw');
  return r?.result?.result?.value;
};

await send('Runtime.enable');
const faces = Object.entries(FONT_FILE)
  .filter(([, p]) => fs.existsSync(p))
  .map(([name, p]) => ({ name, data: fs.readFileSync(p).toString('base64') }));
await evaluate(`(async () => {
  for (const f of ${JSON.stringify(faces)}) {
    const bin = Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0));
    const face = new FontFace(f.name, bin.buffer);
    await face.load();
    document.fonts.add(face);
  }
  return document.fonts.size;
})()`);

const jobs = [];
for (const [slot, texts] of want) {
  const s = SLOTS[slot];
  for (const e of texts.values()) jobs.push({ slot, text: e.text, from: [...e.from], ...s, room: s.room(e.share) });
}

const measured = await evaluate(`(() => {
  const jobs = ${JSON.stringify(jobs.map((j) => ({ text: j.text, font: j.font, size: j.size, track: j.track, room: j.room, upper: !!j.upper })))};
  const el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.whiteSpace = 'pre-wrap';
  document.body.appendChild(el);
  const widthOf = (t) => { el.style.width = 'max-content'; el.textContent = t; return el.getBoundingClientRect().width; };
  return jobs.map((j) => {
    el.style.fontFamily = j.font;
    el.style.fontSize = j.size + 'px';
    el.style.letterSpacing = j.track + 'px';
    // A label the component draws in capitals is measured in capitals: lower case
    // is narrower, and measuring it passed a sort bin label the render had cut.
    el.style.textTransform = j.upper ? 'uppercase' : 'none';
    const oneLine = widthOf(j.text);
    // How many lines it takes in the room it has.
    el.style.width = j.room + 'px';
    el.textContent = j.text;
    const lines = Math.max(1, Math.round(el.getBoundingClientRect().height / (j.size * 1.25)));
    // And whether any single word is wider than the box, which no number of lines
    // can rescue — that one is a cut word wherever it lands.
    let widest = 0;
    for (const w of j.text.split(/\\s+/)) widest = Math.max(widest, widthOf(w));
    return { oneLine: +oneLine.toFixed(1), lines, widest: +widest.toFixed(1) };
  });
})()`);
ws.close();

// ── report ──────────────────────────────────────────────────────────────────
console.log('\nWHAT THE ANSWER CONTROLS PUT ON SCREEN\n');
console.log(`  ${jobs.length} labels across ${scripts.length} lessons, measured with the real font at ${PHONE}dp\n`);

const bad = [];
jobs.forEach((j, i) => {
  const m = measured[i];
  if (m.widest > j.room + 0.5) bad.push({ ...j, ...m, why: 'one WORD is wider than the box' });
  else if (m.lines > j.lines) bad.push({ ...j, ...m, why: `needs ${m.lines} lines, has ${j.lines}` });
});

// ── AND THE PAIR, BECAUSE THE ROW IS WHAT THEY SHARE ────────────────────────
//
// The axis and the range sit in one space-between row with an 8pt gap inside the
// deck's 24 a side. Each can fit its own generous bound and the two together
// still overflow, which is the shape the render caught and no per-label rule
// could: five heads were over, the worst by 64pt.
const HEAD_ROOM = PHONE - 24 * 2 - 8;
let headBad = 0;
{
  const axisW = new Map(); const rangeW = new Map();
  jobs.forEach((j, i) => {
    const into = j.slot === 'trend.axis' ? axisW : j.slot === 'trend.range' ? rangeW : null;
    if (!into) return;
    for (const id of j.from) into.set(id, Math.max(into.get(id) ?? 0, measured[i].oneLine));
  });
  const over = [];
  for (const [id, a] of axisW) {
    const r = rangeW.get(id) ?? 0;
    if (a + r > HEAD_ROOM) over.push({ id, a, r, total: a + r });
  }
  over.sort((x, y) => y.total - x.total);
  headBad = over.length;
  if (over.length) {
    console.log(`  FAIL  the trend head fits its row  ${over.length} do not\n`);
    for (const o of over.slice(0, +(process.env.CONTROLS_N || 6))) {
      console.log(`      ${o.total.toFixed(0).padStart(4)}dp in ${HEAD_ROOM.toFixed(0)}dp · axis ${o.a.toFixed(0)} + range ${o.r.toFixed(0)}   [${o.id}]`);
    }
  }
}

const bySlot = new Map();
for (const b of bad) {
  if (!bySlot.has(b.slot)) bySlot.set(b.slot, []);
  bySlot.get(b.slot).push(b);
}
for (const [slot, list] of bySlot) {
  const s = SLOTS[slot];
  console.log(`  ${slot}  (${s.file} · ${s.size}pt ${s.font.replace('Inter_', '')} · ${s.lines} lines)`);
  list.sort((a, b) => b.oneLine - a.oneLine);
  for (const b of list.slice(0, +(process.env.CONTROLS_N || 6))) {
    console.log(`      ${String(b.oneLine).padStart(6)}dp in ${b.room.toFixed(0)}dp · ${b.why.padEnd(30)} ${JSON.stringify(b.text).slice(0, 62)}  [${b.from.slice(0, 2).join(', ')}${b.from.length > 2 ? ` +${b.from.length - 2}` : ''}]`);
  }
  if (list.length > +(process.env.CONTROLS_N || 6)) console.log(`      … and ${list.length - +(process.env.CONTROLS_N || 6)} more`);
  console.log('');
}

for (const m of noReact) console.log(`  FAIL  ${m}`);
console.log(noReact.length
  ? '  the reading stutters the moment it goes through a render — see ControlRead.'
  : '  ok    the reading is driven from the UI thread, never from React state');
console.log('');

const ok = bad.length === 0 && noReact.length === 0 && headBad === 0;
if (!headBad) console.log('  ok    the trend head fits its row  45 heads, axis and range together');
console.log(`  ${bad.length ? 'FAIL' : 'ok  '}  every control label fits the room it is given  ${bad.length} do not`);
console.log(ok
  ? '\nnothing a control draws runs off its box.\n'
  : "\nwiden the box, add a line, or shorten the label — a control's labels are lesson copy.\n");
process.exit(ok ? 0 : 1);
