// WHAT MUST STAY IN FRAME — measured, not guessed.
//
// H60c: "a beat that shows the reader a specific thing reports that thing's box,
// and the camera then either holds wide enough or moves onto it." The mechanism
// was already in CinematicPlayer (`containShot`, which only ever loosens) and no
// scene could reach it, because SceneApi has no way to report a box and every
// scene draws its labels as raw <Text> with local styles. Wrapping 96 scenes'
// text in a reporting component is 96 files of judgement; measuring what they
// already draw is one script.
//
// So this steps every lesson in a browser and, beat by beat, records the union of
// the WORDS the scene has on stage, in scene coordinates. Words, not all art:
// scenery being cropped is what a push IS, and a union including the ground line
// and the sky would come to the whole stage and force scale 1 everywhere — which
// is not a camera fix, it is deleting the camera. What the frame audit actually
// caught being sliced was labels: "PAST / NOW / FUTURE", "CONSEQUENCES / DUTY /
// CHARACTER", "WHERE IT HAS BEEN".
//
// ── GETTING BACK TO SCENE COORDINATES ───────────────────────────────────────
//
// #stage-cam carries the camera transform with transformOrigin 0% 0%, so its own
// client rect top-left is the image of scene (0,0) and its width is STAGE_W × fit
// × scale. One division recovers both factors, so a measured rectangle converts
// back exactly at any zoom — and the answer does not depend on where the camera
// happened to be, which is what makes it usable as an input to the camera.
//
// USAGE (same rig as check-frame.mjs):
//   npx expo start --web --port 8847 --clear
//   chrome --headless=new --remote-debugging-port=9382 --user-data-dir=<tmp>
//   node scripts/measure-must.mjs                 # writes components/.../mustBoxes.ts
//   node scripts/measure-must.mjs ids.json        # a chosen list, printed not written
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { STAGE_W, STAGE_H, mergeReadings, mustBox, renderTable } from './lib/mustrule.mjs';

const PORT = +(process.env.CDP_PORT || 9382);
const WEB = +(process.env.WEB_PORT || 8847);
const BASE = `http://localhost:${WEB}/previewframe`;
const DIR = 'components/lesson/cinematic';
const OUT = path.join(DIR, 'mustBoxes.ts');


const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const MEASURE = `(() => {
  const cam = document.getElementById('stage-cam');
  const clip = document.getElementById('stage-clip');
  if (!cam || !clip) return JSON.stringify({ none: true });
  const cr = cam.getBoundingClientRect();
  const k = cr.width / ${STAGE_W};           // fit x scale, in one number
  if (!(k > 0.01)) return JSON.stringify({ none: true });
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity < 0.08) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const inked = (d) => {
    try {
      const rg = document.createRange();
      rg.selectNodeContents(d);
      const r = rg.getBoundingClientRect();
      if (r.width > 0.5 && r.height > 0.5) return r;
    } catch (e) {}
    return d.getBoundingClientRect();
  };
  // EVERY WORD SEPARATELY, not just their union.
  //
  // The union is what the player needs, but it is also the crudest possible
  // must-see rule: a persistent axis label at each edge of the stage makes every
  // beat's union full-width, and the camera can never push again. Storing the
  // parts means the RULE for combining them can be argued about offline, against
  // the same measurements, instead of costing another browser sweep each time.
  const items = [];
  for (const d of cam.querySelectorAll('div,span')) {
    if (!vis(d)) continue;
    if (d.children.length !== 0) continue;
    const t = (d.textContent || '').trim();
    if (t.length < 2) continue;
    const r = inked(d);
    const bx = (r.x - cr.x) / k, by = (r.y - cr.y) / k;
    const bw = r.width / k, bh = r.height / k;
    // ON STAGE NOW. Scenes park labels off the stage before they enter, and a
    // union that swallowed those would demand the camera show empty paper.
    const cx = bx + bw / 2, cy = by + bh / 2;
    if (cx < -4 || cx > ${STAGE_W + 4} || cy < -4 || cy > ${STAGE_H + 4}) continue;
    items.push({ t: t.slice(0, 40), b: [+bx.toFixed(1), +by.toFixed(1), +bw.toFixed(1), +bh.toFixed(1)] });
  }
  // THE BEAT INDEX, not a guess at it. The progress bar's scaleX is (i+1)/beats,
  // so it answers "did the tap advance the lesson" outright — a hash of the page
  // text cannot tell a dead tap from two beats that happen to read the same.
  const bar = document.getElementById('beat-progress');
  let prog = -1;
  try {
    // DOMMatrixReadOnly throws on the literal string "none", which is what an
    // untransformed element reports. -1 means "cannot tell", and the caller treats
    // that as "assume it advanced" rather than stopping the sweep on a formatting
    // detail.
    if (bar) {
      const tf = getComputedStyle(bar).transform;
      if (tf && tf !== 'none') prog = new DOMMatrixReadOnly(tf).a;
    }
  } catch (e) { prog = -1; }
  // THE END OF THE LESSON IS prog === 1, not the word "Finish" on the page.
  // aesthetics-aesthetics-16 says "Finished" in its second beat's narration, so a
  // text match called the lesson over at beat 1 and stored boxes for two of its
  // seven beats. The progress bar is (beat + 1) / beats — it cannot be fooled by
  // prose, and it is the same source the stepping already trusts.
  return JSON.stringify({ items, prog, done: prog >= 0.999 });
})()`;

