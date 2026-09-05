// DOES ANYTHING ON THE INSIGHTS TAB STILL GO PAST ITSELF?
//
// `check-stats.mjs` holds the arithmetic offline — no spring under a damping
// ratio of 1. This is the other half: it plays the tab for real and watches
// EVERY transformed element frame by frame, so a curve applied wrongly, a Moti
// default nobody read, or an overshoot that arrives from somewhere neither of us
// thought to look is still caught.
//
// The test is general and needs no list of components: for every element that
// moves, compare the largest value it ever reached with the value it finally
// rests at. Anything that goes past its own resting value and comes back has
// overshot, whatever produced it.
//
//   node scripts/sheet-reveal.mjs        (Metro on 8879, Chrome on 9399)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import WSpkg from 'ws';

const WebSocket = WSpkg.WebSocket ?? WSpkg;
const CDP = +(process.env.CDP_PORT || 9399);
const WEB = +(process.env.WEB_PORT || 8879);
const ROUTE = 'app/previewreveal.tsx';
const SRC = fs.readFileSync(path.join(process.cwd(), 'scripts/lib/previewdial.txt'), 'utf8')
  .replace('export default function PreviewDial', 'export default function PreviewReveal');

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c));
    x.on('end', () => { try { res(JSON.parse(d)); } catch { res(null); } });
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// The sampler. Installed before the document runs, so it is already recording
// when React draws its first frame — the whole point, since the defect being
// hunted lives in the first second.
const SAMPLER = `
window.__rev = { rows: new Map(), t0: performance.now(), frames: 0 };
(function loop() {
  requestAnimationFrame(loop);
  const R = window.__rev;
  R.frames++;
  const root = document.getElementById('dial-root');
  if (!root) return;
  const now = performance.now() - R.t0;
  for (const el of root.querySelectorAll('*')) {
    const s = getComputedStyle(el);
    const tr = s.transform;
    const op = parseFloat(s.opacity);
    const moving = tr && tr !== 'none';
    if (!moving && !(op < 0.999)) continue;
    let key = el.__revk;
    if (!key) {
      var own = (el.childElementCount === 0 ? (el.textContent || '') : '').trim().slice(0, 20);
      var near = own || (el.textContent || '').trim().slice(0, 20);
      key = (el.id || (el.tagName.toLowerCase() + '#' + (R.rows.size + 1)))
        + (near ? ' "' + near + '"' : '');
      el.__revk = key;
    }
    let m11 = 1, m22 = 1, tx = 0, ty = 0;
    if (moving) {
      const m = tr.match(/matrix\\(([^)]+)\\)/);
      if (m) {
        const v = m[1].split(',').map(Number);
        m11 = v[0]; m22 = v[3]; tx = v[4]; ty = v[5];
      }
    }
    let row = R.rows.get(key);
    if (!row) { row = { key, n: 0, sx: [], sy: [], tx: [], ty: [], op: [] }; R.rows.set(key, row); }
    row.n++;
    row.sx.push(m11); row.sy.push(m22); row.tx.push(tx); row.ty.push(ty); row.op.push(op);
    row.last = now;
  }
})();
`;

