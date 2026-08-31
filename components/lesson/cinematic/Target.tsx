import { createContext, useContext, useEffect, useId, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, type View, type PressableProps } from 'react-native';
import Animated, {
  Easing, cancelAnimation, useAnimatedStyle, useSharedValue,
  withDelay, withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { INK, PAPER, RIGHT, WRONG } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// A THING IN THE PICTURE THAT CAN BE TAPPED, AND LOOKS LIKE IT.
//
// Eighty-two of the 102 cinematic lessons ask their question by having the
// reader tap something on the stage rather than press a button underneath. That
// mechanic is the reason the format won — a lesson about which of three maps is
// true is better answered by pointing at a map than by reading three sentences
// that describe maps. It was also, measurably, where readers got lost:
//
//   69 of 82 prompts already said "tap"      — the instruction was never missing
//   13 of 82 named something you can SEE     — "board", "pipe", "shelf"
//   15 of 82 pointed at an abstraction       — "tap the claim that is still
//                                               owed an account"
//
// So the reader knew a tap was wanted and could not tell WHAT was tappable,
// because a scene's answer targets were drawn exactly like the scenery around
// them. Nothing on the stage said "these two rectangles are the buttons".
//
// This component is the answer, and it is one component on purpose: wrapping a
// scene's existing Pressable in it costs one line per target and fixes every
// lesson the same way, rather than 82 scenes each inventing an affordance.
//
// ── WHAT IT DRAWS ───────────────────────────────────────────────────────────
//
// While the question is open: an ink ring on the target's own bounds, breathing
// slowly. Not a fill and not a colour — §19 has no second colour to reach for.
// The breath is what separates "this is a button" from "this is a box someone
// drew"; a static outline reads as part of the picture, which is the whole
// problem being fixed. See the note on RING_INSET for why it sits ON the bounds
// rather than outside them.
//
// The moment an answer lands, every ring is cancelled and removed, and the
// component replies: what was right lifts, what the reader took is stamped, and
// a wrong pick dims and shrinks slightly. See THE REACTION below.
//
// ── WHO OWNS WHAT, once an answer lands ─────────────────────────────────────
//
// THIS COMPONENT OWNS THE OPACITY AND THE SCALE. THE SCENE MARKS BY FORM.
//
// That division is younger than most of the corpus, and the paragraph that used
// to stand here is why. It said this component "deliberately does NOT style the
// answered state, because each scene already does that in its own vocabulary" —
// true when it was written, and every scene duly wrote its own reply, almost
// always as an opacity. Then the reaction was added and nothing went back to the
// scenes. The two multiply, and it is the card the reader ACTUALLY CHOSE that
// pays for it, because that is the branch this component dims:
//
//     0.5 (here)  x  0.45 (the scene)  =  0.225
//
// Measured on aesthetics14 through a real answer: the untouched loser sat at the
// intended 0.7, and the one under the reader's own finger — the one carrying the
// X, the one they most need to read — sat at 0.225. It was the same 113 times
// across the corpus, because it was the house idiom.
//
// So: a scene's answered style may change a border, a fill, a colour or a dash.
// It may not set an opacity on anything inside a Target, or on the Target's own
// style prop. `check:blank` holds it.
//
// ── WHY IT ALSO COUNTS ITSELF ───────────────────────────────────────────────
//
// Every mounted Target registers with the surrounding TargetCount provider, so
// the question panel underneath can say how many marked things there are without
// any lesson having to declare it. That number is the difference between "answer
// in the scene above" — which is what the panel used to say, and which tells the
// reader nothing — and "tap one of the 3 marked parts above".
// ─────────────────────────────────────────────────────────────────────────────

// THE RING SITS ON THE TARGET'S OWN BOUNDS, NOT OUTSIDE THEM.
//
// It was -5 first, on the reasoning that a ring outside the art never covers the
// thing being chosen. The audit measured what it covered instead: across the
// first 26 lessons alone, 32 pairs of rings overlapped each other — by up to 46px
// — and 29 rings crossed text belonging to something else. On a stage where the
// answer targets are stacked rows of a proof, five units in every direction is
// enough for each ring to reach into its neighbour, and two overlapping outlines
// are worse than none: they say the two things are one thing.
//
// At 0 the ring is exactly the target's footprint, and a React Native border is
// drawn INSIDE the box, so it cannot extend past it by even a pixel. Two rings
// can now only touch if the two targets themselves overlap — which is a layout
// fault the audit should report, not something the affordance should cause.
const RING_INSET = 0;
const RING_W = 2;
const BREATH_MS = 1100;
/** How long the reaction takes. The same 460ms ChoiceCards uses, so the two
 *  question formats reply at one tempo rather than at two. */
const REACT_MS = 460;


// THE DRIVERS BEHIND THAT CURVE, for a scene whose art wrapper ALREADY carries a
// transform of its own. Two animated styles on one View do not compose — the
// later transform replaces the earlier one — and political7's stone is already
// sliding in on `SCENE.value.stone`. So a scene that must fold the lift into an
// existing transform reads these two values instead of taking the finished style.
//
//   const stone = useAnswerLiftValues(picked, 'stone', true);
//   … transform: [{ translateY: base - 10 * stone.lift.value },
//                  { scale: 1 + 0.06 * stone.lift.value }]
export function useAnswerLiftValues(picked: string | null, id: string, correct: boolean) {
  const answered = picked !== null;
  const react = useSharedValue(0);
  const lift = useSharedValue(0);
  useEffect(() => {
    if (!answered) { react.value = 0; lift.value = 0; return; }
    react.value = withDelay(60, withTiming(1, { duration: REACT_MS, easing: Easing.out(Easing.cubic) }));
    if (correct) {
      lift.value = withDelay(60, withSequence(
        withTiming(1.14, { duration: 250, easing: Easing.out(Easing.cubic) }),
        withSpring(1, { damping: 13, stiffness: 190 }),
      ));
    }
  }, [answered, correct, react, lift]);
  return { react, lift, mine: picked === id, answered };
}
// AND A RISE WITH NO SCALE, for art that is not gathered into one box.
//
// metaphysics20 answers with a 24-cell grid and aesthetics18 with a panel plus
// its bars; the pieces are positioned individually in SCENE space, so scaling
// each about its own centre would pull the group apart while scaling their
// shared full-stage wrapper would scale the whole picture. A pure translate is
// identical for every piece, so the answer rises as ONE THING — which is what
// the reader asked for — and nothing drifts.
//
// Use it on the wrapper that already holds exactly the answer's art. Prefer
// useAnswerLift where the art can simply live inside the Target: a lift that
// also swells reads as more physical, and that is the house default.
export function useAnswerRise(picked: string | null, id: string, correct: boolean) {
  const { lift } = useAnswerLiftValues(picked, id, correct);
  return useAnimatedStyle(() => ({ transform: [{ translateY: -10 * lift.value }] }));
}
// ─────────────────────────────────────────────────────────────────────────────
// THE REACTION, AVAILABLE TO A SCENE THAT CANNOT PUT ITS ART INSIDE A TARGET.
//
// Two shapes need lifting and only one of them can be a child. Where the art
// exists ONLY while the question is up, it belongs inside the Target and the
// component animates it (epistemology19). Where the art lives for the whole
// lesson and the Target is mounted just for the graded beat — political7 draws
// its stone and its charter from the first beat and asks about them at the
// seventh — moving the art inside would delete it from every other beat.
//
// So the curve is exported. The scene keeps its own art wrapper, which is already
// a positioned box, and applies this to it: the transform then scales about that
// box's own centre and repaints only its own area, which is what §17 rule 7 asks
// for. One curve, two call sites, and they cannot drift apart.
export function useAnswerLift(picked: string | null, id: string, correct: boolean) {
  const answered = picked !== null;
  const mine = picked === id;
  const react = useSharedValue(0);
  const lift = useSharedValue(0);
  useEffect(() => {
    if (!answered) { react.value = 0; lift.value = 0; return; }
    react.value = withDelay(60, withTiming(1, { duration: REACT_MS, easing: Easing.out(Easing.cubic) }));
    if (correct) {
      lift.value = withDelay(60, withSequence(
        withTiming(1.14, { duration: 250, easing: Easing.out(Easing.cubic) }),
        withSpring(1, { damping: 13, stiffness: 190 }),
      ));
    }
  }, [answered, correct, react, lift]);
  return useAnimatedStyle(() => {
    const t = react.value;
    if (!answered) return { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] };
    if (correct) {
      const u = lift.value;
      return { opacity: 1, transform: [{ translateY: -10 * u }, { scale: 1 + 0.06 * u }] };
    }
    if (mine) return { opacity: 1 - 0.5 * t, transform: [{ translateY: 0 }, { scale: 1 - 0.06 * t }] };
    return { opacity: 1 - 0.3 * t, transform: [{ translateY: 0 }, { scale: 1 }] };
  });
}