const CLICK = `(() => { const el = document.elementFromPoint(195, 700) || document.body;
  el.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; })()`;

// A GRADED BEAT DOES NOT LET YOU PAST UNTIL YOU ANSWER IT.
//
// `gates()` locks the advance on any beat with a tap/mc/interact block, so a sweep
// that only taps to advance stops dead at the first question and every beat after
// it goes unmeasured — which is how ethics-ethics-3 came back with 8 boxes for 10
// beats. Both kinds of question have to be answerable: `interact` is answered by
// pressing something in the SCENE (a Target, findable by the ring it draws) and
// `mc` by pressing a choice in the deck below.
//
// Which answer is chosen does not matter for measurement. What matters is that the
// beats after it get looked at, and that they get looked at in the state a real
// reader leaves behind — answered, with the scene's own right/wrong styling up.
const ANSWER_SCENE = `(() => {
  const ring = document.querySelector('#target-ring');
  if (ring && ring.parentElement) { ring.parentElement.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
  return 0;
})()`;

// A DECK CHOICE IS A [tabindex] DIV, NOT A [role=button].
//
// cinematicKit's Choices renders plain <Pressable>s with no accessibilityRole, so
// React Native Web gives them a tabindex and nothing else. Selecting on
// role="button" found none of them, so an mc beat could not be answered and every
// lesson stopped short. Target DOES set the role, which is why scene-answered
// questions worked and deck-answered ones did not.
const ANSWER_DECK = `(() => {
  const clip = document.getElementById('stage-clip');
  const below = clip ? clip.getBoundingClientRect().bottom : 0;
  const b = [...document.querySelectorAll('[role="button"],[tabindex]')].find((e) => {
    const r = e.getBoundingClientRect();
    // Wide and shallow: a choice row. The wrappers around them are 300+ tall.
    return r.top > below && r.width > 150 && r.height >= 20 && r.height <= 90;
  });
  if (b) { b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
  return 0;
})()`;

