import { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import StreakCalendar from './StreakCalendar';
import StreakFlame from './StreakFlame';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { restDaysHeld, restEarnEvery, EMBER, ASH, nextMilestone } from '@/constants/streak';
import { effectiveStreak, streakIsAlive } from '@/lib/utils/streak';

const INK = '#1A1A1A';
const INK_SOFT = '#6B6B6B';
const PAPER = '#FAFAF7';
const FAINT = '#E4E1D8';

// ─────────────────────────────────────────────────────────────────────────────
// THE STREAK SHEET — the calendar, and the three numbers around it.
//
// Same bottom-sheet pattern as the saved-quotes and ranks sheets, because a
// reader already knows how those behave and a streak is not the place to teach a
// new gesture.
//
// ── THE STREAK SHOWN IS THE EFFECTIVE ONE, NOT THE STORED ONE ───────────────
//
// `streak` in the store only moves when a lesson is finished, so after a missed
// day it sits at its old value until something writes to it. `effectiveStreak`
// derives the honest number — 0 once it has lapsed — without mutating anything,
// which matters because the stored value is max-merged by cloud sync and must
// not be "corrected" downward by a device that happens to open first.
//
// So a lapsed reader opens this sheet to a cold flame, an ash number and a
// calendar whose bar stops where they stopped. That is the truth, and the truth
// is what makes coming back mean something.
// ─────────────────────────────────────────────────────────────────────────────

function dateStr(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function StreakSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { height } = useWindowDimensions();
  const H = Math.min(Math.round(height * 0.86), 720);
  const [mounted, setMounted] = useState(false);

  const streak = useUserDataStore((s) => s.streak);
  const lastLessonDate = useUserDataStore((s) => s.lastLessonDate);
  const activeDays = useUserDataStore((s) => s.activeDays);
  const restDays = useUserDataStore((s) => s.restDays);
  const joinedAt = useUserDataStore((s) => s.joinedAt);
  const earned = useUserDataStore((s) => s.restDaysEarned);
  const used = useUserDataStore((s) => s.restDaysUsed);
  const isPro = useSubscriptionStore((s) => s.isPro);

  useEffect(() => { if (visible) setMounted(true); }, [visible]);

  const held = restDaysHeld(earned, used);
  const alive = streakIsAlive(lastLessonDate, held);
  const shown = effectiveStreak(streak, lastLessonDate, held);
  const today = dateStr(new Date());
  const since = joinedAt ? dateStr(new Date(joinedAt)) : null;
  const next = nextMilestone(shown);

  // The longest run in the recorded history. Cheap to derive and worth showing:
  // it is the number a reader is trying to beat once the current one is gone.
  const best = useMemo(() => {
    const days = Array.from(new Set([...activeDays, ...restDays])).sort();
    let run = 0, top = 0, prev: Date | null = null;
    for (const k of days) {
      const [y, m, d] = k.split('-').map(Number);
      const cur = new Date(y, m - 1, d);
      run = prev && Math.round((cur.getTime() - prev.getTime()) / 86_400_000) === 1 ? run + 1 : 1;
      if (run > top) top = run;
      prev = cur;
    }
    return Math.max(top, shown);
  }, [activeDays, restDays, shown]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <MotiView
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ type: 'timing', duration: 240 }}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </MotiView>

      <AnimatePresence onExitComplete={() => setMounted(false)}>
        {visible && (
          <MotiView
            key="sheet"
            from={{ translateY: H }}
            animate={{ translateY: 0 }}
            exit={{ translateY: H }}
            transition={{ type: 'timing', duration: 340 }}
            style={[styles.sheet, { maxHeight: H }]}
          >
            <View style={styles.handle} />
            <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
              <View style={styles.flameRow}>
                <StreakFlame count={shown} alive={alive} size={42} />
              </View>
              <Text style={styles.dayWord}>
                {alive ? `DAY${shown === 1 ? '' : 'S'} RUNNING` : 'STREAK LAPSED'}
              </Text>

              {alive && next ? (
                <Text style={styles.toGo}>
                  {next - shown} {next - shown === 1 ? 'day' : 'days'} to {next}
                </Text>
              ) : !alive ? (
                <Text style={styles.toGo}>Finish one lesson today and it begins again.</Text>
              ) : null}

              <View style={styles.stats}>
                <Stat label="BEST RUN" value={String(best)} />
                <Stat label="REST DAYS" value={`${held}`} sub={`1 per ${restEarnEvery(isPro)}`} />
                <Stat label="TOTAL DAYS" value={String(new Set(activeDays).size)} />
              </View>

              <View style={styles.rule} />

              <StreakCalendar
                activeDays={activeDays}
                restDays={restDays}
                today={today}
                since={since}
              />

              <View style={styles.legend}>
                <Key colour={EMBER} label="Studied" />
                <Key colour="#F0DCCB" label="Rest day" />
                <Key outline label="Missed" />
              </View>
            </ScrollView>

            <Pressable onPress={onClose} style={styles.done} hitSlop={8}>
              <Text style={styles.doneText}>DONE</Text>
            </Pressable>
          </MotiView>
        )}
      </AnimatePresence>
    </Modal>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

function Key({ colour, outline, label }: { colour?: string; outline?: boolean; label: string }) {
  return (
    <View style={styles.keyRow}>
      <View style={[styles.keyDot, outline ? styles.keyOutline : { backgroundColor: colour }]} />
      <Text style={styles.keyLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,19,17,0.42)' },
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: PAPER,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    borderWidth: 1.5, borderColor: INK, borderBottomWidth: 0,
  },
  handle: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: FAINT, marginTop: 10 },
  inner: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 12 },

  flameRow: { alignItems: 'center' },
  dayWord: { fontFamily: 'Inter_700Bold', fontSize: 10, color: INK_SOFT, letterSpacing: 3, textAlign: 'center', marginTop: 4 },
  toGo: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13.5,
    color: INK_SOFT, textAlign: 'center', marginTop: 10,
  },

  stats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 22, color: INK },
  statLabel: { fontFamily: 'Inter_700Bold', fontSize: 8.5, color: INK_SOFT, letterSpacing: 1.6, marginTop: 3 },
  statSub: { fontFamily: 'Inter_500Medium', fontSize: 8.5, color: INK_SOFT, marginTop: 2, opacity: 0.75 },

  rule: { height: 1, backgroundColor: FAINT, marginVertical: 20 },

  legend: { flexDirection: 'row', justifyContent: 'center', marginTop: 18, gap: 18 },
  keyRow: { flexDirection: 'row', alignItems: 'center' },
  keyDot: { width: 11, height: 11, borderRadius: 6, marginRight: 6 },
  keyOutline: { borderWidth: 1, borderColor: FAINT },
  keyLabel: { fontFamily: 'Inter_500Medium', fontSize: 10.5, color: INK_SOFT },

  done: {
    borderTopWidth: 1, borderTopColor: FAINT,
    paddingVertical: 15, alignItems: 'center',
  },
  doneText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: INK, letterSpacing: 2 },
});
