import { useCallback, useMemo, type ReactNode } from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withDelay, withSequence, withTiming, interpolate,
  Extrapolation, Easing, type SharedValue,
} from 'react-native-reanimated';
import SketchIcon, { type SketchIconName } from '@/components/shared/SketchIcon';
import { StruckTile } from '@/components/profile/Struck';
import { INK, MID, GHOST, PAPER, PAPER_LIT, PAPER_SHADE, mix, PATINA, EMBER_INK, SAND, SAND_LIT } from '@/components/shared/tone';
import { SPACE } from '@/constants/design';
import {
  compareRows, includedTiles, type Cell, type CompareRow, type IncludedTile,
} from '@/lib/utils/passCompare';

// ─────────────────────────────────────────────────────────────────────────────
// THE FREE-AGAINST-PASS CHART, AND THE ONE PLACE IT IS DRAWN.
//
// It was drawn inside the Pass tab, and then a reader asked for the same look in
// two more places: the offer a free reader meets after a lesson, and Settings ›
// Subscription. Three copies of a chart that takes money is three places for a
// claim to go stale, which is §14's founding fault, so there is one chart and
// three screens draw it.
//
// Brilliant's own paywall is the model (researched against their app, 2025): a
// Benefits column, a quiet Free column, and the paid column raised in a bright
// frame, five short rows with a tick, a cross or a few words in each. Here the
// raised column is struck in the palette’s slate teal on a hard lip, with a sand card cut
// into it (the palette in tone.ts; it was gold until 2026-09-15), and a cross
// only appears where the free tier has none of the thing.
//
// ── THE ARRIVAL IS OPTIONAL, AND THAT IS THE READER'S CALL ──────────────────
//
// Pass a `play` driver and the chart arrives: a glint crosses the plate, then the
// Pass column's cells stamp in one row at a time. The tab replays it on focus and
// the post-lesson offer on mount. Settings passes none, on the reader's own
// instruction: it is somewhere a reader goes to do one thing.
//
// ── THREE SIZES, BECAUSE SETTINGS IS NARROW ─────────────────────────────────
//
// The tab's content column is 342pt on a 390 phone. The Settings card sits
// beside a labelled rail and is about 225pt there and about 160pt at 320dp, so
// `size="compact"` takes the width it is given and picks the smaller columns, or
// the smallest below `COMPACT_MIN`.
//
// EVERY CELL AND FIGURE IS DERIVED. `compareRows()` builds the rows from
// `PASS_LINES` and `includedTiles()` counts the library out of the tree;
// `npm run check:pass` re-derives both and reads this file for a typed digit.
// ─────────────────────────────────────────────────────────────────────────────


/** The Free column's panel: a breath of the locked slate, the quieter of the two. */
const FREE_PANEL = mix(PAPER, GHOST, 0.16);
/** The "not at all" token. check-pass measures it on the panel, and the cross on it. */
const NO_DISC = mix(GHOST, INK, 0.36);
const RULE = mix(PAPER_SHADE, PAPER, 0.45);
const LIGHT_START = { x: 0.15, y: 0 } as const;
const LIGHT_END = { x: 0.85, y: 1 } as const;

interface Metrics {
  /** Column widths. */ freeW: number; passW: number;
  /** Teal showing round the sand card, and the hard lip under the column. */ frame: number; lip: number;
  /** How far the Pass column stands above the Free panel. */ lift: number;
  headH: number; rowH: number; mark: number; radius: number; cardRadius: number;
  head: number; headPass: number; label: number; labelLine: number; value: number;
}

// FULL is the tab's, measured at 320dp where the benefit label keeps 110pt.
// COMPACT and TINY are Settings', sized so no label needs more than two lines and
// "Unlimited" still fits its cell at the card's width.
const FULL: Metrics = {
  freeW: 64, passW: 90, frame: 6, lip: 4, lift: 10, headH: 54, rowH: 56, mark: 26,
  radius: 20, cardRadius: 14, head: 15, headPass: 19, label: 14, labelLine: 18, value: 13,
};
const COMPACT: Metrics = {
  freeW: 52, passW: 72, frame: 5, lip: 3, lift: 8, headH: 44, rowH: 46, mark: 22,
  radius: 16, cardRadius: 11, head: 13, headPass: 16, label: 12.5, labelLine: 16, value: 11.5,
};
const TINY: Metrics = {
  freeW: 44, passW: 60, frame: 4, lip: 3, lift: 6, headH: 40, rowH: 42, mark: 20,
  radius: 14, cardRadius: 10, head: 12, headPass: 14, label: 11.5, labelLine: 14.5, value: 10.5,
};
/** Below this card width, Settings takes the smallest columns. */
const COMPACT_MIN = 210;

