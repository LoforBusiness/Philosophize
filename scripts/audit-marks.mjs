// ─────────────────────────────────────────────────────────────────────────────
// THE EDGES ROUND EVERY PEN MARK, READ OUT OF THE REAL PAGE.
//
//   npx expo start --web --port 8867          (no CI=1 — see CLAUDE.md §21)
//   chrome --headless=new --remote-debugging-port=9397 --user-data-dir=<tmp>
//   node scripts/make-marks.mjs               (writes the candidate list)
//   node scripts/audit-marks.mjs              (writes scripts/lib/markEdges.json)
//   node scripts/make-marks.mjs --write
//
// WHY IT EXISTS. The must-box probe records LEAVES, so a plate carrying a word is not
// in mustBoxes at all — only the word is. make-marks could therefore see every word and
// every figure and not one of the plates those words sit on, and the first render
// showed what that costs: an underline laid along the bottom border of THE GENERAL
// WILL's plate, and a ring round REASONS cutting through the tick box beside it. Both
// passed every offline rule, because neither rule could see a border.
//
// So this walks each candidate beat in a browser and records every painted box near
// the label — anything with a visible border or a fill — in stage units, stamped with
// the lesson's must-box stamp. make-marks refuses a style whose box crosses one of
// those edges, refuses a beat that has not been audited, and check-marks re-derives
// both offline. A re-measured lesson changes its stamp, so its edges go stale and its
// marks go red until this is run again, which is the must-box rule applied one table
// further out.
//
// Ports 8867/9397. AUDIT_ONLY=<id,id> narrows it; LANES=2 runs two tabs.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';
import { claimRoute } from './lib/previewroute.mjs';
import { STAGE_W } from './lib/marks.mjs';

const REPO = process.cwd();
const CDP = +(process.env.CDP_PORT || 9397);
const WEB = +(process.env.WEB_PORT || 8867);
const LANES = +(process.env.LANES || 1);
const CANDS = path.join(REPO, 'scripts', '.mark-candidates.json');
const OUT = path.join(REPO, 'scripts/lib/markEdges.json');
/** How far round a label an edge can matter: the widest style reaches 34 units out. */
const REACH = 40;

if (!fs.existsSync(CANDS)) { console.error('no candidate list — run node scripts/make-marks.mjs first'); process.exit(1); }
const cands = JSON.parse(fs.readFileSync(CANDS, 'utf8'));
const only = process.env.AUDIT_ONLY ? new Set(process.env.AUDIT_ONLY.split(',')) : null;
const side = JSON.parse(fs.readFileSync(path.join(REPO, 'components/lesson/cinematic/mustBoxes.ts.json'), 'utf8'));
const prior = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : { stamps: {}, edges: {} };

// Only what is missing or stale, unless told otherwise.
const todo = Object.entries(cands)
  .filter(([id]) => !only || only.has(id))
  .filter(([id, beats]) => process.env.AUDIT_ALL || only
    || prior.stamps[id] !== side.stamps[id]
    || Object.keys(beats).some((b) => !prior.edges[id]?.[b] || prior.seen?.[id]?.[b] === undefined));
console.log(`${todo.length} lessons to audit (${Object.keys(cands).length} with candidates)`);
if (!todo.length) process.exit(0);

const ROUTE = 'app/previewmark.tsx';
const ROUTE_SRC = `// WRITTEN BY scripts/audit-marks.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { setCodaOff, setWanderOff } from '@/components/lesson/cinematic/tourFlag';

export default function PreviewMark() {
  const [go, setGo] = useState(false);
  useEffect(() => {
    useUserDataStore.setState({ _hasHydrated: true } as any);
    useUIStore.setState({ launchDone: true } as any);
    setGo(true);
  }, []);
  // THE FIGURE STANDS STILL FOR A MEASUREMENT. The movement layer (wander.ts) walks
  // him about, sits him down and turns him round, so a reading taken while he is
  // mid-step is a reading of one arbitrary frame of it. See tourFlag.ts.
  setWanderOff(true);
  // AND NEVER WITH THE CLOSING ENCOUNTER UP (group AJ). A harness that walks a lesson
  // to its last tap would mount the coda and record its figures and props as stage
  // art — a scene that only exists after the lesson is over, steering every table
  // derived from these boxes. See tourFlag.ts.
  setCodaOff(true);
  const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const id = q?.get('id') ?? '';
  const found = getLessonById(id);
  const Comp = (CINEMATIC as Record<string, any>)[id];
  if (!go || !found || !Comp) return <View style={{ flex: 1, backgroundColor: '#FAFAF7' }} />;
  return <Comp lesson={found.lesson} />;
}
`;
const { release, wrote } = claimRoute({ route: ROUTE, src: ROUTE_SRC, owner: 'audit-marks', keep: !!process.env.AUDIT_KEEP });

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const WS = (await import(pathToFileURL(path.join(REPO, 'node_modules/ws/index.js')).href)).default;

