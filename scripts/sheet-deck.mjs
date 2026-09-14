// DOES EVERY ANSWERED QUESTION STILL FIT UNDER ITS CONTROL?
//
//   node scripts/sheet-deck.mjs                    widths 390, 384 and 360
//   WIDTHS=360 node scripts/sheet-deck.mjs         one width
//   ONLY=poll,plot node scripts/sheet-deck.mjs     some controls
//   LABEL=before node scripts/sheet-deck.mjs       names the JSON it writes
//
// A control lives inside the player's lower box with the deck, and the deck under
// it is `overflow: hidden` (L6). So every point a control grows, and every word an
// explanation gains, comes out of one fixed height — and what does not fit is the
// end of the explanation, cut off without a mark. Nothing offline can see it: the
// height of a poll depends on how its rows wrap, which is the browser's business.
//
// It renders EVERY beat in the app that is answered below the figure, answered,
// with its real control and its real explanation, several dozen to a page, and
// measures each one's control and panel. The lower box is a fixed share of the
// body, so the height each phone gives it is arithmetic (the flex weights are read
// out of cinematicKit, as check-smooth reads them), and one render per WIDTH
// answers every height.
//
// It is the fast path for this question (lesson-checking fast path): the whole
// corpus in a few pages, where playing each lesson to its questions takes hours.
//
// The HEADER is the player's own row — close, progress, XP — measured at 32 on
// the web; the deck-fit sweep of real lessons at 844 and 740 both agree with it.
//
// PORTS default to the pair `check:readable` uses, so it can run on an already
// warm Metro. Never run it BESIDE check:readable on those ports.
//   npx expo start --web --port 8861 --clear
//   chrome --headless=new --remote-debugging-port=9391 --user-data-dir=<tmp>
//
// It writes app/previewdecksheet.tsx on the way in and DELETES it on the way out.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { claimRoute } from './lib/previewroute.mjs';

const CDP = +(process.env.CDP_PORT || 9391);
const WEB = +(process.env.WEB_PORT || 8861);
const OUT = process.env.OUT_DIR || 'scripts/.lesson-shots/deck';
const LABEL = process.env.LABEL || 'run';
const WIDTHS = (process.env.WIDTHS || '390,384,360').split(',').map(Number);
const HEIGHTS = (process.env.HEIGHTS || '844,780,740').split(',').map(Number);
const PAGE = +(process.env.PAGE || 40);
const SETTLE_MS = +(process.env.SETTLE_MS || 2500);
const MOUNT_TRIES = +(process.env.MOUNT_TRIES || 600);
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const HEADER = +(process.env.HEADER || 32);

const DIR = 'components/lesson/cinematic';
const kitSrc = fs.readFileSync(path.join(DIR, 'cinematicKit.tsx'), 'utf8');
const weight = (n) => {
  const m = new RegExp(`\\b${n}:\\s*\\{[^}]*?flex:\\s*(\\d+)`, 's').exec(kitSrc);
  if (!m) throw new Error(`no flex weight for styles.${n} in cinematicKit`);
  return +m[1];
};
const [wStage, wLower, wTap] = [weight('stageWrap'), weight('lower'), weight('tapLayer')];
const lowerOf = (h) => ((h - HEADER) * wLower) / (wStage + wLower + wTap);

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('Script.ts')).sort();
const imports = files.map((f, i) => `import * as S${i} from '@/components/lesson/cinematic/${f.slice(0, -3)}';`).join('\n');
const mods = files.map((f, i) => `['${f.slice(0, -'Script.ts'.length)}', S${i}]`).join(', ');
const ROUTE_NAME = 'previewdecksheet';
const ROUTE = `app/${ROUTE_NAME}.tsx`;
// split/join rather than replace: a replacement string treats `$&` and `$1` as
// patterns, and nothing about a list of imports should be read as one.
const SRC = fs.readFileSync('scripts/lib/previewdecksheet.txt', 'utf8')
  .split('/*IMPORTS*/').join(imports)
  .split('/*MODS*/').join(mods);

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const MOUNTED = `(() => {
  const t = document.getElementById('deck-total');
  if (!t) return JSON.stringify({ missing: (document.body && document.body.innerText || '').includes("This screen doesn't exist") });
  return JSON.stringify({ total: +t.textContent, have: document.querySelectorAll('[id^="case-"]').length });
})()`;

const PROBE = `(() => {
  return JSON.stringify([...document.querySelectorAll('[id^="case-"]')].map((c) => {
    const n = c.id.slice(5);
    const h = (p) => { const e = document.getElementById(p + '-' + n); return e ? Math.round(e.getBoundingClientRect().height * 10) / 10 : null; };
    const cut = [];
    for (const el of c.querySelectorAll('div,span')) {
      if (el.childElementCount || !(el.textContent || '').trim()) continue;
      let hidden = false;
      for (let a = el; a && a !== c; a = a.parentElement) if (+getComputedStyle(a).opacity === 0) { hidden = true; break; }
      if (hidden) continue;
      const s = getComputedStyle(el);
      const clamp = +s.webkitLineClamp || 0;
      if (el.scrollWidth > el.clientWidth + 2 || (clamp > 0 && el.scrollHeight > el.clientHeight + 1)) {
        cut.push(el.textContent.trim().slice(0, 50));
      }
    }
    const key = document.getElementById('key-' + n);
    const data = document.getElementById('data-' + n);
    return { n: +n, key: key ? key.textContent : '', control: h('ctl'), panel: h('panel'), cut, data: data ? data.textContent : null };
  }));
})()`;

