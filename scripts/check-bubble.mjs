// AB IN THE RENDER — DOES THE THOUGHT BUBBLE FOLLOW HIM, AND DOES IT CHANGE
// SENTENCE WHERE THE READER CAN SEE IT?
//
//   npx expo start --web --port 8847 --clear
//   chrome --headless=new --remote-debugging-port=9382 --user-data-dir=<tmp>
//   npm run check:bubble                 # the default worklist
//   npm run check:bubble -- ids.json     # a chosen list
//
// A reader reported three things about the bubbles, and all three were true:
// *"they don't seem to be following the Stickman correctly"*, *"it is not very
// smooth when the thinking boxes show up"*, and *"sometimes they'll skip from one
// sentence to another all of a sudden"*.
//
// ── WHY NONE OF IT COULD BE SEEN FROM THE SOURCE ────────────────────────────
//
// Every one of the three was a TIMING relationship between two things that are
// each individually correct. The placement table is right — `check:thoughts`
// re-derives all 1,358 boxes and none covers a word. The entrance curve is right.
// The figure's walk is right. What was wrong was that the box took the next
// beat's placement on the frame the reader tapped while keeping the previous
// beat's words for another 620ms, and that a placement measured for a beat's
// RESTING frame was pinned there while the figure was still walking toward it.
// Counting the corpus offline says how often that can happen — 591 sentence
// swaps, 418 one-frame disappearances, 79 bubbles on a walking beat — and says
// nothing at all about what the reader sees. Only the render does.
//
// ── WHAT IT MEASURES ────────────────────────────────────────────────────────
//
// Beat by beat, every ~90ms: where the bubble is, how opaque it is, what it says,
// and where the figure is. Then three rules, and each is a thing the reader named:
//
//   CUT     the words may never change while the box is visible. A sentence that
//           swaps at opacity 1 is the "skip from one sentence to another".
//   TELEPORT  the box may not jump while the figure is standing still. That is
//           the placement changing under a bubble that has not been taken down.
//   FROZEN  while the figure WALKS, the box must not stand still. Measured as the
//           share of his travel the box kept over the window they are both
//           visible for. NOT "the same distance": the box is also restoring the
//           sideways offset the generator searched out, so on a long walk it
//           legitimately travels less than he does. Standing perfectly still
//           while he crosses the stage is the thing the reader named, and it is
//           what this catches — it read 0% before, and 24–100% after.
//
// The floors are the corpus's own measured behaviour and not numbers picked to
// feel strict — see FLOORS below, each with what it was measured at.
import fs from 'node:fs';
import http from 'node:http';
import { claimRoute } from './lib/previewroute.mjs';

const CDP = +(process.env.CDP_PORT || 9382);
const WEB = +(process.env.WEB_PORT || 8847);
const SLUG = process.env.BUBBLE_ROUTE || 'previewbubble';
const ROUTE = `app/${SLUG}.tsx`;
// ONE LANE, AND THAT IS NOT TIMIDITY. Every other harness here STEPS a page and
// reads it; this one SAMPLES a running animation, and a second tab in the same
// headless Chrome is put in the background, where requestAnimationFrame is
// throttled to nothing while `setTimeout` keeps firing. That is precisely the
// divergence this file exists to detect, so on two lanes it reports it — moving
// from lesson to lesson between runs, which is the tell. The same eight lessons
// on one lane came back clean. Raise it only to find candidates, never to judge.
const LANES = +(process.env.LANES || 1);
const STAGE_TRIES = +(process.env.STAGE_TRIES || 300);
// How long a beat is watched. The bubble is told to appear at 620ms and fades in
// over 520, so a window shorter than about 1.3s never sees a settled box at all —
// and the walks that carry a thought run to 3.6s, which is the whole point.
const WATCH_MS = +(process.env.BUBBLE_WATCH || 4200);
const STEP_MS = 90;
// The longest gap between two samples that can still say anything about a swap.
// A swap is invisible for ~620ms (200 fading out, then the wait); anything wider
// than this straddles it. Every CDP round trip is real time on a shared browser,
// so this is a property of the machine rather than of the app.
const PAIR_MS = +(process.env.BUBBLE_PAIR || 250);

