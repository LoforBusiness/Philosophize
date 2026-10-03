import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, type LayoutChangeEvent, type GestureResponderEvent, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useFrameCallback, useAnimatedStyle, useAnimatedReaction, useDerivedValue, runOnJS,
  withTiming, withSequence, withDelay, Easing, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import { getLessonById } from '@/data';
import { lessonXP, XP_PER_CORRECT_ANSWER } from '@/constants/xp';
import { exitLesson } from '../exitLesson';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import { narration } from '@/lib/narration';
import { NARRATION } from '@/lib/narration/manifest';
import { sfx, type SfxId } from '@/lib/sfx';
import { useUIStore } from '@/stores/uiStore';
import {
  shotAt, resolveMoves, containShot, NEUTRAL, tourStartShots, tourEndShots, tourAt, tourEnd, trackAt,
  type Box, type Move, type Shot, type Tour,
} from './camera';
import { MUST } from './mustBoxes';
import { TOURS } from './tours';
import { GAZE } from './gazeTargets';
import { toursOff } from './tourFlag';
import { cue, touch, heard } from '@/lib/feedback';
import { footfallTrack } from './footfalls';
import ChoiceCards, { seedFor } from './ChoiceCards';
import DragScale from './DragScale';
import LeverPick from './LeverPick';
import TrendPick from './TrendPick';
import { QuestionAccentProvider } from './QuestionParts';
import { branchOfLesson } from './questionTone';
import { stageTone } from './stageTones';
import SplitBar from './SplitBar';
import FieldPick from './FieldPick';
import PollBallot from './PollBallot';
import SortBins from './SortBins';
import OrderTiles from './OrderTiles';
import OddOneOut from './OddOneOut';
import NarrationText from './NarrationText';
import { SpokenBy } from './SpeakerTag';
import ThinkerPeek from './ThinkerPeek';
import { LESSON_FOCUS } from '@/data/lessonFocus';
import { swishTrack } from './gestures';
import { lessonHasSound } from './lessonSound';
import { TargetCountProvider } from './Target';
import {
  Fade, Choices, InteractPanel, QuoteCard, SummaryCard, gates, stageAnswered, styles,
  XpPill, TapNudge,
  COMPLETION_XP, XFADE, STAGE_W, STAGE_H, BAND_T, BAND_B, GROUND, INK,
  type BaseBeat, REACT, LEAD_HEAD,} from './cinematicKit';
import { tapSide } from './tapNav';
import EdgeFlash, { useEdgeFlash } from './EdgeFlash';
import WordsToggle from './WordsToggle';
import { useGuideStore, GUIDE_HOLD, isHeld, setOpening, setDrawn } from './lessonGuideState';

/** A graded beat's answer, kept so going back onto it shows it as it was left. */
interface Kept { id: string; ok: boolean; pos: number; pos2: number; sem: number }

// ─────────────────────────────────────────────────────────────────────────────
// The shared cinematic player shell. It owns everything that is identical across
// lessons — the two clocks (a monotonic `clock` for idle life, a beat-local `bt`
// for transitions), the answer-progress value `qv`, the tap-to-advance flow, the
// header, the sequential deck (narration / quote / summary / questions) and the
// LessonReward hand-off — and delegates the animated stage to a per-lesson SCENE.
//
// A lesson is therefore just a SCRIPT (beats) + a SCENE component. The scene reads
// the shared values and renders the figures, props, camera and speech bubbles
// inside a fixed 400×560 design space that this shell scales to fit.
// ─────────────────────────────────────────────────────────────────────────────

export interface SceneApi {
  clock: SharedValue<number>;   // never resets — idle life
  /**
   * Resets each beat — transitions and reveals.
   *
   * GATED BY THE CAMERA (K1). It stops while the camera travels between the beat's
   * stations, so an entrance keyed to it cannot play to a frame pointed elsewhere.
   * A scene gets that by doing nothing; on a beat with no tour it is real seconds,
   * exactly as before.
   */
  bt: SharedValue<number>;
  bi: SharedValue<number>;      // current beat index (worklet-readable)
  /**
   * Which station of the beat's tour the camera is at, 0 when there is no tour.
   *
   * Nothing needs this for the camera to work — K1's gate is what synchronises the
   * scene, and it does so without the scene participating. It is here for the case
   * measurement cannot reach: a reveal that must fire on ARRIVAL rather than after a
   * dwell, which is a thing a scene can only know by being told.
   */
  si: SharedValue<number>;
  qv: SharedValue<number>;      // 0→1 answer progress on the current question beat
  i: number;                    // current beat index (JS)
  beat: BaseBeat;               // current beat (for bubbles etc.)
  picked: string | null;        // which scene target is chosen (null until answered)
  /**
   * Whether the answer given on this beat was the right one — from ANY place it was
   * given, stage or deck. A card's id is its DISPLAY slot and the cards are shuffled
   * (./ChoiceCards), so a scene cannot work this out from `picked` and the script.
   */
  pickedOk?: boolean;
  onPick: (id: string, correct: boolean) => void;  // scene reports a scene-driven answer
  /**
   * The `drag` question's knob position, 0..1 (see ./DragScale). Meaningless on a
   * beat with no `interact.drag`, where it simply holds its last value.
   *
   * A scene reads this to make the ART the thing being dragged rather than a
   * picture sitting next to a slider: the painting cleans, the population fills,
   * the curve grows its wiggles, all on the UI thread under the reader's thumb.
   */
  dragPos: SharedValue<number>;
  /**
   * The second axis of a `field` question, 0..1 from the BOTTOM (./FieldPick).
   * Meaningless on a beat with no `interact.field`, where it holds its last value.
   */
  dragPos2: SharedValue<number>;
  /**
   * WHERE THE ANSWER SITS ON THE QUESTION'S OWN SCALE, 0..1 — for `poll` and
   * `sort`, the two controls that shuffle their options.
   *
   * Read this and NOT `dragPos` on a permuted beat. `dragPos` there is where the
   * control is on the screen — which row, how far the chip has travelled — and
   * the rows are ordered by `ChoiceCards.orderFor`, a per-lesson shuffle that
   * exists so a reader cannot learn "the answer is always the last one". A scene
   * animated off that would move its art in an order the shuffle decided, so the
   * picture would disagree with the words (A1) in exactly the lessons where the
   * shuffle happened to be interesting.
   *
   * This is the index of the option the reader is currently indicating, within
   * the array the AUTHOR wrote, over its own length. It eases between values on
   * the UI thread, so a scene track reading it never covers a whole step in one
   * frame.
   */
  pickPos: SharedValue<number>;
  /**
   * WHERE THE FIGURE SHOULD BE LOOKING on this beat, in stage units, and how much
   * (`gazeOn` is 0 on a beat with no target).
   *
   * Apply it with `lookPose` in place of `pose` — one substitution — or with
   * `moves.gazeAt` directly if the scene needs to aim somewhere of its own. The
   * table is generated by `npm run make:gaze` from what each beat actually draws;
   * see that script for why it is the picture's centre rather than a guess at the
   * beat's subject.
   */
  gazeX: SharedValue<number>;
  gazeY: SharedValue<number>;
  gazeOn: SharedValue<number>;
  /**
   * Whether this lesson is allowed to make a noise (./lessonSound). A scene only
   * needs it to voice something in its own staging — a thing struck, a door, a
   * bell drawn ringing — and since 11 Sep 2026 none of those is heard: a cue fired
   * from a scene is felt if it has a haptic, and never plays over the narration
   * (lib/feedback.ts).
   *
   * Use it sparingly and only where the picture already shows the event. Rule A1
   * runs both ways: a sound for something the scene declined to draw describes a
   * different lesson.
   */
  sound: boolean;
}
export type SceneComponent = ComponentType<SceneApi>;

/** The bed's level under the lesson (AT6), before it is held down for a line. */
const BED_GAIN = 0.55;
/** How long after a line's last word a `tail` sound comes in (AT6). */
const TAIL_AFTER_S = 0.3;
/**
 * AN ANSWER TAPPED ON THE STAGE IS HEARD (AT6), timed to Target's own reaction: a right
 * one is stamped — the seal drops in 180ms after the tap and reaches the paper at 290ms,
 * which is when the stamp is heard — and a wrong one is a soft knock as it starts to
 * sink (60ms). Seconds after the tap.
 */
const PICK_SFX = {
  right: { id: 'seal', at: 0.29, gain: 0.8 },
  wrong: { id: 'knock', at: 0.06, gain: 0.7 },
} as const satisfies Record<string, { id: SfxId; at: number; gain: number }>;

/**
 * Something laid out from the first frame and shown only once the lesson begins (AP19,
 * AI8): the first line during the opening breath, and the tap hint behind the guide. It
 * keeps its place, so nothing reflows when it arrives, and it fades in rather than
 * appearing, so the moment the lesson begins is a fade, not a cut.
 */
function OpeningVeil({ hidden, style, children }: { hidden: boolean; style?: ViewStyle; children: ReactNode }) {
  const o = useSharedValue(hidden ? 0 : 1);
  useEffect(() => {
    o.value = hidden ? 0 : withTiming(1, { duration: VEIL_IN_MS, easing: Easing.out(Easing.cubic) });
  }, [hidden, o]);
  const st = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[style, st]}>{children}</Animated.View>;
}
/** How long the first line and the tap hint take to fade in when the lesson begins. */
const VEIL_IN_MS = 280;

