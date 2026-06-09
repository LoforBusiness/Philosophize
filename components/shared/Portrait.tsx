import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

// A single, simple stick figure: a head, a small body, and a plain face.
// (The old set of 25 character portraits was removed in favour of this.)
export default function Portrait({
  size = 64,
  color = '#1A1A1A',
}: {
  name?: string; // accepted for backwards compatibility; ignored
  size?: number;
  color?: string;
}) {
  const s = {
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* head */}
      <Circle cx="32" cy="25" r="13" {...s} />
      {/* eyes */}
      <Circle cx="27" cy="23" r="1.6" fill={color} />
      <Circle cx="37" cy="23" r="1.6" fill={color} />
      {/* simple mouth */}
      <Path d="M27 30 Q32 33 37 30" {...s} />
      {/* a little body */}
      <Path d="M17 60 C18 50 24 45 32 45 C40 45 46 50 47 60" {...s} />
    </Svg>
  );
}
