// IS ANYTHING SITTING ON TOP OF A WORD?
//
// D31 has said "nothing opaque may cover text" since ethics-6 sliced "THE FIVE"
// in half, and D31b added 4dp of clearance from a label's own border. Neither was
// ever measured across the app, and the two harnesses that do render every lesson
// measure the wrong relationship: check-frame compares each element to the CAMERA
// CROP, and measure-must compares the beat's boxes to the SHOT. Both are about the
// frame's edge. Nothing has ever compared one drawn element to another — so a rule
// line laid across a label box, which is the defect a reader actually hit, could
// not be caught by anything in the repo.
//
// WHAT IT MEASURES, and why it is the browser's answer rather than arithmetic.
//
// Overlapping rectangles are not the question. A <Text> is inside its own box, the
// box is inside a group, and half the scene is nested inside something it overlaps
// — rectangle intersection reports hundreds of those and means nothing. The
// question is PAINT ORDER: at the pixels where the glyphs are, is the topmost
// thing the word? `document.elementsFromPoint` answers exactly that, in true
// stacking order, including z-index and transforms, without this script having to
// model any of it.
//
// ONE VERDICT: an inked element painted ABOVE the glyphs. The word is behind it.
//
// A second verdict was tried and removed, and the reason is worth keeping. "The
// word is sitting on a line rather than on paper" sounds like the same defect from
// underneath, and measured as geometry it is — but geometry cannot tell a caption
// printed on a dark block, which is correct and everywhere, from a caption buried
// in one. epistemology-1 alone produced 38 hits of the form `"BELIEF" is on a
// 305x389 filled block, 100% of it`, every one of them a cream label on an ink
// panel doing exactly what it was drawn to do. The real question underneath is
// CONTRAST between the glyph colour and whatever it lands on, which is a different
// instrument; reporting geometry instead would have buried the eleven real hits in
// eighty-three correct ones.
//
// Hit testing normally skips `pointer-events: none`, and most scene decoration
// sets it — so the probe forces it back on for the duration and removes the
// override before returning. Without that the sweep is blind to precisely the
// elements most likely to be lying across something.
//
// USAGE — needs the web bundle and a headless Chrome. The ports default AWAY from
// check-frame's 8847/9382 so both can run at once:
//   npx expo start --web --port 8852 --clear
//   curl -s -o /dev/null "http://localhost:8852/index.bundle?platform=web&dev=true"
//   chrome --headless=new --remote-debugging-port=9392 --user-data-dir=<tmp>
//   node scripts/check-cover.mjs                     # every cinematic lesson
//   node scripts/check-cover.mjs ids.json out.json   # a chosen list
//
// It writes app/previewcover.tsx on the way in and DELETES it on the way out —
// any file in app/ is a real route and would ship if left behind (§21).
import http from 'node:http';
import fs from 'node:fs';

