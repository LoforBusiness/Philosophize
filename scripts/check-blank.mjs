// IS THE THING THE READER IS ASKED TO TAP ACTUALLY THERE?
//
// > "there are three boxes on the right, and they're just blank boxes, and
// >  you're supposed to click on one of them … it's really confusing about what
// >  you're actually answering."
//
// `Target` draws a breathing ink ring on its own bounds, and that ring is the
// whole affordance: it is what says "these rectangles are the buttons". It is
// drawn with `StyleSheet.absoluteFill` on the PRESSABLE, so it is always the
// target's full size — and nothing anywhere checked that the target's full size
// had anything in it.
//
// Two ways it comes up empty, and the first is a layout collapse rather than a
// missing label:
//
//  · HOLLOW — the art is there and is SHORTER than the ring. `Target`'s reaction
//    wrapper used to be an auto-height flex child, so a child sizing itself with
//    `flex: 1` resolved against an indefinite main size and came out exactly as
//    tall as its own words. aesthetics14 shipped three verdict cards measuring
//    146x15 inside three rings measuring 146x47: a strip of words with two thirds
//    of a box of bare paper under it, all inside one outline. The wrapper carries
//    `flexGrow: 1` now (see Target.tsx), which fixes the cause; this is what
//    stops it coming back, here or anywhere else.
//
//  · BLANK — nothing is drawn in the ring at all. A hit box laid over art that
//    has moved, or a target whose label lives outside its own bounds.
//
// WHAT IS NOT A DEFECT, and both cost a false-positive class:
//
//  · A hit box over art drawn by a DIFFERENT part of the scene. That is the
//    commonest shape in the corpus (see AnswerLift's note) and it is correct —
//    the ring frames the card, the plate, the chip. So paint is counted from
//    ANYWHERE in the document, not from the target's own subtree.
//  · A big tinted panel the target happens to sit on. A ground the size of the
//    stage does not label anything, so anything more than LARGE_MULT times the
//    target's own area is scenery, not content.
//
// USAGE — needs the web bundle and a headless Chrome:
//   npx expo start --web --port 8869 --clear
//   curl -s -o /dev/null "http://localhost:8869/index.bundle?platform=web&dev=true"
//   chrome --headless=new --remote-debugging-port=9399 --user-data-dir=<tmp>
//   node scripts/check-blank.mjs                     # every cinematic lesson
//   node scripts/check-blank.mjs ids.json out.json   # a chosen list
//
// It writes app/previewblank.tsx on the way in and DELETES it on the way out —
// any file in app/ is a real route and would ship if left behind (§21).
import http from 'node:http';
import fs from 'node:fs';
import { claimRoute } from './lib/previewroute.mjs';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

const PORT = +(process.env.CDP_PORT || 9399);
const WEB = +(process.env.WEB_PORT || 8869);
const ROUTE_NAME = process.env.BLANK_ROUTE || 'previewblank';
const BASE = `http://localhost:${WEB}/${ROUTE_NAME}`;

/** Below this share of its own ring painted, a target is not really drawn. */
const HOLLOW = 0.40;
/** And with no word in it either, it is bare paper in an outline. */
const BLANK = 0.12;
/** Anything this many times the target's area is scenery, not the target. */
const LARGE_MULT = 6;
/**
 * HOW MANY WORDS THE ANSWER IS STILL ALLOWED TO BURY. A high-water mark, like
 * CARD_BUDGET — it may only go DOWN.
 *
 * Eleven, in ten lessons, and they are all one shape: a stack of answer targets
 * packed tighter than the reaction, whose winner rises ten units and swells six
 * percent into whatever is above it. Three of that class were fixed on sight
 * because the buried thing was a whole instruction sliced in half; these eleven
 * are smaller — a chevron, a percentage, a numeral — and each one needs a person
 * to decide, because the metric cannot tell a covered label from a card the
 * lesson MEANT to slide over it (logic5 posts the proof into the chute the reader
 * chose, and covering that chute's name is arguably the mechanic).
 *
 * So this does not fail the build. It stops the number growing.
 */
