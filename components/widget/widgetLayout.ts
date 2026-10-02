// HOW THE WIDGET IS LAID OUT AT A GIVEN SIZE, AS ARITHMETIC.
//
// ZERO IMPORTS. The widget renders to RemoteViews in a headless task, where
// nothing can be measured before it is drawn — a TextWidget that runs out of
// lines just truncates, and a truncated fact is worse than none. So the type size
// is chosen HERE, from an estimate of how the words wrap, and `check:widget` runs
// every fact through the same function at the smallest split size.
//
// The estimate is deliberately WIDE: Android's default face is Roboto, which runs
// narrower than these widths, so a fact the estimate fits will fit on the phone
// with room to spare, and one it does not fit is set smaller rather than cut.

export type WidgetMode = 'split' | 'day';

/** Corner radius in dp — the middle of what Android 12+ launchers use. */
export const RADIUS = 22;
/** Below this width the fact has no room, and the widget is just his day. A 4×2
 *  on a modern phone is 300–360dp wide and 150–190 tall; this is the margin. */
export const SPLIT_MIN_W = 260;
/** Below this height there is no room for a fact either (a 4×1). */
export const SPLIT_MIN_H = 120;

export const PAD = { l: 14, r: 13, t: 12, b: 11 };
export const KICKER = { size: 9.5, h: 12, gap: 5 };
export const FOOT = { size: 11, lh: 14, gap: 6 };
export const FACT_SIZES = [15, 14, 13, 12, 11.5];
export const FACT_LH = 1.24;

// ADVANCE WIDTHS, MEASURED — not guessed. Inter SemiBold and ExtraBold, read out
// of the real .ttf (scripts/lib/ttfwidth.mjs) for ASCII 32–126, in hundredths of
// an em. Inter runs WIDER than the phone's Roboto, so a wrap worked out with these
// can only over-count lines on the device, never under-count them. The first draft
// guessed widths by kind of character and under-counted by about a line in four,
// which the contact sheet showed as one fact in three cut off with an ellipsis.
const W600 = [25,32,52,64,65,100,66,33,37,37,54,67,32,47,32,38,66,42,62,64,67,61,64,58,64,64,32,33,67,67,67,54,100,73,66,74,72,61,59,75,75,28,58,70,57,92,76,77,65,77,65,65,66,74,73,102,72,71,65,37,38,37,48,47,35,57,62,58,62,59,39,63,61,26,26,57,26,90,61,61,62,62,40,55,35,61,59,84,57,59,57,45,36,45,67];
const W800 = [22,36,59,66,66,103,68,35,38,38,58,69,35,47,35,40,69,44,64,66,69,63,66,59,66,66,35,36,69,69,69,58,104,77,66,74,72,61,59,75,75,29,59,74,57,94,77,77,65,78,66,66,68,73,77,106,76,75,68,38,40,38,49,48,38,59,64,60,64,60,41,64,64,28,28,59,28,93,64,62,64,64,42,57,38,64,62,86,59,62,58,49,39,49,69];
const EXTRA: Record<string, [number, number]> = { '’': [29, 33], '‘': [29, 33], '“': [51, 58], '”': [50, 57] };

export type Weight = 600 | 800;
function adv(ch: string, weight: Weight): number {
  const c = ch.charCodeAt(0);
  const t = weight === 800 ? W800 : W600;
  if (c >= 32 && c <= 126) return t[c - 32] / 100;
  const e = EXTRA[ch];
  if (e) return (weight === 800 ? e[1] : e[0]) / 100;
  return 0.66; // anything else: as wide as a capital, the safe side
}
export function textWidth(s: string, size: number, weight: Weight = 600): number {
  let w = 0;
  for (const ch of s) w += adv(ch, weight);
  return w * size;
}

/** Greedy word wrap into a box `width` wide. Returns the number of lines. */
export function wrapLines(text: string, size: number, width: number, weight: Weight = 600): number {
  const words = text.split(/\s+/).filter(Boolean);
  let lines = 1, cur = 0;
  const space = adv(' ', weight) * size;
  for (const w of words) {
    const ww = textWidth(w, size, weight);
    if (cur === 0) cur = ww;
    else if (cur + space + ww <= width) cur += space + ww;
    else { lines += 1; cur = ww; }
  }
  return lines;
}

export interface SplitLayout {
  mode: 'split';
  w: number; h: number;
  leftW: number;
  rightW: number;
  factSize: number;
  factLines: number;
  footLines: number; // 0 = the line is dropped
}
export interface DayLayout {
  mode: 'day';
  w: number; h: number;
  lineSize: number;
  lineLines: number;
  textW: number;
}

export function layoutWidget(w: number, h: number, fact: string, line: string): SplitLayout | DayLayout {
  if (w < SPLIT_MIN_W || h < SPLIT_MIN_H || !fact) {
    // His day: the line sits over the sky on the left, he stands on the right.
    // He stands at 0.8 of the width and is about a quarter of the height wide, so the
    // column stops short of his reach.
    const textW = Math.floor(w * 0.8 - h * 0.2 - PAD.l);
    const room = (size: number) => Math.max(1, Math.floor((h * 0.8 - PAD.t - 30) / (size * 1.2)));
    // No single word may be wider than the column: a word that cannot wrap runs
    // straight into him (the contact sheet's "Afternoon." on a 2×2).
    const longest = (size: number) => Math.max(...line.split(/\s+/).map((wd) => textWidth(wd, size, 800)));
    for (const size of [16, 15, 14, 13, 12, 11]) {
      const n = wrapLines(line, size, textW, 800);
      if (n <= room(size) && longest(size) <= textW) return { mode: 'day', w, h, lineSize: size, lineLines: room(size), textW };
    }
    return { mode: 'day', w, h, lineSize: 11, lineLines: room(11), textW };
  }
  const leftW = Math.round(Math.max(96, w * 0.37));
  const rightW = w - leftW;
  const inner = rightW - PAD.l - PAD.r;
  for (const footMax of [2, 1, 0]) {
    const need = wrapLines(line, FOOT.size, inner, 800);
    if (footMax > 0 && need > footMax) continue;
    const footLines = footMax === 0 ? 0 : need;
    const footH = footLines ? footLines * FOOT.lh + FOOT.gap : 0;
    const area = h - PAD.t - PAD.b - KICKER.h - KICKER.gap - footH;
    for (const size of FACT_SIZES) {
      const lh = size * FACT_LH;
      const room = Math.floor(area / lh);
      const n = wrapLines(fact, size, inner);
      // factLines is the ROOM, not the estimate: the estimate decides the size, and
      // the widget may then use every line the panel has, so a wrap that runs one
      // longer on some launcher still shows the whole fact.
      if (n <= room) return { mode: 'split', w, h, leftW, rightW, factSize: size, factLines: room, footLines };
    }
  }
  // Nothing fits: the smallest size with every line it has room for. check:widget
  // fails any fact that gets here at the smallest split size.
  const size = FACT_SIZES[FACT_SIZES.length - 1];
  const room = Math.max(1, Math.floor((h - PAD.t - PAD.b - KICKER.h - KICKER.gap) / (size * FACT_LH)));
  return { mode: 'split', w, h, leftW, rightW, factSize: size, factLines: room, footLines: 0 };
}

/** True when the fact fits whole at this size (what check:widget asks of every fact). */
export function factFits(w: number, h: number, fact: string, line: string): boolean {
  const L = layoutWidget(w, h, fact, line);
  if (L.mode !== 'split') return true;
  return wrapLines(fact, L.factSize, L.rightW - PAD.l - PAD.r) <= L.factLines && L.footLines > 0;
}
