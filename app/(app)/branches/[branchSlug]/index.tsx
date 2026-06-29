import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBranchBySlug } from '@/data';
import type { Path as Unit, Lesson } from '@/data/types';
import Glyph, { type GlyphName } from '@/components/shared/Glyph';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { useUserDataStore } from '@/stores/userDataStore';

const Page = '#F1EEE7';
const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Faint = '#9A968C';
const Rule = '#E4E1D9';
const Cream = '#F4F1EA';
const Gold = '#A8A49A';
const LockGray = '#B7B3A9';

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
type Item =
  | { kind: 'unit'; ui: number; unit: Unit; doneInUnit: number }
  | { kind: 'lesson'; unit: Unit; lesson: Lesson; li: number; state: LessonState };

export default function BranchDetailScreen() {
  const { branchSlug } = useLocalSearchParams<{ branchSlug: string }>();
  const branch = getBranchBySlug(branchSlug);
  const lessonsByBranch = useUserDataStore((s) => s.lessonsByBranch);

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

  const flat = branch.paths.flatMap((u) => u.lessons.map((l) => ({ unit: u, lesson: l })));
  const total = flat.length;
  const done = Math.min(lessonsByBranch[branch.slug] ?? 0, total);

  // Build a single ordered list of items (unit markers + lessons) so the spine
  // runs as ONE continuous path through every unit.
  const items: Item[] = [];
  let g = 0;
  branch.paths.forEach((unit, ui) => {
    const unitStart = g;
    const doneInUnit = Math.max(0, Math.min(unit.lessons.length, done - unitStart));
    items.push({ kind: 'unit', ui, unit, doneInUnit });
    unit.lessons.forEach((lesson, li) => {
      const state: LessonState = li < doneInUnit ? 'done' : li === doneInUnit ? 'current' : 'locked';
      items.push({ kind: 'lesson', unit, lesson, li, state });
      g++;
    });
  });

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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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

        {/* One continuous path: unit markers + lessons */}
        <View style={styles.pathWrap}>
          {items.map((item, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === items.length - 1;
            return (
              <View key={item.kind === 'unit' ? `u${item.ui}` : item.lesson.id} style={styles.row}>
                {/* Left rail with the continuous spine */}
                <View style={styles.rail}>
                  <View
                    style={[
                      styles.spine,
                      isFirst && { top: NODE_CENTER, bottom: 0 },
                      isLast && { top: 0, height: NODE_CENTER },
                      items.length === 1 && { top: NODE_CENTER, height: 0 },
                    ]}
                  />
                  {item.kind === 'unit' ? (
                    <View style={styles.unitNode} />
                  ) : (
                    <LessonNode state={item.state} />
                  )}
                </View>

                {/* Right content */}
                {item.kind === 'unit' ? (
                  <UnitHeader unit={item.unit} index={item.ui} done={item.doneInUnit} glyph={pres.glyph} />
                ) : (
                  <LessonRow
                    lesson={item.lesson}
                    state={item.state}
                    onPress={() => openLesson(item.unit, item.lesson)}
                  />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
    </ScreenTransition>
  );
}

/* ---------------- Pieces ---------------- */

const NODE_SIZE = 16;
const NODE_TOP = 5;
const NODE_CENTER = NODE_TOP + NODE_SIZE / 2;

function LessonNode({ state }: { state: LessonState }) {
  if (state === 'locked') {
    return <View style={[styles.node, styles.nodeLocked]} />;
  }
  if (state === 'done') {
    return <View style={[styles.node, styles.nodeDone]} />;
  }
  // current — target dot
  return (
    <View style={[styles.node, styles.nodeDone, { alignItems: 'center', justifyContent: 'center' }]}>
      <View style={styles.nodeRing} />
    </View>
  );
}

function UnitHeader({ unit, index, done, glyph }: { unit: Unit; index: number; done: number; glyph: GlyphName }) {
  const k = unit.lessons.length;
  const pct = k > 0 ? done / k : 0;
  return (
    <View style={styles.unitCard}>
      <View style={styles.unitTop}>
        <View style={styles.unitIcon}>
          <Glyph name={glyph} size={22} color={Ink} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.unitKicker}>
            UNIT {index + 1} · {k} LESSON{k !== 1 ? 'S' : ''}
          </Text>
          <Text style={styles.unitName}>{unit.name}</Text>
        </View>
      </View>
      <Text style={styles.unitDesc}>{unit.description}</Text>
      <View style={styles.progRow}>
        <View style={styles.progTrack}>
          <View style={[styles.progFill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
        <Text style={styles.progText}>
          {done} / {k}
        </Text>
      </View>
    </View>
  );
}

function LessonRow({ lesson, state, onPress }: { lesson: Lesson; state: LessonState; onPress: () => void }) {
  const locked = state === 'locked';
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      disabled={locked}
      style={({ pressed }) => [styles.lessonRow, pressed && !locked && { opacity: 0.6 }]}
    >
      <View style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
        <Text style={[styles.lessonTitle, locked && { color: LockGray }]} numberOfLines={2}>
          {lesson.title}
        </Text>
        <Text style={[styles.lessonSub, locked && { color: '#C4C0B6' }]} numberOfLines={1}>
          {lesson.description}
        </Text>
      </View>
      {state === 'current' && (
        <View style={styles.startBtn}>
          <Text style={styles.startText}>▶ START</Text>
        </View>
      )}
      {state === 'locked' && <SketchIcon name="lock" size={16} color={LockGray} />}
      {state === 'done' && (
        <View style={styles.doneBadge}>
          <Text style={styles.doneCheck}>✓</Text>
        </View>
      )}
    </Pressable>
  );
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

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  // Masthead
  masthead: { backgroundColor: Ink, borderRadius: 6, paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' },
  mastKicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: Gold, letterSpacing: 4 },
  mastTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: Cream, letterSpacing: 1, marginTop: 8, textAlign: 'center' },
  mastSub: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: '#A8A49A', marginTop: 8, textAlign: 'center' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 18 },
  pill: { borderWidth: 1, borderColor: '#4A463D', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontFamily: 'Inter_500Medium', fontSize: 9, color: '#CFCABF', letterSpacing: 1.5 },

  // Open-entry note
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 5,
    backgroundColor: Paper,
    padding: 16,
    marginTop: 16,
  },
  noteDiamond: { fontSize: 13, color: Ink, marginTop: 1 },
  noteTitle: { fontFamily: 'Inter_700Bold', fontSize: 10.5, color: Ink, letterSpacing: 1.5 },
  noteBody: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: InkSoft, marginTop: 5, lineHeight: 19 },

  // Path
  pathWrap: { marginTop: 22 },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  rail: { width: 44, position: 'relative' },
  spine: { position: 'absolute', left: 21, top: 0, bottom: 0, width: 2, backgroundColor: Ink },
  node: { position: 'absolute', left: 14, top: NODE_TOP, width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2 },
  nodeDone: { backgroundColor: Ink, borderWidth: 2, borderColor: Ink },
  nodeLocked: { backgroundColor: Paper, borderWidth: 2, borderColor: LockGray, width: 14, height: 14, borderRadius: 7, left: 15, top: NODE_TOP + 1 },
  nodeRing: { width: 6, height: 6, borderRadius: 3, backgroundColor: Paper },
  unitNode: { position: 'absolute', left: 15, top: NODE_TOP, width: 14, height: 14, borderRadius: 3, backgroundColor: Ink, transform: [{ rotate: '45deg' }] },

  // Unit card
  unitCard: { flex: 1, borderWidth: 1.5, borderColor: Ink, borderRadius: 5, backgroundColor: Paper, padding: 15, marginBottom: 18 },
  unitTop: { flexDirection: 'row', alignItems: 'center' },
  unitIcon: { width: 42, height: 42, borderWidth: 1.5, borderColor: Ink, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  unitKicker: { fontFamily: 'Inter_700Bold', fontSize: 9, color: InkSoft, letterSpacing: 1.5 },
  unitName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19, color: Ink, marginTop: 2 },
  unitDesc: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12.5, color: InkSoft, marginTop: 10, lineHeight: 18 },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  progTrack: { flex: 1, height: 5, borderRadius: 3, backgroundColor: Rule, overflow: 'hidden' },
  progFill: { height: 5, borderRadius: 3, backgroundColor: Ink },
  progText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft },

  // Lesson row
  lessonRow: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingBottom: 22, paddingTop: 0, minHeight: 44 },
  lessonTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: Ink, lineHeight: 21 },
  lessonSub: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 12, color: InkSoft, marginTop: 2 },
  startBtn: { borderWidth: 1.5, borderColor: Ink, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Paper },
  startText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Ink, letterSpacing: 0.5 },
  doneBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: Ink, alignItems: 'center', justifyContent: 'center' },
  doneCheck: { fontFamily: 'Inter_700Bold', fontSize: 12, color: Paper, lineHeight: 14 },

  // Begin button
  beginBtn: { backgroundColor: Ink, borderRadius: 5, paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  beginText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: Cream, letterSpacing: 1 },
});
