// Is every word on the profile header actually readable on every background?
//
// This answers that with arithmetic instead of an opinion. For each image in
// assets/images/profile/ it walks the rows the TEXT occupies, composites the
// tone's scrim over the real pixels row by row (the scrim is a gradient, so the
// top of the band gets less of it and is the worst case), and reports the lowest
// WCAG contrast ratio the name and the muted line ever reach.
//
//   node scripts/check-profile-contrast.mjs
//
// Take the tone it recommends into data/profileBackgrounds.ts. An image can look
// dark and still be overwhelmingly white paper by area — and it is the area, not
// the impression, that decides whether white text survives on it.

import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Jimp = require('jimp-compact');

const DIR = 'assets/images/profile';
const CATALOGUE = 'data/profileBackgrounds.ts';

// What the catalogue CLAIMS each image's tone is. Comparing that against the
// measurement is the whole point: swap an image, forget to update the tone, and
// the text goes unreadable with nothing to tell you. Filename `04-the-peak.jpg`
// maps to id `the-peak`.
function declaredTones() {
  if (!existsSync(CATALOGUE)) return {};
  const src = readFileSync(CATALOGUE, 'utf8');
  const out = {};
  for (const m of src.matchAll(/\{\s*id:\s*'([^']+)'[^}]*?tone:\s*'(light|dark)'/g)) {
    out[m[1]] = m[2];
  }
  return out;
}
const idOf = (file) => basename(file, extname(file)).replace(/^\d+-/, '');

// Must match tonePalette() in data/profileBackgrounds.ts.
const TONES = {
  dark: {
    text: [0xfa, 0xfa, 0xf7],
    muted: [0xdc, 0xd9, 0xd0],
    scrim: { rgb: [12, 12, 12], a0: 0.34, a1: 0.78 },
  },
  light: {
    text: [0x1a, 0x1a, 0x1a],
    muted: [0x45, 0x42, 0x3a],
    scrim: { rgb: [250, 250, 247], a0: 0.42, a1: 0.86 },
  },
};

// The header: avatar across the top, then name / subtitle / rank / quote. Text
// starts under the avatar and runs to the bottom.
const TEXT_TOP = 0.34;
const TEXT_BOTTOM = 1.0;

// WCAG AA: 4.5 for body text, 3.0 for large. The name is large; the muted line
// is small, so it is the one that has to clear 4.5.
const MIN_NAME = 3.0;
const MIN_MUTED = 4.5;

const srgb = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ratio = (a, b) => {
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
};
const over = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a));

async function measure(file) {
  const img = await Jimp.read(file);
  const W = img.bitmap.width;
  const H = img.bitmap.height;

  const y0 = Math.floor(H * TEXT_TOP);
  const y1 = Math.floor(H * TEXT_BOTTOM);
  const step = Math.max(1, Math.floor(W / 160)); // sample ~160 columns per row

  const rows = [];
  for (let y = y0; y < y1; y++) {
    let r = 0, g = 0, b = 0, n = 0;
    for (let x = 0; x < W; x += step) {
      const idx = (W * y + x) << 2;
      r += img.bitmap.data[idx];
      g += img.bitmap.data[idx + 1];
      b += img.bitmap.data[idx + 2];
      n++;
    }
    rows.push({ y, rgb: [r / n, g / n, b / n] });
  }

  const meanL = rows.reduce((acc, row) => acc + lum(row.rgb), 0) / rows.length;

  const per = {};
  for (const [name, t] of Object.entries(TONES)) {
    let worstName = Infinity;
    let worstMuted = Infinity;
    let worstY = 0;
    for (const row of rows) {
      // Scrim alpha at this row, as a fraction of the WHOLE header height.
      const a = t.scrim.a0 + (t.scrim.a1 - t.scrim.a0) * (row.y / H);
      const bg = over(t.scrim.rgb, row.rgb, a);
      const lbg = lum(bg);
      const rn = ratio(lum(t.text), lbg);
      const rm = ratio(lum(t.muted), lbg);
      if (rm < worstMuted) { worstMuted = rm; worstY = row.y; }
      if (rn < worstName) worstName = rn;
    }
    per[name] = { worstName, worstMuted, worstY };
  }

  // Which tone the picture ALREADY is. A dark image wants paper text over an ink
  // wash; forcing the opposite means laying a heavy paper scrim over it, which
  // reads as grey mud and throws away the thing the user chose it for.
  const natural = meanL < 0.20 ? 'dark' : 'light';
  const other = natural === 'dark' ? 'light' : 'dark';
  const passes = (p) => p.worstName >= MIN_NAME && p.worstMuted >= MIN_MUTED;

  // Prefer the art's own tone. Flip only when it genuinely cannot carry text —
  // readability wins, but it does not get to win by default.
  const best = passes(per[natural]) ? natural : passes(per[other]) ? other : natural;
  const flipped = best !== natural;

  return { file: basename(file), W, H, meanL, per, best, natural, flipped };
}

