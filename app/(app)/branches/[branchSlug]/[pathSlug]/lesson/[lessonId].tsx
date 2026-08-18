import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLessonById, lessonAccessibility } from '@/data';
import type { Lesson } from '@/data/types';
import LessonRunner from '@/components/lesson/LessonRunner';
import LessonLoader from '@/components/lesson/LessonLoader';
import { exitLesson } from '@/components/lesson/exitLesson';
import { track } from '@/lib/posthog';
import ArgumentFightLesson from '@/components/lesson/cinematic/ArgumentFightLesson';
import PremisesBuilderLesson from '@/components/lesson/cinematic/PremisesBuilderLesson';
import { EthicsLesson } from '@/components/lesson/cinematic/ethicsScene';
import { EpistemologyLesson } from '@/components/lesson/cinematic/epistemologyScene';
import { MetaphysicsLesson } from '@/components/lesson/cinematic/metaphysicsScene';
import { AestheticsLesson } from '@/components/lesson/cinematic/aestheticsScene';
import { PoliticalLesson } from '@/components/lesson/cinematic/politicalScene';
import { Ethics2Lesson } from '@/components/lesson/cinematic/ethics2Scene';
import { Epistemology2Lesson } from '@/components/lesson/cinematic/epistemology2Scene';
import { Metaphysics2Lesson } from '@/components/lesson/cinematic/metaphysics2Scene';
import { Aesthetics2Lesson } from '@/components/lesson/cinematic/aesthetics2Scene';
import { Political2Lesson } from '@/components/lesson/cinematic/political2Scene';
import { Valid3Lesson } from '@/components/lesson/cinematic/valid3Scene';
import { Strong4Lesson } from '@/components/lesson/cinematic/strong4Scene';
import { Ethics3Lesson } from '@/components/lesson/cinematic/ethics3Scene';
import { Ethics4Lesson } from '@/components/lesson/cinematic/ethics4Scene';
import { Epistemology4Lesson } from '@/components/lesson/cinematic/epistemology4Scene';
import { Epistemology5Lesson } from '@/components/lesson/cinematic/epistemology5Scene';
import { Metaphysics3Lesson } from '@/components/lesson/cinematic/metaphysics3Scene';
import { Metaphysics4Lesson } from '@/components/lesson/cinematic/metaphysics4Scene';
import { Aesthetics3Lesson } from '@/components/lesson/cinematic/aesthetics3Scene';
import { Aesthetics4Lesson } from '@/components/lesson/cinematic/aesthetics4Scene';
import { Political3Lesson } from '@/components/lesson/cinematic/political3Scene';
import { Political4Lesson } from '@/components/lesson/cinematic/political4Scene';
import { Logic5Lesson } from '@/components/lesson/cinematic/logic5Scene';
import { Ethics5Lesson } from '@/components/lesson/cinematic/ethics5Scene';
import { Logic6Lesson } from '@/components/lesson/cinematic/logic6Scene';
import { Metaphysics6Lesson } from '@/components/lesson/cinematic/metaphysics6Scene';
import { Aesthetics6Lesson } from '@/components/lesson/cinematic/aesthetics6Scene';
import { Ethics6Lesson } from '@/components/lesson/cinematic/ethics6Scene';
import { Epistemology6Lesson } from '@/components/lesson/cinematic/epistemology6Scene';
import { Epistemology7Lesson } from '@/components/lesson/cinematic/epistemology7Scene';
import { Metaphysics5Lesson } from '@/components/lesson/cinematic/metaphysics5Scene';
import { Aesthetics5Lesson } from '@/components/lesson/cinematic/aesthetics5Scene';
import { Political5Lesson } from '@/components/lesson/cinematic/political5Scene';
import { Political6Lesson } from '@/components/lesson/cinematic/political6Scene';
import { Logic7Lesson } from '@/components/lesson/cinematic/logic7Scene';
import { Logic8Lesson } from '@/components/lesson/cinematic/logic8Scene';
import { Ethics7Lesson } from '@/components/lesson/cinematic/ethics7Scene';
import { Ethics8Lesson } from '@/components/lesson/cinematic/ethics8Scene';
import { Ethics9Lesson } from '@/components/lesson/cinematic/ethics9Scene';
import { Aesthetics19Lesson } from '@/components/lesson/cinematic/aesthetics19Scene';
import { Political12Lesson } from '@/components/lesson/cinematic/political12Scene';
import { Political13Lesson } from '@/components/lesson/cinematic/political13Scene';
import { Political15Lesson } from '@/components/lesson/cinematic/political15Scene';
import { Metaphysics13Lesson } from '@/components/lesson/cinematic/metaphysics13Scene';
import { Metaphysics15Lesson } from '@/components/lesson/cinematic/metaphysics15Scene';
import { Metaphysics24Lesson } from '@/components/lesson/cinematic/metaphysics24Scene';
import { Ethics18Lesson } from '@/components/lesson/cinematic/ethics18Scene';
import { Ethics23Lesson } from '@/components/lesson/cinematic/ethics23Scene';
import { Ethics31Lesson } from '@/components/lesson/cinematic/ethics31Scene';
import { Ethics32Lesson } from '@/components/lesson/cinematic/ethics32Scene';
import { Logic31Lesson } from '@/components/lesson/cinematic/logic31Scene';
import { Logic32Lesson } from '@/components/lesson/cinematic/logic32Scene';
import { Epistemology31Lesson } from '@/components/lesson/cinematic/epistemology31Scene';
import { Epistemology32Lesson } from '@/components/lesson/cinematic/epistemology32Scene';
import { Metaphysics31Lesson } from '@/components/lesson/cinematic/metaphysics31Scene';
import { Metaphysics32Lesson } from '@/components/lesson/cinematic/metaphysics32Scene';
import { Political33Lesson } from '@/components/lesson/cinematic/political33Scene';
import { Political34Lesson } from '@/components/lesson/cinematic/political34Scene';
import { Metaphysics35Lesson } from '@/components/lesson/cinematic/metaphysics35Scene';
import { Epistemology35Lesson } from '@/components/lesson/cinematic/epistemology35Scene';
import { Logic35Lesson } from '@/components/lesson/cinematic/logic35Scene';
import { Ethics35Lesson } from '@/components/lesson/cinematic/ethics35Scene';
import { Aesthetics35Lesson } from '@/components/lesson/cinematic/aesthetics35Scene';
import { Political35Lesson } from '@/components/lesson/cinematic/political35Scene';
import { Metaphysics36Lesson } from '@/components/lesson/cinematic/metaphysics36Scene';
import { Epistemology36Lesson } from '@/components/lesson/cinematic/epistemology36Scene';
import { Logic36Lesson } from '@/components/lesson/cinematic/logic36Scene';
import { Ethics36Lesson } from '@/components/lesson/cinematic/ethics36Scene';
import { Aesthetics36Lesson } from '@/components/lesson/cinematic/aesthetics36Scene';
import { Political36Lesson } from '@/components/lesson/cinematic/political36Scene';
import { Metaphysics37Lesson } from '@/components/lesson/cinematic/metaphysics37Scene';
import { Epistemology37Lesson } from '@/components/lesson/cinematic/epistemology37Scene';
import { Logic37Lesson } from '@/components/lesson/cinematic/logic37Scene';
import { Ethics37Lesson } from '@/components/lesson/cinematic/ethics37Scene';
import { Aesthetics37Lesson } from '@/components/lesson/cinematic/aesthetics37Scene';
import { Political37Lesson } from '@/components/lesson/cinematic/political37Scene';
import { Aesthetics33Lesson } from '@/components/lesson/cinematic/aesthetics33Scene';
import { Aesthetics34Lesson } from '@/components/lesson/cinematic/aesthetics34Scene';
import { Ethics33Lesson } from '@/components/lesson/cinematic/ethics33Scene';
import { Ethics34Lesson } from '@/components/lesson/cinematic/ethics34Scene';
import { Logic33Lesson } from '@/components/lesson/cinematic/logic33Scene';
import { Logic34Lesson } from '@/components/lesson/cinematic/logic34Scene';
import { Epistemology33Lesson } from '@/components/lesson/cinematic/epistemology33Scene';
import { Epistemology34Lesson } from '@/components/lesson/cinematic/epistemology34Scene';
import { Metaphysics33Lesson } from '@/components/lesson/cinematic/metaphysics33Scene';
import { Metaphysics34Lesson } from '@/components/lesson/cinematic/metaphysics34Scene';
import { Aesthetics31Lesson } from '@/components/lesson/cinematic/aesthetics31Scene';
import { Aesthetics32Lesson } from '@/components/lesson/cinematic/aesthetics32Scene';
import { Political31Lesson } from '@/components/lesson/cinematic/political31Scene';
import { Political32Lesson } from '@/components/lesson/cinematic/political32Scene';
import { Logic12Lesson } from '@/components/lesson/cinematic/logic12Scene';
import { Ethics13Lesson } from '@/components/lesson/cinematic/ethics13Scene';
import { Epistemology14Lesson } from '@/components/lesson/cinematic/epistemology14Scene';
import { Metaphysics12Lesson } from '@/components/lesson/cinematic/metaphysics12Scene';
import { Aesthetics13Lesson } from '@/components/lesson/cinematic/aesthetics13Scene';
import { Political14Lesson } from '@/components/lesson/cinematic/political14Scene';
import { Logic22Lesson } from '@/components/lesson/cinematic/logic22Scene';
import { Logic25Lesson } from '@/components/lesson/cinematic/logic25Scene';
import { Logic26Lesson } from '@/components/lesson/cinematic/logic26Scene';
import { Aesthetics11Lesson } from '@/components/lesson/cinematic/aesthetics11Scene';
import { Aesthetics16Lesson } from '@/components/lesson/cinematic/aesthetics16Scene';
import { KnowHowLesson } from '@/components/lesson/cinematic/knowHowScene';
import { Epistemology13Lesson } from '@/components/lesson/cinematic/epistemology13Scene';
import { Epistemology21Lesson } from '@/components/lesson/cinematic/epistemology21Scene';
import { Epistemology8Lesson } from '@/components/lesson/cinematic/epistemology8Scene';
import { Epistemology9Lesson } from '@/components/lesson/cinematic/epistemology9Scene';
import { Metaphysics7Lesson } from '@/components/lesson/cinematic/metaphysics7Scene';
import { Metaphysics8Lesson } from '@/components/lesson/cinematic/metaphysics8Scene';
import { Aesthetics7Lesson } from '@/components/lesson/cinematic/aesthetics7Scene';
import { Aesthetics8Lesson } from '@/components/lesson/cinematic/aesthetics8Scene';
import { Political7Lesson } from '@/components/lesson/cinematic/political7Scene';
import { Political8Lesson } from '@/components/lesson/cinematic/political8Scene';
import { Metaphysics9Lesson } from '@/components/lesson/cinematic/metaphysics9Scene';
import { Epistemology10Lesson } from '@/components/lesson/cinematic/epistemology10Scene';
import { Logic9Lesson } from '@/components/lesson/cinematic/logic9Scene';
import { Ethics10Lesson } from '@/components/lesson/cinematic/ethics10Scene';
import { Aesthetics9Lesson } from '@/components/lesson/cinematic/aesthetics9Scene';
import { Political9Lesson } from '@/components/lesson/cinematic/political9Scene';
import { Logic10Lesson } from '@/components/lesson/cinematic/logic10Scene';
import { Logic11Lesson } from '@/components/lesson/cinematic/logic11Scene';
import { Ethics11Lesson } from '@/components/lesson/cinematic/ethics11Scene';
import { Ethics12Lesson } from '@/components/lesson/cinematic/ethics12Scene';
import { Epistemology11Lesson } from '@/components/lesson/cinematic/epistemology11Scene';
import { Epistemology12Lesson } from '@/components/lesson/cinematic/epistemology12Scene';
import { Metaphysics10Lesson } from '@/components/lesson/cinematic/metaphysics10Scene';
import { Metaphysics11Lesson } from '@/components/lesson/cinematic/metaphysics11Scene';
import { Aesthetics10Lesson } from '@/components/lesson/cinematic/aesthetics10Scene';
import { Aesthetics12Lesson } from '@/components/lesson/cinematic/aesthetics12Scene';
import { Political10Lesson } from '@/components/lesson/cinematic/political10Scene';
import { Political11Lesson } from '@/components/lesson/cinematic/political11Scene';
import ScreenTransition from '@/components/shared/ScreenTransition';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';
import { useUIStore } from '@/stores/uiStore';
import PassCard from '@/components/shared/PassCard';
import { awardedRank } from '@/data/ranks';
import { FREE_DAILY_LESSON_LIMIT, lessonsWord } from '@/constants/subscription';

