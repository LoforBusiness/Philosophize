// LOOK AT THE TWO PAPER PANELS ON INSIGHTS, AND MEASURE THEM.
//
// "Who You Read Most" and "Thinkers by Era" are the two readings on that tab
// that are about the reader rather than about the curriculum, and they are the
// two that have been rebuilt on a note twice:
//
//   > "the numbers on the left side, one two three four five, look very boring
//   > and not very premium looking"          → five discs wearing furniture
//
//   > "the one, two, three, four, five circles and the designs on them … look
//   > really bad … more clean and not as AI looking"   → this, which is type
//
// Neither round could be judged without a phone, which is how a panel stays
// wrong for months. This loads the real tab with a real reader's data and
// reports what a screenshot does not answer by itself:
//
//   · did React actually mount;
//   · is anything wider than the viewport, or cut off inside its own box;
//   · IS THE GUTTER A COLUMN — every place numeral sharing one right edge is the
//     whole reason a bare numeral can carry a ranking without a disc round it;
//   · IS THERE ANY DRAWING LEFT IN IT — the panels are type, rules and hairlines
//     now, and an `<svg>` back in a league row means the furniture has returned;
//   · DOES THE LEADER'S MEASURE STOP SHORT — a coloured line that reaches both
//     margins under a name is an underline, not a measure.
//
// USAGE — ports default away from every other harness (8847/9382, 8852/9392,
// 8853/9393, 8873/9398, 8879/9399):
//   npx expo start --web --port 8883 --clear
//   chrome --headless=new --remote-debugging-port=9405 --user-data-dir=<tmp>
//   node scripts/sheet-boards.mjs
//   ONLY=thin node scripts/sheet-boards.mjs        one case while iterating
//   TAP=Ancient node scripts/sheet-boards.mjs      with a row opened
//
// It writes app/previewboards.tsx on the way in and DELETES it on the way out —
// any file in app/ is a real route and would ship if left behind (§21).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import WSpkg from 'ws';
import { claimRoute } from './lib/previewroute.mjs';

const WebSocket = WSpkg.WebSocket ?? WSpkg;
const CDP = +(process.env.CDP_PORT || 9405);
const WEB = +(process.env.WEB_PORT || 8883);
const OUT = process.env.OUT_DIR || 'scripts/.board-shots';
const DEVICE_W = +(process.env.DEVICE_W || 390);
const MOUNT_TRIES = +(process.env.MOUNT_TRIES || 320);
const TAP = process.env.TAP || '';

const ROUTE = 'app/previewboards.tsx';
const SRC = fs.readFileSync(path.join(process.cwd(), 'scripts/lib/previewboards.txt'), 'utf8');

const PANELS = ['Who You Read Most', 'Thinkers by Era'];

