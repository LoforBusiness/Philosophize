// IS THE CAMERA CUTTING THE PICTURE IN HALF?
//
// H60c says a beat that shows the reader a specific thing must report that thing's
// box, so `containShot` can guarantee the shot holds it. Nothing reports one today
// — `SceneApi` has no way to — so on every beat except a question the camera frames
// by luck, and `followMoves` deals pushes of up to 1.4×.
//
// validate-cinematic checks that the FIGURE survives each shot. That is the only
// thing it checks, and the figure is not what these lessons teach with: the whole
// <Scene> mounts inside camStyle, so every board, chart, label and diagram rides
// the camera too, and all 96 camera scenes draw <Text> in there.
//
// Arithmetic can say how much of the declared band a push cuts (about half of all
// shots cut a third or more of it). It cannot say whether anything was standing in
// the part that went — for that you have to render the lesson. So this drives the
// real app in a browser (§21) and measures, beat by beat, every element the scene
// draws against the stage's own clip rectangle.
//
// WHAT COUNTS AS A DEFECT, and why it is not "anything outside the frame":
// scenes legitimately park props off-stage before they enter, so a rect that is
// entirely outside the crop is usually deliberate. A rect that STRADDLES the crop
// edge is not — it is a thing that is half on screen, which is the shape of
// something being cut rather than something waiting in the wings.
//
// USAGE — needs the web bundle and a headless Chrome:
//   npx expo start --web --port 8847 --clear
//   curl -s -o /dev/null "http://localhost:8847/index.bundle?platform=web&dev=true"
//   chrome --headless=new --remote-debugging-port=9382 --user-data-dir=<tmp>
//   node scripts/check-frame.mjs                    # every cinematic lesson
//   node scripts/check-frame.mjs ids.json out.json  # a chosen list
//
// It writes app/previewframe.tsx on the way in and DELETES it on the way out —
// any file in app/ is a real route and would ship if left behind (§21).
import http from 'node:http';
import fs from 'node:fs';