// AN INSTRUCTION THAT HAS BEEN OBEYED (S11).
//
// A stage question usually prints its own instruction above the options — TAP THE
// VERDICT, TAP A PAIR TO LOOK THROUGH IT. The moment an answer lands that line is
// spent: the deck below is showing the verdict and the explanation, and the words
// on the stage are telling the reader to do a thing they have just done.
//
// It is also, measurably, what the answer LIFT runs into. These stacks are packed
// — logic3's cards sit on a 50 step at 44 tall, so six units of gap against a rise
// of ten plus a swell — and the winner, filled ink, rises straight through the line
// above it. Two lessons were photographed doing it, both slicing the instruction in
// half at its middle.
//
// Fading it costs nothing the reader wanted and removes the collision at its cause.
// Same 460ms as the reply, so the line leaves as the card arrives rather than
// blinking out under it.
export function useAnswerSpent(picked: string | null) {
  const answered = picked !== null;
  const gone = useSharedValue(0);
  useEffect(() => {
    gone.value = withTiming(answered ? 1 : 0, { duration: REACT_MS, easing: Easing.out(Easing.cubic) });
  }, [answered, gone]);
  return useAnimatedStyle(() => ({ opacity: 1 - gone.value }));
}

// THE SAME REACTION AS A WRAPPER, for art that is drawn in a MAP beside its Target.
//
// The commonest shape in this corpus is a row of things drawn by one map and a row
// of Targets laid over them by another — logic19 draws four <Card>s and then four
// bare hit-boxes. The art cannot move into the Target without unpicking the map,
// and a hook cannot be called per item. A component can.
//
// TRANSLATE ONLY, deliberately. This wraps whatever it is given, including a child
// that positions itself absolutely in scene space, so the wrapper has no meaningful
// box of its own and a scale would grow about the wrong origin. A translate is the
// same for every child wherever it sits.
export function AnswerLift({
  id, picked, correct, children,
}: {
  id: string;
  picked: string | null;
  correct: boolean;
  children?: React.ReactNode;
}) {
  const style = useAnswerRise(picked, id, correct);
  return <Animated.View style={style} pointerEvents="box-none">{children}</Animated.View>;
}

