// DOES THE READING ABOVE A CONTROL CHANGE SMOOTHLY WHEN A THUMB SWEEPS IT?
//
//   "when you start to move them, the words above it that change as you move it
//    start to stutter and start to glitch, and you can't even read what's going
//    on when you do that … the lever looks okay … it's a lot with the line"
//
// A rail is continuous where a lever has three detents, so a thumb crossing the
// width crosses every zone in a few hundred milliseconds — and the reading was
// being swapped from REACT STATE, which made each crossing a hard cut, a vertical
// re-centring, and a re-render of a component that builds its Gesture inline while
// a finger is down on it. See components/lesson/cinematic/ControlRead.
//
// This drives a real pointer sweep at a human speed and samples the reading every
// animation frame. A CUT shows as an opacity stepping ~1.0 between two frames; a
// JUMP shows as the box top moving at all.
//
//   npx expo start --web --port 8861 --clear
//   chrome --headless=new --remote-debugging-port=9391 --user-data-dir=<tmp>
//   node scripts/sweep-read.mjs metaphysics-being-36
//
// COUNTER-TESTED by setting ControlRead's XFADE to 0 and watching the step go to
// 1.000 — a probe that cannot see the defect is not a probe (§21).
//
// It is NOT in `npm run check`, because it needs Metro and a browser. The rule it
// protects IS: `check:controls` asserts offline that no control hands the reading
// a plain number, which is the only way the stutter can come back.

import fs from 'node:fs';
import http from 'node:http';
import { claimRoute } from './lib/previewroute.mjs';

const ID = process.argv[2];
const PORT = +(process.env.CDP_PORT || 9391);
const WEB = +(process.env.WEB_PORT || 8861);
const ROUTE_NAME = process.env.SWEEP_ROUTE || 'previewsweep';
const ROUTE = `app/${ROUTE_NAME}.tsx`;

