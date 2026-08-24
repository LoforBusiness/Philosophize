// IS THE FIGURE ACTUALLY HOLDING IT?
//
// A reader on The Puzzle of Equality: "the stickman carries an object, it doesnt
// look good, his arms arent out, the object is just floating and it just disapears
// all the suddon." Three complaints, one cause, and interact.ts had written it
// down before any of these scenes existed — `pose()` never exposes a joint, so a
// scene drawing a box in someone's hands has no way to ask where the hands ARE.
// It hard-codes a rectangle at a position that looked right once.
//
// WHAT THIS MEASURES. Per beat, every element that OVERLAPS the figure's own body
// box — which is what a carried object does and what a background prop does not —
// against the two fists, which now carry a testID for this purpose.
//
//   FLOAT  it is drawn on the figure but no nearer to either hand than a hand can
//          reach. That is an object the figure is standing behind, not holding.
//   POP    it is there on one beat and gone on the next while still overlapping
//          him. A held object moves to somewhere; it does not stop existing.
//
// Element identity across beats is stamped on the node itself, which survives
// because the page is never reloaded between beats.
//
// USAGE — Metro and a headless Chrome, on the same ports check-cover uses:
//   npx expo start --web --port 8852 --clear
//   chrome --headless=new --remote-debugging-port=9392 --user-data-dir=<tmp>
//   node scripts/check-hold.mjs                     # every cinematic lesson
//   node scripts/check-hold.mjs ids.json out.json   # a chosen list
import http from 'node:http';
import fs from 'node:fs';
import { claimRoute } from './lib/previewroute.mjs';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

const PORT = +(process.env.CDP_PORT || 9392);
const WEB = +(process.env.WEB_PORT || 8852);
const BASE = `http://localhost:${WEB}/previewhold`;

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const BEATS_BLOCK = /BEATS[^=]*=\s*\[([\s\S]*)\n\];/;
const BEAT_SPLIT = /\n\s{2}\},?\s*\n?/;

