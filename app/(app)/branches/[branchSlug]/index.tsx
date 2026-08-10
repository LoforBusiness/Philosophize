import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ImageBackground } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, AnimatePresence } from 'moti';
import { getBranchBySlug, lessonAccess } from '@/data';
import type { Path as Unit, Lesson } from '@/data/types';
import type { GlyphName } from '@/components/shared/Glyph';
import SketchIcon from '@/components/shared/SketchIcon';
import ScreenTransition from '@/components/shared/ScreenTransition';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';
import { BRANCH_ART, MAST_SCRIM, ArtCream, ArtSoft, ArtGold } from '@/constants/branchArt';
import BranchWorld, { type WorldLesson } from '@/components/branch/BranchWorld';

const Page = '#F1EEE7';
const Paper = '#FFFFFF';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const Faint = '#9A968C';
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
  /** What it IS: finished, the one to do next, or still ahead. */
  state: LessonState;
  /** May THIS reader open it right now. From `lessonAccess` — never re-derived. */
  open: boolean;
  /** ...and if not, would the Pass fix it. Only then is a paywall honest. */
  needsPass: boolean;
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

  // ── THE UNITS DRAWER ───────────────────────────────────────────────────────
  //
  // The list of units used to BE the screen: five expanding cards under the
  // world, each holding every lesson it contains. That made the road the thing
  // you scrolled past on the way to the index. The road is the product now, so
  // the units are folded away behind one small box and the screen opens on the
  // walk.
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Which unit is showing its lessons. One at a time: five units of eight would
  // be forty rows in a floating panel, which is a screen of its own.
  const [openUnitId, setOpenUnitId] = useState<string | null>(null);
  // Where the box sits, measured — the drawer is an overlay anchored under it,
  // and both are drawn AFTER the scroll view so neither is clipped by it.
  const [barBottom, setBarBottom] = useState(0);
  // Which unit the reader has asked to stand in. null = follow their progress.
  // Cleared whenever they finish a lesson, so the road goes back to tracking
  // where they actually are rather than where they last looked.
  const [focusUnitId, setFocusUnitId] = useState<string | null>(null);


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
      // WHAT IT IS and WHO MAY OPEN IT are two different questions, and this
      // screen used to answer only the first. A finished lesson still reads as
      // finished for a free reader — they did it — but it no longer opens for
      // them, so the drawer can show it, tick it, and put a lock on it.
      const state: LessonState = li < done ? 'done' : li === done ? 'current' : 'locked';
      const { open, needsPass } = lessonAccess(li, done, startable, isPro);
      return { lesson, li, state, open, needsPass };
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

  // WHAT THE DRAWER LISTS: EVERY UNIT.
  //
  // It used to hide finished ones, on the reasoning that re-reading a closed
  // unit is not what the control is for. That was the wrong call — going back to
  // something you have already done is precisely what a reader wants a contents
  // page for, and hiding the finished units meant the further in you got, the
  // less the drawer would show you, until eventually it said "every unit in this
  // branch is complete" and nothing else.
  const drawerUnits = units;

  // ── the advance ────────────────────────────────────────────────────────────
  //
  // `justFinished` is set by the reward screen the moment the reader presses
  // Continue, and read here exactly once. The store is cleared straight away and
  // the target kept in local state, so the animation is armed by an EVENT rather
  // than by a value that lingers — otherwise a tab away and back would replay a
  // celebration for a lesson finished ten minutes ago.
  const justFinished = useUIStore((s) => s.justFinished);
  const clearLessonFinished = useUIStore((s) => s.clearLessonFinished);
  // Is this screen actually in front of the reader, with nothing over it? The
  // advance waits for all three (see the effect below).
  const rewardUp = useUIStore((s) => s.reward !== null);
  const paywallUp = useUIStore((s) => s.paywallOpen);
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );
  // THE WALK, armed by the finish event.
  const [walkTo, setWalkTo] = useState<{ from: number; to: number; done: () => void } | null>(null);

  useEffect(() => {
    if (!justFinished || justFinished.branchSlug !== branchSlug) return;
    // ── NOT UNTIL IT CAN BE WATCHED ───────────────────────────────────────────
    //
    // The reward modal is still over this screen when the reader presses
    // Continue, and this screen may not even be the one in front. Claiming the
    // advance then meant the seven seconds were spent behind a modal, or on an
    // instance about to be replaced — and because claiming CLEARED it, there was
    // nothing left for the screen the reader actually ended up looking at.
    //
    // So leave it sitting in the store. It is claimed by whichever branch screen
    // is focused with nothing over it, whenever that happens to be, which is
    // exactly the requirement: the walk begins when there is someone to see it.
    if (!focused || rewardUp || paywallUp) return;
    const u = allUnits.find((x) => x.id === justFinished.unitId);
    const idx = u ? u.lessons.findIndex((l) => l.id === justFinished.lessonId) : -1;
    clearLessonFinished();
    if (!u || idx < 0) return;

    // A lesson was just finished, so wherever the reader had parked the road with
    // the drawer, they are HERE now. Leaving the focus set would arm the walk
    // against a stretch of road the figure is not standing on.
    setFocusUnitId(null);
    setDrawerOpen(false);

    // The reader cannot be anywhere but the top any more — the screen does not
    // scroll (see the ScrollView below) — so the pair of scrollTo calls that used
    // to sit here, one now and one after layout, are gone. They existed because
    // `router.replace` can land on the instance already in the stack WITH its old
    // scroll offset, which could leave the reader parked below the walk they were
    // about to be shown. With no offset to restore there is nothing to correct.

    // Hand the walk over IMMEDIATELY, so the figure is placed at the lesson just
    // finished on the very first frame. The pause before it sets off belongs to
    // the world, not to here — armed late, the figure would be standing at its
    // DESTINATION for half a second and then snap backwards to start.
    let flat = 0;
    for (const uu of allUnits) {
      if (uu.id === u.id) { flat += idx; break; }
      flat += uu.lessons.length;
    }
    const next = flat + 1;
    if (next < allUnits.reduce((n, x) => n + x.lessons.length, 0)) {
      setWalkTo({ from: flat, to: next, done: () => setWalkTo(null) });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justFinished?.seq, focused, rewardUp, paywallUp]);

  if (!branch) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.notFound}>Branch not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const worldLessons: WorldLesson[] = [];
  for (const u of units) {
    for (const lm of u.lessons) {
      worldLessons.push({
        id: lm.lesson.id,
        title: lm.lesson.title,
        unitId: u.unit.id,
        unitSlug: u.unit.slug,
        unitTitle: u.unit.name,
        done: lm.state === 'done',
        accessible: lm.open,
        needsPass: lm.needsPass,
      });
    }
  }

  /** The flat index of a unit's next unplayed lesson. */
  const entryIndexOf = (unitId: string) => {
    let flat = 0;
    for (const u of units) {
      if (u.unit.id === unitId) {
        return flat + Math.min(u.done, Math.max(0, u.total - 1));
      }
      flat += u.total;
    }
    return -1;
  };

  // Where the figure stands: normally the first lesson not yet finished, or the
  // end of the road if the branch is complete — but a unit chosen in the drawer
  // wins. `current` is the only lever needed to move the road: BranchWorld
  // re-places the figure and the camera whenever it changes.
  const firstUndone = worldLessons.findIndex((l) => !l.done);
  let worldAt = firstUndone < 0 ? Math.max(0, worldLessons.length - 1) : firstUndone;
  if (focusUnitId) {
    const i = entryIndexOf(focusUnitId);
    if (i >= 0) worldAt = i;
  }

  const pres = PRES[branch.slug] ?? { desc: branch.description, glyph: 'book' as GlyphName, pills: [] };
  const roman = ROMAN[Math.max(0, ORDER.indexOf(branch.slug))];

  const openLesson = (unit: Unit, lesson: Lesson) =>
    router.push(`/(app)/branches/${branch.slug}/${unit.slug}/lesson/${lesson.id}`);

  // Tapping a unit shows its lessons. It no longer travels anywhere by itself,
  // and it is no longer refused to free readers — looking at a contents page is
  // not a paid feature. The travel happens when they pick an actual lesson.
  const toggleUnit = (u: UnitModel) => setOpenUnitId((id) => (id === u.unit.id ? null : u.unit.id));

  /**
   * Picking a lesson out of the drawer.
   *
   * The road is moved to that unit underneath before the lesson opens, so
   * closing it puts the figure where the reader has just been rather than back
   * where they started. `needsPass` is the only case that raises the paywall:
   * a lesson they simply have not reached yet is not something money fixes, and
   * a paywall in front of it would be a lie.
   */
  const pickLesson = (u: UnitModel, lm: LessonModel) => {
    if (!lm.open) {
      if (!lm.needsPass) return;
      setDrawerOpen(false);
      openPaywall();
      return;
    }
    setFocusUnitId(u.unit.id);
    setDrawerOpen(false);
    openLesson(u.unit, lm.lesson);
  };

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

        {/* The drawer's handle: one small box under the branch name, left. Kept
            deliberately quiet — it is a way to leave the road, not the way to
            walk it. */}
        <View
          style={styles.unitsBar}
          onLayout={(e) => setBarBottom(e.nativeEvent.layout.y + e.nativeEvent.layout.height)}
        >
          <Pressable
            onPress={() => setDrawerOpen((o) => !o)}
            hitSlop={8}
            style={({ pressed }) => [styles.unitsBox, drawerOpen && styles.unitsBoxOpen, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.unitsLabel, drawerOpen && { color: Paper }]}>Units</Text>
            <MotiView animate={{ rotate: drawerOpen ? '0deg' : '-90deg' }} transition={{ type: 'timing', duration: 200 }}>
              <SketchIcon name="chevron-down" size={12} color={drawerOpen ? Paper : InkSoft} />
            </MotiView>
          </Pressable>
        </View>

        {/* THE BRANCH DOES NOT SCROLL. It is one fixed screen — masthead, road,
            figure — and the road is the thing you are meant to be looking at.
            There was never more than a few dozen units of travel in it, which is
            worse than none: a page that gives slightly under a gesture reads as
            loose rather than as having somewhere to go, and it lets the reader
            drag the walk half off the top of the screen while it is playing.
            `bounces` is off as well, or iOS still rubber-bands against the stop
            and the screen appears to move after all.

            It stays a ScrollView rather than becoming a plain View so the layout
            is byte-for-byte the one that was signed off, and so re-enabling it is
            one prop rather than a rewrite. */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
        >
          {/* Masthead — the same picture the branch carries on its Learn card, so
              arriving here confirms you opened what you tapped. The ink over it is
              heavier and more even than on the card: this text is centred in the
              box rather than stacked along the bottom, so there is no low band to
              hide it in and the whole area has to be safe to read on. */}
          <ImageBackground
            source={BRANCH_ART[branch.slug]}
            style={styles.masthead}
            imageStyle={styles.mastImg}
            resizeMode="cover"
          >
            <LinearGradient colors={MAST_SCRIM} style={StyleSheet.absoluteFill} />
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
          </ImageBackground>

          {/* THE ROAD, and now the whole of it. Every lesson in the branch laid end
              to end on the ground with the reader standing where they got to;
              finishing one walks the figure to the next. The unit list that used
              to sit beneath this is folded into the box above. */}
          <BranchWorld
            lessons={worldLessons}
            current={worldAt}
            advanceTo={walkTo}
            // The road runs through THIS branch's own country — the same place the
            // photograph above it is of. See sceneArt.
            place={branch.slug}
            onOpen={(l) => {
              const u = allUnits.find((x) => x.id === l.unitId);
              const les = u?.lessons.find((x) => x.id === l.id);
              if (u && les) openLesson(u, les);
            }}
            onLocked={() => openPaywall()}
          />
        </ScrollView>

        {/* The drawer itself, drawn AFTER the scroll view so it lies over the
            world rather than being clipped by it — and with a full-screen catcher
            behind it, so a tap anywhere else puts it away. */}
        <AnimatePresence>
          {drawerOpen && (
            <Pressable
              key="catcher"
              style={StyleSheet.absoluteFill}
              onPress={() => setDrawerOpen(false)}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {drawerOpen && (
            <MotiView
              key="drawer"
              from={{ opacity: 0, translateY: -8 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -8 }}
              transition={{ type: 'timing', duration: 200 }}
              style={[styles.drawer, { top: barBottom + 6 }]}
            >
              <ScrollView
                style={{ maxHeight: 380 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                {drawerUnits.map((u) => {
                  const here = focusUnitId ? u.unit.id === focusUnitId : u.unit.id === firstIncomplete;
                  const expanded = openUnitId === u.unit.id;
                  return (
                    <View key={u.unit.id}>
                      <Pressable
                        onPress={() => toggleUnit(u)}
                        style={({ pressed }) => [
                          styles.unitRow,
                          here && styles.unitRowHere,
                          pressed && { opacity: 0.6 },
                        ]}
                      >
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={styles.unitKicker}>
                            UNIT {u.index + 1}
                            {here ? ' · HERE' : ''}
                          </Text>
                          <Text style={styles.unitName} numberOfLines={1}>{u.unit.name}</Text>
                        </View>
                        <Text style={styles.unitCount}>{u.done}/{u.total}</Text>
                        <MotiView
                          animate={{ rotate: expanded ? '0deg' : '-90deg' }}
                          transition={{ type: 'timing', duration: 160 }}
                          style={styles.unitChev}
                        >
                          <SketchIcon name="chevron-down" size={11} color={InkSoft} />
                        </MotiView>
                      </Pressable>

                      {/* THE LESSONS. A finished one a free reader may not reopen
                          still shows its tick — they did do it — and carries a
                          lock beside it. Greyed rather than hidden, because the
                          point of the list is to show what is there. */}
                      {expanded && u.lessons.map((lm) => {
                        const dim = !lm.open;
                        return (
                          <Pressable
                            key={lm.lesson.id}
                            onPress={() => pickLesson(u, lm)}
                            style={({ pressed }) => [
                              styles.lessonRow,
                              pressed && lm.open && { opacity: 0.55 },
                              pressed && lm.needsPass && { opacity: 0.75 },
                            ]}
                          >
                            <Text style={[styles.lessonNo, dim && { color: LockGray }]}>
                              {String(lm.li + 1).padStart(2, '0')}
                            </Text>
                            <Text
                              style={[
                                styles.lessonName,
                                dim && { color: LockGray },
                                lm.state === 'current' && lm.open && styles.lessonNext,
                              ]}
                              numberOfLines={1}
                            >
                              {lm.lesson.title}
                            </Text>
                            {lm.state === 'done' && (
                              <SketchIcon name="check" size={11} color={dim ? LockGray : InkSoft} />
                            )}
                            {dim && (
                              <View style={{ marginLeft: 6 }}>
                                <SketchIcon name="lock" size={11} color={LockGray} />
                              </View>
                            )}
                          </Pressable>
                        );
                      })}
                    </View>
                  );
                })}
              </ScrollView>

              {/* Said once, quietly, and only to the readers it applies to: the
                  difference between a control that looks broken and one that is
                  plainly not theirs yet. */}
              {!isPro && (
                <Pressable
                  onPress={() => {
                    setDrawerOpen(false);
                    openPaywall();
                  }}
                  style={({ pressed }) => [styles.drawerHint, pressed && { opacity: 0.6 }]}
                >
                  <Text style={styles.drawerHintText}>
                    Scholar’s Pass reopens any lesson you have finished.
                  </Text>
                </Pressable>
              )}
            </MotiView>
          )}
        </AnimatePresence>
      </SafeAreaView>
    </ScreenTransition>
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
    paddingBottom: 8,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft, letterSpacing: 2 },
  dots: { fontSize: 9, color: '#C9C5BB', letterSpacing: 2 },

  // ── the units box ──────────────────────────────────────────────────────────
  unitsBar: { paddingHorizontal: 20, paddingBottom: 10, alignItems: 'flex-start' },
  unitsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 4,
    paddingHorizontal: 11,
    paddingVertical: 5,
    backgroundColor: Paper,
  },
  unitsBoxOpen: { backgroundColor: Ink },
  unitsLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, color: Ink, letterSpacing: 1 },

  // ── the drawer ─────────────────────────────────────────────────────────────
  drawer: {
    position: 'absolute',
    left: 20,
    right: 20,
    maxWidth: 320,
    borderWidth: 1.5,
    borderColor: Ink,
    borderRadius: 6,
    backgroundColor: Paper,
    paddingVertical: 4,
    // A hard offset shadow, the same device the thinker cards use — a blurred one
    // is a grey smudge in a two-tone app.
    shadowColor: Ink,
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  unitRowHere: { backgroundColor: '#F4F1EA' },
  unitKicker: { fontFamily: 'Inter_700Bold', fontSize: 8.5, color: Faint, letterSpacing: 1.4 },
  unitName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14.5, color: Ink, marginTop: 2 },
  unitCount: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingLeft: 18,
    paddingRight: 12,
    gap: 8,
  },
  lessonNo: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    letterSpacing: 0.6,
    color: Faint,
    width: 16,
  },
  lessonName: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    color: Ink,
  },
  lessonNext: { fontFamily: 'Inter_600SemiBold' },

  unitChev: { transform: [{ scaleX: -1 }] },
  drawerHint: {
    borderTopWidth: 1,
    borderTopColor: FaintLine,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 7,
    marginTop: 4,
  },
  drawerHintText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: InkSoft, lineHeight: 16 },

  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  // Masthead
  masthead: {
    backgroundColor: Ink, // holds the frame before the image decodes
    borderRadius: 6,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // stated for the same reason as the card: an ImageBackground with no width
    // falls back to the picture's own, not the space it was given.
    width: '100%',
    // Tall enough that a cover-crop of a portrait picture is a view of something
    // rather than a horizontal sliver of it.
    minHeight: 232,
  },
  mastImg: { borderRadius: 6 },
  mastKicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: ArtGold, letterSpacing: 4 },
  mastTitle: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 34, color: ArtCream, letterSpacing: 1,
    marginTop: 8, textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.55)', textShadowRadius: 9,
  },
  mastSub: {
    fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 13, color: ArtSoft,
    marginTop: 8, textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 7,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 18 },
  // Lifted off the old near-black border, which vanished against the art.
  pill: {
    borderWidth: 1, borderColor: 'rgba(244,241,234,0.42)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5, backgroundColor: 'rgba(16,15,13,0.35)',
  },
  pillText: { fontFamily: 'Inter_500Medium', fontSize: 9, color: ArtCream, letterSpacing: 1.5 },
});
