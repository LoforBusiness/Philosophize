// TAP BACK, TAP FORWARD, THE Aa BUTTON AND THE GUIDE — held in every lesson.
//
//   npm run check:guide
//
// The reader asked for three things at once (18 Sep 2026): tap the right of the
// screen to go forward and the left to go back, replaying that beat's narration and
// animation; a way to show every word at once while the voice keeps reading; and a
// see-through guide at the start of every lesson explaining both, with "Don't show
// again" and a switch in Settings to bring it back. They are four small files and a
// few lines in each of the three players, and every one of those lines is the kind
// that goes missing when the next player is written or the next harness is added.
//
// Offline and fast. What it holds:
//
//   1. THE TAP RULE (tapNav.ts), fed the exact events that would break it — above
//      all a harness's synthetic click(), which has no position and reads as x = 0,
//      the left edge. Read literally that is "back", and every browser sweep in
//      scripts/ would walk lessons backwards while reporting that it measured them.
//   2. EVERY PLAYER routes the body's press through tapSide, never disables the body
//      while a question is open (back must still work there), goes back, keeps its
//      answers by beat, holds its clock and its voice behind the guide, draws the
//      Aa button and the edge glow, and offers Next/Previous to a screen reader.
//   3. THE ROUTE mounts the guide around the lesson, and NO harness does: a guide in
//      front of a sweep holds its beat clock at the first frame and it measures
//      nothing. That is why the guide lives in the route and not in a player.
//   4. THE SETTINGS exist, default on, have their readers outside Settings (§22),
//      and Settings › Lessons carries both switches.
//   5. THE GUIDE keeps its way out, its "Don't show again", its screen-reader modal
//      and Reduce Motion, and never makes its tap-anywhere layer a button — on the
//      web that nests "Got it" inside a <button>, which is invalid HTML and which the
//      first render reported.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const CIN = 'components/lesson/cinematic';
const read = (p) => fs.readFileSync(path.join(REPO, p), 'utf8');
const failures = [];
const oks = [];
const ok = (m) => oks.push(m);
const bad = (m, detail = []) => failures.push([m, detail]);
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

// ── 1. THE TAP RULE ─────────────────────────────────────────────────────────
{
  const { tapSide, BACK_SHARE } = await import(pathToFileURL(path.join(REPO, CIN, 'tapNav.ts')).href);
  const W = 390;
  const cases = [
    ['a harness click(): no position at all', {}, W, 'forward'],
    ['a harness click(): pageX 0', { pageX: 0, clientX: 0 }, W, 'forward'],
    ['no event', null, W, 'forward'],
    ['a position that is not a number', { pageX: NaN }, W, 'forward'],
    ['no width to divide', { pageX: 40 }, 0, 'forward'],
    ['the left edge', { pageX: 4 }, W, 'back'],
    ['just inside the back third', { pageX: W * BACK_SHARE - 1 }, W, 'back'],
    ['just past the back third', { pageX: W * BACK_SHARE + 1 }, W, 'forward'],
    ['the middle', { pageX: W / 2 }, W, 'forward'],
    ['a web click read from clientX', { clientX: 60 }, W, 'back'],
    ['a device press read from locationX', { locationX: 300 }, W, 'forward'],
  ];
  const wrong = cases.filter(([, e, w, want]) => tapSide(e, w) !== want)
    .map(([name, e, w, want]) => `${name}: got ${tapSide(e, w)}, want ${want}`);
  if (Math.abs(BACK_SHARE - 1 / 3) > 1e-9) wrong.push(`BACK_SHARE is ${BACK_SHARE}; the owner chose the left THIRD`);
  if (wrong.length) bad('the tap rule sends a press the wrong way', wrong);
  else ok(`the tap rule: left third back, the rest forward, a click with no position forward  ${cases.length} cases`);
}

