import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { SafeAreaView } from 'react-native-safe-area-context';
import SketchIcon from '@/components/shared/SketchIcon';
import Button from '@/components/ui/Button';
import { StruckTile, MetalPlate } from '@/components/profile/Struck';
import { METAL, GHOST, ramp } from '@/components/shared/tone';
import { BRANCH_SHORT } from '@/components/shared/branchMarks';
import { NextUp, Rule } from '@/components/paywall/PassParts';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import { C, SPACE, BRANCH, type BranchKey } from '@/constants/design';
import { PASS_LINES } from '@/lib/utils/passValue';
import type { Branch, Lesson, Path as Unit } from '@/data/types';

// ─────────────────────────────────────────────────────────────────────────────
// A LESSON THAT WILL NOT OPEN, AND THE THREE DIFFERENT REASONS.
//
// Reached by a deep link or the back stack rather than by tapping a live marker.
// The old screen drew one lock icon and two sentences for what are actually
// THREE distinct situations, and it got one of them plainly wrong:
//
//   · REPLAY — they have finished this lesson and want it again. `lessonAccess`
//     returns `{ open: isPro, needsPass: !isPro }` for `li < unitDone`, so this
//     is `gatedByPro` — and the old copy therefore told them to "finish the
//     previous unit to reach this one", about a lesson they had already
//     completed. Nothing was broken except the sentence, which is the kind of
//     wrongness that makes a reader distrust the rest of the screen.
//   · AHEAD — a later unit, not yet started, which the Pass may begin at once.
//   · UNREACHED — further along inside a unit they are in the middle of. Money
//     does not fix this one, so no paywall is shown. A paywall in front of
//     something money cannot buy is a lie, and the branch screen's `pickLesson`
//     already refuses to raise one here for the same reason.
//
// The third case gets the most useful thing this screen can do: it names the
// lesson they should actually open, so "not yet" comes with an instruction.
// ─────────────────────────────────────────────────────────────────────────────

type Kind = 'replay' | 'ahead' | 'unreached';

export default function LessonLocked({
  lesson,
  branch,
  unit,
  gatedByPro,
  onExit,
}: {
  lesson: Lesson;
  branch: Branch;
  unit: Unit;
  /** From `lessonAccessibility` — true when the Pass would open it. */
  gatedByPro: boolean;
  onExit: () => void;
}) {
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const openPaywall = useUIStore((s) => s.openPaywall);

  const hue = BRANCH[branch.slug as BranchKey] ?? C.ink;

  const { kind, nextOpen, place } = useMemo(() => {
    const li = unit.lessons.findIndex((l) => l.id === lesson.id);
    const done = Math.max(0, Math.min(unit.lessons.length, lessonsByUnit[unit.id] ?? 0));
    // A replay is the only `gatedByPro` case where the reader is BEHIND the
    // frontier rather than ahead of it, and it is the one the old copy missed.
    const k: Kind = !gatedByPro ? 'unreached' : li >= 0 && li < done ? 'replay' : 'ahead';

    // Where the reader actually is, for the unreached case.
    const open = done < unit.lessons.length ? unit.lessons[done] : null;

    let seen = 0;
    let position = 0;
    let total = 0;
    for (const u of branch.paths) {
      const i = open ? u.lessons.findIndex((l) => l.id === open.id) : -1;
      if (i >= 0) position = seen + i + 1;
      seen += u.lessons.length;
      total += u.lessons.length;
    }
    return { kind: k, nextOpen: open, place: { position: position || 1, total } };
  }, [branch, unit, lesson.id, lessonsByUnit, gatedByPro]);

  const copy = COPY[kind];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* The seal on the door. Struck rather than outlined, and COOL rather
            than dim — the same treatment a locked rank pin gets (§19), so
            "locked" reads as unlit against lit instead of as a rendering fault. */}
        <MotiView
          from={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'timing', duration: 380 }}
          style={styles.sealWrap}
        >
          <View style={styles.seal}>
            <SketchIcon name="lock" color={GHOST} size={30} />
          </View>
        </MotiView>

        <Text style={styles.kicker}>
          {(BRANCH_SHORT[branch.slug] ?? branch.name.toUpperCase())} · {unit.name.toUpperCase()}
        </Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.lessonName} numberOfLines={2}>“{lesson.title}”</Text>
        <Text style={styles.body}>{copy.body}</Text>

        {kind === 'unreached' && nextOpen ? (
          <>
            <Rule label="OPEN THIS ONE INSTEAD" />
            <NextUp
              branchSlug={branch.slug}
              branchName={BRANCH_SHORT[branch.slug] ?? branch.name}
              title={nextOpen.title}
              position={place.position}
              total={place.total}
              caption="Where you are in this unit"
            />
          </>
        ) : null}

        {kind !== 'unreached' ? (
          <>
            <Rule label="WHAT THE PASS OPENS" />
            {/* The two rows this reader has just walked into, and only those.
                The full five-row comparison lives on the paywall itself; here it
                would be a second sales pitch in front of the first. */}
            <View style={styles.opens}>
              {PASS_LINES.filter((l) => l.id === 'replay' || l.id === 'units').map((l) => (
                <StruckTile key={l.id} accent={hue} pad={2} style={styles.openTile}>
                  <View style={styles.openRow}>
                    <View style={[styles.openChip, { backgroundColor: ramp(hue).track, borderColor: ramp(hue).base }]}>
                      <SketchIcon
                        name={l.id === 'replay' ? 'reload' : 'grad'}
                        size={15}
                        color={ramp(hue).shade}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.openLabel, { color: ramp(hue).shade }]}>{l.label}</Text>
                      <Text style={styles.openValue}>{l.pass}</Text>
                    </View>
                    <MetalPlate metal={METAL.GOLD} label="PASS" />
                  </View>
                </StruckTile>
              ))}
            </View>
            <Button label="See the Scholar’s Pass" onPress={openPaywall} size="lg" style={styles.cta} />
          </>
        ) : null}

        <Button label="Go back" onPress={onExit} variant="ghost" style={styles.ghost} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Kept out of the component so the three readings sit side by side and can be
