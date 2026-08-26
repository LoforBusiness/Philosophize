import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing, runOnJS, useAnimatedStyle, useDerivedValue, useSharedValue,
  withDelay, withSpring, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import ControlRead from './ControlRead';
import { INK, PAPER, RULE, SOFT } from './cinematicKit';
import type { FieldBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A PLACE, IN TWO DIMENSIONS.
//
// There is a family of questions whose entire content is that two independent
// things are being run together, and every one of them is answered badly by a
// list. Is this condition necessary, or sufficient, or both, or neither? Is the
// past real, the future, both, neither? Are you being interfered with, or merely
// living at somebody's discretion?
//
// Offer those as four cards and the reader picks a phrase. Put them on a pad with
// one axis each and the reader has to place the case — and the moment they do,
// the two axes are visibly separate things, which is the whole lesson. The four
// quadrants ARE the four positions, drawn where they belong relative to each
// other rather than listed in an arbitrary order.
//
// ── TWO VALUES, SO THE PLAYER OWNS TWO ──────────────────────────────────────
//
// `pos` and `pos2` are the player's shared values (SceneApi.dragPos and
// dragPos2), so a scene can follow both axes under the reader's thumb. That is
// the reason the second one was added rather than packing two numbers into one:
// a scene that has to unpack a coordinate is a scene doing arithmetic on the UI
// thread to undo a decision made here.
//
// ── THE QUADRANT NAMES ARE THE TEACHING ─────────────────────────────────────
//
// The readout above the pad names where the token currently is — "presentism",
// "the growing block", "eternalism" — and it changes as the token crosses a
// midline. The reader discovers the map by moving over it, which is the same
// argument DragScale makes for its rail and LeverPick for its slots.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  field: FieldBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** Horizontal position, 0..1. */ pos: SharedValue<number>;
  /** Vertical position, 0..1, measured from the BOTTOM. */ pos2: SharedValue<number>;
}

const PAD_H = 104;
const TOKEN = 26;
const REVEAL = 440;
const SETTLE = { damping: 15, stiffness: 190 } as const;

