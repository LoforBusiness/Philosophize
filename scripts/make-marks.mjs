// ─────────────────────────────────────────────────────────────────────────────
// A MARK ON THE THING THE VOICE IS NAMING, ON THE TAPS WHERE NOTHING ELSE CHANGES.
//
//   node scripts/make-marks.mjs          report what it would write
//   node scripts/make-marks.mjs --write  write data/lessonMarks.ts
//
// A reader: *"sometimes there will just be three tabs in one lesson where there is no
// animation above the words … for almost every single time the user clicks on the
// screen a change in animation … Imprint does this really well."* Counted, 1,056 of
// 2,461 taps leave the scene's art exactly as it was: J12 split packed beats into
// pieces and copied every channel onto each, so the picture would hold still while the
// words advanced.
//
// Imprint's own answer is a new hand-animated illustration on every card, from seven
// illustrators and eight animators, which does not transfer to 246 procedural scenes.
// The part that does is the principle — every card earns one visual event, and the
// event IS the explanation. On a tap where the picture holds, the one honest event is
// the one a teacher makes at a board: **mark the thing the sentence is about, at the
// moment it is said.** A pen circles THE RULE as the voice reaches "the rule".
//
// That is Mayer's signalling principle, which this repo already builds on, and it is
// not decoration: the mark points at something the narration names and the stage
// already draws. The PLAYER draws it (StageMark.tsx), for the reason Visitor and
// Thought are player-drawn — a per-scene prop is 244 edits inside `muststamp`.
//
// ── WHERE A MARK MAY GO, AND WHERE IT MAY NOT ───────────────────────────────
//
//   · only on a FROZEN tap: no scene channel changed since the beat before. A beat
//     whose picture is already moving has its event, and a mark on top is clutter,
//     which the same reader ruled out in the same message;
//   · never on a question, a quote or the summary; and on the beat BEFORE a question,
//     never on a label that names one of its options or its explanation's words the
//     prompt does not already say (group O). Refusing that whole beat cost 229 marks
//     for a rule that only has to keep the ANSWER from being pointed at;
//   · never on a beat that shows a thought bubble, which is already its event;
//   · only where the narration NAMES a label the stage draws on that beat, matched on
//     content words, so the mark is never about nothing (N9's rule, one layer over);
//   · never across a word, a figure, or the band's edge (D31, H59) — the style is
//     chosen from a rotation, and the first one that fits is the one used;
//   · and never the same style twice running inside a lesson.
//
// The geometry comes from mustBoxes.ts.json, which records every word each beat draws.
// `check:marks` re-derives all of it.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { LESSONS, beatsOf } from './lib/narration.mjs';
import { poseTrack } from './lib/posetrack.mjs';
import { STYLES, markBox, contentTokens, sameStem, frozenBeats, thoughtBeats, bandOf, questionOf, answerWords, labelNamed, cameraWindow, penPoints, targetsOf, markFits } from './lib/marks.mjs';
import { windowOf } from './lib/tourrule.mjs';
import { loadTs } from './lib/loadts.mjs';

const REPO = process.cwd();
const DIR = path.join(REPO, 'components/lesson/cinematic');
const OUT = path.join(REPO, 'data/lessonMarks.ts');
const WRITE = process.argv.includes('--write');
/** The two lessons older than CinematicPlayer draw no player overlay at all. */
const OWN_PLAYER = new Set(['logic-arguments-1', 'logic-arguments-2']);

const side = JSON.parse(fs.readFileSync(path.join(DIR, 'mustBoxes.ts.json'), 'utf8'));
const thoughts = thoughtBeats(fs.readFileSync(path.join(REPO, 'data/lessonThoughts.ts'), 'utf8'));
const { TOURS } = await loadTs('components/lesson/cinematic/tours.ts');
// The stroke StageMark will actually draw, seeded as it seeds it, so the path the rules
// test is the path the reader sees.
const { markPath, seedOf } = await loadTs('components/lesson/cinematic/markPath.ts');
// The painted boxes round each candidate, read out of the page by audit-marks.mjs. A
// beat is only marked once it has been audited against the lesson's current stamp.
const EDGES_FILE = path.join(REPO, 'scripts/lib/markEdges.json');
const audited = fs.existsSync(EDGES_FILE) ? JSON.parse(fs.readFileSync(EDGES_FILE, 'utf8')) : { stamps: {}, edges: {} };
const candidates = {};

const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };

const table = {};
const sample = [];
let frozenTotal = 0, marked = 0;
const refused = { graded: 0, prequestion: 0, thought: 0, nolabel: 0, nofit: 0, nobox: 0, toured: 0, offframe: 0, unaudited: 0, unseen: 0 };