const PORT = +(process.env.CDP_PORT || 9392);
const WEB = +(process.env.WEB_PORT || 8852);
const BASE = `http://localhost:${WEB}/previewcover`;

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

  // HIT TESTING IGNORES pointer-events:none, AND MOST SCENE ART SETS IT.
  // Forced on for the measurement and removed again in the 'finally' below.
  //
  // THE 'finally' IS LOAD-BEARING. Without it, a probe that threw anywhere left
  // '*{pointer-events:auto}' on the page for good — and the very next tap then
  // landed on whatever decoration happened to be under (195, 700) instead of the
  // player's advance handler. The lesson stopped moving, the sweep reported "ONLY
  // 2 BEATS REACHED", and the beats it never saw were counted as clean. Three
  // lessons that had stepped to the end a run earlier died this way, which is how
  // it was noticed at all.
  const shim = document.createElement('style');
  shim.textContent = '*{pointer-events:auto !important}';
  document.head.appendChild(shim);
  try {

  /** Effective opacity, since a parent's fade hides its children too. */
  const chainAlpha = (el) => {
    let a = 1, n = el;
    while (n && n !== document.body) { a *= +getComputedStyle(n).opacity; n = n.parentElement; }
    return a;
  };
  // THE WHOLE CHAIN, NOT THE ELEMENT. A scene mounts every beat's labels and fades
  // the ones it is not showing — almost always by fading a PARENT — so a <Text>
  // with opacity 1 inside a group at opacity 0 passes an element-level test while
  // being completely invisible. epistemology-1 reported "UNTESTED is 100% covered
  // by JUST LUCK" on a beat where the screenshot shows no such word anywhere: two
  // labels from different beats, neither of them on screen together, both measured
  // as if they were. Everything here is judged on 'chainAlpha' for that reason.
  //
  // 0.55 rather than something near zero, because a cross-fade passing through 30%
  // is a transition, not a cover — and 'settle' above already waits those out.
  const SOLID = 0.55;
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') return false;
    if (chainAlpha(el) < SOLID) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0.5 && r.height > 0.5;
  };
  const alphaOf = (c) => {
    if (!c || c === 'transparent') return 0;
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return 1;
    const p = m[1].split(',').map((x) => parseFloat(x));
    return p.length > 3 ? p[3] : 1;
  };
  /**
   * Does this element put ink on the page at all?
   *
   * A transparent layout View is not a cover, and RN Web nests a great many of
   * them — counting those would report every word in the app as buried.
   */
  const inked = (el) => {
    const s = getComputedStyle(el);
    if (chainAlpha(el) < SOLID) return 0;
    if (alphaOf(s.backgroundColor) > 0.12) return 1;
    const bw = ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth']
      .map((k) => parseFloat(s[k]) || 0);
    if (Math.max(...bw) > 0.4 && alphaOf(s.borderTopColor) > 0.12) return 1;
    const tag = el.tagName.toLowerCase();
    if (['path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline'].includes(tag)) {
      const f = el.getAttribute('fill'), st = el.getAttribute('stroke');
      if ((f && f !== 'none') || (st && st !== 'none')) return 1;
    }
    // A leaf carrying its own words is ink even with no fill behind it: two
    // captions landing on each other is the same defect as a line on a caption.
    if (el.children.length === 0 && (el.textContent || '').trim().length > 0) return 1;
    return 0;
  };
  // ── TWO THINGS THAT LOOK LIKE A COVER AND ARE NOT ──────────────────────────
  //
  // Both were found by screenshotting a reported hit rather than by reasoning, and
  // without them this check fires on seven lessons in eight — which, per Part 3, is
  // a check that has told you nothing.
  //
  // 1. A STRIKE-THROUGH IS A RULE ACROSS A WORD ON PURPOSE. political-1 draws a
  //    2px ink bar through "WAR OF ALL AGAINST ALL" to say the sovereign ends it.
  //    Geometrically that is identical to the defect. What separates them is
  //    EXTENT: a decoration begins and ends at the word, within about an eighth of
  //    its width at each end. A line that merely happens to cross a label runs on
  //    past it, or stops inside it, and fails both.
  const decoration = (r, w) => {
    if (r.height > 5 || r.width < w.width * 0.6) return 0;
    const slack = Math.max(6, w.width * 0.12);
    return Math.abs(r.left - w.left) <= slack && Math.abs(r.right - w.right) <= slack ? 1 : 0;
  };
  // 1b. AN ANNOTATION THAT IS MEANT TO CROSS A WORD MUST SAY SO.
  //
  //     Some marks are the lesson. valid3 draws a corner-to-corner cross over
  //     'PREMISES TRUE / CONCLUSION FALSE' because that pairing is what validity
  //     forbids, and strikes each false premise through. Geometry cannot tell
  //     those from a stray rule: both are ink across a word, and a cross is
  //     deliberately not the width of any one line of text, so the decoration test
  //     above cannot see it either.
  //
  //     So intent is DECLARED, not inferred. Give the mark a nativeID beginning
  //     'strike' or 'crossout' and it counts as an annotation rather than a
  //     defect. That puts the decision in the scene, where somebody made it, and
  //     leaves the undeclared count — the one that has to reach zero — meaning
  //     exactly one thing. RN Web renders nativeID as the DOM id, which is how
  //     #stage-clip, #beat-progress, #target-ring and #drag-strip already work.
  const ANNOT = /^(strike|crossout)/;
  const declared = (el) => {
    let n = el;
    for (let i = 0; i < 4 && n; i++) { if (n.id && ANNOT.test(n.id)) return 1; n = n.parentElement; }
    return 0;
  };
  // 2. THE SAME WORD, DRAWN TWICE, IN THE SAME PLACE. Several scenes stack two
  //    identical <Text> nodes on one rect. Whatever the reason, a word covering
  //    itself is not a word being covered, and it accounted for 17 of the first
  //    212 hits.
  const sameWord = (e, d, r, w) => {
    if ((e.textContent || '').trim() !== (d.textContent || '').trim()) return 0;
    const ox = Math.min(r.right, w.right) - Math.max(r.left, w.left);
    const oy = Math.min(r.bottom, w.bottom) - Math.max(r.top, w.top);
    if (ox <= 0 || oy <= 0) return 0;
    // 0.6, not 0.9. The two copies are not always pixel-aligned — a scene may
    // offset one by a unit or two — and at 0.9 the exemption missed six pairs of
    // IDENTICAL words reported as covering each other at 100%: "I EXIST" under
    // "I EXIST", "PULL" under "PULL", "NEVER" under "NEVER". Two DIFFERENT labels
    // never carry the same string in the same place, so the text match is doing
    // the discriminating and the overlap only has to be substantial.
    const inter = ox * oy;
    return inter > 0.6 * w.width * w.height ? 1 : 0;
  };

  const figureOf = new Map();
  for (const fig of clipEl.querySelectorAll('[data-testid="figure"]')) {
    for (const part of fig.querySelectorAll('*')) figureOf.set(part, 1);
  }
  const label = (el) => {
    if (figureOf.has(el)) return 'the figure';
    const txt = (el.textContent || '').trim();
    if (el.children.length === 0 && txt) return 'text "' + txt.slice(0, 22) + '"';
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    const thin = r.height <= 4 ? 'a horizontal rule' : r.width <= 4 ? 'a vertical rule' : 'a block';
    return thin + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)
      + (alphaOf(s.backgroundColor) > 0.12 ? ' filled' : ' outlined');
  };

  // Every word the SCENE draws. The deck and the summary card live outside the
  // stage and are laid out by the player, not by scene authors.
  // ON STAGE, TOO. Scenes park props and their labels outside the crop before they
  // enter; a word waiting in the wings is not a word being covered.
  const cr = clipEl.getBoundingClientRect();
  const onStage = (r) => {
    const ox = Math.min(r.right, cr.right) - Math.max(r.left, cr.left);
    const oy = Math.min(r.bottom, cr.bottom) - Math.max(r.top, cr.top);
    return ox > 0 && oy > 0 && (ox * oy) > 0.6 * r.width * r.height;
  };
  const words = [...clipEl.querySelectorAll('div,span')].filter(
    (d) => d.children.length === 0 && (d.textContent || '').trim().length > 1 && vis(d),
  );

  const hits = [];
  for (const d of words) {
    let rects = [];
    try {
      const rg = document.createRange();
      rg.selectNodeContents(d);
      rects = [...rg.getClientRects()].filter((r) => r.width > 1 && r.height > 1);
    } catch (e) {}
    rects = rects.filter(onStage);
    if (!rects.length) continue;
    // Measured at the GLYPHS, never at the element: a centred <Text> is laid out
    // at the full inner width of its box, so its element rect touches both borders
    // while the words sit comfortably in the middle. D31b records that measuring
    // element rects reported 145 collisions against 106 real ones, and that the 39
    // difference were all fiction.
    const over = new Map(), ann = new Map();
    let samples = 0;
    for (const r of rects) {
      // A 2px GRID IN BOTH DIRECTIONS, and the vertical half of that is not
      // belt-and-braces. This sampled three rows — 22%, 50%, 78% — until the
      // built-in self-test caught it missing five of its own planted bars: on a
      // 17px word those rows are under 5px apart, so a 2px rule laid between two
      // of them is invisible to the probe while being perfectly visible to a
      // reader. A thin rule crossing a label is the exact defect this file exists
      // for, so the sampler cannot be coarser than the thing it hunts.
      const cols = Math.max(2, Math.round(r.width / 2));
      const rows = Math.max(3, Math.round(r.height / 2));
      for (let ri = 0; ri < rows; ri++) {
        const y = r.y + ((ri + 0.5) * r.height) / rows;
        for (let i = 0; i < cols; i++) {
          const x = r.x + ((i + 0.5) * r.width) / cols;
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
          samples++;
          const stack = document.elementsFromPoint(x, y);
          const me = stack.indexOf(d);
          if (me < 0) continue;
          // A WORD BEHIND A SOLID PANEL IS HIDDEN, NOT SLICED — and that is a
          // different thing, which this instrument deliberately does not report.
          //
          // Scenes replace a beat's diagram with the next beat's cards in the same
          // place and leave the old labels mounted underneath. political-5 beat 6
          // is the clean example: its screenshot shows four answer cards and
          // nothing wrong, while the probe first reported thirteen covered words —
          // every one of them last beat's diagram, sitting behind opaque cards.
          //
          // Taking "the topmost inked element" is what got that wrong: the topmost
          // thing over "GUARDIANS" is the CARD'S OWN TEXT, so the hit read as two
          // labels interleaved when in fact a solid card sits between them. So the
          // whole span from the top down to the word is scanned, and any opaque
          // background found in it settles the question — the reader sees the
          // panel, not the word, and a word that is not on screen cannot look cut
          // in half. What is left is the real defect: glyphs interleaved with a
          // rule, a border, another label or the figure, with nothing solid in
          // between.
          let cover = null;
          for (let k = 0; k < me; k++) {
            const e = stack[k];
            if (e === d || d.contains(e) || e.contains(d)) continue;
            // A BACKING SURFACE HAS TO CONTAIN THE WORD, NOT MERELY CROSS IT.
            //
            // This tested opacity alone, and an ink rule IS opaque — so the escape
            // hatch for "the word is behind a solid panel" swallowed the one thing
            // this file exists to find. The self-test called it immediately and
            // exactly: a bar laid across a word on 67 beats, 0 reported. Without
            // that counter-test the sweep would have gone out reporting a tidy
            // 12 lessons / 45 occurrences, every number of it meaningless.
            //
            // A panel that hides a word encloses its glyph rect; a rule that slices
            // one covers a sliver of it. 95% of the rect's area is the difference.
            const eb = e.getBoundingClientRect();
            const cx = Math.min(eb.right, r.right) - Math.max(eb.left, r.left);
            const cy = Math.min(eb.bottom, r.bottom) - Math.max(eb.top, r.top);
            // AND ITS LAYOUT BOX MUST BE A PANEL SHAPE, because a ROTATED bar's
            // bounding rect is not the bar. valid3's premise strike is 168x2.5 at
            // -14.4 degrees, whose axis-aligned bounds are 163x42 — enough to
            // enclose the word it crosses, so it read as a backing panel and its
            // declared annotation vanished from the report. offsetWidth/Height are
            // the PRE-TRANSFORM box, so a sliver stays a sliver however it is
            // turned. (SVG nodes have neither; they are never panels anyway.)
            const lw = e.offsetWidth || 0, lh = e.offsetHeight || 0;
            const panelShaped = Math.min(lw, lh) > 6;
            const encloses = cx > 0 && cy > 0 && cx * cy > 0.95 * r.width * r.height;
            if (panelShaped && encloses
                && alphaOf(getComputedStyle(e).backgroundColor) > 0.9
                && chainAlpha(e) > 0.9) { cover = null; break; }
            if (!inked(e)) continue;
            const er = e.getBoundingClientRect();
            // A FRAME AROUND A WORD IS NOT A COVER. elementsFromPoint returns an
            // element for any point inside its border box, fill or no fill — so a
            // card outline enclosing its own caption came back as covering 100% of
            // it. metaphysics-being-7 reported fourteen of those, every one a label
            // sitting correctly inside its own box. For an element with no fill,
            // only the border BAND is ink, so the sample point has to land on it.
            const es2 = getComputedStyle(e);
            if (alphaOf(es2.backgroundColor) <= 0.12) {
              const bw = Math.max(
                parseFloat(es2.borderTopWidth) || 0, parseFloat(es2.borderRightWidth) || 0,
                parseFloat(es2.borderBottomWidth) || 0, parseFloat(es2.borderLeftWidth) || 0,
              );
              const onBorder = bw > 0 && (
                x - er.left <= bw || er.right - x <= bw
                || y - er.top <= bw || er.bottom - y <= bw);
              if (!onBorder && e.children.length > 0) continue;
              if (!onBorder && bw > 0) continue;
            }
            if (decoration(er, r) || sameWord(e, d, er, r)) continue;
            if (declared(e)) { ann.set(e, (ann.get(e) || 0) + 1); cover = null; break; }
            if (!cover) cover = e;
          }
          if (cover) over.set(cover, (over.get(cover) || 0) + 1);
        }
      }
    }
    if (!samples) continue;
    const push = (map, how) => {
      for (const [e, n] of map) {
        const pct = n / samples;
        if (n < 3) continue;             // a single grazed pixel is anti-aliasing
        hits.push({
          how,
          word: (d.textContent || '').trim().slice(0, 34),
          by: label(e),
          fig: figureOf.has(e) ? 1 : 0,
          pct: +pct.toFixed(3),
          n,
        });
      }
    };
    push(over, 'over');
    push(ann, 'annotation');
  }

  const bar = document.getElementById('beat-progress');
  let prog = -1;
  try {
    if (bar) { const tf = getComputedStyle(bar).transform; if (tf && tf !== 'none') prog = new DOMMatrixReadOnly(tf).a; }
  } catch (e) {}
  return JSON.stringify({ hits, done: prog >= 0.999 });
  } finally { shim.remove(); }
})()`;

// ── THE COUNTER-TEST, BUILT IN ───────────────────────────────────────────────
//
// This check went from 212 hits to 0 across the same eight lessons as four
// harness faults were removed, and 0 is exactly what a check reports when it has
// quietly stopped looking. So SELFTEST=1 lays a real defect on a real beat — a
// 3px ink bar across the middle third of the widest word on stage — and requires
// the probe to find it. The middle THIRD rather than the whole word, because a
// bar spanning the word is a strike-through and is exempt by design; this has to
// exercise the defect path, not the exemption.
//
//   SELFTEST=1 node scripts/check-cover.mjs ids.json
//
// A run with it on should report exactly as many lessons dirty as it audits.
const PLANT = `(() => {
  const clip = document.getElementById('stage-clip');
  if (!clip) return 0;
  // ON STAGE AND ACTUALLY VISIBLE, or the test plants its bar somewhere the probe
  // is right not to look and then calls the probe blind. logic-arguments-1 failed
  // the first self-test for exactly that reason: its widest word is parked outside
  // the crop, so the bar went with it.
  const cr = clip.getBoundingClientRect();
  const alpha = (el) => { let a = 1, n2 = el;
    while (n2 && n2 !== document.body) { a *= +getComputedStyle(n2).opacity; n2 = n2.parentElement; }
    return a; };
  let best = null, bw = 0;
  for (const d of clip.querySelectorAll('div,span')) {
    if (d.children.length || (d.textContent || '').trim().length < 3) continue;
    if (alpha(d) < 0.55) continue;
    const rg = document.createRange(); rg.selectNodeContents(d);
    const r = rg.getBoundingClientRect();
    if (r.height <= 4 || r.width <= 12) continue;
    if (r.left < cr.left || r.right > cr.right || r.top < cr.top || r.bottom > cr.bottom) continue;
    if (r.width > bw) { bw = r.width; best = r; }
  }
  if (!best) return 0;
  const bar = document.createElement('div');
  bar.setAttribute('data-planted', '1');
  // 0.38 of the way down, deliberately NOT on any sample row the probe uses. A
  // test aligned to its own sampler proves the sampler can find things it was
  // aimed at, which is not the question.
  bar.style.cssText = 'position:fixed;z-index:99999;background:#1A1A1A;height:2px;left:'
    + (best.x + best.width / 3) + 'px;top:' + (best.y + best.height * 0.38)
    + 'px;width:' + (best.width / 3) + 'px';
  document.body.appendChild(bar);
  return 1;
})()`;

const ROUTE = 'app/previewcover.tsx';
const ROUTE_SRC = `// WRITTEN BY scripts/check-cover.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