// ── 2. EVERY PLAYER ──────────────────────────────────────────────────────────
const PLAYERS = ['CinematicPlayer', 'ArgumentFightLesson', 'PremisesBuilderLesson'];
const NEEDS = [
  ['routes the body press through tapSide', (s) => /onPress=\{onBody\}/.test(s) && /tapSide\(/.test(s)],
  ['never disables the body while a question is open', (s) => !/<Pressable\s+style=\{styles\.body\}[^>]*disabled=/.test(s)],
  ['goes back a beat', (s) => /const back = useCallback/.test(s) && /goTo\(i - 1\)/.test(s)],
  ['keeps each answer by beat', (s) => /kept\.current\[i\] =/.test(s) && /kept\.current\[k\]/.test(s)],
  ['holds its beat clock behind the guide', (s) => /if \(!GUIDE_HOLD\.value\)/.test(s)],
  ['holds its voice behind the guide', (s) => /!guideOpen && line/.test(s)],
  ['draws the Aa button', (s) => /<WordsToggle \/>/.test(s)],
  ['draws the edge glow', (s) => /<EdgeFlash /.test(s)],
  ['offers Next and Previous to a screen reader', (s) => /accessibilityActions=\{\[\{ name: 'next'/.test(s) && /'previous'/.test(s)],
  ['lifts its header above the body', (s) => /styles\.header, \{ zIndex: 5 \}/.test(s)],
];
for (const name of PLAYERS) {
  const src = strip(read(`${CIN}/${name}.tsx`));
  const missing = NEEDS.filter(([, test]) => !test(src)).map(([what]) => what);
  // Every hook above `if (done) return null` (CLAUDE.md §17 rule 1).
  const done = src.indexOf('if (done) return null');
  for (const hook of ['const onBody = useCallback', 'const back = useCallback', 'useEdgeFlash()', 'useGuideStore(']) {
    const at = src.indexOf(hook);
    if (at < 0 || (done >= 0 && at > done)) missing.push(`${hook} must sit above \`if (done) return null\``);
  }
  if (missing.length) bad(`${name} is missing part of back/forward, the Aa button or the guide`, missing);
  else ok(`${name}: taps both ways, answers kept, held behind the guide, Aa button, edge glow  ${NEEDS.length} rules`);
}

// ── 3. THE ROUTE, AND NO HARNESS ─────────────────────────────────────────────
{
  const route = strip(read('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx'));
  if (!/<LessonGuideHost>\s*<StartedRunner/.test(route)) bad('the lesson route does not mount the guide around a cinematic lesson');
  else ok('the lesson route mounts the guide around every cinematic lesson');
  const harness = [];
  for (const dir of ['scripts', 'scripts/lib']) {
    for (const f of fs.readdirSync(path.join(REPO, dir))) {
      // This file and its counter-test name the guide in order to look for it.
      if (!/\.(mjs|txt)$/.test(f) || f === 'check-guide.mjs' || f === 'countertest-guide.mjs') continue;
      if (/LessonGuideHost|<LessonGuide\b/.test(read(`${dir}/${f}`))) harness.push(`${dir}/${f}`);
    }
  }
  if (harness.length) bad('a harness route mounts the lesson guide — it would hold its beat clock and measure nothing', harness);
  else ok('no harness route mounts the guide');
}

// ── 4. THE SETTINGS ──────────────────────────────────────────────────────────
{
  const store = strip(read('stores/userDataStore.ts'));
  const defaults = store.slice(store.indexOf('const DEFAULT_SETTINGS'));
  const missing = [];
  for (const key of ['riseWords', 'lessonGuide']) {
    if (!new RegExp(`\\b${key}: true`).test(defaults)) missing.push(`${key} is not in DEFAULT_SETTINGS defaulting to true`);
  }
  if (!/settings\.riseWords/.test(strip(read(`${CIN}/NarrationText.tsx`)))) missing.push('NarrationText does not read riseWords');
  if (!/settings\.riseWords/.test(strip(read(`${CIN}/WordsToggle.tsx`)))) missing.push('the Aa button does not read riseWords');
  if (!/settings\.lessonGuide/.test(strip(read(`${CIN}/LessonGuide.tsx`)))) missing.push('the guide does not read lessonGuide');
  const settings = strip(read('app/(app)/settings.tsx'));
  if (!/function LessonsSection/.test(settings) || !/'lessonGuide'/.test(settings) || !/'riseWords'/.test(settings)) {
    missing.push('Settings › Lessons does not carry both switches');
  }
  if (!/case 'lessons':\s*return <LessonsSection \/>/.test(settings)) missing.push('Settings never draws LessonsSection');
  if (missing.length) bad('the two settings are not wired end to end', missing);
  else ok('riseWords and lessonGuide: default on, read in a lesson, both switches in Settings › Lessons');
}

// ── 5. THE GUIDE ─────────────────────────────────────────────────────────────
{
  const g = strip(read(`${CIN}/LessonGuide.tsx`));
  const missing = [];
  if (!/label="Got it"/.test(g)) missing.push('no "Got it"');
  if (!/Don’t show again|Don't show again/.test(g)) missing.push('no "Don\'t show again"');
  if (!/accessibilityViewIsModal/.test(g)) missing.push('not modal to a screen reader');
  if (!/useReducedMotion\(\)/.test(g)) missing.push('ignores Reduce Motion');
  // The whole opening tag, which ends at a '>' that is not the '>' of an arrow — a
  // `[^>]*` stops inside `() => close(false)` and never reaches a role written after
  // it, which is how this rule first passed a defect its counter-test put back.
  const layerAt = g.indexOf('<Pressable style={StyleSheet.absoluteFill}');
  const layerTag = layerAt < 0 ? '' : g.slice(layerAt, layerAt + 600).split(/(?<!=)>\s*\n/)[0];
  if (/accessibilityRole=/.test(layerTag)) {
    missing.push('the tap-anywhere layer has a button role: on the web "Got it" becomes a <button> inside a <button>');
  }
  if (!/BACK_SHARE/.test(g)) missing.push('the guide draws its line somewhere other than the tap rule\'s own split');
  if (missing.length) bad('the lesson guide lost part of itself', missing);
  else ok('the guide: Got it, Don\'t show again, modal, Reduce Motion, its line on the tap rule\'s own split');
}

console.log('\nBACK, FORWARD, THE Aa BUTTON AND THE LESSON GUIDE\n');
for (const m of oks) console.log(`  ok    ${m}`);
for (const [m, d] of failures) {
  console.log(`  FAIL  ${m}`);
  for (const x of d) console.log(`          ${x}`);
}
console.log(failures.length ? `\n${failures.length} failing.\n` : '\nevery lesson goes both ways, and the guide can never reach a harness.\n');
process.exit(failures.length ? 1 : 0);