for (const [id, file] of Object.entries(LESSONS)) {
  if (OWN_PLAYER.has(id)) continue;
  const stem = file.replace(/Script\.ts$/, '');
  const beats = beatsOf(file);
  const track = poseTrack(DIR, stem);
  const band = bandOf(path.join(DIR, `${stem}Scene.tsx`));
  const words = side.words[id];
  if (!words || !band) continue;
  const cameraOn = /\bcamera=\{/.test(fs.readFileSync(path.join(DIR, `${stem}Scene.tsx`), 'utf8'));
  const row = {};
  let n = 0;
  let lastStyle = null;
  for (const i of frozenBeats(beats, track?.field ?? 'p')) {
    frozenTotal += 1;
    const b = beats[i];
    if (questionOf(b) || b.quote || b.summary || !b.text) { refused.graded += 1; continue; }
    // The beat before a question may still be marked, but never on a label that names
    // one of that question's answers (group O).
    const answers = answerWords(questionOf(beats[i + 1]));
    const namesAnswer = (lab) => contentTokens(lab.t).some((t) => answers.some((a) => sameStem(a, t)));
    if (thoughts[id]?.has(i)) { refused.thought += 1; continue; }
    const win = cameraWindow({ id, i, beats, tours: TOURS, boxes: side.boxes, band, cameraOn, windowOf });
    if (win?.toured) { refused.toured += 1; continue; }
    const items = words[i];
    if (!items) { refused.nobox += 1; continue; }
    const shown = items.filter((it) => it.k === 'text' && it.t && it.b[2] > 4);
    const labels = shown.filter((it) => !namesAnswer(it));

    // The narration, token by token, exactly as NarrationText splits it — so `w` is the
    // index of the word the voice is saying when the mark draws.
    const said = (b.text.match(/\S+/g) || []).map((tok) => tok.toLowerCase().replace(/[^a-z0-9']/g, ''));
    let best = null;
    for (const lab of labels) {
      const want = contentTokens(lab.t);
      if (!want.length) continue;
      let hits = 0, first = Infinity, letters = 0;
      const mask = want.map((t) => {
        const k = said.findIndex((s) => sameStem(s, t));
        if (k >= 0) { hits += 1; first = Math.min(first, k); letters += t.length; }
        return k >= 0;
      });
      // A long label needs more than one of its words said, and a common word never
      // carries a match alone (labelNamed, in scripts/lib/marks.mjs).
      if (!labelNamed(want, mask)) continue;
      const score = hits / want.length + letters / 100;
      if (!best || score > best.score) best = { lab, score, first };
    }
    if (!best) {
      // Say which refusal it was: a label WAS named, but it names an answer.
      const hinted = answers.length && shown.some((lab) => namesAnswer(lab) && contentTokens(lab.t).some((t) => said.some((x) => sameStem(x, t))));
      if (hinted) refused.prequestion += 1; else refused.nolabel += 1;
      continue;
    }

    (candidates[id] ??= {})[i] = { b: best.lab.b, t: best.lab.t };
    const edges = audited.stamps[id] === side.stamps[id] ? audited.edges[id]?.[i] : null;
    if (!edges) { refused.unaudited += 1; continue; }
    // The label has to be ON SCREEN when the pen draws. The must-box probe records a
    // word at any opacity, so a label still to fade in was marked, and the pen ringed
    // empty paper. The audit reads the label's real opacity.
    const seen = audited.seen?.[id]?.[i];
    if (seen === undefined) { refused.unaudited += 1; continue; }
    if (seen !== null && seen < 0.5) { refused.unseen += 1; continue; }

    // The rotation, starting from somewhere derived from the lesson, and the first
    // style that fits wins — but never the style the previous mark used.
    const start = (hash(id) + n) % STYLES.length;
    // The word first, then the plate it is printed on (lib/marks.mjs, plateOf).
    let chosen = null;
    const why = [];
    for (const target of targetsOf(best.lab.b, edges)) {
      for (let s = 0; s < STYLES.length && !chosen; s += 1) {
        const style = STYLES[(start + s) % STYLES.length];
        if (style === lastStyle) continue;
        const box = markBox(style, target).map((v) => Math.round(v * 10) / 10);
        const pen = penPoints(markPath(style, box[2], box[3], seedOf(`${id}:${i}`)), box);
        const bad = markFits({ style, box, target, label: best.lab.b, items, band, win, rects: edges, pen });
        if (!bad) chosen = { style, box, on: target === best.lab.b ? null : target };
        else why.push(`${style}${target === best.lab.b ? '' : '@plate'}: ${bad}`);
      }
      if (chosen) break;
    }
    // MARKS_WHY=1 prints what each style was refused for, on the beats that got none.
    if (!chosen && process.env.MARKS_WHY) console.log(`  ${id} ${i} "${best.lab.t}"\n      ${why.join('\n      ')}`);
    if (!chosen) { refused.nofit += 1; continue; }
    row[i] = { w: best.first, style: chosen.style, box: chosen.box, label: best.lab.t, ...(chosen.on ? { on: chosen.on } : {}) };
    if (process.env.MARKS_SAMPLE) sample.push(`${id} ${i} [${chosen.style}] "${best.lab.t}"  ←  ${b.text.split(/\s+/).map((t, k) => (k === best.first ? `>>${t}<<` : t)).join(' ')}`);
    lastStyle = chosen.style;
    n += 1;
    marked += 1;
  }
  if (Object.keys(row).length) table[id] = row;
}

const lessons = Object.keys(table).length;
console.log(`\n${frozenTotal} frozen taps (the scene's art unchanged since the beat before)\n`);
console.log(`  marked                                  ${marked}   in ${lessons} lessons`);
console.log(`  a question, quote or summary itself     ${refused.graded}`);
console.log(`  would point at a coming answer (O)      ${refused.prequestion}`);
console.log(`  already carrying a thought bubble       ${refused.thought}`);
console.log(`  the narration names no stage label      ${refused.nolabel}`);
console.log(`  no style fits clear of words and edges  ${refused.nofit}`);
console.log(`  no measured boxes for the beat          ${refused.nobox}`);
console.log(`  the label is not on screen yet          ${refused.unseen}`);
console.log(`  the camera travels on the beat          ${refused.toured}`);
console.log(`  not yet audited in a browser            ${refused.unaudited}   (node scripts/audit-marks.mjs)`);
fs.writeFileSync(path.join(REPO, 'scripts', '.mark-candidates.json'), `${JSON.stringify(candidates)}\n`);
const used = {};
for (const row of Object.values(table)) for (const m of Object.values(row)) used[m.style] = (used[m.style] ?? 0) + 1;
console.log(`\n  styles: ${Object.entries(used).map(([k, v]) => `${k} ${v}`).join(' · ')}`);

// MARKS_SAMPLE=N prints N pairings spread across the corpus, with the word the pen
// lands on bracketed. A matcher is checked by READING what it pairs, not by its count.
if (process.env.MARKS_SAMPLE) {
  const k = Math.max(1, Math.floor(sample.length / Number(process.env.MARKS_SAMPLE)));
  for (let j = 0; j < sample.length; j += k) console.log(`  ${sample[j]}`);
}

if (!WRITE) { console.log('\n(dry run — pass --write to write data/lessonMarks.ts)'); process.exit(0); }

const body = Object.entries(table).sort(([a], [b]) => a.localeCompare(b)).map(([id, row]) => {
  const beatsTxt = Object.entries(row).map(([i, m]) =>
    `    ${i}: { w: ${m.w}, style: '${m.style}', box: [${m.box.join(', ')}], label: ${JSON.stringify(m.label)}${m.on ? `, on: [${m.on.join(', ')}]` : ''} },`).join('\n');
  return `  '${id}': {\n${beatsTxt}\n  },`;
}).join('\n');

fs.writeFileSync(OUT, `// GENERATED by scripts/make-marks.mjs — do not edit by hand.
//
// A hand-drawn mark on the label the narration is naming, drawn as the voice reaches
// the word, on the taps where the scene's art does not change (StageMark.tsx). See the
// generator's header for where a mark may and may not go; \`check:marks\` holds it.

export type MarkStyle = 'ring' | 'underline' | 'bracket' | 'box' | 'arrowL' | 'arrowR';

export interface StageMarkSpot {
  /** Index of the narration word, split on whitespace, the voice says as the mark draws. */
  w: number;
  style: MarkStyle;
  /** Where the mark is drawn, in stage units: [x, y, width, height]. */
  box: readonly [number, number, number, number];
  /** The stage label it marks, as measured. */
  label: string;
  /** The plate the label is printed on, when the mark is drawn round that instead. */
  on?: readonly [number, number, number, number];
}

export const MARKS: Record<string, Record<number, StageMarkSpot>> = {
${body}
};
`);
console.log(`\nwrote ${path.relative(REPO, OUT)} — ${marked} marks in ${lessons} lessons`);
