import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line as SvgLine } from 'react-native-svg';
import Glyph from './Glyph';
import { rankProgress } from '@/data/ranks';

const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const InkFaint = '#E2E0D8';
const Track = '#EDEBE3';

/**
 * THE CLIMB FROM THE RANK YOU HOLD TO THE NEXT ONE, day by day.
 *
 * The Ascent tab used to be a ladder of all twenty-five seals joined by a rule.
 * It showed the whole ladder and nothing about the reader: no sense of pace, no
 * sense of whether this week was better than last, and twenty-three of the rungs
 * were nowhere near them.
 *
 * So the y-axis is not the ladder — it is ONE BAND. The rank you hold sits on the
 * floor of the chart, the next one on the ceiling, and the line is your total XP
 * climbing between them. Rank up and the whole thing re-bases: the rank you just
 * earned drops to the floor, the next one appears at the ceiling, and the line
 * starts again from the bottom.
 *
 * ── WHAT IT CAN AND CANNOT KNOW ─────────────────────────────────────────────
 *
 * `xpByDay` stores the TOTAL at the end of each day, and it only started being
 * recorded when this chart was built — so an existing account has no back-history
 * and the line begins the day they update. There is no honest way around that:
 * the streak counter knows which days had *a* lesson but never how much XP, so
 * anything drawn for earlier days would be invented. An account with fewer than
 * two recorded days gets told that plainly instead of being shown a made-up line.
 */

export interface RankClimbProps {
  rankIndex: number;
  totalXP: number;
  xpByDay: Record<string, number>;
  width: number;
  /** How many days to plot. 14 keeps the ticks legible on a narrow phone. */
  days?: number;
}

const dayKey = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/**
 * One point per calendar day, carrying the last known total forward.
 *
 * A day with no entry is not a gap and not a zero — it is a day the reader earned
 * nothing, so the total stands still and the line goes flat. Filling forward is
 * what makes a rest day read as a plateau rather than as a crash to the axis.
 */
export function climbSeries(
  xpByDay: Record<string, number>, totalXP: number, days: number, today = new Date()
): { key: string; value: number; recorded: boolean }[] {
  const keys = Object.keys(xpByDay).sort();
  // NOTHING RECORDED IS NOT A HISTORY OF ZEROES. Without this the loop below
  // carried a seed of 0 across the whole window and then jumped to today's total
  // on the last point — a flat line along the floor and a cliff, describing days
  // the app has no idea about. An account that has never been stamped gets no
  // series at all, and the caller says so in words.
  if (!keys.length) return [];
  const first = keys[0];
  const out: { key: string; value: number; recorded: boolean }[] = [];
  // Carry-forward seed: the last total recorded BEFORE the window opens.
  let carry = 0;
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - (days - 1));
  for (const k of keys) if (k < dayKey(windowStart)) carry = xpByDay[k];

  for (let i = 0; i < days; i++) {
    const d = new Date(windowStart);
    d.setDate(d.getDate() + i);
    const k = dayKey(d);
    const hit = Object.prototype.hasOwnProperty.call(xpByDay, k);
    if (hit) carry = xpByDay[k];
    // Nothing was recorded before the tracking existed, so those days are not
    // "zero XP" — they are unknown, and the series simply starts later.
    if (first && k < first) continue;
    out.push({ key: k, value: hit ? xpByDay[k] : carry, recorded: hit });
  }
  // Today is live: XP earned since the last write belongs on the end.
  if (out.length) out[out.length - 1].value = Math.max(out[out.length - 1].value, totalXP);
  return out;
}

export default function RankClimbChart({
  rankIndex, totalXP, xpByDay, width, days = 14,
}: RankClimbProps) {
  const { current, next, pct, toNext, pending } = rankProgress(rankIndex, totalXP);
  const series = climbSeries(xpByDay, totalXP, days);

  const h = 208;
  const padL = 52, padR = 18, padTop = 30, padBottom = 34;
  const innerW = width - padL - padR;
  const innerH = h - padTop - padBottom;
  const floorY = padTop + innerH;

  // The band. Without a next rank there is no ceiling, so the top is the total.
  const lo = current.xp;
  const hi = next ? next.xp : Math.max(totalXP, current.xp + 1);
  const yFor = (xp: number) => {
    const t = Math.max(0, Math.min(1, (xp - lo) / Math.max(1, hi - lo)));
    return floorY - t * innerH;
  };

  const n = series.length;
  const xFor = (i: number) => (n <= 1 ? padL + innerW / 2 : padL + (i * innerW) / (n - 1));
  const pts = series.map((s, i) => ({ x: xFor(i), y: yFor(s.value), ...s }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  // The area under the climb, closed on the floor — it reads as ground covered.
  const areaPath = pts.length > 1
    ? `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${floorY} L ${pts[0].x.toFixed(1)} ${floorY} Z`
    : '';

  const tick = (i: number) => {
    const [, m, d] = series[i].key.split('-');
    return `${Number(m)}/${Number(d)}`;
  };

  return (
    <View style={{ width }}>
      <View style={{ width, height: h }}>
        <Svg width={width} height={h}>
          {/* the band's ceiling and floor */}
          <SvgLine x1={padL} y1={padTop} x2={width - padR} y2={padTop} stroke={InkFaint} strokeWidth={1.5} strokeDasharray="4 4" />
          <SvgLine x1={padL} y1={floorY} x2={width - padR} y2={floorY} stroke={Ink} strokeWidth={1.5} />
          {/* the left rule the two seals hang on */}
          <SvgLine x1={padL} y1={padTop} x2={padL} y2={floorY} stroke={InkFaint} strokeWidth={1.5} />

          {pts.length > 1 && <Path d={areaPath} fill={Track} />}
          {pts.length > 1 && <Path d={linePath} stroke={Ink} strokeWidth={2.4} fill="none" strokeLinejoin="round" strokeLinecap="round" />}
          {/* Only days that were actually recorded get a dot; a carried-forward
              flat day is real but it is not a data point. */}
          {pts.map((p, i) => (p.recorded || i === pts.length - 1) && (
            <Circle key={p.key} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4.2 : 2.6} fill={Ink} />
          ))}
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

        {/* Day ticks: first, middle, last — more than three is unreadable here.
            CLAMPED INTO THE CHART. Centring a 44-wide label on the last point put
            it at 288..332 inside a 328-wide chart, so today's date hung 4px off
            the right edge on a 360 phone — measured, not eyeballed. */}
        {n > 1 && [0, Math.floor((n - 1) / 2), n - 1].map((i, k) => (
          <Text
            key={k}
            style={[styles.tick, { left: Math.max(0, Math.min(width - 44, xFor(i) - 22)), top: floorY + 8 }]}
          >
            {tick(i)}
          </Text>
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendName}>{current.name} → {next ? next.name : 'the summit'}</Text>
        <Text style={styles.legendNote}>
          {!next
            ? 'Highest rank attained'
            : pending
              ? `Band complete — finish a lesson to take ${next.name}`
              : `${Math.round(pct * 100)}% of the way · ${toNext.toLocaleString()} XP to go`}
        </Text>
      </View>

      {series.length < 2 && (
        <Text style={styles.empty}>
          Your climb is recorded from today onwards — earn XP on a few different days
          and the line will chart itself.
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