export default function CinematicPlayer({
  lesson, beats, Scene, stageGone = (b) => !!b.summary, band = [BAND_T, BAND_B], walk, gesture, shots,
  camera, ground = GROUND, finish, Chrome,
}: {
  lesson: Lesson;
  /**
   * WHAT HAPPENS INSTEAD OF THE REWARD SCREEN, for the one caller that is not a
   * lesson: a unit review (`data/unitReviews.ts`) is played by this component so it
   * gets every animation a lesson has, and then ends on its own celebration rather
   * than on the XP overlay and a pop back to the branch. Absent — which it is for all
   * 246 lessons — the ending is exactly what it has always been.
   */
  finish?: (r: { xp: number; correct: number; total: number }) => void;
  beats: BaseBeat[];
  Scene: SceneComponent;
  /** Hide the animated stage on some beats (default: the summary). */
  stageGone?: (b: BaseBeat) => boolean;
  /**
   * The [top, bottom] slice of the 400×560 design space this lesson's art occupies.
   * The player crops to it and scales up, so a tighter band means a bigger picture.
   * Must contain every prop the scene draws, or the top/bottom will be clipped.
   */
  band?: [number, number];
  /**
   * The scene's per-beat x track for the walking figure — the same array the scene
   * already builds to drive `travelStance`. Given it, the player knows where the
   * figure is, and would sound a footfall at each foot plant (see ./footfalls) if
   * footfalls were heard. Since 11 Sep 2026 they are not (lib/feedback.ts).
   *
   * OPT-IN PER LESSON rather than read off the beat, because `x` is a field each
   * script declares in its OWN beat interface and nothing guarantees all 102 mean
   * the same thing by it. A scene that hands over its x track is asserting that it
   * drives a single figure through `travelStance` with the default seed — which is
   * the only case these times are correct for.
   */
  walk?: number[];
  /**
   * The scene's per-beat gesture-code track (`P` in most scenes). Given it, the
   * player would sound a hand through the air wherever one genuinely sweeps, if
   * whooshes were heard (since 11 Sep 2026 they are not) — and
   * chooses WHICH of the three gesture sounds by measuring how fast and for how
   * long it moves, so a flick and a swing differ without anyone deciding per beat.
   * See ./gestures.
   *
   * Most poses produce nothing: 14 of the app's 49 are audible gestures and the
   * rest are a held position with a talking hand. A whoosh over a hand that is not
   * moving is the crash-sound mistake with the picture and the sound swapped.
   */
  gesture?: number[];
  /**
   * ONE CAMERA SHOT PER BEAT — where the reader is standing while it plays.
   *
   * Omit it and the scene mounts exactly as it always has: no wrapper view, no
   * transform, no derived value recomputed every frame. The camera is opt-in
   * because 101 lessons should not pay for a feature one of them uses.
   *
   * See ./camera.ts for the geometry, and `checkShots` for the rules — the one
   * that matters is that a shot may never scale below 1, because the lesson's
   * BAND was measured at 1 and anything wider shows paper nobody drew.
   */
  shots?: Shot[];
  /**
   * The camera as VERBS rather than coordinates — see `Move` in ./camera.ts.
   *
   * Resolved here rather than in the scene because the numbers depend on the
   * lesson's own band and ground, and the player is the only place that knows
   * both. A scene says "push on the figure"; what that means in pixels is worked
   * out against the band it declared two props ago.
   *
   * Wins over `shots` if a lesson passes both, which no lesson should.
   */
  camera?: Move[];
  /**
   * The scene's ground line, if it is not the kit's GROUND. Only used by `camera`.
   *
   * DEFAULTED, not left undefined, and that is the whole point of it. No scene has
   * ever passed this prop, so `resolveMoves` was handed `undefined` and fit() threw
   * away its ground clamp — the one that stops a push ending the frame ABOVE the
   * line the figure is standing on. `followMoves` defaults the same value, and
   * validate-cinematic assumed it, so the checker was resolving with the clamp and
   * the app was resolving without it: three beats of ethicsScene shipped with the
   * bottom of the frame up to 37 units clear of the ground, the man standing on
   * nothing, and every validator called it clean. A default that two of three
   * callers already assume is not a default, it is a missing one.
   */
  ground?: number;
  /**
   * A second scene layer drawn in stage coordinates but OUTSIDE the camera.
   *
   * Optional, and no lesson passed one before logic-arguments-1 — so every other
   * lesson mounts exactly as it always did, with no extra element in the tree.
   *
   * It exists because the shared player could not express a composition the
   * bespoke players could, and that gap is what kept those two lessons on their
   * own 1,474- and 945-line copies of this file (and therefore outside every
   * corpus-wide pass and 9 of the validators). logic-arguments-1 teaches from a
   * framed easel, a scoreboard and a Socratic exchange that hold ONE size on
   * screen while the camera pushes from 1.21× to 1.58× on the figures below them:
   * diagrams a reader keeps reading while the shot moves. Inside the camera they
   * would zoom and clip; the only way to keep them still is to draw them where
   * the camera is not.
   *
   * It is clipped by the band and scaled by `fit` like everything else, so its
   * coordinates are the same stage coordinates the scene uses — which is what
   * makes a band measured across both layers (see that lesson's THE BAND note)
   * still the right band.
   *
   * WHAT IT MUST NOT DO is register tap targets: it sits outside
   * `TargetCountProvider` on purpose, because a target's box is reported in
   * camera space to frame the shot, and a fixed-screen target has no such box.
   * Answers belong in the scene.
   */
  Chrome?: SceneComponent;
}) {
  // THE LESSON'S OWN STAGE PALETTE, for the two controls that draw objects
  // (`order` and `odd`). It is the same tone every scene in this branch is struck
  // in, derived here rather than passed, so a control cannot declare a colour.
  const questionTone = stageTone(branchOfLesson(lesson.id));
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const showReward = useUIStore((s) => s.showReward);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  // WHICH NAME IS OPEN in the deck, or null. Beat-local: it is cleared whenever
  // the beat changes, because a card belonging to a paragraph the reader has
  // already advanced past is a card about nothing on screen.
  const [peek, setPeek] = useState<string | null>(null);
  // Where the tapped name sits, so the snapshot's leader line can hang under it.
  const [peekX, setPeekX] = useState(0);

  // THE MAXIM, IF THIS LESSON HAS ONE. It lives in a table rather than on the
  // beat so that authoring it never restamps a lesson's must-see boxes — see
  // data/lessonFocus.ts for why that matters and what `check:focus` holds.
  const lessonFocus = LESSON_FOCUS[lesson.id];
  const focus = lessonFocus && lessonFocus.beat === i ? lessonFocus.phrase : undefined;
  const [pickedOk, setPickedOk] = useState(false);
  // EVERY ANSWER, BY BEAT. The reader can go back now (tapNav.ts), and a question they
  // have answered comes back exactly as they left it — their pick, its verdict, the
  // control where they set it — and locked, so it is scored once and going back can
  // never be used to change a score. The owner's choice over re-asking it.
  const kept = useRef<Record<number, Kept>>({});
  /** The beat just answered on this visit (AT4), as against one that came back answered. */
  const answeredHere = useRef(-1);
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  // How many outlined things the scene is currently offering, counted by the
  // Targets themselves (see Target.tsx) so no lesson has to declare it and none
  // can declare it wrongly. Feeds the interact panel's hint. ABOVE the early
  // return below, like every other hook here — see the note on that return.
  const [targetCount, setTargetCount] = useState(0);
  const [done, setDone] = useState(false);
  const [boxSize, setBoxSize] = useState({ w: 0, h: 0 });
  // THE STAGE HAS DRAWN (AI8). Until the stage has measured itself it draws nothing, so
  // the route keeps the loader over it; two frames after the measure, the picture is on
  // screen, and the loader may lift off it (LoaderHandoff). Above the early return.
  const measured = boxSize.w > 0;
  useEffect(() => {
    if (!measured) return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setDrawn(true)); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [measured]);
  // Which beat's content the DECK is currently showing. It lags `i` by the fade-out,
  // because the deck keeps the outgoing beat on screen until it has faded to nothing
  // — see `gone` below.
  const [shown, setShown] = useState(0);

  const beat = beats[i];

  // ── sound ──────────────────────────────────────────────────────────────────
  // One flag for the whole lesson, read once (see ./lessonSound). `run` counts
  // consecutive right answers so the note climbs the triad; it is a ref, not
  // state, because it is only ever read at the instant a cue fires and a stale
  // closure would sound the wrong note.
  const sounded = lessonHasSound(lesson.id);
  const run = useRef(0);
  // A footfall or a whoosh is only scheduled if it is HEARD (lib/feedback.ts).
  // Since 11 Sep 2026 neither is, so nothing plays over the narration, and the
  // per-frame reaction below finds two empty tracks and returns at once.
  const plants = useMemo(
    () => (sounded && walk && heard('step') ? footfallTrack(walk) : { steps: [], settle: [] }),
    [sounded, walk],
  );
  const gestures = useMemo(() => {
    if (!sounded || !gesture || !heard('whoosh')) return [];
    // A beat either walks or gestures — never both (see ./gestures).
    const walked = gesture.map((_, k) => !!walk && k > 0 && Math.abs(walk[k] - walk[k - 1]) > 1);
    return swishTrack(gesture, walked, beats.map((b) => b.dur));
  }, [sounded, gesture, walk, beats]);

  // ── narration ──────────────────────────────────────────────────────────────
  // The lesson read aloud, one clip per spoken beat (lib/narration). Only a lesson in
  // the manifest has any of this: every other lesson gets no voice, no button and no
  // extra work. The voice follows `shown` rather than `i`, because the paragraph it
  // reads appears when the deck swaps; a tap cuts the line it interrupts at once.
  const narrated = narration.isSupported() ? NARRATION[lesson.id] : undefined;
  const narrationOn = useUserDataStore((s) => s.settings.narration);
  const setUserSetting = useUserDataStore((s) => s.setSetting);
  useEffect(() => {
    if (!narrated) return;
    narration.prepare(lesson.id);
    return () => narration.release();
  }, [narrated, lesson.id]);
  useEffect(() => {
    if (narrated) narration.stop();
  }, [i, narrated]);
  // The lesson guide holds the voice as well as the clock: the first line is not
  // spoken to a reader still reading the guide (lessonGuideState.ts). So does the
  // opening breath (AP19), the moment after the lesson appears and before it begins.
  const guideOpen = useGuideStore(isHeld);
  const opening = useGuideStore((s) => s.opening);
  useEffect(() => {
    if (!narrated) return;
    const line = narrated[shown];
    if (narrationOn && !done && !guideOpen && line && beats[shown]?.text === line.text) {
      // A LINE THAT WAITS FOR ITS SOUND (AT6): `voiceAfter` gives a `lead` effect (a door,
      // a crowd) its moment before anyone speaks, so the two never overlap.
      const wait = beats[shown]?.voiceAfter ?? 0;
      if (wait <= 0) { narration.play(lesson.id, shown); return; }
      narration.stop();
      const h = setTimeout(() => narration.play(lesson.id, shown), wait * 1000);
      return () => clearTimeout(h);
    }
    narration.stop();
  }, [narrated, narrationOn, shown, done, guideOpen, lesson.id, beats]);

  // ── SOUND EFFECTS AND THE BED (LESSON_RULES AT6) ─────────────────────────────
  // Only a lesson whose script declares one has any of this. `lead` is at the beat's
  // start, before a line that waits for it; `tail` once the line has been said; a number
  // is seconds on the BEAT clock, when the action it belongs to happens on the stage —
  // under a line only if it is quiet foley, never a crowd (check:sfx). The bed is a loop
  // under everything, held down while a line is said, and follows `shown`, like the
  // voice. An answer tapped on the stage is heard too: the seal strikes on a right one,
  // a finger taps a wrong one (PICK_SFX).
  const usesSfx = useMemo(() => beats.some((b) => !!b.sfx || b.bed !== undefined), [beats]);
  const sfxOn = useUserDataStore((s) => s.settings.soundEffects !== false) && sounded && sfx.isSupported();
  useEffect(() => {
    if (!usesSfx) return;
    const ids = new Set<SfxId>([PICK_SFX.right.id, PICK_SFX.wrong.id]);
    for (const b of beats) {
      for (const c of b.sfx ?? []) ids.add(c.id);
      if (b.bed) ids.add(b.bed);
    }
    sfx.prepare([...ids]);
    return () => sfx.release();
  }, [usesSfx, beats]);
  // The timed cues of every beat, in order — what the beat clock fires (see `cueAt`).
  const timedCues = useMemo(
    () => beats.map((b) => (b.sfx ?? []).filter((c) => typeof c.at === 'number').sort((a, b2) => (a.at as number) - (b2.at as number))),
    [beats],
  );
  const sfxLive = useRef({ on: false, beat: 0 });
  sfxLive.current = { on: usesSfx && sfxOn && !done, beat: i };
  const soundCue = useCallback((beat: number, k: number) => {
    const live = sfxLive.current;
    if (!live.on || beat !== live.beat) return;
    const c = timedCues[beat]?.[k];
    if (c) sfx.play(c.id, c.gain ?? 1);
  }, [timedCues]);
  // A NEW BEAT SILENCES THE LAST ONE'S EFFECTS AT ONCE — on the beat, not on the text
  // swap that follows it, because the beat clock starts here and so do its cues: hushed
  // any later, a cue early in the new beat would be faded out by its own beat's arrival.
  useLayoutEffect(() => {
    if (usesSfx) sfx.hush();
  }, [i, usesSfx]);

  const clock = useSharedValue(0);
  // TWO BEAT CLOCKS, AND WHICH IS WHICH IS THE WHOLE OF K1.
  //
  //   rt  RAW. Real seconds since the beat opened. The CAMERA runs on this, because
  //       the camera is the one thing that must keep moving while everything waits.
  //   bt  GATED. What the SCENE is handed, and it does not advance while the camera
  //       is in transit between stations. A scene animating on `bt` therefore cannot
  //       play an entrance to a frame that is pointed somewhere else — without the
  //       scene knowing a camera exists, which is what makes this reach all 102 of
  //       them without one being edited.
  //
  // With no tour on the beat the two are equal to the sample, so every un-toured beat
  // in the app is bit-for-bit unchanged.
  const rt = useSharedValue(0);
  /**
   * How fast the camera catches the shot it is being asked for (seconds).
   *
   * 0.10 is short enough that an authored move — the quickest is a ~0.45s push —
   * still reads as that move rather than as a lag, and long enough that a
   * one-frame step in the request (a box landing, a tour warp, a beat change
   * mid-travel) is spread over about six frames, which the eye reads as motion
   * instead of a cut.
   */
  const CAM_OMEGA = 12;
  /** What the camera last actually drew, and the shot a new beat travels from. */
  const camHold = useSharedValue({ cx: 0, cy: 0, s: 1, has: 0 });
  const camFrom = useSharedValue({ cx: 0, cy: 0, s: 1, has: 0 });
  const camSeen = useSharedValue(-1);
  const bt = useSharedValue(0);
  const bi = useSharedValue(0);
  /** Which station the camera is at (or travelling toward). Scenes may key reveals to it. */
  const si = useSharedValue(0);
  const qv = useSharedValue(0);
  // The `drag` knob, 0..1. Owned HERE rather than inside DragScale so the scene can
  // read the same value and animate its art under the reader's thumb (see
  // ./DragScale). Reset to the beat's declared start whenever a drag beat opens, or
  // the second drag question in a lesson would begin wherever the first was left.
  const dragPos = useSharedValue(0);
  // THE SECOND AXIS, for `field` (see ./FieldPick). Two shared values rather
  // than one packed coordinate: a scene that had to unpack a number would be
  // doing arithmetic on the UI thread to undo a decision made in the control.
  const dragPos2 = useSharedValue(0);
  // ── WHERE THE ANSWER SITS, AS OPPOSED TO WHERE THE CONTROL SITS ────────────
  //
  // `dragPos` is the control's own position, and for `drag`, `split` and `plot`
  // that IS the answer: the rail's left end means what the author said it means.
  // For `poll` and `sort` it is not, because both PERMUTE their options through
  // `ChoiceCards.orderFor` — a fairness device, added because the lever these
  // questions came from put its answer in the last slot 70% of the time.
  //
  // So on those two, `dragPos` is display space: "the second row from the top",
  // "the chip is 60% across the pad". A scene driving its art from that would
  // move the picture in an order decided by a shuffle, which is worse than not
  // moving it at all — it would be a picture that disagrees with the words (A1).
  //
  // `pickPos` is the same reading in the QUESTION's own space: 0..1 across the
  // options in the order the author wrote them. It is what a scene reads on a
  // permuted beat, and it is eased rather than snapped so a scene track cannot
  // cover a whole step between two frames.
  const pickPos = useSharedValue(0);
  // ── WHERE HE IS LOOKING ────────────────────────────────────────────────────
  //
  // `moves.gazeAt` has existed since the rig was written and no scene has ever
  // called it, so for 186 lessons the figure has narrated a diagram he never once
  // looked at. The target is generated per beat by `npm run make:gaze` — the
  // area-weighted centre of everything the beat draws that is not him — and lives
  // on the player rather than in 186 scripts so that a prop moving re-derives it
  // instead of orphaning an authored coordinate (the W5 argument).
  //
  // Eased on a beat change rather than cut, because a head that snaps to a new
  // angle between two frames is L1 with a neck instead of a limb.
  const gazeX = useSharedValue(STAGE_W / 2);
  const gazeY = useSharedValue(STAGE_H / 2);
  const gazeOn = useSharedValue(0);

  // The lead's published head (LEAD_HEAD, cinematicKit) is a module-level singleton,
  // like `REACT` — one lesson plays at a time — so a scene that never poses its lead
  // through lookPose must not inherit the last lesson's. Put back when a player goes.
  useEffect(() => () => { LEAD_HEAD.value = [0, 0, 0]; }, []);

  // The foot-plant times for the walk into the current beat, how many have already
  // sounded, and when the walk comes to rest (−1 if it ends mid-stride). Numbers
  // only — a JS closure cannot cross into a worklet (§17).
  const plantAt = useSharedValue<number[]>([]);
  const planted = useSharedValue(0);
  const settleAt = useSharedValue(-1);
  const settled = useSharedValue(0);
  // Gesture times and, in a parallel array, WHICH of the three sounds each one is.
  // Two number arrays rather than an array of objects: numbers cross into a
  // worklet cleanly and nothing else has to.
  const swishAt = useSharedValue<number[]>([]);
  const swishKind = useSharedValue<number[]>([]);
  const swished = useSharedValue(0);
  // A beat's timed sounds (AT6): their times on the BEAT clock, in order, and how many
  // have sounded. They fire off `bt` for the reason footfalls did: the picture they
  // belong to is drawn off `bt`, so a dropped frame delays the sound with the action.
  const cueAt = useSharedValue<number[]>([]);
  const cued = useSharedValue(0);
  // Progress fills SMOOTHLY toward the next mark rather than jumping on each tap.
  const progress = useSharedValue((i + 1) / beats.length);
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  // THE CAMERA. Two rules govern where this block can live, and it has to satisfy
  // both — it originally satisfied only the first.
  //
  // 1. ABOVE `if (done) return null` (§17 rule 1), like every other hook here.
  // 2. BELOW `bt` and `bi`, which it reads. This is the one that bit. The block
  //    sat above them, and `useDerivedValue` runs its worklet IMMEDIATELY to
  //    establish an initial value — so it reached `bi` in the temporal dead zone
  //    and threw `Cannot access 'bi' before initialization`, taking the whole
  //    tree down to a grey screen with no way out.
  //
  //    It broke exactly one lesson, which is why it shipped. The guard on the
  //    first line returns before touching `bi` when a lesson passes no shots, and
  //    ethics-ethics-8 is the only lesson with a camera — so 101 lessons ran the
  //    worklet's early return and were fine, and the 102nd crashed every time.
  //    A hook's position relative to the values it READS is as load-bearing here
  //    as its position relative to the early return.
  //
  // It travels from the PREVIOUS beat's shot to this one over `to.tr` seconds,
  // driven by `bt` — the beat clock — so a move that accompanies a walk is paced
  // by the same clock the feet are, and a dropped frame slows both together.
  // Verbs become coordinates ONCE, not every frame: resolveMoves does real work
  // (it iterates fit() until each shot is legal) and the answer only changes when
  // the lesson does. `shots` still wins for a hand-written list.
  const cam = useMemo(
    () => (shots && shots.length ? shots : camera && camera.length ? resolveMoves(camera, band, ground) : null),
    [shots, camera, band, ground],
  );
  /**
   * WHETHER THIS LESSON WROTE ITS OWN SHOTS, WHICH DECIDES WHETHER A BEAT MAY HOLD.
   *
   * See the hold branch below. A generated camera says "hold" by leaving a beat out
   * of the tour table; an authored one has a shot on every beat and means every one
   * of them.
   */
  const authored = !!(shots && shots.length);

  // ── WHATEVER THE READER HAS TO TAP MUST BE IN THE SHOT ─────────────────────
  //
  // A camera verb takes a POINT (`at: [x, y]`), so nothing in the shot maths ever
  // knew how big the thing at that point was — which is how a push framed the
  // figure and cropped half an answer plate off the top right of the screen.
  //
  // The targets measure themselves against the camera view (see Target.tsx) and
  // report a union box in scene coordinates. `containShot` then pulls the shot
  // only as far as it must for that box to fit: the scale can come DOWN but never
  // up, and the centre slides the shortest distance that brings it in. A shot that
  // was already wide enough is returned untouched, which is why the camera work on
  // every other beat is unaffected.
  //
  // THE FALLBACK MATTERS AS MUCH AS THE FIX. Until a box has been reported for an
  // interactive beat — the first frames of it, or if `measureLayout` ever fails on
  // some device — the shot is NEUTRAL, the whole declared band, which cannot crop
  // anything the scene draws. So the failure mode is a blunt frame, never an
  // unreachable button.
  const targetBox = useSharedValue<Box | null>(null);
  const onBox = useCallback((b: Box | null) => { targetBox.value = b; }, [targetBox]);
  const camHost = useRef(null);
  const needsBox = useMemo(() => beats.map((b) => !!b.interact), [beats]);
  // WHICH GRADED QUESTION EACH BEAT IS, from 1, and how many the lesson asks. The
  // kicker prints "QUESTION 1 OF 2". Above the early return, like every hook here.
  const [qIndex, qTotal] = useMemo(() => {
    let c = 0;
    const at = beats.map((b) => (b.interact ? (c += 1) : 0));
    return [at, c] as const;
  }, [beats]);
  /**
   * Beats where the camera PARKS at its own framing instead of holding the last one.
   *
   * A graded beat (K6) and the summary, and nothing else. The generator makes exactly
   * the same assumption when it walks a lesson's path — it resets its idea of where
   * the camera is on these two — so if this list and that one ever disagree, the
   * table's holds start meaning something the player does not do.
   */
  const stageGoneAt = useMemo(() => beats.map((b) => stageGone(b)), [beats, stageGone]);

  // ── AND WHATEVER THE READER HAS TO READ (H60c) ─────────────────────────────
  //
  // Answer targets were the only thing that ever reported a box, so on every
  // other beat the camera framed the lesson's own labels by luck — and a browser
  // sweep says luck lost: 8 of 8 lessons sampled were slicing words in half, 285
  // elements, and the same 8 with the camera switched off came back with 6.
  // metaphysics-being-7 was cutting "PAST", "NOW" and "FUTURE", which are the
  // three things that lesson is entirely about.
  //
  // `MUST` is the union of the words each beat has on stage, in scene
  // coordinates, measured from the real render by scripts/measure-must.mjs — the
  // scenes draw their labels as raw <Text> with local styles, so there was no
  // reporting component to hang this on and no honest way to hand-author 800
  // rectangles. A beat may still override with its own `must`, which wins.
  //
  // It only ever loosens (see containShot), so this cannot break a shot that was
  // already correct: those are returned identical.
  const musts = useMemo(() => {
    const table = MUST[lesson.id];
    return beats.map((b, k) => {
      const m = b.must ?? table?.[k] ?? null;
      return m ? { x: m[0], y: m[1], w: m[2], h: m[3] } : null;
    });
  }, [beats, lesson.id]);

  // ── THE TOUR (group K) ─────────────────────────────────────────────────────
  //
  // A beat's stations, resolved to legal shots ONCE. `tourShots` iterates `fit` per
  // station and the answer only changes when the lesson does, so doing it per frame
  // would be the same waste `resolveMoves` was moved out of the frame path to avoid.
  //
  // A beat may carry its own `tour` and it wins over the generated table (K10) — the
  // override for what measurement cannot see. A GRADED BEAT IS REFUSED A TOUR HERE
  // as well as in the generator: K6 is the rule that answer targets take the identity
  // transform, and a hand-written override is exactly the route by which that would
  // otherwise be lost.
  const tourData = useMemo(() => {
    const table = TOURS[lesson.id];
    return beats.map((b, k) => {
      const raw = (b as BaseBeat & { tour?: readonly (readonly number[])[] }).tour ?? table?.[k] ?? null;
      // ONE STATION IS A TOUR. This read `raw.length < 2` and was harmless for as long
      // as K3 forced every tour to end on the beat's whole must-box, which made two
      // the minimum any generator could emit — "fewer than two" meant "degenerate".
      // With the lap gone the ordinary tour is a SINGLE station the camera moves to
      // and holds, so that guard silently discarded 300 of them: generated, validated,
      // written to the table, and dropped here. The lesson looked exactly as it had.
      // A condition whose meaning depends on a rule elsewhere goes stale without ever
      // failing.
      if (!raw || raw.length < 1 || needsBox[k] || toursOff()) return null;
      const tour: Tour = raw.map((s) => ({
        box: { x: s[0], y: s[1], w: s[2], h: s[3] },
        // A follow station carries where its subject has got to by the end (K9).
        // Six numbers is a static station, ten is a tracking one.
        ...(s.length >= 10 ? { to: { x: s[6], y: s[7], w: s[8], h: s[9] } } : {}),
        tr: s[4],
        dwell: s[5],
      }));
      return {
        shots: tourStartShots(tour, band, ground),
        ends: tourEndShots(tour, band, ground),
        follow: tour.map((t) => (t.to ? 1 : 0)),
        trs: tour.map((t) => t.tr),
        dwells: tour.map((t) => t.dwell),
      };
    });
  }, [beats, lesson.id, band, ground, needsBox]);

  /**
   * When the closing travel begins, per beat — where a tap fast-forwards to (K7).
   *
   * Not the end of the tour: landing the reader ON the final shot would make an
   * impatient tap a hard cut. Warping to the start of the last travel resolves every
   * station's content at once and lets the camera glide out over its own final move,
   * which reads as winding forward rather than as a jump.
   *
   * ── AND ON A ONE-STATION TOUR THAT ARITHMETIC SAYS THE OPPOSITE ────────────
   *
   * `tourEnd - trs[last]` is the start of the closing travel only while there is
   * something before it. With ONE station it comes out as that station's own dwell
   * — which is past the only travel there is — so the warp landed the reader
   * exactly ON the final shot: the hard cut this rule exists to prevent, produced
   * by the rule itself.
   *
   * Every tour in the app is now a single station (201 of them, 1.00 per toured
   * beat). The shape changed when the lap was removed — the comment fifty lines up
   * says so, and describes a guard that went stale the same way — and this
   * expression kept computing an answer for the old one. A reader tapping while
   * the camera was still travelling saw it jump the rest of the way and then pull
   * straight back out, and reported it as the screen resetting.
   *
   * There is nothing to resolve in a one-station tour: no later station is holding
   * content back. So there is nothing to skip, and letting the beat simply advance
   * is smooth for free — `camFrom` carries the camera from wherever it had got to.
   */
  const tourSkip = useMemo(
    () => tourData.map((t) => (t && t.trs.length > 1
      ? tourEnd(t.trs, t.dwells) - t.trs[t.trs.length - 1]
      : 0)),
    [tourData],
  );

  const camNow = useDerivedValue(() => {
    if (!cam || cam.length === 0) return NEUTRAL;
    const n = Math.min(Math.max(bi.value, 0), cam.length - 1);
    const box = targetBox.value;
    const frame = (k: number) => {
      'worklet';
      // A REPORTED BOX WINS ON ANY BEAT, not just a question (H60c).
      //
      // This used to read `if (!needsBox[k]) return cam[k]` — so a box reported on
      // a plain, quote or summary beat was computed, handed over, and then thrown
      // away, and the only thing the camera would frame for was an answer target.
      // That left every OTHER thing a reader is told to look at — a diagram being
      // built, a labelled prop, an animation the text points at — at the mercy of
      // whatever push `followMoves` happened to deal that beat, which can be 1.24×.
      //
      // Now: if the scene has said "this is the thing", the shot contains it.
      // `containShot` only ever loosens — the scale comes down to fit and the
      // centre slides the shortest distance — so a beat whose shot already showed
      // its box is returned untouched and the authored camera work is unaffected.
      // The tappable things and the readable things are both must-sees, so the
      // shot has to hold BOTH — union them rather than letting one win. Applied
      // as two successive contains, which is the same thing: each only loosens.
      const must = musts[k];
      if (box) {
        const s1 = containShot(cam[k], box, band);
        return must ? containShot(s1, must, band) : s1;
      }
      if (must && !needsBox[k]) return containShot(cam[k], must, band);
      // NO BOX YET — AND THE STATIC ONE IS ALREADY GOOD ENOUGH TO FRAME WITH.
      //
      // This used to drop a question beat straight to NEUTRAL until `measureLayout`
      // came back, then switch to the contained shot the frame it landed. That step
      // is what a reader described as the camera "moving to a spot first that isn't
      // right and then adjusting to be in the right spot" — it was literally framing
      // the whole band for a few frames and then correcting.
      //
      // But the measured must-see box (H60c) is known at MODULE LOAD, not
      // asynchronously, and on an interactive beat it already contains the answer
      // targets, because they are things the scene drew. So frame with it
      // immediately. The async box then only ever loosens further, which is a
      // small correction rather than a jump — and the NEUTRAL fallback survives
      // only for a beat with no measured box at all, where a blunt frame really is
      // better than an unreachable answer.
      if (needsBox[k]) return must ? containShot(cam[k], must, band) : { ...NEUTRAL, tr: cam[k].tr };
      return cam[k];
    };
    // A BEAT WITH NOTHING TO GO TO KEEPS THE SHOT IT HAS.
    //
    // This is the other half of the sequential path (see lessonTours): the generator
    // decides a lesson's framings knowing where each beat leaves the camera, and a
    // `null` in the table means "the next thing to see is already in front of you".
    // The player has to honour that, or the two disagree and the disagreement is the
    // bounce — the generator holding while the player pulls back out to the whole
    // stage, then pushes in again on the next beat that has a subject.
    //
    // Graded beats are the exception and not a negotiable one: an answer target is a
    // Pressable, and K6 requires the identity transform, or the tap has to survive a
    // camera offset to land on what the reader aimed at. The summary hides the stage
    // anyway. Both are what `frame` returns.
    const parks = (k: number) => {
      'worklet';
      return needsBox[k] || stageGoneAt[k];
    };
    // Where a beat LEAVES the camera: its tour's last station if it has one, else the
    // single shot. This is what the next beat travels from, and getting it wrong is
    // what would make every toured beat begin with a snap back to the un-toured
    // framing before setting off again.
    const restOf = (k: number) => {
      'worklet';
      const t = tourData[k];
      return t ? t.ends[t.ends.length - 1] : frame(k);
    };

    // ── THE TRAVEL STARTS FROM WHERE THE CAMERA IS (group L) ────────────────
    //
    // `restOf(n-1)` is where the previous beat was SUPPOSED to leave the camera. If
    // the reader tapped before it got there — or fast-forwarded a tour, or the beat
    // was still travelling — the camera was never at that shot, and starting the new
    // travel from it teleports the whole stage before setting off. This is the
    // camera's exact analogue of the pose defect group L fixed in the figure, and
    // the cure is the same: remember what was actually drawn and travel from that.
    //
    // The downstream spring would smooth this over, but smoothing a jump is not the
    // same as not jumping: the spring would be absorbing a step on nearly every
    // beat change, which is what makes an authored move arrive late and soft. With
    // the source correct the spring has almost nothing left to do, which is the
    // point — it is there for the cases nothing can predict, not as the mechanism.
    if (camSeen.value !== n) {
      camSeen.value = n;
      camFrom.value = camHold.value;
    }
    const carried = camFrom.value;
    const startFrom = (k: number) => {
      'worklet';
      return carried.has ? { cx: carried.cx, cy: carried.cy, s: carried.s } as Shot : restOf(k);
    };

    const tour = tourData[n];
    if (tour) {
      const a = tourAt(tour.trs, tour.dwells, rt.value);
      // ARRIVED, AND THE SUBJECT IS WALKING (K9). The camera goes with it instead of
      // parking — one continuous station whose target moves, at a fixed scale, which
      // is why this is a slide and not a second travel.
      if (a.p > 0 && tour.follow[a.k]) {
        const out = trackAt(tour.shots[a.k], tour.ends[a.k], a.p / Math.max(0.001, tour.dwells[a.k]));
        camHold.value = { cx: out.cx, cy: out.cy, s: out.s, has: 1 };
        return out;
      }
      // Only the FIRST station travels from the carried shot; the later ones travel
      // from the station the camera genuinely just left, which it did reach.
      const from = a.k > 0 ? tour.ends[a.k - 1] : startFrom(n > 0 ? n - 1 : n);
      const out = shotAt(from, tour.shots[a.k], a.t);
      camHold.value = { cx: out.cx, cy: out.cy, s: out.s, has: 1 };
      return out;
    }
    if (!authored && !parks(n) && carried.has) {
      // HOLD. Not a travel of zero length — no interpolation at all, so there is
      // nothing for a rounding error or a clock reset to shake loose.
      //
      // AND IT MUST NOT APPLY TO AN AUTHORED SHOT LIST, WHICH IS HOW EVERY SHOT IN
      // logic-arguments-1 AND -2 CAME TO BE INERT. The rule below is about the
      // GENERATED camera, where a beat left out of the tour table means "the next
      // thing to see is already in front of you" — there is genuinely nothing to
      // travel to. A lesson that hands over a `shots` array has written one shot per
      // beat and means all of them, so holding here threw every one away and pinned
      // the camera to beat 0's framing for the whole lesson.
      //
      // A reader found it from the outside, on the first lesson in Logic: *"I cannot
      // see the stickman when he arrives on screen and then after he just appears in
      // the middle."* His entrance depends on the camera pulling back from the fight
      // (1.54 → 1.22) while he walks in, and the pull-back never happened — measured
      // beat by beat, the window was 69…331 on all nine beats of a lesson whose
      // table asks for five different framings. `check:camera` reads that table and
      // is right about every number in it; nothing checked that the numbers arrive.
      // This is the same class as the 197 stations whose travel time never reached
      // `shotAt`, and the fourth time §17 has recorded it: generated, validated,
      // written to a table, and then not used.
      const h = { cx: carried.cx, cy: carried.cy, s: carried.s };
      camHold.value = { ...h, has: 1 };
      return h;
    }
    const out = shotAt(startFrom(n > 0 ? n - 1 : 0), frame(n), rt.value);
    camHold.value = { cx: out.cx, cy: out.cy, s: out.s, has: 1 };
    return out;
  });
  // ── THE CAMERA IS DRIVEN DIRECTLY, AND THE SPRING IS GONE ──────────────────
  //
  // There used to be a critically-damped spring here chasing `camNow`, hired when the
  // requested shot was discontinuous in four separate places. Those four are now all
  // fixed at source — the travel carries the shot actually drawn, a question beat
  // frames with its static must-box immediately, a tap no longer warps the clock out
  // from under a travel, and a beat with nothing to go to simply holds. The request
  // is continuous, and smoothing something already smooth only costs lag.
  //
  // And lag was exactly what a reader then reported, twice over:
  //
  //   · **"the camera zooms in and the thing is on the left side, then over a little
  //     bit of time it corrects to the center."** That is the spring settling. The
  //     travel had arrived; the spring had not, so the frame drifted into place after
  //     the move was supposed to be over.
  //   · **"it sees the movement and then moves after — I want it to move WITH the
  //     stickman walking."** A chase has a steady-state error against a moving target.
  //     Feeding the target's velocity forward shrank it and could not remove it,
  //     because a measured velocity is always a frame behind.
  //
  // Both are the same sentence: a follower cannot be in two places at once, and the
  // place the reader wants it is the requested one. `shotAt` already eases every
  // travel out of rest and back into it (smoothstep, geometric on scale), so the
  // motion is smooth without anything chasing it — and it ARRIVES, on the frame it
  // was supposed to, centred.
  const camStyle = useAnimatedStyle(() => {
    const c = camNow.value;
    return {
      transform: [
        { translateX: STAGE_W / 2 - c.cx * c.s },
        { translateY: STAGE_H / 2 - c.cy * c.s },
        { scale: c.s },
      ],
    };
  });

  // Rewind the beat clock DURING RENDER (not in an effect): an effect paints one
  // frame of the previous beat's finished state first, which reads as a pop.
  const prevBeat = useRef(-1);
  if (prevBeat.current !== i) {
    prevBeat.current = i;
    rt.value = 0;
    bt.value = 0;
    bi.value = i;
    si.value = 0;
    qv.value = 0;
    // Re-arm the footfalls alongside the clock they are measured against, in the
    // same statement that rewinds it — anything later would leave one frame in
    // which the new beat's clock is being compared to the old beat's step times.
    plantAt.value = plants.steps[i] ?? [];
    planted.value = 0;
    settleAt.value = plants.settle[i] ?? -1;
    settled.value = 0;
    const g = gestures[i] ?? [];
    swishAt.value = g.map((x) => x.at);
    swishKind.value = g.map((x) => x.kind);
    swished.value = 0;
    cueAt.value = (timedCues[i] ?? []).map((c) => c.at as number);
    cued.value = 0;
    // AN ANSWERED BEAT RETURNS WITH ITS CONTROL WHERE THE READER LEFT IT — in the
    // same statement that rewinds the clock, so the control and the scene that reads
    // it (R7c) never draw one frame at the question's starting position first.
    const was = kept.current[i];
    if (was) {
      dragPos.value = was.pos;
      dragPos2.value = was.pos2;
      pickPos.value = was.sem;
    }
  }

  useFrameCallback((f) => {
    'worklet';
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;
    clock.value += dt;
    // THE BEAT WAITS BEHIND THE LESSON GUIDE: its clock holds at the first frame
    // while `clock` runs on, so the figure still breathes behind the glass and the
    // opening plays from its start once the guide lifts (lessonGuideState.ts).
    if (!GUIDE_HOLD.value) rt.value += dt;
    // K1 — THE SCENE'S CLOCK IS DERIVED, NOT ACCUMULATED. `bt` used to be `+= dt`
    // like the other two; it is now a function of the raw clock and the beat's tour,
    // which is what freezes it while the camera travels. Derived rather than
    // conditionally incremented on purpose: an accumulator that skips frames drifts
    // from the camera it is supposed to be synchronised with, and the footfall times
    // (which are measured against `bt`) would drift with it.
    const n = Math.min(Math.max(bi.value, 0), tourData.length - 1);
    const t = n >= 0 ? tourData[n] : null;
    if (t) {
      const a = tourAt(t.trs, t.dwells, rt.value);
      bt.value = a.g;
      si.value = a.k;
    } else {
      bt.value = rt.value;
      si.value = 0;
    }
  }, true);

  // A FOOTFALL LANDS ON THE BEAT CLOCK, NOT THE WALL CLOCK. `bt` accumulates frame
  // deltas, so if the device drops frames the figure walks slower — and a footstep
  // scheduled by setTimeout would march on ahead of the feet. Comparing against the
  // very value that positions them means the sound cannot get out of step.
  //
  // Costs one array-length comparison per frame in the 101 lessons that pass no
  // walk track, because `plantAt` stays empty and this returns immediately.
  const footfall = useCallback(() => cue('step'), []);

  const gestured = useCallback((kind: number) => cue('whoosh', kind), []);
  useAnimatedReaction(
    () => bt.value,
    (t) => {
      const list = plantAt.value;
      let k = planted.value;
      if (k < list.length) {
        while (k < list.length && t >= list[k]) k += 1;
        if (k !== planted.value) {
          planted.value = k;
          // Once per frame however many plants elapsed: two thuds in one frame is
          // a stumble, and dropping the extra is the honest repair for a stall.
          runOnJS(footfall)();
        }
      }
      // NOTHING WHEN THE WALK STOPS. There was a soft placement here to keep a
      // walk from ending dead. It was not necessary — the last footfall already
      // ends it — and one more small sound in a lesson full of them is one too
      // many. `footfalls` still computes the arrival; nothing plays it.
      // …and a hand sweeping through the air on a beat that stands and gestures.
      // The KIND travels with the time, so the sound matches the movement that
      // earned it rather than being one whoosh for everything.
      const sw = swishAt.value;
      let j = swished.value;
      if (j < sw.length) {
        while (j < sw.length && t >= sw[j]) j += 1;
        if (j !== swished.value) {
          const kind = swishKind.value[j - 1] ?? 0;
          swished.value = j;
          runOnJS(gestured)(kind);
        }
      }
      // …and a beat's timed sound effects (AT6), each when the action it belongs to
      // happens. The beat travels with the cue, so one that fires as the reader taps on
      // can tell it is late and stay quiet.
      const ca = cueAt.value;
      let c = cued.value;
      if (c < ca.length) {
        const from = c;
        while (c < ca.length && t >= ca[c]) c += 1;
        if (c !== from) {
          cued.value = c;
          for (let q = from; q < c; q += 1) runOnJS(soundCue)(bi.value, q);
        }
      }
    },
  );

  // Drive the answer-progress value once a question on this beat is answered. It
  // ramps 0→1 linearly; each scene shapes it (gravity, settle, …) as it likes.
  useEffect(() => {
    if (gates(beat) && picked !== null) {
      qv.value = withTiming(1, { duration: 780, easing: Easing.linear });
    }
  }, [picked, i]);

  useEffect(() => {
    progress.value = withTiming((i + 1) / beats.length, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [i]);

  // A drag beat opens with its knob where the script put it. Without this the
  // SECOND drag question in a lesson would start wherever the first was released —
  // which on a two-drag lesson means opening already inside the answer.
  // THE LOOK FOLLOWS THE BEAT. Declared before the drag reset only so it sits with
  // the other per-beat effects; nothing depends on the order.
  useEffect(() => {
    const row = GAZE[lesson.id];
    const t = row ? row[i] : null;
    gazeOn.value = withTiming(t ? 1 : 0, { duration: 420, easing: Easing.out(Easing.cubic) });
    if (!t) return;
    gazeX.value = withTiming(t[0], { duration: 560, easing: Easing.out(Easing.cubic) });
    gazeY.value = withTiming(t[1], { duration: 560, easing: Easing.out(Easing.cubic) });
  }, [i, lesson.id, gazeX, gazeY, gazeOn]);

  useEffect(() => {
    const d = beat.interact?.drag;
    // Not on a beat already answered: its knob was put back where the reader left it.
    if (d && !kept.current[i]) dragPos.value = d.start;
  }, [i, beat.interact?.drag, dragPos]);

  // On completion, hand the result to the GLOBAL reward overlay and pop this
  // screen off the tab stack, so it never lingers and re-shows the reward.
  useEffect(() => {
    if (!done) return;
    if (finish) { finish({ xp: lessonXP(correct, asked), correct, total: asked }); return; }
    const found = getLessonById(lesson.id);
    showReward({
      xp: lessonXP(correct, asked),
      correct,
      total: asked,
      branchSlug: found?.branch.slug ?? null,
      lessonId: lesson.id,
    });
    exitLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const locked = gates(beat) && picked === null;
  // E41 — whether this beat is answered on the stage. A beat whose question is
  // asked below the picture takes no pick from the scene and shows no ring on it.
  const stageLive = stageAnswered(beat);
  // ── BRANCHES (LESSON_RULES AT5) ──────────────────────────────────────────────
  // A beat with `when` plays only when the reader's answers match it: one reply to a
  // right answer, another to a wrong one, a verdict that depends on both. Forward and
  // back step over every beat that does not hold, so a branch is a path through the
  // script rather than a second script. With no `when` anywhere — every other lesson —
  // the next beat is i + 1 and the last is the last, exactly as before.
  const graded = useMemo(() => beats.map((b, k) => (b.interact ? k : -1)).filter((k) => k >= 0), [beats]);
  const plays = (k: number) => {
    const w = beats[k]?.when;
    if (!w) return true;
    if ('q' in w) {
      const a = kept.current[graded[w.q - 1]];
      return !!a && a.ok === w.ok;
    }
    if (!graded.every((k2) => kept.current[k2])) return false;
    return graded.reduce((n, k2) => n + (kept.current[k2]?.ok ? 1 : 0), 0) === w.score;
  };
  const nextOf = (k: number) => {
    for (let j = k + 1; j < beats.length; j += 1) if (plays(j)) return j;
    return -1;
  };
  const prevOf = (k: number) => {
    for (let j = k - 1; j >= 0; j -= 1) if (plays(j)) return j;
    return -1;
  };
  const last = nextOf(i) === -1;

  // The cues and the bed for the beat on screen (see the note at `usesSfx`).
  useEffect(() => {
    if (!usesSfx) return;
    // whatever the last beat was still sounding went quiet when the beat changed (the
    // layout effect at `usesSfx`), before this one's line; turned off, everything stops
    if (!sfxOn || done) { sfx.hush(); sfx.bed(null); return; }
    let bedNow: SfxId | null = null;
    for (let k = shown; k >= 0; k -= 1) {
      const b = beats[k];
      if (b.bed !== undefined && plays(k)) { bedNow = b.bed; break; }
    }
    sfx.bed(bedNow, BED_GAIN);
    if (guideOpen) return;
    const b = beats[shown];
    const line = narrated?.[shown];
    const said = narrationOn && line && b.text === line.text ? line.dur : 0;
    const wait = b.voiceAfter ?? 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    // a timed cue fires off the beat clock instead (`cueAt`), with the action it belongs to
    for (const c of b.sfx ?? []) {
      if (typeof c.at === 'number') continue;
      const at = c.at === 'lead' ? 0 : wait + said + TAIL_AFTER_S;
      timers.push(setTimeout(() => sfx.play(c.id, c.gain ?? 1), at * 1000));
    }
    // the bed comes down for the line and back up after it
    if (said > 0) {
      timers.push(setTimeout(() => sfx.duck(true), wait * 1000));
      timers.push(setTimeout(() => sfx.duck(false), (wait + said) * 1000));
    } else sfx.duck(false);
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usesSfx, sfxOn, shown, done, guideOpen, narrationOn]);

  // Move to beat k in either direction. A beat already answered comes back answered
  // (its control's position is restored in the render-time block above, where the
  // clock is rewound); any other comes back open. Touches only setters and a ref, so
  // the callbacks below can call it without listing it.
  const goTo = (k: number) => {
    const was = kept.current[k];
    setPicked(was ? was.id : null);
    setPickedOk(was ? was.ok : false);
    setPeek(null);
    setI(k);
  };

  const advance = useCallback(() => {
    if (locked) return;
    // K7 — A TAP DURING A TOUR FAST-FORWARDS IT; IT NEVER SKIPS IT.
    //
    // The reader can always outrun the camera, and the alternative to this was
    // locking the tap until the tour finished — which is worse than the problem it
    // solves, because `locked` already exists for unanswered questions and is felt as
    // the app being unresponsive. Warping the raw clock forward resolves every
    // station's content at once and leaves only the closing move to play, and K3
    // guarantees what the reader lands on is the whole picture, so nothing is lost by
    // being impatient.
    // …BUT IT DOES NOT EAT THE TAP. This used to `return` after warping the clock,
    // so a reader tapping during a tour got no beat change and had to tap again —
    // "sometimes it doesn't actually properly move to the next section after the
    // user taps". One tap, one advance, always: warp the tour to its end AND go on.
    // Safe now that the camera is smoothed rather than driven directly, because
    // the warp is a fast glide rather than the teleport it used to be.
    const skip = tourSkip[i] ?? 0;
    if (skip > 0 && rt.value < skip) rt.value = skip;
    // NO SOUND ON ADVANCING A BEAT. There was a page turn here and it fired ten
    // times a lesson, which is the single most frequent thing in a reading — and
    // "I don't want a sound every time a user clicks to the next section" is the
    // right call. Tapping forward is not an event, it is the medium.
    if (last) { setDone(true); return; }
    goTo(nextOf(i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, last, sounded, tourSkip, i, rt]);
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  // ── ONE BEAT BACK (tapNav.ts) ─────────────────────────────────────────────
  // The previous beat plays again from its start: every scene derives its "previous"
  // as n − 1 from `bi`, so stepping from 5 to 4 replays 4's own arrival while each
  // carried track glides from what is on screen, and the voice reads 4's line again
  // because it follows `shown`. No scene knows a reader can go back, and none needed
  // to. Never a tour warp: that is how forward keeps up with an impatient reader,
  // and back has nothing to catch up with.
  const { flash, back: flashBack, fwd: flashFwd } = useEdgeFlash();
  const back = useCallback(() => {
    const k = prevOf(i);
    if (k < 0) { flash('back', true); return; }
    flash('back');
    goTo(k);
  }, [i, flash]);

  // Where a tap on the lesson goes: the left third back, the rest forward.
  const { width: winW } = useWindowDimensions();
  const onBody = useCallback((e: GestureResponderEvent) => {
    // A tap during the opening breath (AP19) STARTS the lesson; it never skips the
    // first line the reader has not heard yet.
    if (useGuideStore.getState().opening) { setOpening(false); return; }
    if (tapSide(e?.nativeEvent as never, winW) === 'back') { back(); return; }
    if (locked) return;
    flash('forward');
    advance();
  }, [winW, back, locked, flash, advance]);

  const choose = useCallback((id: string, isCorrect: boolean, graded: boolean) => {
    if (picked !== null) return;
    setPicked(id);
    setPickedOk(isCorrect);
    kept.current[i] = { id, ok: isCorrect, pos: dragPos.value, pos2: dragPos2.value, sem: pickPos.value };
    answeredHere.current = i;
    // …and the answer is heard, in time with Target's reaction to it (PICK_SFX).
    if (sfxLive.current.on) {
      const p = isCorrect ? PICK_SFX.right : PICK_SFX.wrong;
      const at = i;
      setTimeout(() => { if (sfxLive.current.on && sfxLive.current.beat === at) sfx.play(p.id, p.gain); }, p.at * 1000);
    }
    if (graded) {
      setAsked((n) => n + 1);
      if (isCorrect) setCorrect((n) => n + 1);
    }
    if (sounded) {
      // The run counts EVERY answer, graded or not. An ungraded teaching tap still
      // felt like getting it right, and a note that refuses to climb because the
      // question was not worth XP is the app admitting which questions are real.
      if (isCorrect) { cue('right', run.current); run.current += 1; }
      else { run.current = 0; cue('rethink'); }
    }
    // AND THE FIGURE ANSWERS TOO. `lookPose` reads this, so every scene that
    // routes its figure through it nods or draws back with the reader — the
    // mascot "learning with you" rather than standing beside a card that changed
    // colour. `withTiming` both ways, because group L's whole finding is that a
    // value which steps between two frames reads as a glitch.
    //
    // The out is slower than the in (M3's exits-are-shorter, read backwards: an
    // exit that is faster than its entrance reads as the reaction being cut off).
    REACT.value = withSequence(
      withTiming(isCorrect ? 1 : -1, { duration: 220, easing: Easing.out(Easing.quad) }),
      withDelay(260, withTiming(0, { duration: 420, easing: Easing.inOut(Easing.quad) })),
    );
    // `i` IS IN THE DEPS, and it has to be: this callback was rebuilt only when
    // `picked` changed, which happens on every ADVANCE — so it was right by
    // accident, and a beat nobody answered left the next one seeded on a stale
    // index. (The answer line he used to say here went with the thought bubble,
    // 2026-10-02.)
  }, [picked, sounded, i]);

  // AN ANSWER THAT IS SAID (AT4): a graded beat with `go` moves on by itself once it is
  // answered here — not when it comes back answered — so the reply the reader chose is
  // spoken on the next beat without a second tap.
  useEffect(() => {
    const g = beat.go;
    if (!g || picked === null || answeredHere.current !== i) return;
    const h = setTimeout(() => { answeredHere.current = -1; advanceRef.current(); }, g * 1000);
    return () => clearTimeout(h);
  }, [picked, i, beat.go]);

  const onStage = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBoxSize((b) => (Math.abs(b.w - width) < 1 && Math.abs(b.h - height) < 1 ? b : { w: width, h: height }));
  }, []);

  // THE SUMMARY HAND-OFF. The last beat hides the stage and gives its whole height
  // to the deck. Keying that off `beat` collapsed the stage and re-centred the deck
  // in the very frame the index changed — while the deck was still showing the
  // PREVIOUS beat's text for another 168ms. The outgoing question visibly leapt from
  // the lower deck up into the summary's slot, sat there, and only then faded: a
  // flash of the old screen in the new screen's position.
  //
  // So the LAYOUT follows `shown`, which only advances when the deck swaps its
  // content — the one instant it is at zero opacity, where a re-layout cannot be
  // seen. The stage meanwhile fades out on the incoming beat (`hiding`) so it
  // dissolves alongside the text instead of blinking out from under it.
  const gone = stageGone(beats[shown] ?? beat);
  const hiding = stageGone(beat);
  const stageVis = useSharedValue(1);
  useEffect(() => {
    stageVis.value = withTiming(hiding ? 0 : 1, {
      duration: Math.round(XFADE * (hiding ? 0.4 : 0.6)),
      easing: hiding ? Easing.in(Easing.quad) : Easing.out(Easing.cubic),
    });
  }, [hiding]);
  const stageStyle = useAnimatedStyle(() => ({ opacity: stageVis.value }));

  // EVERY HOOK MUST BE ABOVE THIS LINE. `done` flips on the last tap, so anything
  // below here is skipped on that render — and three hooks used to live below it.
  // React counted fewer hooks than the render before, threw, and took the whole
  // tree down with it, INCLUDING the reward Modal that had just been mounted: the
  // lesson ended on a blank screen with no way forward. A hook after this return
  // is not a style mistake, it breaks finishing a lesson.
  if (done) return null;   // the effect above shows the reward and pops this screen

  // Fit the BAND, not the whole design space — see BAND_T/BAND_B in cinematicKit.
  const bandT = band[0];
  const bandH = band[1] - band[0];
  const fit = boxSize.w > 0 ? Math.min(boxSize.w / STAGE_W, boxSize.h / bandH) : 0;
  const quoteSaved = beat.quote ? savedQuotes.some((q) => q.id === beat.quote!.id) : false;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Raised above the body, which is drawn after it: the Aa button's mode label
          hangs below the header and would otherwise be painted over by the stage. */}
      <View style={[styles.header, { zIndex: 5 }]}>
        <Pressable onPress={exitLesson} hitSlop={12} style={styles.close}>
          <SketchIcon name="close" size={20} color={INK} />
        </Pressable>
        <View style={styles.track}>
          {/* Named so an audit can ask "did the beat actually advance?" directly.
              scripts/measure-must.mjs inferred it from a hash of the page text,
              which cannot tell a tap that did nothing from two beats that happen
              to read the same — and stopped measuring ethics-ethics-3 at beat 8 of
              10, leaving the last two silently unprotected. This bar IS the beat
              index, scaled. */}
          <Animated.View nativeID="beat-progress" style={[styles.fill, fillStyle]}>
            <View style={styles.fillTop} pointerEvents="none" />
          </Animated.View>
        </View>
        {/* The score, while it is still being earned rather than after. */}
        <XpPill xp={correct * XP_PER_CORRECT_ANSWER} />
        {/* THE VOICE'S ONE CONTROL, and only in a lesson that has a voice. On by
            default; the reader's choice is kept in settings, so muting one lesson
            mutes the next. */}
        {/* THE WORDS' ONE CONTROL — rising with the voice, or all at once. */}
        {narrated ? <WordsToggle /> : null}
        {narrated ? (
          <Pressable
            onPress={() => setUserSetting('narration', !narrationOn)}
            hitSlop={12}
            style={styles.close}
            accessibilityRole="button"
            accessibilityLabel={narrationOn ? 'Mute the narration' : 'Read this lesson aloud'}
          >
            <SketchIcon name={narrationOn ? 'volume-on' : 'volume-off'} size={20} color={INK} />
          </Pressable>
        ) : null}
      </View>

      {/* THE LESSON TAKES A TAP ANYWHERE: the left third goes back a beat, the rest
          goes forward (tapNav.ts). Never `disabled` while a question is open — back
          must still work there; forward is refused inside onBody instead. Screen
          readers get the two moves as named actions, because a tap zone is a
          gesture VoiceOver and TalkBack cannot make. */}
      <Pressable
        style={styles.body}
        onPress={onBody}
        accessibilityActions={[{ name: 'next', label: 'Next' }, { name: 'previous', label: 'Previous' }]}
        onAccessibilityAction={(e) => { if (e.nativeEvent.actionName === 'previous') back(); else advance(); }}
      >
        <Animated.View style={[styles.stageWrap, gone && styles.stageGone, stageStyle]} onLayout={onStage}>
          {/* The View below is THE CROP — the rectangle the band is cut to, and so the
              rectangle a camera push can hide art outside of. It carries a nativeID for
              the same reason Target's ring does: scripts/check-frame.mjs has to find it
              exactly, and locating it by "the element with overflow:hidden" also matches
              scene art. An audit measuring the wrong rectangle reports confidently
              about nothing. */}
          {fit > 0 && !gone ? (
            <View nativeID="stage-clip" style={{ width: STAGE_W * fit, height: bandH * fit, overflow: 'hidden' }}>
              <View style={{ position: 'absolute', left: 0, top: -bandT * fit, width: STAGE_W * fit, height: STAGE_H * fit }}>
                <View style={{ width: STAGE_W, height: STAGE_H, transform: [{ scale: fit }], transformOrigin: '0% 0%' }}>
                  {/* THE CAMERA LAYER EXISTS ONLY WHEN A LESSON ASKS FOR ONE.
                      Without a camera the scene mounts exactly as it always did —
                      no wrapper, no transform, no derived value driving a style
                      every frame. A lesson that does not move the camera should
                      not pay a matrix multiply per frame for one that does. */}
                  {cam ? (
                    <Animated.View
                      ref={camHost}
                      // transformOrigin 0% 0% means this element's own client rect
                      // top-left IS the image of scene point (0,0) and its width is
                      // STAGE_W × fit × scale — which is all scripts/measure-must.mjs
                      // needs to convert a measured rectangle back into scene
                      // coordinates, at any zoom, without knowing either factor.
                      nativeID="stage-cam"
                      style={[{ width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' }, camStyle]}
                    >
                      <TargetCountProvider onCount={setTargetCount} onBox={onBox} host={camHost} live={stageLive}>
                        <Scene clock={clock} bt={bt} bi={bi} si={si} qv={qv} dragPos={dragPos} dragPos2={dragPos2} pickPos={pickPos} gazeX={gazeX} gazeY={gazeY} gazeOn={gazeOn} i={i} beat={beat} picked={picked} pickedOk={pickedOk} sound={sounded} onPick={(id, ok) => { if (stageLive) choose(id, ok, true); }} />
                      </TargetCountProvider>
                    </Animated.View>
                  ) : (
                    <TargetCountProvider onCount={setTargetCount} live={stageLive}>
                      <Scene clock={clock} bt={bt} bi={bi} si={si} qv={qv} dragPos={dragPos} dragPos2={dragPos2} pickPos={pickPos} gazeX={gazeX} gazeY={gazeY} gazeOn={gazeOn} i={i} beat={beat} picked={picked} pickedOk={pickedOk} sound={sounded} onPick={(id, ok) => { if (stageLive) choose(id, ok, true); }} />
                    </TargetCountProvider>
                  )}
                  {/* CHROME: stage coordinates, band-clipped, fit-scaled — and no
                      camera. A sibling of the camera layer rather than a child, so
                      what it draws holds one size on screen while the shot moves.
                      See the `Chrome` prop. */}
                  {Chrome ? (
                    <Chrome
                      clock={clock} bt={bt} bi={bi} si={si} qv={qv}
                      dragPos={dragPos} dragPos2={dragPos2} pickPos={pickPos}
                      gazeX={gazeX} gazeY={gazeY} gazeOn={gazeOn}
                      i={i} beat={beat} picked={picked} pickedOk={pickedOk} sound={sounded}
                      onPick={() => {}}
                    />
                  ) : null}
                </View>
              </View>
            </View>
          ) : null}

        </Animated.View>

        {/* ── THE LOWER HALF, AND WHY IT IS ONE BOX (L6) ────────────────────
            The cards, the drag rail and the deck used to be three siblings of the
            stage, so `body` split its height between `stageWrap` (flex 42) and
            `deck` (flex 50) AFTER subtracting whatever the answer control took.
            A control is ~74px, so the stage lost 42/92 of that — 34px — on the
            single frame a question beat mounted, and got it back on the frame the
            next beat unmounted it.

            The stage does not merely move when that happens, it RESCALES: `fit`
            is `min(w / STAGE_W, h / bandH)` off the measured box, so the whole
            picture stepped about 12% between two frames, twice per question, and
            once more each way through `boxSize` being React state rather than a
            layout value — the old scale drawn inside the new box for a frame,
            then the snap. This is the "glitch when you tap into a question" a
            reader reported, and it is the largest single one in the format: a
            camera cut nobody wrote, moving every pixel at once.

            Wrapping them makes the split unconditional. The stage is 42/92 of the
            body on every beat of every lesson, and the control comes out of the
            deck's 50 instead — where it costs ~34px of text room on the one kind
            of beat whose deck holds a prompt rather than narration, and where
            nothing is measured against anything. */}
        {/* nativeID so a harness can measure what is in here without guessing which
            View it is — the same reason #stage-clip and the controls carry one
            (§21). `check:readable` scans this box as well as the stage, because
            the words the reader could not read turned out to be in BOTH. */}
        <View style={styles.lower} nativeID="lower-deck">
          <QuestionAccentProvider lessonId={lesson.id}>
          {/* THE TWO CHOICES — directly under the art, above the prompt.
              Not in scene coordinates (every lesson crops its band differently and
              a camera push would cut them in half, H60) and not pinned over the
              stage either: the figure stands on the ground line at the bottom of
              the band, so cards there land on top of him. See ./ChoiceCards. */}
          {beat.interact?.cards && !gone ? (
            <ChoiceCards
              cards={beat.interact.cards}
              picked={picked}
              onPick={(id, ok) => choose(id, ok, true)}
              // QUESTION identity, not beat identity — see seedFor. Seeding on the
              // beat index meant re-cutting narration re-rolled every shuffle in
              // the app at once.
              seed={seedFor(lesson.id, beat.interact.cards)}
            />
          ) : null}

          {/* THE LINE — same slot, same reasoning, for a question whose answer is a
              position rather than a pick. See ./DragScale. */}
          {beat.interact?.drag && !gone ? (
            <DragScale
              drag={beat.interact.drag}
              picked={picked}
              onPick={(id, ok) => choose(id, ok, true)}
              pos={dragPos}
            />
          ) : null}

          {/* FOUR MORE ANALOGUE ANSWERS, all in this same slot and for the same
              reasons: inside `styles.lower` so the stage never resizes when a
              question arrives (L6), and in deck coordinates rather than scene
              ones so no lesson's camera can crop them (H60). Each is a different
              QUESTION, not a different skin — see the block types in
              ./cinematicKit. */}
          {beat.interact?.lever && !gone ? (
            <LeverPick
              lever={beat.interact.lever}
              picked={picked}
              onPick={(id, ok) => choose(id, ok, true)}
              pos={dragPos}
            />
          ) : null}

          {/* A CURVE, CHOSEN IN ONE TAP. It was drawn column by column and set
              with a button, which a reader found too slow; see ./TrendPick. The
              block is still `plot`, so every scene reacting to one still does. */}
          {beat.interact?.plot && !gone ? (
            <TrendPick
              plot={beat.interact.plot}
              picked={picked}
              onPick={(id, ok) => choose(id, ok, true)}
              pos={dragPos}
              sem={pickPos}
              seed={seedFor(lesson.id, [{ text: beat.interact.plot.shapes[0]?.reads ?? '' }])}
            />
          ) : null}

          {beat.interact?.split && !gone ? (
            <SplitBar
              split={beat.interact.split}
              picked={picked}
              onPick={(id, ok) => choose(id, ok, true)}
              pos={dragPos}
            />
          ) : null}

          {beat.interact?.field && !gone ? (
            <FieldPick
              field={beat.interact.field}
              picked={picked}
              onPick={(id, ok) => choose(id, ok, true)}
              pos={dragPos}
              pos2={dragPos2}
            />
          ) : null}

          {beat.interact?.poll && !gone ? (
            <PollBallot
              poll={beat.interact.poll}
              picked={picked}
              onPick={(id, ok) => choose(id, ok, true)}
              pos={dragPos}
              sem={pickPos}
              seed={seedFor(lesson.id, [{ text: beat.interact.poll.options[0].reads }])}
            />
          ) : null}

          {beat.interact?.sort && !gone ? (
            <SortBins
              sort={beat.interact.sort}
              picked={picked}
              onPick={(id, ok) => choose(id, ok, true)}
              pos={dragPos}
              sem={pickPos}
              seed={seedFor(lesson.id, [{ text: beat.interact.sort.chip }])}
            />
          ) : null}

          {/* THE TWO THAT REPLACED THE SLIDERS. Both are taps and nothing else,
              and both are handed the lesson's own stage tone so a drawn tile is
              struck in the branch hue rather than declaring a colour of its own
              (H: no scene-declared colours). */}
          {beat.interact?.order && !gone ? (
            <OrderTiles
              order={beat.interact.order}
              picked={picked}
              onPick={(id, ok) => choose(id, ok, true)}
              pos={dragPos}
              sem={pickPos}
              seed={seedFor(lesson.id, [{ text: beat.interact.order.items[0]?.reads ?? '' }])}
              tone={questionTone}
            />
          ) : null}

          {beat.interact?.odd && !gone ? (
            <OddOneOut
              odd={beat.interact.odd}
              picked={picked}
              onPick={(id, ok) => choose(id, ok, true)}
              pos={dragPos}
              sem={pickPos}
              seed={seedFor(lesson.id, [{ text: beat.interact.odd.tiles[0]?.reads ?? '' }])}
              tone={questionTone}
            />
          ) : null}

          <View style={[styles.deck, gone && styles.deckTall]}>
          <Fade
            trigger={i}
            onSwap={() => setShown(i)}
            // `peek` IS PART OF THE REVISION, and leaving it out is invisible.
            //
            // Fade holds the deck's elements in STATE and rebuilds them only when
            // the beat changes or this string does. So a state the deck draws but
            // the revision does not name is a state the deck never shows: the
            // press handler ran, setPeek ran, React re-rendered the player — and
            // the paragraph on screen stayed the one Fade had built before any of
            // it. Nothing throws and nothing logs. Measured, it is indistinguishable
            // from an onPress that was never wired.
            revision={`${picked ?? ''}|${quoteSaved ? 1 : 0}|${peek ?? ''}|${opening ? 1 : 0}`}
            duration={XFADE}
            render={() => (
              <>
                {beat.cite ? <Text style={styles.cite}>{beat.cite.toUpperCase()}</Text> : null}
                {/* The first line is not drawn during the opening breath (AP19): its
                    place is kept, so nothing reflows when it arrives. */}
                {beat.text ? (
                  <OpeningVeil hidden={opening}>
                  <SpokenBy who={beat.speaker}>
                  <NarrationText
                    text={beat.text}
                    lessonId={lesson.id}
                    beat={i}
                    focus={focus}
                    style={styles.narr}
                    openId={peek}
                    onPeek={(pid, x) => {
                      setPeekX(x);
                      setPeek((cur) => (cur === pid ? null : pid));
                    }}
                  />
                  </SpokenBy>
                  </OpeningVeil>
                ) : null}
                {/* The snapshot lives UNDER the paragraph rather than floating
                    over it: group S spends its whole length on words being
                    covered, and a popover would be that on purpose. */}
                <ThinkerPeek id={peek} anchorX={peekX} onClose={() => setPeek(null)} />

                {beat.quote ? (
                  <QuoteCard
                    q={beat.quote}
                    saved={quoteSaved}
                    onToggle={() => {
                      // The clasp only closes on the way IN. Taking a quote back
                      // out is not an achievement, and now that the button tap is
                      // gone there is nothing for it to sound like — so it is felt
                      // and not heard, like every other control in the app.
                      if (sounded && !quoteSaved) cue('keep');
                      else touch();
                      toggleQuote({
                        id: beat.quote!.id,
                        text: beat.quote!.text,
                        author: beat.quote!.author,
                        philosopherId: beat.quote!.philosopherId ?? '',
                        branchSlugs: beat.quote!.branchSlugs ?? [],
                        savedAt: Date.now(),
                      });
                    }}
                  />
                ) : null}

                {beat.summary ? <SummaryCard s={beat.summary} /> : null}

                {beat.tap ? (
                  <Choices
                    prompt={beat.tap.prompt}
                    options={beat.tap.options}
                    explain={beat.tap.explain}
                    picked={picked}
                    onPick={(id, ok) => choose(id, ok, false)}
                  />
                ) : null}

                {beat.mc ? (
                  <Choices
                    prompt={beat.mc.prompt}
                    options={beat.mc.options}
                    explain={beat.mc.explain}
                    picked={picked}
                    graded
                    onPick={(id, ok) => choose(id, ok, true)}
                  />
                ) : null}

                {beat.interact ? (
                  <InteractPanel
                    prompt={beat.interact.prompt}
                    explain={beat.interact.explain}
                    targets={targetCount}
                    // Cards and the drag rail are their own instruction and sit
                    // right below this panel; only a STAGE question needs telling
                    // where to look. See the prop's note in cinematicKit.
                    // WHICH KIND OF QUESTION THIS IS, and the list has to name
                    // every control. The panel prints "tap one of the N outlined
                    // parts above" only for a question answered on the STAGE; a
                    // beat whose answer is a bar, a lever, a plot or a pad has
                    // its own instruction sitting directly under the picture, and
                    // pointing the reader back at the scene sends them to targets
                    // that are mounted and disabled. Same failure this flag was
                    // added for, one control family later.
                    // The same test the stage's picks are gated on (E41), so the
                    // hint and the picks cannot drift apart.
                    inScene={stageLive}
                    answered={picked !== null}
                    correct={pickedOk}
                    index={qIndex[i] || undefined}
                    total={qTotal || undefined}
                  />
                ) : null}
              </>
            )}
            />
          </View>
          </QuestionAccentProvider>
        </View>

        {/* Not shown while the lesson guide is up or the breath runs: it says the same
            thing, and the nudge read straight through the guide's glass. But it is ALWAYS
            LAID OUT: it is one slice of the stage/deck/hint split, so mounting it when the
            breath ended took that slice from the stage, which shrank and jumped up on the
            frame the lesson began (AI8). Now only its opacity changes. */}
        <OpeningVeil hidden={guideOpen} style={styles.tapLayer}>
          <TapNudge
            label={locked ? 'Choose an answer' : last ? 'Finish' : 'Tap to continue'}
            resting={locked}
          />
        </OpeningVeil>

        {/* Which way the tap went — above everything in the body, taking no touch. */}
        <EdgeFlash back={flashBack} fwd={flashFwd} />
      </Pressable>
    </SafeAreaView>
  );
}