const files = existsSync(DIR)
  ? readdirSync(DIR)
      .filter((f) => ['.png', '.jpg', '.jpeg', '.webp'].includes(extname(f).toLowerCase()))
      .sort()
  : [];

if (!files.length) {
  console.log(`No images in ${DIR} yet — nothing to measure.`);
  console.log('Drop them in (see DROP-IMAGES-HERE.md), then run this again.');
  process.exit(0);
}

console.log(`Measuring ${files.length} image(s) in ${DIR}\n`);
console.log(
  'file'.padEnd(34) + 'size'.padEnd(11) + 'lum'.padEnd(7) + 'tone'.padEnd(8) + 'name'.padEnd(8) + 'muted'.padEnd(8) + 'verdict'
);
console.log('-'.repeat(88));

const declared = declaredTones();
let fails = 0;
let mismatches = 0;
for (const f of files) {
  const m = await measure(join(DIR, f));
  const p = m.per[m.best];
  const ok = p.worstName >= MIN_NAME && p.worstMuted >= MIN_MUTED;
  if (!ok) fails++;

  const want = declared[idOf(f)];
  if (want && want !== m.best) {
    mismatches++;
    console.log(
      `${''.padEnd(34)}⚠ ${CATALOGUE} says tone '${want}' — measurement says '${m.best}'.`
    );
    const d = m.per[want];
    console.log(
      `${''.padEnd(34)}  at '${want}': name ${d.worstName.toFixed(2)}, muted ${d.worstMuted.toFixed(2)}` +
        (d.worstName >= MIN_NAME && d.worstMuted >= MIN_MUTED ? ' (still readable)' : ' — UNREADABLE')
    );
  }
  console.log(
    m.file.padEnd(34) +
      `${m.W}x${m.H}`.padEnd(11) +
      m.meanL.toFixed(3).padEnd(7) +
      m.best.padEnd(8) +
      p.worstName.toFixed(2).padEnd(8) +
      p.worstMuted.toFixed(2).padEnd(8) +
      (ok ? (m.flipped ? `ok (flipped from ${m.natural} to stay readable)` : 'ok') : `FAILS (worst row y=${p.worstY})`)
  );
  if (!ok) {
    const other = m.best === 'light' ? 'dark' : 'light';
    const o = m.per[other];
    console.log(
      `${''.padEnd(26)}→ other tone (${other}): name ${o.worstName.toFixed(2)}, muted ${o.worstMuted.toFixed(2)}`
    );
  }
}

console.log('-'.repeat(78));
console.log(`Thresholds: name ≥ ${MIN_NAME} (large text), muted ≥ ${MIN_MUTED} (small text), WCAG AA.`);
if (fails) {
  console.log(
    `\n${fails} image(s) cannot carry text at either tone. Either deepen that tone's scrim in\n` +
      'data/profileBackgrounds.ts (tonePalette) or replace the image — a busy mid-grey\n' +
      'picture is the one thing no scrim fixes without hiding the art entirely.'
  );
  process.exit(1);
}
if (mismatches) {
  console.log(
    `\n${mismatches} image(s) have a declared tone that disagrees with the measurement.\n` +
      `Update \`tone\` in ${CATALOGUE} to the column above, unless the note beside that\n` +
      'entry explains why the declared one is deliberate.'
  );
  process.exit(1);
}
console.log('\nAll backgrounds carry both the name and the muted line at WCAG AA,');
console.log(`and every declared tone in ${CATALOGUE} matches its measurement.`);

// ─────────────────────────────────────────────────────────────────────────────
// PASS TWO — THE HOME MASTHEAD.
//
// Home wears the SAME ten images behind its wordmark, and cannot reuse the tone
// flag measured above: that flag describes the band the PROFILE header's text
// sits in (34% down the picture to the bottom, under an avatar). Home crops a
// short, very wide band out of the MIDDLE of the same picture, and commits to
// one direction — cream on an ink scrim, always. Different pixels, different
// wash, so it needs its own arithmetic.
//
// The numbers come out of constants/homeArt.ts by regex rather than being
// retyped here, for the same reason declaredTones() reads the catalogue: two
// copies of a number is one copy plus a future bug.
// ─────────────────────────────────────────────────────────────────────────────

const HOME = 'constants/homeArt.ts';

