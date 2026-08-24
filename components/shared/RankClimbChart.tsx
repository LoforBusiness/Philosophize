import { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path, Circle, Line as SvgLine, Defs, LinearGradient, Stop, G,
} from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, useAnimatedStyle, withTiming, withDelay, withSequence, runOnJS, Easing,
} from 'react-native-reanimated';
import { rankProgress } from '@/data/ranks';
import ACounter, { counterStyle } from './ACounter';
import { INK, MID, PAPER, PAPER_SHADE, FAINT } from './tone';
import type { XpEvent } from '@/stores/userDataStore';

const APath = Animated.createAnimatedComponent(Path);
// The counter — a TextInput whose `text` is written from the UI thread — moved to
// components/shared/ACounter.tsx when the Insights ghost needed the same trick.
// The reasoning that produced it lives there; this is now just a consumer.

/**
 * THE CLIMB FROM THE RANK YOU HOLD TO THE NEXT ONE.
 *
 * ── THE TWO DOTS ARE THE WHOLE FRAME ────────────────────────────────────────
 *
 * One sits low and left, one high and right, and neither is in its corner: a dot
 * ON the axis reads as an axis marker, a dot inset reads as a PLACE. The low one
 * is the rank you hold, the high one is the next. Everything between them is the
 * distance you are covering, and every scrap of XP moves the head of the line a
 * little further along it.
 *
 * ── WHY IT IS NOT A STRAIGHT RUN BETWEEN THEM ───────────────────────────────
 *
 * Each node is one thing actually earned, and the things are different sizes — a
 * finished lesson is 50 XP, a saved quote is 3, a perfect run more again. So the
 * height gained between nodes varies while the spacing does not, and the zigzag
 * comes out of the data rather than being drawn on top of it. A chart whose bumps
 * were decoration would be a chart where tapping a bump could tell you nothing,
 * because the bump was not anything.
 *
 * The x-axis is therefore steps taken, scaled so the head lands at the fraction
 * of the band that has been earned — the line grows toward the far dot along
 * both axes at once, which is what makes progress read as travel.
 *
 * ── IT DRAWS ITSELF EVERY LOOK, AND TELLS THE LONGER STORY WHEN THERE IS ONE ─
 *
 * Two different animations were confused into one here, and separating them is
 * the fix for a reader who said, twice, that they could never catch it moving.
 *
 *   THE ENTRANCE — the line drawing itself in — belongs to every look. It is what
 *   a chart does when it arrives, and withholding it does not preserve anything;
 *   it just means the reader scrolls down to a finished picture and never learns
 *   there was a chart being drawn.
 *
 *   THE RECAP — drawing to where it stood at `seenXP`, holding, and then growing
 *   on — belongs only to a look where something has actually been earned since
 *   last time. THAT is the animation that means "you moved", and replaying it
 *   when nothing has changed is what would make it stop meaning anything.
 *
 * The old rule ("nothing new, so no animation at all") also ran into a second
 * thing: `played` is a ref, and a tab screen is mounted for the entire session.
 * So even a reader who DID earn something got the recap at most once, ever, and
 * only if they happened to be looking at the right nine hundredth point of the
 * page at the right moment. Both halves now reset whenever `active` goes false —
 * see the effect below, and `rearm` in lib/utils/useInView.
 *
 * ── INK, NOT COLOUR (§19) ───────────────────────────────────────────────────
 *
 * The structure is borrowed from a teal-and-orange reference — the filled area,
 * the round nodes, the pointed callout, the faint grid — and every value comes
 * from tone.ts. Photographs remain the one place this app bends.
 */

export interface RankClimbProps {
  rankIndex: number;
  totalXP: number;
  events: XpEvent[];
  width: number;
  /** Total when this chart was last looked at; drives whether it animates. */
  seenXP?: number;
  /** False while the screen is not in front of the reader — holds the intro. */
  active?: boolean;
  /** Called once the intro has been shown, so it is not shown again unearned. */
  onSeen?: () => void;
  height?: number;
}