const TAP = `(() => { const w = innerWidth, h = innerHeight; const el = document.elementFromPoint(w / 2, h * 0.30);
  if (!el) return false; el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: w / 2, clientY: h * 0.30 })); return true; })()`;
// Scoped to the stage and the deck: the first button in the DOCUMENT is the back arrow.
const ANSWER_TARGET = `(() => { const clip = document.getElementById('stage-clip'); if (!clip) return '';
  const c = clip.getBoundingClientRect();
  const els = [...document.querySelectorAll('[role="button"],[tabindex]')]
    .filter((e) => e.getAttribute('data-testid') !== 'thinker-name')
    .filter((e) => e.getAttribute('aria-disabled') !== 'true')
    .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 24 && r.height > 10 && r.top >= c.top - 2 && r.top < c.bottom + 240; });
  if (!els.length) return ''; els[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true })); return 'target'; })()`;
const SIG = `(() => { const t = [...document.querySelectorAll('div,span')].map((e) => (e.children.length ? '' : e.textContent || '')).join('|'); return t.length + ':' + t.slice(0, 400); })()`;
const CAM = `(() => { const c = document.getElementById('stage-cam'); if (!c) return ''; const r = c.getBoundingClientRect(); return [r.x, r.y, r.width].map(Math.round).join('/'); })()`;

/**
 * Every painted box inside the camera layer near `near` ([x, y, w, h], stage units),
 * and how VISIBLE the named label itself is: the must-box probe records a word at any
 * opacity, so a label still waiting to fade in was being marked — the pen underlined
 * empty paper (metaphysics-being-10). `seen` is the label's own opacity, ancestors in.
 */
const EDGES = (near, label) => `(() => {
  const cam = document.getElementById('stage-cam');
  if (!cam) return null;
  const cr = cam.getBoundingClientRect();
  const k = cr.width / ${STAGE_W};
  const [nx, ny, nw, nh] = ${JSON.stringify(near)};
  const alpha = (c) => { const m = c && c.match(/rgba?\\(([^)]+)\\)/); if (!m) return 0; const p = m[1].split(',').map(Number); return p.length > 3 ? p[3] : 1; };
  const skip = new Set();
  for (const f of cam.querySelectorAll('[data-testid="figure"], #stage-mark')) { skip.add(f); for (const d of f.querySelectorAll('*')) skip.add(d); }
  const opacityOf = (el) => { let o = 1; for (let n = el; n && n !== cam; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o; };
  const out = [];
  for (const d of cam.querySelectorAll('div')) {
    if (skip.has(d)) continue;
    const s = getComputedStyle(d);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    const bw = Math.max(+parseFloat(s.borderTopWidth) || 0, +parseFloat(s.borderBottomWidth) || 0, +parseFloat(s.borderLeftWidth) || 0, +parseFloat(s.borderRightWidth) || 0);
    const border = bw >= 0.5 && Math.max(alpha(s.borderTopColor), alpha(s.borderBottomColor), alpha(s.borderLeftColor), alpha(s.borderRightColor)) > 0.15;
    const fill = alpha(s.backgroundColor) > 0.15;
    if (!border && !fill) continue;
    const r = d.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) continue;
    if (opacityOf(d) < 0.08) continue;
    const x = (r.x - cr.x) / k, y = (r.y - cr.y) / k, w = r.width / k, h = r.height / k;
    if (x > nx + nw + ${REACH} || x + w < nx - ${REACH} || y > ny + nh + ${REACH} || y + h < ny - ${REACH}) continue;
    // The border too: a plate's own border runs INSIDE its box, so a mark the plate
    // "contains" can still lie on it (lib/marks.mjs, penCrosses). And the corners: a
    // door's arch is a box with a 90-unit radius, and an arrow that clears the box's
    // corner still crosses the curve.
    const rad = (v) => { const n = parseFloat(v) || 0; return /%/.test(v) ? (n / 100) * Math.min(r.width, r.height) : n; };
    const radii = [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius]
      .map((v) => +(Math.min(rad(v), Math.min(r.width, r.height) / 2) / k).toFixed(1));
    out.push([+x.toFixed(1), +y.toFixed(1), +w.toFixed(1), +h.toFixed(1), border ? +(bw / k).toFixed(1) : 0, radii]);
  }
  const flat = (v) => (v || '').toLowerCase().replace(/\\s+/g, ' ').trim();
  const want = flat(${JSON.stringify(label)});
  // Any element whose whole text is the label (a wrapper with nested spans counts),
  // standing where the must-box recorded it. None there means the pen would ring the
  // spot a label is not at, which is the same fault as a label at opacity 0.
  const cx = nx + nw / 2, cy = ny + nh / 2;
  let seen = 0;
  for (const e of cam.querySelectorAll('div,span')) {
    if (skip.has(e)) continue;
    if (flat(e.textContent) !== want) continue;
    const r = e.getBoundingClientRect();
    const x = (r.x - cr.x) / k, y = (r.y - cr.y) / k, w = r.width / k, h = r.height / k;
    if (cx < x - 4 || cx > x + w + 4 || cy < y - 4 || cy > y + h + 4) continue;
    seen = Math.max(seen, opacityOf(e));
  }
  return JSON.stringify({ edges: out, seen: +seen.toFixed(2) });
})()`;

