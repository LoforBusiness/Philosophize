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
import { shotAt, resolveMoves, containShot, NEUTRAL, type Box, type Move, type Shot } from './camera';
import { cue, touch } from '@/lib/feedback';
import { footfallTrack } from './footfalls';
import { swishTrack } from './gestures';
import { lessonHasSound } from './lessonSound';
import { TargetCountProvider } from './Target';
import {
  Fade, Choices, InteractPanel, QuoteCard, SummaryCard, gates, styles,
  COMPLETION_XP, XFADE, STAGE_W, STAGE_H, BAND_T, BAND_B, INK,
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
  bt: SharedValue<number>;      // resets each beat — transitions / reveals
  bi: SharedValue<number>;      // current beat index (worklet-readable)
  qv: SharedValue<number>;      // 0→1 answer progress on the current question beat
  i: number;                    // current beat index (JS)
  beat: BaseBeat;               // current beat (for bubbles etc.)
  picked: string | null;        // which scene target is chosen (null until answered)
  onPick: (id: string, correct: boolean) => void;  // scene reports a scene-driven answer
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
  camera, ground,
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
  /** The scene's ground line, if it is not the kit's 500. Only used by `camera`. */
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
  const bt = useSharedValue(0);
  const bi = useSharedValue(0);
  const qv = useSharedValue(0);
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

  const camNow = useDerivedValue(() => {
    if (!cam || cam.length === 0) return NEUTRAL;
    const n = Math.min(Math.max(bi.value, 0), cam.length - 1);
    const box = targetBox.value;
    const frame = (k: number) => {
      'worklet';
      if (!needsBox[k]) return cam[k];
      if (!box) return { ...NEUTRAL, tr: cam[k].tr };
      return containShot(cam[k], box, band);
    };
    return shotAt(frame(n > 0 ? n - 1 : 0), frame(n), bt.value);
  });
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
    bt.value = 0;
    bi.value = i;
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
    bt.value += dt;
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
    // NO SOUND ON ADVANCING A BEAT. There was a page turn here and it fired ten
    // times a lesson, which is the single most frequent thing in a reading — and
    // "I don't want a sound every time a user clicks to the next section" is the
    // right call. Tapping forward is not an event, it is the medium.
    if (last) { setDone(true); return; }
    setPicked(null);
    setPickedOk(false);
    setI((n) => n + 1);
  }, [locked, last, sounded]);

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
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
      </View>

      <Pressable style={styles.body} onPress={advance} disabled={locked}>
        <Animated.View style={[styles.stageWrap, gone && styles.stageGone, stageStyle]} onLayout={onStage}>
          {fit > 0 && !gone ? (
            <View style={{ width: STAGE_W * fit, height: bandH * fit, overflow: 'hidden' }}>
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
                      style={[{ width: STAGE_W, height: STAGE_H, transformOrigin: '0% 0%' }, camStyle]}
                    >
                      <TargetCountProvider onCount={setTargetCount} onBox={onBox} host={camHost}>
                        <Scene clock={clock} bt={bt} bi={bi} qv={qv} i={i} beat={beat} picked={picked} sound={sounded} onPick={(id, ok) => choose(id, ok, true)} />
                      </TargetCountProvider>
                    </Animated.View>
                  ) : (
                    <TargetCountProvider onCount={setTargetCount}>
                      <Scene clock={clock} bt={bt} bi={bi} qv={qv} i={i} beat={beat} picked={picked} sound={sounded} onPick={(id, ok) => choose(id, ok, true)} />
                    </TargetCountProvider>
                  )}
                </View>
              </View>
            </View>
          ) : null}
        </Animated.View>

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
