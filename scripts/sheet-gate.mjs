// LOOK AT THE UPDATE WALL, AND MEASURE IT.
//
// The one screen in the app that NOBODY on a current build can ever reach: it
// draws only on an out-of-date Android binary, so for its whole life the only
// way to check it was to read the source and hope. That is why the panel is
// exported as `UpdateWall` — this loads the real component, with the real app
// icon, the real stickers and the real Button, and photographs it.
//
// It reports four things a screenshot does not answer by itself:
//   · did React mount, or is this a dark rectangle that photographs well;
//   · did the parts that must be on it actually paint (the tile art included —
//     a missing `require` renders an empty box and no error);
//   · is anything wider than the phone, or a line cut off inside its own box;
//   · and does every word clear 4.5:1 against what it is sitting on.
//
// USAGE — ports default away from every other harness (8847/9382, 8853/9393):
//   npx expo start --web --port 8857 --clear
//   curl -s -o /dev/null "http://localhost:8857/index.bundle?platform=web&dev=true"
//   chrome --headless=new --remote-debugging-port=9397 --user-data-dir=<tmp>
//   node scripts/sheet-gate.mjs
//
// DEVICE_W=320 renders the narrow phone, which is where this app's panels have
// broken twice before (§14, §19).
//
// It writes app/previewgate.tsx on the way in and DELETES it on the way out.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { claimRoute } from './lib/previewroute.mjs';

const CDP = +(process.env.CDP_PORT || 9397);
const WEB = +(process.env.WEB_PORT || 8857);
const OUT = process.env.OUT_DIR || 'scripts/.gate-shots';
const MOUNT_TRIES = +(process.env.MOUNT_TRIES || 240);
const DEVICE_W = +(process.env.DEVICE_W || 390);

const ROUTE = 'app/previewgate.tsx';
const SRC = fs.readFileSync(path.join(process.cwd(), 'scripts/lib/previewgate.txt'), 'utf8');

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Everything the reader must be able to read, and the tile art they must be
// able to see. A `require` that resolves to nothing draws an empty box.
const WANT = ['Time to update', 'This version is out of date',
  'KEPT WHEN YOU UPDATE', 'STREAK', 'PROGRESS', 'QUOTES', 'Update now',
  'ASHMERE · GOOGLE PLAY'];

const PROBE = `(() => {
  // The wall is a Modal, which react-native-web portals OUT of the preview
  // root — measuring the root alone photographs it and reports none of its
  // words (sheet-pass learned this first).
  const scope = document.body;
  const vw = document.documentElement.clientWidth;

  const lum = (c) => {
    const m = (c || '').match(/[\\d.]+/g) || [];
    const [r, g, b] = m.slice(0, 3).map(Number);
    const f = (v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const alpha = (c) => { const m = (c || '').match(/[\\d.]+/g) || []; return m.length > 3 ? Number(m[3]) : 1; };
  // What a word is actually sitting on: the nearest ancestor that paints.
  const groundOf = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (alpha(bg) > 0.92) return bg;
    }
    return 'rgb(255,255,255)';
  };

  const overflow = [], clipped = [], faint = [];
  let art = 0;

  for (const el of scope.querySelectorAll('*')) {
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity < 0.05) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 || r.height < 0.5) continue;

    // THE APP ICON, PAINTED — and the test is the BACKGROUND, not the img.
    // react-native-web draws an Image as a div carrying a background-image
    // with a transparent img over it for accessibility, so measuring the img
    // (and skipping it for opacity, as everything else here is skipped)
    // reports 0px of art for a tile that is drawing perfectly. No backticks
    // in this probe: it is a template literal, and one ends it early.
    if (/icon\\.png/.test(st.backgroundImage || '')) art = Math.round(r.width);

    if (r.right > vw + 1 || r.left < -1) {
      let n = el.parentElement, clip = null;
      while (n && n !== document.body) {
        const ps = getComputedStyle(n);
        if (ps.overflow === 'hidden' || ps.overflowX === 'hidden') { clip = n; break; }
        n = n.parentElement;
      }
      if (!clip) overflow.push({ tag: el.tagName, text: (el.textContent || '').trim().slice(0, 30),
        left: Math.round(r.left), right: Math.round(r.right) });
    }

    if (el.childElementCount === 0 && (el.textContent || '').trim()) {
      const over = el.scrollWidth - el.clientWidth;
      if (over > 1 && st.overflow !== 'hidden' && st.textOverflow !== 'ellipsis') {
        clipped.push({ text: el.textContent.trim().slice(0, 30), over: Math.round(over) });
      }
      const a = lum(st.color), b = lum(groundOf(el));
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      if (ratio < 4.5) faint.push({ text: el.textContent.trim().slice(0, 30), ratio: +ratio.toFixed(2) });
    }
  }

  return JSON.stringify({
    mounted: scope.innerText.includes('Time to update'),
    docWider: document.documentElement.scrollWidth > vw + 1,
    art, overflow, clipped, faint,
    text: scope.innerText.replace(/\\s+/g, ' ').trim().slice(0, 2000),
  });
})()`;

