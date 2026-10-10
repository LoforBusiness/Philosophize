// HOW SMOOTH A LESSON PLAYS: frame times, beat by beat, in a CPU-throttled browser.
//
//   npx expo start --web --port 8861 --clear
//   chrome --headless=new --remote-debugging-port=9411 --user-data-dir=<tmp>
//   node scripts/perf-lesson.mjs <lesson-id> [beats=10] [throttle=4]
//
// The browser is not the phone, but it runs the same React tree and the same
// worklets on one thread, so a lesson that drops frames here at 4× CPU is the one
// that stutters on a mid-range Android. Compare lessons against each other, never
// against an absolute number. Prints, per beat: frames, median and p95 gap, the
// worst gap, how many frames took over 34 ms (two vsyncs), and the DOM size.
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { claimRoute } from './lib/previewroute.mjs';

const REPO = process.cwd();
const CDP = +(process.env.CDP_PORT || 9411);
const WEB = +(process.env.WEB_PORT || 8861);
const ROUTE = process.env.PERF_ROUTE || 'previewperf';
const [LESSON, NB = '10', TH = '4'] = process.argv.slice(2);
if (!LESSON) { console.log('usage: node scripts/perf-lesson.mjs <lesson-id> [beats] [throttle]'); process.exit(1); }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on("end", () => { try { res(JSON.parse(d)); } catch { res(d); } });
  });
  r.on('error', rej); r.end();
});
const WS = (await import(pathToFileURL(path.join(REPO, 'node_modules/ws/index.js')).href)).default;
const { release } = claimRoute({
  route: `app/${ROUTE}.tsx`, owner: 'perf-lesson',
  src: `// WRITTEN BY scripts/perf-lesson.mjs — deleted again when it finishes.
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getLessonById } from '@/data/index';
import { CINEMATIC } from './(app)/branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';

export default function PreviewPerf() {
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
`,
});
process.on('exit', release);
const tab = await put('/json/new?about:blank');
const ws = new WS(tab.webSocketDebuggerUrl, { perMessageDeflate: false });
let mid = 0; const pend = new Map();
ws.on('message', (m) => { const x = JSON.parse(m); if (x.id && pend.has(x.id)) { pend.get(x.id)(x.result); pend.delete(x.id); } });
const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
await new Promise((r) => ws.on('open', r));
await send('Page.enable'); await send('Runtime.enable');
await send('Emulation.setFocusEmulationEnabled', { enabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
const ev = async (e) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); return r?.exceptionDetails ? null : r?.result?.value; };
const url = `http://localhost:${WEB}/${ROUTE}?id=${LESSON}${process.env.PERF_Q || ""}`;
await send('Page.navigate', { url });
let ok = false;
for (let i = 0; i < 120; i++) {
  if ((await ev("document.getElementById('stage-clip') ? 1 : 0")) === 1) { ok = true; break; }
  if (i && i % 8 === 0) await send('Page.navigate', { url });
  await wait(1000);
}
if (!ok) { console.log(`${LESSON}: never rendered a stage`); await put(`/json/close/${tab.id}`).catch(() => {}); process.exit(1); }
await wait(4000);
if (process.env.PERF_CSS) await ev(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(process.env.PERF_CSS)}; document.head.appendChild(s); return 1; })()`);
await send('Emulation.setCPUThrottlingRate', { rate: +TH });
if (process.env.PERF_DIFF) {
  const r = await ev(`new Promise((res) => { const figs = [...document.querySelectorAll('[data-testid="figure"]')];
    const el = figs[+(${JSON.stringify(process.env.PERF_DIFF)})] ; const kids = [...el.querySelectorAll('div')].slice(0, 6);
    const snap = () => kids.map((k) => k.getAttribute('style'));
    const a = snap(); setTimeout(() => { const b = snap(); res({ n: figs.length, a: a.slice(0,3), b: b.slice(0,3) }); }, 500); })`);
  console.log(JSON.stringify(r, null, 1)); process.exit(0);
}

const TAP_EARLY = `(() => { const c = document.getElementById('stage-clip'); if (!c) return 0; const r = c.getBoundingClientRect();
  const el = document.elementFromPoint(innerWidth * 0.8, r.top + r.height * 0.5); if (!el) return 0;
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: innerWidth * 0.8, clientY: r.top + r.height / 2 })); return 1; })()`;
if (process.env.PERF_RENDERS) {
  await wait(3000);
  const a0 = await ev('globalThis.__sr || 0'); await ev(TAP_EARLY); await wait(2000); const r = (await ev('globalThis.__sr || 0')) - a0;
  console.log('Stickman renders in 2 s:', r, JSON.stringify(await ev('globalThis.__why'))); process.exit(0);
}

if (process.env.PERF_SCENE) {
  await wait(2500);
  const r = await ev(`new Promise((res) => { const seen = new Map();
    const mo = new MutationObserver((ms) => { for (const m of ms) seen.set(m.target, (seen.get(m.target) || 0) + 1); });
    mo.observe(document.body, { attributes: true, attributeFilter: ['style'], subtree: true });
    setTimeout(() => { mo.disconnect(); const out = [];
      for (const [el, c] of seen) { if (el.closest('[data-testid="figure"]')) continue;
        const d = el.querySelectorAll('*').length; const imgs = el.querySelectorAll('img').length;
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const k of [el, ...el.querySelectorAll('*')]) { const b = k.getBoundingClientRect(); if (b.width * b.height === 0) continue; x0 = Math.min(x0, b.left); y0 = Math.min(y0, b.top); x1 = Math.max(x1, b.right); y1 = Math.max(y1, b.bottom); }
        out.push({ c, d, imgs, box: Math.round(x1 - x0) + 'x' + Math.round(y1 - y0), st: (el.getAttribute('style') || '').replace(/.*transform: /, '').slice(0, 70) }); }
      out.sort((a, b) => b.d - a.d); res(out.slice(0, 25)); }, 2000); })`);
  for (const o of r) console.log(String(o.c).padStart(4), 'desc', String(o.d).padStart(4), 'img', o.imgs, o.box.padStart(9), o.st);
  process.exit(0);
}

if (process.env.PERF_MUT) {
  const r = await ev(`new Promise((res) => { const seen = new Map(); let n = 0;
    const mo = new MutationObserver((ms) => { for (const m of ms) { n++; const el = m.target; seen.set(el, (seen.get(el) || 0) + 1); } });
    mo.observe(document.body, { attributes: true, attributeFilter: ['style'], subtree: true });
    setTimeout(() => { mo.disconnect();
      const fig = (el) => { let e = el; for (let i = 0; i < 12 && e; i++, e = e.parentElement) { if (e.getAttribute && e.getAttribute('data-testid') === 'figure') return 'figure'; } return 'scene'; };
      let figEls = 0, sceneEls = 0, figM = 0, sceneM = 0; const big = [];
      for (const [el, c] of seen) { const k = fig(el); if (k === 'figure') { figEls++; figM += c; } else { sceneEls++; sceneM += c; const r = el.getBoundingClientRect(); big.push([Math.round(r.width) + 'x' + Math.round(r.height), c, el.tagName]); } }
      big.sort((a, b) => parseInt(b[0]) * parseInt(b[0].split('x')[1]) - parseInt(a[0]) * parseInt(a[0].split('x')[1]));
      res({ mutations: n, figEls, figM, sceneEls, sceneM, biggest: big.slice(0, 12) }); }, 2000); })`);
  console.log(JSON.stringify(r, null, 1)); process.exit(0);
}

const PROF = process.env.PERF_PROFILE;
if (PROF) {
  await send('Profiler.enable'); await send('Profiler.setSamplingInterval', { interval: 200 });
  await send('Profiler.start'); if (PROF === 'tap') { await wait(300); await ev(TAP_EARLY); await wait(2500); } else await wait(4000);
  const { profile } = await send('Profiler.stop');
  const self = new Map(); const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const dt = profile.timeDeltas; const counts = new Map();
  profile.samples.forEach((s, i) => counts.set(s, (counts.get(s) || 0) + (dt[i] || 0)));
  for (const [id, t] of counts) { const n = byId.get(id); const cf = n.callFrame; const key = `${cf.functionName || '(anon)'} ${cf.url.split('/').pop().split('?')[0]}:${cf.lineNumber}`; self.set(key, (self.get(key) || 0) + t); }
  const tot = [...self.values()].reduce((a, b) => a + b, 0);
  [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).forEach(([k, t]) => console.log(`  ${(100 * t / tot).toFixed(1).padStart(5)}%  ${k}`));
  process.exit(0);
}

const REC = `new Promise((res) => { const g = []; let last = performance.now(); const t0 = last;
  const f = (t) => { g.push(t - last); last = t; if (t - t0 < 3200) requestAnimationFrame(f); else res(g); };
  requestAnimationFrame(f); })`;
const TAP = `(() => { const c = document.getElementById('stage-clip'); if (!c) return 0; const r = c.getBoundingClientRect();
  const el = document.elementFromPoint(innerWidth * 0.8, r.top + r.height * 0.5); if (!el) return 0;
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, clientX: innerWidth * 0.8, clientY: r.top + r.height / 2 })); return 1; })()`;
const all = [];
console.log(`${LESSON} at ${TH}× CPU`);
for (let b = 0; b < +NB; b++) {
  const g = (await ev(REC)) || [];
  const s = [...g].sort((x, y) => x - y);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))] || 0;
  const slow = g.filter((x) => x > 34).length;
  const dom = await ev("document.querySelectorAll('*').length");
  all.push(...g);
  console.log(`  beat ${String(b).padStart(2)}  frames ${String(g.length).padStart(3)}  med ${q(0.5).toFixed(1)}  p95 ${q(0.95).toFixed(1)}  worst ${Math.max(0, ...g).toFixed(0)}  >34ms ${slow}  dom ${dom}`);
  await ev(TAP); await wait(150);
}
const s = all.sort((x, y) => x - y);
console.log(`  ALL  median ${s[Math.floor(s.length / 2)].toFixed(1)} ms  p95 ${s[Math.floor(s.length * 0.95)].toFixed(1)} ms  >34ms ${(100 * all.filter((x) => x > 34).length / all.length).toFixed(1)}%`);
await send('Emulation.setCPUThrottlingRate', { rate: 1 });
await put(`/json/close/${tab.id}`).catch(() => {});
process.exit(0);