const REPORT = `(() => {
  const R = window.__rev;
  if (!R) return JSON.stringify({ ok: false, why: 'no sampler' });
  const out = [];
  for (const row of R.rows.values()) {
    if (row.n < 4) continue;
    // OVERSHOOT IS DIRECTIONAL, AND THE FIRST VERSION OF THIS METRIC WAS NOT.
    //
    // It flagged any value whose peak was above where it ended -- which is every
    // fade-OUT in the app (peak 1, rest 0) and every dial piece being dimmed on
    // a tap (peak 1, rest 0.66). Both are motions that finished correctly, and
    // eight of them came back as findings on the first run.
    //
    // The thing being hunted is a value that goes PAST its target and comes
    // back, in whichever direction it was travelling. So: take the direction of
    // travel from where the value started to where it rests, and measure how far
    // beyond the resting value it ever got IN THAT DIRECTION. A fade-out that
    // never dips below zero scores zero. A spring that rises to 1.07 and settles
    // at 1 scores 0.07, and so does one that dips to 0.93 on its way.
    const rest = (a) => a[a.length - 1];
    const beyond = (a) => {
      const r = rest(a);
      const dir = Math.sign(r - a[0]);
      if (!dir) return 0;
      let worst = 0;
      for (const v of a) { const d = (v - r) * dir; if (d > worst) worst = d; }
      return worst;
    };
    const rec = { key: row.key, n: row.n };
    for (const f of ['sx', 'sy', 'op']) {
      const b = beyond(row[f]);
      if (b > 0.004) rec[f] = { start: +row[f][0].toFixed(3), rest: +rest(row[f]).toFixed(3), beyond: +b.toFixed(4) };
    }
    for (const f of ['tx', 'ty']) {
      const b = beyond(row[f]);
      if (b > 0.6) rec[f] = { start: +row[f][0].toFixed(1), rest: +rest(row[f]).toFixed(1), beyondPx: +b.toFixed(1) };
    }
    if (Object.keys(rec).length > 2) out.push(rec);
  }
  return JSON.stringify({
    ok: true, frames: R.frames, tracked: R.rows.size,
    moved: [...R.rows.values()].filter((r) => r.n > 3).length,
    over: out,
  });
})()`;

