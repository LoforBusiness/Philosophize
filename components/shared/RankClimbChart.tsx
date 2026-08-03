import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line as SvgLine } from 'react-native-svg';
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import Glyph from './Glyph';
import { rankProgress } from '@/data/ranks';
import type { XpEvent } from '@/stores/userDataStore';

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';
const Track = '#EDEBE3';

const APath = Animated.createAnimatedComponent(Path);
const ACircle = Animated.createAnimatedComponent(Circle);

/**
 * THE CLIMB FROM THE RANK YOU HOLD TO THE NEXT ONE, ONE STEP PER THING EARNED.
 *
 * The y-axis is not the ladder — it is ONE BAND. The rank you hold sits on the
 * floor, the next one on the ceiling, and the line is your total XP climbing
 * between them. Rank up and the whole thing re-bases: the rank just earned drops
 * to the floor, the next appears at the ceiling, and the climb starts again.
 *
 * ── WHY THE X-AXIS IS NOT TIME ──────────────────────────────────────────────
 *
 * It used to be fourteen calendar days, drawn from a map of totals-per-day. That
 * had two faults and they were the same fault: the chart could only move once
 * per midnight. Six lessons in one evening drew a single point, and a reader on
 * their first day got no line at all, because there is nothing to draw between
 * one point and itself.
 *
 * So the x-axis is the log itself — one step per lesson, quote, thinker and quiz.
 * Every earning is a step of equal width, which makes the shape read as "how many
 * things have I done and how far did each carry me" rather than as a date series.
 * The dates of the two ends are still printed, so the climb is placed in time
 * without time deciding the spacing.
 *
 * ── WHAT IT CAN AND CANNOT KNOW ─────────────────────────────────────────────
 *
 * The log records forward from the update that introduced it, and existing
 * accounts are seeded from the old day map (see `eventsFromDayMap`) — real
 * totals, coarser resolution, nothing invented. Before that there is no honest
 * history: the streak counter knew which days had *a* lesson but never how much
 * XP, so anything drawn for earlier moments would be fiction.
 */

export interface RankClimbProps {
  rankIndex: number;
  totalXP: number;
  events: XpEvent[];
  width: number;
  /** Most steps to draw. Beyond this the earliest are dropped, not squeezed. */
  maxSteps?: number;
}

/**
 * The stretch of the log that belongs to the band being drawn.
 *
 * Starts one event BEFORE the total first reached this rank's floor, so the line
 * begins on the floor rather than in mid-air — the reader entered the band from
 * somewhere, and that somewhere is the previous point. Everything below the floor
 * is then clamped to it by `yFor`, so the opening step reads as leaving the rank
 * behind.
 */
export function bandSeries(
  events: XpEvent[], totalXP: number, floor: number, maxSteps: number,
): XpEvent[] {
  const log = (events ?? []).filter((e) => e && Number.isFinite(e.v));
  if (!log.length) return totalXP > 0 ? [{ t: Date.now(), v: totalXP }] : [];

  let start = log.findIndex((e) => e.v >= floor);
  if (start < 0) start = log.length - 1;      // the whole log predates this band
  else if (start > 0) start -= 1;             // one before, so the line starts low
  let out = log.slice(start);
  if (out.length > maxSteps) out = out.slice(out.length - maxSteps);

  // Every XP change stamps an event, so the last one IS the total. If they ever
  // disagree — a legacy blob, a merge that arrived out of order — the live total
  // is the truth and belongs on the end.
  const last = out[out.length - 1];
  if (!last || last.v !== totalXP) out = [...out, { t: Date.now(), v: totalXP }];
  return out;
}

