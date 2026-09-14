import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  Easing, FadeIn, LinearTransition, useSharedValue, withTiming, type SharedValue,
} from 'react-native-reanimated';
import { touch } from '@/lib/feedback';
import { ERA, type EraKey } from '@/constants/design';
import { ALL_PHILOSOPHERS, eraGroupOf } from '@/data/philosophers';
import { INK, PAPER, mix } from '@/components/shared/tone';
import { orderFor } from './ChoiceCards';
import { LipPlate, VerdictSeal, useQuestionAccent, type PlateState } from './QuestionParts';
import { VERDICT } from './questionTone';
import { SOFT } from './cinematicKit';
import type { PollBlock } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// AN ANSWER THAT IS A POSITION, AND THE COMPANY IT PUTS YOU IN.
//
// This replaced the two-axis pad, which a reader named as the hardest thing in the
// app. Its four corners were named positions the reader had to rebuild from two
// axis labels before they could read the question, so the positions are simply
// listed, in plain words, shuffled so no row is always the answer (orderFor).
//
// ── THE REVEAL IS WHO HELD EACH POSITION, AND IT USED TO GIVE THE ANSWER AWAY ─
//
// Answering shows, under every row, the thinkers who actually held that position:
// you do not merely pick the right box, you find out you agreed with Austin and
// disagreed with Russell. The reader asked for exactly that.
//
// And the first version leaked it. The names were MOUNTED from the start and only
// faded in, so a row with holders reserved their line as empty space before the
// question was answered. Only the correct row had holders in 7 of the 34 polls,
// so the gap under it was the answer. A reader found it from the outside: "I can
// usually tell which one to answer right because there is a gap."
//
// So nothing about the reveal exists until the answer is in. The holder line is
// mounted on answering, every row opens its own line at once, and the rows below
// slide down to make room (LinearTransition) rather than jumping. Before that
// moment every row is the same shape, whatever its data holds.
//
// ── EVERY ROW IS A RAISED PLATE ON THE LESSON'S COLOUR ─────────────────────
//
// See ./QuestionParts. The one you choose drops onto its lip; the verdict then
// strikes the right position green and a wrong choice rust. A holder's name is
// drawn in their ERA's colour, the one hue this app licenses for "who was this".
//
// ── THE SCENE MOVES WITH IT ─────────────────────────────────────────────────
//
// `pos` is the row as drawn and `sem` the option as authored, both eased; a scene
// reads `sem` (SceneApi.pickPos), because the rows are shuffled.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  poll: PollBlock;
  picked: string | null;
  onPick: (id: string, correct: boolean) => void;
  /** 0..1 down the ballot AS DRAWN — the control's own position. */
  pos: SharedValue<number>;
  /** 0..1 across the options AS AUTHORED — what a scene reads (SceneApi.pickPos). */
  sem?: SharedValue<number>;
  /** The question's own words, so the row order is stable but not authored. */
  seed: string;
}

// ── A HOLDER'S ERA, BY NAME ──────────────────────────────────────────────────
//
// Holders are written as names, the way a reader says them, so the roster is
// indexed by name once: the full name with its dots and spaces folded away, and a
// surname wherever exactly one thinker carries it. A school ("the Stoics") or a
// name the roster does not carry is drawn in ink.
let HUE_BY_NAME: Map<string, string> | null = null;
const fold = (s: string) => s.toLowerCase().replace(/[.\s]+/g, '');
function eraHueOf(name: string): string | null {
  if (!HUE_BY_NAME) {
    const byName = new Map<string, string>();
    const bySurname = new Map<string, string[]>();
    for (const p of ALL_PHILOSOPHERS) {
      const hue = ERA[eraGroupOf(p) as EraKey];
      if (!hue) continue;
      byName.set(fold(p.name), hue);
      const last = fold(p.name.split(' ').pop() ?? '');
      bySurname.set(last, [...(bySurname.get(last) ?? []), hue]);
    }
    for (const [last, hues] of bySurname) if (hues.length === 1 && !byName.has(last)) byName.set(last, hues[0]);
    HUE_BY_NAME = byName;
  }
  return HUE_BY_NAME.get(fold(name)) ?? HUE_BY_NAME.get(fold(name.split(' ').pop() ?? '')) ?? null;
}

