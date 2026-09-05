// EVERY FRAME OF THE CAMERA, not one sample a beat.
//
//   npm run sheet:cam -- <lesson-id> [beats] [tapMs]
//
// Needs Metro and a headless Chrome (see the header of scripts/measure-must.mjs),
// and it writes app/previewcam.tsx while it runs — check:routes is what stops one
// being left behind.
//
// A once-a-beat reading cannot tell a designed push-in from a pop: both show up
// as "the number changed". What a reader calls a reset is a change that happens
// in ONE FRAME, so the thing to measure is the frame-to-frame delta — the same
// argument `check:smooth` makes about the figure.
//
// A rAF sampler runs inside the page and records the stage's real transform, so
// this reads the composited result of the shot list, the tour, `containShot` and
// `fit` together, which is what the reader actually sees.
import fs from 'node:fs';
import http from 'node:http';
import { claimRoute } from './lib/previewroute.mjs';
import { ANSWER_CONTROL } from './lib/answerctl.mjs';

const CDP = Number(process.env.CDP_PORT || 9382);
const WEB = Number(process.env.WEB_PORT || 8853);
const SLUG = 'previewcam';
const id = process.argv[2];
const N = Number(process.argv[3] || 20);
const TAP = Number(process.argv[4] || 2500);

const put = (path) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path, method: 'PUT' }, (x) => {
    let b = ''; x.on('data', (d) => { b += d; }); x.on('end', () => res(JSON.parse(b || '{}')));
  });
  r.on('error', rej); r.end();
});

const SAMPLER = [
  '(() => {',
  '  window.__s = [];',
  '  window.__beat = 0;',
  '  const tick = () => {',
  "    const cam = document.getElementById('stage-cam');",
  "    const bar = document.getElementById('beat-progress');",
  '    if (cam) {',
  '      const r = cam.getBoundingClientRect();',
  '      window.__s.push([performance.now(), Math.round(r.width * 100) / 100,',
  '        Math.round(r.x * 100) / 100, Math.round(r.y * 100) / 100,',
  '        bar ? Math.round(bar.getBoundingClientRect().width) : -1]);',
  '    }',
  '    requestAnimationFrame(tick);',
  '  };',
  '  requestAnimationFrame(tick);',
  '  return 1;',
  '})()',
].join('\n');

const ANSWER = `(() => {
  const clip = document.getElementById('stage-clip');
  const cr = clip ? clip.getBoundingClientRect() : null;
  const all = [...document.querySelectorAll('[role="button"],[tabindex]')]
    .filter((e) => e.getAttribute('data-testid') !== 'thinker-name');
  const below = all.find((e) => {
    const r = e.getBoundingClientRect();
    return cr && r.top > cr.bottom && r.width > 80 && r.height >= 20 && r.height <= 90;
  });
  const onStage = all.find((e) => {
    const r = e.getBoundingClientRect();
    return cr && r.top >= cr.top - 2 && r.bottom <= cr.bottom + 2 && r.width > 14 && r.height > 14;
  });
  const b = below || onStage;
  if (b) { b.dispatchEvent(new MouseEvent('click', { bubbles: true })); return 1; }
  return 0;
})()`;