async function tab(url) {
  const t = await put('/json/new?' + encodeURIComponent(url));
  const ws = new WebSocket(t.webSocketDebuggerUrl, { perMessageDeflate: false });
  let id = 0;
  const waiting = new Map();
  await new Promise((r) => ws.on('open', r));
  ws.on('message', (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m.result); waiting.delete(m.id); }
  });
  const send = (method, params = {}) => new Promise((res) => {
    const i = ++id;
    waiting.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  return { t, ws, send };
}

const evaluate = async (c, expr) => {
  const r = await c.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r?.result?.value;
};

(async () => {
  fs.writeFileSync(path.join(process.cwd(), ROUTE), SRC, 'utf8');
  let code = 0;
  try {
    const url = `http://localhost:${WEB}/previewreveal?shape=skew`;
    // The route has to be BUNDLED before it can be navigated to, so ask for the
    // bundle once now that the file is on disk. See the note further down.
    await new Promise((res) => {
      http.get(`http://localhost:${WEB}/index.bundle?platform=web&dev=true`, (r) => {
        r.resume(); r.on('end', res);
      }).on('error', res);
    });
    const c = await tab('about:blank');
    await c.send('Page.enable');
    await c.send('Runtime.enable');
    await c.send('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 1100, deviceScaleFactor: 2, mobile: true,
    });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: SAMPLER });
    await c.send('Page.bringToFront');
    await c.send('Page.navigate', { url });

    // A HARNESS THAT MEASURED NOTHING MUST NOT LOOK CLEAN. The first run of
    // this script reported PASS on all three phases while the page was showing
    // "This screen doesn't exist" -- Expo Router builds its route table at
    // bundle time, so a route written after Metro is up needs a rebuild before
    // it can be navigated to (hence the bundle request above). Not finding the
    // screen, and finding nothing that moves, are both failures now.
    let mounted = false;
    for (let i = 0; i < 240; i++) {
      if (await evaluate(c, `!!document.getElementById('dial-root')`)) { mounted = true; break; }
      await wait(500);
    }
    if (!mounted) {
      const txt = await evaluate(c, `document.body.textContent.slice(0, 200)`);
      console.log('  FAIL  the tab never rendered - page says: ' + JSON.stringify(txt));
      throw new Error('never mounted');
    }
    // ── COUNTER-TEST, IN THE PAGE ────────────────────────────────────────────
    //
    // A detector is worth its green only once it has been watched going red, and
    // the honest way to do that here is to put a real overshoot in front of it
    // rather than to reason about the arithmetic. So SELFTEST=1 injects one
    // element that springs to 1.07 and settles at 1 -- exactly the shape of the
    // motion this file exists to find -- and the run must FAIL.
    //
    // It is injected as a CSS animation rather than by editing a component,
    // because a component edit needs a Metro rebuild and a rebuild mid-run is
    // what makes a harness report a screen that does not exist.
    if (process.env.SELFTEST === '1') {
      await evaluate(c, `(() => {
        const st = document.createElement('style');
        st.textContent = '@keyframes revspring { 0% { transform: scaleX(0) } 60% { transform: scaleX(1.07) } 80% { transform: scaleX(0.99) } 100% { transform: scaleX(1) } }';
        document.head.appendChild(st);
        const d = document.createElement('div');
        d.id = 'selftest-bar';
        d.textContent = 'selftest';
        d.style.cssText = 'width:100px;height:6px;background:red;animation:revspring 900ms ease-out forwards';
        document.getElementById('dial-root').appendChild(d);
        return 'injected';
      })()`);
      await wait(1400);
    }

    await wait(4000);

    const arrival = JSON.parse(await evaluate(c, REPORT));
    console.log('\nARRIVAL');
    console.log(`  ${arrival.frames} frames sampled, ${arrival.moved} elements moved`);
    if (arrival.moved === 0) { code = 1; console.log('  FAIL  nothing moved at all - the arrival did not play'); }
    if (process.env.SELFTEST === '1') {
      const saw = arrival.over.some((o) => String(o.key).includes('selftest'));
      console.log(saw
        ? '  ok    SELFTEST: the injected 1.07 overshoot was seen'
        : '  FAIL  SELFTEST: the probe MISSED an injected 1.07 overshoot');
      if (!saw) code = 1;
    }
    if (arrival.over.length === 0) console.log('  ok    nothing went past its own resting value');
    else { code = 1; for (const o of arrival.over) console.log('  OVER  ' + JSON.stringify(o)); }

    // ── THE TAP THE READER NAMED ────────────────────────────────────────────
    // "when you click on one of the who you read most and the other one".
    // Reset the sampler, tap a row in each panel, and watch what opens.
    for (const label of ['Ancient', 'Logic']) {
      await evaluate(c, `window.__rev.rows.clear(); window.__rev.t0 = performance.now();`);
      const hit = await evaluate(c, `(() => {
        const root = document.getElementById('dial-root');
        if (!root) return 'no tab';
        const els = [...root.querySelectorAll('[role="button"],[tabindex]')];
        const el = els.find((e) => (e.textContent || '').trim().startsWith(${JSON.stringify(label)}));
        if (!el) return 'not found';
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        return 'clicked';
      })()`);
      await wait(2200);
      const r = JSON.parse(await evaluate(c, REPORT));
      console.log(`\nTAP "${label}"  (${hit})`);
      console.log(`  ${r.moved} elements moved`);
      if (hit !== 'clicked' || r.moved === 0) {
        code = 1;
        console.log('  FAIL  the tap measured nothing - a silent sweep is not a clean one');
      }
      if (r.over.length === 0) console.log('  ok    nothing went past its own resting value');
      else { code = 1; for (const o of r.over) console.log('  OVER  ' + JSON.stringify(o)); }
    }

    await c.send('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 1500, deviceScaleFactor: 2, mobile: true,
    });
    const shot = await c.send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync('scripts/.reveal-shots', { recursive: true });
    fs.writeFileSync('scripts/.reveal-shots/tapped.png', Buffer.from(shot.data, 'base64'));
    console.log('\n  -> scripts/.reveal-shots/tapped.png');
    c.ws.close();
  } finally {
    try { fs.unlinkSync(path.join(process.cwd(), ROUTE)); } catch {}
  }
  console.log(code ? '\nFAIL - something still overshoots.\n' : '\nPASS - every reveal stops on its target.\n');
  process.exit(code);
})();