const BURY_BUDGET = 11;

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── the probe ────────────────────────────────────────────────────────────────
//
// Runs in the page. For every mounted Target it returns the ring's box and how
// much of that box anything actually paints.
const PROBE = `(() => {
  const LARGE_MULT = ${LARGE_MULT};
  const clip = document.getElementById('stage-clip');
  if (!clip) return JSON.stringify({ none: 1 });

  // getBoundingClientRect() DOES NOT KNOW ABOUT overflow:hidden, so every rect
  // has to be intersected with each clipping ancestor or a scene's floor reports
  // a box running out into the deck (§21).
  const clipped = (el) => {
    let r = el.getBoundingClientRect();
    let box = { l: r.left, t: r.top, r: r.right, b: r.bottom };
    for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.overflow === 'hidden' || s.overflowX === 'hidden' || s.overflowY === 'hidden') {
        const p = n.getBoundingClientRect();
        box.l = Math.max(box.l, p.left); box.t = Math.max(box.t, p.top);
        box.r = Math.min(box.r, p.right); box.b = Math.min(box.b, p.bottom);
      }
    }
    return box;
  };
  const area = (b) => Math.max(0, b.r - b.l) * Math.max(0, b.b - b.t);
  const meet = (a, b) => ({ l: Math.max(a.l, b.l), t: Math.max(a.t, b.t), r: Math.min(a.r, b.r), b: Math.min(a.b, b.b) });

  // ALPHA 0 IS FALSY. \`(c && c.a) || 1\` promoted every transparent background to
  // fully opaque, which is what made an unfilled bordered box read as a slab.
  const alpha = (css) => {
    if (!css || css === 'transparent' || css === 'none') return 0;
    const m = /rgba?\\(([^)]+)\\)/.exec(css);
    if (!m) return 1;
    const p = m[1].split(',').map((x) => parseFloat(x));
    return p.length > 3 ? p[3] : 1;
  };
  const seeThrough = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const o = parseFloat(getComputedStyle(n).opacity);
      if (!Number.isNaN(o) && o < 0.06) return true;
      if (getComputedStyle(n).visibility === 'hidden') return true;
    }
    return false;
  };

  // ONLY A TARGET THAT IS ACTUALLY OFFERING ITSELF. Two exclusions, both of which
  // reported real findings that were not defects on the first run:
  //   · opacity 0 — aesthetics14 mounts all three verdicts from beat 0 and fades
  //     two of them in later, so a probe that ignores opacity finds two empty
  //     boxes nobody can see.
  //   · aria-disabled — the house idiom disables a target on every beat but its
  //     own, so most are mounted all lesson and pressable once. A target that
  //     cannot be pressed draws no ring and is not a box the reader is asked to tap.
  const effOp = (el) => {
    let o = 1;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const v = parseFloat(getComputedStyle(n).opacity);
      if (!Number.isNaN(v)) o *= v;
    }
    return o;
  };
  // A RING IS A TARGET WHETHER OR NOT IT CAME WITH A PRESSABLE. TargetRing is
  // the ring on its own, for a scene whose target is already a Pressable it cannot
  // give up (a drag handle, a control with its own gesture) — so it has no
  // accessibilityRole, and a probe selecting on role alone cannot see it. Two
  // lessons came back "no scene targets" while drawing three rings each. This is
  // the same rule the four other harnesses learned one at a time: when a lesson
  // gains a new way to be answered, the checker gains one too.
  const byRole = [...document.querySelectorAll('[role="button"]')];
  const byRing = [...document.querySelectorAll('#target-ring')]
    .map((r) => r.parentElement)
    .filter((p) => p && !byRole.includes(p));
  const targets = [...byRole, ...byRing]
    .filter((p) => p.getAttribute('aria-disabled') !== 'true' && effOp(p) > 0.06)
    .map((p) => ({ el: p, box: clipped(p) }))
    // The header's close button and anything outside the stage.
    .filter((t) => {
      const c = clip.getBoundingClientRect();
      return t.box.t >= c.top - 1 && t.box.b <= c.bottom + 1 && area(t.box) > 40;
    });
  // IS A QUESTION OPEN? Used by the caller to tell "this beat has no targets"
  // from "this beat's targets have not been enabled yet" — under four lanes on a
  // busy machine the two are indistinguishable in a single read, and five lessons
  // came back with every beat measured and no live target ever seen.
  const asking = !!document.getElementById('beat-question')
    || /Choose an answer/i.test(document.body.innerText || '');
  if (!targets.length) return JSON.stringify({ out: [], n: 0, asking });

  const all = [...document.querySelectorAll('div,span,img,svg,p')];

  const out = targets.map((t) => {
    const A = area(t.box);
    const words = [];
    // The painted rectangles inside this ring, as a coverage grid rather than a
    // union box: two thin strips at opposite ends of a tall box have a union of
    // the whole box and cover almost none of it.
    const GX = 24, GY = 24;
    const grid = new Uint8Array(GX * GY);
    const mark = (b) => {
      const x0 = Math.max(0, Math.floor((b.l - t.box.l) / (t.box.r - t.box.l) * GX));
      const x1 = Math.min(GX, Math.ceil((b.r - t.box.l) / (t.box.r - t.box.l) * GX));
      const y0 = Math.max(0, Math.floor((b.t - t.box.t) / (t.box.b - t.box.t) * GY));
      const y1 = Math.min(GY, Math.ceil((b.b - t.box.t) / (t.box.b - t.box.t) * GY));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) grid[y * GX + x] = 1;
    };

    for (const el of all) {
      if (el.id === 'target-ring') continue;                 // the suspect itself
      if (el.contains(t.el) && el !== t.el) {
        // An ancestor. It only counts if it is close to the target's own size —
        // a stage-sized ground paints nothing about this button.
        const ab = clipped(el);
        if (area(ab) > A * LARGE_MULT) continue;
      }
      if (seeThrough(el)) continue;
      const b = meet(t.box, clipped(el));
      if (area(b) <= 0) continue;
      if (area(clipped(el)) > A * LARGE_MULT) continue;      // scenery, not content
      const s = getComputedStyle(el);
      const bg = alpha(s.backgroundColor) > 0.06;
      const bd = ['Top', 'Right', 'Bottom', 'Left'].some((k) =>
        parseFloat(s['border' + k + 'Width']) > 0.4 && alpha(s['border' + k + 'Color']) > 0.06);
      const leaf = !el.children.length && (el.textContent || '').trim().length > 0;
      if (leaf) {
        // A WORD ONLY COUNTS IF IT CAN BE SEEN. A caption cross-fading out is
        // still in the tree at opacity 0.03 and is not a label.
        words.push((el.textContent || '').trim().slice(0, 40));
        mark(b);
        continue;
      }
      if (bg || bd) mark(b);
    }
    let on = 0;
    for (let i = 0; i < grid.length; i++) on += grid[i];
    return {
      box: [Math.round(t.box.l), Math.round(t.box.t), Math.round(t.box.r - t.box.l), Math.round(t.box.b - t.box.t)],
      cover: on / (GX * GY),
      words,
    };
  });
  return JSON.stringify({ out, n: out.length, asking });
})()`;

