// Can every word laid on the reader's picture be read, on every picture?
//
//   node scripts/check-profile-contrast.mjs        (npm run check:profile-art)
//
// Since 2026-10-01 the pictures are DRAWN places (components/shared/profileScenes.ts)
// and no word is laid on the art: the Profile header, Home's masthead and the
// picker all stand their words on the place's dark GROUND, below its horizon. So
// this asks three things, each of which could quietly stop being true:
//
//   1. the colours: the name and Home's wordmark at 7:1 and the quieter lines at
//      4.5:1 against every place's `ground`;
//   2. the pixels: in every PNG, the ground the words stand on — the middle of the
//      canvas below the horizon crest — really is that ground and nothing else. A
//      rock or a tree drawn into the middle of the ground would be a word on an
//      object, and only the picture can say so;
//   3. the stamp: the PNGs were drawn from the scenes as they are now
//      (`npm run make:profile-art` after any edit).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Jimp = require('jimp-compact');
const REPO = process.cwd();

let failed = 0;
const ok = (cond, what, detail = '') => {
  if (!cond) failed++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${what}${detail ? `  — ${detail}` : ''}`);
};

// ── colour arithmetic ────────────────────────────────────────────────────────
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
/** An rgba() over an opaque ground. */
const over = (rgba, ground) => {
  const m = rgba.match(/rgba?\(([^)]+)\)/);
  if (!m) return hex(rgba);
  const [r, g, b, a = 1] = m[1].split(',').map(Number);
  return [r, g, b].map((c, i) => c * a + ground[i] * (1 - a));
};

// ── what the screens use ─────────────────────────────────────────────────────
const art = fs.readFileSync(path.join(REPO, 'components/shared/profileSceneArt.ts'), 'utf8');
const places = [...art.matchAll(/'([\w-]+)': \{ name: '([^']+)', source: require\('@\/assets\/images\/profile\/([\w-]+\.png)'\), sky: '(#\w{6})', ground: '(#\w{6})'/g)]
  .map(([, id, name, file, sky, ground]) => ({ id, name, file, sky, ground }));
const bgSrc = fs.readFileSync(path.join(REPO, 'data/profileBackgrounds.ts'), 'utf8');
const muted = bgSrc.match(/tone === 'dark'\s*\?\s*\{\s*text: Paper,\s*muted: '(#\w{6})'/)[1];
const home = fs.readFileSync(path.join(REPO, 'constants/homeArt.ts'), 'utf8');
const homeCream = home.match(/HomeCream = '(#\w{6})'/)[1];
const homeSoft = home.match(/HomeSoft = '([^']+)'/)[1];
const PAPER = '#FAFAF7';

console.log(`\n${places.length} drawn places\n`);
ok(places.length === 10, 'the picker still offers ten places', `${places.length}`);

console.log('\n1. the words against every ground');
for (const p of places) {
  const g = hex(p.ground);
  const name = ratio(hex(PAPER), g);
  const quiet = ratio(hex(muted), g);
  const mark = ratio(hex(homeCream), g);
  const line = ratio(over(homeSoft, g), g);
  ok(name >= 7 && mark >= 7 && quiet >= 4.5 && line >= 4.5,
    `${p.name.padEnd(20)} name ${name.toFixed(1)} · line ${quiet.toFixed(1)} · wordmark ${mark.toFixed(1)} · today ${line.toFixed(1)}`);
}

// ── the pixels the words stand on ────────────────────────────────────────────
//
// The canvas is 1200 × 720 with the horizon at 600; the PNG is that at its own
// scale. The crest of the ground rises up to 12 units above the horizon, so the
// band read is from the horizon + 14 down to the bottom, across the middle 70% —
// the widest any screen sets its words.
console.log('\n2. the ground under the words is only ground');
for (const p of places) {
  const im = await Jimp.read(path.join(REPO, 'assets/images/profile', p.file));
  const { width: W, height: H } = im.bitmap;
  const k = W / 1200;
  const g = hex(p.ground);
  let worst = 0, odd = 0, n = 0;
  for (let y = Math.ceil((600 + 14) * k); y < H; y += 2) {
    for (let x = Math.floor(W * 0.15); x < W * 0.85; x += 2) {
      const i = (y * W + x) * 4;
      const d = Math.max(...[0, 1, 2].map((c) => Math.abs(im.bitmap.data[i + c] - g[c])));
      worst = Math.max(worst, d); n++;
      if (d > 12) odd++;
    }
  }
  ok(odd / n < 0.001, `${p.name.padEnd(20)} ${(100 * odd / n).toFixed(2)}% of the ground differs from ${p.ground}`, `worst ${worst}`);
}

// ── the stamp ────────────────────────────────────────────────────────────────
console.log('\n3. the pictures were drawn from the scenes as they are');
const src = fs.readFileSync(path.join(REPO, 'components/shared/profileScenes.ts'), 'utf8')
  + fs.readFileSync(path.join(REPO, 'components/shared/profileSceneGeometry.ts'), 'utf8');
const stamp = crypto.createHash('sha1').update(src).digest('hex').slice(0, 12);
const held = art.match(/PROFILE_ART_STAMP = '(\w+)'/)[1];
ok(stamp === held, 'profileSceneArt.ts carries the scenes\' current stamp', stamp === held ? stamp : `${held} ≠ ${stamp}: run npm run make:profile-art`);
for (const p of places) ok(fs.existsSync(path.join(REPO, 'assets/images/profile', p.file)), `${p.file} exists`);

console.log(failed ? `\nFAILED — ${failed} problem(s).\n` : '\nAll clear.\n');
process.exit(failed ? 1 : 0);
