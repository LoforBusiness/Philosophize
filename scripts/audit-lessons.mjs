// THE LESSON AUDIT — does anything overlap on a real render?
//
// The phone is usually not attached (§21), so this drives the actual app in a
// browser and MEASURES the question beat of every cinematic lesson:
//
//   ring-over-text   a Target's ring covering text belonging to something else
//   rings-collide    two targets' rings overlapping, which says they are one thing
//   ring-off-stage   a ring above the top of the frame
//   no-count         two or more rings but no count in the panel's hint
//
// Ownership is decided by the DOM, not by rectangles: a ring is a child of its
// target, so text inside that target belongs to it even when it overflows the
// box. Testing geometrically instead reported logic-3's proof lines — which are
// wider than the rows holding them — as collisions with themselves.
//
// USAGE — it needs the web bundle and a headless Chrome:
//   npx expo start --web --port 8847 --clear
//   curl -s -o /dev/null "http://localhost:8847/index.bundle?platform=web&dev=true"
//   chrome --headless=new --remote-debugging-port=9381 --user-data-dir=/tmp/audit
//   node scripts/audit-lessons.mjs                 # all cinematic lessons
//   node scripts/audit-lessons.mjs ids.json out.json
//
// It writes app/previewaudit.tsx on the way in and DELETES it on the way out —
// any file in app/ is a real route and would ship if left behind (§21).
import CDP from 'node:http';
import fs from 'node:fs';
const PORT = +(process.env.PORT || 9381);
const BASE = 'http://localhost:8847/previewaudit';

