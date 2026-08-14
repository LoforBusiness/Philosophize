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
// So this steps every lesson in a browser and, beat by beat, records everything the
// scene has drawn on stage, in scene coordinates: every FIGURE (the union of one
// Stickman's limbs), every WORD, and every piece of ART, each flagged with whether
// it already bleeds off the stage edge. scripts/lib/mustrule.mjs turns that into the
// box; keeping the parts means the rule can be changed and the table regenerated
// without paying for another sweep.
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
const BEATS_BLOCK = /BEATS[^=]*=\s*\[([\s\S]*)\n\];/;
const BEAT_SPLIT = /\n\s{2}\},?\s*\n?/;

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
  // EVERY DRAWN THING SEPARATELY, not just their union, and not just the words.
  //
  // The first version of this recorded only text, on the reasoning that scenery
  // being cropped is what a push IS. That was wrong in the way that matters: a
  // reader reported the camera cutting the stickman in half and slicing the
  // illustration above him, and both were true — the frame audit had counted 438
  // clipped art elements and the rule had been written to ignore them.
  //
  // So three kinds are recorded, and the rule (scripts/lib/mustrule.mjs) decides
  // what to do with each:
  //
  //   figure  the union of one <Stickman>'s limb Views. The root is a zero-size
  //           absolute box, so its own rect says nothing; the descendants are the
  //           man. Several may be on stage — data-testid, not id, for that reason.
  //   text    a leaf carrying characters.
  //   art     a leaf with a background or a border: a prop, a plate, a bar, a rule.
  //
  // BLEED is the one distinction worth drawing at measurement time. A ground line
  // runs from x -20 to x 420 because it is MEANT to continue past the frame, and
  // demanding the camera contain it would pin every shot to scale 1 for nothing.
  // Anything that already extends past the stage was drawn to be cut; anything that
  // sits wholly inside it is a thing with edges, and cutting it looks like damage.
  const items = [];
  const push = (kind, bx, by, bw, bh, t) => {
    const cx = bx + bw / 2, cy = by + bh / 2;
    // ON STAGE NOW. Scenes park props off-stage before they enter, and a union that
    // swallowed those would demand the camera show empty paper.
    if (cx < -4 || cx > ${STAGE_W + 4} || cy < -4 || cy > ${STAGE_H + 4}) return;
    const bleed = bx < 2 || by < 2 || bx + bw > ${STAGE_W - 2} || by + bh > ${STAGE_H - 2};
    items.push({ k: kind, b: [+bx.toFixed(1), +by.toFixed(1), +bw.toFixed(1), +bh.toFixed(1)],
      ...(bleed ? { bleed: 1 } : {}), ...(t ? { t: t.slice(0, 40) } : {}) });
  };

  const seen = new Set();
  for (const fig of cam.querySelectorAll('[data-testid="figure"]')) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const part of fig.querySelectorAll('*')) {
      if (!vis(part)) continue;
      seen.add(part);
      const r = part.getBoundingClientRect();
      x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y);
      x1 = Math.max(x1, r.x + r.width); y1 = Math.max(y1, r.y + r.height);
    }
    if (x0 === Infinity) continue;
    push('fig', (x0 - cr.x) / k, (y0 - cr.y) / k, (x1 - x0) / k, (y1 - y0) / k, '');
  }

  for (const d of cam.querySelectorAll('div,span')) {
    if (seen.has(d) || !vis(d) || d.children.length !== 0) continue;
    const t = (d.textContent || '').trim();
    const st = getComputedStyle(d);
    const inked = t.length > 1 ? 'text'
      : ((st.backgroundColor && st.backgroundColor !== 'rgba(0, 0, 0, 0)') ||
         parseFloat(st.borderTopWidth) > 0 || parseFloat(st.borderLeftWidth) > 0) ? 'art' : null;
    if (!inked) continue;
    let r = d.getBoundingClientRect();
    if (inked === 'text') {
      // The characters, not the layout box: a centred Text in a wide container has a
      // box far wider than its glyphs, and measuring the box would demand the camera
      // hold padding.
      try {
        const rg = document.createRange();
        rg.selectNodeContents(d);
        const q = rg.getBoundingClientRect();
        if (q.width > 0.5 && q.height > 0.5) r = q;
      } catch (e) {}
    }
    if (r.width < 1.5 || r.height < 1.5) continue;
    push(inked, (r.x - cr.x) / k, (r.y - cr.y) / k, r.width / k, r.height / k, inked === 'text' ? t : '');
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
  // A THIRD ANSWER MECHANISM: choices drawn ON the picture (./ChoiceCards).
  //
  // Searched across the DOCUMENT, not inside #stage-clip, even though they appear
  // inside the stage — the PLAYER renders them, not the scene, so they are siblings
  // overlaying the crop rather than descendants of it. Querying the clip found
  // nothing and three converted lessons came back short. Where a thing LOOKS is not
  // where it lives.
  //
  // The size floor excludes the header's 28x28 close button, which is the only other
  // role=button on screen and would exit the lesson instead of answering it.
  const card = [...document.querySelectorAll('[role="button"]')].find((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 60 && r.height > 28;
  });
  if (card) { card.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
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

// A FOURTH ANSWER MECHANISM, AND THE FIRST ONE THAT IS NOT A CLICK.
//
// `interact.drag` (components/lesson/cinematic/DragScale.tsx) is answered by
// dragging a knob along a rail, so there is no button anywhere on the beat and
// both snippets above find nothing. The first sweep of the twelve drag lessons
// therefore measured 6 or 7 beats of 9 and reported them as measured — the exact
// failure mode §21 already records twice, where a harness that cannot act on a
// beat reports a short sweep as a clean one.
//
// react-native-gesture-handler listens on POINTER events on the web, so a
// MouseEvent does nothing here however carefully it is aimed. The sequence has to
// be down / move / move / up with a live pointerId, and it needs at least two
// moves: `onUpdate` integrates translationX, and a single jump from the press
// point is indistinguishable from a tap to the pan recogniser's activation check.
const ANSWER_DRAG = `(() => {
  const strip = document.getElementById('drag-strip');
  if (!strip) return 0;
  const r = strip.getBoundingClientRect();
  if (!(r.width > 20)) return 0;
  const y = r.y + r.height / 2;
  const x0 = r.x + 6;
  // 0.55 across lands mid-rail, which is a legal answer on every zone layout the
  // twelve use. WHERE it lands does not matter for measurement — the beat's own
  // box is read before this runs; this only has to get the gate open.
  const x1 = r.x + r.width * 0.55;
  const opts = (x) => ({ bubbles: true, cancelable: true, composed: true,
    clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true, buttons: 1 });
  try {
    strip.dispatchEvent(new PointerEvent('pointerdown', opts(x0)));
    for (let k = 1; k <= 6; k++) {
      strip.dispatchEvent(new PointerEvent('pointermove', opts(x0 + (x1 - x0) * (k / 6))));
    }
    strip.dispatchEvent(new PointerEvent('pointerup', { ...opts(x1), buttons: 0 }));
    return 1;
  } catch (e) { return 0; }
})()`;

const ROUTE = 'app/previewframe.tsx';
const ROUTE_SRC = `// WRITTEN BY scripts/measure-must.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { setToursOff } from '@/components/lesson/cinematic/tourFlag';

export default function PreviewFrame() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    useUserDataStore.setState({ _hasHydrated: true } as any);
    useUIStore.setState({ launchDone: true } as any);
    setGo(true);
  }, []);
  const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  // MEASURE THE UN-TOURED LESSON. Group K is derived from this recording, so taking
  // the recording through a gated clock would measure a timeline the tours had
  // already moved — and every regeneration would shift it further. See tourFlag.ts.
  setToursOff(q?.get('notour') === '1');
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
/** Each lesson's declared band. mustBox clamps to it — see the note there. */
function bandMap(map) {
  const out = new Map();
  for (const [id, comp] of map) {
    const base = comp.replace(/Lesson$/, '');
    const low = `${base[0].toLowerCase()}${base.slice(1)}`;
    for (const f of [path.join(DIR, `${low}Scene.tsx`), path.join(DIR, `${comp}.tsx`)]) {
      if (!fs.existsSync(f)) continue;
      const m = fs.readFileSync(f, 'utf8').match(/band=\{\[(\d+),\s*(\d+)\]\}/);
      if (m) { out.set(id, [+m[1], +m[2]]); break; }
    }
  }
  return out;
}

function totalBeats(map) {
  const out = new Map();
  for (const [id, comp] of map) {
    const base = comp.replace(/Lesson$/, '');
    const p = path.join(DIR, `${base[0].toLowerCase()}${base.slice(1)}Script.ts`);
    if (!fs.existsSync(p)) continue;
    const body = fs.readFileSync(p, 'utf8').match(BEATS_BLOCK);
    if (!body) continue;
    out.set(id, body[1].split(BEAT_SPLIT).filter((c) => /\S/.test(c)).length);
  }
  return out;
}

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

  // ── A POOL OF TABS, because the browser is idle almost the whole time ───────
  //
  // A beat is measured by waiting for it to settle, reading, waiting, reading —
  // roughly four seconds of DOING NOTHING per beat, times nine beats, times a
  // hundred lessons. Run sequentially that is two and a half hours of a machine
  // waiting for animations it has already seen. The lessons are independent: each
  // is its own page, and the only shared thing is Metro, which serves one cached
  // bundle. So they go through a pool of tabs and the wall clock divides by the
  // pool size.
  const makeTab = async () => {
    const t = await put('/json/new?about:blank');
    const ws = new WebSocket(t.webSocketDebuggerUrl);
    let mid = 0; const pending = new Map();
    const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
    await new Promise((r) => { ws.onopen = r; });
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
    await send('Page.enable'); await send('Runtime.enable');
    // A BACKGROUND TAB IS NOT LAID OUT, and this whole thing depends on layout.
    //
    // Only one tab of a headless window is active; the rest never run their
    // ResizeObserver, so the player's onLayout never fires, `fit` stays 0 and the
    // stage is never mounted. Every lesson in every lane but one came back "NEVER
    // RENDERED A STAGE" — which looks exactly like a broken app and is not.
    // Focus emulation makes each tab believe it is the front one.
    await send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {});
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    const ev = async (x) => (await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }))?.result?.value;
    /**
     * Wait for the STAGE, not for a clock. Body text appears while the lesson is
     * still mounting and the stage only exists once onLayout has handed the player
     * a `fit`, so a timed wait could read before #stage-cam existed and record the
     * lesson as having no beats — reporting a failure to look as a result.
     */
    const waitForStage = async (tries) => {
      for (let i = 0; i < tries; i++) {
        if (await ev("!!document.getElementById('stage-cam') || !!document.getElementById('stage-clip')")) return true;
        await wait(500);
      }
      return false;
    };
    return { send, ev, waitForStage, close: () => { try { ws.close(); } catch {} } };
  };

  const LANES = +(process.env.LANES || 6);

  const expected = expectedBeats(map);
  const total = totalBeats(map);
  const bands = bandMap(map);
  const short = [];
  const boxes = {}, words = {}, stamps = {};
  let done = 0, tightest = [];

  /** Measure one lesson in one tab. Returns its per-beat item lists, or null. */
  // THE BEAT INDEX, EXACTLY. The progress bar is (beat + 1) / beats and it ANIMATES
  // toward that, so polling it raw counts the tail of one transition as the start of
  // the next: lessons came back with 12 and 13 beats where they have 10. Knowing the
  // denominator turns a moving number into an integer that cannot drift.
  const measureOne = async (T, id, first, nBeats) => {
    const idxOf = (prog) => (prog < 0 || !nBeats ? -1 : Math.round(prog * nBeats) - 1);
    await T.send('Page.navigate', { url: `${BASE}?id=${encodeURIComponent(id)}&notour=1` });
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
    const ready = await T.waitForStage(first ? 220 : 60);
    if (!ready) { console.log(`  ${id.padEnd(32)} NEVER RENDERED A STAGE`); return null; }
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
      const r1 = JSON.parse(await T.ev(MEASURE));
      // Only the FIRST reading ends the lesson. The stage was there a moment ago,
      // so its absence at the top of a beat is the summary card having replaced it.
      if (r1.none) break;
      await wait(1000);
      const r2 = JSON.parse(await T.ev(MEASURE));
      await wait(1200);
      const r3 = JSON.parse(await T.ev(MEASURE));
      // A FOURTH READING, LATE. A beat runs 4–5s and a question's prompt opens near
      // the end of it: metaphysics-being-8's "TAP WHAT MAKES A CHOICE FREE" arrived
      // after the third reading, so it was never in the box and the camera cut 74%
      // of it off. Sampling to ~4.5s costs about a second a beat, which parallel
      // lanes absorb — the reason to be stingy with readings disappeared when the
      // sweep stopped taking two and a half hours.
      // …AND THE LAST ONE LATE ENOUGH FOR A QUESTION TO HAVE OPENED.
      //
      // A beat runs 4–5s and an interact prompt — "TAP THE RIGHT CHUTE", the line
      // that tells the reader what to do — comes up near the end of it. At 4.5s it
      // was caught on some beats and missed on others, which is the worst of both:
      // the box looks complete and the camera crops an instruction. 6s clears the
      // longest beat in the app. Parallel lanes absorb the extra second and a half.
      await wait(2800);
      const r4 = JSON.parse(await T.ev(MEASURE));
      // A LATER READING COMING BACK EMPTY IS A MISSED LOOK, NOT THE END.
      //
      // These used to `break` too, which meant one transient miss mid-beat threw
      // that beat's measurements away AND stopped the lesson: political-political-1
      // recorded 2 boxes for its 7 beats while the identical expressions, stepped
      // by hand, reached every one of them. Discarding data because a later sample
      // of the SAME beat failed is never right — the beat is measured by whichever
      // readings did land.
      // SPREAD, NOT REDUCE, AND THE HOLES ARE KEPT. This was `.filter(...).reduce(
      // (a, b) => mergeReadings(a, b))`, which merged pairwise — so every call saw a
      // two-element list and the reading index mergeReadings stamps was always 0 or
      // 1, whatever the true position. Group K orders a tour by that index (K2), so
      // pairwise merging silently flattens the reveal order into "first or not
      // first". Filtering the misses out would shift every later index down by one,
      // which is the same fault more quietly, so nulls are passed through and
      // mergeReadings skips them in place.
      const items = [r1, r2, r3, r4].map((r) => (r && !r.none ? r.items : null));
      per.push(mergeReadings(...items));
      if ((r4.none ? (r3.none ? r2 : r3) : r4).done) break;
      // ADVANCE, AND CHECK THAT IT ADVANCED — against the progress bar, which is
      // literally (beat + 1) / beats. The old test compared a hash of the page
      // text and stopped the moment two beats read alike, which cost
      // ethics-ethics-3 its last two beats and left them with no box at all.
      // A tap can also land while a gate is still closed, so give it one retry
      // before concluding the lesson is stuck.
      let moved = false;
      let ended = false;
      for (let attempt = 0; attempt < 4 && !moved; attempt++) {
        // Second try onward: the beat is probably gated, so answer it first.
        // TRY BOTH KINDS OF ANSWER, in separate attempts.
        //
        // One combined expression tried the scene target first and fell through to
        // the deck only when no ring existed — but ethics-ethics-11 keeps three
        // rings mounted on every beat, so the fallback was never reached and its
        // deck question could not be answered no matter how many retries ran.
        // "Is there a ring on screen" is not the same question as "is this beat
        // answered in the scene".
        if (attempt === 1) { await T.ev(ANSWER_SCENE); await wait(700); }
        if (attempt === 2) { await T.ev(ANSWER_DECK); await wait(700); }
        // And a drag, which is not a click at all — see ANSWER_DRAG.
        if (attempt === 3) { await T.ev(ANSWER_DRAG); await wait(700); }
        await T.ev(CLICK);
        // POLL FOR THE ADVANCE; DO NOT TIME IT.
        //
        // A flat 900ms was long enough when one tab had the machine to itself and
        // far too short with six lanes running: the beat had not turned over yet,
        // the progress bar had not moved, the loop called it a stall and threw away
        // the rest of the lesson. Beat counts became non-deterministic — the same
        // lesson returning 6 beats in one run and 9 in the next — which is the tell
        // that something is being timed rather than waited for. Going parallel
        // changed every timing in the harness, so anything measured against a clock
        // had to become a condition.
        for (let t = 0; t < 16 && !moved && !ended; t++) {
          await wait(250);
          const now = JSON.parse(await T.ev(MEASURE));
          if (now.none) { ended = true; break; }
          const idx = idxOf(now.prog);
          if (last === null || idx < 0 || idx > last) { last = idx; moved = true; }
        }
        if (ended) break;
      }
      if (!moved) break;
      stepped++;
    }
    return per;
  };

  // The queue, drained by LANES workers. Each takes the next id, so a slow lesson
  // holds up only its own lane. The first lesson through any lane pays for Metro
  // compiling the preview route, hence the longer patience for it.
  const queue = [...ids];
  const runLane = async (T) => {
    // EVERY LANE's first lesson is slow, not just the run's first. Metro compiles
    // the preview route once, and all the lanes are waiting on that same compile,
    // so patience has to be per-lane or five of six give up before it finishes.
    let laneFirst = true;
    for (;;) {
      const id = queue.shift();
      if (id === undefined) return;
      const first = laneFirst;
      laneFirst = false;
      let per = null;
      try {
        per = await measureOne(T, id, first, total.get(id) ?? 0);
      } catch (e) {
        console.log(`  ${id.padEnd(32)} ERRORED: ${String(e).slice(0, 60)}`);
      }
      done++;
      if (!per) continue;
      words[id] = per;
      boxes[id] = per.map((items, i) => mustBox(items, i > 0 ? per[i - 1] : null, 'all', bands.get(id)));
      const comp = map.get(id);
      const st = comp ? stampFor(comp) : null;
      if (st) stamps[id] = st;
      if (per.length && per.length < (expected.get(id) ?? 0)) short.push(`${id} ${per.length}/${expected.get(id)}`);
      const wide = boxes[id].filter((q) => q && (q[2] > 300 || q[3] > 260)).length;
      tightest.push({ id, n: per.length, wide });
      console.log(`  ${String(done).padStart(3)}/${ids.length}  ${id.padEnd(32)} ${per.length} beats · ${boxes[id].filter(Boolean).length} with words · ${wide} near-full-stage`);
    }
  };

  const lanes = [];
  for (let i = 0; i < Math.min(LANES, ids.length); i++) lanes.push(await makeTab());
  console.log(`measuring ${ids.length} lessons across ${lanes.length} tabs`);
  await Promise.all(lanes.map((T) => runLane(T)));
  for (const T of lanes) T.close();

  const beatsMeasured = Object.values(boxes).reduce((a, p) => a + p.length, 0);
  const withBox = Object.values(boxes).reduce((a, p) => a + p.filter(Boolean).length, 0);
  const wide = tightest.reduce((a, t) => a + t.wide, 0);
  console.log(`\n${done} lessons · ${beatsMeasured} beats · ${withBox} carry words · ${wide} of those need most of the stage`);
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
  const rendered = renderTable(allWords, allStamps, 'all', bands);
  fs.writeFileSync(side, JSON.stringify({ boxes: rendered.boxes, words: allWords, stamps: allStamps }, null, 1));
  fs.writeFileSync(outFile, rendered.text);
  console.log(`\nwrote ${outFile}  (${Object.keys(allWords).length} lessons in the table)`);
  cleanup();
})();