const src = fs.readFileSync('scripts/check-readable.mjs', 'utf8');
const m = /const ROUTE_SRC = `([\s\S]*?)\n`;\n/.exec(src);
const ROUTE_SRC = m[1].replace(/\\`/g, '`').replace(/\\\$/g, '$');
const { release, wrote } = claimRoute({ route: ROUTE, src: ROUTE_SRC, owner: 'sweep' });
if (wrote) await new Promise((r) => setTimeout(r, 25000));

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: PORT, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  }); r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const tab = await put('/json/new?about:blank');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const waiting = new Map();
ws.onmessage = (e) => { const d = JSON.parse(e.data); if (waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); } };
const send = (method, params) => new Promise((res) => { const k = ++id; waiting.set(k, res); ws.send(JSON.stringify({ id: k, method, params })); });
const evaluate = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true });
  if (r?.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'threw');
  return r?.result?.result?.value;
};
await send('Runtime.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setFocusEmulationEnabled', { enabled: true });
await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE_NAME}?id=${encodeURIComponent(ID)}&notour=1` });

for (let i = 0; i < 240; i += 1) {
  if (await evaluate("!!document.getElementById('stage-clip')")) break;
  await wait(1000);
}
await wait(2500);

const IDS = ['drag-strip', 'split-bar', 'lever-arc', 'shape-plot', 'field-pad'];
const found = () => evaluate(`(() => {
  for (const id of ${JSON.stringify(IDS)}) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().width > 20) return id;
  } return ''; })()`);

const prog = () => evaluate(`(() => { const b=document.getElementById('beat-progress');
  try { if (b) { const t=getComputedStyle(b).transform; if (t&&t!=='none') return new DOMMatrixReadOnly(t).a; } } catch(e){} return -1; })()`);

let ctl = '';
for (let b = 0; b < 12; b += 1) {
  ctl = await found();
  if (ctl) break;
  const before = await prog();
  let moved = false;
  for (let t = 0; t < 8 && !moved; t += 1) {
    if (t === 2) {
      await evaluate(`(() => { const r=document.querySelector('#target-ring');
        if (r && r.parentElement) { r.parentElement.dispatchEvent(new MouseEvent('click',{bubbles:true})); return 1; }
        const c=[...document.querySelectorAll('[role="button"]')].find((e)=>{const q=e.getBoundingClientRect(); return q.width>60&&q.height>28;});
        if (c) { c.dispatchEvent(new MouseEvent('click',{bubbles:true})); return 1; } return 0; })()`);
      await wait(1200);
    }
    await evaluate(`(() => { const el=document.elementFromPoint(195,700)||document.body;
      el.dispatchEvent(new MouseEvent('click',{bubbles:true})); return 1; })()`);
    await wait(1600);
    if (await prog() !== before) moved = true;
  }
  if (!moved) break;
}
if (!ctl) { console.log('no control reached'); ws.close(); release(); process.exit(1); }
console.log('control:', ctl);

// Drive a slow sweep IN THE PAGE and sample every animation frame — a sample loop
// driven over CDP could never keep up with 60fps.
const out = await evaluate(`(async () => {
  const el = document.getElementById(${JSON.stringify(ctl)});
  const r = el.getBoundingClientRect();
  const lower = document.getElementById('lower-deck');
  // The reading is the block of stacked layers directly above the control.
  const layersOf = () => {
    const box = document.getElementById('control-read');
    if (!box) return [];
    return [...box.children].map((c) => ({
      t: (c.textContent || '').trim().slice(0, 24),
      o: +parseFloat(getComputedStyle(c).opacity).toFixed(3),
      top: Math.round(c.getBoundingClientRect().top * 10) / 10,
    }));
  };
  const opts = (x, y, down) => ({ bubbles: true, cancelable: true, composed: true,
    clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true, buttons: down ? 1 : 0 });
  const y = r.top + r.height / 2;
  const x0 = r.left + 4, x1 = r.right - 4;
  const frames = [];
  const MS = 1500;
  el.dispatchEvent(new PointerEvent('pointerdown', opts(x0, y, true)));
  const t0 = performance.now();
  await new Promise((done) => {
    const step = () => {
      const u = Math.min(1, (performance.now() - t0) / MS);
      el.dispatchEvent(new PointerEvent('pointermove', opts(x0 + (x1 - x0) * u, y, true)));
      frames.push({ u: +u.toFixed(3), L: layersOf() });
      if (u < 1) requestAnimationFrame(step); else done();
    };
    requestAnimationFrame(step);
  });
  // Do NOT release: releasing commits the answer and the readout stops being live.
  el.dispatchEvent(new PointerEvent('pointercancel', opts(x1, y, false)));
  return frames;
})()`);
ws.close();
release();

if (!out || !out.length) { console.log('no frames'); process.exit(1); }
console.log(`${out.length} frames over the sweep\n`);

// ── what a hard cut looks like: a layer's opacity stepping by ~1 in one frame ──
let worstJump = 0, worstAt = null, tops = new Set(), maxStep = 0;
const seq = [];
for (let i = 1; i < out.length; i += 1) {
  const a = new Map(out[i - 1].L.map((l) => [l.t, l]));
  for (const l of out[i].L) {
    tops.add(l.top);
    const p = a.get(l.t);
    if (!p) continue;
    const d = Math.abs(l.o - p.o);
    if (d > maxStep) { maxStep = d; worstAt = `u=${out[i].u} "${l.t}"`; }
  }
  const lit = out[i].L.filter((l) => l.o > 0.5).map((l) => l.t).join(' | ');
  if (!seq.length || seq[seq.length - 1] !== lit) seq.push(lit);
}
const topsArr = [...tops].sort((a, b) => a - b);
worstJump = topsArr.length ? topsArr[topsArr.length - 1] - topsArr[0] : 0;

console.log(`readings seen, in order:`);
for (const s of seq) console.log(`   ${s || '(none above 0.5)'}`);
console.log(`\n  biggest opacity step between two frames  ${maxStep.toFixed(3)}   ${worstAt ?? ''}`);
console.log(`  distinct box tops                       ${topsArr.length}  (spread ${worstJump.toFixed(1)}px)`);
console.log(maxStep <= 0.35 && worstJump <= 0.5
  ? '\n  ok    the reading dissolves and never moves.\n'
  : '\n  LOOK  a step over 0.35 is a cut; any spread in top is a jump.\n');
