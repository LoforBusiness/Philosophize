import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useFrameCallback,
  useDerivedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useUserDataStore } from '@/stores/userDataStore';
import { C } from '@/constants/design';
import { FLAT_FACE, FLAT_EDGE, FLOOR, FLOOR_CUT, EMBER, TEAL, mix } from '@/components/shared/tone';
import Stickman from '@/components/lesson/cinematic/Stickman';
import { solve, bundle, BONE_SRC, STR, type Bundle, type P2 } from '@/components/lesson/cinematic/rig';
import { BY_ID } from '@/components/lesson/cinematic/wardrobe';
import { clamp01, easeOutCubic, easeOutBack, INK, PAPER, SOFT } from './ease';
import { WELCOME_VERSION } from './WelcomeAnimation';
import Parlour from './Parlour';
import {
  seatedAt, lineAt, K_SEAT, GROUND, LINE_T, T_SPEAK0, T_TIP0, T_END, T_CROSSED,
} from './seatedHost';
import { VOICE_LINES } from './welcomeVoice';
import { hostVoice } from './hostVoice';

// ─────────────────────────────────────────────────────────────────────────────
// THE FIRST SCREEN, SEATED.
//
// The owner's brief (2026-09-24): the stickman in the top hat walks in, sits down in
// a chair, crosses his legs "so it looks real, and you can tell that it's crossing
// his legs", sits very distinguished — and then talks, in the narrator's voice, with
// good pauses:
//
//   So you want to learn philosophy? · Or possibly you're already a well-distinguished
//   individual getting back into philosophy. · Whichever the case, you're here to
//   learn. And I have the perfect program for you to achieve your goals in vast
//   knowledge of philosophy. · The only thing I ask of you is mental effort and
//   curiosity. · As Socrates once said, the unexamined life is not worth living. ·
//   Thus begins your journey.
//
// It is the older intro's replacement on trial, so the older one (./WelcomeAnimation)
// is left whole: app/index.tsx picks between them, and going back is one line.
//
// WHAT IS WHOSE:
//   ./seatedHost     where he is and what he is doing at time t (lesson rig poses)
//   ./Parlour        the room, and everything in it that moves
//   ./welcomeVoice   GENERATED — the seven lines, where they sit in the MP3, and when
//                    each word lands (scripts/make-welcome-voice.mjs)
//   ./hostVoice      plays a line; silent on the web and on a binary without audio
//
// ONE CLOCK RUNS ALL OF IT, and it is a pure input: every pose, every prop and every
// word is a function of `clock`, so `?t=12.4` on the web build shows any instant.
// The voice is started by the same clock, one line at a time, so a dropped frame can
// never let the words and the voice come apart by more than a line.
// ─────────────────────────────────────────────────────────────────────────────

/** The design stage — the same 400 × 800 every welcome drawing uses. */
const STAGE_W = 400;
const STAGE_H = 800;
const DEG = 180 / Math.PI;

/** The top hat, drawn here rather than worn, so he can lift it. */
const HAT = [
  { x: 0, y: -13, w: 56, h: 4, band: false },
  { x: 0, y: -26, w: 30, h: 26, band: false },
];
/** The hat's band — the costume's one spark of colour. */
const BAND = { x: 0, y: -16.5, w: 30, h: 4.5 };
/** Everything the dandy wears on his head that is not the hat: the monocle and its cord. */
const MONOCLE = BY_ID.dandy.pieces.filter((p) => p.at === 'head' && p.y >= 0);

// ── the bubble ───────────────────────────────────────────────────────────────
const BUB = {
  cx: 200,
  bottom: 422,
  maxW: 344,
  padX: 18,
  padY: 12,
  lh: 31,
  font: 23.5,
  tail: 15,
};
/** When the bubble goes, ahead of the hat. */
const T_BUBBLE_OUT = T_TIP0 + 0.15;

