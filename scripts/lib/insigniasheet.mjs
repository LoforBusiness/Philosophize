// THE PLUMBING THE TWO INSIGNIA CONTACT SHEETS SHARE.
//
// scripts/sheet-ranks.mjs and scripts/sheet-badges.mjs draw every rank pin and
// every badge through the SAME functions the app calls — components/shared/
// insigniaArt.ts has no imports precisely so this works — and with the REAL
// marks: components/shared/Glyph.tsx is loaded here with React and
// react-native-svg stood in by a twelve-line element builder, so the sheet shows
// the icon a reader sees rather than a stand-in triangle.
//
// It renders through headless Chrome rather than scripts/lib/rasterpath.mjs,
// because the crest is built from clip paths, and a sheet that approximates the
// thing it exists to judge is the failure §21 keeps recording.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..', '..');

const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href
);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ph-insignia-'));

function emit(rel, name, prefix = '', jsx = false) {
  let src = fs.readFileSync(path.join(REPO, rel), 'utf8');
  if (jsx) src = src.replace(/^import .*$/gm, '');
  const code = transform(prefix + src, {
    transforms: jsx ? ['typescript', 'jsx'] : ['typescript'],
    ...(jsx ? { jsxPragma: 'h', jsxFragmentPragma: "'frag'", production: true } : {}),
  }).code;
  const file = path.join(TMP, name);
  fs.writeFileSync(file, code);
  return pathToFileURL(file).href;
}

export const Art = await import(emit('components/shared/insigniaArt.ts', 'insigniaArt.mjs'));
export const Ins = await import(emit('constants/insignia.ts', 'insignia.mjs'));

const GlyphMod = await import(emit('components/shared/Glyph.tsx', 'glyph.mjs', [
  'const h = (t, p, ...c) => ({ t, p: p || {}, c: c.flat(Infinity) });',
  "const React = { createElement: h, Fragment: 'frag' };",
  'const memo = (f) => f;',
  "const Svg = 'svg', Path = 'path', Circle = 'circle', Line = 'line', Polyline = 'polyline', Polygon = 'polygon', Rect = 'rect';",
  '',
].join('\n'), true));

const kebab = (k) => k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
function serialise(n) {
  if (n == null || typeof n !== 'object') return '';
  if (typeof n.t === 'function') return serialise(n.t(n.p));
  const kids = (n.c || []).map(serialise).join('');
  if (n.t === 'frag' || n.t === 'svg') return kids;
  const attrs = Object.entries(n.p)
    .filter(([k, v]) => k !== 'children' && v != null)
    .map(([k, v]) => `${kebab(k)}="${v}"`).join(' ');
  return `<${n.t} ${attrs}/>`;
}

/** A glyph's markup in its own 32-unit box. */
export function glyphMarkup(name, color, weight) {
  return serialise(GlyphMod.default({ name, size: 32, color, weight }));
}

let clipSeq = 0;
/** insigniaArt nodes as SVG markup — the browser twin of InsigniaParts.tsx. */
export function nodesSvg(list) {
  return list.map((n) => {
    const o = n.o != null ? ` opacity="${n.o}"` : '';
    if (n.k === 'fill') return `<path d="${n.d}" fill="${n.c}"${o}/>`;
    if (n.k === 'line') {
      return `<path d="${n.d}" fill="none" stroke="${n.c}" stroke-width="${n.w}" stroke-linejoin="round" stroke-linecap="round"${o}/>`;
    }
    const id = `k${++clipSeq}`;
    return `<clipPath id="${id}"><path d="${n.d}"/></clipPath><g clip-path="url(#${id})">${nodesSvg(n.kids)}</g>`;
  }).join('');
}

/** The emblem, as StruckMark lays it: shadow first, then the mark. */
export function markSvg(mark, glyph) {
  const k = mark.size / 32, x = mark.cx - mark.size / 2, y = mark.cy - mark.size / 2;
  return `<g transform="translate(${x + mark.dx} ${y + mark.dy}) scale(${k})">${glyphMarkup(glyph, mark.shadow, mark.weight)}</g>`
    + `<g transform="translate(${x} ${y}) scale(${k})">${glyphMarkup(glyph, mark.color, mark.weight)}</g>`;
}

export const svg = (inner, size) => `<svg width="${size}" height="${size}" viewBox="0 0 100 100">${inner}</svg>`;

/** Every rank's and every badge's mark, read out of the data files. */
export function roll() {
  const ranks = [...fs.readFileSync(path.join(REPO, 'data/ranks.ts'), 'utf8').matchAll(/glyph: '([a-z]+)'/g)].map((m) => m[1]);
  const badges = [...fs.readFileSync(path.join(REPO, 'data/badges.ts'), 'utf8')
    .matchAll(/glyph: '([a-z]+)', family: '([a-z]+)', tier: (\d)/g)]
    .map((m) => ({ glyph: m[1], family: m[2], tier: Number(m[3]) }));
  return { ranks, badges };
}

/** Screenshot an HTML page into `out` in headless Chrome. */
export function shoot(html, out, width, height) {
  const page = path.join(TMP, 'sheet.html');
  fs.writeFileSync(page, html);
  const chrome = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].find((p) => fs.existsSync(p));
  if (!chrome) throw new Error('Chrome not found');
  fs.rmSync(out, { force: true });
  // A profile of its own, so a sheet never shares state with a harness's Chrome.
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ph-insignia-chrome-'));
  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`,
    `--window-size=${Math.ceil(width)},${Math.ceil(height)}`, '--force-device-scale-factor=1',
    `--screenshot=${out.split(path.sep).join('/')}`, pathToFileURL(page).href,
  ], { stdio: 'pipe' });
  if (!fs.existsSync(out)) throw new Error('Chrome exited without writing the sheet');
  return out;
}

export const PAGE_CSS = `body{margin:0;background:#FAFAF7;font:600 11px system-ui,sans-serif;color:#6B6B6B}
.h{padding:12px 14px 2px;font-size:12px;letter-spacing:.06em;color:#4A4A4A}
.g{display:grid;gap:2px 6px;padding:8px 14px}.c{display:flex;flex-direction:column;align-items:center}`;
