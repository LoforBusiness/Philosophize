import { View, Text, StyleSheet } from 'react-native';
import SketchIcon from '@/components/shared/SketchIcon';
import { StruckTile } from '@/components/profile/Struck';
import { ramp } from '@/components/shared/tone';
import { C, SPACE, BRANCH, type BranchKey } from '@/constants/design';

// ─────────────────────────────────────────────────────────────────────────────
// TWO SMALL PARTS, and all that is left of the old paywall family's kit.
//
// This file used to hold the pieces three screens were built from: the offer,
// the daily limit and the locked lesson — a reader's standing, the library bar,
// the wall in days at the free pace, and a five-row comparison. The hard paywall
// (2026-09-25) retired all of that: there is no free pace to measure a wall in,
// and the one paywall (`HardPaywall`) is the Pass tab's own chart and door.
//
// What remains is used by `LessonLocked` for the one lock money cannot open: a
// lesson further along a unit than the reader has reached.
//
// NO COLOUR IS DECLARED IN THIS FILE. `check:pass` fails the build on a stray hex.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * THE LESSON THEY SHOULD OPEN INSTEAD, named.
 *
 * The tile takes the branch's own hue as its top edge, so the reader knows which
 * shelf it is off before reading the label.
 */
export function NextUp({
  branchSlug, branchName, title, position, total, caption,
}: {
  branchSlug: string;
  branchName: string;
  title: string;
  /** 1-based position in the branch, for "LESSON 15 OF 37". */
  position: number;
  total: number;
  caption: string;
}) {
  const hue = BRANCH[branchSlug as BranchKey] ?? C.ink;
  const r = ramp(hue);
  return (
    <StruckTile accent={hue} pad={3} style={s.nextTile}>
      <Text style={[s.nextKicker, { color: r.shade }]}>
        {branchName.toUpperCase()} · {position} OF {total}
      </Text>
      <Text style={s.nextTitle} numberOfLines={2}>{title}</Text>
      <View style={s.nextFoot}>
        <SketchIcon name="clock" size={13} color={C.ink} />
        <Text style={s.nextCaption}>{caption}</Text>
      </View>
    </StruckTile>
  );
}

/** A section heading between two hairlines. */
export function Rule({ label }: { label: string }) {
  return (
    <View style={s.ruleRow}>
      <View style={s.ruleLine} />
      <Text style={s.ruleLabel}>{label}</Text>
      <View style={s.ruleLine} />
    </View>
  );
}

const s = StyleSheet.create({
  nextTile: { marginTop: SPACE[2] },
  nextKicker: { fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.3 },
  nextTitle: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, lineHeight: 24, color: C.ink, marginTop: 4,
  },
  nextFoot: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACE[1] },
  nextCaption: { fontFamily: 'Inter_500Medium', fontSize: 12, color: C.ink },

  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE[2], marginTop: SPACE[4] },
  ruleLine: { flex: 1, height: 1, backgroundColor: C.hairline },
  ruleLabel: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.8, color: C.inkSoft,
  },
});