const FREEZE_T =
  __DEV__ && typeof window !== 'undefined' && window.location
    ? parseFloat(new URLSearchParams(window.location.search).get('t') ?? '')
    : NaN;

type XF = Bundle['thighL'];

interface Props {
  /** Held at 0 until the launch screen has lifted. */
  start?: boolean;
  onDone?: () => void;
}

export default function SeatedWelcome({ start = true, onDone }: Props) {
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const setWelcomeVersion = useUserDataStore((s) => s.setWelcomeVersion);
  const voiceOn = useUserDataStore((s) => s.settings.narration);

  const scale = Math.min(W / STAGE_W, H / STAGE_H);
  const offX = (W - STAGE_W * scale) / 2;
  const offY = (H - STAGE_H * scale) / 2;

  const clock = useSharedValue(0);
  const started = useSharedValue(start ? 1 : 0);
  const leaving = useSharedValue(0);
  const rootOpacity = useSharedValue(1);
  const [endReady, setEndReady] = useState(false);

  useEffect(() => {
    if (!isNaN(FREEZE_T)) return;
    started.value = start ? 1 : 0;
    if (start && voiceOn) hostVoice.prepare();
  }, [start]);

  useEffect(() => {
    if (isNaN(FREEZE_T)) return;
    started.value = 0;
    clock.value = FREEZE_T;
    if (FREEZE_T >= T_END) setEndReady(true);
  }, []);

  useEffect(() => () => hostVoice.release(), []);

  useFrameCallback((f) => {
    'worklet';
    if (!started.value) return;
    let dt = (f.timeSincePreviousFrame ?? 16) / 1000;
    if (dt > 0.05) dt = 0.05;
    clock.value += dt;
    // DEV-ONLY: a recording of the web build reads the intro's own clock here, so the
    // voice can be laid under the picture where the phone would play it. Stripped
    // from release bundles by __DEV__.
    if (__DEV__) (globalThis as { __welcomeClock?: number }).__welcomeClock = clock.value;
  });

  useAnimatedReaction(
    () => clock.value >= T_END,
    (past, was) => {
      if (past && !was) runOnJS(setEndReady)(true);
    },
  );

  // ── the voice: a line starts when the clock reaches it ────────────────────
  const speak = useCallback((i: number) => {
    if (leaving.value || !voiceOn) return;
    hostVoice.playLine(i);
  }, [voiceOn]);
  useAnimatedReaction(
    () => (started.value ? lineAt(clock.value) : -1),
    (cur, prev) => {
      if (cur >= 0 && cur !== prev && prev !== null) runOnJS(speak)(cur);
    },
  );

  // ── the figure ────────────────────────────────────────────────────────────
  const D = useDerivedValue(() => {
    const F = seatedAt(clock.value);
    const s = F.stance;
    const j = solve({
      x: F.x, groundY: GROUND, k: K_SEAT, dir: F.dir,
      tilt: s.tilt, neck: s.neck, bob: s.bob,
      footL: s.footL, footR: s.footR, fistL: s.fistL, fistR: s.fistR,
    });
    const bone = (a: P2, b: P2): XF => {
      'worklet';
      return [
        { translateX: a.x }, { translateY: a.y },
        { rotate: `${Math.atan2(b.y - a.y, b.x - a.x) * DEG}deg` },
        { scaleX: Math.hypot(b.x - a.x, b.y - a.y) / BONE_SRC },
      ];
    };
    const at = (p: P2) => {
      'worklet';
      return [{ translateX: p.x }, { translateY: p.y }];
    };
    // Where the near thigh starts to pass over the far knee.
    const mid = { x: j.hipR.x + (j.kneeR.x - j.hipR.x) * 0.42, y: j.hipR.y + (j.kneeR.y - j.hipR.y) * 0.42 };
    const neck = Math.atan2(j.head.y - j.shB.y, j.head.x - j.shB.x) + Math.PI / 2;
    return {
      b: bundle(j, K_SEAT, 1, F.dir),
      dir: F.dir,
      head: j.head,
      wrR: j.wrR,
      neck,
      hatLift: F.hatLift,
      // How crossed he is: the paper edge only belongs on a leg that is over another.
      crossed: clamp01((clock.value - (T_CROSSED - 0.55)) / 0.45),
      edge: {
        thigh: bone(mid, j.kneeR), knee: at(j.kneeR), shin: bone(j.kneeR, j.ankR), ank: at(j.ankR),
        farmL: bone(j.elL, j.wrL), farmR: bone(j.elR, j.wrR),
        elL: at(j.elL), elR: at(j.elR), wrL: at(j.wrL), wrR: at(j.wrR),
      },
    };
  });
  const DB = useDerivedValue<Bundle>(() => D.value.b);

  // ── leaving ───────────────────────────────────────────────────────────────
  const finish = useCallback(() => {
    setWelcomeVersion(WELCOME_VERSION);
    onDone?.();
  }, [setWelcomeVersion, onDone]);
  const leave = useCallback(() => {
    if (leaving.value) return;
    leaving.value = 1;
    hostVoice.stop();
    rootOpacity.value = withTiming(0, { duration: 380 }, (done) => {
      'worklet';
      if (done) runOnJS(finish)();
    });
  }, [finish]);

  const rootStyle = useAnimatedStyle(() => ({ opacity: rootOpacity.value }));
  const skipStyle = useAnimatedStyle(() => ({ opacity: 1 - easeOutCubic(clamp01((clock.value - T_END) / 0.5)) }));

  const stageWrap: ViewStyle = {
    position: 'absolute', left: offX, top: offY, width: STAGE_W, height: STAGE_H,
    transform: [{ scale }], transformOrigin: 'top left',
  };

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      {/* The wall is the page. The floor runs to the bottom of the DEVICE, not of the
          stage, so a tall phone never shows paper under the room. */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, top: offY + GROUND * scale, bottom: 0, backgroundColor: FLOOR }}
      >
        <View style={{ height: 2, backgroundColor: FLOOR_CUT }} />
      </View>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, top: offY + (GROUND - 12) * scale, height: 12 * scale, backgroundColor: FLAT_EDGE }}
      />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={stageWrap}>
          <Parlour clock={clock} />
          <Stickman D={DB} k={K_SEAT} wear={MONOCLE} />
          <LegEdge D={D} />
          <Hat D={D} />
        </View>
      </View>

      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View pointerEvents="box-none" style={stageWrap}>
          <Bubble clock={clock} D={D} />
          <EndCard clock={clock} endReady={endReady} onBegin={leave} />
        </View>
      </View>

      <Animated.View style={[styles.skip, { top: insets.top + 10, right: 16 }, skipStyle]}>
        <Pressable onPress={leave} hitSlop={14} disabled={endReady}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}


