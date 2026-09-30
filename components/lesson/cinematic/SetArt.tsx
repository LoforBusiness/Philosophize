// ─────────────────────────────────────────────────────────────────────────────
// A PIECE OF A SET — ObjectArt, plus polygons.
//
//   <SetArt parts={[...road(), oPoly('mass', [...])]} tone={TONE} />
//
// Everything ObjectArt does, in the same order and with the same roles: the body is
// outlined as ONE union and the marks are drawn on top of it. What it adds is the
// `poly` part from setShapes.ts — a shape named by its corners — so a set can have a
// road in perspective, a ridge of mountains, a pitched roof or a spreading fall of
// water instead of the bars and blobs the owner called cheap.
//
// A SEPARATE COMPONENT, NOT A CHANGE TO ObjectArt OR Silhouette, and that is the
// cost-conscious choice rather than the tidy one: both are in muststamp's SHARED list
// and hashed whole, so editing either marks every one of the 55 scenes that import
// them stale and demands a browser re-measure for a change that alters none of their
// pixels. This file is in the SHARED list too — it sizes art — and only the scenes
// that import it pay for a change to it.
// ─────────────────────────────────────────────────────────────────────────────
import { View, type ViewStyle } from 'react-native';
import { Shapes, type Part } from './Silhouette';
import { paint, outlineFor, type ObjPart, type ObjTone } from './objects';
import { triangulate, growTri, triBox, edgesOf, type PolyPart } from './setShapes';
import { OBJECT_LINE } from './ObjectArt';

export type SetPart = ObjPart | PolyPart;

/** How far each triangle of a polygon's FILL is grown, so its pieces overlap and no seam shows. */
const SEAM = 0.35;

function Tri({ t, fill }: { t: readonly number[]; fill: string }) {
  const b = triBox(t);
  const T = 'transparent';
  const edge: ViewStyle = {
    position: 'absolute', left: 0, top: -b.h, width: 0, height: 0,
    borderLeftWidth: b.left, borderRightWidth: b.right, borderBottomWidth: b.h,
    borderLeftColor: T, borderRightColor: T, borderBottomColor: fill,
  };
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: b.x, top: b.y, width: 0, height: 0, transform: [{ rotate: `${b.rot}deg` }] }}>
      <View style={edge} />
    </View>
  );
}

function Poly({ pts, grow, fill, line }: { pts: readonly number[]; grow: number; fill: string; line?: number }) {
  if (line) {
    // the outline: a capsule along every edge, half of it outside the fill
    const e = edgesOf(pts);
    const bars: Part[] = [];
    for (let k = 0; k + 3 < e.length; k += 4) bars.push({ k: 'bar', x1: e[k], y1: e[k + 1], x2: e[k + 2], y2: e[k + 3], t: 2 * line, fill } as Part);
    return <Shapes parts={bars} />;
  }
  const tris = triangulate(pts);
  const out = [];
  for (let k = 0; k + 5 < tris.length; k += 6) {
    out.push(<Tri key={k} t={growTri(tris.slice(k, k + 6), grow)} fill={fill} />);
  }
  return <>{out}</>;
}

function Piece({ p, grow, color }: { p: SetPart & { fill: string }; grow: number; color?: string }) {
  if (p.k === 'poly') return <Poly pts={p.pts} grow={SEAM} fill={color ?? p.fill} line={grow || undefined} />;
  return <Shapes parts={[p as unknown as Part]} grow={grow} color={color} />;
}

const isBody = (p: SetPart) => p.role === 'mass' || p.role === 'face';

export default function SetArt({
  parts,
  tone,
  line = OBJECT_LINE,
  ink = '#1A1A1A',
  style,
}: {
  parts: readonly SetPart[];
  tone: ObjTone;
  line?: number;
  ink?: string;
  style?: ViewStyle;
}) {
  const painted = paint(parts as unknown as ObjPart[], tone, ink) as unknown as (SetPart & { fill: string })[];
  const body = painted.filter(isBody);
  const marks = painted.filter((p) => !isBody(p));
  // the outline is a share of the drawing's own size, `line` its cap (LESSON_RULES AM11)
  const weight = outlineFor(parts, line);
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, style]}>
      {body.map((p, i) => <Piece key={`l${i}`} p={p} grow={weight} color={ink} />)}
      {body.map((p, i) => <Piece key={`b${i}`} p={p} grow={0} />)}
      {marks.map((p, i) => <Piece key={`m${i}`} p={p} grow={0} />)}
    </View>
  );
}