// ── the probe ────────────────────────────────────────────────────────────────
const PROBE = `(() => {
  const clipEl = document.getElementById('stage-clip');
  if (!clipEl) return JSON.stringify({ none: true });

  // Hit testing skips pointer-events:none, which most scene art sets; without this
  // the paint-order question below is answered about the wrong elements. Removed
  // in the finally, or the next tap lands on decoration instead of the player.
  const shim = document.createElement('style');
  shim.textContent = '*{pointer-events:auto !important}';
  document.head.appendChild(shim);
  try {

  const chainAlpha = (el) => {
    let a = 1, n = el;
    while (n && n !== document.body) { a *= +getComputedStyle(n).opacity; n = n.parentElement; }
    return a;
  };
  const SOLID = 0.5;
  const alphaOf = (c) => {
    if (!c || c === 'transparent') return 0;
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return 1;
    const p = m[1].split(',').map((x) => parseFloat(x));
    return p.length > 3 ? p[3] : 1;
  };

  // THE FIGURES, and every node that belongs to one. A limb is not a prop.
  const figs = [...clipEl.querySelectorAll('[data-testid="figure"]')];
  if (!figs.length) return JSON.stringify({ nofig: true });
  const mine = new Set();
  const bodies = [];
  for (const f of figs) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const part of f.querySelectorAll('*')) {
      mine.add(part);
      const q = part.getBoundingClientRect();
      if (q.width < 0.5 || q.height < 0.5) continue;
      x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y);
      x1 = Math.max(x1, q.x + q.width); y1 = Math.max(y1, q.y + q.height);
    }
    mine.add(f);
    if (x0 === Infinity) continue;
    const fists = [...f.querySelectorAll('[data-testid="fist-l"],[data-testid="fist-r"]')]
      .map((e) => { const q = e.getBoundingClientRect();
        return { x: q.x + q.width / 2, y: q.y + q.height / 2, r: Math.max(q.width, q.height) / 2 }; });
    // WHERE HIS FEET ARE, which is not the bottom of his box. An ankle joint is a
    // disc centred exactly on the ground line, so the box hangs half a joint below
    // it — and measuring the floor at the box bottom left political-8's crate,
    // sitting correctly on the ground, reported as floating.
    const ank = [...f.querySelectorAll('[data-testid="ankle-l"],[data-testid="ankle-r"]')]
      .map((e) => { const q = e.getBoundingClientRect(); return q.y + q.height / 2; });
    const floor = ank.length ? Math.max(...ank) : y1;
    bodies.push({ box: { x0, y0, x1, y1 }, fists, floor, alive: chainAlpha(f) });
  }

  // Distance from a rect to a point, 0 when the point is inside it.
  const gap = (r, p) => {
    const dx = Math.max(r.left - p.x, 0, p.x - r.right);
    const dy = Math.max(r.top - p.y, 0, p.y - r.bottom);
    return Math.hypot(dx, dy);
  };

  let seq = 0;
  const out = [];
  for (const d of clipEl.querySelectorAll('div,span')) {
    if (mine.has(d)) continue;
    if (d.children.length > 1) continue;              // containers, not objects
    const s = getComputedStyle(d);
    const painted = alphaOf(s.backgroundColor) > 0.12
      || (parseFloat(s.borderTopWidth) > 0.4 && alphaOf(s.borderTopColor) > 0.12);
    if (!painted) continue;
    const r = d.getBoundingClientRect();
    // Both dimensions, not just the area. A 82x5 bar overlapping the figure is a
    // shelf edge or a rule, not something anybody is carrying, and ethics-2 was
    // reported for exactly one.
    if (r.width < 8 || r.height < 8 || r.width > 320 || r.height > 320) continue;
    if (!d.__holdId) d.__holdId = 'p' + (++seq) + ':' + Math.round(r.width) + 'x' + Math.round(r.height);
    const vis = chainAlpha(d) >= SOLID && s.visibility !== 'hidden' && s.display !== 'none';
    // Which figure, if any, it is drawn among.
    let on = -1, best = 1e9, reach = 0;
    for (let k = 0; k < bodies.length; k++) {
      const b = bodies[k];
      if (b.alive < SOLID) continue;
      const ox = Math.min(r.right, b.box.x1) - Math.max(r.left, b.box.x0);
      const oy = Math.min(r.bottom, b.box.y1) - Math.max(r.top, b.box.y0);
      if (ox <= 0 || oy <= 0) continue;
      // Overlapping the body box at all is the entry ticket; how near a HAND it
      // gets is the verdict.
      for (const f of b.fists) {
        const g = gap(r, f);
        if (g < best) { best = g; on = k; reach = f.r; }
      }
    }
    if (on < 0) continue;
    // ── TWO THINGS THAT OVERLAP A FIGURE AND ARE NOT IN HIS HANDS ────────────
    //
    // Overlapping the body box was the whole entry ticket at first, and it flagged
    // six lessons in the first ten — a figure walking in FRONT of a chart overlaps
    // it, and so does every board, fence and panel he stands against. Per Part 3
    // that is a check that has told you nothing.
    //
    // A held object is small, and it is drawn ON him. Scenery is large, or behind.
    const b = bodies[on];
    const bodyArea = Math.max(1, (b.box.x1 - b.box.x0) * (b.box.y1 - b.box.y0));
    if (r.width * r.height > 0.40 * bodyArea) continue;       // scenery, not a prop
    // Painted in FRONT of him, asked of the browser rather than reasoned about:
    // at the point where the two overlap, does the prop come before any part of
    // the figure in the hit-test stack?
    const px = Math.max(r.left, b.box.x0) + (Math.min(r.right, b.box.x1) - Math.max(r.left, b.box.x0)) / 2;
    const py = Math.max(r.top, b.box.y0) + (Math.min(r.bottom, b.box.y1) - Math.max(r.top, b.box.y0)) / 2;
    const stack = document.elementsFromPoint(px, py);
    let inFront = false;
    for (const e of stack) {
      if (e === d || d.contains(e)) { inFront = true; break; }
      if (mine.has(e)) break;
    }
    if (!inFront) continue;                                   // he is standing in front of it
    // AND IT IS NOT ON THE FLOOR. An object he has SET DOWN sits at his feet: it
    // overlaps his body box, it is small, it is drawn in front of him, and it is
    // nowhere near his hands — which is every condition above, and correct.
    // The ground is where his feet are, so a prop whose underside is level with
    // the bottom of his body box is resting, not floating. political-8 flagged the
    // crate he had just put down until this existed.
    if (r.bottom >= b.floor - 4) continue;
    out.push({ id: d.__holdId, vis, gap: Math.round(best), reach: Math.round(reach) });
  }

  const bar = document.getElementById('beat-progress');
  let prog = -1;
  try {
    if (bar) { const tf = getComputedStyle(bar).transform; if (tf && tf !== 'none') prog = new DOMMatrixReadOnly(tf).a; }
  } catch (e) {}
  return JSON.stringify({ out, done: prog >= 0.999 });
  } finally { shim.remove(); }
})()`;