// ── the crossed leg, made legible ────────────────────────────────────────────
//
// The figure is one solid ink, so where the near leg lies over the far knee there is
// no edge at all: the two knees fuse into one lump and "crossed" reads as "a bent
// leg with a bump on it". A cartoonist rubs out a thin line of the thing behind, and
// in a one-colour drawing that line is PAPER — the same construction the wardrobe's
// hats use for their seat (`Piece.paper`).
//
// So: a paper halo round the near thigh's outer half, knee and shin, and then the
// near leg drawn again in ink on top of it, and the forearms and hands too, because
// they rest on that knee and the halo would otherwise cut a line through them. The
// far leg is the only thing the halo is allowed to cut, which is exactly the point.
const GAP = 1.3;

function LegEdge({ D }: { D: SharedValue<any> }) {
  const limb = STR.limb * K_SEAT;
  const halo = limb + 2 * GAP * K_SEAT;
  const S = useMemo(() => {
    const bone = (thick: number, color: string): ViewStyle => ({
      position: 'absolute', left: 0, top: -thick / 2, width: BONE_SRC, height: thick,
      backgroundColor: color, transformOrigin: '0% 50%',
    });
    const dot = (r: number, color: string): ViewStyle => ({
      position: 'absolute', left: -r, top: -r, width: 2 * r, height: 2 * r, borderRadius: r, backgroundColor: color,
    });
    return {
      paperBone: bone(halo, C.paper), paperDot: dot(halo / 2, C.paper),
      inkBone: bone(limb, INK), inkDot: dot(limb / 2, INK),
    };
  }, [limb, halo]);
  const vis = useAnimatedStyle(() => ({ opacity: D.value.crossed }));
  const t = (key: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks -- a fixed list of keys, called in a fixed order
    useAnimatedStyle(() => ({ transform: D.value.edge[key] }));
  const thigh = t('thigh'); const knee = t('knee'); const shin = t('shin'); const ank = t('ank');
  const farmL = t('farmL'); const farmR = t('farmR'); const elL = t('elL'); const elR = t('elR');
  const wrL = t('wrL'); const wrR = t('wrR');
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0 }, vis]}>
      <Animated.View style={[S.paperBone, thigh]} />
      <Animated.View style={[S.paperDot, knee]} />
      <Animated.View style={[S.paperBone, shin]} />
      <Animated.View style={[S.inkBone, thigh]} />
      <Animated.View style={[S.inkBone, shin]} />
      <Animated.View style={[S.inkDot, knee]} />
      <Animated.View style={[S.inkDot, ank]} />
      <Animated.View style={[S.inkBone, farmL]} />
      <Animated.View style={[S.inkBone, farmR]} />
      <Animated.View style={[S.inkDot, elL]} />
      <Animated.View style={[S.inkDot, elR]} />
      <Animated.View style={[S.inkDot, wrL]} />
      <Animated.View style={[S.inkDot, wrR]} />
    </Animated.View>
  );
}

