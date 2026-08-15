import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useFrameCallback, useAnimatedStyle, useAnimatedReaction, useDerivedValue, runOnJS,
  withTiming, Easing, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import { getLessonById } from '@/data';
import { lessonXP } from '@/constants/xp';
import { exitLesson } from '../exitLesson';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
import {
  shotAt, resolveMoves, containShot, NEUTRAL, tourStartShots, tourEndShots, tourAt, tourEnd, trackAt,
  type Box, type Move, type Shot, type Tour,
} from './camera';
import { MUST } from './mustBoxes';
import { TOURS } from './tours';
import { toursOff } from './tourFlag';
import { cue, touch } from '@/lib/feedback';
import { footfallTrack } from './footfalls';
import ChoiceCards from './ChoiceCards';
import DragScale from './DragScale';
import { swishTrack } from './gestures';
import { lessonHasSound } from './lessonSound';
import { TargetCountProvider } from './Target';
import {
  Fade, Choices, InteractPanel, QuoteCard, SummaryCard, gates, styles,
  COMPLETION_XP, XFADE, STAGE_W, STAGE_H, BAND_T, BAND_B, GROUND, INK,
  type BaseBeat,
} from './cinematicKit';

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
   * Whether this lesson is allowed to make a noise (./lessonSound). The player
   * already sounds everything the SHELL owns — beats, answers, quotes, footfalls
   * — so a scene only needs this to voice something in its own staging: a thing
   * struck, a door, a bell that is drawn ringing.
   *
   * Use it sparingly and only where the picture already shows the event. Rule A1
   * runs both ways: a sound for something the scene declined to draw describes a
   * different lesson.
   */
  sound: boolean;
}
export type SceneComponent = ComponentType<SceneApi>;

