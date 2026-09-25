import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useFrameCallback, useAnimatedReaction, useDerivedValue, useAnimatedStyle,
  useAnimatedProps, runOnJS, type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import Stickman from '@/components/lesson/cinematic/Stickman';
import ObjectArt from '@/components/lesson/cinematic/ObjectArt';
import { stageToneOf } from '@/components/lesson/cinematic/stageTones';
import { solve, bundle, clamp01, type Bundle } from '@/components/lesson/cinematic/rig';
import { BY_ID } from '@/components/lesson/cinematic/wardrobe';
import { DEEP, TEAL, OLIVE, SAGE, EMBER, INK, MID, PAPER_LIT, FLOOR, FLOOR_CUT, FLAT_EDGE } from '@/components/shared/tone';
import { C, BRANCH } from '@/constants/design';
import { useUserDataStore } from '@/stores/userDataStore';
import { track } from '@/lib/posthog';
import { LINES } from './professorScript';
import { VOICE_LINES } from './professorVoice';
import { layoutChalk, CHALK_W, type ChalkPiece, type ChalkStroke } from './chalk';
import {
  professorAt, lineAt, chalkWindow, LINE_T, T_END, K_PROF, WIPE,
} from './professorAt';
import {
  STAGE_W, STAGE_H, GROUND, BOARD_S, CHALK_X, CHALK_Y, SLATE, EASEL_BACK, BOARD_FRAME, LEDGE,
  CLOCK, CLOCK_PARTS, SECOND_HAND, GLOBE, BOOKS_LEFT, BOOKS_RIGHT, BOOKS_FAR,
} from './lectureRoom';
import { lectureVoice } from './lectureVoice';

// ─────────────────────────────────────────────────────────────────────────────
// THE PROFESSOR'S INTRO — a forty-second lecture, and then the door to the lessons.
//
// A professor walks into a lecture room, stops beside a chalkboard, and speaks six
// lines about what the lessons are and what they are worth; as he speaks, the chalk
// writes each line's drawing on the board. It is opened by the reader — from Home's
// Quick Start or the Learn tab — and never plays by itself (2026-09-25). It ends by
// calling `onDone`, and the caller decides what comes next: the paywall for a free
// reader, back to where they were for one with the Pass.
//
// WHAT IS WHOSE:
//   ./professorAt      where he is and what he is doing at time t; the chalk's clock
//   ./lectureRoom      the room: the easel, the clock, the books and the globe
//   ./chalk            what each board says, as pieces with every stroke timed
//   ./professorScript  the six lines — the words live there and only there
//   ./professorVoice   GENERATED — where each line sits in the MP3, when each word lands
//   ./lectureVoice     plays a line; silent on the web and on a binary without audio
//
// ONE CLOCK RUNS ALL OF IT (the seated welcome's construction): every pose, every
// stroke of chalk and every word is a function of `clock`, so `?t=12.4` on the web
// build shows any instant, and the voice is started by the same clock one line at a
// time, so a dropped frame can never let the words and the voice drift apart.
//
// A PIECE OF CHALK IS ONE SMALL <Svg>, sized to its own box, and never a board-sized
// one: react-native-svg redraws a whole SvgView for every animated property written
// to it (CLAUDE.md §17 rule 7, §19's GPU budget).
// ─────────────────────────────────────────────────────────────────────────────

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** The chalk as it lands: nearly white, a touch of the slate showing through. */
const CHALK_OPACITY = 0.92;
/** The dust a finished stroke leaves on the slate. */
const DUST_OPACITY = 0.12;
const DUST_W = CHALK_W * 2.6;
/** Four caption lines at the caption's line height. */
const CAPTION_ROOM = 4 * 30;

/** The room's tones, struck from the palette the way a lesson's stage is. */
const WOOD = stageToneOf(OLIVE);
const BRASS = stageToneOf(C.HUE);
const BOOK_TONES = [
  stageToneOf(TEAL), stageToneOf(BRANCH.metaphysics), stageToneOf(SAGE),
  stageToneOf(BRANCH.logic), stageToneOf(EMBER),
];
const GLOBE_TONE = stageToneOf(TEAL);
const SCHOLAR = BY_ID.scholar.pieces;

const FREEZE_T =
  __DEV__ && typeof window !== 'undefined' && window.location
    ? parseFloat(new URLSearchParams(window.location.search).get('t') ?? '')
    : NaN;

