import { memo, useId } from 'react';
import React from 'react';
import { View } from 'react-native';
import Svg from 'react-native-svg';
import { type GlyphName } from './Glyph';
import { InsigniaNodes, StruckMark } from './InsigniaParts';
import { LOCKED, PLAIN, rankArt, tonesOf, type RankArt, type Tones } from './insigniaArt';
import { ORDER, ORDERS, type OrderName } from '@/constants/insignia';

// -----------------------------------------------------------------------------
// A RANK IS A STRUCK CREST. ITS COLOUR IS THE LADDER; ITS SHAPE IS THE ORDER;
// WHAT IS BUILT ONTO IT IS THE RUNG.
//
// This is the fourth drawing of the ladder, and the first three each taught
// something that still holds:
//
//   · one frame for every rank, with only the mark changing, is a SET and not
//     a LADDER — paint is not an achievement;
//   · one escalation over forty-eight rungs leaves most readers in its dull
//     middle and runs out of edge, so it grows LIMBS — "looks like horns and
//     then looks as if it gains wings. I don't want this design at all";
//   · six shapes cycled inside every colour fixed the pacing and made every
//     capstone the same drawing — "they are all the same, I want uniqueness".
//
// The fourth answered a different note: "really flat, really boring … you can
// just tell it's all AI drawn … not gamified". The owner picked the GAME CREST
// from three researched directions (Duolingo, Brilliant, Clash): a thick outline,
// a lip for thickness, a bright rim, a recessed face, glare, a heavy mark. The
// geometry, the build and every reason behind them live in insigniaArt.ts, which
// has no React in it so scripts/sheet-ranks.mjs can draw all forty-eight in
// plain Node and scripts/check-ui.mjs can measure them.
//
// -- A LOCKED PIN KEEPS ITS SHAPE AND LOSES ITS MATERIAL ---------------------
//
// The next pin up the ladder is a visibly different object, so a reader can see
// what the next promotion looks like before earning it. What locking takes away
// is the material — cool, flat, no glare, no glint, no shadow — because the
// material is the reward, and "the same pin, dimmer" reads as a rendering fault.
//
// -- THERE IS NO PROGRESS ARC ANY MORE ---------------------------------------
//
// A white band used to run round the pin's edge, filling toward the next rank.
// On the game crest it sat on the dark outline, and the owner took it out
// (2026-09-16): "a white line going around the rank badge … it doesn't really
// fit there … so it looks cleaner." Every screen that showed it already says the
// same thing in a bar or a line of text beside the pin.
//
// Geometry lives in a 100×100 box.
// -----------------------------------------------------------------------------

export type SealState = 'earned' | 'current' | 'locked';

interface Props {
  glyph: GlyphName;
  state: SealState;
  size?: number;
  /**
   * WHICH OF THE EIGHT ORDERS THE PIN BELONGS TO — see constants/insignia.ts.
   *
   * It decides the MATERIAL and the SHAPE. Pass null where there is no rank at
   * all, such as an unbought Scholar's Pass card.
   */
  order?: OrderName | null;
  /**
   * HOW FAR THROUGH ITS ORDER THE RANK IS, 0–5 — and this is what is BUILT onto
   * the crest: an inner rule, stones in its foot, a frame of its own shape,
   * stones on the frame, a capstone. insigniaArt.ts `rankBuild`.
   */
  degree?: number;
}

// Built once per (order, degree, material) and kept: a rank's art is pure
// geometry, the ladder sheet draws forty-eight at a time, and nothing about one
// ever changes while the app runs.
const ART = new Map<string, RankArt>();
function artFor(oi: number, degree: number, key: string, tones: Tones): RankArt {
  const k = `${oi}:${degree}:${key}`;
  let a = ART.get(k);
  if (!a) { a = rankArt(oi, degree, tones); ART.set(k, a); }
  return a;
}

// MEMOISED. Every prop is a primitive, so the comparison is exact and no call
// site can defeat it with a fresh object. A struck insignia is an <Svg> — the
// most expensive leaf this app draws — and Profile renders several of them.
export default memo(function RankSeal({
  glyph, state, size = 96, order = null, degree = 0,
}: Props) {
  const locked = state === 'locked';
  const oi = order ? Math.max(0, ORDERS.indexOf(order)) : 0;
  // The material IS the reward, so a locked pin gets none, whatever its order.
  const key = locked ? 'locked' : order ?? 'plain';
  const tones = locked ? LOCKED : order ? tonesOf(ORDER[order]) : PLAIN;
  const art = artFor(oi, degree, key, tones);

  // useId embeds ':', which is not a legal id; the clip paths are keyed on it.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <InsigniaNodes nodes={art.nodes} id={uid} />
      </Svg>
      <StruckMark glyph={glyph} mark={art.mark} size={size} />
    </View>
  );
});
