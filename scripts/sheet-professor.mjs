// LOOK AT THE PROFESSOR'S INTRO, FRAME BY FRAME, AND MEASURE IT.
//
//   node --import ./scripts/lib/register.mjs scripts/sheet-professor.mjs
//   DEVICE_W=320 node --import ./scripts/lib/register.mjs scripts/sheet-professor.mjs
//
// The film is a function of one clock, and the web build freezes that clock at
// `?t=` — so every instant can be loaded, photographed and measured without playing
// anything. This loads the REAL component (components/professor/ProfessorIntro.tsx)
// at the instants that matter — the walk, the arrival, and each line half-way and
// fully chalked — and reports, per frame:
//
//   · whether React mounted (a blank page photographs well);
//   · caption words that run off the screen or collide with each other;
//   · the caption running past the bottom of the phone;
//   · the stage running into the caption.
//
// Then it stitches every frame into scripts/.lesson-shots/professor-<width>.png.
//
// Its own ports (8853/9393, shared with sheet-pass, which never runs at the same
// time as this); start them as sheet-pass's header says. It writes
// app/previewprof.tsx on the way in and deletes it on the way out (§21).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import JimpPkg from 'jimp-compact';
import { claimRoute } from './lib/previewroute.mjs';

const Jimp = JimpPkg.default || JimpPkg;
const P = await import('@/components/professor/professorAt');
const V = await import('@/components/professor/professorVoice');

const CDP = +(process.env.CDP_PORT || 9393);
const WEB = +(process.env.WEB_PORT || 8853);
const DEVICE_W = +(process.env.DEVICE_W || 390);
const DEVICE_H = +(process.env.DEVICE_H || 844);
const MOUNT_TRIES = +(process.env.MOUNT_TRIES || 240);
const ROUTE = 'app/previewprof.tsx';
const SRC = fs.readFileSync(path.join(process.cwd(), 'scripts/lib/previewprof.txt'), 'utf8');

// The instants: the walk, the arrival, then each line half-chalked and finished.
const FRAMES = [
  { t: 1.4, label: 'walking in' },
  { t: P.T_ARRIVE + 0.2, label: 'arrived' },
];
P.LINE_T.forEach((t0, i) => {
  const [a, b] = P.chalkWindow(i);
  FRAMES.push({ t: (a + b) / 2, label: `line ${i + 1}, chalking` });
  FRAMES.push({ t: Math.min(t0 + V.VOICE_LINES[i].dur + 0.3, (P.LINE_T[i + 1] ?? Infinity) - 0.05), label: `line ${i + 1}, done` });
});

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const PROBE = `(() => {
  const root = document.getElementById('professor-intro');
  if (!root) return JSON.stringify({ mounted: false });
  const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
  const cap = document.getElementById('professor-caption');
  const stage = document.getElementById('professor-stage');
  const words = cap ? [...cap.querySelectorAll('div,span')].filter((e) => e.childElementCount === 0 && e.textContent.trim()) : [];
  const boxes = words.map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), l: r.left, r: r.right, top: r.top, b: r.bottom, o: +getComputedStyle(e).opacity }; });
  const off = boxes.filter((b) => b.l < -1 || b.r > vw + 1).map((b) => b.t);
  const hit = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], c = boxes[j];
    const ox = Math.min(a.r, c.r) - Math.max(a.l, c.l), oy = Math.min(a.b, c.b) - Math.max(a.top, c.top);
    if (ox > 2 && oy > 4) hit.push(a.t + '/' + c.t);
  }
  const capBottom = boxes.length ? Math.max(...boxes.map((b) => b.b)) : 0;
  const sr = stage ? stage.getBoundingClientRect() : null;
  const capTop = boxes.length ? Math.min(...boxes.map((b) => b.top)) : null;
  return JSON.stringify({ mounted: true, words: boxes.length, lit: boxes.filter((b) => b.o > 0.5).length, off, hit, capBottom, vh,
    stageBottom: sr ? sr.bottom : null, capTop });
})()`;

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