const ROUTE = 'app/previewframe.tsx';
const ROUTE_SRC = `// WRITTEN BY scripts/measure-must.mjs — deleted again when it finishes.
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

/** lesson id -> the component name it maps to, so the stamp can hash the right files. */
function idMap() {
  const src = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
  return new Map([...src.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));
}

/**
 * How many beats each lesson HAS, read from its script.
 *
 * So the run can say out loud when it measured fewer than that. A short row is
 * the silent failure mode of this whole approach — the lesson looks measured, and
 * its last beats quietly have no box — so it has to be reported by the thing that
 * caused it, not only by a validator somebody may not run.
 */
function expectedBeats(map) {
  const out = new Map();
  for (const [id, comp] of map) {
    const base = comp.replace(/Lesson$/, '');
    const p = path.join(DIR, `${base[0].toLowerCase()}${base.slice(1)}Script.ts`);
    if (!fs.existsSync(p)) continue;
    const body = fs.readFileSync(p, 'utf8').match(/BEATS[^=]*=\s*\[([\s\S]*)\n\];/);
    if (!body) continue;
    const chunks = body[1].split(/\n\s{2}\},?\s*\n?/).filter((c) => /\S/.test(c));
    // NOT THE SUMMARY BEAT. `stageGone` unmounts the stage under the summary card,
    // so there is no #stage-clip to measure and nothing the camera could crop —
    // counting it would report every lesson in the repo as short by one, which is
    // the fastest possible way to make this warning meaningless.
    out.set(id, chunks.filter((c) => !/^\s{4}summary:/m.test(c)).length);
  }
  return out;
}

/**
 * A FINGERPRINT OF WHAT WAS MEASURED, so a stale box is an error and not a crop.
 *
 * These boxes are measured from a render. Edit a scene's layout without
 * re-measuring and the stored box describes a picture that no longer exists —
 * and the dangerous direction is silent: a box that is now too SMALL lets the
 * camera push in over something it should have held. validate-cinematic compares
 * this stamp and fails when they diverge.
 */
function stampFor(comp) {
  const base = comp.replace(/Lesson$/, '');
  const cands = [
    path.join(DIR, `${base[0].toLowerCase()}${base.slice(1)}Scene.tsx`),
    path.join(DIR, `${base[0].toLowerCase()}${base.slice(1)}Script.ts`),
    path.join(DIR, `${comp}.tsx`),
  ].filter((p) => fs.existsSync(p));
  if (!cands.length) return null;
  const h = crypto.createHash('sha1');
  for (const p of cands.sort()) h.update(fs.readFileSync(p));
  return h.digest('hex').slice(0, 12);
}

(async () => {
  const map = idMap();
  const ids = process.argv[2] && process.argv[2] !== '-' ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : [...map.keys()];
  // arg3 lets a trial run write somewhere harmless instead of over the real table.
  const outFile = process.argv[3] || OUT;
  // ONE AT A TIME, and this is not a nicety.
  //
  // Two of these running together share a Chrome, a Metro and — fatally — the
  // preview route, which each one DELETES on the way out. Five accumulated during
  // this work because stopping a background task does not always kill the node
  // process under it: a run that had been "stopped" half an hour earlier was still
  // stepping lessons, wrote a stale half-finished table over the good one, and
  // removed app/previewframe.tsx out from under the live sweep, which then
  // reported lesson after lesson as NEVER RENDERED A STAGE. Every symptom pointed
  // at the app.
  const LOCK = path.join(DIR, '.measure-must.lock');
  if (fs.existsSync(LOCK)) {
    const owner = fs.readFileSync(LOCK, 'utf8').trim();
    console.error(
      `another measure-must is running (pid ${owner}).\n` +
      'Two of these fight over one Chrome and delete each other\'s preview route.\n' +
      `If that pid is dead, remove ${LOCK} and try again.`,
    );
    process.exit(1);
  }
  fs.writeFileSync(LOCK, String(process.pid));

  if (!fs.existsSync(ROUTE)) fs.writeFileSync(ROUTE, ROUTE_SRC);
  const cleanup = () => {
    try { fs.unlinkSync(ROUTE); } catch {}
    try { if (fs.readFileSync(LOCK, 'utf8').trim() === String(process.pid)) fs.unlinkSync(LOCK); } catch {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });

  const tab = await put('/json/new?about:blank');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let mid = 0; const pending = new Map();
  const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise((r) => { ws.onopen = r; });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const ev = async (x) => (await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }))?.result?.value;

  /**
   * Wait for the STAGE, not for a clock.
   *
   * This used to wait for `innerText.length > 20` and then a flat delay. Body text
   * appears while the lesson is still mounting and the stage only exists once
   * onLayout has handed the player a `fit`, so the probe could arrive before
   * #stage-cam existed, read nothing, and record the lesson as having no beats —
   * reporting a failure to look as a result.
   */
  const waitForStage = async (tries) => {
    for (let i = 0; i < tries; i++) {
      if (await ev("!!document.getElementById('stage-cam') || !!document.getElementById('stage-clip')")) return true;
      await wait(500);
    }
    return false;
  };

  const expected = expectedBeats(map);
  const short = [];
  const boxes = {}, words = {}, stamps = {};
  let done = 0, tightest = [];
  for (const id of ids) {
    await send('Page.navigate', { url: `${BASE}?id=${encodeURIComponent(id)}` });
    // WAIT FOR THE STAGE, NOT FOR A CLOCK.
    //
    // This waited for `innerText.length > 20` and then a flat 1100ms. Body text
    // appears while the lesson is still mounting, and the stage only exists once
    // onLayout has given the player a `fit` — so on the first lesson of a run,
    // where the app is also booting and loading fonts, the probe arrived before
    // #stage-cam existed, read `none`, and recorded the lesson as having zero
    // beats. It reported that as a result rather than as a failure to look.
    // The FIRST navigation of a run pays for Metro compiling the preview route
    // this script just wrote, which can take the better part of a minute; every
    // one after it is warm. A single patience figure has to be the slow one, and
    // then a genuinely broken lesson costs 90s to discover — so they differ.
    const ready = await waitForStage(done === 0 ? 180 : 40);
    if (!ready) { console.log(`  ${id.padEnd(32)} NEVER RENDERED A STAGE`); done++; continue; }
    await wait(900);

    const per = [];
    let last = null, stepped = 0;
    for (let b = 0; b < 14; b++) {
      // THREE READINGS, ACROSS THE BEAT, AND UNION.
      //
      // A beat runs 4–5 seconds and its labels do not all arrive at the start:
      // scenes slide words in, ink rows one at a time, stamp a verdict on at the
      // end. Two readings 0.65s apart sampled only the opening of each beat, so a
      // label revealed at 3s was never seen — and a word missing from the box is
      // the SILENT failure, the one where the table looks like a guarantee and the
      // camera crops the thing anyway. Sampling to ~3.1s costs about 20 minutes
      // across the sweep and is the whole difference between a measurement and a
      // hopeful one.
      const r1 = JSON.parse(await ev(MEASURE));
      // Only the FIRST reading ends the lesson. The stage was there a moment ago,
      // so its absence at the top of a beat is the summary card having replaced it.
      if (r1.none) break;
      await wait(1000);
      const r2 = JSON.parse(await ev(MEASURE));
      await wait(1200);
      const r3 = JSON.parse(await ev(MEASURE));
      // A LATER READING COMING BACK EMPTY IS A MISSED LOOK, NOT THE END.
      //
      // These used to `break` too, which meant one transient miss mid-beat threw
      // that beat's measurements away AND stopped the lesson: political-political-1
      // recorded 2 boxes for its 7 beats while the identical expressions, stepped
      // by hand, reached every one of them. Discarding data because a later sample
      // of the SAME beat failed is never right — the beat is measured by whichever
      // readings did land.
      const items = [r1, r2, r3].filter((r) => r && !r.none).map((r) => r.items);
      per.push(items.reduce((a, b) => mergeReadings(a, b)));
      if ((r3.none ? r2 : r3).done) break;
      // ADVANCE, AND CHECK THAT IT ADVANCED — against the progress bar, which is
      // literally (beat + 1) / beats. The old test compared a hash of the page
      // text and stopped the moment two beats read alike, which cost
      // ethics-ethics-3 its last two beats and left them with no box at all.
      // A tap can also land while a gate is still closed, so give it one retry
      // before concluding the lesson is stuck.
      let moved = false;
      for (let attempt = 0; attempt < 3 && !moved; attempt++) {
        // Second try onward: the beat is probably gated, so answer it first.
        // TRY BOTH KINDS OF ANSWER, in separate attempts.
        //
        // One combined expression tried the scene target first and fell through to
        // the deck only when no ring existed — but ethics-ethics-11 keeps three
        // rings mounted on every beat, so the fallback was never reached and its
        // deck question could not be answered no matter how many retries ran.
        // "Is there a ring on screen" is not the same question as "is this beat
        // answered in the scene".
        if (attempt === 1) { await ev(ANSWER_SCENE); await wait(700); }
        if (attempt === 2) { await ev(ANSWER_DECK); await wait(700); }
        await ev(CLICK);
        await wait(900);
        const now = JSON.parse(await ev(MEASURE));
        if (now.none) { moved = false; break; }
        if (last === null || now.prog < 0 || now.prog > last + 1e-4) { last = now.prog; moved = true; }
      }
      if (!moved) break;
      stepped++;
    }
    if (per.length && per.length < (expected.get(id) ?? 0)) {
      short.push(`${id} ${per.length}/${expected.get(id)}`);
    }
    words[id] = per;
    boxes[id] = per.map((items, i) => mustBox(items, i > 0 ? per[i - 1] : null));
    const comp = map.get(id);
    const st = comp ? stampFor(comp) : null;
    if (st) stamps[id] = st;
    done++;
    const wide = boxes[id].filter((p) => p && (p[2] > 300 || p[3] > 260)).length;
    tightest.push({ id, n: per.length, wide });
    console.log(`  ${String(done).padStart(3)}/${ids.length}  ${id.padEnd(32)} ${per.length} beats · ${boxes[id].filter(Boolean).length} with words · ${wide} near-full-stage`);
  }

  const totalBeats = Object.values(boxes).reduce((a, p) => a + p.length, 0);
  const withBox = Object.values(boxes).reduce((a, p) => a + p.filter(Boolean).length, 0);
  const wide = tightest.reduce((a, t) => a + t.wide, 0);
  console.log(`\n${done} lessons · ${totalBeats} beats · ${withBox} carry words · ${wide} of those need most of the stage`);
  console.log(`(a near-full-stage box is a beat whose subject already spans it — the camera`);
  console.log(` there was pushing past its own labels, and holding wide is the correct answer.)`);
  if (short.length) {
    console.log(`