// ── the hat ──────────────────────────────────────────────────────────────────
// Rides the head and turns with the neck, exactly as a worn piece does in Stickman —
// and, because it is drawn here, can come OFF the head: at the end he lifts it and
// tips it forward, and sets it back.
//
// THE HAND CARRIES IT. The first version lifted the hat by a fixed offset while the
// hand rose toward it, and at 2× the hat hung in the air a finger's width above his
// head with the hand nowhere under it — a hat levitating. So during the tip the hat
// is placed FROM the hand: the front of the brim (`GRIP`, in the hat's own frame) is
// put where his fist is, and the placement blends between that and the head as the
// grip comes on and off. Wherever the arm goes, the hat goes with it.
const GRIP = { x: 25, y: -11.5 };
function Hat({ D }: { D: SharedValue<any> }) {
  const k = K_SEAT;
  const piece = (p: { x: number; y: number; w: number; h: number }) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks -- three fixed pieces
    useAnimatedStyle(() => {
      const F = D.value;
      const dirS = F.dir < 0 ? -1 : 1;
      const lift = F.hatLift;
      const rot = F.neck + dirS * 0.3 * lift;
      const c = Math.cos(rot); const s = Math.sin(rot);
      // Where the hat's origin must be for the brim's front to sit in his fist.
      const gx = GRIP.x * dirS; const gy = GRIP.y;
      const hx = F.wrR.x - (gx * c - gy * s) * k;
      const hy = F.wrR.y - (gx * s + gy * c) * k;
      const ox = F.head.x + (hx - F.head.x) * lift;
      const oy = F.head.y + (hy - F.head.y) * lift;
      const lx = p.x * dirS; const ly = p.y;
      return {
        transform: [
          { translateX: ox + (lx * c - ly * s) * k },
          { translateY: oy + (lx * s + ly * c) * k },
          { rotate: `${rot * DEG}deg` },
        ],
      };
    });
  const brim = piece(HAT[0]);
  const crown = piece(HAT[1]);
  const band = piece(BAND);
  const box = (p: { w: number; h: number }, color: string, r = 1): ViewStyle => ({
    position: 'absolute', left: (-p.w / 2) * k, top: (-p.h / 2) * k, width: p.w * k, height: p.h * k,
    backgroundColor: color, borderRadius: r * k,
  });
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0 }}>
      <Animated.View style={[box(HAT[1], INK, 1.5), crown]} />
      <Animated.View style={[box(BAND, EMBER, 0.5), band]} />
      <Animated.View style={[box(HAT[0], INK, 2), brim]} />
    </View>
  );
}