/** Where the two dots sit inside the plot — inset, never in the corner. */
const START = { x: 0.06, y: 0.88 };
const END = { x: 0.94, y: 0.10 };
/** Fewest nodes worth calling a shape. Below this the run is back-filled. */
const MIN_NODES = 5;

/**
 * The nodes for this band: the rank threshold itself, then everything earned
 * since. The first node is the floor the reader entered on, which is a real
 * number rather than an invented one — that is the "back-fill".
 */
export function bandNodes(events: XpEvent[], totalXP: number, floor: number, ceil: number) {
  const inBand = (events ?? [])
    .filter((e) => e && Number.isFinite(e.v) && e.v > floor)
    .map((e) => Math.min(e.v, ceil));
  // Always start on the floor; always end on the live total. Everything between
  // is something that was earned.
  const vals = [floor, ...inBand];
  const last = Math.min(totalXP, ceil);
  if (vals[vals.length - 1] !== last) vals.push(last);
  // De-duplicate flat repeats: two nodes at one height draw a step of no size.
  const out = vals.filter((v, i) => i === 0 || v !== vals[i - 1]);
  return out.length === 1 ? [out[0], out[0]] : out;
}

export default function RankClimbChart({
  rankIndex, totalXP, events, width, seenXP = 0, active = true, onSeen, height = 200,
}: RankClimbProps) {
  const { current, next, pct, toNext, pending } = rankProgress(rankIndex, totalXP);

  const padL = 40, padR = 14, padTop = 18, padBottom = 24;
  const plotX = padL, plotY = padTop;
  const plotW = Math.max(1, width - padL - padR);
  const plotH = Math.max(1, height - padTop - padBottom);

  const floor = current.xp;
  const ceil = next ? next.xp : Math.max(totalXP, current.xp + 1);
  const span = Math.max(1, ceil - floor);

  const ax = (f: number) => plotX + f * plotW;
  const ay = (f: number) => plotY + f * plotH;
  const startPt = { x: ax(START.x), y: ay(START.y) };
  const endPt = { x: ax(END.x), y: ay(END.y) };

  const geo = useMemo(() => {
    const vals = bandNodes(events, totalXP, floor, ceil);
    // The head lands at the fraction earned, along BOTH axes — so the line grows
    // toward the far dot rather than merely upward beneath it.
    const frac = Math.max(0, Math.min(1, (Math.min(totalXP, ceil) - floor) / span));
    const headX = startPt.x + (endPt.x - startPt.x) * frac;

    const n = Math.max(vals.length, MIN_NODES);
    const pts = vals.map((v, i) => {
      // Spread over the run; when there are too few real nodes the spread still
      // uses the full width so a young climb is not squeezed into a corner.
      const t = vals.length === 1 ? 0 : i / (vals.length - 1);
      const vf = (v - floor) / span;
      return {
        v,
        x: startPt.x + (headX - startPt.x) * t,
        y: startPt.y + (endPt.y - startPt.y) * vf,
      };
    });

    let d = '';
    const seg: number[] = [];
    let total = 0;
    pts.forEach((p, i) => {
      if (i === 0) { d = `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`; return; }
      d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      const len = Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y);
      total += len;
      seg.push(total);
    });

    // How much of THIS path had already been walked at `seenXP` — the point the
    // intro starts from.
    const seenIdx = Math.max(0, vals.findIndex((v) => v > seenXP) - 1);
    const seenLen = seenIdx <= 0 ? 0 : seg[Math.min(seenIdx, seg.length) - 1] ?? 0;
    const from = total > 0 ? Math.max(0, Math.min(1, seenLen / total)) : 1;

    const area = pts.length > 1
      ? `${d} L ${pts[pts.length - 1].x.toFixed(1)} ${plotY + plotH} L ${pts[0].x.toFixed(1)} ${plotY + plotH} Z`
      : '';
    return { pts, d, area, len: Math.max(1, total) * 1.02, from, frac, nodes: n };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, totalXP, floor, ceil, width, height, seenXP]);

  const head = geo.pts[geo.pts.length - 1];
  // IS THERE A RECAP WORTH PLAYING? Two ends of the range disqualify it, and the
  // low end was found by watching the thing rather than by reading it: a reader
  // whose last look predates this whole band has `from` at 0, so the recap drew
  // NOTHING, then held on nothing, and the chart sat empty for a second and a
  // half before the first mark appeared. A pause is anticipation only when there
  // is something on screen to be paused on.
  const RECAP_FLOOR = 0.06;
  const fresh = totalXP > seenXP && geo.from >= RECAP_FLOOR && geo.from < 1;

  // ── the intro ──────────────────────────────────────────────────────────────
  //
  // It starts at nothing and draws in, so `drawFrom` is 0 — but it is still
  // written down as a plain number rather than read back off the shared value,
  // because the counter's `defaultValue` needs it during render. Reading
  // `draw.value` there fires Reanimated's strict-mode "reading from `value`
  // during component render" warning on every screen this chart appears on. The
  // read was harmless (a snapshot used for one frame, before `countProps` takes
  // the text over); the warning is not, because it is identical to the one a real
  // stale read produces, and three copies per screen is the noise that hides the
  // next genuine one.
  const drawFrom = 0;
  const draw = useSharedValue(drawFrom);
  const mark = useSharedValue(0);
  const played = useRef(false);
  const gained = Math.max(0, Math.min(totalXP, ceil) - floor);

  useEffect(() => {
    // NOT ON SCREEN: put it back to nothing and let the next look have its own.
    // `played` is a ref on a component that a tab screen keeps mounted all
    // session, so without this line the chart animates once and is finished
    // forever — which is exactly how it was reported.
    if (!active) { played.current = false; draw.value = 0; mark.value = 0; return; }
    if (played.current) return;
    played.current = true;
    // LEAD is the short pause between the chart arriving and the line starting.
    // Without it the draw is already under way by the time the reader's eye has
    // landed on the thing, which is the difference between watching something
    // happen and finding it half done.
    const LEAD = 280;
    // `onSeen` rides the line's OWN completion rather than a timer that finished
    // at roughly the same moment.
    const finish = onSeen;
    const land = (ok?: boolean) => { 'worklet'; if (ok && finish) runOnJS(finish)(); };

    if (!fresh) {
      const DRAW = 1150;
      draw.value = withDelay(LEAD, withTiming(
        1, { duration: DRAW, easing: Easing.inOut(Easing.cubic) }, land,
      ));
      mark.value = withDelay(LEAD + DRAW - 260, withTiming(1, { duration: 380 }));
      return;
    }
    // Something has been earned since the last look, so the line is drawn in two
    // parts: where you stood, a beat to take it in, then the ground you gained.
    const RECAP = 620, HOLD = 620, GROW = 1300;
    draw.value = withDelay(LEAD, withSequence(
      withTiming(geo.from, { duration: RECAP, easing: Easing.out(Easing.cubic) }),
      withDelay(HOLD, withTiming(
        1, { duration: GROW, easing: Easing.inOut(Easing.cubic) }, land,
      )),
    ));
    mark.value = withDelay(LEAD + RECAP + HOLD + GROW - 260, withTiming(1, { duration: 380 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: (1 - draw.value) * geo.len }));
  const countProps = useAnimatedProps(() => ({ text: `+${Math.round(draw.value * gained)} XP` }) as never);
  const areaProps = useAnimatedProps(() => ({ opacity: draw.value * 0.9 }));
  const headStyle = useAnimatedStyle(() => ({
    opacity: mark.value,
    transform: [{ scale: 0.8 + 0.2 * mark.value }],
  }));

  // Four gridlines, labelled in XP. The band's own ends are two of them, so the
  // numbers on the axis are thresholds rather than arbitrary round figures.
  const rows = [0, 1, 2, 3].map((k) => {
    const f = k / 3;
    return { y: ay(0.06 + f * 0.86), v: Math.round(ceil - f * span) };
  });

  const label = pending
    ? 'BAND COMPLETE'
    : next
      ? `${toNext.toLocaleString()} XP TO ${next.name.toUpperCase()}`
      : 'HIGHEST RANK ATTAINED';

  return (
    <View style={{ width }}>
      <View style={[styles.card, { width, height }]}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="climbFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={PAPER_SHADE} stopOpacity={0.85} />
              <Stop offset="1" stopColor={PAPER_SHADE} stopOpacity={0.12} />
            </LinearGradient>
          </Defs>

          {rows.map((r, k) => (
            <SvgLine key={k} x1={plotX} y1={r.y} x2={plotX + plotW} y2={r.y}
              stroke={FAINT} strokeWidth={1} />
          ))}

          {/* What is still to go: the stretch from the head to the next rank. */}
          <SvgLine
            x1={head.x} y1={head.y} x2={endPt.x} y2={endPt.y}
            stroke={FAINT} strokeWidth={1.5} strokeDasharray="3 5" strokeLinecap="round"
          />

          {geo.pts.length > 1 && <APath d={geo.area} fill="url(#climbFill)" animatedProps={areaProps} />}
          {geo.pts.length > 1 && (
            <APath
              d={geo.d} stroke={INK} strokeWidth={2.6} fill="none"
              strokeLinejoin="round" strokeLinecap="round"
              strokeDasharray={geo.len} animatedProps={lineProps}
            />
          )}

          {/* The far dot: the rank being climbed to. Hollow — not yours yet. */}
          <G>
            <Circle cx={endPt.x} cy={endPt.y} r={6} fill={PAPER} stroke={INK} strokeWidth={2} />
          </G>
          {/* The near dot: the rank you hold. Filled — you are standing on it. */}
          <Circle cx={startPt.x} cy={startPt.y} r={5} fill={INK} />
        </Svg>

        {rows.map((r, k) => (
          <Text key={k} style={[styles.yLabel, { top: r.y - 7, width: padL - 6 }]}>
            {r.v.toLocaleString()}
          </Text>
        ))}

        {/* THE CALLOUT, at the head of the line. Ink with paper type, and a small
            point aimed at the node — the reference's orange badge, in the app's
            own material. It lands as the line arrives rather than riding along
            it: a label dragged through a moving path is unreadable the whole way. */}
        <Animated.View
          style={[
            styles.calloutWrap,
            { left: Math.max(2, Math.min(width - 92, head.x - 88)), top: head.y - 13 },
            headStyle,
          ]}
          pointerEvents="none"
        >
          <View style={styles.callout}>
            <ACounter
              editable={false}
              pointerEvents="none"
              underlineColorAndroid="transparent"
              defaultValue={`+${Math.round(drawFrom * gained)} XP`}
              style={[styles.calloutText, counterStyle]}
              animatedProps={countProps}
            />
          </View>
          <View style={styles.calloutTip} />
        </Animated.View>

        <Animated.View
          style={[styles.headDot, { left: head.x - 7, top: head.y - 7 }, headStyle]}
          pointerEvents="none"
        />
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendName}>{current.name} → {next ? next.name : 'the summit'}</Text>
        <Text style={styles.legendNote}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PAPER,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: FAINT,
    overflow: 'hidden',
  },
  yLabel: {
    position: 'absolute', left: 0, textAlign: 'right',
    fontFamily: 'Inter_500Medium', fontSize: 8.5, color: MID,
    fontVariant: ['tabular-nums'], includeFontPadding: false,
  },
  calloutWrap: { position: 'absolute', flexDirection: 'row', alignItems: 'center' },
  callout: {
    backgroundColor: INK, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 4,
  },
  calloutText: {
    fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.6, color: PAPER,
    fontVariant: ['tabular-nums'],
  },
  // A small square turned 45° reads as the badge's point without a second shape.
  calloutTip: {
    width: 8, height: 8, backgroundColor: INK, transform: [{ rotate: '45deg' }], marginLeft: -4,
  },
  headDot: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7,
    backgroundColor: PAPER, borderWidth: 3, borderColor: INK,
  },
  legend: { marginTop: 8, alignItems: 'center' },
  legendName: { fontFamily: 'Inter_700Bold', fontSize: 12, color: INK, letterSpacing: 0.3 },
  legendNote: { fontFamily: 'Inter_500Medium', fontSize: 10, color: MID, letterSpacing: 1, marginTop: 2 },
});