// ── THE ARRIVAL, AS WINDOWS OF ONE DRIVER ───────────────────────────────────
//
// One linear value, 0 → 1. The driver RESTS AT 1, so a chart that is never told
// to arrive (a warmed tab, a preview with no navigator) shows everything in place
// rather than waiting for an arrival that never comes.
const PLAY_MS = 1500;
const SHEEN_AT = 0.04;
const SHEEN_LEN = 0.42;
const SHEEN_H = 120;
const STAMP_AT = 0.26;
const STAMP_STEP = 0.09;
const STAMP_LEN = 0.22;

const TILE_ICON: Record<IncludedTile['id'], SketchIconName> = {
  library: 'book',
  thinkers: 'hat',
  quotes: 'bookmark',
  ranks: 'star',
  badges: 'spark',
  streak: 'flame',
};

/**
 * The driver for a chart's arrival, and the call that plays it.
 *
 * `replay(delay)` snaps the driver to 0 and runs it back to 1. The delay is for a
 * screen that is itself still arriving: the post-lesson offer slides up as a
 * modal, and cells stamped during the slide are stamped where nobody can see.
 */
export function usePassArrival() {
  const play = useSharedValue(1);
  const replay = useCallback((delay = 0) => {
    play.value = withSequence(
      withTiming(0, { duration: 0 }),
      withDelay(delay, withTiming(1, { duration: PLAY_MS, easing: Easing.linear })),
    );
  }, [play]);
  return { play, replay };
}

export default function PassChart({ size = 'full', width = 0, play }: {
  size?: 'full' | 'compact';
  /** The width the chart is drawn at. Only `compact` reads it, to pick its columns. */
  width?: number;
  /** The arrival driver from `usePassArrival`. Leave it out and the chart is still. */
  play?: SharedValue<number>;
}) {
  const m = size === 'full' ? FULL : width >= COMPACT_MIN ? COMPACT : TINY;
  const s = useMemo(() => sized(m), [m]);
  const rows = useMemo(() => compareRows(), []);
  const tableH = useSharedValue(0);
  const onTable = (e: LayoutChangeEvent) => {
    tableH.value = e.nativeEvent.layout.height;
  };

  return (
    <View nativeID="pass-chart" onLayout={play ? onTable : undefined}>
      {/* The two columns are drawn first, as panels, and the rows are laid over
          them. That is what keeps a row one height across all three columns when
          its label wraps on a narrow phone. */}
      <View style={s.freePanel} />
      <View style={s.passFrame}>
        {/* A SLAB, NOT `elevation`. On Android an elevated view is drawn above
            its unelevated siblings whatever the JSX order, so a shadowed frame
            would sit on top of the very rows it is meant to be behind. */}
        <View style={s.passLip} />
        <LinearGradient
          colors={[PATINA.lit, PATINA.base, mix(PATINA.base, PATINA.shade, 0.55)]}
          locations={[0, 0.42, 1]}
          start={LIGHT_START}
          end={LIGHT_END}
          style={s.passFace}
        >
          {play ? <Sheen play={play} tableH={tableH} style={s.sheen} /> : null}
          <View style={s.passCard}>
            <View style={s.passCut} />
          </View>
        </LinearGradient>
      </View>

      <View style={s.headRow}>
        <Text style={s.headLabel}>Benefits</Text>
        <View style={s.freeCell}>
          <Text style={s.headFree}>Free</Text>
        </View>
        <View style={s.passCell}>
          <Text style={s.headPass}>Pass</Text>
        </View>
      </View>

      {rows.map((row, i) => (
        <Row key={row.id} row={row} index={i} play={play} s={s} />
      ))}
      <View style={s.tail} />
    </View>
  );
}

/** One benefit: its label, the Free cell, and the Pass cell landing in turn. */
function Row({ row, index, play, s }: {
  row: CompareRow; index: number; play?: SharedValue<number>; s: Sized;
}) {
  const pass = <Mark cell={row.pass} tier="pass" s={s} />;
  return (
    <View style={s.row}>
      {/* The rule above each row runs across the label and the Free panel, and
          separately inside the white card. The first row's upper edge inside the
          card IS the card's own top, so it draws no second line there. */}
      <View style={s.ruleLeft} />
      {index > 0 ? <View style={s.rulePass} /> : null}

      <Text style={s.rowLabel}>{row.label}</Text>
      <View style={s.freeCell}>
        <Mark cell={row.free} tier="free" s={s} />
      </View>
      <View style={s.passCell}>
        {play ? <Stamp play={play} index={index}>{pass}</Stamp> : pass}
      </View>
    </View>
  );
}

