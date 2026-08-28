// LOOK AT THE INSIGHTS DIAL, AND MEASURE IT.
//
// The chart at the top of the Insights instrument has been rebuilt twice on a
// reader's say-so — first from a flat pie of six saturated fills on paper ("too
// kidesh"), then from a thin ring to a struck one. Neither round could be judged
// without a phone, which is how a chart stays flat for months.
//
// It reports what a screenshot does not answer by itself:
//   · did React actually mount;
//   · is anything wider than the viewport, or cut off inside its own box;
//   · WHAT THE CHART IS ACTUALLY MADE OF — every path, its fill and its box —
//     so "does it have depth" is a count of drawn surfaces rather than a feeling.
//
// USAGE — ports default away from every other harness (8847/9382, 8852/9392,
// 8853/9393, 8873/9398):
//   npx expo start --web --port 8879 --clear
//   curl -s -o /dev/null "http://localhost:8879/index.bundle?platform=web&dev=true"
//   chrome --headless=new --remote-debugging-port=9399 --user-data-dir=<tmp>
//   node scripts/sheet-dial.mjs
//   ONLY=skew node scripts/sheet-dial.mjs        one case while iterating
//
// It writes app/previewdial.tsx on the way in and DELETES it on the way out —
// any file in app/ is a real route and would ship if left behind (§21).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import WSpkg from 'ws';
import { claimRoute } from './lib/previewroute.mjs';

const WebSocket = WSpkg.WebSocket ?? WSpkg;
const CDP = +(process.env.CDP_PORT || 9399);
const WEB = +(process.env.WEB_PORT || 8879);
const OUT = process.env.OUT_DIR || 'scripts/.dial-shots';
const DEVICE_W = +(process.env.DEVICE_W || 390);
const MOUNT_TRIES = +(process.env.MOUNT_TRIES || 320);

const ROUTE = 'app/previewdial.tsx';
const SRC = fs.readFileSync(path.join(process.cwd(), 'scripts/lib/previewdial.txt'), 'utf8');

const CASES = [
  // A mid-journey reader: one branch well ahead, a long tail behind it.
  { key: 'skew', q: 'shape=skew', want: ['WHERE YOUR READING GOES', 'LESSONS'] },
  // Six near-equal shares — the hardest case for any round chart, because every
  // boundary matters and none of them is obvious.
  { key: 'even', q: 'shape=even', want: ['WHERE YOUR READING GOES'] },
  // Day one. The shape has to be legible with nothing in it at all.
  { key: 'empty', q: 'empty=1', want: ['WHERE YOUR READING GOES'] },
  // A WEDGE CHOSEN. The lift is the gesture that makes the chart an object
  // rather than a picture of one, and it is also the only test of the hit
  // testing -- which happens in the ELLIPSE'S own space, not the screen's, so a
  // version that forgot to divide by the tilt would pick the wrong wedge for
  // every tap above or below the middle and look almost right doing it.
  { key: 'chosen', q: 'shape=skew', tap: true, want: ['WHERE YOUR READING GOES'] },
];

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c));
    x.on('end', () => { try { res(JSON.parse(d)); } catch { res(null); } });
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ── the probe ────────────────────────────────────────────────────────────────
const PROBE = `(() => {
  const root = document.getElementById('dial-root');
  if (!root) return JSON.stringify({ mounted: false });
  const vw = document.documentElement.clientWidth;
  const overflow = [];
  const clipped = [];

  for (const el of root.querySelectorAll('*')) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) continue;
    if (r.right > vw + 1 || r.left < -1) {
      let n = el.parentElement, by = null;
      while (n && n !== document.body) {
        const ps = getComputedStyle(n);
        if (ps.overflow === 'hidden' || ps.overflowX === 'hidden') { by = n; break; }
        n = n.parentElement;
      }
      if (!by) overflow.push({ text: (el.textContent || '').trim().slice(0, 30), left: Math.round(r.left), right: Math.round(r.right) });
    }
    const t = (el.textContent || '').trim();
    if (el.childElementCount === 0 && t) {
      const over = el.scrollWidth - el.clientWidth;
      if (over > 1 && s.overflow !== 'hidden' && s.textOverflow !== 'ellipsis') {
        clipped.push({ text: t.slice(0, 30), over: Math.round(over) });
      }
      const clamp = +s.webkitLineClamp || 0;
      if (clamp > 0 && el.scrollHeight > el.clientHeight + 1) {
        clipped.push({ text: t.slice(0, 30), over: Math.round(el.scrollHeight - el.clientHeight) });
      }
    }
  }

  // ── WHAT THE CHART IS MADE OF ───────────────────────────────────────────
  //
  // "Does it have depth" is not a feeling once you count the surfaces. A flat
  // pie is N filled wedges and nothing else; a struck one has a wall and a rim
  // per wedge and a shadow under the whole thing. Counted here so the answer
  // survives somebody's screenshot looking fine.
  const dial = document.getElementById('dial');
  let chart = null;
  if (dial) {
    // EVERY surface, not the first one. The dial is one Svg per wedge now, so
    // querySelector on the first one reads the SHEEN and reports a chart made of
    // a single mark -- the same blindness §21 records for a bare
    // document.querySelector(svg) reading tick marks off the old ring.
    // (No backticks in here: this whole probe is a template literal.)
    const svgs = [...dial.querySelectorAll('svg')];
    const paths = svgs.flatMap((s2) => [...s2.querySelectorAll('path,circle,ellipse,line')]);
    const fills = {};
    for (const p of paths) {
      const f = (p.getAttribute('fill') || getComputedStyle(p).fill || '').trim();
      if (!f || f === 'none') continue;
      fills[f] = (fills[f] || 0) + 1;
    }
    const b = dial.getBoundingClientRect();
    chart = {
      box: { w: Math.round(b.width), h: Math.round(b.height) },
      marks: paths.length,
      filled: Object.values(fills).reduce((a, n) => a + n, 0),
      surfaces: svgs.length,
      gradients: svgs.reduce((n, s2) => n + s2.querySelectorAll('linearGradient,radialGradient').length, 0),
      distinctFills: Object.keys(fills).length,
    };
  }

  return JSON.stringify({
    mounted: true, vw,
    docWider: document.documentElement.scrollWidth > vw + 1,
    height: Math.round(root.getBoundingClientRect().height),
    content: Math.max(...[...root.querySelectorAll('*')]
      .map((e) => (e.scrollHeight > e.clientHeight + 1 ? e.scrollHeight : 0)), root.scrollHeight, 0),
    overflow, clipped, chart,
    text: root.innerText.replace(/\\s+/g, ' ').trim().slice(0, 3000),
  });
})()`;