const FLOORS = {
  // Zero, and it can be zero: a sentence changing in front of the reader is the
  // defect itself rather than a matter of degree.
  cut: 0,
  // 6 page px. Sub-pixel drift and the edge clamp both live under this; the
  // defect it replaces moved the box the full width of the next placement.
  teleport: 6,
  // The least of his travel the box may keep. A box that is following him at all
  // clears this by a wide margin; the defect it replaces kept exactly none.
  keep: 0.15,
};
// Only a walk this long can say anything, and the number is measured rather than
// picked. The figure's centre here is the union of every limb rect, so a gesture
// that puts an arm out shifts it by tens of pixels without him going anywhere:
// `logic-arguments-17` beat 3 reported 28px of "walk" and a box that correctly
// did not move, which at a 20px threshold read as a failure. The corpus's median
// real walk is 68 stage units — about 72 page px at this device width — so 60
// separates a journey from an elbow.
const REAL_WALK = 60;

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (s) => {
    let b = ''; s.on('data', (c) => { b += c; }); s.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } });
  });
  r.on('error', rej); r.end();
});

async function makeTab() {
  const t = await put('/json/new?about:blank');
  const tabId = t.id;
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let mid = 0; const pending = new Map();
  const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  ws.addEventListener('message', (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg.result); pending.delete(msg.id); }
  });
  await new Promise((r) => ws.addEventListener('open', r));
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 900, deviceScaleFactor: 2, mobile: true });
  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r?.exceptionDetails) throw new Error(String(r.exceptionDetails.exception?.description ?? '').slice(0, 300));
    return r?.result?.value;
  };
  const close = () => new Promise((res) => {
    const r = http.request({ host: '127.0.0.1', port: CDP, path: '/json/close/' + tabId }, (x) => { x.resume(); x.on('end', res); });
    r.on('error', res); r.end();
  });
  return { send, evalJs, close };
}

const STAGE = "document.querySelector('#stage-cam')";
const TAP_ADVANCE = "(()=>{const e=document.elementFromPoint(210,320);(e||document.body).dispatchEvent(new MouseEvent('click',{bubbles:true}));return true})()";

/**
 * ONE SAMPLE: the bubble, and the figure it is supposed to belong to.
 *
 * `nativeID` reaches the DOM as `id` on web and as `data-nativeid` on some
 * versions, so both are asked for — the same defensiveness every harness here
 * needs and for the same reason (§21: selecting on one attribute finds half of
 * what you are looking for).
 *
 * EVERY FIGURE IS RETURNED, AND THE CALLER PICKS ONE ONCE.
 *
 * The first draft took the WIDEST, on the reasoning that the lead is the biggest
 * thing on the stage. `Visitor` parks his man OFF-STAGE at x −60 for the whole
 * lesson rather than fading him in, so two figures are mounted from beat 0 in the
 * 24 lessons that have one — and the widest of the two flips as the walking one's
 * arms swing. `logic-arguments-19` duly reported 283px of drift on a beat where
 * nothing had moved: the centre had jumped between two different men. The caller
 * chooses the figure nearest the bubble ONCE and follows that index, which is
 * stable because the page is never reloaded between samples.
 */
const SAMPLE = `(()=>{
  const b = document.querySelector('#thought-lead') || document.querySelector('[data-nativeid="thought-lead"]');
  const bx = document.querySelector('#thought-lead-box') || document.querySelector('[data-nativeid="thought-lead-box"]');
  let bub = null;
  if (b && bx) {
    const r = b.getBoundingClientRect();
    if (r.width > 0.5) {
      bub = {
        x: +(r.x + r.width / 2).toFixed(2),
        op: +(getComputedStyle(bx).opacity || 0),
        text: (b.innerText || '').replace(/\\s+/g, ' ').trim(),
      };
    }
  }
  const figs = document.querySelectorAll('[data-testid="figure"]');
  const fxs = [];
  for (const f of figs) {
    let x0 = Infinity; let x1 = -Infinity;
    for (const el of f.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width < 0.5 || r.height < 0.5) continue;
      if (r.x < x0) x0 = r.x;
      if (r.x + r.width > x1) x1 = r.x + r.width;
    }
    fxs.push(x1 > x0 ? +((x0 + x1) / 2).toFixed(2) : null);
  }
  return { bub, fxs };
})()`;

