import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { MotiView } from 'moti';
import Svg, { Path } from 'react-native-svg';

/**
 * Hand-drawn grey blob wallpaper for the lesson background.
 * Pass a changing `variant` (e.g. the card index) and the drawing gently
 * drifts / re-scales and crossfades between two blob arrangements, giving a
 * subtle "the sketch is redrawing itself" feel on every new slide.
 *
 * Kept very light grey so dark ink text stays high-contrast on top.
 */

const FILL = '#EAEAE5';
const LINE = '#D2D2CB';

// Two organic arrangements drawn in a 400 x 800 portrait viewBox.
const GROUP_A = {
  masses: [
    'M400,0 L150,0 C175,82 110,132 55,188 C145,228 240,206 300,272 C356,332 400,312 400,312 Z',
    'M0,800 L0,500 C82,542 162,500 222,546 C286,594 250,682 332,714 C370,730 400,712 400,800 Z',
  ],
  lines: [
    'M150,0 C175,82 110,132 55,188 C145,228 240,206 300,272 C356,332 400,312 400,312',
    'M158,-6 C184,80 122,136 66,192 C156,234 250,212 310,278',
    'M0,500 C82,542 162,500 222,546 C286,594 250,682 332,714',
  ],
};

const GROUP_B = {
  masses: [
    'M0,0 L180,0 C152,72 202,142 252,182 C192,232 92,212 62,282 C32,352 82,382 62,432 C42,472 0,462 0,462 Z',
    'M400,820 L400,560 C330,540 300,470 240,500 C176,533 200,620 130,650 C92,666 60,700 90,760 C110,800 200,800 200,820 Z',
  ],
  lines: [
    'M180,0 C152,72 202,142 252,182 C192,232 92,212 62,282 C32,352 82,382 62,432',
    'M188,-6 C160,72 208,146 258,186 C198,238 98,218 68,288',
    'M400,560 C330,540 300,470 240,500 C176,533 200,620 130,650',
  ],
};

const VARIANTS = [
  { translateX: 0, translateY: 0, rotate: '0deg', scale: 1.06 },
  { translateX: -14, translateY: 10, rotate: '2deg', scale: 1.1 },
  { translateX: 12, translateY: -8, rotate: '-2deg', scale: 1.08 },
  { translateX: -8, translateY: -12, rotate: '1.5deg', scale: 1.12 },
  { translateX: 10, translateY: 12, rotate: '-1.5deg', scale: 1.07 },
];

function BlobGroup({ group, w, h }: { group: typeof GROUP_A; w: number; h: number }) {
  return (
    <Svg width={w} height={h} viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice">
      {group.masses.map((d, i) => (
        <Path key={`m${i}`} d={d} fill={FILL} />
      ))}
      {group.lines.map((d, i) => (
        <Path
          key={`l${i}`}
          d={d}
          fill="none"
          stroke={LINE}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
}

export default function SketchWallpaper({ variant = 0 }: { variant?: number }) {
  const { width, height } = useWindowDimensions();
  const len = VARIANTS.length;
  const v = VARIANTS[((variant % len) + len) % len];
  const showA = variant % 2 === 0;

  // Oversize the canvas so drift / rotate / scale never exposes blank corners.
  const W = width * 1.3;
  const H = height * 1.3;
  const left = (width - W) / 2;
  const top = (height - H) / 2;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <MotiView
        animate={{
          translateX: v.translateX,
          translateY: v.translateY,
          rotate: v.rotate,
          scale: v.scale,
        }}
        transition={{ type: 'timing', duration: 650 }}
        style={{ position: 'absolute', left, top, width: W, height: H }}
      >
        <MotiView
          animate={{ opacity: showA ? 0.9 : 0 }}
          transition={{ type: 'timing', duration: 650 }}
          style={StyleSheet.absoluteFill}
        >
          <BlobGroup group={GROUP_A} w={W} h={H} />
        </MotiView>
        <MotiView
          animate={{ opacity: showA ? 0 : 0.9 }}
          transition={{ type: 'timing', duration: 650 }}
          style={StyleSheet.absoluteFill}
        >
          <BlobGroup group={GROUP_B} w={W} h={H} />
        </MotiView>
      </MotiView>
    </View>
  );
}