let bad = 0;
const ok = (cond, msg, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${msg}${detail ? `  — ${detail}` : ''}`);
};

const { release } = claimRoute({ route: ROUTE, src: SRC, owner: 'sheet-dial', keep: !!process.env.DIAL_KEEP });
fs.mkdirSync(OUT, { recursive: true });

try {
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  const list = only.length ? CASES.filter((c) => only.includes(c.key)) : CASES;
  if (only.length && list.length !== only.length) {
    console.log(`unknown case(s): ${only.filter((k) => !CASES.some((c) => c.key === k)).join(' ')}`);
    process.exit(1);
  }

  const tab = await put('/json/new?about:blank');
  const ws = new WebSocket(tab.webSocketDebuggerUrl, { perMessageDeflate: false, maxPayload: 268435456 });
  let id = 0;
  const pending = new Map();
  ws.on('message', (m) => {
    const msg = JSON.parse(m.toString());
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  await new Promise((r) => ws.on('open', r));
  const send = (method, params = {}) => new Promise((res, rej) => {
    const n = ++id;
    pending.set(n, (m) => (m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)));
    ws.send(JSON.stringify({ id: n, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  // Only the front tab of a headless window is laid out; a background one never
  // fires its ResizeObserver, so every rect comes back zero (measure-must).
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {});

  for (const sc of list) {
    console.log(`\n${sc.key}`);
    await send('Emulation.setDeviceMetricsOverride', { width: DEVICE_W, height: 844, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: `http://localhost:${WEB}/previewdial?${sc.q}` });

    let up = false;
    for (let i = 0; i < MOUNT_TRIES && !up; i++) {
      const probe = await send('Runtime.evaluate', {
        expression: `(() => { const e = document.getElementById('dial-root');
          return e ? e.getBoundingClientRect().height : 0; })()`,
        returnByValue: true,
      });
      up = (probe?.result?.value ?? 0) > 100;
      if (!up) await wait(250);
    }
    // The instrument's entrance sweep plus the curtain; longer than the others
    // on purpose, because this screen animates on arrival.
    await wait(2600);

    // A SYNTHETIC `click` IS THE ONLY THING A Pressable HEARS on
    // react-native-web (§21) -- CDP's Input.dispatchMouseEvent does nothing at
    // all. Aimed at the lower-right of the lid, which on a disc that starts at
    // 12 o'clock and runs clockwise is inside the first and largest wedge.
    if (sc.tap) {
      const hit = await send('Runtime.evaluate', {
        expression: `(() => {
          const d = document.getElementById('dial');
          if (!d) return 'no dial';
          const b = d.getBoundingClientRect();
          const x = b.left + b.width * 0.68, y = b.top + b.height * 0.42;
          const el = document.elementFromPoint(x, y);
          if (!el) return 'nothing at the point';
          // A PRESS NEEDS COORDINATES, and .click() has none. This dial decides
          // WHICH wedge from where the finger landed, so a bare .click() -- the
          // gesture sheet-pass uses, correctly, for a plain button -- arrives at
          // (0, 0), which is outside the lid, and the press is refused. It looks
          // exactly like a tap that never happened. Pointer events first (RNGH
          // and RNW both listen on them), then the click RNW's Pressable wants,
          // all carrying the same point.
          const opts = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, isPrimary: true, button: 0 };
          el.dispatchEvent(new PointerEvent('pointerdown', opts));
          el.dispatchEvent(new PointerEvent('pointerup', opts));
          el.dispatchEvent(new MouseEvent('click', opts));
          return 'clicked';
        })()`,
        returnByValue: true,
      });
      ok(hit?.result?.value === 'clicked', 'a wedge can be tapped', String(hit?.result?.value));
      await wait(1100);

      // AND IT ACTUALLY MOVED. A tap that is received and changes nothing looks
      // identical to a tap that was never received, which is exactly what the
      // first run of this case reported -- "clicked", and two screenshots the
      // eye could not tell apart.
      const moved = await send('Runtime.evaluate', {
        expression: `(() => {
          const d = document.getElementById('dial');
          const rows = [...d.children].map((c) => {
            const s = getComputedStyle(c);
            const m = new DOMMatrixReadOnly(s.transform === 'none' ? '' : s.transform);
            return { dx: +m.e.toFixed(1), dy: +m.f.toFixed(1), op: +(+s.opacity).toFixed(2) };
          });
          return JSON.stringify(rows);
        })()`,
        returnByValue: true,
      });
      const rows = JSON.parse(moved?.result?.value ?? '[]');
      const slid = rows.filter((r) => Math.abs(r.dx) > 1 || Math.abs(r.dy) > 1);
      const dim = rows.filter((r) => r.op < 0.9);
      ok(slid.length === 1, 'exactly one wedge slid out',
        rows.map((r) => `${r.dx},${r.dy}@${r.op}`).join(' | '));
      ok(dim.length >= 1, 'and the rest stepped back', `${dim.length} dimmed`);
    }

    const { result } = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    let r;
    try { r = JSON.parse(result.value); } catch { r = { mounted: false }; }

    ok(r.mounted, 'React mounted and the screen drew itself',
      r.mounted ? `${r.content}px of content` : 'no #dial-root — a module or render fault');
    if (!r.mounted) continue;

    ok(!r.docWider, 'the page does not scroll sideways', `doc vs ${r.vw}`);
    ok(r.overflow.length === 0, 'nothing sticks out past the viewport',
      r.overflow.slice(0, 3).map((o) => `"${o.text}" ${o.left}–${o.right}`).join(' · ') || 'clear');
    ok(r.clipped.length === 0, 'no line of text is cut off inside its own box',
      r.clipped.slice(0, 3).map((c) => `"${c.text}" +${c.over}px`).join(' · ') || 'clear');
    for (const w of sc.want) ok(r.text.includes(w), `it says "${w}"`);

    if (r.chart) {
      console.log(`        chart ${r.chart.box.w}x${r.chart.box.h}  ${r.chart.surfaces} surfaces, ${r.chart.marks} marks, `
        + `${r.chart.filled} filled, ${r.chart.gradients} gradients, ${r.chart.distinctFills} distinct fills`);
    } else {
      ok(false, 'the dial carries its nativeID', '#dial not found — a harness cannot find the chart');
    }

    await send('Emulation.setDeviceMetricsOverride', {
      width: DEVICE_W,
      height: Math.min(6000, Math.max(900, (r.content || r.height) + 80)),
      deviceScaleFactor: 2, mobile: true,
    });
    await wait(700);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const file = path.join(OUT, `${sc.key}.png`);
    fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.log(`        → ${file}`);
  }

  await put(`/json/close/${tab.id}`);
  ws.close();
} finally {
  release();
}

console.log(bad === 0 ? '\nPASS — the dial renders and fits.' : `\nFAILED — ${bad} problem(s).`);
process.exit(bad === 0 ? 0 : 1);