function homeContract() {
  const src = readFileSync(HOME, 'utf8');
  const nums = (re) => {
    const m = src.match(re);
    return m ? m.slice(1).map(Number) : null;
  };
  const scrim = [...src.matchAll(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/g)].map((m) => ({
    rgb: [+m[1], +m[2], +m[3]],
    a: +m[4],
  }));
  const stops = nums(/HOME_SCRIM_STOPS[^=]*=\s*\[([\d.]+),\s*([\d.]+),\s*([\d.]+)\]/);
  const textTop = nums(/HOME_TEXT_TOP\s*=\s*([\d.]+)/);
  const bandH = nums(/HOME_BAND_H\s*=\s*(\d+)/);
  const drift = nums(/HOME_DRIFT\s*=\s*\{\s*from:\s*([\d.]+),\s*to:\s*([\d.]+)/);
  const cream = src.match(/HomeCream\s*=\s*'#([0-9A-Fa-f]{6})'/);
  const soft = src.match(/HomeSoft\s*=\s*'rgba\((\d+),(\d+),(\d+),([\d.]+)\)'/);
  if (!stops || !textTop || !bandH || !drift || !cream || scrim.length < 3 || !soft) return null;
  const hex = cream[1];
  return {
    scrim: scrim.slice(0, 3),
    stops,
    textTop: textTop[0],
    bandH: bandH[0],
    drift,
    cream: [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)),
    soft: { rgb: [+soft[1], +soft[2], +soft[3]], a: +soft[4] },
  };
}

/** The wash's alpha at this fraction down the BAND — a 3-stop linear gradient. */
function scrimAt(H, f) {
  const [s0, s1, s2] = H.stops;
  const [c0, c1, c2] = H.scrim;
  if (f <= s1) return c0.a + (c1.a - c0.a) * ((f - s0) / (s1 - s0));
  return c1.a + (c2.a - c1.a) * ((f - s1) / (s2 - s1));
}

const H = existsSync(HOME) ? homeContract() : null;
if (!H) {
  console.log(`\n(skipping the Home masthead — could not parse ${HOME})`);
} else {
  console.log(`\n\nThe HOME masthead — same images, cream on a fixed wash (${HOME})\n`);
  console.log('file'.padEnd(34) + 'wordmark'.padEnd(11) + 'day line'.padEnd(11) + 'verdict');
  console.log('-'.repeat(74));

  // `resizeMode: cover` on a band far wider than it is tall scales the picture to
  // the WIDTH, so what shows is a horizontal slice out of the middle. The drift
  // zooms between two scales; the SHALLOWER one shows more of the picture, so it
  // is the one that can find a bright row — but both are measured, because the
  // deeper zoom shifts which rows land under the type.
  const BAND_AR = 390 / H.bandH;                    // a common phone width
  let homeFails = 0;

  for (const f of files) {
    const img = await Jimp.read(join(DIR, f));
    const W = img.bitmap.width;
    const IH = img.bitmap.height;
    const step = Math.max(1, Math.floor(W / 160));

    let worstWord = Infinity;
    let worstLine = Infinity;
    let worstAt = 0;

    for (const zoom of H.drift) {
      // Fraction of the image's HEIGHT that the band shows at this zoom.
      const visible = Math.min(1, W / (BAND_AR * IH) / zoom);
      const top = 0.5 - visible / 2;

      // Only the rows the TYPE occupies: the bottom (1 - textTop) of the band.
      for (let bf = H.textTop; bf <= 1; bf += 0.02) {
        const iy = Math.min(IH - 1, Math.max(0, Math.round((top + visible * bf) * IH)));
        let r = 0, g = 0, b = 0, n = 0;
        for (let x = 0; x < W; x += step) {
          const idx = (W * iy + x) << 2;
          r += img.bitmap.data[idx];
          g += img.bitmap.data[idx + 1];
          b += img.bitmap.data[idx + 2];
          n++;
        }
        const bg = over(H.scrim[0].rgb, [r / n, g / n, b / n], scrimAt(H, bf));
        const lbg = lum(bg);
        // The day line is cream at 82%, so what the eye gets is cream composited
        // onto the scrimmed picture — measuring the solid cream would flatter it.
        const softOn = over(H.soft.rgb, bg, H.soft.a);
        const rw = ratio(lum(H.cream), lbg);
        const rl = ratio(lum(softOn), lbg);
        if (rw < worstWord) { worstWord = rw; worstAt = bf; }
        if (rl < worstLine) worstLine = rl;
      }
    }

    const ok = worstWord >= MIN_NAME && worstLine >= MIN_MUTED;
    if (!ok) homeFails++;
    console.log(
      basename(f).padEnd(34) +
        worstWord.toFixed(2).padEnd(11) +
        worstLine.toFixed(2).padEnd(11) +
        (ok ? 'ok' : `FAILS (worst at ${(worstAt * 100).toFixed(0)}% down the band)`)
    );
  }

  console.log('-'.repeat(74));
  console.log(`Thresholds: wordmark ≥ ${MIN_NAME} (large), day line ≥ ${MIN_MUTED} (small), WCAG AA.`);
  if (homeFails) {
    console.log(
      `\n${homeFails} image(s) cannot carry the masthead. Deepen HOME_SCRIM in ${HOME}\n` +
        '— but read the note there first: the scrim is already heavy enough to beat a\n' +
        'pure-white pixel, so a failure here usually means the band is showing a part\n' +
        'of the picture the profile header never does.'
    );
    process.exit(1);
  }
  console.log('\nEvery background carries the Home wordmark and its day line at WCAG AA.');
}