const PORT = +(process.env.CDP_PORT || 9382);
const WEB = +(process.env.WEB_PORT || 8847);
const BASE = `http://localhost:${WEB}/previewframe`;

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
//
// `stage-clip` is the View in CinematicPlayer that crops the band; it carries a
// nativeID for the same reason Target's ring does — finding it by "the element
// with overflow:hidden" also matches scene art, and an audit measuring the wrong
// rectangle reports confidently about nothing.
const PROBE = (BT, BB) => `(() => {
  const BAND_T = ${BT}, BAND_B = ${BB};
  const clipEl = document.getElementById('stage-clip');
  if (!clipEl) return JSON.stringify({ none: true });
  const c = clipEl.getBoundingClientRect();
  const clip = { x: c.x, y: c.y, w: c.width, h: c.height };
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity < 0.08) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  // The characters, not the layout box: a centred Text in a wide container has a
  // box far wider than its glyphs, and measuring the box calls a centred caption
  // clipped when only its padding left the frame.
  const inked = (d) => {
    try {
      const rg = document.createRange();
      rg.selectNodeContents(d);
      const r = rg.getBoundingClientRect();
      if (r.width > 0.5 && r.height > 0.5) return { x: r.x, y: r.y, w: r.width, h: r.height };
    } catch (e) {}
    const r = d.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height };
  };
  const cut = (r) => {
    const l = Math.max(0, clip.x - r.x);
    const t = Math.max(0, clip.y - r.y);
    const rt = Math.max(0, (r.x + r.w) - (clip.x + clip.w));
    const b = Math.max(0, (r.y + r.h) - (clip.y + clip.h));
    const inW = Math.min(r.x + r.w, clip.x + clip.w) - Math.max(r.x, clip.x);
    const inH = Math.min(r.y + r.h, clip.y + clip.h) - Math.max(r.y, clip.y);
    const inside = inW > 0 && inH > 0 ? (inW * inH) / (r.w * r.h) : 0;
    return { l, t, r: rt, b, inside };
  };
  const out = [];
  // IS THE CAMERA DOING IT, OR WOULD THE CROP DO IT ANYWAY?
  //
  // Two things get cut that no camera can be blamed for, and counting them as
  // defects makes the number unactionable:
  //
  //   BLEED   art deliberately drawn past the stage edge — a ground line from
  //           x -20 to x 420 is 29% inside at scale 1 and always will be.
  //   BAND    something the PLAYER draws inside the crop but OUTSIDE #stage-cam.
  //           It does not ride the camera at all, so if it is clipped the band is
  //           too tight for it (H59), which is a scene fix, not a camera one.
  //
  // So each hit is resolved back into scene coordinates through #stage-cam — the
  // same inversion measure-must uses — and labelled with which of the three it is.
  const camEl = document.getElementById('stage-cam');
  const camRect = camEl ? camEl.getBoundingClientRect() : null;
  const kCam = camRect ? camRect.width / 400 : 0;
  const classify = (el, r) => {
    if (!camEl || !camEl.contains(el) || !(kCam > 0.01)) return 'band';
    const bx = (r.x - camRect.x) / kCam, by = (r.y - camRect.y) / kCam;
    const bw = r.w / kCam, bh = r.h / kCam;
    // Outside the design space at all => drawn to run off; the crop cuts it at any
    // zoom, including none.
    if (bx < 1 || by < 1 || bx + bw > 399 || by + bh > 559) return 'bleed';
    // OUTSIDE THE LESSON'S OWN BAND. The band is the slice of the design space the
    // player crops to, so anything drawn above or below it is cut at scale 1 too —
    // with no camera at all. That is an H59 fault ("the band must contain every
    // pixel a beat can draw"), and no shot can rescue it: metaphysics-being-8 draws
    // its question prompt at y 134 against a band starting at 134, so four units of
    // it are outside the picture by construction. Calling that a camera fault sends
    // the next person to fix the wrong file.
    if (by < BAND_T - 1 || by + bh > BAND_B + 1) return 'band';
    return 'camera';
  };
  // THE FIGURE FIRST, and as one thing. A Stickman's root is a zero-size absolute
  // box whose descendants are the limbs, so measuring the root says nothing and
  // measuring each limb reports "a shin is clipped" instead of "the man is cut in
  // half". Several figures may be on stage; each is its own union.
  const partOfFigure = new Set();
  for (const fig of clipEl.querySelectorAll('[data-testid="figure"]')) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const part of fig.querySelectorAll('*')) {
      partOfFigure.add(part);
      if (!vis(part)) continue;
      const q = part.getBoundingClientRect();
      x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y);
      x1 = Math.max(x1, q.x + q.width); y1 = Math.max(y1, q.y + q.height);
    }
    if (x0 === Infinity) continue;
    const r = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    const k = cut(r);
    if (k.inside > 0.02 && k.inside < 0.985) {
      out.push({ kind: 'FIGURE', why: classify(fig, r), t: '', inside: +k.inside.toFixed(3),
        l: Math.round(k.l), t_: Math.round(k.t), r: Math.round(k.r), b: Math.round(k.b) });
    }
  }
  // Only what the SCENE draws. The text deck, quote card and summary sit outside
  // the camera by construction and cannot be cropped by it.
  const nodes = [...clipEl.querySelectorAll('div,span')];
  for (const d of nodes) {
    if (partOfFigure.has(d)) continue;
    if (!vis(d)) continue;
    const isLeafText = d.children.length === 0 && (d.textContent || '').trim().length > 1;
    const s = getComputedStyle(d);
    const isArt = d.children.length === 0 && (
      (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') ||
      (parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderLeftWidth) > 0)
    );
    if (!isLeafText && !isArt) continue;
    const r = isLeafText ? inked(d) : (() => { const q = d.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height }; })();
    if (r.w < 2 || r.h < 2) continue;
    const k = cut(r);
    // STRADDLING is the defect. Wholly outside is a prop waiting in the wings;
    // wholly inside is fine. Between the two is something being sliced.
    if (k.inside > 0.02 && k.inside < 0.985) {
      out.push({
        kind: isLeafText ? 'text' : 'art',
        why: classify(d, r),
        t: isLeafText ? (d.textContent || '').trim().slice(0, 30) : '',
        inside: +k.inside.toFixed(3),
        l: Math.round(k.l), t_: Math.round(k.t), r: Math.round(k.r), b: Math.round(k.b),
      });
    }
  }
  // prog === 1 is the last beat. Matching the word "Finish" in the page text
  // instead ends the audit early on any lesson whose prose contains it — see the
  // note in measure-must.mjs.
  const bar = document.getElementById('beat-progress');
  let prog = -1;
  try {
    if (bar) { const tf = getComputedStyle(bar).transform; if (tf && tf !== 'none') prog = new DOMMatrixReadOnly(tf).a; }
  } catch (e) {}
  return JSON.stringify({ clip, out, done: prog >= 0.999 });
})()`;