interface Registry {
  add: (key: string) => void;
  remove: (key: string) => void;
  /** Where this target actually is, in SCENE coordinates. See `measure` below. */
  report?: (key: string, box: { x: number; y: number; w: number; h: number }) => void;
  /** The camera view a target measures itself against. */
  host?: { current: unknown };
}
const TargetCtx = createContext<Registry | null>(null);

/** Wrap the scene so its Targets can be counted. Mounted by CinematicPlayer. */
export function TargetCountProvider({
  children, onCount, onBox, host,
}: {
  children: React.ReactNode;
  onCount: (n: number) => void;
  /** The union of every target on this beat, or null while none has measured. */
  onBox?: (b: { x: number; y: number; w: number; h: number } | null) => void;
  host?: { current: unknown };
}) {
  const reg = useMemo(() => {
    const keys = new Set<string>();
    const boxes = new Map<string, { x: number; y: number; w: number; h: number }>();
    const union = () => {
      if (!boxes.size) return null;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      boxes.forEach((b) => {
        x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y);
        x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h);
      });
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    };
    return {
      add: (k: string) => { keys.add(k); onCount(keys.size); },
      remove: (k: string) => {
        keys.delete(k); boxes.delete(k);
        onCount(keys.size);
        onBox?.(union());
      },
      report: (k: string, b: { x: number; y: number; w: number; h: number }) => {
        boxes.set(k, b);
        onBox?.(union());
      },
      host,
    };
  }, [onCount, onBox, host]);
  return <TargetCtx.Provider value={reg}>{children}</TargetCtx.Provider>;
}

/**
 * EVERY OTHER PROP GOES STRAIGHT THROUGH TO THE PRESSABLE, on purpose.
 *
 * The 98 targets this replaces are plain Pressables carrying their own styles,
 * hit slop, function-style children and `disabled` flags. Passing the rest
 * through makes converting one a tag rename plus four props — which is a change
 * a compiler can check — rather than a reshaping of each scene's props, which is
 * a change only a person can check, 98 times.
 */