// How near a hand an object has to get before it counts as held, in fist radii.
// A fist is 5.5 rig units of radius and the reach past it is a couple more, so 3
// radii is generous — the point is to catch objects a whole body-width from any
// hand, not to police a two-pixel gap.
const REACH_R = 3;

/**
 * The verdict for one lesson, from the per-beat readings.
 *
 * FLOAT — drawn among the figure on some beat, and no nearer to either hand than
 *         REACH_R fist radii. He is standing behind it, not holding it.
 * POP   — on screen on one beat and gone the next (or the reverse) while still
 *         drawn among him. A held object goes somewhere; it does not stop being.
 */
function verdict(beats) {
  const seen = new Map();
  beats.forEach((b, k) => {
    for (const o of b.seen) {
      if (!seen.has(o.id)) seen.set(o.id, []);
      seen.get(o.id).push({ k, ...o });
    }
  });
  const out = [];
  for (const [id, rows] of seen) {
    const on = rows.filter((r) => r.vis);
    if (!on.length) continue;
    // ── IS THIS EVEN SOMETHING HE HOLDS? ──────────────────────────────────────
    //
    // Everything above only establishes that the element is small, drawn in front
    // of him, overlapping him and off the floor — which a SPEECH BUBBLE also is.
    // A bubble appears on one beat and is gone the next, entirely correctly, and
    // reporting that as an object popping out of his hands would bury the real
    // ones. So an element only qualifies if on at least one beat it is actually
    // IN a hand. Then the two questions are about a thing he demonstrably holds:
    // does it drift out of the grip, and does it stop existing.
    if (!on.some((r) => r.gap <= r.reach * REACH_R)) continue;
    const far = on.filter((r) => r.gap > r.reach * REACH_R);
    if (far.length) {
      const worst = far.reduce((a, r) => (r.gap > a.gap ? r : a));
      out.push({ id, how: 'FLOAT', beat: worst.k, gap: worst.gap, reach: worst.reach,
        beats: far.length });
    }
    // A pop is a visibility change between two ADJACENT measured beats. Anything
    // further apart is a prop that legitimately left the scene and came back.
    let pops = 0, at = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].k === rows[i - 1].k + 1 && rows[i].vis !== rows[i - 1].vis) {
        pops++; if (at < 0) at = rows[i].k;
      }
    }
    if (pops) out.push({ id, how: 'POP', beat: at, pops });
  }
  return out;
}

