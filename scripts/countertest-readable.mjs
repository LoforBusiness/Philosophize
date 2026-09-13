// COUNTER-TEST check:readable's STRIKE, in the two places it was retuned (S9, S13).
//
// A detector that has been retuned has not been counter-tested (S9), and STRIKE was
// retuned twice for the same readability pass:
//
//   · A WORD LAID OVER A WORD is measured by its INK now, not its box. aesthetics-36's
//     two print captions share two units of box and more than twenty units of paper,
//     and seven beats used to report one struck by the other.
//   · A TILTED SLAB is tested as a rotated rectangle now, not its bounding box.
//     logic-30's hammer head, drawn back over its tower, used to report the caption and
//     the top course struck while the slab itself stayed clear of both.
//
// Each case is swept three times: as it is (must be silent), with a real collision
// staged (must be struck), and restored byte for byte (silent again).
//
//   aesthetics-36   NOBODY CAME pulled 40 units left, so its letters run into THOUSANDS
//   logic-30        the hammer's pivot moved 30 units left, so the drawn-back head
//                   lies across TRUE PREMISES
//
// It edits a scene for a minute or two per case, so nothing else may be checking stamps
// while it runs: validate-cinematic and check:bible read the staged file as a stale
// measurement, which is correct of them. And it wants a QUIET machine.
//
// A STAGED DEFECT IS ONLY STAGED ONCE METRO SERVES IT, and a clock cannot say when that
// is. A fixed wait failed twice. At 12 seconds, with renders running beside it, the staged
// sweep measured the scene from before the edit and reported the collision clean. At 30
// seconds on a quiet machine, both staged sweeps read ONE beat and measured nothing, while
// the sweeps either side of them read every beat. Reproduced with the bundle fetched until
// it carried the staged line, which took seven seconds, the same sweep read all ten beats
// and struck six. So it waits on the bundle itself: the staged line must be in it before
// the staged sweep and gone from it before the restored one, and a bundle that never
// changes fails the test rather than handing it a reading.
//
// Needs the web bundle and a headless Chrome, as check-readable does (§21):
//   CDP_PORT=9391 WEB_PORT=8861 node scripts/countertest-readable.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawnSync } from 'node:child_process';

const CASES = [
  {
    id: 'aesthetics-aesthetics-36',
    scene: 'components/lesson/cinematic/aesthetics36Scene.tsx',
    from: '<Text style={[styles.printCap, { left: qx - 6 }]}>{PRINT_CAP[k]}</Text>',
    to: '<Text style={[styles.printCap, { left: qx - 6 - k * 40 }]}>{PRINT_CAP[k]}</Text>',
    /** The staged text as it survives Metro's transform, to find in the bundle. */
    mark: 'qx - 6 - k * 40',
    words: /THOUSANDS|NOBODY/,
    silent: 'two captions that share two units of BOX',
    struck: 'two captions whose LETTERS touch',
  },
  {
    id: 'logic-arguments-30',
    scene: 'components/lesson/cinematic/logic30Scene.tsx',
    from: 'const HAM_X = 312;',
    to: 'const HAM_X = 282;',
    mark: 'HAM_X = 282',
    words: /ONE ARGUMENT|TRUE PREMISES/,
    silent: 'a hammer drawn back CLEAR of the words',
    struck: 'a hammer drawn back ACROSS TRUE PREMISES',
  },
];

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ct-readable-'));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const BUNDLE = `http://localhost:${process.env.WEB_PORT || 8861}/index.bundle?platform=web&dev=true`;
/** How long Metro may take to serve an edit before the test calls it a failure. A cold bundle took 35s. */
const SERVE_S = 240;
const fetchBundle = () => new Promise((resolve) => {
  http.get(BUNDLE, (r) => {
    let body = '';
    r.setEncoding('utf8');
    r.on('data', (d) => { body += d; });
    r.on('end', () => resolve({ status: r.statusCode, body }));
  }).on('error', () => resolve({ status: 0, body: '' }));
});
/** Seconds until the bundle passes the test, or -1 if it never does. */
async function served(test) {
  const t0 = Date.now();
  while (Date.now() - t0 < SERVE_S * 1000) {
    const b = await fetchBundle();
    if (b.status === 200 && test(b.body)) return Math.round((Date.now() - t0) / 1000);
    await wait(3000);
  }
  return -1;
}

