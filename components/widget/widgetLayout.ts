// HOW THE WIDGET IS LAID OUT AT A GIVEN SIZE, AS ARITHMETIC.
//
// ZERO IMPORTS. The widget renders to RemoteViews in a headless task, where
// nothing can be measured before it is drawn — a TextWidget that runs out of
// lines just truncates, and a cut-off fact is worse than none. So what is shown
// is decided HERE, from an estimate of how the words wrap, and `check:widget`
// runs every fact and line through the same function.
//
// Three shapes, after Pixel Weather's widgets (the owner's pick, 2026-10-02):
//   FULL   (4×2 and up)  status and his line top-left, the streak big top-right,
//                         then the fact pill and, at the foot, the week pill. The fact is shown
//                         only when it fits WHOLE; if it does not, it is left out
//                         rather than cut.
//   GLANCE (2×2)         the streak alone, big, with "day streak" and the status.
//   STRIP  (4×1, short)  the streak and the status in one row.

// ADVANCE WIDTHS, MEASURED out of Inter Regular, SemiBold and ExtraBold's real .ttf
// (scripts/lib/ttfwidth.mjs), ASCII 32–126, in hundredths of an em. Inter runs
// WIDER than the phone's Roboto, so a wrap worked out with these can only
// over-count lines on the device, never under-count them.
const W400 = [28,29,47,63,64,98,64,30,36,36,50,66,29,46,29,36,63,41,61,62,65,59,62,57,62,62,29,30,66,66,66,51,97,69,65,73,72,60,59,75,74,27,57,67,57,90,75,76,64,76,64,64,65,74,69,99,68,68,63,36,36,36,47,46,32,56,61,57,61,58,37,61,59,24,24,55,24,88,59,60,61,61,38,53,33,59,56,82,55,56,55,43,33,43,66];
const W600 = [25,32,52,64,65,100,66,33,37,37,54,67,32,47,32,38,66,42,62,64,67,61,64,58,64,64,32,33,67,67,67,54,100,73,66,74,72,61,59,75,75,28,58,70,57,92,76,77,65,77,65,65,66,74,73,102,72,71,65,37,38,37,48,47,35,57,62,58,62,59,39,63,61,26,26,57,26,90,61,61,62,62,40,55,35,61,59,84,57,59,57,45,36,45,67];
const W800 = [22,36,59,66,66,103,68,35,38,38,58,69,35,47,35,40,69,44,64,66,69,63,66,59,66,66,35,36,69,69,69,58,104,77,66,74,72,61,59,75,75,29,59,74,57,94,77,77,65,78,66,66,68,73,77,106,76,75,68,38,40,38,49,48,38,59,64,60,64,60,41,64,64,28,28,59,28,93,64,62,64,64,42,57,38,64,62,86,59,62,58,49,39,49,69];
// [400, 600, 800]
const EXTRA: Record<string, [number, number, number]> = { '’': [26, 29, 33], '‘': [26, 29, 33], '“': [44, 51, 58], '”': [44, 50, 57], '£': [61, 63, 65], 'ō': [60, 61, 62] };

export type Weight = 400 | 600 | 800;
function adv(ch: string, weight: Weight): number {
  const c = ch.charCodeAt(0);
  const t = weight === 800 ? W800 : weight === 400 ? W400 : W600;
  if (c >= 32 && c <= 126) return t[c - 32] / 100;
  const e = EXTRA[ch];
  if (e) return e[weight === 400 ? 0 : weight === 600 ? 1 : 2] / 100;
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

/** Corner radius in dp — the middle of what Android 12+ launchers use. */
export const RADIUS = 24;
export const PAD = 12;
/** Type sizes and line heights, dp. */
export const T = {
  status: { size: 15, lh: 19 },
  line: { size: 12.5, lh: 16 },
  hero: { size: 44, lh: 46 },
  heroFlame: 26,
  // 14 since 2026-10-07: the owner asked for the fact larger. 3 lines of it fit
  // beside a two-row line at 330×190 only at a 17.5 leading and the pill's 5 padding.
  fact: { size: 14, lh: 17.5 },
  glanceHero: { size: 52, lh: 54 },
};
/** The week pill: seven discs with the day's letter in each. */
export const WEEK = { disc: 20, padY: 8, padX: 12, h: 20 + 8 * 2 };
/** The fact pill: a subject mark, then the fact. */
export const FACT = { padY: 5, padX: 12, icon: 20, gap: 8 };
export const GAP = 6;

export interface FullLayout {
  mode: 'full'; w: number; h: number;
  leftW: number;
  lineLines: number; // 0 = his line is left out
  factLines: number; // 0 = the fact is left out
  factW: number;
}
export interface GlanceLayout { mode: 'glance'; w: number; h: number; week: boolean }
export interface StripLayout { mode: 'strip'; w: number; h: number; line: boolean; lineW: number }
export type Layout = FullLayout | GlanceLayout | StripLayout;

const heroWidth = (streak: number) => T.heroFlame + 2 + textWidth(String(streak), T.hero.size, 600);

export function layoutWidget(w: number, h: number, streak: number, line: string, fact: string): Layout {
  if (h < 125) {
    // One row: flame + number, then the status over his line.
    const lineW = w - PAD * 2 - (22 + 2 + textWidth(String(streak), 30, 600)) - 14;
    return { mode: 'strip', w, h, line: h >= 64 && wrapLines(line, T.line.size, lineW, 400) === 1, lineW };
  }
  if (w < 240) return { mode: 'glance', w, h, week: h >= 160 };

  const leftW = w - PAD * 2 - heroWidth(streak) - 10;
  const factW = w - PAD * 2 - FACT.padX * 2 - FACT.icon - FACT.gap;
  const need = (lineLines: number, factLines: number) => {
    const top = Math.max(T.hero.lh, T.status.lh + (lineLines ? 3 + lineLines * T.line.lh : 0));
    const fact = factLines ? GAP + FACT.padY * 2 + factLines * T.fact.lh : 0;
    return PAD * 2 + top + 6 + WEEK.h + fact;
  };
  const lineWrap = wrapLines(line, T.line.size, leftW, 400);
  // His line is shown whole, on at most two lines, or not at all.
  const lineLines = lineWrap <= 2 ? lineWrap : 0;
  const factNeed = fact ? wrapLines(fact, T.fact.size, factW, 400) : 0;
  // Priority: the streak and the week always; then his line; then the fact, whole or not at all.
  const factLines = factNeed && need(lineLines, factNeed) <= h ? factNeed : 0;
  if (need(lineLines, factLines) > h) return { mode: 'full', w, h, leftW, lineLines: 0, factLines: 0, factW };
  return { mode: 'full', w, h, leftW, lineLines, factLines, factW };
}

/** What check:widget asks of every fact: shown whole at this size. */
export function factShown(w: number, h: number, streak: number, line: string, fact: string): boolean {
  const L = layoutWidget(w, h, streak, line, fact);
  return L.mode === 'full' && L.factLines > 0;
}