const Page = '#FAFAF7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

// Lessons that play as a continuous animated scene instead of the card pager.
// A cinematic component takes the same `{ lesson }` prop and renders LessonReward
// itself when it finishes, so XP, the streak, badges and the daily counter all
// still run through exactly one path. Everything above this line — hydration, the
// unlock gate, the daily limit — applies to both kinds of lesson unchanged.
// Removing an entry here is a complete, safe rollback to the normal card runner.
// EXPORTED so the lesson audit can mount any scene without duplicating the map.
// A named export in a route file is inert — Expo Router only reads the default.
export const CINEMATIC: Record<string, React.ComponentType<{ lesson: Lesson }>> = {
  'logic-arguments-1': ArgumentFightLesson,
  'logic-arguments-2': PremisesBuilderLesson,
  'ethics-ethics-1': EthicsLesson,
  'epistemology-knowledge-1': EpistemologyLesson,
  'metaphysics-being-1': MetaphysicsLesson,
  'aesthetics-aesthetics-1': AestheticsLesson,
  'political-political-1': PoliticalLesson,
  'ethics-ethics-2': Ethics2Lesson,
  'epistemology-knowledge-3': Epistemology2Lesson,
  'metaphysics-being-2': Metaphysics2Lesson,
  'aesthetics-aesthetics-2': Aesthetics2Lesson,
  'political-political-2': Political2Lesson,
  // second wave — lessons 3 & 4 of each branch's first unit
  'logic-arguments-3': Valid3Lesson,
  'logic-arguments-4': Strong4Lesson,
  'ethics-ethics-3': Ethics3Lesson,
  'ethics-ethics-4': Ethics4Lesson,
  'epistemology-knowledge-4': Epistemology4Lesson,
  'epistemology-knowledge-5': Epistemology5Lesson,
  'metaphysics-being-3': Metaphysics3Lesson,
  'metaphysics-being-4': Metaphysics4Lesson,
  'aesthetics-aesthetics-3': Aesthetics3Lesson,
  'aesthetics-aesthetics-4': Aesthetics4Lesson,
  'political-political-3': Political3Lesson,
  'political-political-4': Political4Lesson,
  // showcase — richer scenes + scene-driven answers
  'logic-arguments-5': Logic5Lesson,
  'ethics-ethics-5': Ethics5Lesson,
  'logic-arguments-6': Logic6Lesson,
  'metaphysics-being-6': Metaphysics6Lesson,
  'aesthetics-aesthetics-6': Aesthetics6Lesson,
  'ethics-ethics-6': Ethics6Lesson,
  'epistemology-knowledge-6': Epistemology6Lesson,
  'epistemology-knowledge-7': Epistemology7Lesson,
  'metaphysics-being-5': Metaphysics5Lesson,
  'aesthetics-aesthetics-5': Aesthetics5Lesson,
  'political-political-5': Political5Lesson,
  'political-political-6': Political6Lesson,
  // fourth wave — the figure walks the stage: to a whiteboard, a sprinkler, a
  // timeline, a gallery wall, a fence. Lessons 7 & 8 of every branch.
  'logic-arguments-7': Logic7Lesson,
  'logic-arguments-8': Logic8Lesson,
  'ethics-ethics-7': Ethics7Lesson,
  'ethics-ethics-8': Ethics8Lesson,
  'ethics-ethics-9': Ethics9Lesson,
  // Levelling every branch at 14 cinematic — these are EXISTING lessons given a
  // scene, not new ones, so the 30-per-branch total below is untouched.
  // Two per branch, each with its own staging and its own answer mechanic (E33).
  'ethics-ethics-31': Ethics31Lesson,
  'ethics-ethics-32': Ethics32Lesson,
  'logic-arguments-31': Logic31Lesson,
  'logic-arguments-32': Logic32Lesson,
  // Two NEW lessons per branch, each staged and answered differently from the last
  // (E33): a cabinet of drawers you open, a board of maps you pick a scale from.
  'epistemology-knowledge-31': Epistemology31Lesson,
  'epistemology-knowledge-32': Epistemology32Lesson,
  'metaphysics-being-31': Metaphysics31Lesson,
  'metaphysics-being-32': Metaphysics32Lesson,
  'political-political-33': Political33Lesson,
  'political-political-34': Political34Lesson,
  'metaphysics-being-35': Metaphysics35Lesson,
  'epistemology-knowledge-35': Epistemology35Lesson,
  'logic-arguments-35': Logic35Lesson,
  'ethics-ethics-35': Ethics35Lesson,
  'aesthetics-aesthetics-35': Aesthetics35Lesson,
  'political-political-35': Political35Lesson,
  'metaphysics-being-36': Metaphysics36Lesson,
  'epistemology-knowledge-36': Epistemology36Lesson,
  'logic-arguments-36': Logic36Lesson,
  'ethics-ethics-36': Ethics36Lesson,
  'aesthetics-aesthetics-36': Aesthetics36Lesson,
  'political-political-36': Political36Lesson,
  'metaphysics-being-37': Metaphysics37Lesson,
  'epistemology-knowledge-37': Epistemology37Lesson,
  'logic-arguments-37': Logic37Lesson,
  'ethics-ethics-37': Ethics37Lesson,
  'aesthetics-aesthetics-37': Aesthetics37Lesson,
  'political-political-37': Political37Lesson,
  'aesthetics-aesthetics-33': Aesthetics33Lesson,
  'aesthetics-aesthetics-34': Aesthetics34Lesson,
  'ethics-ethics-33': Ethics33Lesson,
  'ethics-ethics-34': Ethics34Lesson,
  'logic-arguments-33': Logic33Lesson,
  'logic-arguments-34': Logic34Lesson,
  'epistemology-knowledge-33': Epistemology33Lesson,
  'epistemology-knowledge-34': Epistemology34Lesson,
  'metaphysics-being-33': Metaphysics33Lesson,
  'metaphysics-being-34': Metaphysics34Lesson,
  'aesthetics-aesthetics-31': Aesthetics31Lesson,
  'aesthetics-aesthetics-32': Aesthetics32Lesson,
  'political-political-31': Political31Lesson,
  'political-political-32': Political32Lesson,
  'logic-arguments-22': Logic22Lesson,
  'ethics-ethics-18': Ethics18Lesson,
  'metaphysics-being-13': Metaphysics13Lesson,
  'metaphysics-being-15': Metaphysics15Lesson,
  'metaphysics-being-24': Metaphysics24Lesson,
  'aesthetics-aesthetics-19': Aesthetics19Lesson,
  'political-political-12': Political12Lesson,
  'political-political-13': Political13Lesson,
  'political-political-15': Political15Lesson,
  'ethics-ethics-23': Ethics23Lesson,
  'logic-arguments-25': Logic25Lesson,
  'logic-arguments-26': Logic26Lesson,
  // The six that levelled every branch at 30 lessons.
  'aesthetics-aesthetics-11': Aesthetics11Lesson,
  'aesthetics-aesthetics-16': Aesthetics16Lesson,
  'epistemology-knowledge-2': KnowHowLesson,
  'epistemology-knowledge-13': Epistemology13Lesson,
  'epistemology-knowledge-21': Epistemology21Lesson,
  'epistemology-knowledge-8': Epistemology8Lesson,
  'epistemology-knowledge-9': Epistemology9Lesson,
  'metaphysics-being-7': Metaphysics7Lesson,
  'metaphysics-being-8': Metaphysics8Lesson,
  'aesthetics-aesthetics-7': Aesthetics7Lesson,
  'aesthetics-aesthetics-8': Aesthetics8Lesson,
  'political-political-7': Political7Lesson,
  'political-political-8': Political8Lesson,
  // fifth wave — one more per branch, each answering its second question ON the
  // stage: a gap a thought cannot cross, a flag planted on a gauge, the reply that
  // goes at the man, the difference that carries no moral weight, the label under
  // the plinth, the line a majority cannot pass.
  //
  // NOTE THE IDS. Ethics has no lesson 9 and epistemology has no lesson 2 — both
  // branches skip numbers — so "the ninth lesson" is `ethics-ethics-10` there and
  // `epistemology-knowledge-10` next door. These were read out of the data, not
  // counted (F45b).
  'metaphysics-being-9': Metaphysics9Lesson,
  'epistemology-knowledge-10': Epistemology10Lesson,
  'logic-arguments-9': Logic9Lesson,
  'ethics-ethics-10': Ethics10Lesson,
  'aesthetics-aesthetics-9': Aesthetics9Lesson,
  'political-political-9': Political9Lesson,
  // sixth wave — two more per branch, each built around ONE picture whose change is
  // the argument (H64): a premise hauled up through the line marked SAID, a proof
  // that lifts off the ground when its circle closes, a second shelf that quantity
  // cannot reach, a maxim copied until the word on it is gone, two clock hands that
  // agree once by accident, three pipes and the one that actually fills the tank,
  // a card looking for a home, name plates that follow the memories rather than the
  // bodies, a shutter over what a work asks you to feel, a sealed box that never
  // opens, a stack read once by its history and once by its shape, and a dial that
  // rebuilds the state under it.
  //
  // NOTE THE IDS, again (F45b). Aesthetics has no lesson 11, so its pair is 10 and
  // 12; ethics still has no 9 and epistemology no 2. Every id here was grepped out
  // of `data/branches`, not counted along a unit.
  'logic-arguments-10': Logic10Lesson,
  'logic-arguments-11': Logic11Lesson,
  'ethics-ethics-11': Ethics11Lesson,
  'ethics-ethics-12': Ethics12Lesson,
  'epistemology-knowledge-11': Epistemology11Lesson,
  'epistemology-knowledge-12': Epistemology12Lesson,
  'metaphysics-being-10': Metaphysics10Lesson,
  'metaphysics-being-11': Metaphysics11Lesson,
  'aesthetics-aesthetics-10': Aesthetics10Lesson,
  'aesthetics-aesthetics-12': Aesthetics12Lesson,
  'political-political-10': Political10Lesson,
  'political-political-11': Political11Lesson,
  // Round one of the conversion proper, taken in READING ORDER — the next
  // unconverted lesson in each branch, not the one that best suits a scene (§5).
  // `check:cinematic` prints the frontier, and its SOLID_FLOOR ratchet fails the
  // build if a round is ever taken from behind it.
  'logic-arguments-12': Logic12Lesson,
  'ethics-ethics-13': Ethics13Lesson,
  'epistemology-knowledge-14': Epistemology14Lesson,
  'metaphysics-being-12': Metaphysics12Lesson,
  'aesthetics-aesthetics-13': Aesthetics13Lesson,
  'political-political-14': Political14Lesson,
};

