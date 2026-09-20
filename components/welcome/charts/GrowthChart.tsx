// GrowthChart — what one lesson a day actually comes to, and the reward it ends on.
//
// The ask was a chart showing "how much smarter you get over time". This app
// cannot measure that and will not claim to, so the board plots the two things it
// CAN count: lessons finished per week at one a day, and the rank ladder climbing
// over the same eight weeks.
//
// ── THE NUMBER THAT WAS WRONG, AND HOW IT GOT THAT WAY ──────────────────────
//
// The footer read `222 lessons · 48 ranks` as a literal, under a comment noting
// that "check-thinkers already guards the sibling claim" on the thinker count. So
// the author of this board knew exactly this class of bug, guarded the count next
// to it, and typed this one in — and the library has since gone to 246. A wrong
// figure in the first forty seconds of an app about thinking clearly is the same
// fault §19 records the spoken line committing ("two hundred and twenty-three"
// against 322) and §14 records the paywall committing ("All 50 badges" against a
// roll of seventy). It is always the same cause: a number nobody re-derives.
//
// Both figures are counted out of the tree now, and `check-intro` re-counts them
// independently. There is no literal left on this board to rot.
//
// ── AND IT ENDS ON A REAL PIN ───────────────────────────────────────────────
//
// The climb used to finish at a label reading "RANK 20". The rank is an OBJECT in
// this app — struck, in one of eight materials, with its own glyph — and the Pass
// tab already ends its own pitch on "a real bronze rank crest and a real
// first-tier badge medal". Drawing a picture of a reward beside the real thing is
// the gap this whole pass is about: the intro was selling the app in a vocabulary
// the app does not use.

import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import RankSeal from '@/components/shared/RankSeal';
import { C } from '@/constants/design';
import { PATINA, ramp } from '@/components/shared/tone';
import { RANKS, rankOrder, rankDegree } from '@/data/ranks';
import { ALL_BRANCHES } from '@/data';
import { clamp01, easeOutCubic } from '@/components/welcome/ease';

/** Eight weeks at one lesson a day. The bars ARE the x-axis in human terms. */
const WEEKS = 8;
const BARS = Array.from({ length: WEEKS }, (_, i) => (i + 1) * 7);
const MAX = BARS[WEEKS - 1];

/** Counted, never typed. The two figures the footer states. */
const LESSON_TOTAL = ALL_BRANCHES.reduce(
  (n, b) => n + b.paths.reduce((m, u) => m + u.lessons.length, 0), 0,
);
const RANK_TOTAL = RANKS.length;

/**
 * Where eight weeks of one-a-day actually lands on the ladder, rather than a
 * number chosen to look encouraging. 56 lessons at a perfect 60 XP is 3,360, and
 * the pin shown is the rank that XP has genuinely conferred.
 */
const RANK_AT_8_WEEKS = (() => {
  const xp = MAX * 60;
  let i = 0;
  for (let k = 0; k < RANKS.length; k += 1) if (RANKS[k].xp <= xp) i = k;
  return i;
})();
const PIN = RANKS[RANK_AT_8_WEEKS];

const PLOT_H = 104;
// 8 bars + 7 gaps = 279 of the board's 372, which leaves the pin a 93-unit column
// on the right. At the first draft's 20/8 the plot was 216 wide and the board's
// right third was empty — the same fault this whole pass is about, moved from the
// top of the screen to the side of a board.
const BAR_W = 27;
const GAP = 9;

function Bar({ p, i, lessons }: { p: SharedValue<number>; i: number; lessons: number }) {
  // Each bar grows over its own slice of the draw, left to right, so the plot
  // builds the way it is read. Height is a TRANSFORM (scaleY) rather than a
  // height, because a height is layout and a transform is not.
  const style = useAnimatedStyle(() => {
    const a = easeOutCubic(clamp01((p.value - 0.08 - i * 0.055) / 0.34));
    return { transform: [{ scaleY: a }] };
  });
  const h = Math.round((lessons / MAX) * PLOT_H);
  return (
    <Animated.View style={[s.barBox, { height: h }, style]}>
      {/* The Meter's own construction: a flat fill with a 30% white shine along
          the top. Not the component itself — `components/ui/Meter.tsx` is
          documented as "never narrower than 1.5× its height", which is a
          HORIZONTAL bar, and these are columns. Same material, right shape. */}
      <View style={[s.barFill, { backgroundColor: PATINA.base }]} />
      <View style={s.barShine} />
    </Animated.View>
  );
}

export default function GrowthChart({ p }: { p: SharedValue<number> }) {
  const head = useAnimatedStyle(() => ({ opacity: easeOutCubic(clamp01(p.value / 0.1)) }));
  const foot = useAnimatedStyle(() => ({ opacity: easeOutCubic(clamp01((p.value - 0.62) / 0.24)) }));
  // The pin lands once the climb has been drawn, not alongside it — the reward
  // arrives BECAUSE of the bars, and a pin that fades up with them says nothing.
  const pin = useAnimatedStyle(() => {
    const a = easeOutCubic(clamp01((p.value - 0.58) / 0.3));
    return { opacity: a, transform: [{ scale: 0.82 + 0.18 * a }] };
  });

  return (
    <View style={s.board}>
      <Animated.View style={head}>
        <Text style={s.kicker}>ONE A DAY</Text>
        <Text style={s.headline}>Two months of that.</Text>
      </Animated.View>

      <View style={s.plot}>
        <View style={s.bars}>
          {BARS.map((lessons, i) => (
            <Bar key={lessons} p={p} i={i} lessons={lessons} />
          ))}
        </View>
        <Animated.View style={[s.pin, pin]}>
          <RankSeal
            glyph={PIN.glyph}
            state="current"
            size={54}
            order={rankOrder(RANK_AT_8_WEEKS)}
            degree={rankDegree(RANK_AT_8_WEEKS)}
          />
          <Text style={s.pinName}>{PIN.name.toUpperCase()}</Text>
        </Animated.View>
      </View>

      <View style={s.rule} />
      <Animated.View style={[s.footRow, foot]}>
        <Text style={s.foot}>eight weeks</Text>
        <Text style={s.foot}>{LESSON_TOTAL} lessons · {RANK_TOTAL} ranks</Text>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  board: { width: 372, height: 200 },
  kicker: {
    fontFamily: 'Inter_500Medium', fontSize: 11, letterSpacing: 2.2, color: C.dim,
  },
  headline: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: C.ink, marginTop: 1,
  },
  plot: { flexDirection: 'row', alignItems: 'flex-end', height: PLOT_H + 8, marginTop: 6 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: PLOT_H, gap: GAP },
  barBox: { width: BAR_W, borderRadius: 4, overflow: 'hidden', transformOrigin: 'bottom' },
  barFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  barShine: {
    position: 'absolute', left: 0, right: 0, top: 0, height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  pin: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 },
  pinName: {
    fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.2,
    color: ramp(PATINA.base).shade, marginTop: 2,
  },
  rule: { height: 1.2, backgroundColor: C.edge, marginTop: 4 },
  footRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  foot: { fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 14, color: C.dim },
});
