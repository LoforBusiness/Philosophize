import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { View, Text, Pressable, StyleSheet, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useFrameCallback, useAnimatedStyle, withTiming, Easing, type SharedValue,
} from 'react-native-reanimated';
import type { Lesson } from '@/data/types';
import { getLessonById } from '@/data';
import { exitLesson } from '../exitLesson';
import SketchIcon from '@/components/shared/SketchIcon';
import { useUserDataStore } from '@/stores/userDataStore';
import { useUIStore } from '@/stores/uiStore';
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
}
export type SceneComponent = ComponentType<SceneApi>;

export default function CinematicPlayer({
  lesson, beats, Scene, stageGone = (b) => !!b.summary, band = [BAND_T, BAND_B],
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
}) {
  const toggleQuote = useUserDataStore((s) => s.toggleQuote);
  const savedQuotes = useUserDataStore((s) => s.savedQuotes);
  const showReward = useUIStore((s) => s.showReward);

  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedOk, setPickedOk] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [asked, setAsked] = useState(0);
  const [done, setDone] = useState(false);
  const [boxSize, setBoxSize] = useState({ w: 0, h: 0 });
  // Which beat's content the DECK is currently showing. It lags `i` by the fade-out,
  // because the deck keeps the outgoing beat on screen until it has faded to nothing
  // — see `gone` below.
  const [shown, setShown] = useState(0);

  const beat = beats[i];
  const clock = useSharedValue(0);
  const bt = useSharedValue(0);
  const bi = useSharedValue(0);
  const qv = useSharedValue(0);
  // Progress fills SMOOTHLY toward the next mark rather than jumping on each tap.
  const progress = useSharedValue((i + 1) / beats.length);
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  // Rewind the beat clock DURING RENDER (not in an effect): an effect paints one
  // frame of the previous beat's finished state first, which reads as a pop.
  const prevBeat = useRef(-1);
  if (prevBeat.current !== i) {
    prevBeat.current = i;
    bt.value = 0;
    bi.value = i;
    qv.value = 0;
  }

  useFrameCallback((f) => {
    'worklet';
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;
    clock.value += dt;
    bt.value += dt;
  }, true);

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
      xp: COMPLETION_XP + correct * 5,
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
    if (last) { setDone(true); return; }
    setPicked(null);
    setPickedOk(false);
    setI((n) => n + 1);
  }, [locked, last]);

  const choose = useCallback((id: string, isCorrect: boolean, graded: boolean) => {
    if (picked !== null) return;
    setPicked(id);
    setPickedOk(isCorrect);
    if (graded) {
      setAsked((n) => n + 1);
      if (isCorrect) setCorrect((n) => n + 1);
    }
  }, [picked]);

  const onStage = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBoxSize((b) => (Math.abs(b.w - width) < 1 && Math.abs(b.h - height) < 1 ? b : { w: width, h: height }));
  }, []);

  if (done) return null;   // the effect above shows the reward and pops this screen

  // Fit the BAND, not the whole design space — see BAND_T/BAND_B in cinematicKit.
  const bandT = band[0];
  const bandH = band[1] - band[0];
  const fit = boxSize.w > 0 ? Math.min(boxSize.w / STAGE_W, boxSize.h / bandH) : 0;

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
                  <Scene clock={clock} bt={bt} bi={bi} qv={qv} i={i} beat={beat} picked={picked} onPick={(id, ok) => choose(id, ok, true)} />
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
                {beat.text ? <Text style={styles.narr}>{beat.text}</Text> : null}

                {beat.quote ? (
                  <QuoteCard
                    q={beat.quote}
                    saved={quoteSaved}
                    onToggle={() =>
                      toggleQuote({
                        id: beat.quote!.id,
                        text: beat.quote!.text,
                        author: beat.quote!.author,
                        philosopherId: beat.quote!.philosopherId ?? '',
                        branchSlugs: beat.quote!.branchSlugs ?? [],
                        savedAt: Date.now(),
                      })
                    }
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