// ── the plant: an object drawn ON the figure, nowhere near his hands ─────────
const PLANT = `(() => {
  const clip = document.getElementById('stage-clip');
  const fig = clip && clip.querySelector('[data-testid="figure"]');
  if (!fig) return 0;
  // A FADED FIGURE IS NOT A FIGURE. The probe skips bodies below half opacity, so
  // planting on one is planting somewhere the probe is right not to look.
  let fa = 1, fn = fig;
  while (fn && fn !== document.body) { fa *= +getComputedStyle(fn).opacity; fn = fn.parentElement; }
  if (fa < 0.5) return 0;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of fig.querySelectorAll('*')) {
    const q = p.getBoundingClientRect();
    if (q.width < 0.5) continue;
    x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y);
    x1 = Math.max(x1, q.x + q.width); y1 = Math.max(y1, q.y + q.height);
  }
  if (x0 === Infinity) return 0;
  // AIMED AWAY FROM BOTH HANDS, not just placed on him. Dropped at a fixed corner
  // of the body box it landed beside a raised hand on 7 beats of 33 and was
  // correctly NOT reported — which reads as blindness and is not. The plant has to
  // be somewhere the figure demonstrably is not holding.
  const fists = [...fig.querySelectorAll('[data-testid="fist-l"],[data-testid="fist-r"]')]
    .map((e) => { const q = e.getBoundingClientRect();
      return { x: q.x + q.width / 2, y: q.y + q.height / 2 }; });
  if (!fists.length) return 0;
  const AT_HAND = (__BEAT__ % 2) === 0;
  let bx, by;
  if (AT_HAND) {
    // Centred on a fist, so the probe sees it as held on this beat.
    bx = fists[0].x - 17; by = fists[0].y - 10;
  } else {
    let bd = -1;
    for (const fx of [x0, (x0 + x1) / 2, x1 - 34]) {
      for (const fy of [y0, (y0 + y1) / 2, y1 - 20]) {
        let d = 1e9;
        for (const f of fists) d = Math.min(d, Math.hypot(fx + 17 - f.x, fy + 10 - f.y));
        if (d > bd) { bd = d; bx = fx; by = fy; }
      }
    }
  }
  const box = document.createElement('div');
  box.setAttribute('data-planted', '1');
  box.__holdId = 'PLANTED';                          // one identity across beats
  box.style.cssText = 'position:fixed;z-index:99999;background:#FAFAF7;border:2px solid #1A1A1A;'
    + 'left:' + bx + 'px;top:' + by + 'px;width:34px;height:20px';
  // AND IT ONLY COUNTS IF THE AIM WORKED. On a beat where the figure is small or
  // his arms are wide, every corner of his body box is within reach of a hand —
  // there is nowhere to put an unheld object on him, so not reporting one is
  // correct. Counting those as plants made the self-test accuse itself.
  const fistR = 5.5;
  let far = 1e9;
  for (const f of fists) far = Math.min(far, Math.hypot(bx + 17 - f.x, by + 10 - f.y));
  if (!AT_HAND && far <= fistR * 3 + 17) return 0;   // the adrift beat must be adrift
  // It also has to pass the probe's own size gate, or the probe is right to ignore
  // it and the self-test is accusing itself again.
  if (34 * 20 > 0.40 * Math.max(1, (x1 - x0) * (y1 - y0))) return 0;
  const ank = [...fig.querySelectorAll('[data-testid="ankle-l"],[data-testid="ankle-r"]')]
    .map((e) => { const q = e.getBoundingClientRect(); return q.y + q.height / 2; });
  const floor = ank.length ? Math.max(...ank) : y1;
  if (by + 20 >= floor - 4) return 0;                      // and not on the floor
  clip.appendChild(box);
  // AND THE PROBE MUST BE ABLE TO SEE IT AT ALL. The probe asks the browser which
  // element is in front at the overlap point, and a figure inside a transformed
  // parent can raise its own stacking context above a fixed-position div. On the
  // beats where that happens the plant is simply not plantable, and counting it
  // made the self-test report blindness that was its own.
  const px = Math.max(bx, x0) + (Math.min(bx + 34, x1) - Math.max(bx, x0)) / 2;
  const py = Math.max(by, y0) + (Math.min(by + 20, y1) - Math.max(by, y0)) / 2;
  // UNDER THE SAME SHIM THE PROBE USES, or the two ask the browser different
  // questions: hit testing skips pointer-events:none, most scene art sets it, and
  // the answer changes depending on whether the override is in place. One beat of
  // eighteen disagreed for exactly that reason.
  const shim = document.createElement('style');
  shim.textContent = '*{pointer-events:auto !important}';
  document.head.appendChild(shim);
  const top = document.elementsFromPoint(px, py)[0];
  shim.remove();
  if (top !== box) { box.remove(); return 0; }
  return AT_HAND ? 1 : 2;                            // 2 = a claim the probe must report
})()`;