// ── the speech bubble ────────────────────────────────────────────────────────
//
// Anchored at its BOTTOM, so it grows upward as he reaches a new row and its notch
// never moves off his head. A long line turns a PAGE rather than growing a fourth row:
// the words of a page are laid out from its first frame so the centring never shifts,
// and each fades up on the moment the voice reaches it (./welcomeVoice).
function Bubble({ clock, D }: { clock: SharedValue<number>; D: SharedValue<any> }) {
  const [at, setAt] = useState<[number, number]>([-1, 0]);
  // Declared first: the page reaction below clears it, and a worklet may not reach
  // a const that is still in its temporal dead zone.
  const rowAt = useSharedValue<number[]>([]);
  useAnimatedReaction(
    () => {
      const t = clock.value;
      const li = lineAt(t);
      if (li < 0) return -1;
      const L = VOICE_LINES[li];
      let page = 0;
      for (let p = 1; p < L.pages.length; p++) if (t >= LINE_T[li] + L.words[L.pages[p]] - 0.12) page = p;
      return li * 10 + page;
    },
    (cur, prev) => {
      if (cur === prev) return;
      // Forget the last page's rows on the frame the page turns, or the new page
      // opens at the old one's height until its own words have been measured.
      rowAt.value = [];
      runOnJS(setAt)(cur < 0 ? [-1, 0] : [Math.floor(cur / 10), cur % 10]);
    },
  );
  // [when the word lands, which row it is on] for the page on screen. The bubble is
  // only as tall as the rows he has REACHED, so a three-row page does not open as a
  // tall empty card and fill from the top; it grows a row as the voice gets there.
  // Told 0.22s early, so the row is open before its first word fades up into it.
  const h = useSharedValue(BUB.lh + 2 * BUB.padY);
  useAnimatedReaction(
    () => {
      const r = rowAt.value;
      const t = clock.value;
      let n = 1;
      for (let i = 0; i + 1 < r.length; i += 2) if (t >= r[i] - 0.22 && r[i + 1] + 1 > n) n = r[i + 1] + 1;
      return n;
    },
    (n, was) => {
      if (n === was) return;
      h.value = withTiming(n * BUB.lh + 2 * BUB.padY, { duration: 170 });
    },
  );

  const box = useAnimatedStyle(() => {
    const t = clock.value;
    const inA = easeOutBack(clamp01((t - (T_SPEAK0 - 0.3)) / 0.38));
    const out = 1 - easeOutCubic(clamp01((t - T_BUBBLE_OUT) / 0.35));
    return {
      height: h.value,
      opacity: clamp01((t - (T_SPEAK0 - 0.3)) / 0.2) * out,
      transform: [{ translateY: 8 * (1 - inA) }, { scale: 0.86 + 0.14 * inA }],
    };
  });
  // The notch sits over his head, as near as the bubble's corners allow.
  const notch = useAnimatedStyle(() => {
    const hx = D.value.head.x;
    return { transform: [{ translateX: Math.max(BUB.cx - 110, Math.min(BUB.cx + 110, hx + 6)) }] };
  });

  const [li, page] = at;
  const onRows = useCallback((r: number[]) => { rowAt.value = r; }, []);
  return (
    <View pointerEvents="none" style={styles.bubbleRow}>
      <Animated.View style={[styles.bubble, box]}>
        {li >= 0 ? <Page key={`${li}-${page}`} li={li} page={page} clock={clock} onRows={onRows} /> : null}
      </Animated.View>
      <NotchShape clock={clock} style={notch} />
    </View>
  );
}