! ${short.length} lesson(s) measured FEWER beats than they have. The rest have no`);
    console.log(`  box and are still framed by luck — re-run those ids:
  ${short.join(', ')}`);
  }

  // MERGED, NOT REPLACED.
  //
  // Re-measuring one lesson after editing its scene is the common case — a full
  // sweep is hours — and writing only what this run saw would silently delete the
  // boxes for the other 101, turning a one-lesson fix into a repo-wide regression
  // that nothing would report except a frame audit nobody was going to re-run.
  // Whatever this run measured wins for those ids; everything else is carried.
  const side = `${outFile}.json`;
  let allWords = words, allStamps = stamps;
  if (fs.existsSync(side)) {
    try {
      const prev = JSON.parse(fs.readFileSync(side, 'utf8'));
      allWords = { ...(prev.words ?? {}), ...words };
      allStamps = { ...(prev.stamps ?? {}), ...stamps };
      const carried = Object.keys(allWords).length - Object.keys(words).length;
      if (carried > 0) console.log(`carried ${carried} lesson(s) forward from the previous measurement`);
    } catch { /* unreadable sidecar — this run's measurements stand alone */ }
  }

  // EVERY WORD, not only the boxes derived from them. The must-see RULE (see
  // scripts/lib/mustrule.mjs) is a judgement about which words a beat is pointing
  // at, and keeping the raw measurements means that judgement can be revisited
  // against the same render instead of costing another sweep.
  const rendered = renderTable(allWords, allStamps);
  fs.writeFileSync(side, JSON.stringify({ boxes: rendered.boxes, words: allWords, stamps: allStamps }, null, 1));
  fs.writeFileSync(outFile, rendered.text);
  console.log(`\nwrote ${outFile}  (${Object.keys(allWords).length} lessons in the table)`);
  cleanup();
})();
