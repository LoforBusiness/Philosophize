// ─────────────────────────────────────────────────────────────────────────────
// THE PEN MARKS, RE-DERIVED: EVERY ONE IS ON A STILL BEAT, ON A LABEL THE VOICE NAMES,
// CLEAR OF EVERY WORD, INSIDE THE SHOT, AND NEVER A HINT.
//
//   npm run check:marks
//
// data/lessonMarks.ts is written by scripts/make-marks.mjs, and both read the rules in
// scripts/lib/marks.mjs. This does not trust the table: it re-derives every row from the
// scripts, the measured boxes, the thought table and the tours, so a table left behind
// by a rewritten beat or a re-measured scene goes red rather than drawing a ring round
// somewhere a label used to be.
//
// Offline, no browser. Counter-tested by `node scripts/countertest-marks.mjs`.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { LESSONS, beatsOf } from './lib/narration.mjs';
import { poseTrack } from './lib/posetrack.mjs';
import {
  STYLES, markBox, contentTokens, sameStem, frozenBeats, thoughtBeats, bandOf, questionOf,
  answerWords, labelNamed, cameraWindow, penPoints, plateOf, markFits,
} from './lib/marks.mjs';
import { windowOf } from './lib/tourrule.mjs';
import { loadTs } from './lib/loadts.mjs';

const REPO = process.cwd();
const DIR = path.join(REPO, 'components/lesson/cinematic');
const marksFile = process.env.MARKS_FILE ? path.resolve(REPO, process.env.MARKS_FILE) : path.join(REPO, 'data/lessonMarks.ts');
const OWN_PLAYER = new Set(['logic-arguments-1', 'logic-arguments-2']);
/**
 * A ratchet on the count, so a re-measure that quietly empties the table is loud. It
 * was 161 before the browser audit and 110 after it: the rest drew along a plate
 * border, through a tick box or across the corners of their own word, and nothing
 * offline could see any of it until the pen path itself was tested.
 *
 * 91 after the same day's re-measure of 56 lessons (`MARKS_WHY=1 node
 * scripts/make-marks.mjs` lists each refusal): the openers now draw more on their
 * stages, so more pens met a painted edge, and the regenerated tours hold a pushed
 * shot on more still beats, so more marks fell outside the frame. No tap was left
 * still by it — check:idle counted none either way.
 *
 * 69 once the audit read each label's real opacity (AE7): 35 candidates were labels
 * not yet on screen, so a quarter of the 91 had been ringing empty paper.
 *
 * 3 once every still tap had its own scene event (group AH, AH14). The pen was the
 * answer to a tap whose art holds, and there are none left outside a question, a quote
 * or a summary: `check:still` holds that at zero, and one event per tap (AH2) keeps
 * the pen off a beat that now draws its own. This is the floor moving because the
 * thing it counted was replaced, not because a table was lost — the candidate report
 * says so: 224 frozen taps, 190 of them a question, quote or summary.
 *
 * 2 on 2026-09-24, and again not a lost table. 145 must-box tables had carried a
 * duplicated row, so every beat after a question was measured as the beat before
 * it; re-measured, `epistemology-knowledge-39` beat 5 turns out to have the figure
 * where its MAJORITY underline was drawn. A mark on the stickman is the defect this
 * file exists to refuse, so it goes rather than the rule bending round it.
 */
const MARKS_FLOOR = 2;

let fails = 0;
const ok = (m, d = '') => console.log(`  ok    ${m}${d ? `  ${d}` : ''}`);
const bad = (m, list) => {
  fails += 1;
  console.log(`  FAIL  ${m}: ${list.length}`);
  for (const x of list.slice(0, 12)) console.log(`          ${x}`);
  if (list.length > 12) console.log(`          and ${list.length - 12} more`);
};

const { MARKS } = await loadTs(marksFile);
const side = JSON.parse(fs.readFileSync(path.join(DIR, 'mustBoxes.ts.json'), 'utf8'));
const thoughts = thoughtBeats(fs.readFileSync(path.join(REPO, 'data/lessonThoughts.ts'), 'utf8'));
const { TOURS } = await loadTs('components/lesson/cinematic/tours.ts');
const { markPath, MARK_INSET, seedOf } = await loadTs('components/lesson/cinematic/markPath.ts');
const EDGES_FILE = process.env.MARK_EDGES ? path.resolve(REPO, process.env.MARK_EDGES) : path.join(REPO, 'scripts/lib/markEdges.json');
const audited = fs.existsSync(EDGES_FILE) ? JSON.parse(fs.readFileSync(EDGES_FILE, 'utf8')) : { stamps: {}, edges: {} };

const where = [], still = [], named = [], hint = [], clear = [], edge = [], shot = [], stroke = [], repeat = [], unseen = [];
let count = 0;

