// NOTHING MAY ANSWER THE QUESTION BEFORE THE READER DOES.
//
//   npx expo start --web --port 8847 --clear
//   chrome --headless=new --remote-debugging-port=9382 --user-data-dir=<tmp>
//   node scripts/check-spoiler.mjs            (npm run check:spoiler)
//   node scripts/check-spoiler.mjs ids.json   # a chosen list
//
// ── THE RULE (group O) ──────────────────────────────────────────────────────
//
// A graded beat has three things a reader must NOT be able to see until they have
// committed to an answer: the verdict ("Not quite" / the correct label), the
// EXPLANATION, and any answer state on the options themselves. The reveal is the
// payoff for choosing; shown early it is both a spoiler and — the reader's own
// words — something that "doesn't look right", because a panel that is already
// full has nothing left to do when the answer lands.
//
// ── WHY THIS IS A BROWSER CHECK AND NOT A GREP ──────────────────────────────
//
// Every shared component gates correctly: `Choices`, `InteractPanel`, `Reveal`,
// `ChoiceCards`, and both bespoke players all hang their reveal on `answered`.
// Reading the source therefore says the app is clean, and the reader can see that
// it is not. The leak is not in the gate — it is in what a SCENE draws on its own
// stage, where the answer state is a per-lesson decision made 130 times. Only the
// rendered page knows.
//
// So this steps every graded beat in every wired lesson, and before answering it
// compares what is on screen against that beat's own `explain` and against the
// verdict wording. Anything from the reveal that is legible early is a failure,
// named with the lesson and beat that leaked it.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { claimRoute } from './lib/previewroute.mjs';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

const CDP = +(process.env.CDP_PORT || 9382);
const WEB = +(process.env.WEB_PORT || 8847);
const BASE = `http://localhost:${WEB}/previewframe`;
const DIR = 'components/lesson/cinematic';
const ROUTE = 'app/previewframe.tsx';
const POOL = 4;

// Same route the measure-must sweep writes, for the same reason: a lesson is
// gated behind its unit, so the real URL cannot reach most of them.
const ROUTE_SRC = `// WRITTEN BY scripts/check-spoiler.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

export default function PreviewFrame() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    useUserDataStore.setState({ _hasHydrated: true } as any);
    useUIStore.setState({ launchDone: true } as any);
    setGo(true);
  }, []);
  const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const id = q?.get('id') ?? '';
  const found = getLessonById(id);
  const Comp = (CINEMATIC as Record<string, any>)[id];
  if (!go || !found || !Comp) return <View style={{ flex: 1, backgroundColor: '#FAFAF7' }} />;
  return <Comp lesson={found.lesson} />;
}
`;

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── what each lesson asks, read from its script ──────────────────────────────
function idMap() {
  const src = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
  return new Map([...src.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));
}

