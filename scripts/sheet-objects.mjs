// DRAW THE OBJECTS IN THE RANK PINS AND THE BADGES, on their own and at the sizes the
// app draws them — before a pin or a badge is built round them.
//
//   node scripts/sheet-objects.mjs              every object
//   node scripts/sheet-objects.mjs candle book  just these
//
// Each object is drawn large on its own, then at 44 and 22 points in a pale window,
// which is how a rank chip and the profile's pin show it. Plain Node and headless
// Chrome: components/shared/insigniaObjects.ts and objects/*.ts have no runtime
// imports beyond each other.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { REPO, nodesSvg, shoot, PAGE_CSS } from './lib/insigniasheet.mjs';

const { transform } = await import(pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href);
const cache = new Map();
export function load(rel) {
  const abs = path.join(REPO, rel);
  if (cache.has(abs)) return cache.get(abs);
  const code = transform(fs.readFileSync(abs, 'utf8'), { transforms: ['typescript', 'imports'] }).code;
  const mod = { exports: {} };
  cache.set(abs, mod.exports);
  const req = (spec) => {
    if (!spec.startsWith('.')) throw new Error(`${rel} imports ${spec}`);
    let r = path.join(path.dirname(rel), spec);
    if (!r.endsWith('.ts')) r += '.ts';
    return load(r);
  };
  new Function('exports', 'module', 'require', code)(mod.exports, mod, req);
  return mod.exports;
}

const K = load('components/shared/insigniaObjects.ts');
const all = {};
for (const f of fs.readdirSync(path.join(REPO, 'components/shared/objects'))) {
  if (!f.endsWith('.ts')) continue;
  // A file another hand is half-way through writing is skipped, not fatal.
  try {
    const m = load(`components/shared/objects/${f}`);
    for (const v of Object.values(m)) if (v && typeof v === 'object') Object.assign(all, v);
  } catch (e) { console.warn(`skipped ${f}: ${String(e.message).slice(0, 160)}`); }
}
const want = process.argv.slice(2);
const names = want.length ? want : Object.keys(all);
const missing = names.filter((n) => !all[n]);
if (missing.length) throw new Error(`no object called ${missing.join(', ')}`);

const cell = (name) => {
  const nodes = K.objectNodes(all[name]());
  const big = `<svg width="150" height="150" viewBox="0 0 100 100">${nodesSvg(nodes)}</svg>`;
  const win = (px) => `<svg width="${px}" height="${px}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#3E5A8C"/><circle cx="50" cy="50" r="41" fill="#F3EEDF"/>`
    + `<g transform="translate(14 14) scale(0.72)">${nodesSvg(nodes)}</g></svg>`;
  return `<div class="c"><div style="background:#F3EEDF;border-radius:12px">${big}</div>`
    + `<div style="display:flex;gap:8px;align-items:center;margin:4px 0">${win(64)}${win(44)}${win(22)}</div><div>${name}</div></div>`;
};
const cols = 6;
const html = `<html><head><style>${PAGE_CSS} .g{grid-template-columns:repeat(${cols},170px)}</style></head><body>`
  + `<div class="h">${names.length} OBJECTS · LARGE, THEN IN A WINDOW AT 64 · 44 · 22</div><div class="g">${names.map(cell).join('')}</div></body></html>`;
const rows = Math.ceil(names.length / cols);
const out = path.join(os.tmpdir(), process.env.OUT_NAME || 'object-sheet.png');
shoot(html, out, cols * 176 + 30, rows * 235 + 50);
console.log(`${names.length} objects -> ${out}`);
