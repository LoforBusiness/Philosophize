// THE BEATS check:readable CALLS STRUCK, PHOTOGRAPHED AND STITCHED.
//
//   npx expo start --web --port 8877 --clear
//   chrome --headless=new --remote-debugging-port=9407 --user-data-dir=<tmp>
//   node scripts/sheet-strikes.mjs read.json
//
// STRIKE cannot be confirmed by pixels the way UNDER and FAINT can, and the
// reason is worth stating: FAINT asks "can this be read", which is a number, and
// a screenshot answers it. STRIKE asks "was this meant", which no measurement
// answers at all. `aesthetics20` draws a 320×2 bar through IT TEACHES YOU THINGS
// and the style is called `strike`, because the whole lesson is each claim about
// art being struck out by something that does it better. That is the design. Two
// hundred units away, `political19` drew a 2px marker line through WHAT YOU|FEEL
// and that is the defect the reader reported. Identical geometry, identical
// pixels, opposite meanings.
//
// So this does not judge. It photographs the beat each finding sits on and
// stitches them into sheets, printing the lesson, the beat and the word beneath
// each one — because the only instrument that can tell those two apart is a
// person looking, and thirty-four lessons one screenshot at a time is why nobody
// does. Comparison is the point: a deliberate strikethrough is obvious beside
// eight scenes where nothing is meant to be crossed out.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
// jimp-compact is the older bundled Jimp: a DEFAULT export, `new Jimp(w,h,rgba)`
// and a callback `write`. Named-importing { Jimp } gets undefined and fails at
// the first composite, which looks like a corrupt screenshot rather than a bad
// import.
import Jimp from 'jimp-compact';
import { sweepStaleTabs, closeTab } from './lib/cdptab.mjs';

const CDP = +(process.env.CDP_PORT || 9407);
const WEB = +(process.env.WEB_PORT || 8877);
const ROUTE = process.env.STRIKE_ROUTE || 'previewread';
const OUT = process.env.STRIKE_OUT || path.join('scripts', '.strike-sheets');
const PER = +(process.env.STRIKE_PER || 9);
const KIND = (process.env.STRIKE_KIND || 'STRIKE').toUpperCase();
const src = process.argv[2];
if (!src) { console.error('usage: node scripts/sheet-strikes.mjs <read.json>'); process.exit(2); }

// ── which beats to shoot ────────────────────────────────────────────────────
const report = JSON.parse(fs.readFileSync(src, 'utf8'));
const want = [];
for (const lesson of report) {
  if (!lesson.beats) continue;
  const seen = new Set();
  for (const b of lesson.beats) {
    for (const h of b.hits || []) {
      if (!String(h.why || '').includes(KIND)) continue;
      if (seen.has(b.i)) continue;
      seen.add(b.i);
      want.push({ id: lesson.id, beat: b.i, word: h.text || '', by: h.struckBy || h.coveredBy || '' });
      break;
    }
  }
}
// One beat per lesson keeps the sheet readable; the rest repeat the same cause.
const first = [];
const byLesson = new Set();
for (const w of want) { if (byLesson.has(w.id)) continue; byLesson.add(w.id); first.push(w); }
console.log(`${first.length} lesson(s) to photograph for ${KIND}`);

// ── the browser ─────────────────────────────────────────────────────────────
const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (s) => {
    let b = ''; s.on('data', (c) => { b += c; }); s.on('end', () => { try { res(JSON.parse(b)); } catch (e) { rej(e); } });
  });
  r.on('error', rej); r.end();
});
// Close what earlier runs left behind first — see scripts/lib/cdptab.mjs.
const swept = await sweepStaleTabs(CDP, `http://localhost:${WEB}`);
if (swept) console.log(`closed ${swept} page(s) left by earlier runs`);
const tab = await put('/json/new?about:blank');
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let mid = 0; const pend = new Map();
const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } });
await new Promise((r) => ws.addEventListener('open', r));
const ev = async (x) => {
  const r = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true });
  if (r?.exceptionDetails) throw new Error(String(r.exceptionDetails.exception?.description ?? '').slice(0, 300));
  return r?.result?.value;
};
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

// React Native Web needs a real click; a dispatched MouseEvent on the element
// under the middle of the stage is what every other harness here uses (§21).
const CLICK = "(()=>{const e=document.elementFromPoint(195,300);(e||document.body).dispatchEvent(new MouseEvent('click',{bubbles:true}));return true})()";
const CLIP = `(()=>{const s=document.querySelector('#stage-clip');if(!s)return '';const r=s.getBoundingClientRect();
  return JSON.stringify({x:Math.max(0,r.x),y:Math.max(0,r.y),width:r.width,height:r.height})})()`;

fs.mkdirSync(OUT, { recursive: true });
const shots = [];
for (const w of first) {
  try {
    await send('Page.navigate', { url: `http://localhost:${WEB}/${ROUTE}?id=${w.id}&notour=1` });
    let ok = false;
    for (let i = 0; i < 90; i += 1) {
      if (await ev("!!document.querySelector('#stage-clip')")) { ok = true; break; }
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (!ok) { console.log(`  ${w.id.padEnd(30)} NEVER RENDERED A STAGE`); continue; }
    for (let b = 0; b < w.beat; b += 1) { await ev(CLICK); await new Promise((r) => setTimeout(r, 1100)); }
    await new Promise((r) => setTimeout(r, 1500));
    const c = await ev(CLIP);
    if (!c) { console.log(`  ${w.id.padEnd(30)} stage gone`); continue; }
    const clip = JSON.parse(c);
    const r = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height, scale: 1 },
    });
    const f = path.join(OUT, `${w.id}-b${w.beat}.png`);
    fs.writeFileSync(f, Buffer.from(r.data, 'base64'));
    shots.push({ ...w, file: f });
    console.log(`  ${w.id.padEnd(30)} b${w.beat}  ${JSON.stringify(w.word).slice(0, 30)}`);
  } catch (e) {
    console.log(`  ${w.id.padEnd(30)} ${String(e.message).slice(0, 60)}`);
  }
}

// ── stitch ──────────────────────────────────────────────────────────────────
const COLS = 3;
for (let s = 0; s < shots.length; s += PER) {
  const group = shots.slice(s, s + PER);
  const imgs = [];
  for (const g of group) imgs.push({ g, img: await Jimp.read(g.file) });
  const cw = Math.max(...imgs.map((x) => x.img.bitmap.width));
  const ch = Math.max(...imgs.map((x) => x.img.bitmap.height));
  const rows = Math.ceil(imgs.length / COLS);
  const sheet = new Jimp(cw * COLS + 8 * (COLS + 1), (ch + 22) * rows + 8, 0xffffffff);
  imgs.forEach((x, i) => {
    const cx = 8 + (i % COLS) * (cw + 8);
    const cy = 8 + Math.floor(i / COLS) * (ch + 22);
    sheet.composite(x.img, cx, cy);
  });
  const out = path.join(OUT, `sheet-${KIND.toLowerCase()}-${String(s / PER + 1).padStart(2, '0')}.png`);
  await new Promise((res, rej) => sheet.write(out, (e) => (e ? rej(e) : res())));
  console.log('sheet ' + out + '  ' + group.map((g) => g.id.replace(/^[a-z]+-[a-z]+-/, '')).join(' · '));
  console.log('   ' + group.map((g, i) => `${i + 1}. ${g.id} b${g.beat} ${JSON.stringify(g.word).slice(0, 26)} by ${g.by}`).join('\n   '));
}
await closeTab(CDP, tab.id);
process.exit(0);