const CASES = [
  // A reader well into the app: five names with a clear leader, every era met.
  { key: 'full', q: 'shape=full' },
  // Two days in — one name, two eras. A ranking of one is the case a league
  // table is most likely to look silly in, and the case nobody screenshots.
  { key: 'thin', q: 'shape=thin' },
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
//
// One expression, run once per case. It finds each panel by its title and then
// climbs to the first ancestor that is both full width and tall — a panel's HEAD
// is full width too, which is why height is in the test and why the first draft
// of this returned the same 42px band for both panels.
const PROBE = `(() => {
  const root = document.getElementById('boards-root');
  if (!root) return JSON.stringify({ mounted: false });
  const vw = document.documentElement.clientWidth;

  const leaf = (t) => [...document.querySelectorAll('div,span')]
    .find((e) => e.children.length === 0 && e.textContent.trim() === t);
  const panelOf = (t) => {
    let n = leaf(t);
    while (n) {
      const b = n.getBoundingClientRect();
      if (b.width >= 300 && b.height >= 150) return n;
      n = n.parentElement;
    }
    return null;
  };

  const out = { mounted: true, vw, panels: {}, overflow: [], clipped: [] };

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
      if (!by) out.overflow.push({ text: (el.textContent || '').trim().slice(0, 30), right: Math.round(r.right) });
    }
    const t = (el.textContent || '').trim();
    if (el.childElementCount === 0 && t) {
      const over = el.scrollWidth - el.clientWidth;
      if (over > 1 && s.overflow !== 'hidden' && s.textOverflow !== 'ellipsis') {
        out.clipped.push({ text: t.slice(0, 30), over: Math.round(over) });
      }
      const clamp = +s.webkitLineClamp || 0;
      if (clamp > 0 && el.scrollHeight > el.clientHeight + 1) {
        out.clipped.push({ text: t.slice(0, 30), over: Math.round(el.scrollHeight - el.clientHeight) });
      }
    }
  }

  for (const title of ${JSON.stringify(PANELS)}) {
    const p = panelOf(title);
    if (!p) { out.panels[title] = null; continue; }
    const b = p.getBoundingClientRect();
    const rows = [...p.querySelectorAll('[role=button]')]
      .filter((e) => e.getBoundingClientRect().width > 200);
    // The gutter: every leaf whose whole text is a single digit, inside a row.
    const nums = [];
    for (const row of rows) {
      for (const e of row.querySelectorAll('div,span')) {
        if (e.children.length === 0 && /^[0-9]$/.test(e.textContent.trim())) {
          const r2 = e.getBoundingClientRect();
          nums.push({ t: e.textContent.trim(), right: +r2.right.toFixed(1), size: getComputedStyle(e).fontSize });
          break;
        }
      }
    }
    // The measures: any element under 8px tall with a real background, so both
    // the track and the fill are caught whatever they are called.
    const rules = [];
    for (const row of rows) {
      const found = [];
      for (const e of row.querySelectorAll('div,span')) {
        const r2 = e.getBoundingClientRect();
        const bg = getComputedStyle(e).backgroundColor;
        if (r2.height > 1 && r2.height <= 8 && r2.width > 8 && bg && bg !== 'rgba(0, 0, 0, 0)') {
          found.push(+r2.width.toFixed(1));
        }
      }
      if (found.length) rules.push({ track: Math.max(...found), fill: Math.min(...found) });
    }
    out.panels[title] = {
      box: { w: Math.round(b.width), h: Math.round(b.height) },
      rows: rows.length,
      nums,
      rules,
      svgs: p.querySelectorAll('svg').length,
      text: p.innerText.replace(/\\s+/g, ' ').trim().slice(0, 400),
    };
  }
  return JSON.stringify(out);
})()`;

let bad = 0;
const ok = (cond, msg, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${msg}${detail ? `  — ${detail}` : ''}`);
};

const { release, wrote } = claimRoute({ route: ROUTE, src: SRC, owner: 'sheet-boards', keep: !!process.env.BOARDS_KEEP });
fs.mkdirSync(OUT, { recursive: true });

// A NEW FILE IN app/ MAKES METRO REBUILD ITS ROUTE TABLE, and navigating before
// that lands serves a page that never mounts — which this harness would report
// as "a module or render fault" on the first case and pass on the rest. §21
// records the same shape twice: a sweep finishing green having measured nothing,
// and sheet-dial's first case failing alone while the identical query passed in
// its fourth. So the route is fetched once over HTTP first, which is what makes
// Metro build it, and only then is anything measured.
if (wrote) {
  await new Promise((res) => {
    const req = http.get({ host: '127.0.0.1', port: WEB, path: '/previewboards' }, (r) => {
      r.resume();
      r.on('end', res);
    });
    req.on('error', () => res());
    req.setTimeout(240000, () => { req.destroy(); res(); });
  });
  await wait(1200);
}

try {
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  const list = only.length ? CASES.filter((c) => only.includes(c.key)) : CASES;

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
    await send('Emulation.setDeviceMetricsOverride', { width: DEVICE_W, height: 900, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: `http://localhost:${WEB}/previewboards?${sc.q}` });

    // POLL FOR THE MOUNT, never sleep at it. sheet-pass records a fixed wait
    // returning four screens mounted and three faults on one run and the reverse
    // on the next, which reads exactly like an intermittent bug and is not one.
    let up = false;
    for (let i = 0; i < MOUNT_TRIES && !up; i++) {
      const probe = await send('Runtime.evaluate', {
        expression: `(() => { const e = document.getElementById('boards-root');
          return e ? e.getBoundingClientRect().height : 0; })()`,
        returnByValue: true,
      });
      up = (probe?.result?.value ?? 0) > 100;
      if (!up) await wait(250);
    }
    await wait(2400);   // the tab's entrance sweep

    if (TAP) {
      const r = await send('Runtime.evaluate', {
        expression: `(() => {
          const hit = [...document.querySelectorAll('div,span')]
            .find((e) => e.children.length === 0 && e.textContent.trim() === ${JSON.stringify(TAP)});
          if (!hit) return 'no such row';
          let n = hit;
          while (n && n.getAttribute && n.getAttribute('role') !== 'button') n = n.parentElement;
          if (!n) return 'no row around it';
          n.scrollIntoView({ block: 'center' });
          n.click();
          return 'clicked';
        })()`,
        returnByValue: true,
      });
      console.log(`  tap ${TAP} — ${r.result.value}`);
      await wait(1600);
    }

    const res = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    const d = JSON.parse(res.result.value);

    ok(d.mounted, 'React mounted and the screen drew itself');
    if (!d.mounted) continue;
    ok(d.overflow.length === 0, 'nothing sticks out past the viewport',
      d.overflow.length ? d.overflow.map((o) => `${o.text} → ${o.right}`).join('; ') : 'clear');
    ok(d.clipped.length === 0, 'no line of text is cut off inside its own box',
      d.clipped.length ? d.clipped.map((c) => `${c.text} +${c.over}`).join('; ') : 'clear');

    for (const title of PANELS) {
      const p = d.panels[title];
      if (!p) { console.log(`        ${title}: not on this shape`); continue; }
      console.log(`        ${title} — ${p.box.w}x${p.box.h}, ${p.rows} rows, ${p.svgs} svg`);

      // NO DRAWING IN THE PANEL. Both of these are type, rules and hairlines. An
      // svg back inside one means a numeral has grown furniture again.
      ok(p.svgs === 0, `  ${title}: nothing in it is drawn rather than set`,
        p.svgs ? `${p.svgs} svg element(s)` : 'type, rules and hairlines only');

      if (p.nums.length > 1) {
        const edges = p.nums.map((n) => n.right);
        const spread = Math.max(...edges) - Math.min(...edges);
        ok(spread <= 0.6, '  the row figures share one right edge',
          `${p.nums.map((n) => n.t).join('')} · spread ${spread.toFixed(2)}px at ${p.nums[0].size}`);
      }

      if (p.rules.length) {
        const worst = Math.max(...p.rules.map((r) => r.fill / r.track));
        ok(worst <= 0.92, '  and the leader\'s measure stops short of its track',
          `${(worst * 100).toFixed(0)}% at most — a line that reaches both margins is an underline`);
      }
    }

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const file = path.join(OUT, `${sc.key}${TAP ? '-tap' : ''}.png`);
    fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
    console.log(`        → ${file}`);
  }

  await put(`/json/close/${tab.id}`);
} finally {
  release();
}

console.log(bad === 0 ? '\nPASS — both panels read as printed matter.' : `\nFAILED — ${bad} problem(s).`);
process.exit(bad === 0 ? 0 : 1);
