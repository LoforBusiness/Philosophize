import { View, type ViewStyle } from 'react-native';
import { INK, PAPER, PAPER_LIT, FLAT_FACE, OLIVE, TEAL, SAGE, mix } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// DRAWN OBJECTS OUTSIDE THE LESSONS — the welcome parlour's construction, shared.
//
// The seated welcome, the professor's lecture room and the redesigned lessons all
// draw a thing that STANDS the same way: a flat fill, one ink outline at one
// weight, a lit strip along its top edge, and a hard ledge of the object's own
// shade under it. No gradients and no gold (§7, "no gold surfaces"). The tabs
// were drawn in a different vocabulary — photographs and letter tiles — and this
// is the one place that construction lives for the screens that are not lessons,
// so the streak study, the thinker busts and the branch road cannot drift apart.
//
// VIEWS ONLY. An <Svg> is a bitmap the size of its box held for as long as its
// tab is built (§19's GPU budget), and the streak screen sits closest to it.
// ─────────────────────────────────────────────────────────────────────────────

/** The one outline weight every drawn object here uses. */
export const LINE = 2.2;

/** The palette's woods, cloths and stones, walked toward paper for large areas. */
export const WOOD = mix(OLIVE, FLAT_FACE, 0.18);
export const WOOD_LIT = mix(OLIVE, FLAT_FACE, 0.45);
export const WOOD_SHADE = mix(OLIVE, INK, 0.35);
export const CLOTH = mix(TEAL, FLAT_FACE, 0.55);
export const CLOTH_LIT = mix(TEAL, FLAT_FACE, 0.74);
export const CLOTH_SHADE = mix(TEAL, FLAT_FACE, 0.33);
export const STONE = FLAT_FACE;
export const STONE_SHADE = mix(FLAT_FACE, INK, 0.14);
export const LEAF = mix(SAGE, FLAT_FACE, 0.1);
export const LEAF_SHADE = mix(SAGE, INK, 0.28);
/** What a sheet of paper stands on: the page, a little darker. */
export const SHEET_SHADE = mix(PAPER, INK, 0.22);

/** A raised piece: fill, ink outline, and a hard ledge of its own shade below. */
export function slab(
  x: number, y: number, w: number, h: number,
  fill: string, shade: string, r = 5, lip = 3, line = LINE,
): ViewStyle {
  return {
    position: 'absolute', left: x, top: y, width: w, height: h,
    backgroundColor: fill, borderRadius: r, borderWidth: line, borderColor: INK,
    boxShadow: lip > 0 ? `0px ${lip}px 0px ${shade}` : undefined,
  };
}

/** The lit strip along a raised piece's top edge — the light is from above. */
export function Lit({ w, h, r = 5, color = PAPER_LIT, line = LINE }: {
  w: number; h: number; r?: number; color?: string; line?: number;
}) {
  const band = Math.max(2, Math.min(5, h * 0.22));
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute', left: 3, top: 2, width: Math.max(0, w - 6 - 2 * line), height: band,
        borderRadius: Math.min(r, band), backgroundColor: color,
      }}
    />
  );
}

/** A straight ink line from (x1,y1) to (x2,y2), as one rotated View. */
export function Stroke({ x1, y1, x2, y2, w = LINE, color = INK }: {
  x1: number; y1: number; x2: number; y2: number; w?: number; color?: string;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute', left: (x1 + x2) / 2 - len / 2, top: (y1 + y2) / 2 - w / 2,
        width: len, height: w, borderRadius: w / 2, backgroundColor: color,
        transform: [{ rotate: `${ang}rad` }],
      }}
    />
  );
}