for (const [id, row] of Object.entries(MARKS)) {
  const file = LESSONS[id];
  if (!file || OWN_PLAYER.has(id)) { where.push(`${id}: not a lesson the shared player draws`); continue; }
  const stem = file.replace(/Script\.ts$/, '');
  const scenePath = path.join(DIR, `${stem}Scene.tsx`);
  const beats = beatsOf(file);
  const frozen = new Set(frozenBeats(beats, poseTrack(DIR, stem)?.field ?? 'p'));
  const band = bandOf(scenePath);
  const cameraOn = /\bcamera=\{/.test(fs.readFileSync(scenePath, 'utf8'));
  let prev = null;
  for (const [key, m] of Object.entries(row).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    count += 1;
    const i = Number(key);
    const tag = `${id} beat ${i} "${m.label}"`;
    const b = beats[i];
    if (!b || !STYLES.includes(m.style)) { where.push(`${tag}: no such beat, or no such style ${m.style}`); continue; }

    // 1. A still beat that is not a question, a quote or the summary, with no bubble on it.
    if (!frozen.has(i)) still.push(`${tag}: the scene's art changes on this beat, so it has its event already`);
    if (questionOf(b) || b.quote || b.summary || !b.text) still.push(`${tag}: a question, quote or summary`);
    if (thoughts[id]?.has(i)) still.push(`${tag}: the beat already shows a thought bubble`);

    // 2. The label is on the stage, and the voice names it, at the word the mark waits for.
    const items = side.words[id]?.[i] || [];
    const lab = items.find((it) => it.k === 'text' && it.t === m.label);
    const said = (b.text.match(/\S+/g) || []).map((t) => t.toLowerCase().replace(/[^a-z0-9']/g, ''));
    if (!lab) { named.push(`${tag}: the stage no longer draws this label on this beat`); continue; }
    const want = contentTokens(lab.t);
    const mask = want.map((t) => said.some((s) => sameStem(s, t)));
    if (!labelNamed(want, mask)) named.push(`${tag}: the narration does not name it`);
    if (!want.some((t) => sameStem(said[m.w], t))) named.push(`${tag}: word ${m.w} ("${said[m.w]}") is not one of the label's words`);

    // 3. Group O: never a label that names the coming question's answer.
    const answers = answerWords(questionOf(beats[i + 1]));
    if (want.some((t) => answers.some((a) => sameStem(a, t)))) hint.push(`${tag}: points at a word the next question's options or explanation use`);

    // 4. What it is drawn round — the word, or the plate the audit found under it — and
    // the box the table says, re-derived from that.
    const rects = audited.stamps[id] === side.stamps[id] ? audited.edges[id]?.[i] : null;
    if (!rects) { edge.push(`${tag}: not audited against this lesson's current must-box stamp — node scripts/audit-marks.mjs`); continue; }
    // 4a. The label is on screen: the must-box probe records a word at any opacity.
    const seen = audited.seen?.[id]?.[i];
    if (seen === undefined) unseen.push(`${tag}: its label's visibility was never read — node scripts/audit-marks.mjs`);
    else if (seen !== null && seen < 0.5) unseen.push(`${tag}: its label is at opacity ${seen} when the pen draws, so the mark rings empty paper`);
    const plate = plateOf(lab.b, rects);
    const target = m.on ? plate : lab.b;
    if (m.on && (!plate || plate.some((v, k) => Math.abs(v - m.on[k]) > 0.051))) { clear.push(`${tag}: the plate it is drawn round is no longer where the table says`); continue; }
    const box = markBox(m.style, target).map((v) => Math.round(v * 10) / 10);
    if (box.some((v, k) => Math.abs(v - m.box[k]) > 0.051)) clear.push(`${tag}: the table's box is not where ${m.style} sits on the ${m.on ? 'plate' : 'label'} now`);

    // 4b. The one fit test make-marks chose by: the band and the held shot, no word or
    // figure under the mark, and the drawn pen — seeded as StageMark seeds it — off its
    // target, off every word and off every border the page paints.
    const win = cameraWindow({ id, i, beats, tours: TOURS, boxes: side.boxes, band, cameraOn, windowOf });
    if (win?.toured) { shot.push(`${tag}: the camera travels on this beat`); continue; }
    const pen = penPoints(markPath(m.style, m.box[2], m.box[3], seedOf(`${id}:${i}`)), m.box);
    const why = band ? markFits({ style: m.style, box: m.box, target, label: lab.b, items, band, win, rects, pen }) : 'no band';
    if (why === 'outside the shot') shot.push(`${tag}: outside the shot the camera holds on this beat`);
    else if (why && why.startsWith('the pen')) edge.push(`${tag}: ${why}`);
    else if (why) clear.push(`${tag}: ${why}`);

    // 6. The pen stays inside its own box.
    const s = markPath(m.style, m.box[2], m.box[3], seedOf(`${id}:${i}`));
    const out = s.pts.filter(([x, y]) => x < MARK_INSET - 0.01 || y < MARK_INSET - 0.01 || x > m.box[2] - MARK_INSET + 0.01 || y > m.box[3] - MARK_INSET + 0.01);
    if (out.length || !(s.len > 4)) stroke.push(`${tag}: the ${m.style} stroke leaves its box at ${out.length} point(s), or has no length`);

    // 7. Never the same style twice running.
    if (prev === m.style) repeat.push(`${tag}: a second ${m.style} in a row`);
    prev = m.style;
  }
}

console.log('\nTHE PEN MARKS\n');
const rule = (list, title, fine) => (list.length ? bad(title, list) : ok(title, fine));
rule(where, 'every mark belongs to a lesson the shared player draws', `${Object.keys(MARKS).length} lessons`);
rule(still, 'every mark is on a still beat that has no other event', 'not a question, a quote, the summary, or a beat with a bubble');
rule(named, 'every mark is on a label the voice names, at that word', 'no common word carries a match alone');
rule(hint, 'no mark points at the coming question\'s answer (group O)', '');
rule(clear, 'every mark is clear of every word, figure and edge', '');
rule(edge, 'every pen stroke is off its word and off every border the page paints', 'plates, tick boxes and rules, as audited in the browser');
rule(unseen, 'every marked label is visible when the pen draws', 'its opacity as read in the browser, ancestors included');
rule(shot, 'every mark is inside the shot the camera holds', 'none on a beat where the camera travels');
rule(stroke, 'every pen stroke stays inside its box', '');
rule(repeat, 'no lesson draws the same style twice running', '');
if (count < MARKS_FLOOR) bad(`only ${count} marks, under the floor of ${MARKS_FLOOR}`, ['a re-measure or a table rebuilt from nothing: run node scripts/make-marks.mjs --write and read what it refused']);
else ok(`${count} marks across the corpus`, `floor ${MARKS_FLOOR}`);

// 8. The stroke colour reads on every ground a mark can sit on.
{
  const tone = await loadTs('components/shared/tone.ts');
  // stageTones.ts imports one zero-import module, so it is transpiled with that one
  // module handed to it rather than re-implemented here.
  const design = await loadTs('constants/design.ts');
  const tsc = (await import('typescript')).default;
  const js = tsc.transpileModule(fs.readFileSync('components/lesson/cinematic/stageTones.ts', 'utf8'), {
    compilerOptions: { module: tsc.ModuleKind.CommonJS, target: tsc.ScriptTarget.ES2020 },
  }).outputText;
  const st = {};
  new Function('exports', 'require', js)(st, (m) => {
    if (m === '@/constants/design') return design;
    throw new Error(`stageTones.ts imports ${m}, which check-marks cannot hand it`);
  });
  const { stageTone } = st;
  const lum = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((a, c, k) => a + c * [0.2126, 0.7152, 0.0722][k], 0);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const grounds = [['paper', tone.PAPER]];
  for (const br of ['metaphysics', 'epistemology', 'logic', 'ethics', 'aesthetics', 'political-philosophy']) {
    const t = stageTone(br);
    grounds.push([`${br} STONE`, t.STONE], [`${br} RULE`, t.RULE]);
  }
  // The pen rides a PAPER halo (StageMark.tsx), so on a dark plate it is read against
  // paper too; without the halo EMBER_INK on INK is barely a mark at all.
  const mark = fs.readFileSync(path.join(DIR, 'StageMark.tsx'), 'utf8');
  const haloed = /stroke=\{PAPER\}[\s\S]{0,160}strokeWidth=\{STROKE \+ HALO\}/.test(mark);
  if (!haloed) bad('the pen is drawn over a paper halo', ['StageMark.tsx draws no PAPER stroke of width STROKE + HALO under the pen']);
  else ok('the pen is drawn over a paper halo', 'so a mark reads on a dark plate as well as on paper');
  const low = grounds.map(([n, g]) => [n, ratio(tone.EMBER_INK, g)]).filter(([, r]) => r < 3);
  const worst = Math.min(...grounds.map(([, g]) => ratio(tone.EMBER_INK, g)));
  if (low.length) bad('the pen reads at 3:1 on every ground', low.map(([n, r]) => `${n}: ${r.toFixed(2)}:1`));
  else ok('the pen reads at 3:1 on every ground a mark can sit on', `worst ${worst.toFixed(2)}:1 across paper and the six hued STONE and RULE`);
}

console.log(fails ? `\n${fails} failing.\n` : '\nevery mark points at what the voice is naming, and at nothing else.\n');
process.exit(fails ? 1 : 0);