export default function CinematicPlayer({
  lesson, beats, Scene, stageGone = (b) => !!b.summary, band = [BAND_T, BAND_B], walk, gesture, shots,
  camera, ground = GROUND,
}: {
  lesson: Lesson;
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
   * already builds to drive `travelStance`. Given it, the player sounds a footfall
   * at each foot plant (see ./footfalls). Omit it and the lesson walks silently.
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
   * player sounds a hand through the air wherever one genuinely sweeps — and
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
}) {
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const showReward = useUIStore((s) => s.showReward);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedOk, setPickedOk] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  // How many outlined things the scene is currently offering, counted by the
  // Targets themselves (see Target.tsx) so no lesson has to declare it and none
  // can declare it wrongly. Feeds the interact panel's hint. ABOVE the early
  // return below, like every other hook here — see the note on that return.
  const [targetCount, setTargetCount] = useState(0);
  const [done, setDone] = useState(false);
  const [boxSize, setBoxSize] = useState({ w: 0, h: 0 });
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
  const plants = useMemo(
    () => (sounded && walk ? footfallTrack(walk) : { steps: [], settle: [] }),
    [sounded, walk],
  );
  const gestures = useMemo(() => {
    if (!sounded || !gesture) return [];
    // A beat either walks or gestures — never both (see ./gestures).
    const walked = gesture.map((_, k) => !!walk && k > 0 && Math.abs(walk[k] - walk[k - 1]) > 1);
    return swishTrack(gesture, walked, beats.map((b) => b.dur));
  }, [sounded, gesture, walk, beats]);

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
      if (!raw || raw.length < 2 || needsBox[k] || toursOff()) return null;
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
   */
  const tourSkip = useMemo(
    () => tourData.map((t) => (t ? tourEnd(t.trs, t.dwells) - t.trs[t.trs.length - 1] : 0)),
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
      // No box yet. A question still falls back to the whole band, because an
      // unreachable answer is worse than a blunt frame; anything else keeps its
      // authored shot rather than snapping wide for a box that may never come.
      return needsBox[k] ? { ...NEUTRAL, tr: cam[k].tr } : cam[k];
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
    const tour = tourData[n];
    if (tour) {
      const a = tourAt(tour.trs, tour.dwells, rt.value);
      // ARRIVED, AND THE SUBJECT IS WALKING (K9). The camera goes with it instead of
      // parking — one continuous station whose target moves, at a fixed scale, which
      // is why this is a slide and not a second travel.
      if (a.p > 0 && tour.follow[a.k]) {
        return trackAt(tour.shots[a.k], tour.ends[a.k], a.p / Math.max(0.001, tour.dwells[a.k]));
      }
      const from = a.k > 0 ? tour.ends[a.k - 1] : restOf(n > 0 ? n - 1 : n);
      return shotAt(from, tour.shots[a.k], a.t);
    }
    return shotAt(restOf(n > 0 ? n - 1 : 0), frame(n), rt.value);
  });
  // ── THE CAMERA IS SMOOTHED, NOT DRIVEN DIRECTLY (group L) ──────────────────
  //
  // `camNow` is the shot the lesson ASKS for, and it is discontinuous in four
  // separate places — a reader saw all four and called them "a glitch, or a frame
  // miss… the camera might move to a spot first that isn't right and then adjust":
  //
  //   1. A BEAT CHANGE resets `rt` to 0, so the travel restarts from
  //      `restOf(n-1)`. If the previous beat's tour had not finished, the camera
  //      was never at that shot and teleports there before setting off. This is
  //      the camera's version of the figure defect group L already fixed.
  //   2. THE BOX ARRIVES LATE. `frame()` returns NEUTRAL (or the raw authored
  //      shot) until `targetBox` has been measured, then switches to
  //      `containShot(...)` the frame it lands. That step IS "moves somewhere
  //      wrong first, then adjusts".
  //   3. A TAP DURING A TOUR warps `rt` straight to the skip point, which jumps
  //      the camera to the end of the tour in one frame.
  //   4. A MUST-BOX CHANGING between beats moves the target under a travel that
  //      is already part-way through.
  //
  // Chasing the requested shot with a critically-damped follow fixes all four at
  // once and needs no per-lesson change, because it makes the OUTPUT continuous
  // whatever the input does. The authored push/pull still reads through — TAU is
  // well under the shortest authored move — and a discontinuity in the request
  // becomes a fast glide instead of a cut.
  //
  // Frame-rate independent on purpose: `1 - exp(-dt/TAU)` gives the same curve at
  // 60fps and at 30, where a fixed per-frame fraction would make the camera lag
  // twice as far on a slow device.
  // A CRITICALLY DAMPED SPRING, NOT AN EXPONENTIAL LAG, and the difference is the
  // whole point. A first-order lag takes its LARGEST step on the first frame — it
  // moves a fixed fraction of the error immediately — so a 138-unit step in the
  // request still moved the stage 21 units in one frame, which is exactly the cut
  // this is meant to remove. A spring starts at zero velocity and accelerates, so
  // the first frame after a step moves almost nothing and the camera eases into
  // the move. It also cannot overshoot at critical damping, so a shot never sails
  // past its subject and comes back — the "adjusts afterwards" the reader saw.
  // AND IT FEEDS THE TARGET'S VELOCITY FORWARD, or the fix breaks the very thing
  // this was asked to improve. A spring that damps its own ABSOLUTE velocity has a
  // permanent steady-state error against a MOVING target: measured, the camera sat
  // 15 units behind a figure walking at 100 units/s and 24 behind a run. That is a
  // follow shot that trails its subject for the whole beat — worse than what it
  // replaced. Damping the RELATIVE velocity (camera minus target) instead takes the
  // trail to about zero and costs the step smoothing almost nothing: 15.0 → -1.7
  // units of trail, 5.5 → 6.1 units of stutter, against a line of 8.
  //
  // The target's velocity is measured, so it is filtered and clamped: a STEP in the
  // request would otherwise read as an enormous one-frame velocity and launch the
  // camera, which is the same cut coming back through a different door.
  const camS = useSharedValue({
    cx: NEUTRAL.cx, cy: NEUTRAL.cy, s: NEUTRAL.s,
    vx: 0, vy: 0, vs: 0,
    wx: 0, wy: 0, ws: 0,        // last requested shot, for the velocity estimate
    tx: 0, ty: 0, ts: 0,        // the filtered target velocity
    primed: 0,
  });
  useFrameCallback((f) => {
    'worklet';
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;
    const want = camNow.value;
    const c = camS.value;
    // The first frame of a lesson snaps: there is nothing to be continuous WITH,
    // and gliding in from NEUTRAL would look like an unrequested opening move.
    if (!c.primed) {
      camS.value = {
        cx: want.cx, cy: want.cy, s: want.s, vx: 0, vy: 0, vs: 0,
        wx: want.cx, wy: want.cy, ws: want.s, tx: 0, ty: 0, ts: 0, primed: 1,
      };
      return;
    }
    // How fast the REQUEST is moving, clamped so a step cannot launch the camera
    // and filtered so the estimate is not one frame of noise.
    const g = dt / 0.08 > 1 ? 1 : dt / 0.08;
    const rx = (want.cx - c.wx) / dt;
    const ry = (want.cy - c.wy) / dt;
    const rs = (want.s - c.ws) / dt;
    const tx = c.tx + ((rx < -400 ? -400 : rx > 400 ? 400 : rx) - c.tx) * g;
    const ty = c.ty + ((ry < -400 ? -400 : ry > 400 ? 400 : ry) - c.ty) * g;
    const ts = c.ts + ((rs < -4 ? -4 : rs > 4 ? 4 : rs) - c.ts) * g;

    const w = CAM_OMEGA;
    const k = w * w;
    const d = 2 * w;
    // Scale is on its own axis and a unit of it is worth far more than a unit of
    // position, so it gets the same spring rather than a shared one.
    const vx = c.vx + (-d * (c.vx - tx) - k * (c.cx - want.cx)) * dt;
    const vy = c.vy + (-d * (c.vy - ty) - k * (c.cy - want.cy)) * dt;
    const vs = c.vs + (-d * (c.vs - ts) - k * (c.s - want.s)) * dt;
    camS.value = {
      cx: c.cx + vx * dt, cy: c.cy + vy * dt, s: c.s + vs * dt,
      vx, vy, vs, wx: want.cx, wy: want.cy, ws: want.s, tx, ty, ts, primed: 1,
    };
  }, true);

  const camStyle = useAnimatedStyle(() => {
    const c = camS.value;
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
  }

  useFrameCallback((f) => {
    'worklet';
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;
    clock.value += dt;
    rt.value += dt;
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
  useEffect(() => {
    const d = beat.interact?.drag;
    if (d) dragPos.value = d.start;
  }, [i, beat.interact?.drag, dragPos]);

  // On completion, hand the result to the GLOBAL reward overlay and pop this
  // screen off the tab stack, so it never lingers and re-shows the reward.
  useEffect(() => {
    if (!done) return;
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
  const last = i === beats.length - 1;

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
    setPicked(null);
    setPickedOk(false);
    setI((n) => n + 1);
  }, [locked, last, sounded, tourSkip, i, rt]);

  const choose = useCallback((id: string, isCorrect: boolean, graded: boolean) => {
    if (picked !== null) return;
    setPicked(id);
    setPickedOk(isCorrect);
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
  }, [picked, sounded]);

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
      <View style={styles.header}>
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
          <Animated.View nativeID="beat-progress" style={[styles.fill, fillStyle]} />
        </View>
      </View>

      <Pressable style={styles.body} onPress={advance} disabled={locked}>
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
                      <TargetCountProvider onCount={setTargetCount} onBox={onBox} host={camHost}>
                        <Scene clock={clock} bt={bt} bi={bi} si={si} qv={qv} dragPos={dragPos} i={i} beat={beat} picked={picked} sound={sounded} onPick={(id, ok) => choose(id, ok, true)} />
                      </TargetCountProvider>
                    </Animated.View>
                  ) : (
                    <TargetCountProvider onCount={setTargetCount}>
                      <Scene clock={clock} bt={bt} bi={bi} si={si} qv={qv} dragPos={dragPos} i={i} beat={beat} picked={picked} sound={sounded} onPick={(id, ok) => choose(id, ok, true)} />
                    </TargetCountProvider>
                  )}
                </View>
              </View>
            </View>
          ) : null}

        </Animated.View>

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

        <View style={[styles.deck, gone && styles.deckTall]}>
          <Fade
            trigger={i}
            onSwap={() => setShown(i)}
            revision={`${picked ?? ''}|${quoteSaved ? 1 : 0}`}
            duration={XFADE}
            render={() => (
              <>
                {beat.cite ? <Text style={styles.cite}>{beat.cite.toUpperCase()}</Text> : null}
                {beat.text ? (
                  <Text style={styles.narr}>{beat.text}</Text>
                ) : null}

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
                    answered={picked !== null}
                    correct={pickedOk}
                  />
                ) : null}
              </>
            )}
          />
        </View>

        <View style={styles.tapLayer}>
          <Text style={styles.hint}>
            {locked ? 'Choose an answer' : last ? 'Finish' : 'Tap to continue'}
          </Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}
