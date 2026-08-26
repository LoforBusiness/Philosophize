// ─────────────────────────────────────────────────────────────────────────────
// HOW WIDE IS THAT LINE, REALLY — a TrueType advance-width reader in plain Node.
//
// ZERO DEPENDENCIES and no browser, the same rule as rig.ts and rasterpath.mjs, and
// for the same reason: the thing it measures is checked on every run of `npm run
// check`, so it has to cost milliseconds rather than a Metro and a headless Chrome.
//
// ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
//
// Two surfaces in this app hold hand-written lines inside a box that cannot grow,
// and both of them state a character count in a comment:
//
//   · RewardLoafer's thought cloud — 152 wide, and every line in LOAFER_LINES is
//     hand-broken with a `\n` to fit it. The file says "about NINETEEN characters
//     at this size — measured off a render".
//   · StreakMascot's line — 300 wide, wrapped by the platform.
//
// A CHARACTER COUNT IS NOT A WIDTH. In Inter 12.5, "Wittgenstein" is 78px and
// "illiterate," is 51 — same twelve characters, half again the ink. So a rule
// counted in characters is either loose enough to let a line overflow or tight
// enough to forbid perfectly good ones, and the shipped corpus proves it: the
// widest line that fits is 22 characters and the narrowest that does not is 20.
//
// Overflow is not a cosmetic matter on either surface. The cloud is anchored from
// its BOTTOM (so it sits at the figure's head), so a line that wraps to a fourth
// row grows UPWARD, off the top of the block. And a line that wraps at all strands
// its tail — the orphaned break the rule book calls D30.
//
// ── WHAT IT DOES NOT DO ─────────────────────────────────────────────────────
//
// No kerning and no ligatures. Both almost always make a run NARROWER, so the
// number this returns is a slight over-estimate — which is the safe direction for
// a "does it fit" test, and is why the budgets below carry a margin rather than
// sitting on the box's exact inner width.
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'node:fs';

/** Parse a .ttf far enough to measure text. Returns { width(str, px) }. */
export function loadFont(file) {
  const b = fs.readFileSync(file);

  // ── the table directory ───────────────────────────────────────────────────
  const numTables = b.readUInt16BE(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const p = 12 + i * 16;
    tables[b.toString('ascii', p, p + 4)] = { off: b.readUInt32BE(p + 8), len: b.readUInt32BE(p + 12) };
  }
  for (const t of ['head', 'hhea', 'hmtx', 'cmap']) {
    if (!tables[t]) throw new Error(`${file}: no ${t} table`);
  }

  const unitsPerEm = b.readUInt16BE(tables.head.off + 18);
  const numHMetrics = b.readUInt16BE(tables.hhea.off + 34);

  // ── advance widths, in font units ─────────────────────────────────────────
  const adv = new Uint16Array(numHMetrics);
  for (let i = 0; i < numHMetrics; i++) adv[i] = b.readUInt16BE(tables.hmtx.off + i * 4);

  // ── the character map ─────────────────────────────────────────────────────
  //
  // Prefer Windows/BMP (3,1) format 4, which every one of these faces has and which
  // covers everything these lines can contain — Latin plus the typographic quotes
  // and the en dash. (3,10) format 12 is read as a fallback so this stays useful if
  // a face ever turns up without the BMP table.
  const cmapOff = tables.cmap.off;
  const nEnc = b.readUInt16BE(cmapOff + 2);
  let sub = 0, subFormat = 0;
  for (let i = 0; i < nEnc; i++) {
    const p = cmapOff + 4 + i * 8;
    const plat = b.readUInt16BE(p), enc = b.readUInt16BE(p + 2);
    const off = cmapOff + b.readUInt32BE(p + 4);
    const fmt = b.readUInt16BE(off);
    const good = (plat === 3 && enc === 1 && fmt === 4) || (plat === 0 && fmt === 4);
    if (good) { sub = off; subFormat = 4; break; }
    if (plat === 3 && enc === 10 && fmt === 12 && !sub) { sub = off; subFormat = 12; }
  }
  if (!sub) throw new Error(`${file}: no usable cmap subtable`);

  const map = new Map();
  if (subFormat === 4) {
    const segCount = b.readUInt16BE(sub + 6) / 2;
    const endP = sub + 14;
    const startP = endP + segCount * 2 + 2;
    const deltaP = startP + segCount * 2;
    const rangeP = deltaP + segCount * 2;
    for (let s = 0; s < segCount; s++) {
      const end = b.readUInt16BE(endP + s * 2);
      const start = b.readUInt16BE(startP + s * 2);
      const delta = b.readInt16BE(deltaP + s * 2);
      const rangeOff = b.readUInt16BE(rangeP + s * 2);
      if (start === 0xffff) continue;
      for (let c = start; c <= end && c !== 0x10000; c++) {
        let g;
        if (rangeOff === 0) g = (c + delta) & 0xffff;
        else {
          const gp = rangeP + s * 2 + rangeOff + (c - start) * 2;
          if (gp + 1 >= b.length) continue;
          g = b.readUInt16BE(gp);
          if (g !== 0) g = (g + delta) & 0xffff;
        }
        if (g) map.set(c, g);
      }
    }
  } else {
    const nGroups = b.readUInt32BE(sub + 12);
    for (let i = 0; i < nGroups; i++) {
      const p = sub + 16 + i * 12;
      const start = b.readUInt32BE(p), end = b.readUInt32BE(p + 4), gid = b.readUInt32BE(p + 8);
      for (let c = start; c <= end; c++) map.set(c, gid + (c - start));
    }
  }

  // A glyph past numHMetrics carries the LAST advance in the table — that is the
  // format, not a fallback: monospace tails are stored exactly once.
  const advanceOf = (gid) => adv[gid < numHMetrics ? gid : numHMetrics - 1];
  const notdef = advanceOf(0);

  /** Advance width of `str` at `px`, in the same units as a React Native style. */
  const width = (str, px) => {
    let u = 0;
    for (const ch of str) {
      const gid = map.get(ch.codePointAt(0));
      u += gid === undefined ? notdef : advanceOf(gid);
    }
    return (u * px) / unitsPerEm;
  };

  /**
   * Characters this face has no glyph for — the ones that reach the reader as a
   * tofu box.
   *
   * Worth its own call rather than being folded into `width`, because a missing
   * glyph is invisible to a width test in the direction that matters: `.notdef` is
   * a NARROW box in most faces, so a line full of characters the font does not
   * have measures comfortably inside its budget and passes. Typographic quotes and
   * the em dash are the ones that actually turn up in hand-written copy, and
   * Caveat — a handwriting face with 753 glyphs against Inter's 2818 — is exactly
   * the sort of face that goes without them.
   */
  const missing = (str) => [...str].filter((ch) => !map.has(ch.codePointAt(0)));

  return { width, missing, unitsPerEm, glyphs: map.size };
}

/**
 * Greedy word wrap at a width, the way both React Native and the browser do it.
 * Returns the lines. A single word wider than the box gets its own line rather
 * than being broken — which is also what the platform does, and what makes an
 * over-long word show up here as an over-wide line rather than as a silent split.
 */
export function wrap(text, px, maxW, font) {
  const out = [];
  for (const para of text.split('\n')) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) { out.push(''); continue; }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const next = `${line} ${words[i]}`;
      if (font.width(next, px) <= maxW) line = next;
      else { out.push(line); line = words[i]; }
    }
    out.push(line);
  }
  return out;
}