export default function PollBallot({ poll, picked, onPick, pos, sem, seed }: Props) {
  const answered = picked !== null;
  const n = poll.options.length;
  const order = orderFor(seed, n);
  const options = order.map((k) => poll.options[k]);

  useEffect(() => {
    pos.value = 0.5;
    // Mid-scale, matching `pos`: nothing is chosen yet, so the scene must not be
    // shown either end of the question before the reader has said anything.
    if (sem) sem.value = 0.5;
  }, [poll, pos, sem]);

  const choose = useCallback((k: number) => {
    if (answered) return;
    const o = options[k];
    // EASED, NOT SNAPPED: a scene track driven off this would otherwise cover a
    // whole step between two frames (group L).
    pos.value = withTiming(n > 1 ? k / (n - 1) : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
    if (sem) sem.value = withTiming(n > 1 ? order[k] / (n - 1) : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
    touch();
    onPick(o.id, Boolean(o.correct));
  }, [answered, options, order, n, onPick, pos, sem]);

  return (
    <View style={styles.wrap} nativeID="poll-ballot">
      {options.map((o, k) => (
        <Row key={o.id} option={o} index={k} answered={answered} picked={picked} onPress={() => choose(k)} />
      ))}
    </View>
  );
}

function Row({ option, index, answered, picked, onPress }: {
  option: PollBlock['options'][number];
  index: number;
  answered: boolean;
  picked: string | null;
  onPress: () => void;
}) {
  const accent = useQuestionAccent();
  const mine = picked === option.id;
  const state: PlateState = !answered ? 'idle' : option.correct ? 'right' : mine ? 'wrong' : 'rest';
  const gem = state === 'right' ? VERDICT.right.ink
    : state === 'wrong' ? VERDICT.wrong.ink
      : state === 'rest' ? mix(PAPER, INK, 0.3)
        : accent.base;

  const down = useSharedValue(0);
  useEffect(() => {
    down.value = withTiming(answered && mine ? 1 : 0, { duration: 90 });
  }, [answered, mine, down]);

  const holders = option.holders ?? [];

  return (
    <Animated.View layout={LinearTransition.duration(280)} style={styles.slot}>
      <Pressable
        onPress={onPress}
        disabled={answered}
        accessibilityRole="button"
        accessibilityLabel={option.reads}
        onPressIn={() => { if (!answered) down.value = 1; }}
        onPressOut={() => { if (!answered) down.value = 0; }}
      >
        {/* Answered rows tighten by a few points each, because every row gains its
            holder line at once and the explanation below still has to fit the deck. */}
        <LipPlate state={state} down={down} radius={10} faceStyle={[styles.face, answered && styles.faceAnswered]}>
          <View style={styles.line}>
            <View style={[styles.gem, { backgroundColor: gem }]} />
            <Text style={styles.reads} numberOfLines={2}>{option.reads}</Text>
          </View>
          {/* MOUNTED ON ANSWERING AND NOT BEFORE. See the header: a line that
              exists at opacity 0 still takes its height, and that height was the
              answer. */}
          {answered && holders.length ? (
            <Animated.View entering={FadeIn.duration(260).delay(160 + index * 90)} style={styles.held}>
              <Text style={styles.heldBy}>HELD BY</Text>
              <Text style={styles.names} numberOfLines={1}>
                {holders.map((h, i) => (
                  <Text key={`${i}:${h}`}>
                    {i ? <Text style={styles.dot}>{'  ·  '}</Text> : null}
                    <Text style={{ color: eraHueOf(h) ?? INK }}>{h}</Text>
                  </Text>
                ))}
              </Text>
            </Animated.View>
          ) : null}
        </LipPlate>
      </Pressable>
      {answered && mine ? <VerdictSeal correct={Boolean(option.correct)} size={22} style={styles.seal} /> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'stretch', paddingHorizontal: 20, marginTop: 2 },
  slot: { marginBottom: 5 },
  face: { paddingHorizontal: 10, paddingVertical: 7 },
  faceAnswered: { paddingVertical: 5 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  gem: { width: 8, height: 8, borderRadius: 4 },
  // flexShrink so a long position wraps inside the row (S8).
  reads: { flexShrink: 1, fontFamily: 'Inter_500Medium', fontSize: 12.5, lineHeight: 16, color: INK },
  held: { flexDirection: 'row', alignItems: 'baseline', gap: 7, marginTop: 2, paddingLeft: 17 },
  heldBy: { fontFamily: 'Inter_700Bold', fontSize: 8.5, letterSpacing: 1.1, color: SOFT },
  names: { flexShrink: 1, fontFamily: 'Inter_700Bold', fontSize: 11, lineHeight: 14 },
  dot: { color: SOFT },
  seal: { top: -7, right: -5 },
});