// ── the second measurement: what the ANSWER cuts ─────────────────────────────
//
// S11's band rule was written from one lesson and had no instrument. A column and
// its heading rise ten units together when the reader picks one, and a scale of
// 1.06 grows a box about its own centre — so the topmost ink a beat can draw is
// not the ink in its resting pose, and a band measured against the still picture
// has never seen its own reaction. aesthetics21 had six units of headroom against
// a ten-unit lift, and the word A PAINTING lost its top to the crop at the exact
// moment the reader got it right.
//
// check:frame cannot see this: it probes at the START of each beat and answers
// only to advance, so the one frame where the reaction is on screen is never
// measured. This reads every word twice — before the answer and after it — and
// reports only what the ANSWER took away, which makes it immune to whatever
// framing debt the lesson already carries.
const CUT_PROBE = `(() => {
  const clip = document.getElementById('stage-clip');
  if (!clip) return '[]';
  const c = clip.getBoundingClientRect();
  const out = [];
  for (const el of document.querySelectorAll('div,span')) {
    if (el.children.length) continue;
    const t = (el.textContent || '').trim();
    if (!t) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.bottom < c.top || r.top > c.bottom) continue;      // not on the stage
    let o = 1;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const v = parseFloat(getComputedStyle(n).opacity);
      if (!Number.isNaN(v)) o *= v;
    }
    if (o < 0.2) continue;                                    // mid-fade, not a word yet
    const vis = (Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top)) / r.height;

    // AND WHAT IS SITTING ON IT. A reaction can bury a word instead of pushing it
    // out of frame — that was the same lesson's FIRST defect, the column rising
    // into its own heading. check:readable owns "nothing may be drawn across a
    // word", but it reads at the START of a beat, before anything is answered, so
    // it is blind to a word that only gets covered by the reply.
    //
    // Counting opaque boxes over a word's centre is normally hopeless — it returns
    // the word's own grounds and every panel it sits on. Taking the reading TWICE
    // and diffing kills that class outright: every ancestor ground is in both
    // readings, so only what the ANSWER added survives.
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    let cov = 0;
    for (const b of document.querySelectorAll('div')) {
      if (b === el || b.contains(el)) continue;
      // PAINT ORDER, OR THE COUNT IS MEANINGLESS. A lifted card overlaps whatever
      // was under it, and those boxes are still UNDER it — logic3's winning card
      // rises across two premise plates, and its own title reported two coverers
      // while being white on black and perfectly legible. React Native stacks by
      // document order and these scenes use no z-index, so a box that PRECEDES the
      // word paints behind it and buries nothing.
      if (!(el.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
      // A WORD'S OWN PLATE IS NOT BURYING IT. The house builds a two-state label as
      // a plate and a Text that are SIBLINGS, not parent and child — the plate fills
      // ink on answer and the word turns to paper in the same frame. Ancestry cannot
      // see that relationship, so metaphysics7's NOW and aesthetics8's SHAPES both
      // reported themselves buried while being white on black and perfectly legible.
      // If the covering box's own text contains the word, it is the word's plate.
      if ((b.textContent || '').includes(t)) continue;
      const s = getComputedStyle(b);
      const m = /rgba?\\(([^)]+)\\)/.exec(s.backgroundColor || '');
      const a = m ? (m[1].split(',').length > 3 ? parseFloat(m[1].split(',')[3]) : 1) : 0;
      if (a < 0.5) continue;
      const q = b.getBoundingClientRect();
      if (cx >= q.left && cx <= q.right && cy >= q.top && cy <= q.bottom) cov += 1;
    }
    out.push([t.slice(0, 30), +vis.toFixed(3), cov]);
  }
  return JSON.stringify(out);
})()`;

