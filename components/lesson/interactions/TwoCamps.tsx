import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence, runOnJS, Easing,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import type { TwoCampsInteraction } from '@/data/types';
import { T } from '../theme';

interface Props {
  interaction: TwoCampsInteraction;
  xpValue: number;
  onComplete: (correct: boolean) => void;
}

const FLY = 260;

/**
 * Two named camps and a stack of statements to place into them, one at a time.
 * The card flies off toward whichever side was chosen and the next one rises
 * into its place, so it reads as dealing a hand rather than answering a form.
 *
 * PLACED BY TAP, NOT BY DRAG — deliberately. The lesson runner is itself a
 * horizontal pager: its pan activates at ±8px and, while a question is
 * unanswered, it blocks FORWARD paging but still allows a backward swipe. A card
 * that took left/right drags would therefore work on one side and navigate the
 * lesson backwards on the other. Two big targets and a flown card give the same
 * sorting feel with nothing to arbitrate.
 */
export default function TwoCamps({ interaction, onComplete }: Props) {
  const { items, leftLabel, rightLabel } = interaction;
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<('left' | 'right')[]>([]);

  const flyX = useSharedValue(0);
  const tilt = useSharedValue(0);
  const fade = useSharedValue(1);
  const rise = useSharedValue(0);

  const done = idx >= items.length;
  const wrong = picks.filter((p, i) => items[i] && p !== items[i].side).length;
  const allRight = done && wrong === 0;

  const land = useCallback(
    (side: 'left' | 'right') => {
      setPicks((prev) => {
        const next = [...prev, side];
        if (next.length === items.length) {
          onComplete(next.every((p, i) => p === items[i].side));
        }
        return next;
      });
      setIdx((n) => n + 1);
      // reset for the incoming card: it rises from just below, it does not slide
      // back across the screen from wherever the last one exited
      flyX.value = 0;
      tilt.value = 0;
      fade.value = 0;
      rise.value = 14;
      fade.value = withTiming(1, { duration: 200 });
      rise.value = withTiming(0, { duration: 240, easing: Easing.out(Easing.cubic) });
    },
    [items, onComplete, flyX, tilt, fade, rise]
  );

  const place = (side: 'left' | 'right') => {
    if (done) return;
    const dir = side === 'left' ? -1 : 1;
    tilt.value = withTiming(dir * 11, { duration: 260 });
    fade.value = withTiming(0, { duration: 260 });
    flyX.value = withTiming(dir * FLY, { duration: 260, easing: Easing.in(Easing.cubic) }, (f) => {
      if (f) runOnJS(land)(side);
    });
  };

  const cardStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [
      { translateX: flyX.value },
      { translateY: rise.value },
      { rotate: `${tilt.value}deg` },
    ],
  }));

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.hint}>PLACE EACH ONE IN A CAMP</Text>

      {/* the two camps, always on screen so the reader knows the axis */}
      <View style={styles.camps}>
        <View style={styles.camp}>
          <Text style={styles.campArrow}>◀</Text>
          <Text style={styles.campLabel} numberOfLines={2}>{leftLabel.toUpperCase()}</Text>
        </View>
        <View style={styles.tally}>
          <Text style={styles.tallyText}>
            {Math.min(idx + 1, items.length)} / {items.length}
          </Text>
        </View>
        <View style={styles.camp}>
          <Text style={styles.campLabel} numberOfLines={2}>{rightLabel.toUpperCase()}</Text>
          <Text style={styles.campArrow}>▶</Text>
        </View>
      </View>

      {/* the deck */}
      <View style={styles.deck}>
        {!done && (
          <>
            {/* the one behind, so the stack has depth and the count is felt */}
            {idx + 1 < items.length && <View style={styles.behind} />}
            <Animated.View style={[styles.card, cardStyle]}>
              <Text style={styles.cardText}>{items[idx].text}</Text>
            </Animated.View>
          </>
        )}
        {done && (
          <View style={[styles.card, styles.cardDone]}>
            <Text style={[styles.cardText, { textAlign: 'center' }]}>
              {allRight ? 'Every one in the right camp.' : `${items.length - wrong} of ${items.length} placed correctly.`}
            </Text>
          </View>
        )}
      </View>

      {!done && (
        <View style={styles.buttons}>
          <Pressable
            onPress={() => place('left')}
            style={({ pressed }) => [styles.btn, pressed && { backgroundColor: T.press }]}
          >
            <Text style={styles.btnText}>◀  {leftLabel}</Text>
          </Pressable>
          <Pressable
            onPress={() => place('right')}
            style={({ pressed }) => [styles.btn, pressed && { backgroundColor: T.press }]}
          >
            <Text style={styles.btnText}>{rightLabel}  ▶</Text>
          </Pressable>
        </View>
      )}

      {done && (
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 240 }}
          style={styles.explain}
        >
          <Text style={[styles.explainLabel, { color: allRight ? T.green : T.red }]}>
            {allRight ? '✓ CORRECT' : '✕ NOT QUITE'}
          </Text>
          {/* which ones went astray — without this the reader has no idea WHICH */}
          {wrong > 0 && (
            <View style={styles.misses}>
              {items.map((it, i) =>
                picks[i] !== it.side ? (
                  <Text key={it.id} style={styles.missText}>
                    “{it.text}” belongs with {it.side === 'left' ? leftLabel : rightLabel}
                  </Text>
                ) : null
              )}
            </View>
          )}
          <Text style={styles.explainText}>{interaction.explanation}</Text>
          <Text style={styles.swipeHint}>SWIPE TO CONTINUE →</Text>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { fontFamily: 'Inter_700Bold', fontSize: 9.5, color: T.gold, letterSpacing: 1.8, marginBottom: 12 },

  camps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  camp: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  campArrow: { fontFamily: 'Inter_500Medium', fontSize: 12, color: T.dim },
  campLabel: { flex: 1, fontFamily: 'Inter_700Bold', fontSize: 10, color: T.inkSoft, letterSpacing: 1.4 },
  tally: { paddingHorizontal: 10 },
  tallyText: { fontFamily: 'Inter_500Medium', fontSize: 10, color: T.dim, letterSpacing: 1 },

  deck: { minHeight: 128, justifyContent: 'center' },
  behind: {
    position: 'absolute', left: 8, right: 8, top: 10, bottom: 4,
    borderWidth: 1.5, borderColor: T.borderSoft, borderRadius: 10, backgroundColor: T.panelSoft,
  },
  card: {
    borderWidth: 1.5, borderColor: T.border, borderRadius: 10,
    backgroundColor: T.panel, paddingVertical: 22, paddingHorizontal: 18,
    justifyContent: 'center', minHeight: 112,
  },
  cardDone: { borderColor: T.borderSoft, backgroundColor: T.panelSoft },
  cardText: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 17, color: T.cream, lineHeight: 25 },

  buttons: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btn: {
    flex: 1, borderWidth: 1.5, borderColor: T.border, borderRadius: 8,
    paddingVertical: 13, alignItems: 'center', backgroundColor: T.panel,
  },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 11.5, color: T.ink, letterSpacing: 0.8 },

  explain: { borderLeftWidth: 2, borderLeftColor: T.border, paddingLeft: 14, marginTop: 16, marginBottom: 8 },
  explainLabel: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.5, marginBottom: 6 },
  misses: { marginBottom: 8, gap: 3 },
  missText: { fontFamily: 'Inter_500Medium', fontSize: 11.5, color: T.red, lineHeight: 17 },
  explainText: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 14, color: T.creamSoft, lineHeight: 21 },
  swipeHint: { fontFamily: 'Inter_700Bold', fontSize: 10, color: T.inkSoft, letterSpacing: 2, marginTop: 14 },
});