const { release } = claimRoute({ route: ROUTE, src: SRC, owner: 'sheet-deck', keep: !!process.env.DECK_KEEP });

const cases = new Map();
let bad = 0;
try {
  fs.mkdirSync(OUT, { recursive: true });
  const tab = await put('/json/new?about:blank');
  const sock = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) => new Promise((res) => {
    const k = ++id; pending.set(k, res);
    sock.send(JSON.stringify({ id: k, method, params }));
  });
  await new Promise((r) => { sock.onopen = r; });
  sock.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
  };
  const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true }))?.result?.value;
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });

  for (const W of WIDTHS) {
    await send('Emulation.setDeviceMetricsOverride', { width: W, height: 844, deviceScaleFactor: 1, mobile: true });
    let total = null;
    for (let from = 0; total === null || from < total; from += PAGE) {
      const url = `http://localhost:${WEB}/${ROUTE_NAME}?from=${from}&to=${from + PAGE}&only=${ONLY.join(',')}`;
      await send('Page.navigate', { url });
      let ok = false;
      for (let i = 0; i < MOUNT_TRIES && !ok; i++) {
        const m = JSON.parse((await ev(MOUNTED)) || '{}');
        if (m.missing && i % 20 === 19) await send('Page.navigate', { url });
        if (typeof m.total === 'number') {
          total = m.total;
          ok = m.have === Math.max(0, Math.min(from + PAGE, total) - from);
        }
        if (!ok) await wait(250);
      }
      if (!ok) { bad += 1; console.log(`${W}: page ${from} NEVER MOUNTED`); break; }
      await wait(SETTLE_MS);
      for (const r of JSON.parse(await ev(PROBE))) {
        const [file, beat, kind] = r.key.split(' ');
        const k = `${file} ${beat}`;
        if (!cases.has(k)) cases.set(k, { key: k, kind, data: r.data ? JSON.parse(r.data) : null, w: {} });
        cases.get(k).w[W] = { control: r.control, panel: r.panel, cut: r.cut };
      }
      process.stdout.write(`\r${W}: ${Math.min(from + PAGE, total)} of ${total} measured   `);
    }
    process.stdout.write('\n');
  }
  sock.close();
} finally {
  release();
}

// ── the arithmetic: every height from one render per width ───────────────────
const list = [...cases.values()];
const cutWords = list.flatMap((c) => Object.entries(c.w).flatMap(([W, m]) => m.cut.map((t) => `${c.key} @${W}: ${t}`)));
if (cutWords.length) {
  console.log(`\nWORDS CUT INSIDE THEIR OWN BOX (${cutWords.length})`);
  for (const t of cutWords.slice(0, 20)) console.log(`  ${t}`);
  bad += cutWords.length;
}
// THE GATE is the phone this app is actually held on rather than the harness's
// 390×844: 780 is what a 2340-tall screen at its default density leaves once the
// status bar and the gesture bar are taken off, and 360 is the narrowest common
// Android width, where every row wraps soonest. The other sizes are reported.
const [gateW, gateH] = (process.env.GATE || '360x780').split('x').map(Number);
let gateClip = null;
const report = [];
for (const H of HEIGHTS) {
  for (const W of WIDTHS) {
    const lower = lowerOf(H);
    const rows = list.filter((c) => c.w[W]).map((c) => ({
      key: c.key, kind: c.kind, over: c.w[W].control + c.w[W].panel - lower,
    }));
    const clip = rows.filter((r) => r.over > 0.5).sort((a, b) => b.over - a.over);
    const kinds = [...new Set(rows.map((r) => r.kind))].sort();
    const gate = W === gateW && H === gateH;
    if (gate) gateClip = clip;
    console.log(`\n${W}×${H}${gate ? '  THE GATE' : ''}  deck box ${lower.toFixed(0)}  ·  ${clip.length} of ${rows.length} clip`);
    console.log(`  by control: ${kinds.map((k) => `${k} ${clip.filter((r) => r.kind === k).length}/${rows.filter((r) => r.kind === k).length}`).join('  ')}`);
    for (const r of clip.slice(0, gate ? 60 : 12)) {
      console.log(`  ${r.key.padEnd(26)} ${r.kind.padEnd(6)} over ${r.over.toFixed(0).padStart(4)}`);
    }
    report.push({ W, H, lower, clip: clip.length, rows });
  }
}
if (gateClip === null) {
  console.log(`\nthe gate, ${gateW}×${gateH}, was not among the sizes measured.`);
} else if (gateClip.length) {
  bad += gateClip.length;
  console.log(`\n${gateClip.length} answered question(s) lose the end of their explanation at ${gateW}×${gateH}.`);
} else {
  console.log(`\nevery answered question fits its deck at ${gateW}×${gateH}.`);
}
const file = path.join(OUT, `deck-${LABEL}.json`);
fs.writeFileSync(file, JSON.stringify({ header: HEADER, weights: [wStage, wLower, wTap], cases: list, report }, null, 1));
console.log(`\n→ ${file}`);
process.exit(bad ? 1 : 0);