const ROUTE = 'app/previewframe.tsx';
const ROUTE_SRC = `// WRITTEN BY scripts/check-frame.mjs — deleted again when it finishes.
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

function allIds() {
  const src = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
  return [...src.matchAll(/^\s*'([a-z0-9-]+)':\s*\w+,/gm)].map((m) => m[1]);
}

(async () => {
  const ids = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : allIds();
  const outPath = process.argv[3] ?? null;
  if (!fs.existsSync(ROUTE)) fs.writeFileSync(ROUTE, ROUTE_SRC);
  const cleanup = () => { try { fs.unlinkSync(ROUTE); } catch {} };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });

  // A POOL OF TABS. Auditing is mostly waiting for beats to settle, and the lessons
  // are independent, so they run concurrently — 102 lessons in a quarter of an hour
  // instead of two and a half. See measure-must.mjs for the two things that had to
  // change to make parallel CORRECT and not merely fast: background tabs are not
  // laid out (focus emulation), and every fixed wait had to become a condition.
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
  // Only the front tab of a headless window is laid out; the rest never fire their
  // ResizeObserver, so the player's onLayout never runs and the stage never mounts.
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {});
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r?.result?.value;
  };
  // ADVANCING A BEAT, and it has to be this exact way.
  //
  // CDP's Input.dispatchMouseEvent (mousePressed + mouseReleased at real
  // coordinates) does NOT advance the lesson — React Native Web's Pressable does
  // not see it. The first version of this file used it, so every lesson was
  // measured on beat 0 nine times over and the whole sweep came back "clean":
  // a harness that reports a pass because it never got past the first frame.
  // What works is the same synthetic `click` audit-lessons.mjs uses (§21).
  //
  // `stepped` is therefore checked by the caller — an audit that cannot prove it
  // moved must not be allowed to report a result.
  const tap = () => evaluate(
    `(() => { const el = document.elementFromPoint(195, 700) || document.body;
      el.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; })()`,
  );
  // A GRADED BEAT GATES THE ADVANCE, so an audit that only taps stops at the first
  // question and never sees the beats after it. Scene questions are answered by
  // pressing a Target (findable by the ring it draws, which carries a role); deck
  // questions by pressing a choice — a plain Pressable, so React Native Web gives
  // it a tabindex and no role, which is why selecting on role alone found none.
  const answerScene = () => evaluate(
    `(() => { const ring = document.querySelector('#target-ring');
      if (ring && ring.parentElement) { ring.parentElement.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
      // Choices drawn ON the picture (./ChoiceCards). Searched across the DOCUMENT
      // even though they appear inside the stage: the PLAYER renders them, so they
      // overlay the crop rather than living inside it. The size floor excludes the
      // header's 28x28 close button, which would exit the lesson.
      const card = [...document.querySelectorAll('[role="button"]')].find((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 60 && r.height > 28;
      });
      if (card) { card.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; }
      return 0; })()`,
  );
  // Deck choices are plain Pressables, so React Native Web gives them a tabindex
  // and no role. They are tried SEPARATELY from scene targets rather than as a
  // fallback: a lesson can have rings mounted on every beat and still ask its
  // question in the deck, in which case "a ring exists" never stops being true and
  // the fallback is never reached.
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
  /**
   * WAIT FOR THE CAMERA TO STOP, then measure.
   *
   * A shot travels for up to 2.2s on a `drift` and the audit was reading at 1.7s —
   * mid-move, when the frame is between two framings and transiently crops things
   * that arrive a moment later. The tell was that two identical runs disagreed:
   * 12 sliced words in one, 13 and a different lesson list in the next. A defect
   * that comes and goes between runs of the same build is the harness moving, not
   * the app.
   */
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
  /** The beat index, straight off the progress bar — see the note in measure-must. */
  const stamp = () => evaluate(
    `(() => {
      const bar = document.getElementById('beat-progress');
      try {
        if (bar) { const tf = getComputedStyle(bar).transform; if (tf && tf !== 'none') return new DOMMatrixReadOnly(tf).a; }
      } catch (e) {}
      return -1;
    })()`,
  );

    return { send, evaluate, tap, answerScene, answerDeck, stamp, settle, close: () => { try { ws.close(); } catch {} } };
  };

  const report = [];
  let done = 0;
  const auditOne = async (T, id, first, nBeats, band) => {
    const { send, evaluate, tap, answerScene, answerDeck, stamp, settle } = T;
    {
    await send('Page.navigate', { url: `${BASE}?id=${encodeURIComponent(id)}` });
    // WAIT FOR THE STAGE, NOT FOR A CLOCK. Body text appears while the lesson is
    // still mounting, so waiting on it starts tapping before anything is
    // interactive — two lessons reported "1 beat reached" purely because the audit
    // arrived first. The first navigation of a run also pays for Metro compiling
    // the preview route this script just wrote, which is far slower than the rest.
    let up = false;
    const patience = first ? 220 : 60;
    for (let i = 0; i < patience; i++) {
      if (await evaluate("!!document.getElementById('stage-clip')")) { up = true; break; }
      await wait(500);
    }
    if (!up) { report.push({ id, beats: [], stepped: 0, blank: true }); console.log(`  ${String(++done).padStart(3)}/${ids.length}  ${id.padEnd(34)} NEVER RENDERED A STAGE`); return; }
    await wait(1200);

    const beats = [];
    let stepped = 0;
    let last = (() => { const n = -1; return n; })();
    for (let b = 0; b < 14; b++) {
      await settle();
      const raw = await evaluate(PROBE(band[0], band[1]));
      if (!raw) break;
      const got = JSON.parse(raw);
      if (got.none) break;
      if (got.out.length) beats.push({ beat: b, hits: got.out });
      if (got.done) break;
      let moved = false;
      for (let attempt = 0; attempt < 3 && !moved; attempt++) {
        if (attempt === 1) { await answerScene(); await wait(700); }
        if (attempt === 2) { await answerDeck(); await wait(700); }
        await tap();
        // LET THE BEAT LAND, then POLL for the advance rather than timing it. Beat
        // transitions run 0.7–1.3s and camera travel up to 2.2s; measuring mid-move
        // reports things half out of frame that arrive a moment later. Under six
        // lanes a fixed wait is also simply wrong — see measure-must.mjs.
        await wait(1700);
        for (let t = 0; t < 12 && !moved; t++) {
          const now = await stamp();
          const idx = now < 0 || !nBeats ? -1 : Math.round(now * nBeats) - 1;
          if (last === null || idx < 0 || idx > last) { last = idx; moved = true; break; }
          await wait(250);
        }
      }
      if (!moved) break;
      stepped++;
    }
    report.push({ id, beats, stepped });
    done++;
    const cam_ = (k) => beats.reduce((a, x) => a + x.hits.filter((h) => h.kind === k && h.why === 'camera').length, 0);
    const nFig = cam_('FIGURE'), nText = cam_('text'), nArt = cam_('art');
    const other = beats.reduce((a, x) => a + x.hits.filter((h) => h.why !== 'camera').length, 0);
    // TEXT AND ART ARE NOT THE SAME VERDICT. The must-see boxes are the union of a
    // beat's WORDS, so a sliced label is a failure of the guarantee; a clipped piece
    // of scenery is what pushing in IS. Reporting one number for both would have
    // made a lesson that fixed every label look unchanged.
    const bad = nFig + nText + nArt;
    const note = stepped < 2 ? `ONLY ${stepped + 1} BEAT REACHED`
      : bad ? `${nFig ? `${nFig} FIGURE · ` : ''}${nText ? `${nText} text · ` : ''}${nArt ? `${nArt} art · ` : ''}CUT BY CAMERA`
      : `camera clean${other ? ` (${other} bleed/band)` : ''}`;
    console.log(`  ${String(done).padStart(3)}/${ids.length}  ${id.padEnd(34)} ${note}`);
    }
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

  /** Each lesson's declared band, so a hit can be blamed on the right thing. */
  const bandOf = (() => {
    const src = fs.readFileSync('app/(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId].tsx', 'utf8');
    const comps = new Map([...src.matchAll(/^\s*'([a-z0-9-]+)':\s*(\w+),/gm)].map((m) => [m[1], m[2]]));
    const out = new Map();
    for (const [id, comp] of comps) {
      const base = comp.replace(/Lesson$/, '');
      for (const f of [`components/lesson/cinematic/${base[0].toLowerCase()}${base.slice(1)}Scene.tsx`,
                       `components/lesson/cinematic/${comp}.tsx`]) {
        if (!fs.existsSync(f)) continue;
        const m = fs.readFileSync(f, 'utf8').match(/band=\{\[(\d+),\s*(\d+)\]\}/);
        if (m) { out.set(id, [+m[1], +m[2]]); break; }
      }
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
      try { await auditOne(T, id, first, nBeatsOf.get(id) ?? 0, bandOf.get(id) ?? [0, 560]); }
      catch (e) { console.log(`  ${id.padEnd(34)} ERRORED: ${String(e).slice(0, 60)}`); done++; }
    }
  };
  const lanes = [];
  for (let i = 0; i < Math.min(LANES, ids.length); i++) lanes.push(await makeTab());
  console.log(`auditing ${ids.length} lessons across ${lanes.length} tabs`);
  await Promise.all(lanes.map((T) => runLane(T)));
  for (const T of lanes) T.close();

  console.log('\nFRAME AUDIT — what the camera cuts in half\n');
  const dirty = report.filter((r) => r.beats.length);
  const totalHits = dirty.reduce((a, r) => a + r.beats.reduce((b, x) => b + x.hits.length, 0), 0);
  // A SWEEP THAT DID NOT MOVE IS NOT A PASS. Said before the result, because the
  // first version of this file reported "0 lessons with anything clipped" purely
  // because its tap did nothing and every lesson was measured on beat 0.
  const stuck = report.filter((r) => (r.stepped ?? 0) < 2);
  const totalBeats = report.reduce((a, r) => a + (r.stepped ?? 0) + 1, 0);
  console.log(`  ${report.length} lessons · ${totalBeats} beats actually reached`);
  if (stuck.length) {
    console.log(`  ⚠ ${stuck.length} lesson(s) never got past their second beat — they were NOT audited:`);
    console.log(`      ${stuck.map((r) => r.id).join(', ')}`);
  }
  const count = (kind) => report.reduce((a, r) => a + r.beats.reduce((b, x) => b + x.hits.filter((h) => h.kind === kind && h.why === 'camera').length, 0), 0);
  const lessonsWith = (kind) => report.filter((r) => r.beats.some((b) => b.hits.some((h) => h.kind === kind && h.why === 'camera'))).length;
  const why = (w) => report.reduce((a, r) => a + r.beats.reduce((b, x) => b + x.hits.filter((h) => h.why === w).length, 0), 0);
  console.log(`  ${dirty.length} lessons with something straddling the crop · ${totalHits} elements`);
  console.log(`    figures cut in half : ${count('FIGURE')}  (${lessonsWith('FIGURE')} lessons)`);
  console.log(`    words sliced        : ${count('text')}  (${lessonsWith('text')} lessons)`);
  console.log(`    art sliced          : ${count('art')}  (${lessonsWith('art')} lessons)`);
  console.log('    all three should be 0 — H60c protects the figure, the words and any art that');
  console.log('    does not already bleed off the stage edge.');
  for (const r of dirty) {
    console.log(`\n  ${r.id}`);
    for (const b of r.beats) {
      for (const h of b.hits.slice(0, 4)) {
        const side = [h.l && `${h.l}L`, h.t_ && `${h.t_}T`, h.r && `${h.r}R`, h.b && `${h.b}B`].filter(Boolean).join(' ');
        console.log(`      beat ${b.beat}  ${h.kind}${h.t ? ` "${h.t}"` : ''} — ${(h.inside * 100).toFixed(0)}% inside, cut ${side}`);
      }
    }
  }
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  cleanup();
  process.exit(dirty.length ? 0 : 0);
})();