/** Was the box readable in this sample? Below this it is arriving or leaving. */
const VISIBLE = 0.35;

async function watch(tab, id) {
  const { evalJs } = tab;
  await tab.send('Page.navigate', { url: 'about:blank' });
  await new Promise((r) => setTimeout(r, 120));
  await tab.send('Page.navigate', { url: `http://localhost:${WEB}/${SLUG}?id=${id}&notour=1` });
  for (let k = 0; k < STAGE_TRIES; k++) {
    if (await evalJs(`!!${STAGE}`)) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!await evalJs(`!!${STAGE}`)) return { id, skip: 'never rendered a stage', threw: true };

  const cuts = [];
  let blind = 0;
  let teleport = 0;
  let kept = 1;
  let keptAt = '';
  let seen = 0;
  let beats = 0;

  for (let b = 0; b < 12; b++) {
    const samples = [];
    for (let t = 0; t < WATCH_MS; t += STEP_MS) {
      const s = await evalJs(SAMPLE);
      if (s) samples.push({ ...s, t: Date.now() });
      await new Promise((r) => setTimeout(r, STEP_MS));
    }
    beats += 1;

    // ── CUT · the words changing where they can be read ─────────────────────
    //
    // ONLY A PAIR TAKEN CLOSE TOGETHER CAN SAY ANYTHING. A swap is invisible for
    // about 620ms — 200 of fade-out and then the wait before the new words go up
    // — so two samples further apart than that can straddle the whole transition
    // and show opacity 1 on both sides with different words in them. Run across
    // two lanes on a busy machine this reported `logic-arguments-37` as cutting
    // its sentence in half; traced frame by frame the swap happens at opacity
    // 0.00, and on one lane the same run is clean. An instrument that cannot
    // repeat itself cannot judge anything (§21), so a pair that took too long is
    // BLIND rather than clean, and blind pairs are counted and reported.
    for (let k = 1; k < samples.length; k++) {
      const p = samples[k - 1];
      const n = samples[k];
      if (!p.bub || !n.bub) continue;
      if (p.bub.text === n.bub.text) continue;
      if (p.bub.op <= VISIBLE || n.bub.op <= VISIBLE) continue;
      if (n.t - p.t > PAIR_MS) { blind += 1; continue; }
      const near = samples.slice(Math.max(0, k - 4), k + 4)
        .map((z) => `${z.t - samples[0].t}ms op ${z.bub ? z.bub.op.toFixed(2) : '--'} "${z.bub ? z.bub.text.slice(0, 18) : ''}"`)
        .join(' | ');
      cuts.push(`beat ${b}: "${p.bub.text.slice(0, 24)}" -> "${n.bub.text.slice(0, 24)}" at opacity ${n.bub.op.toFixed(2)}, ${n.t - p.t}ms apart
            ${near}`);
    }

    // WHICH OF THE FIGURES THIS BUBBLE BELONGS TO, decided once and then held.
    // The nearest one when the box first becomes readable: `Visitor` parks a
    // second man off-stage at −60 for the whole lesson, and any per-sample choice
    // flips between the two and invents a walk nobody took.
    const readable = samples.filter((s) => s.bub && s.bub.op > VISIBLE);
    let lead = -1;
    if (readable.length) {
      const f = readable[0];
      let near = Infinity;
      for (let k = 0; k < f.fxs.length; k++) {
        if (f.fxs[k] === null) continue;
        const d = Math.abs(f.fxs[k] - f.bub.x);
        if (d < near) { near = d; lead = k; }
      }
    }
    const fxOf = (s) => (lead >= 0 && s.fxs && s.fxs[lead] !== undefined ? s.fxs[lead] : null);

    // ── TELEPORT · the box moving while the man does not ────────────────────
    for (let k = 1; k < samples.length; k++) {
      const p = samples[k - 1];
      const n = samples[k];
      const pf = fxOf(p);
      const nf = fxOf(n);
      if (!p.bub || !n.bub || pf === null || nf === null) continue;
      if (p.bub.op <= VISIBLE || n.bub.op <= VISIBLE) continue;
      if (n.t - p.t > PAIR_MS) { blind += 1; continue; }
      if (Math.abs(nf - pf) > 1.5) continue;
      teleport = Math.max(teleport, Math.abs(n.bub.x - p.bub.x));
    }

    // ── ADRIFT · what each of them did over the window they share ───────────
    //
    // Both ends taken from samples where the box is READABLE, so a box that is
    // still fading in is not asked to have kept up with anything.
    const vis = readable.filter((s) => fxOf(s) !== null);
    if (vis.length >= 2) {
      seen += 1;
      const first = vis[0];
      const last = vis[vis.length - 1];
      const walked = Math.abs(fxOf(last) - fxOf(first));
      if (walked > REAL_WALK) {
        const moved = Math.abs(last.bub.x - first.bub.x);
        const share = moved / walked;
        if (share < kept) { kept = share; keptAt = `beat ${b}: he moved ${walked.toFixed(0)}px, the box ${moved.toFixed(0)}px`; }
      }
    }

    if (!await evalJs(TAP_ADVANCE)) break;
    await new Promise((r) => setTimeout(r, 260));
  }

  return {
    id,
    beats,
    seen,
    cuts,
    blind,
    teleport: +teleport.toFixed(1),
    kept,
    keptAt,
  };
}

