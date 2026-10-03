// make:plates — bake each set plate (components/lesson/cinematic/plates.ts) into a PNG.
//
//   (Metro on WEB_PORT, headless Chrome with CDP on CDP_PORT, as the other harnesses)
//   npm run make:plates            every plate
//   npm run make:plates hist5-mid  one plate
//
// The plate's layers are drawn by the REAL components (PlateLive → SetArt/ObjectArt)
// in a browser, so the picture is the drawing, not a re-implementation of it. Each is
// photographed twice, over black and over white, and the two give back the alpha
// exactly (difference matting): a pixel that reads the same over both is opaque, one
// that reads the backgrounds is clear, and an anti-aliased edge lands between. Then it
// writes assets/images/sets/<id>.png and the table in platesArt.ts with each stamp.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { claimRoute } from './lib/previewroute.mjs';
import { loadPlates, plateStamp } from './lib/platestamp.mjs';

const REPO = process.cwd();
const CDP = +(process.env.CDP_PORT || 9391);
const WEB = +(process.env.WEB_PORT || 8861);
const ROUTE = 'previewplates';
const OUT = path.join(REPO, 'assets/images/sets');
const ART = path.join(REPO, 'components/lesson/cinematic/platesArt.ts');

const PLATES = await loadPlates();
const only = process.argv.slice(2);
const ids = Object.keys(PLATES).filter((id) => !only.length || only.includes(id));

const { release } = claimRoute({
  route: `app/${ROUTE}.tsx`,
  owner: 'make-plates',
  keep: true,
  src: `// scratch: make:plates (delete me)
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { PLATES } from '@/components/lesson/cinematic/plates';
import { PlateLive } from '@/components/lesson/cinematic/PlateArt';
import { useUIStore } from '@/stores/uiStore';
useUIStore.setState({ launchDone: true } as any);
export default function P() {
  const [s, set] = useState<{ id: string; bg: string } | null>(null);
  (globalThis as any).__setPlate = (id: string, bg: string) => set({ id, bg });
  useEffect(() => { (globalThis as any).__drawn = s ? s.id + ':' + s.bg : ''; }, [s]);
  const p = s ? PLATES[s.id] : null;
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width: 5000, height: 3000, backgroundColor: s ? s.bg : '#000' }}>
      {p ? (
        <View style={{ position: 'absolute', left: -p.box.x, top: -p.box.y, width: p.box.x + p.box.w, height: p.box.y + p.box.h }}>
          <PlateLive plate={p} />
        </View>
      ) : null}
    </View>
  );
}
`,
});

const put = (p) => new Promise((res, rej) => {
  const r = http.request({ host: '127.0.0.1', port: CDP, path: p, method: 'PUT' }, (x) => {
    let d = ''; x.on('data', (c) => (d += c)); x.on('end', () => res(JSON.parse(d)));
  });
  r.on('error', rej); r.end();
});
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const WS = (await import(pathToFileURL(path.join(REPO, 'node_modules/ws/index.js')).href)).default;
const { default: Jimp } = await import(pathToFileURL(path.join(REPO, 'node_modules/jimp-compact/dist/jimp.js')).href);
const tab = await put('/json/new?about:blank');
const ws = new WS(tab.webSocketDebuggerUrl, { perMessageDeflate: false, maxPayload: 1 << 30 });
let mid = 0; const pend = new Map();
ws.on('message', (m) => { const x = JSON.parse(m); if (x.id && pend.has(x.id)) { pend.get(x.id)(x.result ?? x.error); pend.delete(x.id); } });
const send = (m, p = {}) => new Promise((res) => { const i = ++mid; pend.set(i, res); ws.send(JSON.stringify({ id: i, method: m, params: p })); });
await new Promise((r) => ws.on('open', r));
await send('Page.enable'); await send('Runtime.enable');
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true }))?.result?.value;

await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false });
const url = `http://localhost:${WEB}/${ROUTE}`;
await send('Page.navigate', { url });
let ok = false;
for (let i = 0; i < 200; i++) {
  if (await ev('typeof globalThis.__setPlate === "function"')) { ok = true; break; }
  if (i && i % 10 === 0) await send('Page.navigate', { url });
  await wait(1000);
}
if (!ok) { console.log('the plate page never rendered:', await ev('document.body && document.body.innerText.slice(0,200)')); release(); process.exit(1); }
await wait(1500);

async function shoot(id, bg, plate) {
  const w = Math.ceil(plate.box.w), h = Math.ceil(plate.box.h);
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: plate.scale, mobile: false });
  await ev(`globalThis.__setPlate(${JSON.stringify(id)}, ${JSON.stringify(bg)})`);
  for (let i = 0; i < 50 && (await ev('globalThis.__drawn')) !== `${id}:${bg}`; i++) await wait(100);
  await wait(900);
  const r = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
  return Jimp.read(Buffer.from(r.data, 'base64'));
}

fs.mkdirSync(OUT, { recursive: true });
const stamps = {};
for (const id of ids) {
  const plate = PLATES[id];
  const B = await shoot(id, '#000000', plate);
  const W = await shoot(id, '#ffffff', plate);
  const { width, height } = B.bitmap;
  const out = new Jimp(width, height, 0x00000000);
  const b = B.bitmap.data, wd = W.bitmap.data, o = out.bitmap.data;
  let clear = 0;
  for (let i = 0; i < b.length; i += 4) {
    const diff = (wd[i] - b[i] + wd[i + 1] - b[i + 1] + wd[i + 2] - b[i + 2]) / 3;
    const a = Math.max(0, Math.min(1, 1 - diff / 255));
    if (a < 1 / 255) { o[i + 3] = 0; clear++; continue; }
    o[i] = Math.min(255, Math.round(b[i] / a));
    o[i + 1] = Math.min(255, Math.round(b[i + 1] / a));
    o[i + 2] = Math.min(255, Math.round(b[i + 2] / a));
    o[i + 3] = Math.round(a * 255);
  }
  const file = path.join(OUT, `${id}.png`);
  await out.writeAsync(file);
  stamps[id] = plateStamp(plate);
  console.log(`  ${id}: ${width}×${height}px, ${(100 * clear / (b.length / 4)).toFixed(0)}% clear, ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
}

// the table: every plate that has a picture, made now or before
const prev = fs.existsSync(ART) ? fs.readFileSync(ART, 'utf8') : '';
for (const id of Object.keys(PLATES)) {
  if (stamps[id]) continue;
  const m = prev.match(new RegExp(`'${id}': '([0-9a-f]+)'`));
  if (m && fs.existsSync(path.join(OUT, `${id}.png`))) stamps[id] = m[1];
}
const keys = Object.keys(stamps).sort();
fs.writeFileSync(ART, `// GENERATED by \`npm run make:plates\`. Do not edit.
// The baked picture of each set plate (plates.ts); \`check:plates\` holds the stamps.

export const PLATE_STAMP: Record<string, string> = {
${keys.map((k) => `  '${k}': '${stamps[k]}',`).join('\n')}
};

export const PLATE_ART: Record<string, number> = {
${keys.map((k) => `  '${k}': require('../../../assets/images/sets/${k}.png'),`).join('\n')}
};
`);
console.log(`wrote ${path.relative(REPO, ART)} (${keys.length} plates)`);
ws.close();
release();
process.exit(0);