/**
 * A tick, a cross, or a few words.
 *
 * THE TICK IS A TEAL COIN WITH A SAND TICK, because sand is the readable one on
 * the teal (`PATINA.on`, 7.38:1) and because a coin is what this app pays in.
 * THE CROSS IS FLAT AND COOL, the treatment a locked medal gets, so the two
 * tokens differ by material and not only by the mark on them.
 */
function Mark({ cell, tier, s }: { cell: Cell; tier: 'free' | 'pass'; s: Sized }) {
  if (cell.kind === 'yes') {
    return (
      <View style={s.coinHalo}>
        <LinearGradient colors={[PATINA.lit, PATINA.base]} start={LIGHT_START} end={LIGHT_END} style={s.coin}>
          <View style={s.tickShort} />
          <View style={s.tickLong} />
        </LinearGradient>
      </View>
    );
  }
  if (cell.kind === 'no') {
    return (
      <View style={s.noDisc}>
        <View style={[s.crossBar, s.crossA]} />
        <View style={[s.crossBar, s.crossB]} />
      </View>
    );
  }
  return <Text style={tier === 'pass' ? s.valuePass : s.valueFree}>{cell.text}</Text>;
}

/**
 * THE STRIKE, IN MINIATURE. The streak seal lands as a die coming down onto paper
 * (CLAUDE.md §7), and a cell lands the same way: from above the page,
 * accelerating, squashing on contact and settling. A spring from small to full
 * size would read as something inflating, which nothing on a chart does.
 */