/** '6 AUG' — the day the pass was spent, struck across it. */
function stampDate() {
  const d = new Date();
  const M = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return d.getDate() + ' ' + M[d.getMonth()];
}

function todayStr() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function LessonScreen() {
  const { lessonId, test } = useLocalSearchParams<{ lessonId: string; test?: string }>();
  const result = getLessonById(lessonId);
  // ── PLAYED FROM THE LESSON TESTER ──────────────────────────────────────────
  //
  // Only ever true when the hidden tester pushed this route, and it does two
  // things: it opens a lesson the reader has not earned, and it tells
  // LessonReward to write nothing when the lesson ends.
  //
  // The flag is NAMED WITH THE LESSON and re-set on every mount — to this id
  // under test, to null otherwise. So there is no state to leak: walking out of
  // a test run and into a real lesson clears it on the way in, and a real run
  // can never be silently swallowed.
  const testing = test === '1';
  const setTestLesson = useUIStore((s) => s.setTestLesson);
  useEffect(() => {
    setTestLesson(testing ? lessonId : null);
  }, [lessonId, testing, setTestLesson]);
  const [loading, setLoading] = useState(true);

  const isPro = useSubscriptionStore((s) => s.isPro);
  const dailyLessonCount = useUserDataStore((s) => s.dailyLessonCount);
  const dailyLessonDate = useUserDataStore((s) => s.dailyLessonDate);
  const lessonsByUnit = useUserDataStore((s) => s.lessonsByUnit);
  const hasHydrated = useUserDataStore((s) => s._hasHydrated);
  const openPaywall = useUIStore((s) => s.openPaywall);
  // For the day-pass card on the limit screen. Read unconditionally — these are
  // hooks, and the screen has several early returns below them.
  const displayName = useUserDataStore((s) => s.displayName);
  const rankIndex = useUserDataStore((s) => s.rankIndex);
  const totalXP = useUserDataStore((s) => s.totalXP);
  const lockRank = awardedRank(rankIndex, totalXP);
  const { width: winW } = useWindowDimensions();
  const lockCardW = Math.min(340, winW - 68);

  // Freeze the daily-limit gate ONCE — but only after the persisted store has
  // hydrated, so we never freeze a pre-hydration default (which would read used=0
  // and let a capped free user sneak an extra lesson). atLimit must be frozen
  // because completing the lesson bumps the daily count, and that must not flip
  // this screen to the limit lock mid-celebration and steal the XP + streak.
  const atLimitRef = useRef<boolean | null>(null);
  if (hasHydrated && atLimitRef.current === null) {
    const used = dailyLessonDate === todayStr() ? dailyLessonCount : 0;
    atLimitRef.current = !isPro && used >= FREE_DAILY_LESSON_LIMIT;
  }
  const atLimit = (atLimitRef.current ?? false) && !testing;

  // ── ONCE IT HAS OPENED, IT STAYS OPEN FOR THIS VISIT ───────────────────────
  //
  // Access is computed LIVE, so a stale pre-hydration `{}` cannot false-lock a
  // finished lesson reached by deep link. That used to be safe on its own,
  // because "completing a lesson only ever advances progress, which can unlock
  // but never lock".
  //
  // THAT INVARIANT IS GONE. Replay is part of the Pass now (see `lessonAccess`),
  // so the moment a free reader finishes lesson 3 the unit's count goes to 4 and
  // lesson 3 stops being the next one and becomes a replay — locked, live, while
  // they are still standing in it. Without the latch below they are thrown onto
  // the lock screen at the exact moment they earn the reward, by a paywall for a
  // lesson they have this second completed. It is the worst possible place to
  // put one.
  //
  // A ONE-WAY latch: openable → stays openable until they leave. It does not
  // latch the other way, so buying the Pass mid-lesson still unlocks at once.
  const live = lessonAccessibility(lessonId, lessonsByUnit, isPro);
  const everOpen = useRef(false);
  if (live.accessible) everOpen.current = true;
  const access = everOpen.current ? { accessible: true, gatedByPro: false } : live;
  const locked = !access.accessible && !testing;
  const gatedByPro = access.gatedByPro;

  if (!result) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAF7', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#1A1A1A', fontSize: 18 }}>Lesson not found.</Text>
      </SafeAreaView>
    );
  }

  // Wait for persisted progress before deciding access / the daily limit, so a
  // cold deep-link into a lesson never evaluates the gates against an empty
  // default store. AsyncStorage rehydration is near-instant.
  if (!hasHydrated) {
    return <ScreenTransition bg="#FAFAF7"><View style={{ flex: 1, backgroundColor: '#FAFAF7' }} /></ScreenTransition>;
  }

  // Locked lesson (reached via a deep link / back stack, not the list). Free
  // users must finish the previous unit first; the Pass lets them jump ahead.
  if (locked) {
    return (
      <ScreenTransition bg={Page}>
        <SafeAreaView style={styles.lockWrap}>
          <View style={styles.lockIcon}>
            <SketchIcon name="lock" color={Ink} size={34} />
          </View>
          <Text style={styles.lockTitle}>
            {gatedByPro ? 'This unit is a jump ahead' : 'Not yet unlocked'}
          </Text>
          <Text style={styles.lockBody}>
            {gatedByPro
              ? 'Finish the previous unit to reach this one — or unlock Scholar’s Pass to start any unit whenever you like.'
              : 'Finish the earlier lessons in this unit first to unlock this one.'}
          </Text>
          {gatedByPro && (
            <Pressable
              onPress={openPaywall}
              style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.primaryText}>Unlock Scholar’s Pass</Text>
            </Pressable>
          )}
          <Pressable onPress={exitLesson} style={styles.secondaryBtn} hitSlop={8}>
            <Text style={styles.secondaryText}>Go back</Text>
          </Pressable>
        </SafeAreaView>
      </ScreenTransition>
    );
  }

  if (atLimit) {
    return (
      <ScreenTransition bg={Page}>
        {/* THE DAY PASS, STAMPED. Not a lock icon: the free tier IS one
            admission a day, and this reader has just spent theirs on a lesson
            they finished. Drawing the thing they hold — in their name, struck
            with today's date — says "you used it", which is true, rather than
            "you are shut out", which is not. It is the same PassCard the offer
            shows, so the upgrade needs no feature table: it is visibly this
            object without the stamp. */}
        <SafeAreaView style={styles.lockWrap}>
          <PassCard
            variant="day"
            name={displayName || 'Philosopher'}
            rank={lockRank.current.name}
            glyph={lockRank.current.glyph}
            lines={[
              `${FREE_DAILY_LESSON_LIMIT} ${lessonsWord(FREE_DAILY_LESSON_LIMIT)} a day`,
              'Renews at midnight',
            ]}
            stamp={`USED · ${stampDate()}`}
            width={lockCardW}
          />
          <Text style={styles.lockTitle}>
            {FREE_DAILY_LESSON_LIMIT === 1 ? 'That’s your lesson for today' : `That’s your ${FREE_DAILY_LESSON_LIMIT} for today`}
          </Text>
          <Text style={styles.lockBody}>
            Come back tomorrow and it renews — or carry the one that never gets stamped.
          </Text>
          <Pressable
            onPress={openPaywall}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.primaryText}>See the Scholar’s Pass</Text>
          </Pressable>
          <Pressable onPress={exitLesson} style={styles.secondaryBtn} hitSlop={8}>
            <Text style={styles.secondaryText}>Maybe tomorrow</Text>
          </Pressable>
        </SafeAreaView>
      </ScreenTransition>
    );
  }

  const cinematic = CINEMATIC[lessonId];
  const Runner = cinematic ?? LessonRunner;

  return (
    <ScreenTransition bg="#FAFAF7">
      {loading ? (
        <LessonLoader onDone={() => setLoading(false)} />
      ) : (
        <StartedRunner
          Runner={Runner}
          lesson={result.lesson}
          branchSlug={result.branch.slug}
          unitId={result.path.id}
          format={cinematic ? 'cinematic' : 'cards'}
        />
      )}
    </ScreenTransition>
  );
}