// THE DEFAULT WORKLIST, chosen rather than sampled: the lessons whose figure
// walks FURTHEST on a beat that carries a thought (so ADRIFT has something to
// measure), plus two whose thoughts run back to back on consecutive beats (so CUT
// does). Pass a JSON file of ids to look at anything else.
const DEFAULT = [
  'metaphysics-being-35',      // 202 units, the longest walk in the corpus under a thought
  'ethics-ethics-17',          // 136
  'metaphysics-being-19',      // 136
  'logic-arguments-21',        // 136
  'epistemology-knowledge-24', // 136
  'logic-arguments-17',        // 136
  'epistemology-knowledge-19', // 136
  'logic-arguments-19',        // 136
  'logic-arguments-8',         // 96, and twice
  'aesthetics-aesthetics-8',   // 80
  'logic-arguments-37',        // thoughts on consecutive beats, for CUT
  'logic-arguments-38',        // and a recent one, for CUT
];

const ROUTE_SRC = `// WRITTEN BY scripts/check-bubble.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { setToursOff } from '@/components/lesson/cinematic/tourFlag';

export default function PreviewBubble() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    useUserDataStore.setState({ _hasHydrated: true } as any);
    useUIStore.setState({ launchDone: true } as any);
    setGo(true);
  }, []);
  const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  setToursOff(q?.get('notour') === '1');
  const id = q?.get('id') ?? '';
  const found = getLessonById(id);
  const Comp = (CINEMATIC as Record<string, any>)[id];
  if (!go || !found || !Comp) return <View style={{ flex: 1, backgroundColor: '#FAFAF7' }} />;
  return <Comp lesson={found.lesson} />;
}
`;

