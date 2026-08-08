import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, SectionList, StyleSheet } from 'react-native';
import { router, Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_BRANCHES } from '@/data';
import { CINEMATIC } from './branches/[branchSlug]/[pathSlug]/lesson/[lessonId]';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUIStore } from '@/stores/uiStore';
import { useUserDataStore } from '@/stores/userDataStore';

// ─────────────────────────────────────────────────────────────────────────────
// THE LESSON TESTER — every lesson, one tap away, and none of them count.
//
// Replaying a FINISHED lesson was always possible: `lessonAccessibility` returns
// accessible for anything before the unit's watermark, so the unit list and the
// branch road both open them. What was impossible was reaching a lesson you had
// not played, which is exactly what testing 192 of them needs.
//
// ── IT IS NOT A FEATURE, AND MUST NOT BECOME ONE ────────────────────────────
//
// This route bypasses `lessonAccessibility` and the free daily limit, so shipping
// it visibly would quietly end both the sequential free gate and the Scholar's
// Pass. It is reachable only when `devUnlocked` is set — seven taps on the
// version line at the bottom of Settings, session-scoped, never persisted — and
// this screen redirects away if it is not. In a dev build it is simply on.
//
// ── AND NOTHING IT OPENS IS RECORDED ────────────────────────────────────────
//
// Every row pushes the lesson with `?test=1`, which names it in `testLessonId`.
// LessonReward compares against that before writing, so a test run awards no XP,
// completes nothing, does not touch the streak or the daily count, shows no ad,
// and does not send the branch road walking. Your own progress stays a realistic
// test account instead of drifting every time you check a scene.
// ─────────────────────────────────────────────────────────────────────────────

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Faint = '#9A968C';
const Page = '#F1EEE7';
const Paper = '#FFFFFF';
const Rule = '#E4E1D8';

interface Row {
  id: string;
  title: string;
  branchSlug: string;
  unitSlug: string;
  n: number;
  cinematic: boolean;
  done: boolean;
}

export default function DevLessons() {
  const devUnlocked = useUIStore((s) => s.devUnlocked);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const [q, setQ] = useState('');

  const sections = useMemo(() => {
    const out: { title: string; sub: string; data: Row[] }[] = [];
    for (const b of ALL_BRANCHES) {
      for (const u of b.paths) {
        const doneCount = lessonsByUnit[u.id] ?? 0;
        const data = u.lessons.map((l, i) => ({
          id: l.id,
          title: l.title,
          branchSlug: b.slug,
          unitSlug: u.slug,
          n: i + 1,
          cinematic: !!CINEMATIC[l.id],
          done: i < doneCount,
        }));
        out.push({ title: `${b.name} · ${u.name}`, sub: `${data.length} lessons`, data });
      }
    }
    if (!q.trim()) return out;
    const needle = q.trim().toLowerCase();
    return out
      .map((s) => ({
        ...s,
        data: s.data.filter(
          (r) => r.title.toLowerCase().includes(needle) ||
            r.id.toLowerCase().includes(needle) ||
            s.title.toLowerCase().includes(needle),
        ),
      }))
      .filter((s) => s.data.length > 0);
  }, [q, lessonsByUnit]);

  const total = useMemo(
    () => ALL_BRANCHES.reduce((n, b) => n + b.paths.reduce((m, u) => m + u.lessons.length, 0), 0),
    [],
  );
  const cine = useMemo(
    () => ALL_BRANCHES.reduce(
      (n, b) => n + b.paths.reduce((m, u) => m + u.lessons.filter((l) => CINEMATIC[l.id]).length, 0), 0),
    [],
  );

  // Locked out rather than hidden: a route can always be reached by URL, so the
  // gate has to live in the screen, not only in whatever links to it.
  if (!devUnlocked) return <Redirect href="/(app)/settings" />;

  const open = (r: Row) =>
    router.push(`/(app)/branches/${r.branchSlug}/${r.unitSlug}/lesson/${r.id}?test=1` as never);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backRow}>
          <SketchIcon name="back" size={18} color={InkSoft} />
          <Text style={styles.brand}>LESSON TESTER</Text>
        </Pressable>
        <Text style={styles.count}>{cine}/{total} cinematic</Text>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search by title, id or unit"
          placeholderTextColor={Faint}
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.search}
        />
        {q.length > 0 && (
          <Pressable onPress={() => setQ('')} hitSlop={10} style={styles.clear}>
            <Text style={styles.clearX}>×</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.note}>
        Nothing here is recorded — no XP, no completion, no streak, no ad.
      </Text>

      <SectionList
        sections={sections}
        keyExtractor={(r) => r.id}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        renderSectionHeader={({ section }) => (
          <View style={styles.secHead}>
            <Text style={styles.secTitle}>{section.title}</Text>
            <Text style={styles.secSub}>{section.data.length}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => open(item)}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#EFECE4' }]}
          >
            <Text style={styles.rowN}>{item.n}</Text>
            <View style={styles.rowMid}>
              <Text numberOfLines={1} style={styles.rowTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.rowId}>{item.id}</Text>
            </View>
            {item.done && <Text style={styles.doneMark}>done</Text>}
            <View style={[styles.tag, item.cinematic ? styles.tagCine : styles.tagCard]}>
              <Text style={[styles.tagText, item.cinematic && { color: Paper }]}>
                {item.cinematic ? 'SCENE' : 'CARDS'}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nothing matches “{q}”.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Page },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft, letterSpacing: 2 },
  count: { fontFamily: 'Inter_500Medium', fontSize: 10, color: Faint, letterSpacing: 0.5 },

  searchWrap: { paddingHorizontal: 20, justifyContent: 'center' },
  search: {
    borderWidth: 1.5, borderColor: Ink, borderRadius: 5, backgroundColor: Paper,
    paddingHorizontal: 12, paddingVertical: 9,
    fontFamily: 'Inter_400Regular', fontSize: 13, color: Ink,
  },
  clear: { position: 'absolute', right: 30, top: 6, padding: 4 },
  clearX: { fontSize: 20, color: Faint, lineHeight: 22 },
  note: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 11.5,
    color: InkSoft, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10,
  },

  secHead: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Page, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 5,
    borderBottomWidth: 1, borderBottomColor: Rule,
  },
  secTitle: { fontFamily: 'Inter_700Bold', fontSize: 9.5, color: Ink, letterSpacing: 1.3 },
  secSub: { fontFamily: 'Inter_500Medium', fontSize: 9.5, color: Faint },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: Rule,
  },
  rowN: { fontFamily: 'Inter_500Medium', fontSize: 11, color: Faint, width: 20 },
  rowMid: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14, color: Ink },
  rowId: { fontFamily: 'Inter_400Regular', fontSize: 9.5, color: Faint, marginTop: 1 },
  doneMark: { fontFamily: 'Inter_500Medium', fontSize: 9, color: Faint, letterSpacing: 0.6 },
  tag: { borderWidth: 1.5, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2 },
  tagCine: { backgroundColor: Ink, borderColor: Ink },
  tagCard: { backgroundColor: Paper, borderColor: Rule },
  tagText: { fontFamily: 'Inter_700Bold', fontSize: 7.5, color: InkSoft, letterSpacing: 0.9 },

  empty: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13,
    color: InkSoft, textAlign: 'center', marginTop: 40,
  },
});