const { release } = claimRoute({ route: ROUTE, src: SRC, owner: 'sheet-gate', keep: !!process.env.GATE_KEEP });

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

try {
  fs.mkdirSync(OUT, { recursive: true });
  // A tab this script made, not /json/list[0] — attaching to the wrong target
  // makes Page.navigate a silent no-op (§19).
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
  // Only the front tab of a headless window is laid out; a background one never
  // fires its ResizeObserver and every rect comes back zero (measure-must).
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', {
    width: DEVICE_W, height: 844, deviceScaleFactor: 2, mobile: true,
  });

  await send('Page.navigate', { url: `http://localhost:${WEB}/previewgate` });

  // POLL FOR THE MOUNT, DO NOT SLEEP AT IT — a fixed wait races the bundle and
  // reports the same screen mounted or broken depending on the machine (§21).
  let up = false;
  for (let i = 0; i < MOUNT_TRIES && !up; i++) {
    const probe = await send('Runtime.evaluate', {
      expression: `document.body.innerText.includes('Time to update')`,
      returnByValue: true,
    });
    up = probe?.result?.value === true;
    if (!up) await wait(250);
  }
  // Fonts, the panel's own rise, and the Button's lip.
  await wait(1400);

  const { result } = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
  let r;
  try { r = JSON.parse(result.value); } catch { r = { mounted: false, raw: result.value }; }

  ok(r.mounted, 'React mounted and the wall drew itself',
    r.mounted ? '' : 'nothing said "Time to update" — a module or render fault');
  if (r.mounted) {
    ok(r.art >= 40, 'the app icon painted on its tile', `${r.art}px of art`);
    ok(!r.docWider, 'the page does not scroll sideways');
    ok(r.overflow.length === 0, 'nothing sticks out past the phone',
      r.overflow.slice(0, 3).map((o) => `${o.tag} "${o.text}" ${o.left}–${o.right}`).join(' · ') || 'clear');
    ok(r.clipped.length === 0, 'no line of text is cut off inside its own box',
      r.clipped.slice(0, 3).map((c) => `"${c.text}" +${c.over}px`).join(' · ') || 'clear');
    ok(r.faint.length === 0, 'every word clears 4.5:1 on what it sits on',
      r.faint.slice(0, 3).map((f) => `"${f.text}" ${f.ratio}:1`).join(' · ') || 'clear');
    for (const w of WANT) {
      ok(r.text.includes(w), `it says "${w}"`,
        r.text.includes(w) ? '' : `not on the page. It says: ${r.text.slice(0, 200)}…`);
    }
  }

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  if (shot?.data) {
    const f = path.join(OUT, `gate-${DEVICE_W}.png`);
    fs.writeFileSync(f, Buffer.from(shot.data, 'base64'));
    console.log(`        → ${f}`);
  }
  sock.close();
} finally {
  release();
}

console.log(bad === 0 ? '\nPASS — the wall renders, fits and reads.\n' : `\nFAILED — ${bad} problem(s).\n`);
process.exit(bad === 0 ? 0 : 1);