export default function FieldPick({ field, picked, onPick, pos, pos2 }: Props) {
  const answered = picked !== null;

  // Quadrant lookup as flat arrays, indexed y * 2 + x — a worklet may not call
  // the methods of an object it closed over (§17 rule 6).
  const reads = ['', '', '', ''];
  const ids = ['', '', '', ''];
  const oks = [0, 0, 0, 0];
  for (const q of field.quads) {
    const at = q.y * 2 + q.x;
    reads[at] = q.reads;
    ids[at] = q.id;
    oks[at] = q.correct ? 1 : 0;
  }
  const rightAt = oks.findIndex((o) => o === 1);

  const padW = useSharedValue(1);
  const held = useSharedValue(0);
  const done = useSharedValue(0);
  const lastQ = useSharedValue(-1);

  // Declared before every worklet that calls it (§17 rule 2).
  const quadAt = useCallback((x: number, y: number) => {
    'worklet';
    return (y >= 0.5 ? 1 : 0) * 2 + (x >= 0.5 ? 1 : 0);
  }, []);


  // WHICH READING IS SHOWING — A DERIVED VALUE, NOT REACT STATE.
  //
  // It WAS state, and on a rail that stuttered: a thumb crossing four zones in a
  // few hundred milliseconds meant four hard cuts, four re-centrings of the box,
  // and four re-renders of a component that builds its Gesture inline while a
  // finger is down on it. ControlRead's header sets all three out. Derived here
  // and read on the UI thread, the reading costs no render at all.
  const quad = useDerivedValue(() => quadAt(pos.value, pos2.value));

  const commit = useCallback((at: number) => {
    onPick(ids[at], oks[at] === 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, oks, onPick]);

  useEffect(() => {
    pos.value = field.start[0];
    pos2.value = field.start[1];
    lastQ.value = quadAt(field.start[0], field.start[1]);
  }, [field, field.start, pos, pos2, quadAt, lastQ]);

  useEffect(() => {
    if (!answered) { done.value = 0; return; }
    done.value = withDelay(140, withTiming(1, { duration: REVEAL, easing: Easing.out(Easing.cubic) }));
  }, [answered, done]);

  /** Place the token wherever the finger is — no grab offset, so a tap moves it. */
  const place = useCallback((x: number, y: number) => {
    'worklet';
    let px = x / padW.value;
    let py = 1 - y / PAD_H;
    px = px < 0.04 ? 0.04 : px > 0.96 ? 0.96 : px;
    py = py < 0.04 ? 0.04 : py > 0.96 ? 0.96 : py;
    pos.value = px;
    pos2.value = py;
    const q = quadAt(px, py);
    if (q !== lastQ.value) { lastQ.value = q; runOnJS(touch)(); }
  }, [padW, pos, pos2, quadAt, lastQ]);

  const pan = Gesture.Pan()
    .enabled(!answered)
    .minDistance(0)
    .onBegin((e) => { held.value = withTiming(1, { duration: 110 }); place(e.x, e.y); })
    .onUpdate((e) => { place(e.x, e.y); })
    .onEnd(() => {
      held.value = withTiming(0, { duration: 160 });
      const q = quadAt(pos.value, pos2.value);
      // Settle to the middle of the quadrant it landed in, so the commitment is
      // legible rather than balanced on a line.
      pos.value = withSpring((q % 2 === 1 ? 0.75 : 0.25), SETTLE);
      pos2.value = withSpring((q >= 2 ? 0.75 : 0.25), SETTLE);
      runOnJS(commit)(q);
    });

  const tokenStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pos.value * padW.value - TOKEN / 2 },
      { translateY: -(pos2.value * PAD_H) + PAD_H - TOKEN / 2 },
      { scale: 1 + 0.12 * held.value },
    ],
  }));
  const ringStyle = useAnimatedStyle(() => ({ opacity: done.value }));

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <ControlRead texts={reads} idx={quad} />

      <View style={styles.row}>
        {/* THREE LINES, NOT TWO — and two on the x ends rather than one.
            An axis label is a whole claim (SOMETHING FORCED YOUR HAND, YOU ACTED
            FROM YOUR OWN WANTS), and at 8pt in a 52-wide gutter that is three
            lines of lettering. Capped at two it was simply cut off, which is the
            half of the screen the reader meant by "the words are cut off from
            there". The pad is 104 tall, so three 10pt lines at each end use 60 of
            it and never meet in the middle. */}
        <Text style={styles.yHi} numberOfLines={3}>{field.yHi}</Text>
        <Text style={styles.yLo} numberOfLines={3}>{field.yLo}</Text>

        <GestureDetector gesture={pan}>
          {/* `nativeID` for the browser harnesses (§21). */}
          <View
            style={styles.pad}
            nativeID="field-pad"
            onLayout={(e) => { padW.value = e.nativeEvent.layout.width; }}
          >
            <View style={styles.midV} pointerEvents="none" />
            <View style={styles.midH} pointerEvents="none" />

            {/* Where the right answer was, ringed once the token has landed. */}
            {rightAt >= 0 ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.ring,
                  { left: rightAt % 2 === 1 ? '50%' : '0%', top: rightAt >= 2 ? 0 : PAD_H / 2 },
                  ringStyle,
                ]}
              />
            ) : null}

            <Animated.View style={[styles.token, tokenStyle]} pointerEvents="none">
              <View style={styles.tokenCore} />
            </Animated.View>
          </View>
        </GestureDetector>
      </View>

      <View style={styles.xRow} pointerEvents="none">
        <Text style={styles.xEnd} numberOfLines={2}>{field.xLo}</Text>
        <Text style={[styles.xEnd, styles.xRight]} numberOfLines={2}>{field.xHi}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 22, marginTop: 0 },

  // 68, NOT 56: the gutter below has to clear the widest single word an axis label
  // can carry, and CONCLUSION is 56dp on its own.
  row: { flexDirection: 'row', alignItems: 'center', paddingLeft: 68 },
  yHi: {
    position: 'absolute', left: 0, top: 0, width: 64,
    fontFamily: 'Inter_700Bold', fontSize: 8, lineHeight: 10, letterSpacing: 0.6,
    color: SOFT, textAlign: 'right',
  },
  yLo: {
    position: 'absolute', left: 0, bottom: 0, width: 64,
    fontFamily: 'Inter_700Bold', fontSize: 8, lineHeight: 10, letterSpacing: 0.6,
    color: SOFT, textAlign: 'right',
  },
  pad: {
    flex: 1, height: PAD_H, borderWidth: 2, borderColor: INK, borderRadius: 4,
    backgroundColor: PAPER,
  },
  midV: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: RULE },
  midH: { position: 'absolute', left: 0, right: 0, top: PAD_H / 2 - 0.5, height: 1, backgroundColor: RULE },
  ring: {
    position: 'absolute', width: '50%', height: PAD_H / 2,
    borderWidth: 2, borderColor: INK, borderStyle: 'dashed', borderRadius: 4,
  },
  token: {
    position: 'absolute', left: 0, top: 0,
    width: TOKEN, height: TOKEN, borderRadius: TOKEN / 2,
    borderWidth: 2.5, borderColor: INK, backgroundColor: PAPER,
    alignItems: 'center', justifyContent: 'center',
  },
  tokenCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: INK },

  xRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3, paddingLeft: 68 },
  xEnd: {
    flex: 1, fontFamily: 'Inter_700Bold', fontSize: 8.5, lineHeight: 10.5,
    letterSpacing: 0.8, color: SOFT,
  },
  xRight: { textAlign: 'right' },
});