/**
 * WHERE `lesson_started` BELONGS, which is here and not inside a runner.
 *
 * It used to live in LessonRunner — the CARD runner — so it reported the 90 card
 * lessons and none of the 102 cinematic ones. Meanwhile `lesson_completed` fires
 * from LessonReward, which every runner reaches. The result was a funnel that
 * counted completions with no matching starts: cinematic lessons appeared to have
 * an impossible completion rate and card lessons looked worse than they were, and
 * the comparison between the two formats — the single most important content
 * question this app has (§5) — read exactly backwards.
 *
 * This wrapper mounts with whichever runner the route chose, so a new runner is
 * instrumented by existing, not by remembering. `format` is what makes the
 * cinematic-versus-cards question answerable at all.
 */
function StartedRunner({
  Runner,
  lesson,
  branchSlug,
  unitId,
  format,
}: {
  Runner: React.ComponentType<{ lesson: Lesson }>;
  lesson: Lesson;
  branchSlug: string;
  unitId: string;
  format: 'cinematic' | 'cards';
}) {
  useEffect(() => {
    track('lesson_started', {
      lesson_id: lesson.id,
      branch_slug: branchSlug,
      unit_id: unitId,
      format,
      total_cards: lesson.cards.length,
    });
    // Once per lesson, not once per re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);
  return <Runner lesson={lesson} />;
}

const styles = StyleSheet.create({
  lockWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  lockIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: Ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  lockTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: Ink, textAlign: 'center' },
  lockBody: { fontFamily: 'Inter_400Regular', fontSize: 15, color: InkSoft, lineHeight: 22, textAlign: 'center', marginTop: 14 },
  primaryBtn: {
    backgroundColor: Ink,
    borderRadius: 4,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 30,
    alignSelf: 'stretch',
  },
  primaryText: { fontFamily: 'Inter_700Bold', fontSize: 16, color: Page, letterSpacing: 0.3 },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center' },
  secondaryText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: InkSoft, textDecorationLine: 'underline' },
});
