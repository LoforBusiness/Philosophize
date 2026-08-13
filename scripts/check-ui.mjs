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
const spread = (a, b) => {
  const [x, y, z] = rgb(a), [p, q, r] = rgb(b);
  return Math.hypot(x - p, y - q, z - r);
};

// ── 1 · the palette is small and every value is distinct ─────────────────────
//
// Two greys four points apart are not two greys, they are one grey and a bug.
// 0.02 of luminance is the floor below which a difference cannot be seen and
// therefore cannot be meaning.
//
// Luminance alone is not enough: it is blind to hue. The first version of this
// check flagged `correct` (green) and `wrong` (red) as indistinguishable because
// they sit close in lightness — a green and a red, which nobody has trouble
// telling apart, because they differ in HUE, not lightness. Testing lightness
// alone would have forced a repaint of the answer-state colours to satisfy an
// instrument measuring the wrong channel. So: two tokens are tellable apart if
// they differ enough in lightness OR in RGB spread (hue/saturation). Greys sit
// on the RGB diagonal, so a near-duplicate grey still fails both halves — this
// does not let an actual duplicate through. Do not simplify this back to
// luminance alone.
//
// CAVEAT: raw sRGB distance is not colourblind-aware. Its one live use today
// (correct/wrong) is safe only because every answer-state site also carries a
// checkmark/X mark, not because 60 was chosen with any colour-vision model in
// mind -- a future palette addition should not be assumed distinguishable to a
// deuteranope or protanope just because it clears this number.
const shades = Object.entries(D.C).filter(([, v]) => /^#[0-9A-Fa-f]{6}$/.test(v));
ok(shades.length <= 14, 'the palette stays small', `${shades.length} colours`);
for (let i = 0; i < shades.length; i++) {
  for (let j = i + 1; j < shades.length; j++) {
    const [na, va] = shades[i], [nb, vb] = shades[j];
    const dL = Math.abs(lum(va) - lum(vb));
    const dRGB = spread(va, vb);
    ok(dL >= 0.02 || dRGB >= 60 || va === vb, `${na} and ${nb} are tellable apart`,
      `ΔL ${dL.toFixed(3)}, ΔRGB ${Math.round(dRGB)} (${va} vs ${vb})`);
  }
}

// ── 2 · text is readable on the ground it sits on ────────────────────────────
const PAIRS = [
  ['ink', 'paper', 4.5], ['ink', 'surface', 4.5], ['ink', 'surfaceSoft', 4.5],
  ['inkSoft', 'paper', 4.5], ['inkSoft', 'surface', 4.5],
  ['paper', 'ink', 4.5],            // cream text on the primary button
  ['HUE', 'paper', 3.0],            // an outline is a graphic, not body text
  ['wrong', 'paper', 4.5],
  ['inkSoft', 'surfaceSoft', 4.5],
  ['wrong', 'wrongSoft', 4.5],      // the Danger Zone's text on its own fill

  // A TRACK IS NOT TEXT, AND IT STILL HAS TO BE VISIBLE.
  //
  // `HUE_SOFT` was the only token in the palette with no pair at all, and that
  // is precisely how six Branch Mastery bars shipped with nothing readable in
  // them: at #F0F7F6 the unfilled remainder measured 1.04:1 on `paper` and
  // 1.09:1 on a Card face (ΔL* 1.50 and 3.30), so the bar and its ground were
  // the same surface. Nothing here failed, because nothing here was looking.
  //
  // 1.2 is not a WCAG number — no WCAG rule covers "a fill against the surface
  // behind it". It is the measured floor this app already trusts: the tracks
  // these screens shipped with before the conversion sat at 1.217:1 on paper
  // and 1.273:1 on a card, and they read correctly on a real phone. So the
  // floor is set just under the value known to work, and a track that cannot
  // clear it is a track nobody can see.
  ['HUE_SOFT', 'surface', 1.2],
  ['HUE_SOFT', 'paper', 1.2],

  // On-dark text, and the edge that keeps a dark field from vanishing into a
  // dark hero. `paperSoft` is caption-weight text, so it carries the text
  // floor; `dim` is a border, so it carries the 3:1 non-text one.
  ['paperSoft', 'ink', 4.5],
  ['dim', 'ink', 3.0],
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

// ── 4 · the button obeys the affordance rule ─────────────────────────────────
//
// A lip means you can press it. That is the whole language: 4px on a button,
// 2px on a pressable card, none on a static one. Nothing in the app said this
// before, which is a real part of why nothing felt tappable.
const btn = fs.readFileSync(path.join(REPO, 'components/ui/Button.tsx'), 'utf8');
ok(/onPress/.test(btn), 'Button requires an onPress');
ok(!/#[0-9A-Fa-f]{3,8}\b/.test(btn.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '')),
  'Button declares no colour of its own',
  (btn.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '').match(/#[0-9A-Fa-f]{3,8}\b/g) || []).join(' '));
for (const v of ['primary', 'secondary', 'ghost', 'destructive']) {
  ok(btn.includes(`'${v}'`), `Button has a ${v} variant`);
}
ok(/LIP\.button/.test(btn), 'the lip height comes from the token, not a literal');
ok(/touch\(\)/.test(btn), 'pressing fires the existing haptic');
ok(!/playSound|cue\(/.test(btn), 'the button makes no sound');

// ── 5 · the card completes the rule ──────────────────────────────────────────
const card = fs.readFileSync(path.join(REPO, 'components/ui/Card.tsx'), 'utf8');
ok(!/#[0-9A-Fa-f]{3,8}\b/.test(card.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '')),
  'Card declares no colour of its own');
ok(/LIP\.card/.test(card), 'the card lip comes from the token');
// The rule in one line: no onPress, no lip.
ok(/onPress\s*\?\s*LIP\.card\s*:\s*0|onPress\s*&&|!!onPress/.test(card),
  'a card only gets a lip when it can be pressed');

// ── 6 · converted screens use tokens and nothing else ────────────────────────
//
// A literal list, not a glob: adopting a screen into the system is a deliberate
// act, and a glob would silently enrol the next file someone adds.
const CONVERTED = [
  'app/(app)/settings.tsx',
  'app/(app)/profile/index.tsx',
  'app/(app)/philosophers/index.tsx',
  'app/(app)/branches/[branchSlug]/index.tsx',
  // each adoption task appends its screen here
];
const SIZES = new Set(Object.values(D.TYPE).map((t) => t.fontSize));
const GAPS = new Set([...D.SPACE, 0]);
for (const rel of CONVERTED) {
  const src = fs.readFileSync(path.join(REPO, rel), 'utf8')
    .replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
  const hexes = [...new Set(src.match(/#[0-9A-Fa-f]{3,8}\b/g) || [])];
  ok(hexes.length === 0, `${rel}: no colour of its own`, hexes.join(' '));
  const rgbs = [...new Set(src.match(/rgba?\([^)]*\)/g) || [])];
  ok(rgbs.length === 0, `${rel}: no rgb() of its own`, rgbs.join(' '));

  const fsz = [...new Set((src.match(/fontSize:\s*([\d.]+)/g) || [])
    .map((m) => Number(m.split(':')[1])))].filter((n) => !SIZES.has(n));
  ok(fsz.length === 0, `${rel}: every font size is on the scale`, fsz.join(' '));

  const sp = [...new Set((src.match(/(?:padding|margin|gap)[A-Za-z]*:\s*([\d.]+)/g) || [])
    .map((m) => Number(m.split(':')[1])))].filter((n) => !GAPS.has(n));
  ok(sp.length === 0, `${rel}: every gap is on the rhythm`, sp.join(' '));
}

console.log(bad === 0 ? '\nui system: all clear.' : `\n${bad} ui check(s) failed.`);
process.exit(bad === 0 ? 0 : 1);