const ROUTE = 'app/previewhold.tsx';
const ROUTE_SRC = `// WRITTEN BY scripts/check-hold.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

export default function PreviewHold() {
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

function allIds() {
  const src = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
  return [...src.matchAll(/^\s*'([a-z0-9-]+)':\s*\w+,/gm)].map((m) => m[1]);
}

(async () => {
  const ids = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : allIds();
  const outPath = process.argv[3] ?? null;
  // ONLY REMOVE WHAT THIS RUN CREATED. Deleting a route file that was already
  // there — because a sibling script or a previous run left one — invalidates
  // Metro's file map, and the next bundle answers `Requiring unknown module
  // "3175"` for a module that plainly exists. That cost a full --clear restart
  // and ninety seconds of rebundling to work out.
  const { release: cleanup } = claimRoute({ route: ROUTE, src: ROUTE_SRC, owner: 'check-hold' });

  const LANES = +(process.env.LANES || 6);
  const makeTab = async () => {
    const tab = await put('/json/new?about:blank');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let mid = 0; const pending = new Map();
    const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
    await new Promise((r) => { ws.onopen = r; });
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
    await send('Page.enable');
    await send('Runtime.enable');
    // Only the front tab of a headless window is laid out; the rest never fire
    // their ResizeObserver, so the player's onLayout never runs (measure-must).
    await send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {});
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

    const evaluate = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      return r?.result?.value;
    };
    // CDP's Input.dispatchMouseEvent does not advance a React Native Web
    // Pressable; only a synthetic click does (§21, and check-frame's note).
    const tap = () => evaluate(
      `(() => { const el = document.elementFromPoint(195, 700) || document.body;
        el.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; })()`,
    );
    const answerScene = () => evaluate(
      `(() => { const ring = document.querySelector('#target-ring');
        if (ring && ring.parentElement) { ring.parentElement.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
        const card = [...document.querySelectorAll('[role="button"]')].find((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 60 && r.height > 28;
        });
        if (card) { card.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
        return 0; })()`,
    );
    const answerDeck = () => evaluate(
      `(() => { const clip = document.getElementById('stage-clip');
        const below = clip ? clip.getBoundingClientRect().bottom : 0;
        const b = [...document.querySelectorAll('[role="button"],[tabindex]')].find((e) => {
          const r = e.getBoundingClientRect();
          return r.top > below && r.width > 150 && r.height >= 20 && r.height <= 90;
        });
        if (b) { b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
        return 0; })()`,
    );
    // Every analogue control — drag, lever, plot, split, field — has no button
    // anywhere on its beat, so a sweep without this stops there and reports the
    // beats it never reached as clean (§21). Shared, because four harnesses need
    // the same sequence and four copies is four places to forget.
    const answerDrag = () => evaluate(ANSWER_CONTROL);
    /**
     * WAIT FOR THE WHOLE FRAME TO STOP, not just the camera.
     *
     * check-frame settles on `#stage-cam`'s transform, which is right for its
     * question and wrong for this one. A beat change CROSS-FADES: the outgoing
     * label is still on screen at 30% opacity while the incoming one is already
     * drawn, and for those few hundred milliseconds two captions genuinely do sit
     * on top of each other. Measured mid-fade that is a covered word; measured a
     * moment later there is nothing there at all. The signature therefore includes
     * every stage element's opacity, quantised, so the sweep waits for the fade as
     * well as for the move — and it wants the same answer TWICE, because a value
     * caught at a turning point can repeat by coincidence.
     */
    const settle = async () => {
      let prev = null, same = 0;
      // BOUNDED. Several scenes run a permanent opacity loop, so the signature
      // never repeats and the wait would otherwise cost five seconds on every beat
      // of every lesson — which slows the sweep enough to break the advance
      // polling downstream. Twelve tries is enough for a 0.7–1.3s cross-fade.
      for (let i = 0; i < 12; i++) {
        const now = await evaluate(
          `(() => { const c = document.getElementById('stage-cam');
            const clip = document.getElementById('stage-clip');
            let sig = c ? getComputedStyle(c).transform : 'x';
            let n = 0, o = 0;
            if (clip) for (const e of clip.querySelectorAll('div,span')) {
              n++; o += Math.round((+getComputedStyle(e).opacity) * 25);
            }
            return sig + '|' + n + '|' + o; })()`,
        );
        if (now === prev) { if (++same >= 2) return; } else { same = 0; }
        prev = now;
        await wait(180);
      }
    };
    const stamp = () => evaluate(
      `(() => {
        const bar = document.getElementById('beat-progress');
        try {
          if (bar) { const tf = getComputedStyle(bar).transform; if (tf && tf !== 'none') return new DOMMatrixReadOnly(tf).a; }
        } catch (e) {}
        return -1;
      })()`,
    );
    return { send, evaluate, tap, answerScene, answerDeck, answerDrag, stamp, settle, close: () => { try { ws.close(); } catch {} } };
  };

  const report = [];
  let done = 0;
  const auditOne = async (T, id, first, nBeats) => {
    const { send, evaluate, tap, answerScene, answerDeck, answerDrag, stamp, settle } = T;
    await send('Page.navigate', { url: `${BASE}?id=${encodeURIComponent(id)}&notour=1` });
    let up = false;
    const patience = first ? 220 : 60;
    for (let i = 0; i < patience; i++) {
      if (await evaluate("!!document.getElementById('stage-clip')")) { up = true; break; }
      await wait(500);
    }
    if (!up) {
      report.push({ id, beats: [], stepped: 0, blank: true });
      console.log(`  ${String(++done).padStart(3)}/${ids.length}  ${id.padEnd(34)} NEVER RENDERED A STAGE`);
      return;
    }
    await wait(1200);

    const beats = [];
    let stepped = 0;
    let last = -1;
    let planted = 0, caught = 0;
    for (let b = 0; b < 14; b++) {
      await settle();
      // Counted PER BEAT, not per lesson. A beat with no suitable word on stage
      // plants nothing, and scoring those as misses made the self-test blame a
      // different lesson on every run — which is a broken instrument reporting a
      // broken instrument.
      // The plant alternates: IN a hand on even beats, adrift on odd ones, under
      // one stable id. That is the shape the verdict now looks for — an object he
      // holds at some point and loses hold of at another — so the counter-test
      // exercises the rule as written rather than an earlier version of it.
      const didPlant = process.env.SELFTEST ? await evaluate(PLANT.replace('__BEAT__', String(b))) : 0;

      const raw = await evaluate(PROBE);
      if (!raw) break;
      const got = JSON.parse(raw);
      if (got.none) break;
      // EVERY beat is kept, not only the dirty ones: a pop is a comparison
      // between two beats, so a beat with nothing wrong on it is data too.
      beats.push({ beat: b, seen: got.out || [] });
      if (didPlant === 2) planted++;                 // only the adrift beats are claims
      if (didPlant === 2 && (got.out || []).some((o) => o.id === 'PLANTED' && o.vis
          && o.gap > o.reach * REACH_R)) caught++;
      if (process.env.SELFTEST) {
        await evaluate("document.querySelectorAll('[data-planted]').forEach(e=>e.remove());1");
      }
      if (got.done) break;
      let moved = false;
      for (let attempt = 0; attempt < 4 && !moved; attempt++) {
        if (attempt === 1) { await answerScene(); await wait(700); }
        if (attempt === 2) { await answerDeck(); await wait(700); }
        if (attempt === 3) { await answerDrag(); await wait(700); }
        await tap();
        await wait(1700);
        for (let t = 0; t < 12 && !moved; t++) {
          const now = await stamp();
          const idx = now < 0 || !nBeats ? -1 : Math.round(now * nBeats) - 1;
          if (idx < 0 || idx > last) { last = idx; moved = true; break; }
          await wait(250);
        }
      }
      if (!moved) break;
      stepped++;
    }
    report.push({ id, beats, stepped, planted, caught });
    done++;
    const bad = verdict(beats);
    const note = stepped < 2 ? `ONLY ${stepped + 1} BEAT REACHED`
      : bad.length ? `${bad.map((x) => x.how).join(' ')}`
      : 'clear';
    console.log(`  ${String(done).padStart(3)}/${ids.length}  ${id.padEnd(34)} ${note}`);
  };

  const nBeatsOf = (() => {
    const src = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
    const comps = new Map([...src.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));
    const out = new Map();
    for (const [id, comp] of comps) {
      const base = comp.replace(/Lesson$/, '');
      const f = `components/lesson/cinematic/${base[0].toLowerCase()}${base.slice(1)}Script.ts`;
      if (!fs.existsSync(f)) continue;
      const body = fs.readFileSync(f, 'utf8').match(BEATS_BLOCK);
      if (!body) continue;
      out.set(id, body[1].split(BEAT_SPLIT).filter((c) => /\S/.test(c)).length);
    }
    return out;
  })();

  const queue = [...ids];
  const runLane = async (T) => {
    let laneFirst = true;
    for (;;) {
      const id = queue.shift();
      if (id === undefined) return;
      const first = laneFirst; laneFirst = false;
      try { await auditOne(T, id, first, nBeatsOf.get(id) ?? 0); }
      catch (e) { console.log(`  ${id.padEnd(34)} ERRORED: ${String(e).slice(0, 60)}`); done++; }
    }
  };
  const lanes = [];
  for (let i = 0; i < Math.min(LANES, ids.length); i++) lanes.push(await makeTab());
  console.log(`sweeping ${ids.length} lessons across ${lanes.length} tabs`);
  await Promise.all(lanes.map((T) => runLane(T)));

  // ONE RETRY FOR ANYTHING THAT DID NOT MOVE. Stepping is flaky under six lanes —
  // political-1 walked to its last beat on three runs and stalled on the fourth —
  // and a lesson that stalls contributes zero hits, which is indistinguishable
  // from a lesson that is clean. Retried alone, in a fresh tab, it almost always
  // completes; whatever still will not is named in the summary rather than
  // averaged into the result.
  const stalled = report.filter((r) => (r.stepped ?? 0) < 2).map((r) => r.id);
  if (stalled.length) {
    console.log(`
  retrying ${stalled.length} lesson(s) that stalled: ${stalled.join(', ')}`);
    for (const id of stalled) {
      const i = report.findIndex((r) => r.id === id);
      if (i >= 0) report.splice(i, 1);
      done--;
      try { await auditOne(lanes[0], id, false, nBeatsOf.get(id) ?? 0); }
      catch (e) { console.log(`  ${id.padEnd(34)} ERRORED ON RETRY`); }
    }
  }
  for (const T of lanes) T.close();

  console.log('\nHOLD AUDIT — is the figure actually holding it\n');
  const stuck = report.filter((r) => (r.stepped ?? 0) < 2);
  const totalBeats = report.reduce((a, r) => a + (r.stepped ?? 0) + 1, 0);
  console.log(`  ${report.length} lessons · ${totalBeats} beats actually reached`);
  // A SWEEP THAT DID NOT MOVE IS NOT A PASS — said before the result, because a
  // short sweep and a clean one are indistinguishable unless something counts.
  if (stuck.length) {
    console.log(`  ⚠ ${stuck.length} lesson(s) never got past their second beat — NOT audited:`);
    console.log(`      ${stuck.map((r) => r.id).join(', ')}`);
  }
  if (process.env.SELFTEST) {
    const P_ = report.reduce((a, r) => a + (r.planted || 0), 0);
    const C_ = report.reduce((a, r) => a + (r.caught || 0), 0);
    console.log(`\n  SELFTEST: an object was drawn on the figure, away from both hands, on ${P_} beats`);
    console.log(`            the probe reported ${C_} of them`);
    if (C_ < P_) {
      const missed = report.filter((r) => (r.caught || 0) < (r.planted || 0));
      console.log(`            THE CHECK IS BLIND on ${P_ - C_} beat(s): `
        + missed.map((r) => `${r.id} ${r.caught}/${r.planted}`).join(', '));
      cleanup();
      process.exit(1);
    }
    console.log('            it sees every one — the check can detect an unheld object.');
  }
  const found = report.map((r) => ({ id: r.id, bad: verdict(r.beats || []) })).filter((r) => r.bad.length);
  const nFloat = found.reduce((a, r) => a + r.bad.filter((x) => x.how === 'FLOAT').length, 0);
  const nPop = found.reduce((a, r) => a + r.bad.filter((x) => x.how === 'POP').length, 0);
  console.log(`  ${found.length} lessons with an object the figure is not holding properly`);
  console.log(`    FLOAT: ${nFloat}  drawn on him, further from either hand than an arm reaches`);
  console.log(`    POP  : ${nPop}  there one beat and gone the next, while still on him`);
  for (const r of found) {
    console.log(`\n  ${r.id}`);
    for (const x of r.bad.slice(0, 6)) {
      console.log(x.how === 'FLOAT'
        ? `      FLOAT  ${x.id} — ${x.gap}px from the nearest hand (reach ${x.reach * REACH_R}px), ${x.beats} beat(s), worst at beat ${x.beat}`
        : `      POP    ${x.id} — blinks ${x.pops}x, first at beat ${x.beat}`);
    }
  }

  if (outPath) fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  // ── THE RATCHET ────────────────────────────────────────────────────────────
  //
  // This sweep needs Metro and a browser, so it cannot live in `npm run check`
  // and nothing runs it on a schedule. A number nobody compares is a number that
  // drifts, so the count is written down and this refuses to let it grow. DOWN
  // ONLY — and when a lesson is fixed, lower the file in the same commit, exactly
  // as check-moves' head-debt budget works.
  //
  // A short sweep must never lower it: a lesson that stalled contributes zero
  // hits, which looks like a lesson that was cleaned. Hence the guard below.
  const BUDGET = 'scripts/hold-budget.json';
  if (!process.env.SELFTEST && !process.argv[2]) {
    const now = { lessons: found.length, occurrences: nFloat + nPop };
    const was = fs.existsSync(BUDGET) ? JSON.parse(fs.readFileSync(BUDGET, 'utf8')) : null;
    if (!was) {
      fs.writeFileSync(BUDGET, JSON.stringify({ ...now, stalled: stalled.length }, null, 2) + String.fromCharCode(10));
      console.log(`
  seeded ${BUDGET} at ${now.lessons} lessons / ${now.occurrences} occurrences`);
    } else if (stalled.length > (was.stalled ?? 0)) {
      console.log(`
  ${stalled.length} lesson(s) stalled against ${was.stalled ?? 0} last time —`);
      console.log('  the budget is NOT compared, because an unaudited lesson reports zero.');
    } else if (now.lessons > was.lessons || now.occurrences > was.occurrences) {
      console.log(`
  HOLD DEBT GREW: ${was.lessons}/${was.occurrences} → ${now.lessons}/${now.occurrences}`);
      console.log('  Something new is drawn on the figure that he is not holding (group P).');
      cleanup();
      process.exit(1);
    } else if (now.lessons < was.lessons || now.occurrences < was.occurrences) {
      console.log(`
  hold debt fell: ${was.lessons}/${was.occurrences} → ${now.lessons}/${now.occurrences}`);
      console.log(`  lower ${BUDGET} to match, in this commit.`);
    } else {
      console.log(`
  hold debt unchanged at ${now.lessons} lessons / ${now.occurrences} occurrences.`);
      console.log('  A budget line that still says the same number is not a pass, it is a debt.');
    }
  }
  cleanup();
  process.exit(0);
})();