// compared — which is how the replay case was found to be saying the wrong thing.
const COPY: Record<Kind, { title: string; body: string }> = {
  replay: {
    title: 'You have finished this one',
    body:
      'Free keeps you moving forward, one lesson at a time. Reopening one you have '
      + 'already finished is part of the Scholar’s Pass.',
  },
  ahead: {
    title: 'This unit is a jump ahead',
    body:
      'Free opens the units in order, so this one waits until you have closed the ones '
      + 'before it. The Pass starts any unit in any branch, today.',
  },
  unreached: {
    title: 'Not yet, and not for want of paying',
    body:
      'Lessons inside a unit open one at a time, for everybody. Nothing unlocks this '
      + 'one early. It is waiting a few lessons further along.',
  },
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper },
  scroll: {
    paddingHorizontal: SPACE[4], paddingTop: SPACE[4], paddingBottom: SPACE[4],
    flexGrow: 1, justifyContent: 'center',
  },

  sealWrap: { alignItems: 'center' },
  seal: {
    width: 74, height: 74, borderRadius: 37,
    borderWidth: 2, borderColor: GHOST,
    alignItems: 'center', justifyContent: 'center',
  },

  kicker: {
    fontFamily: 'Inter_700Bold', fontSize: 9.5, letterSpacing: 1.6, color: C.inkSoft,
    textAlign: 'center', marginTop: SPACE[3],
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 25, lineHeight: 31, color: C.ink,
    textAlign: 'center', marginTop: SPACE[2],
  },
  lessonName: {
    fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20, color: C.inkSoft,
    textAlign: 'center', marginTop: SPACE[1],
  },
  body: {
    fontFamily: 'Inter_400Regular', fontSize: 14.5, lineHeight: 21, color: C.inkSoft,
    textAlign: 'center', marginTop: SPACE[3],
  },

  opens: { gap: SPACE[2], marginTop: SPACE[3] },
  openTile: {},
  openRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE[2] },
  openChip: {
    width: 30, height: 30, borderRadius: 7, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  // Colour comes from the branch at the call site: inkSoft measures 3.07:1 in a
  // struck tile's shaded corner, and the hue's own shade clears the floor.
  openLabel: { fontFamily: 'Inter_700Bold', fontSize: 10.5, letterSpacing: 1 },
  openValue: { fontFamily: 'Inter_500Medium', fontSize: 13.5, color: C.ink, marginTop: 2 },

  cta: { marginTop: SPACE[4] },
  ghost: { marginTop: SPACE[1] },
});