/** The graded beats of one lesson: index, and the explain text it must not leak. */
function gradedBeats(scriptFile) {
  const src = fs.readFileSync(scriptFile, 'utf8');
  const beats = src.split(/\n  \{\n/).slice(1);
  const out = [];
  beats.forEach((b, i) => {
    const m = /explain:\s*(['"`])([\s\S]*?)\1\s*,/.exec(b);
    if (!m) return;
    const kind = /cards:\s*\[/.test(b) ? 'cards' : /drag:\s*\{/.test(b) ? 'drag' : 'scene';
    out.push({ i, kind, explain: m[2].replace(/\\'/g, "'").replace(/\s+/g, ' ').trim() });
  });
  return out;
}

function scriptFor(comp) {
  const base = comp.replace(/Lesson$/, '');
  const low = `${base[0].toLowerCase()}${base.slice(1)}`;
  for (const n of [`${low}Script.ts`, `${base}Script.ts`]) {
    const p = path.join(DIR, n);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// ── the page probes ──────────────────────────────────────────────────────────

// Only what the reader can SEE. The tab shell is not in play here (the preview
// route renders the lesson alone) but a beat still keeps outgoing layers mounted
// mid-transition, so ancestor visibility and a hit test both matter.
const VISIBLE_TEXT = `(() => {
  const out = [];
  const walk = (n) => {
    if (n.nodeType === 3) {
      const t = (n.textContent || '').trim();
      const el = n.parentElement;
      if (t && el) {
        const r = el.getBoundingClientRect();
        const inView = r.top < innerHeight && r.bottom > 0 && r.width > 0 && r.height > 0;
        const shown = el.checkVisibility
          ? el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
          : true;
        if (inView && shown) out.push(t);
      }
      return;
    }
    for (const c of n.childNodes) walk(c);
  };
  walk(document.body);
  return JSON.stringify(out);
})()`;

const PROGRESS = `(() => {
  const bar = document.getElementById('beat-progress');
  let prog = -1;
  try {
    if (bar) {
      const tf = getComputedStyle(bar).transform;
      if (tf && tf !== 'none') prog = new DOMMatrixReadOnly(tf).a;
    }
  } catch (e) { prog = -1; }
  return String(prog);
})()`;

// ADVANCE ON THE NUDGE, AND NEVER OVER THE STAGE.
//
// This is the check's own worst failure mode, and it produced four confident,
// completely false findings before it was caught.
//
// measure-must taps (195, 700), which in this route lands in the narration block
// and does not forward — the lesson sat on beat 0 forever. The obvious repair was
// (195, 300), which is the stage and does advance. It also ANSWERS THE QUESTION:
// on a scene-target beat the targets ARE the stage, so the tap that carried the
// sweep into a graded beat could land on a target, and the read that followed
// then found the reveal — correctly on screen, because the harness had just
// answered it. Four lessons were reported as leaking their explanation and every
// one of them is clean when stepped by hand.
//
// The nudge at the bottom is the dedicated advance affordance, it is outside the
// stage, and it is inert while a question is unanswered — so it cannot answer
// anything. Verified to step a lesson from beat 0 to its first question.
const CLICK = `(() => { const el = document.elementFromPoint(195, 805) || document.body;
  el.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true})); return 1; })()`;

// Answering, by all three mechanisms — a graded beat gates the advance, so the
// sweep cannot reach later beats without doing it (§21's fourth lesson).
const ANSWER = `(() => {
  // A SCENE TARGET is a Pressable (role=button) wrapping a ring that carries
  // nativeID="target-ring" — which is what reaches the DOM as an id. Selecting on
  // the ring and walking up to its button is the only reliable handle: the
  // Pressable itself has no distinguishing attribute, and there are other
  // role=button elements on the beat.
  const ring = document.querySelector('[id="target-ring"]');
  if (ring) {
    const btn = ring.closest('[role="button"]') || ring.parentElement;
    if (btn) { btn.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 'target'; }
  }
  // THE ANALOGUE CONTROLS ARE TRIED BEFORE THE GENERIC BUTTON, and the order is
  // the whole fix. A control beat still has role=button elements on it that are
  // not its answer, so the generic branch fired first, clicked something inert,
  // reported success and left the lesson stuck on that beat forever.
  const drove = ${ANSWER_CONTROL};
  if (drove) return drove;
  const b = [...document.querySelectorAll('[role="button"],[tabindex]')].find((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 60 && r.height > 30 && r.top > innerHeight * 0.3;
  });
  if (b) { b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 'button'; }
  return 'none';
})()`;

// The verdict wording, from the one place that owns it.
const kit = fs.readFileSync(path.join(DIR, 'cinematicKit.tsx'), 'utf8');
const CORRECT_LABEL = (/const CORRECT_LABEL\s*=\s*'([^']+)'/.exec(kit) || [, 'Correct'])[1];
const VERDICTS = [CORRECT_LABEL, 'Not quite', 'That’s the one'];

/** Is a slice of `explain` legible on screen? */
function leaked(texts, explain) {
  const joined = texts.join(' · ').replace(/\s+/g, ' ');
  // A distinctive opening slice: long enough that a shared word cannot match,
  // short enough to survive the copy being reflowed across elements.
  const head = explain.slice(0, 42);
  if (head.length >= 18 && joined.includes(head)) return `explanation ("${head}…")`;
  for (const v of VERDICTS) if (texts.some((t) => t === v)) return `verdict ("${v}")`;
  return null;
}

// ── run ──────────────────────────────────────────────────────────────────────
const only = process.argv[2] ? new Set(JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))) : null;
const map = idMap();
const work = [];
for (const [id, comp] of map) {
  if (only && !only.has(id)) continue;
  const sf = scriptFor(comp);
  if (!sf) continue;                       // the two bespoke players carry no *Script.ts
  const gb = gradedBeats(sf);
  // The lesson's TOTAL beat count, so the progress bar can be turned back into
  // a beat index (prog is (beat + 1) / total).
  const total = fs.readFileSync(sf, 'utf8').split(/\n  \{\n/).slice(1).length;
  if (gb.length && total) work.push({ id, beats: gb, total });
}
console.log(`stepping ${work.length} lessons, ${work.reduce((a, w) => a + w.beats.length, 0)} graded beats\n`);

// WRITE IT, THEN WAIT FOR METRO TO ADMIT IT EXISTS.
//
// Expo Router builds its route table from the file tree at bundle time, so a
// route written after the dev server started is not servable until the rebuild
// lands. Navigating immediately gets "This screen doesn't exist" — which renders
// no buttons, so every lesson reports "could not be answered" and the sweep
// finishes green having measured NOTHING. That is the exact shape of failure
// §21 warns about, and it is why this wait is not optional.
// Only write when it differs, so an already-present route is not touched — a
// rewrite makes Metro rebuild and the sweep then races the rebuild.
// Shared lock across every harness that writes a route into app/. This script
// and check-frame write the SAME filename, so without one they delete each
// other's route mid-sweep — and the victim reports every lesson as an empty
// stage while all the symptoms point at the app.
//
// SPOILER_KEEP=1 still leaves the route in place between runs: creating the file
// is the slow half, because Metro rebuilds its route table for a NEW file and a
// sweep that starts before that lands gets "This screen doesn't exist" for every
// lesson. check-routes.mjs is what stops a kept route reaching a build.
const { release: cleanup, wrote } = claimRoute({
  route: ROUTE, src: ROUTE_SRC, owner: 'check-spoiler',
  keep: process.env.SPOILER_KEEP === '1',
});
if (wrote) await wait(9000);

async function makeTab() {
  const t = await put('/json/new?about:blank');
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let mid = 0; const pending = new Map();
  await new Promise((r) => { ws.onopen = r; });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  const send = (me, pa = {}) => new Promise((res) => { const i = ++mid; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: me, params: pa })); });
  await send('Page.enable'); await send('Runtime.enable');
  // A BACKGROUND TAB IS NOT LAID OUT — the same trap measure-must documents.
  // Only one tab of a headless window is active; the rest never run their
  // ResizeObserver, so the player's onLayout never fires and the stage never
  // mounts. Here it showed up as the beat sticking at 0 forever: elementFromPoint
  // found nothing to tap because nothing had been laid out to tap.
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {});
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const ev = async (x) => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.value;
  return { send, ev, close: () => ws.close(), id: t.id };
}

const findings = [];
const unanswered = [];
let stepped = 0;

async function run(tab, w) {
  await tab.send('Page.navigate', { url: `${BASE}?id=${w.id}` });
  const want = new Map(w.beats.map((b) => [b.i, b]));
  const seen = new Set();

  // WAIT FOR THE LESSON, don't assume a fixed delay is enough. A cold tab takes
  // well over ten seconds to parse and execute the dev bundle, and reading the
  // progress bar before it exists returns -1 — which the loop below treats as
  // "the lesson ended", so every lesson finished having measured no beats at all.
  let ready = false;
  for (let k = 0; k < 30 && !ready; k++) {
    await wait(1000);
    ready = Boolean(await tab.ev(`!!document.getElementById('beat-progress')`));
  }
  if (!ready) { unanswered.push(`${w.id} — never rendered`); stepped++; return; }
  await wait(800);

  // THE BEAT INDEX COMES OFF THE PROGRESS BAR, NOT OFF A COUNTER.
  //
  // Counting taps assumes every tap advances, and a graded beat deliberately
  // gates the advance — so one unanswered question slides the counter out of
  // step with the lesson and every later reading is taken on the wrong beat.
  // prog is (beat + 1) / beats, which is the player's own answer.
  const beatOf = async () => {
    const p = Number(await tab.ev(PROGRESS));
    if (!(p > 0)) return -1;
    return Math.round(p * w.total) - 1;
  };

  for (let guard = 0; guard < 40 && seen.size < w.beats.length; guard++) {
    const beat = await beatOf();
    if (process.env.SPOILER_DEBUG === '1') {
      console.log(`\n    ${w.id}: at beat ${beat}/${w.total}, want [${[...want.keys()].join(',')}]`);
    }
    if (beat < 0) break;
    const g = want.get(beat);
    if (g) {
      // READ ONCE, ANSWER AS OFTEN AS NEEDED.
      //
      // The reading must happen exactly once, before the first answer attempt —
      // that is the whole measurement. Answering, though, is retried every time
      // the loop finds itself still on the same graded beat: a reveal animation
      // can swallow the tap that follows it, and a single attempt left the sweep
      // parked on one question for the rest of its guard budget. Re-answering is
      // safe because the controls disable themselves once picked.
      if (!seen.has(beat)) {
        await wait(900);                     // let the beat settle before reading
        const texts = JSON.parse(await tab.ev(VISIBLE_TEXT) || '[]');
        const bad = leaked(texts, g.explain);
        if (bad) findings.push({ id: w.id, beat, kind: g.kind, what: bad });
        seen.add(beat);
      }
      await tab.ev(ANSWER);
      await wait(1400);
    }
    await tab.ev(CLICK);
    await wait(700);
    const p = Number(await tab.ev(PROGRESS));
    if (p >= 0.999) break;
  }
  if (seen.size < w.beats.length && !unanswered.some((u) => u.startsWith(w.id))) {
    unanswered.push(`${w.id} — reached ${seen.size}/${w.beats.length} graded beats`);
  }
  stepped++;
  process.stdout.write(`\r  ${stepped}/${work.length}  ${findings.length} leak(s)   `);
}

const tabs = [];
for (let i = 0; i < POOL; i++) tabs.push(await makeTab());
const queue = work.slice();
await Promise.all(tabs.map(async (t) => {
  while (queue.length) {
    const w = queue.shift();
    try { await run(t, w); } catch (e) { console.log(`\n  ${w.id}: ${String(e).slice(0, 80)}`); }
  }
  t.close();
}));
cleanup();

console.log('\n');
if (!findings.length) {
  console.log('O1: no graded beat shows its reveal before the reader answers.');
} else {
  const byLesson = new Map();
  for (const f of findings) {
    if (!byLesson.has(f.id)) byLesson.set(f.id, []);
    byLesson.get(f.id).push(f);
  }
  console.log(`O1 FAIL — ${findings.length} graded beat(s) in ${byLesson.size} lesson(s) show the reveal early:\n`);
  for (const [id, list] of byLesson) {
    console.log(`  ${id}`);
    for (const f of list) console.log(`     beat ${f.beat} (${f.kind}) leaks the ${f.what}`);
  }
}
// A SHORT SWEEP IS NOT A CLEAN SWEEP, and it must not be able to look like one.
//
// The first run of this file reported all 130 lessons green while actually
// rendering "This screen doesn't exist" for every one of them: no buttons meant
// no answers, no answers meant one beat each, and one beat each meant nothing to
// find. Whatever it could not step is a FAILURE of the check, not a pass.
if (unanswered.length) {
  console.log(`\nDID NOT MEASURE — ${unanswered.length} lesson(s) could not be stepped to the end:`);
  for (const u of unanswered.slice(0, 20)) console.log(`  ${u}`);
  if (unanswered.length > 20) console.log(`  … and ${unanswered.length - 20} more`);
  console.log('\nFix the harness before trusting the result above.');
}
process.exit(findings.length || unanswered.length ? 1 : 0);
