import { useEffect, useMemo } from 'react';
import { track } from '@/lib/posthog';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { SafeAreaView } from 'react-native-safe-area-context';
import SketchIcon from '@/components/shared/SketchIcon';
import Button from '@/components/ui/Button';
import { GHOST } from '@/components/shared/tone';
import { BRANCH_SHORT } from '@/components/shared/branchMarks';
import { NextUp, Rule } from '@/components/paywall/PassParts';
import { useUserDataStore } from '@/stores/userDataStore';
import { C, SPACE } from '@/constants/design';
import type { Branch, Lesson, Path as Unit } from '@/data/types';

// ─────────────────────────────────────────────────────────────────────────────
// A LESSON THAT WILL NOT OPEN, AND MONEY IS NOT THE REASON.
//
// Reached by a deep link or the back stack rather than by tapping a live marker.
// It used to tell three reasons apart — a replay, a unit ahead, and a lesson not
// reached yet — and the first two were the Pass. Since the hard paywall
// (2026-09-25) every lock the Pass can open is `HardPaywall`'s, so this screen is
// only ever the third: a Pass holder further along a unit than they have read.
//
// A paywall in front of something money cannot buy is a lie, so none is shown.
// It names the lesson they should actually open, so "not yet" comes with an
// instruction.
// ─────────────────────────────────────────────────────────────────────────────

export default function LessonLocked({
  lesson,
  branch,
  unit,
  onExit,
}: {
  lesson: Lesson;
  branch: Branch;
  unit: Unit;
  onExit: () => void;
}) {
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);

  useEffect(() => {
    track('lesson_locked_viewed', {
      reason: 'unreached',
      branch_slug: branch.slug,
      lesson_id: lesson.id,
      gated_by_pro: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { nextOpen, place } = useMemo(() => {
    const done = Math.max(0, Math.min(unit.lessons.length, lessonsByUnit[unit.id] ?? 0));
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
    return { nextOpen: open, place: { position: position || 1, total } };
  }, [branch, unit, lessonsByUnit]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* The seal on the door. Struck rather than outlined, and COOL rather
            than dim — the same treatment a locked rank pin gets (§19). */}
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
        <Text style={styles.title}>Not yet</Text>
        <Text style={styles.lessonName} numberOfLines={2}>“{lesson.title}”</Text>
        <Text style={styles.body}>
          Lessons inside a unit open one at a time. This one is waiting a few lessons
          further along.
        </Text>

        {nextOpen ? (
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

        <Button label="Go back" onPress={onExit} variant="ghost" style={styles.ghost} />
      </ScrollView>
    </SafeAreaView>
  );
}

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

  ghost: { marginTop: SPACE[4] },
});
