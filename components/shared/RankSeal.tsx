import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Glyph, { type GlyphName } from './Glyph';

// A rank mark: the rank's hand-drawn Glyph inside ONE hairline ring. Nothing else.
//
// This used to be an engraved wax-seal medallion whose ornament escalated by tier —
// laurel wreaths, a reeded edge, a ribbon, a radiant crown of rays, an emboss
// highlight and a wax fill. It read as busy at 54px and fought the glyph it was
// meant to frame. A rank is now: the mark, and a ring around it.
//
// The ring doubles as the progress track, so on the rank-up screen the filling bar
// and the frame are the SAME circle rather than two concentric ones.
//
//   • earned  — full ink
//   • current — ink, plus the progress arc toward the next rank
//   • locked  — a faint slate silhouette that pulls the eye upward
//
// Geometry lives in a 100×100 viewBox centred on (50,50).

const INK = '#1A1A1A';
const GHOST = '#AAB1BC'; // locked linework (cool slate)

export type SealState = 'earned' | 'current' | 'locked';

interface Props {
  glyph: GlyphName;
  state: SealState;
  size?: number;
  progress?: number | null; // 0..1, draws the arc toward the next rank
}

const R = 42;
const CIRC = 2 * Math.PI * R;

export default function RankSeal({ glyph, state, size = 96, progress = null }: Props) {
  const locked = state === 'locked';
  const ink = locked ? GHOST : INK;
  const pct = progress == null ? null : Math.max(0, Math.min(1, progress));
  // With an arc over it the ring becomes a track and steps back; on its own it is
  // the frame and carries full weight.
  const trackOpacity = pct != null ? 0.2 : locked ? 0.55 : 1;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' }}>
        <Circle
          cx={50}
          cy={50}
          r={R}
          stroke={ink}
          strokeWidth={2}
          fill="none"
          opacity={trackOpacity}
        />
        {pct != null && pct > 0 && (
          <Circle
            cx={50}
            cy={50}
            r={R}
            stroke={ink}
            strokeWidth={3.2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${(pct * CIRC).toFixed(2)} ${CIRC.toFixed(2)}`}
            transform="rotate(-90 50 50)"
          />
        )}
      </Svg>
      <Glyph name={glyph} size={size * 0.46} color={ink} />
    </View>
  );
}