const put = (p) => new Promise((res, rej) => {
  const r = CDP.request({ host: '127.0.0.1', port: PORT, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const PROBE = `(() => {
  const R = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity < 0.08) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const all = [...document.querySelectorAll('div,span')];
  // A ring is the only element with a 2px border on all four sides drawn by Target.
  // By nativeID, not by shape: matching "2px border with a radius" also caught
  // scene art and reported collisions between things that were never rings.
  const ringEls = [...document.querySelectorAll('#target-ring')].filter(vis);
  const rings = ringEls.map(R);
  // Text: leaf elements that actually carry characters.
  const textEls = all.filter((d) => vis(d) && d.children.length === 0 && (d.textContent || '').trim().length > 1);
  // THE INKED BOX, NOT THE LAYOUT BOX. A centred Text in a wide container has a
  // box far wider than its glyphs, and comparing boxes reported a steady 17px
  // "collision" between a target and every label in the column beside it — the
  // false positive Part 3 of LESSON_RULES already warns about. A Range over the
  // text node gives the rectangle the characters actually occupy.
  const inked = (d) => {
    try {
      const rg = document.createRange();
      rg.selectNodeContents(d);
      const r = rg.getBoundingClientRect();
      if (r.width > 0.5 && r.height > 0.5) return { x: r.x, y: r.y, w: r.width, h: r.height };
    } catch (e) { /* fall through */ }
    return R(d);
  };
  const texts = textEls.map((d) => ({ ...inked(d), t: (d.textContent || '').trim().slice(0, 24) }));
  // OWNERSHIP IS A DOM QUESTION, NOT A GEOMETRIC ONE. A ring is a child of its
  // target, so any text inside that same target belongs to it — including text
  // that overflows the target's own box, which a rectangle test wrongly called a
  // collision (logic-3's proof lines are wider than the rows they sit in).
  const foreign = ringEls.map((ring) => {
    const target = ring.parentElement;
    return textEls.map((t, i) => (target && target.contains(t) ? -1 : i)).filter((i) => i >= 0);
  });
  const body = document.body.innerText;
  return JSON.stringify({
    rings, texts, foreign,
    open: /outlined part/.test(body) || /Answer in the scene/.test(body),
    hint: (body.match(/Tap one of the \\d+ outlined parts above/) || [])[0] || null,
    done: /Finish/.test(body),
  });
})()`;

const overlap = (a, b) => {
  const x = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const y = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return x > 0 && y > 0 ? Math.min(x, y) : 0;
};

const ROUTE = 'app/previewaudit.tsx';
const ROUTE_SRC = `// WRITTEN BY scripts/audit-lessons.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

export default function PreviewAudit() {
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
  if (!fs.existsSync(ROUTE)) fs.writeFileSync(ROUTE, ROUTE_SRC);
  process.on('exit', () => { try { fs.unlinkSync(ROUTE); } catch {} });
  const tab = await put('/json/new?about:blank');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0; const pending = new Map();
  const send = (m, p = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise((r) => { ws.onopen = r; });
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  const ev = async (x) => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.value;

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });

  const findings = [];
  let checked = 0, ringed = 0;

  for (const lid of ids) {
    await send('Page.navigate', { url: `${BASE}?id=${encodeURIComponent(lid)}` });
    let ok = false;
    for (let i = 0; i < 30; i++) { if (await ev(`document.body && document.body.innerText.length > 20`)) { ok = true; break; } await wait(400); }
    if (!ok) { findings.push({ lid, kind: 'blank', detail: 'never rendered' }); continue; }
    await wait(500);

    // Step through beats until the interact panel is open (or we run out).
    let seen = null;
    for (let step = 0; step < 12; step++) {
      const p = JSON.parse(await ev(PROBE));
      if (p.open && p.rings.length) {
        // LET THE BEAT LAND BEFORE MEASURING. Beat transitions run 0.7–1.3s and
        // the step between taps was 450ms, so the first pass measured scenes
        // mid-move and reported overlaps that do not exist once everything has
        // arrived — 28 of them, across the four lessons whose question beats
        // animate the most. Re-read after the longest transition in the app.
        await wait(1600);
        seen = JSON.parse(await ev(PROBE));
        break;
      }
      if (p.done) break;
      // React Native Web needs a REAL click; synthetic pointer events do not fire
      // a Pressable (§21).
      await ev(`(() => { const el = document.elementFromPoint(195, 700) || document.body; el.dispatchEvent(new MouseEvent('click', {bubbles:true})); return 1; })()`);
      await wait(450);
    }
    checked++;
    if (!seen) continue;
    ringed++;

    // 1 — a ring covering text that is not inside its own target.
    // ENCLOSING TEXT IS NOT COVERING IT. Several targets are large invisible hit
    // rectangles laid over drawn art — the art is not their DOM child, but the
    // ring around the region is exactly right: it says "all of this is one
    // button". What is wrong is a border CUTTING THROUGH glyphs, which happens
    // only when the text is partly in and partly out. Testing plain intersection
    // instead flagged 28 of the former and none of the latter.
    seen.rings.forEach((r, ri) => {
      for (const ti of (seen.foreign[ri] || [])) {
        const t = seen.texts[ti];
        const inside = t.x >= r.x - 1 && t.y >= r.y - 1 &&
                       t.x + t.w <= r.x + r.w + 1 && t.y + t.h <= r.y + r.h + 1;
        if (inside) continue;
        const d = overlap(r, t);
        if (d >= 4) findings.push({ lid, kind: 'ring-cuts-text', detail: `${d.toFixed(0)}px through "${t.t}"` });
      }
    });
    // 2 — two rings overlapping each other: the reader cannot tell them apart.
    for (let a = 0; a < seen.rings.length; a++) {
      for (let b = a + 1; b < seen.rings.length; b++) {
        const d = overlap(seen.rings[a], seen.rings[b]);
        if (d >= 4) findings.push({ lid, kind: 'rings-collide', detail: `${d.toFixed(0)}px` });
      }
    }
    // 3 — a ring off the top of the stage.
    for (const r of seen.rings) if (r.y < -2) findings.push({ lid, kind: 'ring-off-stage', detail: `y ${r.y.toFixed(0)}` });
    // 4 — the hint actually names a count.
    if (!seen.hint && seen.rings.length >= 2) findings.push({ lid, kind: 'no-count', detail: `${seen.rings.length} rings but no count in the hint` });
  }

  console.log(`checked ${checked} lessons, reached a ringed question in ${ringed}`);
  const byKind = {};
  for (const f of findings) (byKind[f.kind] ||= []).push(f);
  for (const k of Object.keys(byKind)) {
    console.log(`\n${k}: ${byKind[k].length}`);
    for (const f of byKind[k].slice(0, 12)) console.log(`   ${f.lid}  ${f.detail}`);
    if (byKind[k].length > 12) console.log(`   … and ${byKind[k].length - 12} more`);
  }
  if (!findings.length) console.log('\nno collisions, no uncounted rings.');
  fs.writeFileSync(process.argv[3] || 'audit.json', JSON.stringify(findings, null, 1));
  ws.close(); process.exit(0);
})();
