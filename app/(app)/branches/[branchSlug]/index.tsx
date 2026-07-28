import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { getBranchBySlug } from '@/data';
import type { Path as Unit, Lesson } from '@/data/types';
import Glyph, { type GlyphName } from '@/components/shared/Glyph';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';

const Page = '#F1EEE7';
const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Faint = '#9A968C';
const Cream = '#F4F1EA';
const Gold = '#A8A49A';
const LockGray = '#B7B3A9';
const FaintLine = '#D8D4CB';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

interface BranchPres {
  desc: string;
  glyph: GlyphName;
  pills: string[];
}
const PRES: Record<string, BranchPres> = {
  metaphysics: { desc: 'Reality, existence & the nature of being', glyph: 'infinity', pills: ['REALITY', 'EXISTENCE', 'BEING'] },
  epistemology: { desc: 'Knowledge, belief, truth & justification', glyph: 'eye', pills: ['KNOWLEDGE', 'TRUTH', 'BELIEF'] },
  logic: { desc: 'Reasoning, arguments & valid thinking', glyph: 'dottarget', pills: ['REASONING', 'ARGUMENTS', 'INFERENCE'] },
  ethics: { desc: 'Morality, right action & how humans should live', glyph: 'scales', pills: ['MORALITY', 'VIRTUE', 'JUSTICE'] },
  aesthetics: { desc: 'Beauty, art, creativity & aesthetic experience', glyph: 'gem', pills: ['BEAUTY', 'ART', 'TASTE'] },
  'political-philosophy': { desc: 'Society, power, justice & political systems', glyph: 'flag', pills: ['SOCIETY', 'POWER', 'JUSTICE'] },
};
const ORDER = ['metaphysics', 'epistemology', 'logic', 'ethics', 'aesthetics', 'political-philosophy'];

type LessonState = 'done' | 'current' | 'locked';

interface LessonModel {
  lesson: Lesson;
  li: number;
  state: LessonState;
  // This is a unit's NEXT lesson, locked only because a free user hasn't
  // finished the earlier units — tapping it offers the Pass (which lets paid
  // users drop into any unit) rather than doing nothing.
  gatedByPro: boolean;
}

interface UnitModel {
  unit: Unit;
  index: number;
  done: number;
  total: number;
  /** 'done' finished · 'current' the unit to work in now · 'open' startable but not next · 'locked' */
  state: 'done' | 'current' | 'open' | 'locked';
  lessons: LessonModel[];
}