const { release } = claimRoute({
  route: `app/${SLUG}.tsx`,
  src: fs.readFileSync(`app/${SLUG}.tsx`, 'utf8'),
  owner: 'dbg-cam',
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const tab = await put(`/json/new?http://localhost:${WEB}/${SLUG}?id=${id}`);
  const WS = (await import('ws')).default;
  const ws = new WS(tab.webSocketDebuggerUrl);
  let n = 0;
  const send = (method, params = {}) => new Promise((res) => {
    const msgId = ++n;
    const onMsg = (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.id === msgId) { ws.off('message', onMsg); res(m.result); }
    };
    ws.on('message', onMsg);
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  await new Promise((r) => ws.on('open', r));
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(13000);
  await send('Runtime.evaluate', { expression: SAMPLER, returnByValue: true });

  for (let k = 0; k < N; k++) {
    await sleep(TAP);
    await send('Runtime.evaluate', { expression: ANSWER, returnByValue: true });
    await sleep(150);
    await send('Runtime.evaluate', {
      expression: "document.elementFromPoint(195, 300)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))",
    });
  }
  await sleep(800);

  const out = await send('Runtime.evaluate', {
    expression: 'JSON.stringify(window.__s)', returnByValue: true,
  });
  const s = JSON.parse(out.result.value);
  console.log(`${s.length} frames sampled\n`);

  // The frame-to-frame change in the stage's rendered WIDTH, in CSS px.
  const jumps = [];
  for (let k = 1; k < s.length; k++) {
    const dw = Math.abs(s[k][1] - s[k - 1][1]);
    const dx = Math.abs(s[k][2] - s[k - 1][2]);
    const dy = Math.abs(s[k][3] - s[k - 1][3]);
    const dt = s[k][0] - s[k - 1][0];
    if (dt > 60) continue;                    // a dropped frame is not a pop
    jumps.push({ k, dw, dx, dy, bar: s[k][4], move: Math.max(dw, dx, dy) });
  }
  jumps.sort((a, b) => b.move - a.move);
  console.log('worst single-frame camera moves (CSS px):');
  for (const j of jumps.slice(0, 12)) {
    console.log(`  frame ${String(j.k).padStart(5)}  bar ${String(j.bar).padStart(3)}  `
      + `dWidth ${j.dw.toFixed(1).padStart(7)}  dx ${j.dx.toFixed(1).padStart(7)}  dy ${j.dy.toFixed(1).padStart(7)}`);
  }
  const w = s.map((r) => r[1]);
  console.log(`\nstage width over the run: min ${Math.min(...w).toFixed(1)}  max ${Math.max(...w).toFixed(1)}`);

  // ── HOW LONG EACH MOVE TAKES ────────────────────────────────────────────────
  //
  // This is the number the travel time is supposed to change, and it is the one
  // to read. The worst SINGLE-FRAME delta is not: easing puts the peak at the
  // middle of the ramp, and stretching a move over more frames lowers the average
  // while barely touching the peak — which is why 0.7s and 1.2s can report the
  // same worst frame and mean completely different things.
  //
  // The `bar` is no use for grouping either: it is the progress bar, which fills
  // CONTINUOUSLY through a beat (§17 records the same trap catching `stamp()`),
  // so frames either side of a beat edge interleave.
  const runs = [];
  let start = null;
  for (let k = 1; k < s.length; k++) {
    // ANY axis, not just width. A tour that pans down to a thin strip barely
    // changes the picture's SIZE while moving it hundreds of pixels, so a
    // width-only test reported a 0.55s travel as 0.15s and made a perfectly
    // ordinary move look like one cut short.
    const moved = (j) => Math.max(
      Math.abs(s[j][1] - s[j - 1][1]),
      Math.abs(s[j][2] - s[j - 1][2]),
      Math.abs(s[j][3] - s[j - 1][3]),
    );
    const moving = moved(k) > 0.15;
    if (moving && start === null) start = k - 1;
    if (!moving && start !== null) {
      // A move is over only after it has been still for a few frames — easing
      // trails off, and a single still frame mid-ramp would cut one move in two.
      let stillFor = 0;
      for (let j = k; j < Math.min(k + 6, s.length); j++) {
        if (moved(j) > 0.15) break;
        stillFor++;
      }
      if (stillFor >= 5) {
        runs.push({ from: s[start][1], to: s[k - 1][1], secs: (s[k - 1][0] - s[start][0]) / 1000 });
        start = null;
      }
    }
  }
  console.log('\ncamera moves, in the order they happen:');
  for (const r of runs) {
    if (r.secs < 0.05) continue;
    console.log(`  ${r.from.toFixed(0)} -> ${r.to.toFixed(0)}px  (${(r.to / r.from).toFixed(2)}x)`
      + `  over ${r.secs.toFixed(2)}s`);
  }
  ws.close();
} finally { release(); }
