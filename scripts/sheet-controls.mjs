// LOOK AT THE ANSWER CONTROLS, EACH IN ITS THREE STATES, AND MEASURE THEM.
//
//   node scripts/sheet-controls.mjs                  every control
//   ONLY=poll,drag node scripts/sheet-controls.mjs   just these
//   DEVICE_W=320 node scripts/sheet-controls.mjs     the narrowest phone
//
// Every control below the stickman is drawn here in isolation — open, answered
// right and answered wrong — with the real question panel underneath, from blocks
// copied out of shipped scripts. It writes one PNG per control so the three states
// can be compared side by side, and it reports each state's height, because the
// deck under a control is `overflow: hidden` and every point a control grows is a
// point taken from the explanation below it.
//
// It is the axis `sheet:beats` does not have: one CONTROL in every state, rather
// than one lesson at every beat. A restyle of a shared control changes 200-odd
// lessons at once, and sweeping them to look at it is the slow way round
// (lesson-checking fast path).
//
// PORTS default to the pair `check:readable` uses, so it can run on an already
// warm Metro. Never run it BESIDE check:readable on those ports.
//   npx expo start --web --port 8861 --clear
//   chrome --headless=new --remote-debugging-port=9391 --user-data-dir=<tmp>
//
// It writes app/previewcontrols.tsx on the way in and DELETES it on the way out —
// any file in app/ is a real route (§21). CONTROLS_KEEP=1 leaves it while iterating.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { claimRoute } from './lib/previewroute.mjs';

const CDP = +(process.env.CDP_PORT || 9391);
const WEB = +(process.env.WEB_PORT || 8861);
const OUT = process.env.OUT_DIR || 'scripts/.lesson-shots/controls';
const DEVICE_W = +(process.env.DEVICE_W || 390);
const MOUNT_TRIES = +(process.env.MOUNT_TRIES || 480);
const SETTLE_MS = +(process.env.SETTLE_MS || 2600);
const KINDS = ['cards', 'drag', 'sort', 'poll', 'polltell', 'split', 'trend', 'trend3', 'order', 'odd'];
// ?branch= strikes the sheet in that branch's colour; ethics by default.
const BRANCH = process.env.BRANCH || 'ethics';

const ROUTE = 'app/previewcontrols.tsx';
const SRC = fs.readFileSync(path.join(process.cwd(), 'scripts/lib/previewcontrols.txt'), 'utf8');

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Heights of every case, and every text leaf that runs out of its own box.
const PROBE = `(() => {
  const root = document.getElementById('controls-root');
  if (!root) return JSON.stringify({ mounted: false, said: (document.body.innerText || '').slice(0, 120) });
  const cases = [...root.querySelectorAll('[id^="case-"]')].map((c) => {
    const id = c.id.slice(5);
    const ctl = document.getElementById('ctl-' + id);
    const panel = document.getElementById('panel-' + id);
    const cut = [];
    for (const el of c.querySelectorAll('div,span')) {
      if (el.childElementCount || !(el.textContent || '').trim()) continue;
      const s = getComputedStyle(el);
      if (+s.opacity === 0) continue;
      const clamp = +s.webkitLineClamp || 0;
      if (el.scrollWidth > el.clientWidth + 2 || (clamp > 0 && el.scrollHeight > el.clientHeight + 1)) {
        cut.push(el.textContent.trim().slice(0, 50));
      }
    }
    return {
      id,
      control: ctl ? Math.round(ctl.getBoundingClientRect().height) : null,
      panel: panel ? Math.round(panel.getBoundingClientRect().height) : null,
      cut,
    };
  });
  return JSON.stringify({ mounted: true, height: Math.round(root.scrollHeight), cases });
})()`;

const only = (process.env.ONLY || '').split(',').filter(Boolean);
const kinds = only.length ? only : KINDS;
const { release } = claimRoute({ route: ROUTE, src: SRC, owner: 'sheet-controls', keep: !!process.env.CONTROLS_KEEP });

let bad = 0;
try {
  fs.mkdirSync(OUT, { recursive: true });
  const tab = await put('/json/new?about:blank');
  const sock = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((res) => {
    const n = ++id; pending.set(n, res);
    sock.send(JSON.stringify({ id: n, method, params }));
  });
  await new Promise((r) => { sock.onopen = r; });
  sock.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Page.setWebLifecycleState', { state: 'active' }).catch(() => {});

  for (const kind of kinds) {
    await send('Emulation.setDeviceMetricsOverride', { width: DEVICE_W, height: 844, deviceScaleFactor: 2, mobile: true });
    await send('Page.navigate', { url: `http://localhost:${WEB}/previewcontrols?only=${kind}&branch=${BRANCH}` });
    // Poll for the mount; a new route can need Metro to register it, and a page
    // that answered "This screen doesn't exist" is reloaded rather than waited on.
    let up = false;
    for (let i = 0; i < MOUNT_TRIES && !up; i++) {
      const probe = await send('Runtime.evaluate', {
        expression: `(() => { const e = document.getElementById('controls-root');
          if (e) return 'up';
          return (document.body && document.body.innerText || '').includes("This screen doesn't exist") ? 'missing' : 'wait'; })()`,
        returnByValue: true,
      });
      const v = probe?.result?.value;
      up = v === 'up';
      if (v === 'missing' && i % 20 === 19) {
        await send('Page.navigate', { url: `http://localhost:${WEB}/previewcontrols?only=${kind}&branch=${BRANCH}` });
      }
      if (!up) await wait(250);
    }
    if (!up) { bad += 1; console.log(`${kind}: NEVER MOUNTED`); continue; }
    await wait(SETTLE_MS);

    const { result } = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    const r = JSON.parse(result.value);
    if (!r.mounted) { bad += 1; console.log(`${kind}: no controls-root (${r.said})`); continue; }
    console.log(`\n${kind}`);
    for (const c of r.cases) {
      const cut = c.cut.length ? `  CUT: ${c.cut.join(' | ')}` : '';
      if (c.cut.length) bad += 1;
      console.log(`  ${c.id.padEnd(18)} control ${String(c.control).padStart(4)}  panel ${String(c.panel).padStart(4)}${cut}`);
    }
    await send('Emulation.setDeviceMetricsOverride', {
      width: DEVICE_W, height: Math.min(6000, Math.max(900, r.height + 40)), deviceScaleFactor: 2, mobile: true,
    });
    await wait(600);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    if (shot?.data) {
      const file = path.join(OUT, `${kind}${DEVICE_W === 390 ? '' : `-${DEVICE_W}`}.png`);
      fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
      console.log(`  → ${file}`);
    }
  }
  sock.close();
} finally {
  release();
}
console.log(bad ? `\n${bad} problem(s).\n` : '\nevery control drew in every state, and no word ran out of its box.\n');
process.exit(bad ? 1 : 0);
