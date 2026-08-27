// LOOK AT THE FOUR STREAK SURFACES, AND MEASURE THEM.
//
// The streak is drawn in four places — Home's habit panel (on ink), Profile's
// (on paper), the streak tab, and the reward screen's celebration — and until
// this existed there was no way to see any of them without a phone. That is how
// a burnt orange stayed on all four long enough for a reader to say it looked
// like Halloween, and how the month grid's connecting rail shipped as a row of
// pale stubs poking out of discs.
//
// `npm run check:streak` measures the palette and the grid's structure in plain
// Node and cannot see either of those. This loads the real screens.
//
// It reports what a screenshot does not answer by itself:
//   · did React actually mount, or is this a blank page that photographs well;
//   · is anything wider than the viewport, or cut off inside its own box;
//   · WHERE THE RAIL ACTUALLY RUNS — the one thing the rebuild is about, and the
//     one thing that cannot be read off the source, because it is arithmetic on
//     a measured pitch.
//
// USAGE — ports default away from every other harness (8847/9382, 8852/9392,
// 8853/9393) so this can run beside them:
//   npx expo start --web --port 8873 --clear
//   curl -s -o /dev/null "http://localhost:8873/index.bundle?platform=web&dev=true"
//   chrome --headless=new --remote-debugging-port=9398 --user-data-dir=<tmp>
//   node scripts/sheet-streak.mjs
//   ONLY=tab node scripts/sheet-streak.mjs     one screen while iterating
//   DEVICE_W=320 node scripts/sheet-streak.mjs the narrow phone
//
// It writes app/previewstreak.tsx on the way in and DELETES it on the way out —
// any file in app/ is a real route and would ship if left behind (§21).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import WSpkg from 'ws';
import { claimRoute } from './lib/previewroute.mjs';

const WebSocket = WSpkg.WebSocket ?? WSpkg;
const CDP = +(process.env.CDP_PORT || 9398);
const WEB = +(process.env.WEB_PORT || 8873);
const OUT = process.env.OUT_DIR || 'scripts/.streak-shots';
const DEVICE_W = +(process.env.DEVICE_W || 390);
/** Quarter-second polls waiting for the screen. A second session's Metros can
 *  take a page load from ~13s to ~160s (§21), so this is generous on purpose. */
const MOUNT_TRIES = +(process.env.MOUNT_TRIES || 240);

const ROUTE = 'app/previewstreak.tsx';
const SRC = fs.readFileSync(path.join(process.cwd(), 'scripts/lib/previewstreak.txt'), 'utf8');

const SCREENS = [
  // Each `want` names a part that has to have PAINTED, not a phrase that happens
  // to be in the file — the point of loading the real screen is that a component
  // can be imported, typechecked and still render nothing.
  { key: 'tab', q: 's=tab',
    want: ['DAYS RUNNING', 'THE SOCIETY', 'AUGUST', 'STUDIED', 'RESTED', 'MISSED', 'REST DAYS'] },
  { key: 'panel', q: 's=panel', want: ['DAYS RUNNING', 'NEXT', 'REST DAY HELD'] },
  { key: 'calendar', q: 's=cal', want: ['STUDIED', 'RESTED', 'MISSED'], rail: true },
  { key: 'celebration', q: 's=celebrate&run=7', want: ['STREAK EXTENDED', 'DAYS'] },
  // A streak that has gone out: everything that was patina must be slate.
  { key: 'lapsed', q: 's=tab&lapsed=1&run=0', want: ['STREAK LAPSED'] },
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
  const root = document.getElementById('streak-root');
  if (!root) return JSON.stringify({ mounted: false });

  const vw = document.documentElement.clientWidth;
  const overflow = [];
  const clipped = [];
  const rails = [];
  const days = [];

  for (const el of root.querySelectorAll('*')) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) continue;

    if (r.right > vw + 1 || r.left < -1) {
      let n = el.parentElement, clippedBy = null;
      while (n && n !== document.body) {
        const ps = getComputedStyle(n);
        if (ps.overflow === 'hidden' || ps.overflowX === 'hidden') { clippedBy = n; break; }
        n = n.parentElement;
      }
      if (!clippedBy) overflow.push({ text: (el.textContent || '').trim().slice(0, 30), left: Math.round(r.left), right: Math.round(r.right) });
    }

    const t = (el.textContent || '').trim();
    if (el.childElementCount === 0 && t) {
      const over = el.scrollWidth - el.clientWidth;
      if (over > 1 && s.overflow !== 'hidden' && s.textOverflow !== 'ellipsis') {
        clipped.push({ text: t.slice(0, 30), over: Math.round(over) });
      }
      // Day tokens: a leaf carrying nothing but a number.
      if (/^[0-9]{1,2}$/.test(t)) {
        days.push({ d: +t, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) });
      }
    }

    // THE RAIL. An absolutely-positioned gradient, wider than it is tall, sitting
    // inside a week row. Identified by shape rather than by a class name, because
    // a class name is a thing this file could get wrong quietly.
    if (s.position === 'absolute' && s.backgroundImage.includes('gradient')
        && r.height < 20 && r.width > 12) {
      rails.push({ x0: Math.round(r.left), x1: Math.round(r.right), y: Math.round(r.top + r.height / 2) });
    }
  }

  return JSON.stringify({
    mounted: true,
    vw,
    docWider: document.documentElement.scrollWidth > vw + 1,
    height: Math.round(root.getBoundingClientRect().height),
    content: Math.max(...[...root.querySelectorAll('*')]
      .map((e) => (e.scrollHeight > e.clientHeight + 1 ? e.scrollHeight : 0)), root.scrollHeight, 0),
    overflow, clipped,
    rails: rails.sort((a, b) => a.y - b.y || a.x0 - b.x0),
    days: days.sort((a, b) => a.y - b.y || a.x - b.x),
    text: root.innerText.replace(/\\s+/g, ' ').trim().slice(0, 4000),
  });
})()`;

let bad = 0;
const ok = (cond, msg, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${msg}${detail ? `  — ${detail}` : ''}`);
};

