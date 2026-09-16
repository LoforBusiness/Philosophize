// U3 FOR THE PEN MARKS: PUT EACH DEFECT BACK AND WATCH check:marks GO RED, AND RUN THE
// TABLE AS SHIPPED AND WATCH IT STAY SILENT.
//
//   node scripts/countertest-marks.mjs
//
// Each stage copies data/lessonMarks.ts, damages ONE row, and runs the real check on the
// copy through MARKS_FILE. A red run only counts if the rule the damage should break is
// the one that failed, and every stage asserts its damage changed the text, because a
// mutation that matched nothing scores as silent (countertest-stamp).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { markBox, STYLES } from './lib/marks.mjs';

const REPO = process.cwd();
const SRC = fs.readFileSync(path.join(REPO, 'data/lessonMarks.ts'), 'utf8').replace(/\r\n/g, '\n');
const side = JSON.parse(fs.readFileSync(path.join(REPO, 'components/lesson/cinematic/mustBoxes.ts.json'), 'utf8'));
const tmp = path.join(os.tmpdir(), 'philosophize-marks-ct.ts');

const ROW = /^ {4}(\d+): \{ w: (\d+), style: '(\w+)', box: \[([^\]]+)\], label: (".*") \},$/;

/** The table as lessons of rows, each row keeping its own source line. */
function rows() {
  const out = [];
  let id = null;
  for (const line of SRC.split('\n')) {
    const open = line.match(/^ {2}'([a-z0-9-]+)': \{$/);
    if (open) { id = open[1]; continue; }
    const m = line.match(ROW);
    if (m && id) out.push({ id, line, beat: Number(m[1]), w: Number(m[2]), style: m[3], label: JSON.parse(m[5]) });
  }
  return out;
}
const ALL = rows();
const lineOf = (r, { beat = r.beat, w = r.w, style = r.style, box }) => (
  `    ${beat}: { w: ${w}, style: '${style}', box: [${box.join(', ')}], label: ${JSON.stringify(r.label)} },`
);
const boxOf = (r) => r.line.match(ROW)[4].split(',').map(Number);

function run(text) {
  fs.writeFileSync(tmp, text);
  try {
    const out = execFileSync(process.execPath, ['scripts/check-marks.mjs'], {
      cwd: REPO, encoding: 'utf8', env: { ...process.env, MARKS_FILE: tmp },
    });
    return { red: false, out };
  } catch (e) {
    return { red: true, out: `${e.stdout || ''}${e.stderr || ''}` };
  }
}

let failed = 0;
function stage(name, row, replacement, rule) {
  const text = row ? SRC.replace(row.line, replacement) : SRC;
  if (row && text === SRC) { failed += 1; console.log(`  FAIL  ${name}: the damage changed nothing`); return; }
  const got = run(text);
  const fails = [...got.out.matchAll(/^ {2}FAIL {2}(.+): \d+$/gm)].map((m) => m[1]);
  const ok = rule ? got.red && fails.some((f) => f.startsWith(rule)) : !got.red;
  if (!ok) failed += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : `\n          wanted ${rule ? `"${rule}"` : 'silence'}, got ${fails.length ? fails.join(' · ') : 'silence'}`}`);
}

console.log('\nCOUNTER-TESTING check:marks\n');
stage('the table as shipped stays silent', null, null, null);

// A mark moved onto the opening beat, which always has its own event (the scene arriving).
{
  const r = ALL.find((x) => x.beat > 0);
  stage('a mark on a beat whose scene changes', r, lineOf(r, { beat: 0, box: boxOf(r) }), 'every mark is on a still beat');
}

// The voice word pointed at a word the label does not contain.
{
  const r = ALL.find((x) => x.w > 0);
  stage('a mark timed to a word that is not the label', r, lineOf(r, { w: 0, box: boxOf(r) }), 'every mark is on a label the voice names');
}

// A label the stage no longer draws on that beat.
{
  const r = ALL[3];
  const moved = r.line.replace(/label: ".*"/, 'label: "A LABEL NOBODY DRAWS"');
  stage('a mark on a label that has gone', r, moved, 'every mark is on a label the voice names');
}

// The table's box left behind by a re-measure that moved the label.
{
  const r = ALL[5];
  const b = boxOf(r);
  stage('a box the label has moved out of', r, lineOf(r, { box: [b[0] + 6, b[1], b[2], b[3]] }), 'every mark is clear of every word');
}

// Two of one style running, with the second box re-derived so only the rotation is wrong.
{
  let pair = null;
  for (let k = 1; k < ALL.length && !pair; k += 1) {
    const [a, b] = [ALL[k - 1], ALL[k]];
    if (a.id !== b.id || a.style === b.style) continue;
    const lab = (side.words[b.id]?.[b.beat] || []).find((it) => it.k === 'text' && it.t === b.label);
    if (lab) pair = { a, b, lab };
  }
  const box = markBox(pair.a.style, pair.lab.b).map((v) => Math.round(v * 10) / 10);
  stage('the same style twice running', pair.b, lineOf(pair.b, { style: pair.a.style, box }), 'no lesson draws the same style twice running');
}

// A style the component has no drawing for.
{
  const r = ALL[8];
  if (STYLES.includes('squiggle')) throw new Error('pick another unknown style');
  stage('a style the pen cannot draw', r, lineOf(r, { style: 'squiggle', box: boxOf(r) }), 'every mark belongs to a lesson');
}

// A plate border running through a mark, and a lesson re-measured since its audit.
{
  const edgesSrc = fs.readFileSync(path.join(REPO, 'scripts/lib/markEdges.json'), 'utf8');
  const tmpEdges = path.join(os.tmpdir(), 'philosophize-mark-edges-ct.json');
  const runEdges = (edges, name, rule) => {
    fs.writeFileSync(tmpEdges, JSON.stringify(edges));
    fs.writeFileSync(tmp, SRC);
    let out = '', red = false;
    try {
      out = execFileSync(process.execPath, ['scripts/check-marks.mjs'], { cwd: REPO, encoding: 'utf8', env: { ...process.env, MARKS_FILE: tmp, MARK_EDGES: tmpEdges } });
    } catch (e) { red = true; out = `${e.stdout || ''}${e.stderr || ''}`; }
    const fails = [...out.matchAll(/^ {2}FAIL {2}(.+): \d+$/gm)].map((m) => m[1]);
    const ok = red && fails.some((f) => f.startsWith(rule));
    if (!ok) failed += 1;
    console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${ok ? '' : `\n          wanted "${rule}", got ${fails.join(' · ') || 'silence'}`}`);
  };
  const r = ALL[2];
  const b = boxOf(r);
  const crossed = JSON.parse(edgesSrc);
  // A rule across the middle of the mark: in the box, not containing it, not inside it.
  crossed.edges[r.id][r.beat] = [...crossed.edges[r.id][r.beat], [b[0] - 20, b[1] + b[3] / 2, b[2] + 40, 2]];
  runEdges(crossed, 'a painted rule through a mark', 'every pen stroke is off its word');
  const stale = JSON.parse(edgesSrc);
  stale.stamps[r.id] = '000000000000';
  runEdges(stale, 'a lesson re-measured since it was audited', 'every pen stroke is off its word');
  // The label not on screen when the pen draws (metaphysics-being-10's phantom).
  const hidden = JSON.parse(edgesSrc);
  hidden.seen[r.id][r.beat] = 0;
  runEdges(hidden, 'a mark on a label still at opacity 0', 'every marked label is visible');
  fs.rmSync(tmpEdges, { force: true });
}

// A table rebuilt from nothing.
{
  const emptied = SRC.replace(/export const MARKS[\s\S]*$/, 'export const MARKS = {};\n');
  const got = run(emptied);
  const ok = got.red && /FAIL {2}only 0 marks/.test(got.out);
  if (!ok) failed += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  an emptied table trips the floor`);
}

fs.rmSync(tmp, { force: true });
console.log(failed ? `\n${failed} stage(s) did not behave.\n` : '\nevery defect goes red on its own rule, and the shipped table is silent.\n');
process.exit(failed ? 1 : 0);