export default function BranchDetailScreen() {
  const { branchSlug } = useLocalSearchParams<{ branchSlug: string }>();
  const branch = getBranchBySlug(branchSlug);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const openPaywall = useUIStore((s) => s.openPaywall);

  // Which unit the user has explicitly opened. null = follow their progress.
  const [pinned, setPinned] = useState<string | null>(null);
  const scroller = useRef<ScrollView | null>(null);
  // The unit a tap asked us to bring into view. The scroll can't be done from the
  // tap handler: opening a unit also collapses whichever was open, and if that one
  // sat ABOVE this one every recorded y is stale by hundreds of pixels (reading it
  // a beat later landed on the BOTTOM of the unit). So we wait for this unit's own
  // onLayout — the first y that reflects the finished accordion — and scroll then.
  const pendingScroll = useRef<string | null>(null);
  const listY = useRef(0);

  // Progress is per-unit: each unit tracks its own completed count, and whether
  // its NEXT lesson is startable depends on the plan — free users must finish
  // the earlier units first (strictly sequential), while paid users can start
  // any unit at will. Within a unit, everyone is sequential.
  const allUnits = branch?.paths ?? [];
  const units: UnitModel[] = [];
  let allPrevComplete = true;
  let firstIncomplete = '';
  for (let index = 0; index < allUnits.length; index++) {
    const unit = allUnits[index];
    const total = unit.lessons.length;
    const done = Math.max(0, Math.min(total, lessonsByUnit[unit.id] ?? 0));
    const startable = isPro || index === 0 || allPrevComplete;
    const complete = done >= total;
    const isFirstIncomplete = !complete && firstIncomplete === '';
    if (isFirstIncomplete) firstIncomplete = unit.id;

    const lessons: LessonModel[] = unit.lessons.map((lesson, li) => {
      let state: LessonState = 'locked';
      let gatedByPro = false;
      if (li < done) {
        state = 'done'; // completed — anyone can revisit
      } else if (li === done) {
        if (startable) state = 'current';
        else gatedByPro = true; // locked only by the free sequential rule
      }
      return { lesson, li, state, gatedByPro };
    });

    units.push({
      unit,
      index,
      done,
      total,
      state: complete ? 'done' : !startable ? 'locked' : isFirstIncomplete ? 'current' : 'open',
      lessons,
    });
    allPrevComplete = allPrevComplete && complete;
  }

  // Default: the unit they're working in is the one that's open. A pinned unit
  // wins — until they cross a unit boundary, at which point the accordion goes
  // back to following progress so the next unit is already open on return.
  const openId = pinned ?? firstIncomplete;
  useEffect(() => {
    setPinned(null);
  }, [firstIncomplete]);

  const toggleUnit = useCallback(
    (id: string) => {
      setPinned((prev) => {
        const currentlyOpen = prev ?? firstIncomplete;
        return currentlyOpen === id ? '' : id; // '' = everything closed
      });
      pendingScroll.current = id;
    },
    [firstIncomplete]
  );

  /** Called on every unit's layout; scrolls only the one a tap is waiting on. */
  const handleUnitLayout = useCallback((id: string, y: number) => {
    if (pendingScroll.current !== id) return;
    pendingScroll.current = null;
    scroller.current?.scrollTo({ y: Math.max(0, listY.current + y - 10), animated: true });
  }, []);

  if (!branch) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.notFound}>Branch not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pres = PRES[branch.slug] ?? { desc: branch.description, glyph: 'book' as GlyphName, pills: [] };
  const roman = ROMAN[Math.max(0, ORDER.indexOf(branch.slug))];

  const openLesson = (unit: Unit, lesson: Lesson) =>
    router.push(`/(app)/branches/${branch.slug}/${unit.slug}/lesson/${lesson.id}`);

  return (
    <ScreenTransition bg={Page}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backRow}>
            <SketchIcon name="back" size={18} color={InkSoft} />
            <Text style={styles.brand}>{branch.name.toUpperCase()}</Text>
          </Pressable>
          <Text style={styles.dots}>◆ ◆ ◆</Text>
        </View>

        <ScrollView ref={scroller} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Dark masthead */}
          <View style={styles.masthead}>
            <Text style={styles.mastKicker}>BRANCH {roman}</Text>
            <Text style={styles.mastTitle}>{branch.name.toUpperCase()}</Text>
            <Text style={styles.mastSub}>{pres.desc}</Text>
            {pres.pills.length > 0 && (
              <View style={styles.pillRow}>
                {pres.pills.map((p) => (
                  <View key={p} style={styles.pill}>
                    <Text style={styles.pillText}>{p}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* One unit open at a time. The rest sit as compact bars, so a 29-lesson
              branch reads as five lines plus the one road you're actually on. */}
          <View
            style={styles.unitList}
            onLayout={(e) => {
              listY.current = e.nativeEvent.layout.y;
            }}
          >
            {units.map((u) => (
              <View
                key={u.unit.id}
                onLayout={(e) => handleUnitLayout(u.unit.id, e.nativeEvent.layout.y)}
              >
                {openId === u.unit.id ? (
                  <OpenUnit
                    model={u}
                    glyph={pres.glyph}
                    onToggle={() => toggleUnit(u.unit.id)}
                    onOpenLesson={(lesson) => openLesson(u.unit, lesson)}
                    onLockedPress={openPaywall}
                  />
                ) : (
                  <UnitBar model={u} onPress={() => toggleUnit(u.unit.id)} />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenTransition>
  );
}

/* ---------------- Unit chrome ---------------- */

function Chevron({ open }: { open: boolean }) {
  return (
    <View style={{ transform: [{ rotate: open ? '0deg' : '-90deg' }] }}>
      <SketchIcon name="chevron-down" size={16} color={Faint} />
    </View>
  );
}

/** The state mark that leads a collapsed unit bar. */
function UnitMark({ state }: { state: UnitModel['state'] }) {
  if (state === 'done') {
    return (
      <View style={styles.markDone}>
        <SketchIcon name="check" size={12} color={Paper} />
      </View>
    );
  }
  if (state === 'locked') {
    return (
      <View style={styles.markLocked}>
        <SketchIcon name="lock" size={13} color={LockGray} />
      </View>
    );
  }
  if (state === 'current') {
    return (
      <View style={styles.markCurrent}>
        <View style={styles.markCurrentPip} />
      </View>
    );
  }
  return <View style={styles.markOpen} />;
}

/** A collapsed unit: one tight line — mark, number, name, count, chevron. */
function UnitBar({ model, onPress }: { model: UnitModel; onPress: () => void }) {
  const dim = model.state === 'locked';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.bar, dim && styles.barDim, pressed && { opacity: 0.62 }]}
    >
      <UnitMark state={model.state} />
      <View style={styles.barText}>
        <Text style={[styles.barKicker, dim && { color: LockGray }]}>UNIT {model.index + 1}</Text>
        <Text style={[styles.barName, dim && { color: LockGray }]} numberOfLines={2}>
          {model.unit.name}
        </Text>
      </View>
      <Text style={[styles.barCount, dim && { color: LockGray }]}>
        {model.done}/{model.total}
      </Text>
      <Chevron open={false} />
    </Pressable>
  );
}

/** The open unit: full card — glyph, name, description — above its timeline. */
function OpenUnit({
  model,
  glyph,
  onToggle,
  onOpenLesson,
  onLockedPress,
}: {
  model: UnitModel;
  glyph: GlyphName;
  onToggle: () => void;
  onOpenLesson: (lesson: Lesson) => void;
  onLockedPress: () => void;
}) {
  return (
    <View style={styles.openCard}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.openHead, pressed && { opacity: 0.7 }]}>
        <View style={styles.unitIcon}>
          <Glyph name={glyph} size={22} color={Ink} />
        </View>
        <View style={styles.openHeadText}>
          <Text style={styles.unitKicker}>UNIT {model.index + 1}</Text>
          <Text style={styles.unitName}>{model.unit.name}</Text>
        </View>
        <Chevron open />
      </Pressable>

      <Text style={styles.unitDesc}>{model.unit.description}</Text>

      <View style={styles.metaRow}>
        {model.state === 'locked' ? (
          <>
            <SketchIcon name="lock" size={12} color={LockGray} />
            <Text style={styles.metaLocked}>
              Finish Unit {model.index} — or open this one now with Scholar’s Pass
            </Text>
          </>
        ) : (
          <Text style={styles.metaCount}>
            {model.done} of {model.total} complete
          </Text>
        )}
      </View>

      <Animated.View entering={FadeIn.duration(200)} style={styles.timeline}>
        {model.lessons.map((L, i) => (
          <LessonNode
            key={L.lesson.id}
            model={L}
            first={i === 0}
            /* the line INTO this node is inked once the one before it is done */
            reached={i > 0 && model.lessons[i - 1].state === 'done'}
            onPress={() => onOpenLesson(L.lesson)}
            onLockedPress={onLockedPress}
          />
        ))}
      </Animated.View>
    </View>
  );
}

/* ---------------- The timeline ---------------- */

/** One stop on the road: the dot, the lesson name beneath it, and the line down
 *  to the next. The lesson you're up to is the one that opens out — it gets its
 *  description and the button; everything else stays a name. */
function LessonNode({
  model,
  first,
  reached,
  onPress,
  onLockedPress,
}: {
  model: LessonModel;
  first: boolean;
  reached: boolean;
  onPress: () => void;
  onLockedPress: () => void;
}) {
  const { lesson, state, gatedByPro } = model;
  const locked = state === 'locked';
  // A pro-gated next lesson is tappable (offers the Pass); other locked lessons
  // (mid-unit, not yet reached) stay inert.
  const pressable = !locked || gatedByPro;
  const handlePress = locked ? (gatedByPro ? onLockedPress : undefined) : onPress;
  // The gated node is a unit's next lesson, so it earns the same expanded
  // treatment as a real current lesson — just with the Pass behind it.
  const expanded = state === 'current' || gatedByPro;

  return (
    <View style={styles.nodeBlock}>
      {!first && <View style={[styles.conn, reached ? styles.connInk : styles.connFaint]} />}
      <Pressable
        onPress={handlePress}
        disabled={!pressable}
        hitSlop={6}
        style={({ pressed }) => [styles.nodeTap, pressed && pressable && { opacity: 0.6 }]}
      >
        <LessonDot state={state} gatedByPro={gatedByPro} />
        <Text
          style={[
            styles.nodeTitle,
            expanded && styles.nodeTitleCurrent,
            locked && !gatedByPro && { color: LockGray },
          ]}
          numberOfLines={2}
        >
          {lesson.title}
        </Text>

        {expanded && (
          <>
            <Text style={styles.nodeDesc} numberOfLines={2}>
              {gatedByPro ? 'Locked until the earlier units are done' : lesson.description}
            </Text>
            <View style={[styles.startBtn, gatedByPro && styles.unlockBtn]}>
              <Text style={[styles.startText, gatedByPro && { color: Paper }]}>
                {gatedByPro ? 'UNLOCK' : '▶ START'}
              </Text>
            </View>
          </>
        )}
      </Pressable>
    </View>
  );
}

function LessonDot({ state, gatedByPro }: { state: LessonState; gatedByPro: boolean }) {
  if (state === 'done') {
    return (
      <View style={styles.dotDone}>
        <SketchIcon name="check" size={11} color={Paper} />
      </View>
    );
  }
  if (state === 'current') {
    return (
      <View style={styles.dotCurrent}>
        <View style={styles.dotCurrentPip} />
      </View>
    );
  }
  if (gatedByPro) {
    return (
      <View style={styles.dotGated}>
        <SketchIcon name="lock" size={12} color={LockGray} />
      </View>
    );
  }
  return <View style={styles.dotLocked} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Page },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontFamily: 'Inter_400Regular', fontSize: 16, color: Ink },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft, letterSpacing: 2 },
  dots: { fontSize: 9, color: '#C9C5BB', letterSpacing: 2 },

  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  // Masthead
  masthead: { backgroundColor: Ink, borderRadius: 6, paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' },
  mastKicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: Gold, letterSpacing: 4 },
  mastTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: Cream, letterSpacing: 1, marginTop: 8, textAlign: 'center' },
  mastSub: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: '#A8A49A', marginTop: 8, textAlign: 'center' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 18 },
  pill: { borderWidth: 1, borderColor: '#4A463D', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontFamily: 'Inter_500Medium', fontSize: 9, color: '#CFCABF', letterSpacing: 1.5 },

  unitList: { marginTop: 20, gap: 10 },

  // Collapsed unit bar
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 5,
    backgroundColor: Paper,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  barDim: { borderColor: '#DCD8CF', backgroundColor: '#FBFAF7' },
  barText: { flex: 1, minWidth: 0 },
  barKicker: { fontFamily: 'Inter_700Bold', fontSize: 8.5, color: Faint, letterSpacing: 1.5 },
  barName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: Ink, marginTop: 2, lineHeight: 21 },
  barCount: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft, letterSpacing: 0.5 },

  markDone: { width: 22, height: 22, borderRadius: 11, backgroundColor: Ink, alignItems: 'center', justifyContent: 'center' },
  markLocked: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  markCurrent: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: Ink,
    alignItems: 'center', justifyContent: 'center',
  },
  markCurrentPip: { width: 8, height: 8, borderRadius: 4, backgroundColor: Ink },
  markOpen: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.8, borderColor: Faint },

  // Open unit card
  openCard: { borderWidth: 1.5, borderColor: Ink, borderRadius: 5, backgroundColor: Paper, padding: 15 },
  openHead: { flexDirection: 'row', alignItems: 'center' },
  openHeadText: { flex: 1, minWidth: 0, marginLeft: 12, marginRight: 8 },
  unitIcon: { width: 42, height: 42, borderWidth: 1.5, borderColor: Ink, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  unitKicker: { fontFamily: 'Inter_700Bold', fontSize: 9, color: InkSoft, letterSpacing: 1.5 },
  unitName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: Ink, marginTop: 2 },
  unitDesc: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12.5, color: InkSoft, marginTop: 10, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12 },
  metaCount: { fontFamily: 'Inter_500Medium', fontSize: 9.5, color: Faint, letterSpacing: 1.2 },
  metaLocked: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 9.5, color: LockGray, letterSpacing: 0.6, lineHeight: 14 },

  // Timeline
  timeline: { alignItems: 'center', marginTop: 20, paddingBottom: 4 },
  nodeBlock: { alignItems: 'center', alignSelf: 'stretch' },
  conn: { width: 2, height: 26, borderRadius: 1 },
  connInk: { backgroundColor: Ink },
  connFaint: { backgroundColor: FaintLine },
  // paddingBottom is what keeps the line from starting flush against the last
  // line of the title — without it the two touch and the road looks like it is
  // struck through the words.
  nodeTap: { alignItems: 'center', alignSelf: 'stretch', paddingHorizontal: 8, paddingBottom: 11 },

  dotDone: { width: 21, height: 21, borderRadius: 10.5, backgroundColor: Ink, alignItems: 'center', justifyContent: 'center' },
  dotCurrent: {
    width: 27, height: 27, borderRadius: 13.5, borderWidth: 2.5, borderColor: Ink,
    backgroundColor: Paper, alignItems: 'center', justifyContent: 'center',
  },
  dotCurrentPip: { width: 11, height: 11, borderRadius: 5.5, backgroundColor: Ink },
  dotGated: {
    width: 25, height: 25, borderRadius: 12.5, borderWidth: 1.8, borderColor: LockGray,
    backgroundColor: Paper, alignItems: 'center', justifyContent: 'center',
  },
  dotLocked: { width: 15, height: 15, borderRadius: 7.5, borderWidth: 1.8, borderColor: LockGray, backgroundColor: Paper },

  nodeTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: Ink,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
    maxWidth: 250,
  },
  nodeTitleCurrent: { fontSize: 17.5, lineHeight: 23 },
  nodeDesc: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 12.5,
    color: InkSoft,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 260,
  },
  startBtn: {
    borderWidth: 1.5, borderColor: Ink, borderRadius: 4,
    paddingHorizontal: 18, paddingVertical: 8, backgroundColor: Paper, marginTop: 12,
  },
  unlockBtn: { backgroundColor: Ink, borderColor: Ink },
  startText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Ink, letterSpacing: 0.8 },
});