const { release } = claimRoute({ route: ROUTE, src: SRC, owner: 'sheet-streak', keep: !!process.env.STREAK_KEEP });
fs.mkdirSync(OUT, { recursive: true });

try {
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  const list = only.length ? SCREENS.filter((s) => only.includes(s.key)) : SCREENS;
  if (only.length && list.length !== only.length) {
    console.log(`unknown screen(s): ${only.filter((k) => !SCREENS.some((s) => s.key === k)).join(' ')}`);
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
    await send('Page.navigate', { url: `http://localhost:${WEB}/previewstreak?${sc.q}` });

    let up = false;
    for (let i = 0; i < MOUNT_TRIES && !up; i++) {
      const probe = await send('Runtime.evaluate', {
        expression: `(() => { const e = document.getElementById('streak-root');
          return e ? e.getBoundingClientRect().height : 0; })()`,
        returnByValue: true,
      });
      up = (probe?.result?.value ?? 0) > 100;
      if (!up) await wait(250);
    }
    // Fonts, and Moti's enter animations, once it is actually there.
    await wait(1500);

    const { result } = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    let r;
    try { r = JSON.parse(result.value); } catch { r = { mounted: false }; }

    ok(r.mounted, 'React mounted and the screen drew itself',
      r.mounted ? `${r.content}px of content` : 'no #streak-root — a module or render fault');
    if (!r.mounted) continue;

    ok(!r.docWider, 'the page does not scroll sideways', `doc vs ${r.vw}`);
    ok(r.overflow.length === 0, 'nothing sticks out past the viewport',
      r.overflow.slice(0, 3).map((o) => `"${o.text}" ${o.left}–${o.right}`).join(' · ') || 'clear');
    ok(r.clipped.length === 0, 'no line of text is cut off inside its own box',
      r.clipped.slice(0, 3).map((c) => `"${c.text}" +${c.over}px`).join(' · ') || 'clear');
    for (const w of sc.want) {
      ok(r.text.includes(w), `it says "${w}"`,
        r.text.includes(w) ? '' : `not on the page: ${r.text.slice(0, 140)}…`);
    }

    // ── THE RAIL, WHERE IT ACTUALLY IS ───────────────────────────────────────
    //
    // The rebuild's whole claim is that a run reads as ONE line that survives the
    // week break, and it is the one claim `check:streak` cannot test: it is
    // arithmetic on a pitch nothing knows until layout. Reading it here caught
    // the opposite of what the screenshot suggested — the rail was wrapping
    // correctly the whole time and was simply too pale to see.
    if (sc.rail) {
      ok(r.rails.length > 0, 'the run draws a rail at all', `${r.rails.length} span(s)`);
      const rows = new Set(r.rails.map((q) => q.y));
      ok(rows.size >= 2, 'and it carries across more than one week row', `${rows.size} rows`);
      const wide = r.rails.filter((q) => q.x1 - q.x0 > 40);
      ok(wide.length >= 2, 'and at least two spans are a real length', `${wide.map((q) => q.x1 - q.x0).join(', ')}px`);
      for (const q of r.rails) {
        console.log(`        rail  y ${String(q.y).padStart(4)}   x ${String(q.x0).padStart(4)} .. ${String(q.x1).padStart(4)}`);
      }
    }

    // MEASURED AT PHONE HEIGHT, PHOTOGRAPHED TALL — `captureBeyondViewport` with
    // a clip HANGS in --headless=new (§19), so the viewport grows for the shot
    // and goes back. Every measurement above was taken at 844.
    await send('Emulation.setDeviceMetricsOverride', {
      width: DEVICE_W,
      height: Math.min(6000, Math.max(900, (r.content || r.height) + 80)),
      deviceScaleFactor: 2, mobile: true,
    });
    await wait(600);
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

console.log(bad === 0 ? '\nPASS — every streak surface renders and fits.' : `\nFAILED — ${bad} problem(s).`);
process.exit(bad === 0 ? 0 : 1);
