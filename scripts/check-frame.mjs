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

// ── the probe ────────────────────────────────────────────────────────────────
//
// `stage-clip` is the View in CinematicPlayer that crops the band; it carries a
// nativeID for the same reason Target's ring does — finding it by "the element
// with overflow:hidden" also matches scene art, and an audit measuring the wrong
// rectangle reports confidently about nothing.
const PROBE = `(() => {
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
  // Only what the SCENE draws. The text deck, quote card and summary sit outside
  // the camera by construction and cannot be cropped by it.
  const nodes = [...clipEl.querySelectorAll('div,span')];
  for (const d of nodes) {
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

  const tab = await put('/json/new?about:blank');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let mid = 0; const pending = new Map();
  const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise((r) => { ws.onopen = r; });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  await send('Page.enable');
  await send('Runtime.enable');
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

  const report = [];
  let done = 0;
  for (const id of ids) {
    await send('Page.navigate', { url: `${BASE}?id=${encodeURIComponent(id)}` });
    // WAIT FOR THE STAGE, NOT FOR A CLOCK. Body text appears while the lesson is
    // still mounting, so waiting on it starts tapping before anything is
    // interactive — two lessons reported "1 beat reached" purely because the audit
    // arrived first. The first navigation of a run also pays for Metro compiling
    // the preview route this script just wrote, which is far slower than the rest.
    let up = false;
    const patience = done === 0 ? 180 : 40;
    for (let i = 0; i < patience; i++) {
      if (await evaluate("!!document.getElementById('stage-clip')")) { up = true; break; }
      await wait(500);
    }
    if (!up) { report.push({ id, beats: [], stepped: 0, blank: true }); console.log(`  ${String(++done).padStart(3)}/${ids.length}  ${id.padEnd(34)} NEVER RENDERED A STAGE`); continue; }
    await wait(1200);

    const beats = [];
    let stepped = 0;
    let last = await stamp();
    for (let b = 0; b < 14; b++) {
      const raw = await evaluate(PROBE);
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
        // LET THE BEAT LAND BEFORE MEASURING. Beat transitions run 0.7–1.3s and the
        // camera travel up to 2.2s on a `drift`; measuring mid-move reports things
        // half out of frame that arrive a moment later.
        await wait(1700);
        const now = await stamp();
        if (last === null || now < 0 || now > last + 1e-4) { last = now; moved = true; }
      }
      if (!moved) break;
      stepped++;
    }
    report.push({ id, beats, stepped });
    done++;
    const nText = beats.reduce((a, x) => a + x.hits.filter((h) => h.kind === 'text').length, 0);
    const nArt = beats.reduce((a, x) => a + x.hits.filter((h) => h.kind !== 'text').length, 0);
    // TEXT AND ART ARE NOT THE SAME VERDICT. The must-see boxes are the union of a
    // beat's WORDS, so a sliced label is a failure of the guarantee; a clipped piece
    // of scenery is what pushing in IS. Reporting one number for both would have
    // made a lesson that fixed every label look unchanged.
    const note = stepped < 2 ? `ONLY ${stepped + 1} BEAT REACHED`
      : nText ? `${nText} TEXT clipped (+${nArt} art) over ${beats.length} beat(s)`
      : nArt ? `words clean · ${nArt} art clipped` : `clean (${stepped + 1} beats)`;
    console.log(`  ${String(done).padStart(3)}/${ids.length}  ${id.padEnd(34)} ${note}`);
  }

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
  const textLessons = report.filter((r) => r.beats.some((b) => b.hits.some((h) => h.kind === 'text')));
  const textHits = report.reduce((a, r) => a + r.beats.reduce((b, x) => b + x.hits.filter((h) => h.kind === 'text').length, 0), 0);
  console.log(`  ${dirty.length} lessons with something straddling the crop · ${totalHits} elements`);
  console.log(`  OF WHICH WORDS: ${textLessons.length} lessons · ${textHits} sliced labels   <- the number H60c is about`);
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
