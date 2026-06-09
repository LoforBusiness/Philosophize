import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, Pattern } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

const Paper = '#F1EEE7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';
const FaceLight = '#FFFFFF';
const FaceMid = '#E2E0D8';

// Isometric cube whose TOP-FACE CENTER is (cx, cy). a = half-width, h = a/2
// (quarter height), ch = riser height. Three shaded faces + ink outline = 3D.
function IsoCube({
  cx,
  cy,
  a,
  h,
  ch,
  top,
  left,
  right,
  sw = 2,
}: {
  cx: number;
  cy: number;
  a: number;
  h: number;
  ch: number;
  top: string;
  left: string;
  right: string;
  sw?: number;
}) {
  const topPath = `M ${cx} ${cy - h} L ${cx + a} ${cy} L ${cx} ${cy + h} L ${cx - a} ${cy} Z`;
  const leftPath = `M ${cx - a} ${cy} L ${cx} ${cy + h} L ${cx} ${cy + h + ch} L ${cx - a} ${cy + ch} Z`;
  const rightPath = `M ${cx + a} ${cy} L ${cx} ${cy + h} L ${cx} ${cy + h + ch} L ${cx + a} ${cy + ch} Z`;
  return (
    <>
      <Path d={leftPath} fill={left} stroke={Ink} strokeWidth={sw} strokeLinejoin="round" />
      <Path d={rightPath} fill={right} stroke={Ink} strokeWidth={sw} strokeLinejoin="round" />
      <Path d={topPath} fill={top} stroke={Ink} strokeWidth={sw} strokeLinejoin="round" />
    </>
  );
}

// Geometry — 4 descending steps + the hopping block's landing points.
const A = 24;
const H = 12;
const CH = 20;
const STEPS = [
  { x: 50, y: 44 },
  { x: 80, y: 74 },
  { x: 110, y: 104 },
  { x: 140, y: 134 },
];
// Top-face centers the falling block lands on (one cube-height above each step),
// preceded by a start point above the first step so it drops in.
const WPX = [50, 50, 80, 110, 140];
const WPY = [-24, 24, 54, 84, 114];
const SEGS = WPX.length - 1;
const HOP = 26;
const FALL_W = 56;
const FALL_CX = 28;
const FALL_CY = 16; // top-face center inside the falling block's mini-svg

export default function LessonLoader({ onDone }: { onDone?: () => void }) {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withTiming(1, { duration: 2300, easing: Easing.inOut(Easing.quad) });
    const t = setTimeout(() => onDone?.(), 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const blockStyle = useAnimatedStyle(() => {
    const pr = p.value * SEGS;
    const k = Math.min(SEGS - 1, Math.floor(pr));
    const t = pr - k;
    let ax: number;
    let ay: number;
    if (k < SEGS - 1) {
      // Clean parabolic hop down the upper steps.
      ax = WPX[k] + (WPX[k + 1] - WPX[k]) * t;
      ay = WPY[k] + (WPY[k + 1] - WPY[k]) * t - Math.sin(t * Math.PI) * HOP;
    } else {
      // Final move: at the second-to-last step the block stops hopping and just
      // keeps going in a straight line, in the same downward direction it was
      // already travelling, accelerating until it hits the ground below.
      const x0 = WPX[k];
      const y0 = WPY[k]; // second-to-last step (centre)
      const gx = x0 + 54; // continue along the same staircase diagonal...
      const gy = y0 + 54; // ...straight down to the floor
      const e = t * t; // ease-in: a real, accelerating fall
      ax = x0 + (gx - x0) * e;
      ay = y0 + (gy - y0) * e;
      if (t > 0.9) ay -= Math.sin(((t - 0.9) / 0.1) * Math.PI) * 2; // tiny settle on impact
    }
    return {
      transform: [
        { translateX: ax - FALL_CX },
        { translateY: ay - FALL_CY },
      ],
    };
  });

  return (
    <View style={styles.root}>
      <View style={styles.stage}>
        <Svg width={210} height={185} style={StyleSheet.absoluteFill}>
          <Defs>
            <Pattern id="ll-dots" patternUnits="userSpaceOnUse" width={6} height={6}>
              <Rect x={0} y={0} width={6} height={6} fill={FaceLight} />
              <Circle cx={3} cy={3} r={1} fill={Ink} />
            </Pattern>
          </Defs>
          {STEPS.map((s, i) => (
            <IsoCube key={i} cx={s.x} cy={s.y} a={A} h={H} ch={CH} top={FaceLight} left={FaceMid} right="url(#ll-dots)" />
          ))}
        </Svg>

        <Animated.View style={[styles.block, blockStyle]}>
          <Svg width={FALL_W} height={FALL_W}>
            <IsoCube cx={FALL_CX} cy={FALL_CY} a={A} h={H} ch={CH} top={Ink} left="#3A3A3A" right="#555555" />
          </Svg>
        </Animated.View>
      </View>

      <Text style={styles.kicker}>A MOMENT</Text>
      <Text style={styles.caption}>Gathering your thoughts…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Paper, alignItems: 'center', justifyContent: 'center' },
  stage: { width: 210, height: 185, position: 'relative' },
  block: { position: 'absolute', left: 0, top: 0, width: FALL_W, height: FALL_W },
  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: InkSoft, letterSpacing: 4, marginTop: 30 },
  caption: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 17, color: Ink, marginTop: 8 },
});