const dateLabel = (t: number) => {
  const d = new Date(t);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export default function RankClimbChart({
  rankIndex, totalXP, events, width, maxSteps = 40,
}: RankClimbProps) {
  const { current, next, pct, toNext, pending } = rankProgress(rankIndex, totalXP);

  const h = 208;
  const padL = 52, padR = 18, padTop = 30, padBottom = 34;
  const innerW = width - padL - padR;
  const innerH = h - padTop - padBottom;
  const floorY = padTop + innerH;

  const lo = current.xp;
  const hi = next ? next.xp : Math.max(totalXP, current.xp + 1);
  const yFor = (xp: number) => {
    const t = Math.max(0, Math.min(1, (xp - lo) / Math.max(1, hi - lo)));
    return floorY - t * innerH;
  };

  const series = bandSeries(events, totalXP, lo, maxSteps);
  const n = series.length;
  const xFor = (i: number) => (n <= 1 ? padL + innerW : padL + (i * innerW) / (n - 1));

  // A STAIRCASE, NOT A SLOPE. Each entry is a moment the total jumped, so the
  // line holds flat until the next thing is earned and then steps up. Sloping
  // between two earnings would draw XP arriving during the gap, which is the one
  // thing that certainly did not happen.
  const pts = series.map((s, i) => ({ x: xFor(i), y: yFor(s.v), ...s }));
  let d = '';
  let pathLen = 0;
  if (pts.length > 1) {
    d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const run = pts[i].x - pts[i - 1].x;
      const rise = Math.abs(pts[i].y - pts[i - 1].y);
      d += ` L ${pts[i].x.toFixed(1)} ${pts[i - 1].y.toFixed(1)} L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
      pathLen += run + rise;
    }
  }
  const areaPath = pts.length > 1
    ? `${d} L ${pts[pts.length - 1].x.toFixed(1)} ${floorY} L ${pts[0].x.toFixed(1)} ${floorY} Z`
    : '';
  // Slack, for the same reason the badge medals carry it: undershoot and part of
  // the line is already inked on the first frame, which reads as a bug.
  const LEN = Math.max(1, pathLen * 1.04);

  const last = pts[pts.length - 1];

  // ── the climb, drawn on ────────────────────────────────────────────────────
  // Plays once per mount. Earning more while it is open lengthens the path with
  // the offset already at 0, so the new step simply appears — the intro does not
  // replay and stutter every time XP lands.
  const draw = useSharedValue(0);
  const [shownPct, setShownPct] = useState(0);
  const [introDone, setIntroDone] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    if (played.current) return;
    played.current = true;
    draw.value = withDelay(160, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
    // The percentage counts up alongside the line, so the number and the picture
    // arrive together (A1 — what the text says, the picture must do).
    const DURATION = 1100, t0 = Date.now() + 160;
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / DURATION);
      if (p < 0) return;
      setShownPct(Math.round((1 - Math.pow(1 - p, 3)) * pct * 100));
      if (p >= 1) { clearInterval(id); setIntroDone(true); }
    }, 16);
    return () => clearInterval(id);
  }, []);

  // Once the intro has run, the number follows the real value — otherwise earning
  // XP with the sheet open would leave a stale percentage under a line that had
  // visibly moved. Kept in state rather than read off `draw` during render: a
  // shared value read in a render body is not tracked, so it would go stale in
  // exactly the case this exists to cover.
  useEffect(() => {
    if (introDone) setShownPct(Math.round(pct * 100));
  }, [introDone, pct]);

  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: (1 - draw.value) * LEN }));
  const areaProps = useAnimatedProps(() => ({ opacity: draw.value }));
  // The endpoint lands as the line arrives under it, rather than popping on.
  const dotProps = useAnimatedProps(() => ({
    opacity: Math.max(0, Math.min(1, (draw.value - 0.88) / 0.12)),
  }));

  return (
    <View style={{ width }}>
      <View style={{ width, height: h }}>
        <Svg width={width} height={h}>
          {/* Ground covered, under the line. Inside the same Svg on purpose — an
              overlaid second one is another native view per chart for no gain. */}
          {pts.length > 1 && <APath d={areaPath} fill={Track} animatedProps={areaProps} />}

          {/* the band's ceiling and floor */}
          <SvgLine x1={padL} y1={padTop} x2={width - padR} y2={padTop} stroke={InkFaint} strokeWidth={1.5} strokeDasharray="4 4" />
          <SvgLine x1={padL} y1={floorY} x2={width - padR} y2={floorY} stroke={Ink} strokeWidth={1.5} />
          {/* the left rule the two seals hang on */}
          <SvgLine x1={padL} y1={padTop} x2={padL} y2={floorY} stroke={InkFaint} strokeWidth={1.5} />

          {pts.length > 1 && (
            <APath
              d={d}
              stroke={Ink}
              strokeWidth={2.4}
              fill="none"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={LEN}
              animatedProps={lineProps}
            />
          )}
          {last && (
            <ACircle cx={last.x} cy={last.y} r={4.2} fill={Ink} animatedProps={dotProps} />
          )}
        </Svg>

        {/* NEXT rank on the ceiling, CURRENT on the floor — the whole point of the
            band. Positioned outside the Svg so the real seal glyphs can be used. */}
        {next && (
          <View style={[styles.seal, { top: padTop - 15, left: 4 }]}>
            <View style={styles.sealLocked}><Glyph name={next.glyph} size={16} color={InkSoft} /></View>
            <Text style={styles.sealXp}>{next.xp.toLocaleString()}</Text>
          </View>
        )}
        <View style={[styles.seal, { top: floorY - 15, left: 4 }]}>
          <View style={styles.sealNow}><Glyph name={current.glyph} size={16} color={Ink} /></View>
          <Text style={styles.sealXp}>{current.xp.toLocaleString()}</Text>
        </View>

        {/* The two ends, dated. The x-axis is steps rather than time, so these say
            WHEN the climb ran without pretending the spacing means anything.
            Clamped into the chart: centring a 44-wide label on the last step put
            it 4px off the right edge of a 360 phone — measured, not eyeballed. */}
        {n > 1 && (
          <>
            <Text style={[styles.tick, { left: Math.max(0, xFor(0) - 22), top: floorY + 8 }]}>
              {dateLabel(series[0].t)}
            </Text>
            <Text style={[styles.tick, { left: Math.min(width - 44, xFor(n - 1) - 22), top: floorY + 8 }]}>
              {dateLabel(series[n - 1].t)}
            </Text>
          </>
        )}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendName}>{current.name} → {next ? next.name : 'the summit'}</Text>
        <Text style={styles.legendNote}>
          {!next
            ? 'Highest rank attained'
            : pending
              ? `Band complete — finish a lesson to take ${next.name}`
              : `${shownPct}% of the way · ${toNext.toLocaleString()} XP to go`}
        </Text>
      </View>

      {/* A line needs two points. One earning is a dot and a promise; none is an
          invitation — and telling someone who has just earned something to "earn
          some XP" is the chart calling them a beginner for the second time. */}
      {n === 1 && (
        <Text style={styles.empty}>
          One step so far. The line starts drawing on your next.
        </Text>
      )}
      {n === 0 && (
        <Text style={styles.empty}>
          Every lesson, saved quote, thinker met and quiz adds a step. Earn some XP
          and the climb will chart itself.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  seal: { position: 'absolute', alignItems: 'center', width: 44 },
  sealNow: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: Ink,
    backgroundColor: '#FAFAF7', alignItems: 'center', justifyContent: 'center',
  },
  sealLocked: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: InkFaint,
    backgroundColor: '#FAFAF7', alignItems: 'center', justifyContent: 'center',
  },
  sealXp: { fontFamily: 'Inter_500Medium', fontSize: 8.5, color: InkSoft, marginTop: 2 },
  tick: { position: 'absolute', width: 44, textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 9, color: InkSoft },
  legend: { marginTop: 6, alignItems: 'center' },
  legendName: { fontFamily: 'Inter_700Bold', fontSize: 12, color: Ink, letterSpacing: 0.3 },
  legendNote: { fontFamily: 'Inter_400Regular', fontSize: 11, color: InkSoft, marginTop: 2 },
  empty: {
    fontFamily: 'Inter_400Regular', fontSize: 11.5, lineHeight: 17, color: InkSoft,
    textAlign: 'center', marginTop: 10, paddingHorizontal: 18,
  },
});