export default function PreviewCover() {
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
  const createdHere = !fs.existsSync(ROUTE);
  if (createdHere) fs.writeFileSync(ROUTE, ROUTE_SRC);
  const cleanup = () => { if (createdHere) { try { fs.unlinkSync(ROUTE); } catch {} } };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });

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
    // A drag question has no button anywhere on the beat, so a sweep without this
    // stops at it and reports the beats it never reached as clean (§21).
    const answerDrag = () => evaluate(
      `(() => { const rail = document.getElementById('drag-strip');
        if (!rail) return 0;
        const r = rail.getBoundingClientRect();
        const y = r.y + r.height / 2, x0 = r.x + r.width * 0.5;
        const opt = { bubbles: true, pointerId: 1, pointerType: 'mouse', isPrimary: true, buttons: 1 };
        rail.dispatchEvent(new PointerEvent('pointerdown', { ...opt, clientX: x0, clientY: y }));
        for (let i = 1; i <= 8; i++) {
          rail.dispatchEvent(new PointerEvent('pointermove',
            { ...opt, clientX: x0 + i * 6, clientY: y }));
        }
        rail.dispatchEvent(new PointerEvent('pointerup',
          { ...opt, buttons: 0, clientX: x0 + 48, clientY: y }));
        return 1; })()`,
    );
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
      const didPlant = process.env.SELFTEST ? await evaluate(PLANT) : 0;
      if (didPlant) planted++;
      const raw = await evaluate(PROBE);
      if (!raw) break;
      const got = JSON.parse(raw);
      if (got.none) break;
      if (got.hits.length) beats.push({ beat: b, hits: got.hits });
      if (didPlant && got.hits.length) caught++;
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
    const n = beats.reduce((a, x) => a + x.hits.length, 0);
    const note = stepped < 2 ? `ONLY ${stepped + 1} BEAT REACHED`
      : n ? `${n} covered word(s)`
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

  console.log('\nCOVER AUDIT — what is sitting on top of a word\n');
  const stuck = report.filter((r) => (r.stepped ?? 0) < 2);
  const totalBeats = report.reduce((a, r) => a + (r.stepped ?? 0) + 1, 0);
  console.log(`  ${report.length} lessons · ${totalBeats} beats actually reached`);
  // A SWEEP THAT DID NOT MOVE IS NOT A PASS — stated before the result, because a
  // short sweep and a clean one are indistinguishable unless something counts.
  if (stuck.length) {
    console.log(`  ⚠ ${stuck.length} lesson(s) never got past their second beat — NOT audited:`);
    console.log(`      ${stuck.map((r) => r.id).join(', ')}`);
  }
  const dirty = report.filter((r) => r.beats.length);
  const all = dirty.flatMap((r) => r.beats.flatMap((b) => b.hits.map((h) => ({ ...h, id: r.id, beat: b.beat }))));
  const defects = all.filter((h) => h.how === 'over');
  const annots = all.filter((h) => h.how === 'annotation');
  const badLessons = report.filter((r) => r.beats.some((b) => b.hits.some((h) => h.how === 'over')));
  if (process.env.SELFTEST) {
    const P_ = report.reduce((a, r) => a + (r.planted || 0), 0);
    const C_ = report.reduce((a, r) => a + (r.caught || 0), 0);
    console.log(`
  SELFTEST: a bar was laid across a word on ${P_} beats`);
    console.log(`            the probe reported ${C_} of them`);
    const missed = report.filter((r) => (r.caught || 0) < (r.planted || 0));
    if (C_ < P_) {
      console.log(`            THE CHECK IS BLIND on ${P_ - C_} beat(s): `
        + missed.map((r) => `${r.id} ${r.caught}/${r.planted}`).join(', '));
      cleanup();
      process.exit(1);
    }
    console.log('            it sees every one — the check can detect a covered word.');
  }
  console.log(`  ${badLessons.length} lessons with an UNDECLARED cover · ${defects.length} occurrences`);
  console.log(`    by the figure: ${defects.filter((h) => h.fig).length}  (D23 — the figure covering a prop)`);
  console.log(`    by other text: ${defects.filter((h) => h.by.startsWith('text')).length}  (two labels on one another)`);
  console.log(`  ${annots.length} declared annotations — a strike or cross-out that says so in the scene`);
  for (const r of badLessons) {
    console.log(`
  ${r.id}`);
    for (const b of r.beats) {
      for (const h of b.hits.filter((x) => x.how === 'over').slice(0, 6)) {
        console.log(`      beat ${b.beat}  "${h.word.split(String.fromCharCode(10)).join(' ')}" — under ${h.by}, ${(h.pct * 100).toFixed(0)}% of it`);
      }
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
  const BUDGET = 'scripts/cover-budget.json';
  if (!process.env.SELFTEST && !process.argv[2]) {
    const now = { lessons: badLessons.length, occurrences: defects.length };
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
  COVER DEBT GREW: ${was.lessons}/${was.occurrences} → ${now.lessons}/${now.occurrences}`);
      console.log('  Something new is painted across a word. Fix it, or declare it (D33).');
      cleanup();
      process.exit(1);
    } else if (now.lessons < was.lessons || now.occurrences < was.occurrences) {
      console.log(`
  cover debt fell: ${was.lessons}/${was.occurrences} → ${now.lessons}/${now.occurrences}`);
      console.log(`  lower ${BUDGET} to match, in this commit.`);
    } else {
      console.log(`
  cover debt unchanged at ${now.lessons} lessons / ${now.occurrences} occurrences.`);
      console.log('  A budget line that still says the same number is not a pass, it is a debt.');
    }
  }
  cleanup();
  process.exit(0);
})();