export default function Target({
  id,
  correct,
  picked,
  onPick,
  children,
  /** Match the target's own corner, so the ring does not square off a round thing. */
  radius = 4,
  /**
   * WHICH CORNER THE TICK LANDS ON, because there is no corner that is always free.
   *
   * Default 'br'. A stage target usually carries its label as a title row INSIDE
   * it — epistemology19's doors print NUTRITION across the top — so a top-right
   * badge covers the answer's own name. But where the label sits BELOW the art,
   * as metaphysics23 hangs REASSEMBLED under its hull, bottom-right covers that
   * instead. The scene knows which; nothing else does.
   */
  sealAt = 'br',
  ...rest
}: {
  id: string;
  correct: boolean;
  /** From SceneApi — null until this beat has been answered. */
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  radius?: number;
  /** Which corner the tick lands on — see the prop comment above. */
  sealAt?: 'br' | 'tr';
} & Omit<PressableProps, 'onPress' | 'children'> & { children?: React.ReactNode }) {
  const answered = picked !== null;
  const reg = useContext(TargetCtx);
  const key = useId();

  useEffect(() => {
    reg?.add(key);
    return () => reg?.remove(key);
  }, [reg, key]);

  const breath = useSharedValue(0);
  useEffect(() => {
    if (answered) {
      cancelAnimation(breath);
      breath.value = withTiming(0, { duration: 180 });
      return;
    }
    breath.value = 0;
    breath.value = withRepeat(
      withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(breath);
  }, [answered]);

  // Opacity only. A ring that also SCALED would drift off a target whose own art
  // is moving, and every one of these sits on a stage where something is walking.
  const ring = useAnimatedStyle(() => ({ opacity: 0.35 + breath.value * 0.65 }));

  // ── THE REACTION ──────────────────────────────────────────────────────────
  //
  // Answering used to do NOTHING here. The ring faded out and the picture sat
  // there, so the largest group of questions in the app — the ones answered by
  // tapping the thing itself — were the only ones with no reply. A deck question
  // lifts the card and stamps it, a drag question reveals its band, and the
  // scene target, which is the most physical of the three, went quiet.
  //
  // Same language as ChoiceCards, deliberately: what you took RISES, what was
  // right rises whether or not you took it, and a wrong pick recedes. Three
  // outcomes, and the third is the one that teaches — a reader who missed is
  // shown the answer rather than merely denied the point.
  //
  // WHAT IT MAY NOT DO IS DISAPPEAR. A card is furniture and can crumple away; a
  // target is part of the PICTURE, and a scene that deletes its own prop on a
  // wrong answer breaks rule A1 and usually the composition with it. So a wrong
  // pick dims and shrinks slightly and stays exactly where it was.
  const mine = picked === id;
  const react = useSharedValue(0);
  useEffect(() => {
    if (!answered) { react.value = 0; return; }
    react.value = withDelay(60, withTiming(1, { duration: REACT_MS, easing: Easing.out(Easing.cubic) }));
  }, [answered, react]);

  // THE LIFT OVERSHOOTS; THE DIMMING MUST NOT. They are two drivers because one
  // cannot do both: a value that rises past 1 and settles reads as a thing being
  // lifted and set down, which is what makes the reply feel like a reply — but the
  // same value multiplied into `1 - 0.5 * t` would take a fading target BELOW its
  // resting opacity and bring it back, which is a flicker. So `react` stays the
  // plain ramp everything else reads, and only the correct branch reads `lift`.
  const lift = useSharedValue(0);
  useEffect(() => {
    if (!(answered && correct)) { lift.value = 0; return; }
    lift.value = withDelay(60, withSequence(
      withTiming(1.14, { duration: 250, easing: Easing.out(Easing.cubic) }),
      withSpring(1, { damping: 13, stiffness: 190 }),
    ));
  }, [answered, correct, lift]);

  const reaction = useAnimatedStyle(() => {
    const t = react.value;
    if (!answered) return { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] };
    if (correct) {
      // Taken or merely revealed, the true one lifts. The reader must end the beat
      // knowing which it was. Ten units and six percent are the DECK's numbers
      // (./ChoiceCards): a stage question and a deck question are the same question
      // to a reader, so they may not reply by different amounts.
      const u = lift.value;
      return { opacity: 1, transform: [{ translateY: -10 * u }, { scale: 1 + 0.06 * u }] };
    }
    if (mine) return { opacity: 1 - 0.5 * t, transform: [{ translateY: 0 }, { scale: 1 - 0.06 * t }] };
    // Neither picked nor right: it simply stops competing for attention.
    return { opacity: 1 - 0.3 * t, transform: [{ translateY: 0 }, { scale: 1 }] };
  });

  // The seal lands only on a target the reader actually TOOK and got right —
  // never on a revealed one, because a tick over something they did not choose
  // reads as though they had.
  const seal = useSharedValue(0);
  useEffect(() => {
    if (!(answered && mine)) { seal.value = 0; return; }
    seal.value = withDelay(180, withSequence(
      withTiming(1.35, { duration: 110, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 9, stiffness: 220 }),
    ));
  }, [answered, mine, correct, seal]);
  const sealStyle = useAnimatedStyle(() => ({
    opacity: seal.value > 0 ? 1 : 0,
    transform: [{ scale: seal.value }, { rotate: '-12deg' }],
  }));

  // WHERE THIS TARGET ACTUALLY IS, so the camera can be made to contain it.
  //
  // Measured against the CAMERA VIEW rather than read off the scene's styles,
  // because a Target is positioned by whatever wraps it — a row, a card, a column
  // — and only the tree knows the accumulated offset. `measureLayout` against an
  // ancestor returns the offset inside that ancestor's own coordinate space, which
  // is scene space: the camera's transform lives ON the host and so is not counted.
  //
  // If it ever fails, nothing is reported and CinematicPlayer falls back to
  // framing the whole band — see the note there. Wrong is not an option; blunt is.
  const boxRef = useRef<View>(null);
  const measure = () => {
    const host = reg?.host?.current as never;
    if (!host || !boxRef.current) return;
    boxRef.current.measureLayout(
      host,
      (x, y, w, h) => reg?.report?.(key, { x, y, w, h }),
      () => {},
    );
  };

  return (
    <Pressable
      ref={boxRef}
      onLayout={measure}
      accessibilityRole="button"
      {...rest}
      // After the spread: a scene's own `disabled` may add a reason to be
      // untappable, but it may never make an answered target tappable again.
      disabled={answered || !!rest.disabled}
      onPress={() => onPick(id, correct)}
    >
      {/* The reaction transforms the ART, not the Pressable: `measureLayout` reads
          layout and is unaffected by transforms, so the box this target reports to
          the camera stays exactly where it was (H60c). */}
      <Animated.View pointerEvents="box-none" style={[styles.art, reaction]}>
        {children}
      </Animated.View>
      {/* THE MARK ON THE READER'S OWN ANSWER, right or wrong.
          It used to appear only when they were RIGHT, so a stage question that
          went badly gave back nothing at all at the point of contact — the ring
          vanished, the true target lifted, and the thing they actually pressed
          was left looking untouched. Same two marks, same two colours as the
          deck's cards, because a stage question and a deck question are the same
          question to a reader. */}
      {answered && mine ? (
        <Animated.View
          style={[styles.seal, sealAt === 'tr' ? styles.sealTop : styles.sealBottom, correct ? styles.sealTrue : styles.sealMiss, sealStyle]}
          pointerEvents="none"
        >
          <Text style={styles.sealMark}>{correct ? '✓' : '✕'}</Text>
        </Animated.View>
      ) : null}
      {/* THE RING IS A PROMISE, SO IT MAY ONLY SHOW WHERE THE PROMISE HOLDS.
          It used to consult `answered` alone. 132 of the corpus's targets are
          written `disabled={!live || answered}` — mounted for the whole lesson
          and pressable only on their own graded beat — so for six beats out of
          eight the reader watched two or three outlines breathe at them and
          nothing happened when they touched one. Measured on aesthetics14:
          aria-disabled="true" on beats 0-3 with the rings at 0.35-0.88 and
          still pulsing. An affordance that lies about being one is worse than
          no affordance, because it teaches the reader to distrust the real
          ones. */}
      {!answered && !rest.disabled ? (
        <Animated.View
          pointerEvents="none"
          // Named so the lesson audit can find rings exactly. Detecting them by
          // "a 2px border with a radius" also matched scene art — logic-3 draws
          // bordered boxes — and reported 28 collisions between things that were
          // not rings at all.
          nativeID="target-ring"
          style={[
            StyleSheet.absoluteFill,
            {
              top: RING_INSET, left: RING_INSET, right: RING_INSET, bottom: RING_INSET,
              borderWidth: RING_W,
              borderColor: INK,
              borderRadius: radius,
            },
            ring,
          ]}
        />
      ) : null}
    </Pressable>
  );
}