function Stamp({ play, index, children }: { play: SharedValue<number>; index: number; children: ReactNode }) {
  const style = useAnimatedStyle(() => {
    const a = STAMP_AT + index * STAMP_STEP;
    const u = interpolate(play.value, [a, a + STAMP_LEN], [0, 1], Extrapolation.CLAMP);
    const f = Math.min(1, u / 0.55);
    const scale = u < 0.55
      ? 1.7 - 0.8 * f * f
      : interpolate(u, [0.55, 0.8, 1], [0.9, 1.05, 1]);
    return {
      opacity: interpolate(u, [0, 0.2], [0, 1], Extrapolation.CLAMP),
      transform: [{ scale }],
    };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
}

/** The glint across the plate, once per arrival. Clipped by the frame's own corners. */
function Sheen({ play, tableH, style: box }: {
  play: SharedValue<number>; tableH: SharedValue<number>; style: Sized['sheen'];
}) {
  const style = useAnimatedStyle(() => {
    const u = interpolate(play.value, [SHEEN_AT, SHEEN_AT + SHEEN_LEN], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: u > 0 && u < 1 ? 1 : 0,
      transform: [
        { translateY: -SHEEN_H + u * (tableH.value + SHEEN_H * 2) },
        { rotate: '-24deg' },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[box, style]}>
      <LinearGradient
        colors={[`${PAPER_LIT}00`, `${PAPER_LIT}B3`, `${PAPER_LIT}00`]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

/**
 * WHAT EVERY PLAN INCLUDES, as six tiles in two rows of three.
 *
 * Printed ONCE, under the chart, rather than as rows in both columns: NN/g's rule
 * for a comparison on a phone is to merge what both options share. Each row is a
 * flex row, so the tiles take the width they are given without being measured,
 * and `flex-start` because StruckTile's face does not stretch with its shadow.
 */
export function PlanTiles() {
  const tiles = useMemo(() => includedTiles(), []);
  const rows = [tiles.slice(0, 3), tiles.slice(3)];
  return (
    <View style={st.tiles}>
      {rows.map((r) => (
        <View key={r.map((t) => t.id).join('-')} style={st.tileRow}>
          {r.map((t) => <Tile key={t.id} tile={t} />)}
        </View>
      ))}
    </View>
  );
}

function Tile({ tile }: { tile: IncludedTile }) {
  return (
    <StruckTile pad={2} style={st.tile}>
      <View style={st.tileTop}>
        <SketchIcon name={TILE_ICON[tile.id]} size={17} color={EMBER_INK} />
        <Text style={st.tileFigure} numberOfLines={1}>{tile.figure}</Text>
      </View>
      <Text style={st.tileNoun} numberOfLines={2}>{tile.noun}</Text>
    </StruckTile>
  );
}

type Sized = ReturnType<typeof sized>;

/** The chart's styles at one size. `k` scales the drawn marks with the coin. */
function sized(m: Metrics) {
  const k = m.mark / FULL.mark;
  const inset = m.frame + Math.round(m.passW * 0.09);
  const pad = Math.round(m.rowH * 0.14);
  const halo = m.mark + 8 * k;
  return StyleSheet.create({
    // It runs under the teal column, so its right-hand corners are tucked behind
    // the frame rather than showing as a second rounded edge beside it.
    freePanel: {
      position: 'absolute', top: m.lift, bottom: m.lip + m.frame,
      right: m.passW - m.frame * 3, width: m.freeW + m.frame * 3,
      borderRadius: m.radius - 2, backgroundColor: FREE_PANEL,
    },
    passFrame: { position: 'absolute', top: 0, bottom: 0, right: 0, width: m.passW },
    passLip: {
      position: 'absolute', left: 0, right: 0, top: m.lip, bottom: 0,
      borderRadius: m.radius, backgroundColor: PATINA.rim,
    },
    passFace: {
      position: 'absolute', left: 0, right: 0, top: 0, bottom: m.lip,
      borderRadius: m.radius, overflow: 'hidden', borderWidth: 1, borderColor: PATINA.shade,
    },
    passCard: {
      position: 'absolute', top: m.headH - 1, left: m.frame - 1, right: m.frame - 1, bottom: m.frame - 1,
      borderRadius: m.cardRadius, backgroundColor: SAND, overflow: 'hidden',
    },
    // The card is a window cut into the teal, so its top edge is the dark one.
    passCut: {
      position: 'absolute', left: 0, right: 0, top: 0, height: 1.5,
      backgroundColor: mix(PATINA.shade, SAND, 0.4),
    },
    sheen: { position: 'absolute', left: -m.passW / 2, width: m.passW * 2, top: 0, height: SHEEN_H },

    headRow: { flexDirection: 'row', alignItems: 'center', height: m.headH, paddingTop: m.lift / 2 },
    headLabel: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: m.head, color: INK },
    headFree: { fontFamily: 'Inter_700Bold', fontSize: m.head, color: MID },
    headPass: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: m.headPass, color: PATINA.on, includeFontPadding: false },

    row: { flexDirection: 'row', alignItems: 'center', minHeight: m.rowH },
    ruleLeft: { position: 'absolute', top: 0, left: 0, right: m.passW, height: 1, backgroundColor: RULE },
    rulePass: {
      position: 'absolute', top: 0, right: inset, width: m.passW - inset * 2,
      height: 1, backgroundColor: mix(SAND, INK, 0.16),
    },
    rowLabel: {
      flex: 1, fontFamily: 'Inter_500Medium', fontSize: m.label, lineHeight: m.labelLine, color: INK,
      paddingRight: Math.round(m.freeW * 0.12), paddingVertical: pad,
    },
    freeCell: { width: m.freeW, alignItems: 'center', justifyContent: 'center' },
    passCell: { width: m.passW, alignItems: 'center', justifyContent: 'center', paddingHorizontal: m.frame },
    tail: { height: m.frame + m.lip + pad },

    valueFree: { fontFamily: 'Inter_500Medium', fontSize: m.value, color: MID, textAlign: 'center' },
    valuePass: { fontFamily: 'Inter_700Bold', fontSize: m.value + 0.5, color: INK, textAlign: 'center' },

    coinHalo: {
      width: halo, height: halo, borderRadius: halo / 2,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: SAND_LIT,
    },
    coin: {
      width: m.mark, height: m.mark, borderRadius: m.mark / 2, borderWidth: 1.5, borderColor: PATINA.shade,
      alignItems: 'center', justifyContent: 'center',
    },
    // Two bars rather than a glyph: exact at any size, where a font's checkmark is
    // a smudge. Their ends meet at the tick's lowest point.
    tickShort: {
      position: 'absolute', width: 9 * k, height: 2.6 * k, borderRadius: 1.3 * k, backgroundColor: SAND,
      transform: [{ translateX: -4.25 * k }, { translateY: 1.75 * k }, { rotate: '45deg' }],
    },
    tickLong: {
      position: 'absolute', width: 14 * k, height: 2.6 * k, borderRadius: 1.3 * k, backgroundColor: SAND,
      transform: [{ translateX: 2 * k }, { translateY: 0 }, { rotate: '-45deg' }],
    },
    noDisc: {
      width: m.mark, height: m.mark, borderRadius: m.mark / 2, backgroundColor: NO_DISC,
      alignItems: 'center', justifyContent: 'center',
    },
    crossBar: { position: 'absolute', width: 12 * k, height: 2.6 * k, borderRadius: 1.3 * k, backgroundColor: PAPER_LIT },
    crossA: { transform: [{ rotate: '45deg' }] },
    crossB: { transform: [{ rotate: '-45deg' }] },
  });
}

const st = StyleSheet.create({
  tiles: { gap: SPACE[2] },
  tileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACE[2] },
  tile: { flex: 1 },
  tileTop: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  tileFigure: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: INK, includeFontPadding: false,
  },
  tileNoun: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 14, color: MID, marginTop: 3 },
});