const { release } = claimRoute({ route: ROUTE, src: SRC, owner: 'sheet-professor', keep: !!process.env.PROF_KEEP });
const shots = [];
try {
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
  await send('Emulation.setDeviceMetricsOverride', { width: DEVICE_W, height: DEVICE_H, deviceScaleFactor: 2, mobile: true });

  for (const f of FRAMES) {
    console.log(`\n${f.label} · t ${f.t.toFixed(2)}`);
    await send('Page.navigate', { url: `http://localhost:${WEB}/previewprof?t=${f.t.toFixed(3)}` });
    // Poll for the mount, and reload a not-found page: the route file is written a
    // moment before Metro registers it (sheet-pass learned this).
    let up = false;
    for (let i = 0; i < MOUNT_TRIES && !up; i++) {
      const pr = await send('Runtime.evaluate', {
        expression: `(() => { if (document.getElementById('professor-intro')) return 1;
          return /doesn.t exist/.test(document.body ? document.body.innerText : '') ? -1 : 0; })()`,
        returnByValue: true,
      });
      const v = pr?.result?.value ?? 0;
      up = v === 1;
      if (!up && v === -1 && i % 20 === 19) await send('Page.reload', {});
      if (!up) await wait(250);
    }
    await wait(1500);
    const { result } = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
    const r = JSON.parse(result.value);
    ok(r.mounted, 'the intro mounted');
    if (!r.mounted) continue;
    ok(r.off.length === 0, 'no caption word runs off the screen', r.off.join(' ') || `${r.words} words`);
    ok(r.hit.length === 0, 'no two caption words collide', r.hit.slice(0, 3).join(' · ') || 'clear');
    ok(r.capBottom <= r.vh - 8, 'the caption ends above the bottom of the phone', `${Math.round(r.capBottom)} of ${r.vh}`);
    if (r.capTop != null && r.stageBottom != null) {
      ok(r.capTop >= r.stageBottom - 2, 'the caption sits below the stage', `stage ends ${Math.round(r.stageBottom)}, words start ${Math.round(r.capTop)}`);
    }
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    shots.push({ label: f.label, png: Buffer.from(shot.data, 'base64') });
    // Each frame on its own too, at full size: the strip is for sequence, a frame
    // is for detail — a face or a prop cannot be judged at half size.
    fs.mkdirSync(`scripts/.lesson-shots/professor-${DEVICE_W}`, { recursive: true });
    fs.writeFileSync(`scripts/.lesson-shots/professor-${DEVICE_W}/${String(shots.length).padStart(2, '0')}.png`, shots.at(-1).png);
  }
  sock.close();
} finally {
  release();
}

// ── the strip ─────────────────────────────────────────────────────────────────
if (shots.length) {
  const imgs = await Promise.all(shots.map((s) => Jimp.read(s.png)));
  const cw = Math.round(imgs[0].bitmap.width / 2), ch = Math.round(imgs[0].bitmap.height / 2);
  const cols = 4, rows = Math.ceil(imgs.length / cols), gap = 8;
  const sheet = await new Promise((res, rej) => new Jimp(cols * (cw + gap) + gap, rows * (ch + gap) + gap, 0xffffffff, (e, i) => (e ? rej(e) : res(i))));
  imgs.forEach((im, k) => {
    im.resize(cw, ch);
    sheet.composite(im, gap + (k % cols) * (cw + gap), gap + Math.floor(k / cols) * (ch + gap));
  });
  fs.mkdirSync('scripts/.lesson-shots', { recursive: true });
  const out = `scripts/.lesson-shots/professor-${DEVICE_W}.png`;
  await sheet.writeAsync(out);
  console.log(`\n→ ${out}`);
}
console.log(bad === 0 ? '\nPASS — the intro renders and every word fits.\n' : `\nFAILED — ${bad} problem(s).\n`);
process.exit(bad === 0 ? 0 : 1);
