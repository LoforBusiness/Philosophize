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
// tone.ts is zero-import by rule, so it loads in plain Node exactly like design.ts.
const T = await import(emit('components/shared/tone.ts', 'tone.mjs'));
// insignia.ts is zero-import for the same reason, so the eight order materials
// can be re-derived here rather than trusted.
const I = await import(emit('constants/insignia.ts', 'insignia.mjs'));
// rankShapes.ts is zero-import for the same reason — the frames are plain data.
const R = await import(emit('components/shared/rankShapes.ts', 'rankShapes.mjs'));

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

// ── 2b · the era scale ───────────────────────────────────────────────────────
//
// Five hues that mean "this thinker is from this era" — the one place in the app
// a colour carries information (see the comment on ERA in design.ts). They live
// outside `C` and so miss every check above, which is exactly how the first
// hand-picked set got as far as it did: a terracotta ANCIENT sat 19 RGB units
// from `wrong`, so an era chip and an incorrect answer were the same colour.
//
// Each one has to survive three separate jobs on the Thinkers surfaces: a solid
// chip with paper text on it, a rule under a name, and a dot on a hairline. The
// first is what forces 4.5:1 rather than the 3:1 a pure graphic would need — the
// chip carries the era's NAME.
{
  const eras = Object.entries(D.ERA);
  ok(eras.length === 5, 'five eras, one colour each', `${eras.length} values`);

  for (const [name, v] of eras) {
    ok(/^#[0-9A-F]{6}$/i.test(v), `ERA.${name} is a plain hex`, v);
    // ONE ASSERTION, NOT TWO. Contrast is symmetric, so "ERA on paper" and
    // "paper on ERA" are the same number — and both uses are real (the era's
    // name printed in its colour, and paper text on a solid chip of it), which
    // is what makes the single 4.5:1 cover both rather than needing a pair.
    ok(ratio(lum(v), lum(D.C.paper)) >= 4.5, `ERA.${name} and paper, either way round`,
      `${ratio(lum(v), lum(D.C.paper)).toFixed(2)}:1, need 4.5`);
  }

  // Tellable from each other, by the same rule the core palette uses.
  for (let i = 0; i < eras.length; i++) {
    for (let j = i + 1; j < eras.length; j++) {
      const [na, va] = eras[i], [nb, vb] = eras[j];
      const dL = Math.abs(lum(va) - lum(vb));
      const dRGB = spread(va, vb);
      ok(dL >= 0.02 || dRGB >= 60, `ERA.${na} and ERA.${nb} are tellable apart`,
        `ΔL ${dL.toFixed(3)}, ΔRGB ${Math.round(dRGB)}`);
    }
  }

  // AND NOT CONFUSABLE WITH A COLOUR THAT ALREADY MEANS SOMETHING ELSE.
  // `wrong` and `correct` are answer states and `HUE` is the interactive accent;
  // an era mark landing on any of them says the wrong thing in a place the
  // reader has been trained to read it.
  const LOADED = ['wrong', 'correct', 'HUE'];
  for (const [name, v] of eras) {
    for (const other of LOADED) {
      const d = spread(v, D.C[other]);
      ok(d >= 45, `ERA.${name} is not mistakable for ${other}`, `ΔRGB ${Math.round(d)}, need 45`);
    }
  }
}

// ── 2c · the one surface that is printed the other way up ────────────────
//
// Home's record panel is a solid ink field with cream type on it — the only
// inverted surface in the app that carries numbers rather than a photograph, and
// therefore the one place a colour can go wrong in a direction nothing else here
// is looking. Every pair above measures text on PAPER; a value that is safely
// dark on cream is invisible on ink, and the mistake looks like nothing at all
// until someone reads their streak in daylight.
//
// The tones are read out of the shipping components rather than restated here.
// They cannot live in `C` — the palette is capped at 14 and holds 13 — and a
// second copy of them in this file would measure a colour the panel might no
// longer be using, which is the failure mode this whole script exists to stop.
//
// TWO FILES NOW, because the streak moved out of HabitCard into StreakPanel so
// that Home and Profile could stop being two hand-built copies of one object.
// HabitCard keeps the ground, the kickers and the odometers; the panel took the
// tones that belong to the week row with it.
{
  const src = fs.readFileSync(path.join(REPO, 'components/home/HabitCard.tsx'), 'utf8');
  const panelSrc = fs.readFileSync(path.join(REPO, 'components/gamification/StreakPanel.tsx'), 'utf8');
  const find = (name) =>
    (src.match(new RegExp(`const ${name} = '(#[0-9A-Fa-f]{6})'`)) || [])[1] ??
    (panelSrc.match(new RegExp(`const ${name} = '(#[0-9A-Fa-f]{6})'`)) || [])[1];
  const INK = find('INK');
  ok(INK === D.C.ink, 'the panel is printed on the palette ink', `${INK} vs ${D.C.ink}`);

  // [constant, floor, what it is]. The rule sits below every floor ON PURPOSE —
  // see its comment in the component — so it is asserted from the other side.
  const ON_INK = [
    ['CREAM', 4.5, 'the streak, the day count and both totals'],
    ['ON_INK_SOFT', 4.5, 'the line under the streak'],
    ['ON_INK_DIM', 4.5, 'the kickers and the stat words'],
    ['ON_INK_FAINT', 3.0, 'unearned weekday rings'],
  ];
  for (const [name, floor, what] of ON_INK) {
    const v = find(name);
    if (!v) { ok(false, `the habit panel declares ${name}`); continue; }
    const r = ratio(lum(v), lum(INK));
    ok(r >= floor, `${name} on the ink panel — ${what}`, `${r.toFixed(2)}:1, need ${floor}`);
  }
  const rule = find('ON_INK_RULE');
  ok(rule && ratio(lum(rule), lum(INK)) < 2.0, 'the panel divider stays felt rather than seen',
    `${ratio(lum(rule), lum(INK)).toFixed(2)}:1, want under 2`);

  // AND THE PANEL CAN ACTUALLY BE INVERTED. It is drawn on ink on Home and on
  // paper on Profile, and every role it paints has to carry a value for BOTH
  // grounds — a role that resolves to one constant either way is a colour
  // measured on one ground and shipped on two, which is §19's scrim rule
  // applied to a surface instead of to a photograph. This is also the check that
  // would have caught the defect the panel was built to fix: the paper printing
  // spent a RING tone on TEXT and labelled half the week at 1.52:1.
  for (const role of ['mark', 'text', 'soft', 'dim', 'faint', 'rule', 'ground', 'labelOn', 'labelOff']) {
    ok(new RegExp(`const ${role} = onInk \\?`).test(panelSrc),
      `StreakPanel gives '${role}' a value for each ground`);
  }
  ok(/StreakPanel/.test(src), 'the record panel draws the shared streak object');
}

// ── 2c · CIELAB, because sRGB distance is the wrong instrument twice over ────
//
// The spread() above is Euclidean distance in sRGB. It is fine for the bright,
// well-separated ERA set, and it is actively misleading for anything dark: every
// colour that clears 4.5:1 on near-white paper crowds toward the origin, so a set
// that is obviously tellable apart to an eye scores as "too close". The branch
// scale was searched under exactly that error first and the search answered by
// running to the most saturated corner available (#AE22C3 electric magenta) —
// the metric, not the taste, produced that. Lab measures lightness and hue the
// way an eye weighs them, so a MUTED set can be judged honestly.
const lab = (h) => {
  const [R, G, B] = rgb(h).map(lin);
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047;
  const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  const Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(X), f(Y), f(Z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
};
const dE = (a, b) => {
  const [l1, a1, b1] = lab(a), [l2, a2, b2] = lab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
};
const Lstar = (h) => lab(h)[0];
const chroma = (h) => { const [, a, b] = lab(h); return Math.hypot(a, b); };

// ── 2d · the branch scale ────────────────────────────────────────────────────
//
// Six hues that mean "this is that branch" — the second place in the app a
// colour carries information, on the same argument ERA won (see design.ts). Like
// ERA it lives outside `C` and so misses every check above, which is precisely
// the hole this section exists to close.
{
  const branches = Object.entries(D.BRANCH);
  ok(branches.length === 6, 'six branches, one colour each', `${branches.length} values`);

  // THE KEYS ARE THE REAL BRANCH SLUGS, checked against the directories rather
  // than against a second hand-written list. A colour keyed on a slug that does
  // not exist is a branch that silently renders in no colour at all, and nothing
  // else in the build would say so.
  const dirs = fs.readdirSync(path.join(REPO, 'data/branches'), { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name).sort();
  ok(JSON.stringify(Object.keys(D.BRANCH).sort()) === JSON.stringify(dirs),
    'every branch colour is keyed on a real branch', dirs.join(' '));

  for (const [name, v] of branches) {
    ok(/^#[0-9A-F]{6}$/i.test(v), `BRANCH.${name} is a plain hex`, v);
    // 4.5:1 on BOTH grounds, because a branch may carry its own name as text and
    // the mastery list sits on paper while the same colour fills a bar on a card.
    for (const ground of ['paper', 'surface']) {
      const r = ratio(lum(v), lum(D.C[ground]));
      ok(r >= 4.5, `BRANCH.${name} on ${ground}`, `${r.toFixed(2)}:1, need 4.5`);
    }
  }

  // ONE LIGHTNESS BAND. Six branches are peers. Left unconstrained the search
  // bought its separation with lightness instead of hue and returned logic at
  // L* 7.0 — ink, effectively — beside epistemology at L* 47.8, which is a
  // hierarchy nobody declared. Hue does the separating; lightness stays put.
  const Ls = branches.map(([, v]) => Lstar(v));
  ok(Math.max(...Ls) - Math.min(...Ls) <= 20, 'the six sit in one lightness band',
    `L* ${Math.min(...Ls).toFixed(1)}…${Math.max(...Ls).toFixed(1)}`);
  for (const [name, v] of branches) {
    const c = chroma(v);
    ok(c >= 18 && c <= 38, `BRANCH.${name} is muted`, `C* ${c.toFixed(1)}, want 18…38`);
  }

  // Tellable from EACH OTHER — the strict floor, because these six are the one
  // set that genuinely shares a view (the mastery list, the reading stack).
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const [na, va] = branches[i], [nb, vb] = branches[j];
      ok(dE(va, vb) >= 24, `BRANCH.${na} and BRANCH.${nb} are tellable apart`,
        `ΔE ${dE(va, vb).toFixed(1)}, need 24`);
    }
  }

  // AND HELD OFF THE SCALES THEY DO NOT SHARE A VIEW WITH, at a lower floor.
  // An era chip lives on Thinkers and an answer state lives inside a lesson;
  // neither is ever on screen beside a mastery bar. These are insurance for the
  // day one of them is, not a claim that they are interchangeable.
  for (const [name, v] of branches) {
    for (const [en, ev] of Object.entries(D.ERA)) {
      ok(dE(v, ev) >= 15, `BRANCH.${name} is not ERA.${en}`, `ΔE ${dE(v, ev).toFixed(1)}, need 15`);
    }
    for (const other of ['wrong', 'correct', 'HUE']) {
      ok(dE(v, D.C[other]) >= 18, `BRANCH.${name} is not ${other}`,
        `ΔE ${dE(v, D.C[other]).toFixed(1)}, need 18`);
    }
  }
}

// ── 2e · the metals ──────────────────────────────────────────────────────────
//
// Bronze / silver / gold, for tier. This file's own history is the reason they
// are checked rather than trusted: BadgeMedal.tsx carried a comment saying metal
// "would not be used", so when it started being used there was nothing anywhere
// measuring it.
{
  const metals = Object.entries(T.METAL);
  ok(metals.length === 3, 'three metals', metals.map(([n]) => n).join(' '));
  ok(JSON.stringify(T.TIER_METAL) === JSON.stringify(['BRONZE', 'SILVER', 'GOLD']),
    'tier reads bronze → silver → gold', T.TIER_METAL.join(' → '));

  for (const [name, m] of metals) {
    // A FACE THAT DOES NOT DARKEN IS NOT A FACE. The whole claim of this file is
    // one light from the top left; if lit → base → shade is not monotone in
    // lightness the gradient is decoration rather than shading.
    ok(Lstar(m.lit) > Lstar(m.base) && Lstar(m.base) > Lstar(m.shade),
      `${name} runs lit → base → shade`,
      `L* ${Lstar(m.lit).toFixed(0)} → ${Lstar(m.base).toFixed(0)} → ${Lstar(m.shade).toFixed(0)}`);
    ok(Lstar(m.shade) > Lstar(m.rim), `${name}'s rim is darker than its shade`,
      `L* ${Lstar(m.shade).toFixed(0)} vs ${Lstar(m.rim).toFixed(0)}`);
    // A real swing, not a 7% one — the lesson §19 records from the first tonal
    // pass, which shipped #FEFEFC→#DFDBD1 and read as flat at every size.
    ok(Lstar(m.lit) - Lstar(m.shade) >= 22, `${name} has a visible swing`,
      `ΔL* ${(Lstar(m.lit) - Lstar(m.shade)).toFixed(1)}, need 22`);
    // Whatever is printed ON the metal has to be readable on it.
    ok(ratio(lum(m.on), lum(m.base)) >= 4.5, `${name}.on reads on ${name}.base`,
      `${ratio(lum(m.on), lum(m.base)).toFixed(2)}:1, need 4.5`);
  }

  for (let i = 0; i < metals.length; i++) {
    for (let j = i + 1; j < metals.length; j++) {
      const [na, ma] = metals[i], [nb, mb] = metals[j];
      ok(dE(ma.base, mb.base) >= 22, `${na} and ${nb} are tellable apart`,
        `ΔE ${dE(ma.base, mb.base).toFixed(1)}, need 22`);
    }
  }

  // A METAL THAT READS AS THE PAGE IS NOT A METAL, and this is the check that
  // was missing when silver first shipped.
  //
  // The original worry was a collision with `GHOST` — the slate a LOCKED medal
  // is drawn in — so silver was pushed light and warm until THAT gap opened, and
  // it passed. It also looked like a blank sheet of paper with an outline round
  // it, because at #DCD8CD it sat ΔE 12.6 from `PAPER`: the check was measuring a
  // collision that was not happening and missing the one that was.
  //
  // `GHOST` was the wrong comparison anyway. It is the RIM of a locked medal and
  // `LOCKED_FACE` is its face, and a locked medal differs from a struck one in
  // four ways at once — flat face, ghost rim, no shadow, no flourish. So the
  // face pair is checked at a modest floor and the PAPER distance is checked
  // hard, which is the way round the evidence puts them.
  const lockedStops = T.LOCKED_FACE.map(([, c]) => c);
  for (const [name, m] of metals) {
    ok(dE(m.base, T.PAPER) >= 20, `${name} does not read as the page`,
      `ΔE ${dE(m.base, T.PAPER).toFixed(1)} from paper, need 20`);
    // AND NEITHER DOES ITS HIGHLIGHT. Checking `base` alone was not enough: on a
    // 66px badge the lit corner covers about a third of the face, so a highlight
    // that is effectively paper makes the whole medal read as paper however
    // correct the base is. Silver failed exactly this way twice — at ΔE 3.0.
    // The floor is lower than the base's because a highlight is SUPPOSED to be
    // pale; it just may not be the page.
    ok(dE(m.lit, T.PAPER) >= 8, `${name}'s highlight is not the page`,
      `ΔE ${dE(m.lit, T.PAPER).toFixed(1)} from paper, need 8`);
    for (const stop of lockedStops) {
      ok(dE(m.base, stop) >= 14, `${name} is not the locked face`,
        `ΔE ${dE(m.base, stop).toFixed(1)} from ${stop}, need 14`);
    }
    ok(dE(m.base, T.GHOST) >= 12, `${name} is not the locked rim`,
      `ΔE ${dE(m.base, T.GHOST).toFixed(1)}, need 12`);
  }
}

// Placed HERE, beside the metals it replaces on the rank pins, because the
// CIELAB helpers this needs (`Lstar`, `dE`) are defined further down the file
// than the era scale is. Inserting it up there cost one ReferenceError.
// ── 4b · the eight order materials ───────────────────────────────────────────
//
// The third and last place a colour carries information: what a rank pin is
// struck in (constants/insignia.ts). Eight orders of six, clay at the bottom
// and gold at the top, and the whole point of them is that a reader can tell
// how far up the ladder somebody is without reading a number.
//
// EVERY ONE OF THESE WAS A REAL FAILURE OF A CANDIDATE PALETTE, which is why
// they are checked rather than trusted:
//
//   · a hand-picked set had a mint #B7E7CB green and a powder #B3CEF3 blue, on
//     which the WHITE MARK measured 1.2:1 — the glyph vanished into the pin's
//     own lit corner. The mark is checked against the lightest point of the
//     face, not the base, because the base is not where it fails.
//   · a search that maximised contrast returned clay and iron at nearly black
//     and every jewel order as a pastel, and let each order pick its own mark
//     colour: white/ink/ink/ink/ink/white/ink. One mark colour for the set is
//     an assertion here so that cannot come back.
//   · bronze and gold, both warm metals, measured ΔE 21 apart — one order
//     wearing two names.
{
  const orders = I.ORDERS;
  ok(orders.length === 8, 'eight orders', `${orders.length}`);
  ok(orders.length * I.ORDER_SIZE === 48, 'the orders cover the whole ladder',
    `${orders.length} x ${I.ORDER_SIZE}`);

  const marks = new Set(orders.map((o) => I.ORDER[o].on));
  ok(marks.size === 1, 'one mark colour across the whole set', [...marks].join(' '));

  for (const name of orders) {
    const m = I.ORDER[name];
    for (const [role, v] of Object.entries(m)) {
      ok(/^#[0-9A-F]{6}$/i.test(v), `ORDER.${name}.${role} is a plain hex`, v);
    }
    // The mark rides the whole face, so the worst point is what counts. 3:1 is
    // the non-text floor — it is a 2px-stroke icon, not body copy.
    const worst = Math.min(
      ratio(lum(m.on), lum(m.lit)),
      ratio(lum(m.on), lum(m.base)),
      ratio(lum(m.on), lum(m.shade)),
    );
    ok(worst >= 3.0, `ORDER.${name}: the mark reads across the whole face`,
      `${worst.toFixed(2)}:1, need 3`);
    // A face with no tonal swing stops reading as struck metal — tone.ts: "a 7%
    // tonal range is invisible".
    const swing = Lstar(m.lit) - Lstar(m.shade);
    ok(swing >= 22, `ORDER.${name} has a real tonal swing`, `${swing.toFixed(0)} L*, need 22`);
    // And the rim has to be darker than the face it turns away from.
    const gap = Lstar(m.shade) - Lstar(m.rim);
    ok(gap >= 7, `ORDER.${name}'s rim is darker than its own shade`, `${gap.toFixed(0)} L*, need 7`);
  }

  let min = Infinity, pair = '';
  for (let i = 0; i < orders.length; i++) {
    for (let j = i + 1; j < orders.length; j++) {
      const d = dE(I.ORDER[orders[i]].base, I.ORDER[orders[j]].base);
      if (d < min) { min = d; pair = `${orders[i]}/${orders[j]}`; }
    }
  }
  ok(min >= 22, 'no two orders are mistakable for each other', `ΔE ${min.toFixed(1)} (${pair}), need 22`);

  // The badge tiers borrow four of the orders on purpose — one language used
  // twice. If they ever stop being orders, the two ladders have drifted apart.
  ok(I.TIER_ORDER.every((t) => orders.includes(t)),
    'every badge tier is struck in one of the rank orders', I.TIER_ORDER.join(' '));
  ok(I.TIER_ORDER.length === 5, 'five badge tiers', `${I.TIER_ORDER.length}`);
}


// ── 4c · the six FRAMES, and the direction they run in ───────────────────────
//
// components/shared/rankShapes.ts gives every DEGREE its own silhouette — not
// every order, which is what it used to do. A reader on that version: "it only
// becomes actually complex when the user is really far along. I want it to
// become complex when the user gets far on a certain colour, then the colour
// resets and so does the complexity."
//
// scripts/sheet-ranks.mjs is how the shapes are JUDGED; this is what stops them
// breaking. Everything below is a defect a picture cannot report:
//
//   · a frame that outgrows the 100x100 viewBox is CLIPPED, silently, on every
//     screen at once — and the capstone's collar is drawn OUTSIDE its edge, so
//     the top rung of every order is the one with the least slack;
//   · a rung that does not cover more of the page than the rung below it reads
//     as a step BACKWARDS, in all eight colours at once;
//   · a mark that shrinks to make room for ornament is the failure RankSeal's
//     header records from the first time ornament escalated here.
{
  const frames = R.FRAMES;
  ok(frames.length === I.DEGREES,
    'one frame per degree, not per order', `${frames.length} frames, ${I.DEGREES} degrees`);
  ok(new Set(frames).size === frames.length, 'no frame is used twice', frames.join(' '));
  // The shape is chosen by the degree at the ONE place it is chosen. A frame
  // list keyed on the degree that a renderer then indexes by order would put the
  // whole redesign back exactly as it was, silently.
  const seal = fs.readFileSync(path.join(REPO, 'components/shared/RankSeal.tsx'), 'utf8');
  ok(/frameForDegree\(degree\)/.test(seal) && !/FRAMES\[/.test(seal),
    'the pin takes its shape from the degree and nothing else');

  // NO LIMBS. Wings, a coronet and a ray halo were the top three rungs of the old
  // ladder and the reader ruled on all of them: "looks like horns and then looks
  // as if it gains wings. I don't want this design at all." A frame is a worked
  // edge; the moment something sprouts off one, this fails.
  const shapes = fs.readFileSync(path.join(REPO, 'components/shared/rankShapes.ts'), 'utf8');
  const limbs = ['wing', 'crown', 'coronet', 'spike', 'halo', 'wreath', 'sunburst'];
  const declared = [...shapes.matchAll(/(?:export\s+)?(?:const|function)\s+([A-Za-z_]\w*)/g)]
    .map((m) => m[1]);
  const found = declared.filter((n) => limbs.some((w) => n.toLowerCase().includes(w)));
  ok(found.length === 0, 'no frame grows a limb', found.length ? found.join(' ') : 'no wings, no coronet, no rays');

  let prevArea = 0;
  for (const name of frames) {
    // MEASURED ON THE FLATTENED OUTLINE, not on the raw path numbers. A cusped
    // lobe's control points sit further out than the curve they steer — the
    // rosette's are at radius 49 for an edge that reaches 43.5 — so reading the
    // numbers out of the `d` string reports a frame as nearly clipped when it is
    // nowhere near it.
    const reach = R.frameReach(name);
    // 49, not 50: the collar is stroked, so half its width lives outside the
    // path it is drawn on.
    ok(reach <= 49, `frame ${name} stays inside the viewBox`,
      `reaches ${reach.toFixed(1)} of 50`);
    // …and the capstone's collar, which is the same path grown outward.
    const collar = R.frameReach(name, R.COLLAR);
    ok(collar <= 49, `frame ${name}'s collar stays inside it too`,
      `${collar.toFixed(1)} of 50`);
    ok(collar > reach, `frame ${name}'s collar sits outside its edge`,
      `${collar.toFixed(1)} vs ${reach.toFixed(1)}`);

    const g = R.frameGeom(name);
    ok(g.perimeter > 100, `frame ${name} has a measurable edge to run an arc along`,
      `${g.perimeter.toFixed(0)} units`);
    ok(g.studs.length === 6, `frame ${name} offers six stud positions`, `${g.studs.length}`);
    for (const [sx, sy] of g.studs) {
      const r = Math.hypot(sx - 50, sy - 50);
      ok(r > 8, `frame ${name}'s studs clear the mark`, `${r.toFixed(1)} units from centre`);
    }
    ok(g.markScale >= 0.34 && g.markScale <= 0.42,
      `frame ${name} leaves the mark its room`, `markScale ${g.markScale}`);

    // THE LADDER IS MEASURED BY AREA, NOT BY REACH, and the table in rankShapes
    // says why: reach punishes a shape for being ROUND. The hexagon reaches
    // further than the octagon above it because it spends its reach on two
    // points and leaves the rest of its slot empty, and the gem spends a third
    // of its outline in valleys. Ink on the page is what a reader compares.
    const area = R.frameArea(name);
    ok(area > prevArea, `frame ${name} covers more of the page than the rung below`,
      `${area.toFixed(0)} sq units, previous ${prevArea.toFixed(0)}`);
    prevArea = area;
  }

  // A capstone that is not half again the size of the plainest rung is not a
  // capstone. This is the one number that says the CYCLE is worth climbing, as
  // opposed to merely being ordered.
  const grew = R.frameArea(frames[frames.length - 1]) / R.frameArea(frames[0]);
  ok(grew >= 1.4, 'the capstone is visibly bigger than the plain pin',
    `${grew.toFixed(2)}x the area, floor 1.4`);
}


// ── 4d · anything struck OUTSIDE an edge is sitting on PAPER ─────────────────
//
// This trap has now been walked into three times, in three different files, and
// every time it looked like a different bug:
//
//   · the rank pin's ray halo, painted in the order's `rule` — and AURUM's
//     `rule` is #FFFFFF, so the top rank of the ladder wore an ornament nobody
//     could see (insignia.ts records the fix);
//   · the badge case's laurel wreath, stroked in `ins.on` — which insignia.ts
//     fitted to ONE value, #FFFFFF, for every order by construction. Every
//     tier-III badge has been wearing a white wreath on cream;
//   · and then the capstone collar, in `rule` again, on both ladders at once.
//
// The rule underneath all three: `on` and `rule` are toned for the METAL. The
// moment a mark is drawn beyond the edge it is on PAPER, and paper needs its own
// tone. So the collar takes the material's BODY, and this is what says so.
{
  const paper = lum(D.C.paper);
  for (const name of I.ORDERS) {
    const m = I.ORDER[name];
    // 3:1 — a graphic, not text. Same floor the marks are held to.
    ok(ratio(lum(m.base), paper) >= 3,
      `${name}: its body reads on paper, so a collar drawn in it does too`,
      `${ratio(lum(m.base), paper).toFixed(2)}:1, need 3`);
  }
  // …and the tones that do NOT, which is what makes the line above worth having.
  const blind = I.ORDERS.filter((n) => ratio(lum(I.ORDER[n].rule), paper) < 3);
  ok(blind.length >= 4, 'and the near-whites genuinely would not have',
    `${blind.length} of ${I.ORDERS.length} orders vanish on paper in their own rule: ${blind.join(' ')}`);

  // ANCHORED ON THE THING THAT DRAWS IT, not on the word COLLAR — the first
  // occurrence of that in both files is the import line, and a window measured
  // from there reaches no code at all. The counter-test caught this: the guard
  // reported clean with the defect deliberately put back.
  for (const [file, what, anchor] of [
    ['components/shared/RankSeal.tsx', 'the pin', 'fin.collar &&'],
    ['components/shared/BadgeMedal.tsx', 'the medal', '{collar && ('],
  ]) {
    const src = fs.readFileSync(path.join(REPO, file), 'utf8');
    const at = src.indexOf(anchor);
    ok(at > 0, `${what} draws a collar at all`, anchor);
    const collar = src.slice(at, at + 1200);
    ok(!/stroke=\{ins\.rule\}/.test(collar) && !/stroke=\{ins \? ins\.rule/.test(collar),
      `${what}'s collar is not drawn in a tone made for metal`);
  }
  // The badge's furniture sits on paper too, and it is what caught this.
  const medal = fs.readFileSync(path.join(REPO, 'components/shared/BadgeMedal.tsx'), 'utf8');
  ok(!/stroke=\{ink\}/.test(medal),
    'and neither is the laurel or the ribbon', 'both take `edge`, which is ink');
}


// ── 2f · ramp(), which derives a struck face from any one colour ─────────────
//
// The branch hues are declared as one hex each and lit by this. Eighteen
// hand-written values would drift, and the first thing to drift would be the
// light direction — the one thing that must be identical everywhere.
{
  for (const [name, v] of Object.entries(D.BRANCH)) {
    const r = T.ramp(v);
    ok(Lstar(r.lit) > Lstar(r.base) && Lstar(r.base) > Lstar(r.shade),
      `ramp(${name}) runs lit → base → shade`,
      `L* ${Lstar(r.lit).toFixed(0)} → ${Lstar(r.base).toFixed(0)} → ${Lstar(r.shade).toFixed(0)}`);
    ok(Lstar(r.shade) > Lstar(r.rim), `ramp(${name})'s rim is darkest`);
    // The unfilled part of a progress bar in that branch's colour. Same floor
    // and the same reason as HUE_SOFT above: a faint fill still has to be a fill
    // you can see, or the bar communicates nothing at all.
    for (const ground of ['paper', 'surface']) {
      const rr = ratio(lum(r.track), lum(D.C[ground]));
      ok(rr >= 1.2, `ramp(${name}).track is visible on ${ground}`, `${rr.toFixed(2)}:1, need 1.2`);
    }
    // And the filled part must still read against its own track, or a full bar
    // and an empty one look alike.
    ok(ratio(lum(r.base), lum(r.track)) >= 3.0, `ramp(${name}) fill reads on its own track`,
      `${ratio(lum(r.base), lum(r.track)).toFixed(2)}:1, need 3.0`);
  }
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
  // Not a screen, but held to the same rule for the same reason: it is where the
  // Thinkers surfaces get their era colour and their stats, so it is the first
  // place a stray hex would appear once colour entered this app at all.
  'components/thinkers/ThinkerStats.tsx',
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

// ── 7 · the quote plate: colour that means something, measured on its own face ─
//
// components/shared/QuotePlate.tsx is the app's only surface that takes its
// whole treatment from a data value — the era its thinker belongs to — so it is
// the one place five separate palettes have to hold five separate contrast
// budgets at once. Nobody can eyeball twenty-five pairs, which is why they are
// derived by `tone.plate()` from one hex each and measured here.
//
// THE ONE THAT ACTUALLY FAILED, so the floor is not theoretical: every ERA hue
// clears 4.5:1 on `paper` by construction, but the plate's byline sits in the
// SHADED corner where the face has turned a seventh of the way toward the hue,
// and jade measured 4.20:1 there — under the floor, on a value that had passed
// its own check. That is why `plate().label` carries its own tone.
const ERA_FACES = Object.entries(D.ERA).concat([['(no thinker)', D.C.HUE]]);
for (const [name, hue] of ERA_FACES) {
  const P = T.plate(hue);
  const lit = P.face[1];      // the body of the face
  const shade = P.face[2];    // the shaded corner, where the byline sits
  const r2 = (a, b) => ratio(lum(a), lum(b));

  // The era's name is TEXT, and it sits on the shaded corner.
  ok(r2(P.label, shade) >= 4.5, `plate ${name}: the era reads as text`,
    `${r2(P.label, shade).toFixed(2)}:1 on ${shade}`);

  // THE QUOTATION IS THE LOUDEST THING ON THE PLATE and must stay that way —
  // the tint exists to say which era, never to dim the words.
  ok(r2(T.INK, shade) >= 7, `plate ${name}: the quotation stays ink-loud`,
    `${r2(T.INK, shade).toFixed(2)}:1`);

  // The printer's mark is DECORATION SET BEHIND WORDS. Too faint and the plate
  // loses its mark; too strong and it is a glyph competing with the quotation,
  // which is D31 in docs/LESSON_RULES.md read from the other side. Both ends are
  // held, because only one of them is the obvious mistake.
  const m = r2(P.mark, lit);
  ok(m >= 1.15, `plate ${name}: the printer's mark is visible at all`, `${m.toFixed(2)}:1`);
  ok(m <= 2.2, `plate ${name}: the printer's mark can never read as a word`, `${m.toFixed(2)}:1`);

  // The spine and the ledge are non-text marks: the 3:1 floor, not 4.5.
  ok(r2(P.spine.base, D.C.paper) >= 3, `plate ${name}: the spine reads on paper`,
    `${r2(P.spine.base, D.C.paper).toFixed(2)}:1`);
  ok(r2(P.lip, D.C.paper) >= 3, `plate ${name}: the ledge reads on paper`,
    `${r2(P.lip, D.C.paper).toFixed(2)}:1`);

  // The hairline under the quotation: present, but never a second rule
  // competing with the byline it separates.
  const rr = r2(P.rule, lit);
  ok(rr >= 1.1 && rr <= 2.0, `plate ${name}: the rule is a hairline, not a bar`, `${rr.toFixed(2)}:1`);
}

// The plate is where colour entered the app's ordinary surfaces, so it is held
// to the same no-colour-of-its-own rule as a converted screen: every value in it
// comes from `tone.ts` or `design.ts`. Without this the next hue someone likes
// gets typed in here and the five eras quietly become six.
{
  const src = fs.readFileSync(path.join(REPO, 'components/shared/QuotePlate.tsx'), 'utf8')
    .replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
  const hexes = [...new Set(src.match(/#[0-9A-Fa-f]{3,8}\b/g) || [])];
  ok(hexes.length === 0, 'QuotePlate: no colour of its own', hexes.join(' '));
  const rgbs = [...new Set(src.match(/rgba?\([^)]*\)/g) || [])];
  ok(rgbs.length === 0, 'QuotePlate: no rgb() of its own', rgbs.join(' '));
}


// ── 8 · the instrument: colour that has to survive a dark ground ─────────────
//
// Insights' charts sit on a near-black panel, which is where the reader's brief
// for it lands — "premium feel and vibrent colors, not just a bunch of colors
// that make the app feel cheep". `tone.glow()` cuts the six branch hues into
// jewel tones for that ground, and the two ways of getting it wrong are both
// measurable: mixing toward paper desaturates into pastel, and pushing HSL
// saturation runs to neon.
//
// THE FLOOR THAT MATTERS IS THE ONE THAT SPLITS MARKS FROM WORDS. Three of the
// six land under 4.5:1 on the panel, so they may draw an arc, a swatch or a rule
// and may NEVER carry a word. Every string on the panel is cream. This check is
// what stops the next person tinting a label.
{
  const GROUND = T.PANEL_BASE;
  const r2 = (a, b) => ratio(lum(a), lum(b));

  ok(r2(D.C.paper, GROUND) >= 4.5, 'panel: cream reads as text', `${r2(D.C.paper, GROUND).toFixed(1)}:1`);
  ok(r2(D.C.paperSoft, GROUND) >= 4.5, 'panel: the muted cream still reads as text',
    `${r2(D.C.paperSoft, GROUND).toFixed(1)}:1`);
  ok(r2(D.C.dim, GROUND) >= 3, 'panel: the caption grey clears the mark floor',
    `${r2(D.C.dim, GROUND).toFixed(1)}:1`);
  ok(r2(T.METAL.GOLD.lit, GROUND) >= 3, 'panel: the XP line reads', `${r2(T.METAL.GOLD.lit, GROUND).toFixed(1)}:1`);
  ok(r2(T.PANEL_RULE, GROUND) >= 1.15, 'panel: a hairline is actually visible',
    `${r2(T.PANEL_RULE, GROUND).toFixed(2)}:1`);
  // TWO DIFFERENT THINGS, and the first draft measured the wrong one. The
  // panel's gradient top is SUPPOSED to be barely there — a ground that
  // announces itself is not a ground. What has to be seen is the 1px bezel
  // hairline drawn on top of it.
  ok(r2(T.PANEL_LIP, GROUND) >= 1.1 && r2(T.PANEL_LIP, GROUND) <= 1.8,
    'panel: the ground shades without becoming a second surface',
    `${r2(T.PANEL_LIP, GROUND).toFixed(2)}:1`);
  const bezel = T.mix(T.PANEL_LIP, D.C.paper, 0.22);
  ok(r2(bezel, GROUND) >= 2, 'panel: the bezel hairline catches light',
    `${bezel} at ${r2(bezel, GROUND).toFixed(2)}:1`);

  const marks = Object.entries(D.BRANCH).map(([n, h]) => [n, T.glow(h)]);
  for (const [n, g] of marks) {
    ok(r2(g.mark, GROUND) >= 3, `glow ${n}: the arc reads on the panel`, `${r2(g.mark, GROUND).toFixed(1)}:1`);
    // The shaded end of an arc still has to be an arc rather than a shadow.
    ok(r2(g.deep, GROUND) >= 1.6, `glow ${n}: its shaded end is still visible`,
      `${r2(g.deep, GROUND).toFixed(2)}:1`);
    // NOT NEON. A jewel tone is lifted, not blown out — anything that clears
    // 12:1 on near-black is a highlighter, and that is the corner design.ts
    // records its own colour search falling into.
    ok(r2(g.mark, GROUND) <= 12, `glow ${n}: and it is not a highlighter`, `${r2(g.mark, GROUND).toFixed(1)}:1`);
  }

  // Six arcs in one ring have to be tellable apart, or the legend beside them
  // is the only way to read the chart.
  //
  // MEASURED IN CIELAB, and the first draft of this check was not — it used raw
  // sRGB distance with a floor of 60 and failed two pairs, which is precisely
  // the mistake constants/design.ts records its own colour search making. In
  // sRGB a set pinned to one lightness scores as crowded however far apart it
  // actually looks. In LAB the jewel set's closest pair is 34.9, against the
  // 25.1 the SHIPPED branch palette manages — the tones are better separated
  // than the ones they are cut from, and the instrument was never the problem.
  const lab = (hex) => {
    let [r, g, b] = rgb(hex).map((v) => v / 255);
    const f = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    r = f(r); g = f(g); b = f(b);
    let X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    let Y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    const t = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116);
    X = t(X); Y = t(Y); Z = t(Z);
    return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
  };
  const dE = (a, b) => {
    const [l1, a1, b1] = lab(a); const [l2, a2, b2] = lab(b);
    return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
  };
  let worst = Infinity; let worstPair = '';
  for (let i = 0; i < marks.length; i++) {
    for (let j = i + 1; j < marks.length; j++) {
      const d = dE(marks[i][1].mark, marks[j][1].mark);
      if (d < worst) { worst = d; worstPair = `${marks[i][0]}/${marks[j][0]}`; }
    }
  }
  ok(worst >= 24, 'the six jewel tones stay tellable apart',
    `closest pair ${worstPair} at deltaE ${worst.toFixed(1)}, floor 24`);
}

// ── 9 · the animation nobody could catch: is it on screen, and will it replay? ─
//
// The rank climb on Profile is gated on `useInView`, and the reader reported
// twice that they never saw it move. Both causes were invisible to every kind of
// verification this repo has:
//
//   · a browser measures a DETACHED element correctly, so the reading that broke
//     it — an unattached view answering (0, 0) at full size, which reads as
//     perfectly in view — cannot be reproduced in a harness at all;
//   · and "it played once and never again" is a fact about a screen's LIFETIME,
//     which no single page load can observe.
//
// So the arithmetic lives in a zero-import module and is exercised here, and the
// two behaviours around it are read out of the source.
{
  const V = await import(emit('lib/utils/inViewMath.ts', 'inviewmath.mjs'));
  const VH = 844, H = 188;

  // THE DEFECT ITSELF. An unattached view keeps its real size and answers at the
  // window origin. Believing it is what spent the animation at mount.
  ok(!V.trustworthy(0, 0, H), 'a view measured at the window origin is not believed',
    `(0, 0, ${H}) — an unattached or clipped-away view`);
  ok(V.seenEnough(0, H, VH, 0.65),
    'and that reading WOULD have counted as seen, which is why it had to be caught',
    'the guard is the only thing standing between it and a spent intro');

  // …while the ordinary readings still behave.
  ok(V.trustworthy(32, 400, H), 'a real reading is believed', 'x 32, y 400');
  ok(V.trustworthy(32, 0, H), 'and so is one that legitimately sits at the top', 'x 32, y 0');
  ok(V.seenEnough(400, H, VH, 0.65), 'an element in the middle of the window is seen');
  ok(!V.seenEnough(900, H, VH, 0.65), 'one below the fold is not', 'y 900 of 844');
  ok(!V.seenEnough(VH - 40, H, VH, 0.65), 'nor one with only its top edge showing',
    `${Math.round(V.visibleHeight(VH - 40, H, VH))} of ${H} visible`);
  // An element taller than the window can never satisfy a fraction of itself.
  ok(V.seenEnough(0, 2000, VH, 0.65), 'an element taller than the window can still be seen',
    'the requirement caps at most of a screenful');

  const hook = fs.readFileSync(path.join(REPO, 'lib/utils/useInView.ts'), 'utf8');
  ok(/trustworthy\(x, y, h\)/.test(hook) && hook.indexOf('trustworthy(x, y, h)') < hook.indexOf('seenEnough('),
    'the hook asks whether the measurement is believable BEFORE asking what it says');
  ok(/setActive\b/.test(hook) && /done\.current = false/.test(hook),
    'and a look can be re-armed, so one is not the last one');
  // ── AND THE FLAG DOES NOT LIVE IN THE SCREEN ────────────────────────────────
  //
  // A performance invariant with a measured price, not a style. Profile is one
  // component of ~890 nodes, so a `useState` here costs a full blocking
  // re-render of all of them every time the flag moves: bisected at 976ms
  // against 23ms with the update suppressed and everything else identical. The
  // hook publishes through a subscription and the CHART holds the state.
  // A CALL, NOT THE WORD. §17's L8 in one line: this file's own comment explains
  // what `useState` used to cost here, and a detector that reads prose reports
  // the explanation as the defect.
  ok(!/useState[(<]/.test(hook),
    'the watcher holds no React state — a re-render here would be the whole screen');
  ok(/useSyncExternalStore/.test(hook) && /export function useSeen/.test(hook),
    'it publishes instead, so whoever needs the flag pays for it');

  const prof = fs.readFileSync(path.join(REPO, 'app/(app)/profile/index.tsx'), 'utf8');
  ok(/climbSet\(false\)/.test(prof), 'Profile re-arms the latch when the reader leaves');
  // The same invariant from the other end. Profile had exactly two `useState`s —
  // "is the tab focused" and "is the chart on screen" — and both existed only to
  // compute ONE boolean for ONE child, at the price of a blocking second each.
  // Anything added here is paid for by the whole page.
  ok(!/useState[(<]/.test(prof),
    'and holds no state of its own: on a page this size every setState is ~890 nodes');
  ok(/onMomentumScrollEnd=\{climb\.check\}/.test(prof) && /onScrollEndDrag=\{climb\.check\}/.test(prof),
    'and asks again at both ends of a gesture, not only mid-flick');

  const climb = fs.readFileSync(path.join(REPO, 'components/shared/RankClimbChart.tsx'), 'utf8');
  // The entrance belongs to every look; the recap belongs to a look with news.
  ok(/if \(!live\) \{ played\.current = false;/.test(climb),
    'the chart forgets it has played when it goes off screen',
    '`played` is a ref on a component a tab keeps mounted all session');
  ok(/const drawFrom = 0;/.test(climb), 'and it always starts from nothing and draws in');
  ok(/const RECAP = /.test(climb) && /seenXP/.test(climb),
    'while the two-part recap still needs something earned since the last look');
}

console.log(bad === 0 ? '\nui system: all clear.' : `\n${bad} ui check(s) failed.`);
process.exit(bad === 0 ? 0 : 1);
