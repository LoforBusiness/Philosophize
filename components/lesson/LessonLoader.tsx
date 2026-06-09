import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const Paper = '#F1EEE7';
const Ink = '#1A1A1A';
const InkSoft = '#6B6B6B';

// ── A 3D (isometric) staircase + a heavy cube tumbling down it ────────────────
// The scene is real 3D: world points (x = right, y = up, z = depth toward the
// viewer) are isometrically projected to the screen. The block rolls forward-and-
// to-the-right down the steps — tipping over each edge, accelerating under gravity,
// landing with a squash — and its faces are depth-sorted and shaded so it reads as
// a solid block coming toward you.

const W = 232;
const H = 202;
const SCALE = 19;
const COS30 = 0.8660254;
const SIN30 = 0.5;
const OX = 80;
const OY = 12;

function project(x: number, y: number, z: number): [number, number] {
  return [OX + (x - z) * COS30 * SCALE, OY + ((x + z) * SIN30 - y) * SCALE];
}
function rotZ(p: number[], rad: number): number[] {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]];
}
function norm3(v: number[]): number[] {
  const m = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / m, v[1] / m, v[2] / m];
}
function dot(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
const LIGHT = norm3([0.45, 1, 0.62]);

function greyFill(n: number[], dark: boolean): string {
  const b = 0.34 + 0.66 * Math.max(0, dot(n, LIGHT));
  const g = dark ? Math.round(36 + b * 96) : Math.round(205 + b * 50);
  return `rgb(${g},${g},${g})`;
}
function faceToPath(wv: number[][]): string {
  const p = wv.map((v) => project(v[0], v[1], v[2]));
  return `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)} L ${p[1][0].toFixed(1)} ${p[1][1].toFixed(1)} L ${p[2][0].toFixed(1)} ${p[2][1].toFixed(1)} L ${p[3][0].toFixed(1)} ${p[3][1].toFixed(1)} Z`;
}
function avgDepth(wv: number[][]): number {
  let s = 0;
  for (const v of wv) s += v[0] + v[1] + v[2];
  return s / wv.length;
}

const HALF = 0.5;
// Cube faces: local 4-corner loops + outward normal.
const CUBE_FACES = [
  { n: [0, 1, 0], v: [[-HALF, HALF, -HALF], [HALF, HALF, -HALF], [HALF, HALF, HALF], [-HALF, HALF, HALF]] },
  { n: [0, -1, 0], v: [[-HALF, -HALF, -HALF], [HALF, -HALF, -HALF], [HALF, -HALF, HALF], [-HALF, -HALF, HALF]] },
  { n: [1, 0, 0], v: [[HALF, -HALF, -HALF], [HALF, HALF, -HALF], [HALF, HALF, HALF], [HALF, -HALF, HALF]] },
  { n: [-1, 0, 0], v: [[-HALF, -HALF, -HALF], [-HALF, HALF, -HALF], [-HALF, HALF, HALF], [-HALF, -HALF, HALF]] },
  { n: [0, 0, 1], v: [[-HALF, -HALF, HALF], [HALF, -HALF, HALF], [HALF, HALF, HALF], [-HALF, HALF, HALF]] },
  { n: [0, 0, -1], v: [[-HALF, -HALF, -HALF], [HALF, -HALF, -HALF], [HALF, HALF, -HALF], [-HALF, HALF, -HALF]] },
];

interface Face {
  d: string;
  fill: string;
  depth: number;
}

// The dark tumbling cube — all 6 faces, depth-sorted (far first) for correct 3D.
function cubeFaces(center: number[], deg: number, sy: number): Face[] {
  const rad = (deg * Math.PI) / 180;
  const out: Face[] = [];
  for (const f of CUBE_FACES) {
    const wv = f.v.map((o) => {
      const r = rotZ(o, rad);
      return [center[0] + r[0], center[1] + r[1] * sy, center[2] + r[2]];
    });
    out.push({ d: faceToPath(wv), fill: greyFill(norm3(rotZ(f.n, rad)), true), depth: avgDepth(wv) });
  }
  out.sort((a, b) => a.depth - b.depth);
  return out;
}

// One light staircase block: only the three camera-facing faces (top, +x, +z).
function stepFaces(x0: number, ytop: number, z0: number): Face[] {
  const x1 = x0 + 1;
  const ybot = ytop - 1;
  const z1 = z0 + 1;
  const faces = [
    { n: [0, 1, 0], v: [[x0, ytop, z0], [x1, ytop, z0], [x1, ytop, z1], [x0, ytop, z1]] },
    { n: [1, 0, 0], v: [[x1, ytop, z0], [x1, ybot, z0], [x1, ybot, z1], [x1, ytop, z1]] },
    { n: [0, 0, 1], v: [[x0, ytop, z1], [x1, ytop, z1], [x1, ybot, z1], [x0, ybot, z1]] },
  ];
  return faces.map((f) => ({ d: faceToPath(f.v), fill: greyFill(norm3(f.n), false), depth: avgDepth(f.v) }));
}

const SEGS = 4;
const TIP = 0.55;

// Block centre + spin + squash at progress p (0..1). Mirrors a real tip-then-fall:
// pivot over the step edge, then accelerate down to the next tread and squash.
function blockState(p: number): { center: number[]; deg: number; sy: number } {
  const pr = Math.min(SEGS - 1e-6, p * SEGS);
  const k = Math.min(SEGS - 1, Math.floor(pr));
  const u = pr - k;
  const ex = k + 1; // step edge x
  const ey = -k; // step top y
  let cx: number;
  let cy: number;
  let deg: number;
  let sy = 1;
  if (u < TIP) {
    const u1 = u / TIP;
    const phi = -90 * (u1 * u1); // tip forward, accelerating
    const rad = (phi * Math.PI) / 180;
    const ox = -0.5;
    const oy = 0.5; // centre offset from the pivot edge
    cx = ex + (ox * Math.cos(rad) - oy * Math.sin(rad));
    cy = ey + (ox * Math.sin(rad) + oy * Math.cos(rad));
    deg = k * -90 + phi;
  } else {
    const u2 = (u - TIP) / (1 - TIP);
    cx = ex + 0.5;
    cy = ey + 0.5 - u2 * u2; // gravity drop of one step
    deg = (k + 1) * -90;
    if (u2 > 0.78) {
      const b = (u2 - 0.78) / 0.22;
      const pulse = Math.sin(b * Math.PI);
      const d = k === SEGS - 1 ? 0.26 : 0.16;
      sy = 1 - d * pulse;
      cy -= 0.5 * d * pulse; // keep the base planted while it squashes
    }
  }
  return { center: [cx, cy, 0.5], deg, sy };
}

function FallingBlock() {
  const [faces, setFaces] = useState<Face[]>(() => {
    const s = blockState(0);
    return cubeFaces(s.center, s.deg, s.sy);
  });
  const raf = useRef<number | null>(null);
  useEffect(() => {
    let start: number | null = null;
    const DUR = 2200;
    const tick = (t: number) => {
      if (start == null) start = t;
      const p = Math.min(1, (t - start) / DUR);
      const s = blockState(p);
      setFaces(cubeFaces(s.center, s.deg, s.sy));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, []);
  return (
    <>
      {faces.map((f, i) => (
        <Path key={i} d={f.d} fill={f.fill} stroke={Ink} strokeWidth={1.3} strokeLinejoin="round" />
      ))}
    </>
  );
}

export default function LessonLoader({ onDone }: { onDone?: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(), 2450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Static 3D staircase (5 steps), depth-sorted once.
  const steps = useMemo(() => {
    const all: Face[] = [];
    for (let k = 0; k <= 4; k++) all.push(...stepFaces(k, -k, 0));
    all.sort((a, b) => a.depth - b.depth);
    return all;
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.stage}>
        <Svg width={W} height={H}>
          {steps.map((f, i) => (
            <Path key={i} d={f.d} fill={f.fill} stroke={Ink} strokeWidth={1.3} strokeLinejoin="round" />
          ))}
          <FallingBlock />
        </Svg>
      </View>

      <Text style={styles.kicker}>A MOMENT</Text>
      <Text style={styles.caption}>Gathering your thoughts…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Paper, alignItems: 'center', justifyContent: 'center' },
  stage: { width: W, height: H },
  kicker: { fontFamily: 'Inter_500Medium', fontSize: 10, color: InkSoft, letterSpacing: 4, marginTop: 26 },
  caption: { fontFamily: 'PlayfairDisplay_400Regular', fontStyle: 'italic', fontSize: 17, color: Ink, marginTop: 8 },
});