export default function ProfessorIntro({ onDone }: { onDone: (how: 'finished' | 'skipped') => void }) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const voiceOn = useUserDataStore((s) => s.settings.narration);

  const scale = W / STAGE_W;
  // THE ROOM AND ITS CAPTION ARE ONE BLOCK, centred on the phone. Pinned to the top,
  // a tall phone left half the screen as bare floor under a room drawn in its upper
  // third. The caption is given four lines of room, the most any line needs.
  const block = STAGE_H * scale + 12 + CAPTION_ROOM;
  const stageTop = Math.max(insets.top + 52, Math.round((H - block) / 2));

  const clock = useSharedValue(isNaN(FREEZE_T) ? 0 : FREEZE_T);
  const running = useSharedValue(isNaN(FREEZE_T) ? 1 : 0);
  const ended = useRef(false);
  // Which boards are mounted: the current one and the one being wiped.
  const [line, setLine] = useState(isNaN(FREEZE_T) ? -1 : lineAtJS(FREEZE_T));

  const boards = useMemo(() => LINES.map((l) => layoutChalk(l.chalk)), []);

  useEffect(() => {
    track('intro_started', {});
    if (voiceOn && isNaN(FREEZE_T)) lectureVoice.prepare();
    return () => lectureVoice.release();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrameCallback((f) => {
    'worklet';
    if (!running.value) return;
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;
    clock.value += dt;
  });

  // ── a line starts when the clock reaches it: its board, and its voice ─────
  const onLine = useCallback((i: number) => {
    setLine(i);
    if (voiceOn && !ended.current) lectureVoice.playLine(i);
  }, [voiceOn]);
  useAnimatedReaction(
    () => lineAt(clock.value),
    (cur, prev) => {
      if (cur !== prev && prev !== null && cur >= 0) runOnJS(onLine)(cur);
    },
  );

  // ── the end ───────────────────────────────────────────────────────────────
  const finish = useCallback((how: 'finished' | 'skipped') => {
    if (ended.current) return;
    ended.current = true;
    running.value = 0;
    lectureVoice.stop();
    if (how === 'finished') track('intro_completed', {});
    else track('intro_skipped', { at_line: Math.max(0, lineAtJS(clock.value)) + 1 });
    onDone(how);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDone]);
  useAnimatedReaction(
    () => clock.value >= T_END,
    (past, was) => {
      if (past && !was && running.value) runOnJS(finish)('finished');
    },
  );

  // ── the professor ─────────────────────────────────────────────────────────
  const DB = useDerivedValue<Bundle>(() => {
    const F = professorAt(clock.value);
    const s = F.stance;
    const j = solve({
      x: F.x, groundY: GROUND, k: K_PROF, dir: F.dir,
      tilt: s.tilt, neck: s.neck, bob: s.bob,
      footL: s.footL, footR: s.footR, fistL: s.fistL, fistR: s.fistR,
    });
    return bundle(j, K_PROF, 1, F.dir);
  });

  // The room settles in over the first half second, before he arrives.
  const roomStyle = useAnimatedStyle(() => ({ opacity: clamp01(clock.value / 0.5) }));
  // The clock's second hand, ticking once a second with a small snap.
  const secondStyle = useAnimatedStyle(() => {
    const s = Math.floor(clock.value);
    const frac = clamp01((clock.value - s) / 0.14);
    return { transform: [{ rotate: `${(s + frac) * 6}deg` }] };
  });

  const stageWrap: ViewStyle = {
    position: 'absolute', left: 0, top: stageTop, width: STAGE_W, height: STAGE_H,
    transform: [{ scale }], transformOrigin: 'top left',
  };
  const floorTop = stageTop + GROUND * scale;
  const captionTop = stageTop + STAGE_H * scale + 12;

  return (
    <View style={styles.root} nativeID="professor-intro">
      {/* The floor runs to the bottom of the DEVICE, as the welcome's does, so a tall
          phone never shows the wall under the room; the caption sits on it. */}
      <View pointerEvents="none" style={[styles.floor, { top: floorTop }]}>
        <View style={styles.floorCut} />
      </View>

      <Animated.View pointerEvents="none" style={[stageWrap, roomStyle]} nativeID="professor-stage">
        <ObjectArt parts={EASEL_BACK} tone={WOOD} />
        <ObjectArt parts={BOARD_FRAME} tone={WOOD} />
        <View style={[styles.slate, { left: SLATE.x, top: SLATE.y, width: SLATE.w, height: SLATE.h }]} />
        {boards.map((pieces, i) =>
          i === line || i === line - 1 ? <Board key={i} index={i} pieces={pieces} clock={clock} /> : null,
        )}
        <ObjectArt parts={LEDGE} tone={WOOD} />
        <ObjectArt parts={CLOCK_PARTS} tone={BRASS} />
        <Animated.View style={[styles.secondHand, secondStyle]}>
          <View style={styles.secondNeedle} />
        </Animated.View>
        {BOOKS_LEFT.map((b, i) => <ObjectArt key={`l${i}`} parts={b.parts} tone={BOOK_TONES[b.tone]} />)}
        <ObjectArt parts={GLOBE} tone={GLOBE_TONE} />
        {BOOKS_RIGHT.map((b, i) => <ObjectArt key={`r${i}`} parts={b.parts} tone={BOOK_TONES[b.tone]} />)}
        {BOOKS_FAR.map((b, i) => <ObjectArt key={`f${i}`} parts={b.parts} tone={BOOK_TONES[b.tone]} />)}
        <Stickman D={DB} k={K_PROF} wear={SCHOLAR} />
      </Animated.View>

      <View pointerEvents="none" style={[styles.captionBox, { top: captionTop }]} nativeID="professor-caption">
        {line >= 0 ? <Caption key={line} index={line} clock={clock} /> : null}
      </View>

      <Pressable
        onPress={() => finish('skipped')}
        style={[styles.skip, { top: insets.top + 8 }]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Skip the introduction"
      >
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>
    </View>
  );
}

/** lineAt, off the UI thread, for the analytics and the first frame of a frozen clock. */
function lineAtJS(t: number): number {
  let idx = -1;
  for (let i = 0; i < LINE_T.length; i++) if (t >= LINE_T[i]) idx = i;
  return idx;
}

// ── a board of chalk ─────────────────────────────────────────────────────────

const Board = memo(function Board({ index, pieces, clock }: {
  index: number; pieces: ChalkPiece[]; clock: SharedValue<number>;
}) {
  const [a, b] = useMemo(() => chalkWindow(index), [index]);
  const next = LINE_T[index + 1] ?? Infinity;
  // A board stays up until the next line starts, then is wiped.
  const wipe = useAnimatedStyle(() => ({ opacity: 1 - clamp01((clock.value - next) / WIPE) }));
  const progress = useDerivedValue(() => clamp01((clock.value - a) / (b - a)));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, wipe]} nativeID={`chalk-board-${index}`}>
      {pieces.map((p, k) => <Piece key={k} piece={p} progress={progress} />)}
    </Animated.View>
  );
});