/**
 * The same ring with no Pressable, for a scene whose target is already a
 * Pressable it cannot give up (a drag handle, a control with its own gesture).
 */
export function TargetRing({ answered, radius = 4 }: { answered: boolean; radius?: number }) {
  // Registers like a Target does, so a scene using rings instead of Targets still
  // gets a counted hint. Without this the panel silently falls back to "Answer in
  // the scene above" — the wording this whole change exists to replace — for
  // exactly the scenes whose targets are hardest to spot.
  const reg = useContext(TargetCtx);
  const key = useId();
  useEffect(() => {
    reg?.add(key);
    return () => reg?.remove(key);
  }, [reg, key]);

  const breath = useSharedValue(0);
  useEffect(() => {
    if (answered) { cancelAnimation(breath); breath.value = withTiming(0, { duration: 180 }); return; }
    breath.value = withRepeat(withTiming(1, { duration: BREATH_MS, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(breath);
  }, [answered]);
  const ring = useAnimatedStyle(() => ({ opacity: answered ? 0 : 0.35 + breath.value * 0.65 }));
  return (
    <Animated.View
      pointerEvents="none"
      nativeID="target-ring"
      style={[
        StyleSheet.absoluteFill,
        {
          top: RING_INSET, left: RING_INSET, right: RING_INSET, bottom: RING_INSET,
          borderWidth: RING_W, borderColor: INK, borderRadius: radius,
        },
        ring,
      ]}
    />
  );
}

export const TARGET_RING_INSET = RING_INSET;

const styles = StyleSheet.create({
  // THE WRAPPER MUST BE AS TALL AS THE TARGET, OR THE RING FRAMES BARE PAPER.
  //
  // This View exists to carry the reaction transform, and it used to carry
  // nothing else — so it was an ordinary flex child with an AUTO main size, and
  // it shrank to its content. Every child that sized itself against the target
  // (`flex: 1`, or top/bottom against the wrapper) therefore resolved against
  // nothing: `flex: 1` is `flexBasis: 0%`, which against an indefinite main size
  // contributes zero, so the child came out exactly as tall as its own words.
  //
  // The ring does not shrink with it. It is `StyleSheet.absoluteFill` on the
  // PRESSABLE, so it stayed the target's full height — and aesthetics14's three
  // verdicts shipped as a 15pt strip of words with 32pt of empty page under it,
  // all inside one breathing outline. Measured: press 146x47, ring 146x47,
  // card 146x15. The reader is asked to tap a box, and two thirds of the box is
  // blank. It is S10's fault on the other axis: that one collapsed the CROSS
  // axis under `alignItems`, this one collapses the MAIN axis under `flex`.
  //
  // `flexGrow` and NOT `flex`. `flex: 1` would also set `flexBasis: 0`, which
  // collapses this wrapper to nothing wherever the Pressable is sized BY its
  // child rather than the other way round — and most of the 193 targets in the
  // corpus are that shape. `flexGrow: 1` leaves the basis at `auto`: a target
  // with a definite height hands its spare height to the art, and a target with
  // no height of its own still takes the art's.
  art: { flexGrow: 1 },

  // Same mark, same size and same colours as the deck's (./ChoiceCards) — a second
  // tick drawn differently would read as a different app congratulating you — but
  // the OPPOSITE corner, and that is not drift.
  //
  // A deck card is furniture: 52 tall with 12 units of horizontal padding, so a
  // badge on its top-right sits over padding. A stage target is ART, and its label
  // is a title row that fills it — epistemology19's doors are 62 wide and carry
  // NUTRITION across nearly all of it, so the top-right badge printed 'NUTRITI●'
  // over the answer's own name. Bottom-right is where stage art is emptiest,
  // because a caption is a heading and headings go on top.
  seal: {
    position: 'absolute',
    right: -8,
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  sealBottom: { bottom: -10 },
  sealTop: { top: -10 },
  sealTrue: { borderColor: RIGHT, backgroundColor: RIGHT },
  sealMiss: { borderColor: WRONG, backgroundColor: WRONG },
  sealMark: { fontFamily: 'Inter_700Bold', fontSize: 14, color: PAPER, marginTop: -1 },
});