async function lane(queue, laneNo, result) {
  const tab = await put('/json/new?about:blank');
  const ws = new WS(tab.webSocketDebuggerUrl, { perMessageDeflate: false });
  let mid = 0; const pend = new Map();
  ws.on('message', (m) => { const x = JSON.parse(m); if (x.id && pend.has(x.id)) { pend.get(x.id)(x.result); pend.delete(x.id); } });
  const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
  await new Promise((r) => ws.on('open', r));
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  const ev = async (e) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r?.exceptionDetails ? null : r?.result?.value; };
  const settle = async () => { let last = null; for (let i = 0; i < 14; i++) { const now = await ev(CAM); if (now && now === last) return; last = now; await wait(400); } };

  let first = true;
  while (queue.length) {
    const [id, beats] = queue.shift();
    const want = Object.keys(beats).map(Number);
    const last = Math.max(...want);
    await send('Page.navigate', { url: `http://localhost:${WEB}/previewmark?id=${id}` });
    let ready = false;
    for (let i = 0; i < (first ? 260 : 90); i++) {
      if (await ev("document.getElementById('stage-clip') ? 1 : 0")) { ready = true; break; }
      if (i % 7 === 6 && (await ev("document.body.innerText.includes(\"doesn't exist\")"))) await send('Page.reload');
      await wait(700);
    }
    first = false;
    if (!ready) { console.log(`  [${laneNo}] ${id}: NEVER RENDERED A STAGE`); result.failed.push(id); continue; }
    await wait(1200);
    const got = {};
    const seenOf = {};
    let sig = await ev(SIG);
    let stuck = false;
    for (let b = 0; b <= last && !stuck; b++) {
      if (want.includes(b)) {
        await settle();
        await wait(900);
        const raw = await ev(EDGES(beats[b].b, beats[b].t));
        if (raw) { const r = JSON.parse(raw); got[b] = r.edges; (seenOf[b] = r.seen); }
      }
      if (b === last) break;
      await ev(TAP); await wait(650);
      let now = await ev(SIG);
      if (now === sig) {
        (await ev(ANSWER_CONTROL)) || (await ev(ANSWER_TARGET));
        await wait(1000); await ev(TAP); await wait(700);
        now = await ev(SIG);
      }
      if (now === sig) { await wait(1200); await ev(TAP); await wait(700); now = await ev(SIG); }
      if (now === sig) { stuck = true; console.log(`  [${laneNo}] ${id}: STUCK after beat ${b}`); }
      sig = now;
    }
    const n = Object.keys(got).length;
    console.log(`  [${laneNo}] ${id}: ${n}/${want.length} beats audited`);
    if (n === want.length) { result.edges[id] = got; result.seen[id] = seenOf; result.stamps[id] = side.stamps[id]; } else result.failed.push(id);
  }
  ws.close();
  try { await new Promise((res) => http.get(`http://127.0.0.1:${CDP}/json/close/${tab.id}`, res).on('error', res)); } catch {}
}

if (wrote) { console.log('waiting for Metro to register the route'); await wait(6000); }
const result = { edges: {}, seen: {}, stamps: {}, failed: [] };
const queue = [...todo];
await Promise.all(Array.from({ length: LANES }, (_, k) => lane(queue, k + 1, result)));

// Merge: what this run audited replaces what was there; everything else is kept.
const merged = {
  stamps: { ...prior.stamps, ...result.stamps },
  edges: { ...prior.edges, ...result.edges },
  seen: { ...(prior.seen || {}), ...result.seen },
};
for (const id of result.failed) { delete merged.stamps[id]; delete merged.edges[id]; delete merged.seen[id]; }
const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(OUT, `${JSON.stringify({ note: 'GENERATED by scripts/audit-marks.mjs. Painted boxes near each pen-mark candidate, in stage units, per lesson and beat, and how visible the named label is (seen, 0..1).', stamps: sorted(merged.stamps), edges: sorted(merged.edges), seen: sorted(merged.seen) })}\n`);
console.log(`\nwrote ${path.relative(REPO, OUT)}: ${Object.keys(result.edges).length} audited, ${result.failed.length} failed${result.failed.length ? ` (${result.failed.join(', ')})` : ''}`);
release();
process.exit(result.failed.length ? 1 : 0);
