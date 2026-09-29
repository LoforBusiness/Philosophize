// ─────────────────────────────────────────────────────────────────────────────
// ONE SUBJECT (OR BRANCH) DRAWING, AT ANY SIZE.
//
//   <SubjectArt art="science" hue={subject.hue} size={120} />
//
// `subjectScenes.ts` says what a scene is MADE OF; this puts it on screen, the way
// `ObjectArt` does for a lesson object: every object's BODY outlined as one union in
// ink, then filled, then its marks on top — layer by layer, back to front, so an
// object passing in front of another keeps its own edge.
//
// It draws the ART only, on a transparent ground: the tile, the card and the
// masthead each own their face and ledge, which is what lets one drawing sit in all
// three. `withGround` lays the shelf the still life stands on.
//
// Views, not SVG — the same four primitives the lessons draw with (Silhouette.tsx),
// so a screen of fourteen tiles holds no bitmaps (§19's GPU budget).
// ─────────────────────────────────────────────────────────────────────────────
import { View, type ViewStyle } from 'react-native';
import { Shapes, Outlined, type Part } from '@/components/lesson/cinematic/Silhouette';
import type { ObjPart } from '@/components/lesson/cinematic/objects';
import { artIn, fillFor, sceneTones, ART_LINE, GROUND_SLAB, type ArtKey } from './subjectScenes';

const isBody = (p: ObjPart) => p.role === 'mass' || p.role === 'face';

export default function SubjectArt({
  art, hue, size, withGround = true, style,
}: {
  art: ArtKey;
  hue: string;
  size: number;
  withGround?: boolean;
  style?: ViewStyle;
}) {
  const t = sceneTones(hue);
  const s = size / 100;
  const sc = artIn(art, 0, 0, size, size);
  const paint = (parts: readonly ObjPart[]): Part[] =>
    parts.map((p) => ({ ...p, fill: fillFor(p.role, t) }) as unknown as Part);
  const k = sc.spark;
  const g = GROUND_SLAB;
  return (
    <View pointerEvents="none" style={[{ width: size, height: size }, style]}>
      {withGround ? (
        <View
          style={{
            position: 'absolute',
            left: (g.x - g.w / 2) * s,
            top: (g.y - g.h / 2) * s,
            width: g.w * s,
            height: g.h * s,
            borderRadius: g.rad * s,
            backgroundColor: t.ground,
          }}
        />
      ) : null}
      {sc.layers.map((layer, i) => (
        <View key={i} style={{ position: 'absolute', left: 0, top: 0, width: size, height: size }}>
          <Outlined parts={paint(layer.filter(isBody))} width={ART_LINE * s} line={t.ink} />
          <Shapes parts={paint(layer.filter((p) => !isBody(p)))} />
        </View>
      ))}
      {/* THE SPARK — one small ember diamond, the tab icons' own mark. */}
      <Outlined
        parts={[{ k: 'rect', x: k.x, y: k.y, w: k.s, h: k.s, rot: 45, rad: k.s * 0.2, fill: t.spark } as Part]}
        width={ART_LINE * s}
        line={t.ink}
      />
    </View>
  );
}