function NotchShape({ clock, style }: { clock: SharedValue<number>; style: any }) {
  const vis = useAnimatedStyle(() => {
    const t = clock.value;
    return { opacity: clamp01((t - (T_SPEAK0 - 0.2)) / 0.2) * (1 - easeOutCubic(clamp01((t - T_BUBBLE_OUT) / 0.3))) };
  });
  return (
    <Animated.View style={[styles.notchWrap, style, vis]}>
      <View style={styles.notch} />
    </Animated.View>
  );
}

function Page({ li, page, clock, onRows }: { li: number; page: number; clock: SharedValue<number>; onRows: (r: number[]) => void }) {
  const L = VOICE_LINES[li];
  const tokens = L.text.split(' ');
  const from = L.pages[page];
  const to = L.pages[page + 1] ?? tokens.length;
  const ys = useRef<Record<number, number>>({});
  const words = tokens.slice(from, to);
  const report = useCallback((i: number, y: number) => {
    ys.current[i] = y;
    const all = Object.values(ys.current);
    if (all.length === words.length) {
      const base = Math.min(...all);
      const out: number[] = [];
      words.forEach((_, k) => out.push(LINE_T[li] + L.words[from + k], Math.round((ys.current[k] - base) / BUB.lh)));
      onRows(out);
    }
  }, [words, onRows, li, from, L]);
  return (
    <View style={styles.words}>
      {words.map((w, i) => (
        <Word key={i} text={w} t0={LINE_T[li] + L.words[from + i]} clock={clock} onY={(y) => report(i, y)} />
      ))}
    </View>
  );
}

function Word({ text, t0, clock, onY }: { text: string; t0: number; clock: SharedValue<number>; onY: (y: number) => void }) {
  const style = useAnimatedStyle(() => {
    const a = easeOutCubic(clamp01((clock.value - (t0 - 0.03)) / 0.18));
    return { opacity: a, transform: [{ translateY: 5 * (1 - a) }] };
  });
  return (
    <Animated.Text style={[styles.word, style]} onLayout={(e) => onY(e.nativeEvent.layout.y)}>
      {text}
    </Animated.Text>
  );
}

// ── the end card ─────────────────────────────────────────────────────────────
// Where the bubble was, over the room he is still sitting in: the name, the door in,
// and the analytics notice, which is not decoration (see WelcomeAnimation's EndCard).
function Spark({ clock, x, y, d, c }: { clock: SharedValue<number>; x: number; y: number; d: number; c: string }) {
  const style = useAnimatedStyle(() => {
    const u = clamp01((clock.value - (T_END + d)) / 0.6);
    const a = u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u);
    return { opacity: a, transform: [{ scale: 0.3 + a }, { rotate: `${45 + 90 * u}deg` }] };
  });
  return <Animated.View style={[{ position: 'absolute', left: x - 5, top: y - 5, width: 10, height: 10, borderRadius: 2, backgroundColor: c, borderWidth: 1.6, borderColor: INK }, style]} />;
}

