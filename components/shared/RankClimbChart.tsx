import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Path, Circle, Line as SvgLine, Defs, LinearGradient, Stop, G,
} from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { rankProgress } from '@/data/ranks';
import { INK, MID, PAPER, PAPER_SHADE, FAINT } from './tone';
import type { XpEvent } from '@/stores/userDataStore';

const APath = Animated.createAnimatedComponent(Path);

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
 * ── IT ONLY ANIMATES WHEN THERE IS SOMETHING NEW ────────────────────────────
 *
 * On arriving it draws itself to where it stood at `seenXP` — the total when the
 * reader last looked — holds for a beat, and then grows on to where it stands
 * now. Nothing earned since last time means it is simply there, finished and
 * still. An animation that replays on every visit stops meaning "you moved".
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
  const fresh = totalXP > seenXP && geo.from < 1;

  // ── the intro ──────────────────────────────────────────────────────────────
  const draw = useSharedValue(fresh ? geo.from : 1);
  const mark = useSharedValue(fresh ? 0 : 1);
  const played = useRef(false);
  const [shownXP, setShownXP] = useState(() =>
    Math.round((fresh ? geo.from : 1) * (Math.min(totalXP, ceil) - floor)));

  useEffect(() => {
    if (!active || played.current) return;
    played.current = true;
    if (!fresh) {
      draw.value = 1;
      mark.value = withDelay(200, withTiming(1, { duration: 300 }));
      setShownXP(Math.min(totalXP, ceil) - floor);
      onSeen?.();
      return;
    }
    // A beat and a half to take in where you were, then the line grows.
    const HOLD = 1500, GROW = 1600;
    draw.value = withDelay(HOLD, withTiming(1, { duration: GROW, easing: Easing.inOut(Easing.cubic) }));
    mark.value = withDelay(HOLD + GROW - 250, withTiming(1, { duration: 380 }));
    const gained = Math.min(totalXP, ceil) - floor;
    const t0 = Date.now() + HOLD;
    const id = setInterval(() => {
      const p = Math.min(1, Math.max(0, (Date.now() - t0) / GROW));
      const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      setShownXP(Math.round((geo.from + (1 - geo.from) * eased) * gained));
      if (p >= 1) { clearInterval(id); onSeen?.(); }
    }, 16);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: (1 - draw.value) * geo.len }));
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
            <Text style={styles.calloutText}>+{shownXP.toLocaleString()} XP</Text>
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
