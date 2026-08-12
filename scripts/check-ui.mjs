// Does the UI system hold its own rules?
//
//   node scripts/check-ui.mjs        (npm run check:ui)
//
// Three things no eye reliably catches: a colour that drifted a few points off
// its neighbour, a type size nobody meant to invent, and a contrast ratio that
// is nearly right. The app had NINE greys across two screens before this — not
// because anyone chose nine, but because nothing said there should be three.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { transform } = await import(
  pathToFileURL(path.join(REPO, 'node_modules/sucrase/dist/index.js')).href,
);
const TMP = path.join(os.tmpdir(), 'deeply-ui-check');
fs.mkdirSync(TMP, { recursive: true });
function emit(rel, name) {
  fs.writeFileSync(path.join(TMP, name),
    transform(fs.readFileSync(path.join(REPO, rel), 'utf8'), { transforms: ['typescript'] }).code);
  return pathToFileURL(path.join(TMP, name)).href;
}
const D = await import(emit('constants/design.ts', 'design.mjs'));

let bad = 0;
const ok = (cond, label, detail = '') => {
  if (!cond) bad++;
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`);
};

// ── WCAG, the same arithmetic check-launch.mjs uses ──────────────────────────
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => { const [r, g, b] = rgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

// ── 1 · the palette is small and every value is distinct ─────────────────────
//
// Two greys four points apart are not two greys, they are one grey and a bug.
// 0.02 of luminance is the floor below which a difference cannot be seen and
// therefore cannot be meaning.
const shades = Object.entries(D.C).filter(([, v]) => /^#[0-9A-Fa-f]{6}$/.test(v));
ok(shades.length <= 14, 'the palette stays small', `${shades.length} colours`);
for (let i = 0; i < shades.length; i++) {
  for (let j = i + 1; j < shades.length; j++) {
    const [na, va] = shades[i], [nb, vb] = shades[j];
    const d = Math.abs(lum(va) - lum(vb));
    ok(d >= 0.02 || va === vb, `${na} and ${nb} are tellable apart`,
      `ΔL ${d.toFixed(3)} (${va} vs ${vb})`);
  }
}

// ── 2 · text is readable on the ground it sits on ────────────────────────────
const PAIRS = [
  ['ink', 'paper', 4.5], ['ink', 'surface', 4.5], ['ink', 'surfaceSoft', 4.5],
  ['inkSoft', 'paper', 4.5], ['inkSoft', 'surface', 4.5],
  ['paper', 'ink', 4.5],            // cream text on the primary button
  ['HUE', 'paper', 3.0],            // an outline is a graphic, not body text
  ['wrong', 'paper', 4.5],
];
for (const [fg, bg, floor] of PAIRS) {
  const r = ratio(lum(D.C[fg]), lum(D.C[bg]));
  ok(r >= floor, `${fg} on ${bg}`, `${r.toFixed(2)}:1, need ${floor}`);
}

// ── 3 · the scales are closed sets ───────────────────────────────────────────
ok(Object.keys(D.TYPE).length === 5, 'five type sizes', Object.keys(D.TYPE).join(' '));
for (const [k, t] of Object.entries(D.TYPE)) {
  ok(/^(Inter_(400Regular|500Medium|700Bold)|PlayfairDisplay_(400Regular|700Bold))$/.test(t.family),
    `${k} uses a loaded font face`, t.family);
  ok(t.lineHeight >= t.fontSize * 1.15, `${k} has breathing room`,
    `${t.fontSize}/${t.lineHeight}`);
}
const SPACE_WANT = [4, 8, 12, 16, 24, 32];
ok(JSON.stringify(D.SPACE) === JSON.stringify(SPACE_WANT), 'the spacing rhythm is 4/8/12/16/24/32',
  JSON.stringify(D.SPACE));

console.log(bad === 0 ? '\nui system: all clear.' : `\n${bad} ui check(s) failed.`);
process.exit(bad === 0 ? 0 : 1);