(async () => {
  const ids = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : DEFAULT;
  const { release } = claimRoute({ route: ROUTE, src: ROUTE_SRC, owner: 'check-bubble' });

  console.log(`\nTHE THOUGHT BUBBLE, IN THE RENDER\n`);
  console.log(`  ${ids.length} lesson(s), ${WATCH_MS}ms a beat\n`);

  const results = [];
  let next = 0; let done = 0;
  try {
    await Promise.all(Array.from({ length: Math.min(LANES, ids.length) }, async () => {
      for (;;) {
        const k = next++;
        if (k >= ids.length) return;
        let r; let tab = null;
        try { tab = await makeTab(); r = await watch(tab, ids[k]); }
        catch (e) { r = { id: ids[k], skip: 'threw: ' + String(e).slice(0, 70), threw: true }; }
        finally { if (tab) { try { await tab.close(); } catch { /* gone */ } } }
        results.push(r); done += 1;
        const tag = r.skip
          ? r.skip
          : `${String(r.seen).padStart(2)} beat(s) with a readable box · cuts ${String(r.cuts.length).padStart(2)} · teleport ${String(r.teleport).padStart(6)}px · kept ${String(r.kept === 1 ? '  n/a' : `${(r.kept * 100).toFixed(0)}%`).padStart(5)} of his walk`;
        console.log(`  ${String(done).padStart(3)}/${ids.length}  ${r.id.padEnd(28)} ${tag}`);
      }
    }));
  } finally {
    release();
  }

  const judged = results.filter((r) => !r.skip);
  const unmeasured = results.filter((r) => r.threw);
  const cut = judged.filter((r) => r.cuts.length > FLOORS.cut);
  const tele = judged.filter((r) => r.teleport > FLOORS.teleport);
  const ad = judged.filter((r) => r.kept < FLOORS.keep);
  const boxesSeen = judged.reduce((a, r) => a + r.seen, 0);
  const blindPairs = judged.reduce((a, r) => a + (r.blind || 0), 0);

  console.log('');
  let bad = 0;
  const ok = (m, d) => console.log(`  ok    ${m}${d ? `  ${d}` : ''}`);
  const no = (m, d) => { bad += 1; console.log(`  FAIL  ${m}${d ? `  ${d}` : ''}`); };

  if (!boxesSeen) {
    // A SWEEP THAT MEASURED NOTHING MUST NOT LOOK CLEAN. `check:readable` shipped
    // that exact failure: a probe that threw read as a lesson that had finished,
    // and 186 lessons came back with no findings and exit 0.
    no('no readable bubble was seen at all', 'the probe measured nothing — check the ids and the route');
  } else {
    ok(`${boxesSeen} beat(s) showed a readable box`, `across ${judged.length} lesson(s)`);
  }

  if (cut.length) {
    no(`${cut.length} lesson(s) change the sentence in front of the reader`, `budget ${FLOORS.cut}`);
    for (const r of cut.slice(0, 4)) for (const c of r.cuts.slice(0, 2)) console.log(`          ${r.id}  ${c}`);
  } else ok('no bubble swaps its words while it can be read');

  if (tele.length) {
    no(`${tele.length} lesson(s) jump the box while the figure stands still`, `worst ${Math.max(...tele.map((r) => r.teleport))}px, budget ${FLOORS.teleport}px`);
    for (const r of tele.slice(0, 4)) console.log(`          ${r.id}  ${r.teleport}px`);
  } else ok(`no box moves while the figure does not`, `budget ${FLOORS.teleport}px`);

  const walkers = judged.filter((r) => r.kept < 1);
  if (ad.length) {
    no(`${ad.length} lesson(s) leave the bubble standing while he walks`, `worst ${(Math.min(...ad.map((r) => r.kept)) * 100).toFixed(0)}% of his travel, floor ${(FLOORS.keep * 100).toFixed(0)}%`);
    for (const r of ad.slice(0, 4)) console.log(`          ${r.id}  kept ${(r.kept * 100).toFixed(0)}% — ${r.keptAt}`);
  } else if (!walkers.length) {
    // NOT SILENTLY CLEAN. If no lesson in the list walked far enough while a box
    // was readable, this rule judged nothing and must say so rather than pass.
    no('no lesson walked far enough to test the follow', 'add one whose figure crosses the stage under a thought');
  } else {
    ok(`every visible bubble travels with the figure`, `worst kept ${(Math.min(...walkers.map((r) => r.kept)) * 100).toFixed(0)}% of his walk, floor ${(FLOORS.keep * 100).toFixed(0)}%`);
  }

  if (blindPairs) {
    // Said out loud rather than swallowed: these are the moments the run could
    // not see, and a busy machine makes more of them. Nothing FAILS on them, but
    // a sweep reporting hundreds is a sweep to re-run with fewer lanes.
    console.log(`
  ~ ${blindPairs} sample pair(s) were too far apart to judge — re-run with LANES=1 if that number is large.`);
  }

  if (unmeasured.length) {
    console.log(`\n  ~ ${unmeasured.length} lesson(s) could not be measured:`);
    for (const r of unmeasured) console.log(`      ${r.id}: ${r.skip}`);
  }

  console.log(bad ? `\n${bad} rule(s) broken.\n` : '\nthe bubble follows him, and never changes its mind where it shows.\n');
  process.exit(bad ? 1 : 0);
})();