const ROUTE = `app/${ROUTE_NAME}.tsx`;
const ROUTE_SRC = `// WRITTEN BY scripts/check-blank.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

export default function PreviewBlank() {
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
  const { release: cleanup } = claimRoute({
    route: ROUTE, src: ROUTE_SRC, owner: 'check-blank', keep: !!process.env.BLANK_KEEP,
  });

  const LANES = +(process.env.LANES || 6);
  const WebSocket = (await import('ws')).default;

  const makeTab = async () => {
    const tab = await put('/json/new?about:blank');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    let mid = 0; const pending = new Map();
    const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
    await new Promise((r) => { ws.onopen = r; });
    ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
    await send('Page.enable');
    await send('Runtime.enable');
    // Only the front tab of a headless window is laid out; a background tab never
    // fires its ResizeObserver, so the player's onLayout never runs.
    await send('Emulation.setFocusEmulationEnabled', { enabled: true });
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    const evaluate = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r?.exceptionDetails) return { THREW: String(r.exceptionDetails.exception?.description || '').slice(0, 200) };
      return r?.result?.value;
    };
    const tap = () => evaluate(
      `(() => { const el = document.elementFromPoint(195, 700) || document.body;
        el.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; })()`,
    );
    const answerScene = () => evaluate(
      `(() => { const ring = document.querySelector('#target-ring');
        if (ring && ring.parentElement) { ring.parentElement.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
        return 0; })()`,
    );
    const answerDeck = () => evaluate(
      `(() => { const clip = document.getElementById('stage-clip');
        const below = clip ? clip.getBoundingClientRect().bottom : 0;
        const b = [...document.querySelectorAll('[role="button"],[tabindex]')].find((e) => {
        if (e.getAttribute('data-testid') === 'thinker-name') return false;
          const r = e.getBoundingClientRect();
          return r.top > below && r.width > 150 && r.height >= 20 && r.height <= 90;
        });
        if (b) { b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
        return 0; })()`,
    );
    // The analogue controls have no button on the beat at all, so a harness that
    // only knows how to click measures a short sweep and calls it clean (§21).
    const answerCtl = () => evaluate(ANSWER_CONTROL);
    // SETTLE ON THE CAMERA ONLY.
    //
    // Adding the progress bar to this looked more correct — the beat index is read
    // off it — and is exactly wrong: the bar fills CONTINUOUSLY through a beat, so
    // it never stops, and settle burned its whole four-second budget on every beat
    // of every lesson. Two lessons that had just started passing went back to
    // failing. What the bar is good for is telling you a beat CHANGED, which is
    // what `stamp` uses it for; it can never tell you one has finished arriving.
    const settle = async () => {
      let prev = null;
      for (let i = 0; i < 20; i++) {
        const now = await evaluate(
          `(() => { const c = document.getElementById('stage-cam');
            return c ? getComputedStyle(c).transform : 'x'; })()`,
        );
        if (now === prev) return;
        prev = now;
        await wait(200);
      }
    };
    const stamp = () => evaluate(
      `(() => { const bar = document.getElementById('beat-progress');
        try { if (bar) { const tf = getComputedStyle(bar).transform; if (tf && tf !== 'none') return new DOMMatrixReadOnly(tf).a; } } catch (e) {}
        return -1; })()`,
    );
    return { send, evaluate, tap, answerScene, answerDeck, answerCtl, stamp, settle, close: () => { try { ws.close(); } catch {} } };
  };

  const report = [];
  let done = 0;
  const auditOne = async (T, id, first, nBeats, scenePicks) => {
    const { send, evaluate, tap, answerScene, answerDeck, answerCtl, stamp, settle } = T;
    await send('Page.navigate', { url: `${BASE}?id=${encodeURIComponent(id)}&notour=1` });
    let up = false;
    const patience = first ? +(process.env.STAGE_TRIES_FIRST || 240) : +(process.env.STAGE_TRIES || 80);
    for (let i = 0; i < patience; i++) {
      if (await evaluate("!!document.getElementById('stage-clip')")) { up = true; break; }
      await wait(500);
    }
    if (!up) {
      report.push({ id, hits: [], stepped: 0, dead: 'NEVER RENDERED A STAGE' });
      console.log(`  ${String(++done).padStart(3)}/${ids.length}  ${id.padEnd(34)} NEVER RENDERED A STAGE`);
      return;
    }
    await wait(1200);

    const hits = [];
    const cuts = [];
    let stepped = 0;
    let last = -1;
    let threw = null;
    let seen = 0;
    // THE BOUND IS A SAFETY STOP, NOT A SCHEDULE — and it used to be 14.
    //
    // Every loop here exits the moment the lesson says it is done, so a high bound
    // costs nothing; a low one silently truncates. J12's segmenting split took the
    // longest lessons from 11 beats to 19, and this fixed 14 promptly reported
    // THIRTEEN lessons as "measured fewer beats than they have" — all of them at
    // exactly 14, which is the tell. The content was fine; the instrument had a
    // ceiling the content had outgrown.
    //
    // 28 clears the longest lesson in the repo (argument, 26) with room to spare.
    for (let b = 0; b < 28; b++) {
      await settle();
      // THE BEAT INDEX COMES OFF THE PROGRESS BAR, NOT OFF THE LOOP COUNTER.
      // `b` counts probes, and the two drift the moment an advance is missed or
      // doubled — which is exactly what happens under lanes, and it is what made
      // the wait below fire on the wrong beat and three lessons come back
      // unaudited a second time. `stamp()` is the real index and the loop already
      // trusts it to decide that a beat moved.
      const at = nBeats ? Math.round((await stamp()) * nBeats) - 1 : -1;
      const beatNo = at >= 0 ? at : b;
      let raw = await evaluate(PROBE);
      // A BEAT THAT ASKS ON THE STAGE IS RE-READ UNTIL ITS TARGETS ARE LIVE.
      //
      // `settle` waits for the CAMERA, and the camera is not what mounts a target:
      // the beat index reaches the scene through React, so under four lanes on a
      // busy machine the probe fires first, sees three disabled boxes, and reports
      // nothing live. Five lessons came back with every beat stepped and no target
      // ever seen — which is exactly the shape of a lesson that has none.
      //
      // WHICH BEATS TO WAIT ON COMES FROM THE SCRIPT, not from the page. Reading
      // the page for "is a question open" needs a string that the deck happens to
      // print, and it was wrong on the one lesson left over. The script says it
      // outright: a beat with an `interact` block that is not a deck and not one of
      // the analogue controls asks on the stage.
      // THE PAGE'S OWN SIGNAL FIRST, because it needs no beat index. `stamp` reads
      // a bar that is mid-fill, so the index it returns is off by one often enough
      // to matter; whether the deck is asking for an answer is a fact about the
      // frame in front of you. The script's list is kept as a second opinion for
      // the one case the deck says nothing.
      let peek0;
      try { peek0 = raw && !raw.THREW ? JSON.parse(raw) : null; } catch { peek0 = null; }
      if (peek0 && !peek0.n && (peek0.asking || scenePicks.has(beatNo))) {
        for (let t = 0; t < 8; t += 1) {
          if (!raw || raw.THREW) break;
          let peek;
          try { peek = JSON.parse(raw); } catch { break; }
          if (peek.none || peek.n) break;
          await wait(600);
          raw = await evaluate(PROBE);
        }
      }
      // A PROBE THAT THREW IS A FINDING, NOT A FINISHED LESSON. `if (!a) break`
      // is how check-readable once reported a clean sweep of 186 lessons having
      // measured nothing at all (§21).
      if (raw && raw.THREW) { threw = raw.THREW; break; }
      if (!raw) break;
      const got = JSON.parse(raw);
      if (got.none) break;
      if (process.env.BLANK_DEBUG) console.log(`      [${id} beat ${beatNo}] ${got.n ?? 0} live target(s)`);
      seen += got.n || 0;
      // A BLANK IS CONFIRMED A SECOND LATER BEFORE IT IS BELIEVED.
      //
      // One read can land inside an entrance. ethics19's four rows grow in, and
      // the sweep caught one of them 9 units tall and 11% painted — reported as
      // hollow on a row that is perfectly drawn a moment later. Hollow is advisory
      // so a transient there costs nothing, but BLANK fails the build, and a
      // checker that goes red on a frame nobody sees is a checker people learn to
      // rerun until it passes. Only re-read when there is something to confirm.
      let out = got.out || [];
      if (out.some((t) => !t.words.length && t.cover < BLANK)) {
        await wait(1200);
        const again = await evaluate(PROBE);
        if (again && !again.THREW) {
          try {
            const g2 = JSON.parse(again);
            if (!g2.none && g2.out) {
              const by = new Map(g2.out.map((t) => [t.box.join(','), t]));
              // BOTH READINGS HAVE TO AGREE, and taking the later one is not the
              // same thing. A scene still arriving at both reads gives two low
              // numbers and the second was simply believed — which is how a busy
              // machine turned a corpus of 0 BLANK into 12, none of them real,
              // purely because a second measurement had been added to the same
              // sweep and slowed it down. The better of the two readings wins.
              out = out.map((t) => {
                const t2 = by.get(t.box.join(','));
                return t2 && t2.cover > t.cover ? t2 : t;
              });
            }
          } catch { /* keep the first reading */ }
        }
      }
      for (const t of out) {
        if (t.cover >= HOLLOW) continue;
        hits.push({
          beat: beatNo,
          kind: (!t.words.length && t.cover < BLANK) ? 'BLANK' : 'HOLLOW',
          cover: t.cover, box: t.box, words: t.words.slice(0, 3),
        });
      }
      // WHAT THE ANSWER CUTS. Only where there is a live scene target to answer.
      if (got.n) {
        const before = await evaluate(CUT_PROBE);
        await answerScene();
        await wait(1300);                        // the lift overshoots and settles
        const after = await evaluate(CUT_PROBE);
        if (before && after && !before.THREW && !after.THREW) {
          try {
            const b = new Map(JSON.parse(before).map(([t, vis, cov]) => [t, { vis, cov }]));
            for (const [t, vis, cov] of JSON.parse(after)) {
              const was = b.get(t);
              if (!was) continue;                 // arrived with the reveal
              if (was.vis > 0.98 && vis < 0.95) {
                cuts.push({ beat: beatNo, kind: 'CUT', text: t, was: +was.vis.toFixed(2), now: +vis.toFixed(2) });
              }
              if (cov > was.cov) {
                cuts.push({ beat: beatNo, kind: 'BURIED', text: t, was: was.cov, now: cov });
              }
            }
            // BLANK_SHOT=1 photographs the answered frame wherever this beat found
            // something, because a finding here has to be judged by LOOKING and
            // reproducing one beat by hand is fiddly — a harness that taps on the
            // stage instead of the deck lands on a different beat entirely.
            if (process.env.BLANK_SHOT && cuts.some((c) => c.beat === beatNo)) {
              try {
                fs.mkdirSync('scripts/.blank-shots', { recursive: true });
                const png = await send('Page.captureScreenshot', { format: 'png' });
                fs.writeFileSync(`scripts/.blank-shots/${id}-b${beatNo}.png`, Buffer.from(png.data, 'base64'));
              } catch { /* a shot is evidence, never a reason to fail the sweep */ }
            }
          } catch { /* unparseable reading — say nothing rather than guess */ }
        }
      }

      let moved = false;
      for (let attempt = 0; attempt < 4 && !moved; attempt++) {
        if (attempt === 1) { await answerScene(); await wait(700); }
        if (attempt === 2) { await answerDeck(); await wait(700); }
        if (attempt === 3) { await answerCtl(); await wait(700); }
        await tap();
        await wait(1500);
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
    report.push({ id, hits, cuts, stepped, seen, threw, nBeats });
    done++;
    const nB = hits.filter((h) => h.kind === 'BLANK').length;
    const nH = hits.filter((h) => h.kind === 'HOLLOW').length;
    const nCutHere = cuts.filter((c) => c.kind === 'CUT').length;
    const nBuryHere = cuts.length - nCutHere;
    const cutNote = cuts.length
      ? ` · ${[nCutHere && `${nCutHere} CUT`, nBuryHere && `${nBuryHere} BURIED`].filter(Boolean).join(' · ')} BY THE ANSWER`
      : '';
    const note = threw ? `PROBE THREW: ${threw}`
      : stepped < 2 ? `ONLY ${stepped + 1} BEAT REACHED`
      : !seen ? 'no scene targets'
      : (nB || nH) ? `${nB ? `${nB} BLANK · ` : ''}${nH ? `${nH} hollow` : ''}`.replace(/ · $/, '')
      : `${seen} targets, all drawn`;
    if (cutNote && !threw) console.log(`  ${String(done).padStart(3)}/${ids.length}  ${id.padEnd(34)} ${note}${cutNote}`);
    console.log(`  ${String(done).padStart(3)}/${ids.length}  ${id.padEnd(34)} ${note}`);
  };

  const BEATS_BLOCK = /export const BEATS[^=]*=\s*\[([\s\S]*)\n\];/;
  const BEAT_SPLIT = /\n {2}\{\n/;
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

  /** Which lessons draw scene targets at all, read off the scene source. A sweep
   *  that saw none in a lesson that HAS them measured nothing there. */
  const usesTarget = (() => {
    const src = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
    const comps = new Map([...src.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));
    const out = new Set();
    for (const [id, comp] of comps) {
      const base = comp.replace(/Lesson$/, '');
      for (const f of [`components/lesson/cinematic/${base[0].toLowerCase()}${base.slice(1)}Scene.tsx`,
                       `components/lesson/cinematic/${comp}.tsx`]) {
        if (!fs.existsSync(f)) continue;
        if (/from '\.\/Target'/.test(fs.readFileSync(f, 'utf8'))) out.add(id);
        break;
      }
    }
    return out;
  })();

  /**
   * Which beat indices ask their question ON THE STAGE, per lesson.
   *
   * A beat with an `interact` block that declares neither `cards` nor one of the
   * analogue controls is answered by tapping something in the picture — so it is
   * the one kind of beat where "no live target" is a finding rather than a fact,
   * and the one the probe is allowed to wait on.
   */
  const scenePicksOf = (() => {
    const src = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
    const comps = new Map([...src.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));
    const out = new Map();
    for (const [id, comp] of comps) {
      const base = comp.replace(/Lesson$/, '');
      const f = `components/lesson/cinematic/${base[0].toLowerCase()}${base.slice(1)}Script.ts`;
      if (!fs.existsSync(f)) continue;
      const body = fs.readFileSync(f, 'utf8').match(BEATS_BLOCK);
      if (!body) continue;
      const set = new Set();
      body[1].split(BEAT_SPLIT).filter((c) => /\S/.test(c)).forEach((chunk, k) => {
        if (!/interact\s*:/.test(chunk)) return;
        if (/(cards|drag|lever|plot|split|field)\s*:/.test(chunk)) return;
        set.add(k);
      });
      out.set(id, set);
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
      try { await auditOne(T, id, first, nBeatsOf.get(id) ?? 0, scenePicksOf.get(id) ?? new Set()); }
      catch (e) { console.log(`  ${id.padEnd(34)} ERRORED: ${String(e).slice(0, 60)}`); done++; }
    }
  };
  const lanes = [];
  for (let i = 0; i < Math.min(LANES, ids.length); i++) lanes.push(await makeTab());
  console.log(`auditing ${ids.length} lessons across ${lanes.length} tabs`);
  await Promise.all(lanes.map((T) => runLane(T)));
  for (const T of lanes) T.close();

  // THE DATA GOES TO DISK BEFORE ANY OF IT IS PRINTED. A summary that throws — one
  // undefined field on the one lesson that never rendered a stage was enough — takes
  // the whole sweep's findings with it, and by then the run has done all the work.
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log('\nBLANK-TARGET AUDIT — is the thing the reader taps actually drawn?\n');
  // SAID BEFORE THE RESULT. A sweep that never moved, or whose probe died, is not
  // a pass — and reads exactly like one.
  const dead = report.filter((r) => r.dead || r.threw);
  const stuck = report.filter((r) => !r.dead && !r.threw && (r.stepped ?? 0) < 2);
  const totalTargets = report.reduce((a, r) => a + (r.seen || 0), 0);
  console.log(`  ${report.length} lessons · ${totalTargets} target-beats measured`);
  if (dead.length) {
    console.log(`  ⚠ ${dead.length} lesson(s) were NOT audited (dead probe or no stage):`);
    for (const r of dead) console.log(`      ${r.id} — ${r.dead || r.threw}`);
  }
  if (stuck.length) {
    console.log(`  ⚠ ${stuck.length} lesson(s) never got past their second beat — NOT audited:`);
    console.log(`      ${stuck.map((r) => r.id).join(', ')}`);
  }
  // A SHORT SWEEP IS INDISTINGUISHABLE FROM A CLEAN ONE. Both of these were real:
  // under three lanes on a busy machine logic19 stopped before its graded beat and
  // printed "no scene targets", which reads exactly like a lesson that has none.
  const short = report.filter((r) => !r.dead && !r.threw && r.nBeats && (r.stepped ?? 0) + 1 < r.nBeats);
  if (short.length) {
    console.log(`  ⚠ ${short.length} lesson(s) stopped before their last beat — only PARTLY audited:`);
    for (const r of short.slice(0, 20)) console.log(`      ${r.id} — reached ${(r.stepped ?? 0) + 1} of ${r.nBeats}`);
  }
  const silent = report.filter((r) => !r.dead && !r.threw && usesTarget.has(r.id) && !r.seen);
  if (silent.length) {
    console.log(`  ⚠ ${silent.length} lesson(s) draw scene targets and the sweep saw NONE live — NOT audited:`);
    console.log(`      ${silent.map((r) => r.id).join(', ')}`);
  }
  const dirty = report.filter((r) => r.hits.length);
  const nB = report.reduce((a, r) => a + (r.hits || []).filter((h) => h.kind === 'BLANK').length, 0);
  const nH = report.reduce((a, r) => a + r.hits.filter((h) => h.kind === 'HOLLOW').length, 0);
  // WHAT THE ANSWER ITSELF CUT. Reported separately from the emptiness, because it
  // is a different rule (S11's band clause) and a different moment — the one frame
  // check:frame structurally cannot see.
  const cutRows = report.filter((r) => (r.cuts || []).length);
  const nCut = report.reduce((a, r) => a + (r.cuts || []).filter((c) => c.kind === 'CUT').length, 0);
  const nBury = report.reduce((a, r) => a + (r.cuts || []).filter((c) => c.kind === 'BURIED').length, 0);
  console.log(`  ${nCut} word(s) whole before the answer and CUT by the crop after it`
    + ' — the band has to hold the reaction, not just the resting pose');
  console.log(`  ${nBury} word(s) clear before the answer and BURIED by it`
    + ` — the reply may move the picture, not print over the words (budget ${BURY_BUDGET})`);
  if (nBury > BURY_BUDGET) {
    console.log(`  ⚠ that is ${nBury - BURY_BUDGET} MORE than the budget — a stack has been packed`);
    console.log('    tighter than the answer lift. Give it that much gap, or retire the line');
    console.log('    above it with useAnswerSpent if it is an instruction (S11).');
  }
  for (const r of cutRows) {
    for (const c of (r.cuts || []).slice(0, 4)) {
      console.log(`      ${r.id.padEnd(30)} beat ${c.beat}  ${c.kind}  "${c.text}"  ${c.was} → ${c.now}`);
    }
  }
  console.log(`  ${nB} BLANK  (an outline round bare paper — nothing drawn in it at all)`);
  console.log(`  ${nH} hollow (drawn, but filling under ${Math.round(HOLLOW * 100)}% of the ring the reader sees)`);
  for (const r of dirty) {
    console.log(`\n  ${r.id}`);
    const byBox = new Map();
    for (const h of r.hits) {
      const k = h.kind + ':' + h.box.join(',');
      if (!byBox.has(k)) byBox.set(k, h);
    }
    for (const h of [...byBox.values()].slice(0, 6)) {
      console.log(`      beat ${h.beat}  ${h.kind}  ${h.box[2]}x${h.box[3]} at ${h.box[0]},${h.box[1]}`
        + `  ${(h.cover * 100).toFixed(0)}% drawn`
        + (h.words.length ? `  "${h.words.join(' / ')}"` : '  (no word in it)'));
    }
  }
  cleanup();
  const failed = dead.length || short.length || silent.length || nB || nBury > BURY_BUDGET;
  process.exit(failed ? 1 : 0);
})();
