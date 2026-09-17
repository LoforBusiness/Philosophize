import { memo } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { C, RADIUS } from '@/constants/design';
import { TRACK, TRACK_ON_INK, SHINE, LOCK_EDGE } from '@/components/shared/tone';

// ─────────────────────────────────────────────────────────────────────────────
// A PROGRESS BAR, CHUNKY AND FLAT, WITH A SHINE (2026-09-16).
//
// The bars outside the lessons were thin (4–9px), and the struck ones ran a
// lit→base→shade GRADIENT along the fill with groove hairlines above and below
// it. Measured against the reference the owner pointed at, that is the wrong way
// round on both counts: Duolingo's bar is a flat fill with ONE thin white stripe
// along its top third, and it is chunky — their lesson bar is about 18pt.
//
// The recipe, from their live stylesheet rather than from a guess:
//   · the track is a pale neutral and the fill one flat colour;
//   · the fill is never narrower than 1.5× the bar's height, so one lesson done
//     is a visible pill and not a sliver;
//   · the shine is white at 30%, 30% of the height tall, a fifth of the height
//     down from the top, and inset a quarter of the height at each end.
//
// No gradient anywhere, which is the part that matters most: a gradient fill is
// the first thing design writers list when they describe an AI-made screen.
//
// MILESTONES are dots along the bar, reached ones in the bar's colour, each
// ringed in the ground so it reads as a stop rather than as a bead. NOTCHES are
// gaps cut through the bar, for a bar that is really a row of segments.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  /** 0…1. */
  pct: number;
  /** The fill colour. */
  color: string;
  /** Default 12. */
  height?: number;
  /** A bar drawn on an ink ground takes a translucent track. */
  onInk?: boolean;
  /** Override the empty part's colour. */
  track?: string;
  /** Fractions along the bar where a milestone dot sits. */
  marks?: number[];
  /** Fractions along the bar where the bar is cut into segments. */
  notches?: number[];
  /** What the bar sits on — the colour of the notch gaps and the dots' rings. */
  ground?: string;
  style?: StyleProp<ViewStyle>;
}

function Meter({
  pct, color, height = 12, onInk = false, track, marks, notches, ground, style,
}: Props) {
  const p = Math.max(0, Math.min(1, pct));
  const h = height;
  const under = ground ?? (onInk ? C.ink : C.surface);
  const shineTop = Math.max(1, Math.round(h * 0.2));
  const shineH = Math.max(2, Math.round(h * 0.3));
  const dot = h + 6;
  return (
    <View style={[{ height: h }, marks?.length ? styles.withMarks : null, style]}>
      <View
        style={[
          styles.track,
          { height: h, borderRadius: RADIUS.pill, backgroundColor: track ?? (onInk ? TRACK_ON_INK : TRACK) },
        ]}
      >
        {p > 0 && (
          <View
            style={{
              width: `${p * 100}%`,
              minWidth: Math.round(h * 1.5),
              height: h,
              borderRadius: RADIUS.pill,
              backgroundColor: color,
            }}
          >
            <View
              style={[
                styles.shine,
                { left: h / 4, right: h / 4, top: shineTop, height: shineH },
              ]}
            />
          </View>
        )}
        {(notches ?? []).map((n) => (
          <View
            key={`n${n}`}
            style={[styles.notch, { left: `${n * 100}%`, width: Math.max(2, Math.round(h / 4)), backgroundColor: under }]}
          />
        ))}
      </View>
      {(marks ?? []).map((m) => (
        <View
          key={`m${m}`}
          pointerEvents="none"
          style={[
            styles.mark,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              top: (h - dot) / 2,
              left: `${m * 100}%`,
              marginLeft: -dot / 2,
              borderColor: under,
              backgroundColor: p >= m - 0.001 ? color : onInk ? TRACK_ON_INK : LOCK_EDGE,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default memo(Meter);

const styles = StyleSheet.create({
  withMarks: { marginHorizontal: 2 },
  track: { overflow: 'hidden', flexDirection: 'row' },
  shine: { position: 'absolute', borderRadius: RADIUS.pill, backgroundColor: SHINE },
  notch: { position: 'absolute', top: 0, bottom: 0 },
  mark: { position: 'absolute', borderWidth: 3 },
});