function Piece({ piece, progress }: { piece: ChalkPiece; progress: SharedValue<number> }) {
  const { box } = piece;
  const dust = useMemo(() => piece.strokes.map((s) => s.d).join(' '), [piece]);
  const dustProps = useAnimatedProps(() => ({
    strokeOpacity: DUST_OPACITY * clamp01((progress.value - piece.t1) / 0.05),
  }));
  return (
    <Svg
      width={box.w * BOARD_S}
      height={box.h * BOARD_S}
      viewBox={`0 0 ${box.w} ${box.h}`}
      style={{ position: 'absolute', left: CHALK_X + box.x * BOARD_S, top: CHALK_Y + box.y * BOARD_S }}
    >
      <AnimatedPath
        d={dust}
        stroke={PAPER_LIT}
        strokeWidth={DUST_W}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animatedProps={dustProps}
      />
      {piece.strokes.map((s, i) => <Stroke key={i} stroke={s} progress={progress} />)}
    </Svg>
  );
}

function Stroke({ stroke, progress }: { stroke: ChalkStroke; progress: SharedValue<number> }) {
  // The length is padded a little so a round cap never shows before the stroke begins.
  const len = stroke.len + CHALK_W;
  const props = useAnimatedProps(() => {
    const u = clamp01((progress.value - stroke.t0) / (stroke.t1 - stroke.t0));
    return { strokeDashoffset: len * (1 - u), strokeOpacity: u > 0 ? CHALK_OPACITY : 0 };
  });
  return (
    <AnimatedPath
      d={stroke.d}
      stroke={PAPER_LIT}
      strokeWidth={CHALK_W}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={[len, len]}
      fill="none"
      animatedProps={props}
    />
  );
}

// ── the caption: each word arrives as the voice reaches it ───────────────────

function Caption({ index, clock }: { index: number; clock: SharedValue<number> }) {
  const words = VOICE_LINES[index].text.split(' ');
  const times = VOICE_LINES[index].words;
  const t0 = LINE_T[index];
  return (
    <View style={styles.caption}>
      {words.map((w, k) => <Word key={k} word={w} at={t0 + (times[k] ?? 0)} clock={clock} />)}
    </View>
  );
}

function Word({ word, at, clock }: { word: string; at: number; clock: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const u = clamp01((clock.value - at) / 0.2);
    return { opacity: u, transform: [{ translateY: (1 - u) * 6 }] };
  });
  return <Animated.Text style={[styles.word, style]}>{word} </Animated.Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.paper, overflow: 'hidden' },
  floor: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: FLOOR },
  floorCut: { height: 2, backgroundColor: FLOOR_CUT },
  slate: { position: 'absolute', backgroundColor: DEEP, borderRadius: 2 },
  secondHand: {
    position: 'absolute', left: CLOCK.cx - 1, top: CLOCK.cy - SECOND_HAND, width: 2, height: SECOND_HAND * 2,
  },
  secondNeedle: { width: 1.4, height: SECOND_HAND, backgroundColor: EMBER, marginLeft: 0.3 },
  captionBox: { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
  caption: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  word: {
    fontFamily: 'PlayfairDisplay_700Bold', fontSize: 21, lineHeight: 30, color: INK,
  },
  skip: {
    position: 'absolute', right: 16, minWidth: 64, height: 36, paddingHorizontal: 16,
    borderRadius: 18, borderWidth: 1.5, borderColor: FLAT_EDGE, backgroundColor: PAPER_LIT,
    alignItems: 'center', justifyContent: 'center',
  },
  skipText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: MID, letterSpacing: 0.4 },
});