function sweep(c, tag) {
  const ids = path.join(TMP, `${c.id}.json`);
  fs.writeFileSync(ids, JSON.stringify([c.id]));
  const out = path.join(TMP, `${c.id}-${tag}.json`);
  const run = spawnSync(process.execPath, ['scripts/check-readable.mjs', ids, out], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, READ_ROUTE: process.env.READ_ROUTE || 'previewreadct', LANES: '1' },
  });
  // WHAT THE SWEEP SAID ABOUT ITS LESSON, so a sweep that reached nothing explains itself.
  // This run deletes its reports on the way out, and three one-beat sweeps in a row were
  // unexplained until the same run was reproduced by hand with its output kept.
  const said = String(run.stdout || '').split('\n').filter((l) => l.includes(c.id)).map((l) => l.trim()).pop() || `exit ${run.status}`;
  if (!fs.existsSync(out)) return { n: -1, stepped: 0, first: 'no report written', said };
  const rep = JSON.parse(fs.readFileSync(out, 'utf8'));
  const hits = rep.flatMap((l) => l.beats.flatMap((b) => b.hits.filter((h) => h.why.includes('STRIKE') && c.words.test(h.t))));
  return { n: hits.length, stepped: rep[0]?.stepped ?? 0, dead: !!rep[0]?.dead, first: hits[0] ? `"${hits[0].t}" struck by ${hits[0].struckBy}` : '', said };
}

console.log('\nCOUNTER-TEST · check:readable STRIKE, a word against a word and a word against a tilted slab\n');
let pass = true;
const line = (ok, what) => { if (!ok) pass = false; console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${what}`); };
// A sweep that did not reach the beats in question measured nothing (§21).
const reached = (r) => r.stepped >= 8 && !r.dead;

for (const c of CASES) {
  const clean = fs.readFileSync(c.scene, 'utf8');
  if (clean.split(c.from).length !== 2) {
    line(false, `${c.id}: the line to stage was not found exactly once in ${c.scene}; the counter-test is stale`);
    continue;
  }
  // The real sweep reads the scene as it is, so the bundle must not carry the staged line
  // either; this also warms a cold bundle before the first page asks for it.
  if ((await served((b) => !b.includes(c.mark))) < 0) {
    line(false, `${c.id}: the bundle carries the staged line before anything was staged, or never answered`);
    continue;
  }
  const real = sweep(c, 'real');
  let staged = null;
  let stagedIn = -1;
  try {
    fs.writeFileSync(c.scene, clean.split(c.from).join(c.to));
    if (fs.readFileSync(c.scene, 'utf8') === clean) throw new Error('the staging did not change the scene');
    stagedIn = await served((b) => b.includes(c.mark));
    if (stagedIn >= 0) staged = sweep(c, 'staged');
  } finally {
    fs.writeFileSync(c.scene, clean);
  }
  if (fs.readFileSync(c.scene, 'utf8') !== clean) {
    console.log(`  FAIL  ${c.scene} was NOT restored — put it back from git before anything else`);
    process.exit(1);
  }
  const restoredIn = await served((b) => !b.includes(c.mark));
  const restored = restoredIn >= 0 ? sweep(c, 'restored') : null;

  console.log(`  ${c.id}`);
  const why = (r) => (reached(r) ? '' : ` — check-readable: ${r.said}`);
  line(real.n === 0 && reached(real), `  ${c.silent} is silent (${real.n} strike, ${real.stepped + 1} beats)${why(real)}`);
  if (!staged) line(false, `  Metro never served the staged scene inside ${SERVE_S}s, so nothing was staged`);
  else line(staged.n > 0 && reached(staged), `  ${c.struck} is struck (${staged.n}, ${staged.stepped + 1} beats, served in ${stagedIn}s${staged.first ? `: ${staged.first}` : ''})${why(staged)}`);
  if (!restored) line(false, `  Metro never served the restored scene inside ${SERVE_S}s`);
  else line(restored.n === 0 && reached(restored), `  restored, silent again (${restored.n} strike, ${restored.stepped + 1} beats)${why(restored)}`);
}

console.log(pass ? '\nthe detector sees both collisions and neither near miss.\n' : '\nthe detector did not behave.\n');
fs.rmSync(TMP, { recursive: true, force: true });
process.exit(pass ? 0 : 1);