function EndCard({ clock, endReady, onBegin }: { clock: SharedValue<number>; endReady: boolean; onBegin: () => void }) {
  const [down, setDown] = useState(false);
  const word = useAnimatedStyle(() => {
    const r = easeOutBack(clamp01((clock.value - T_END) / 0.6));
    return { opacity: clamp01((clock.value - T_END) / 0.3), transform: [{ translateY: 16 * (1 - r) }, { scale: 0.9 + 0.1 * r }] };
  });
  const begin = useAnimatedStyle(() => {
    const u = clamp01((clock.value - (T_END + 0.25)) / 0.55);
    return { opacity: easeOutCubic(u), transform: [{ scale: 0.9 + 0.1 * easeOutBack(u) }] };
  });
  const notice = useAnimatedStyle(() => ({ opacity: 0.9 * easeOutCubic(clamp01((clock.value - T_END - 0.7) / 0.7)) }));
  const card = useAnimatedStyle(() => ({ display: clock.value < T_END - 0.05 ? ('none' as const) : ('flex' as const) }));
  return (
    <Animated.View pointerEvents="box-none" style={[styles.endCard, card]}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Spark clock={clock} x={86} y={52} d={0.15} c={EMBER} />
        <Spark clock={clock} x={318} y={40} d={0.3} c={mix(TEAL, FLAT_FACE, 0.5)} />
        <Spark clock={clock} x={300} y={98} d={0.45} c={EMBER} />
        <Spark clock={clock} x={104} y={112} d={0.55} c={mix(TEAL, FLAT_FACE, 0.5)} />
      </View>
      <Animated.Text style={[styles.lockWord, word]}>Ashmere</Animated.Text>
      <Animated.View style={begin}>
        <Pressable
          onPress={onBegin}
          onPressIn={() => setDown(true)}
          onPressOut={() => setDown(false)}
          disabled={!endReady}
          hitSlop={16}
          style={styles.beginSlot}
        >
          <View style={{ paddingBottom: 4 }}>
            <View pointerEvents="none" style={styles.beginLip} />
            <View style={[styles.beginBtn, { transform: [{ translateY: down ? 4 : 0 }] }]}>
              <Text style={styles.beginText}>Begin</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
      <Animated.Text style={[styles.notice, notice]}>
        Anonymous usage data helps improve the lessons — never your name, notes or
        saved quotes. You can turn it off in Settings.
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PAPER, overflow: 'hidden' },
  skip: { position: 'absolute', paddingHorizontal: 14, paddingVertical: 8 },
  skipText: { fontFamily: 'Inter_500Medium', fontSize: 14, letterSpacing: 1, color: SOFT },

  bubbleRow: {
    position: 'absolute', left: 0, right: 0, top: 0, height: BUB.bottom, justifyContent: 'flex-end', alignItems: 'center',
  },
  bubble: {
    maxWidth: BUB.maxW,
    paddingHorizontal: BUB.padX,
    paddingVertical: BUB.padY,
    backgroundColor: FLAT_FACE,
    borderWidth: 2.4,
    borderColor: INK,
    borderRadius: 20,
    boxShadow: `0px 4px 0px ${FLAT_EDGE}`,
    overflow: 'hidden',
  },
  words: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  word: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: BUB.font, lineHeight: BUB.lh, color: INK, marginHorizontal: 3 },
  notchWrap: { position: 'absolute', left: 0, top: BUB.bottom - 1.2, width: 0, height: 0 },
  notch: {
    position: 'absolute', left: -BUB.tail / 2, top: -BUB.tail / 2, width: BUB.tail, height: BUB.tail,
    backgroundColor: FLAT_FACE, borderRightWidth: 2.4, borderBottomWidth: 2.4, borderColor: INK,
    transform: [{ rotate: '45deg' }],
  },

  endCard: { position: 'absolute', left: 0, right: 0, top: 232, height: 200, alignItems: 'center' },
  lockWord: { fontFamily: 'PlayfairDisplay_700Bold_Italic', fontSize: 46, color: INK, lineHeight: 58 },
  beginSlot: { marginTop: 16 },
  beginLip: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 4, backgroundColor: C.HUE, borderRadius: 25 },
  beginBtn: { backgroundColor: INK, borderRadius: 25, paddingVertical: 14, paddingHorizontal: 48 },
  beginText: { fontFamily: 'Inter_500Medium', fontSize: 17, color: PAPER },
  notice: {
    marginTop: 14, maxWidth: 300, textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 17, color: C.ink,
  },
});

