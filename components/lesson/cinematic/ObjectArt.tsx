// ─────────────────────────────────────────────────────────────────────────────
// ONE OBJECT ON A STAGE, IN ONE LINE.
//
//   <ObjectArt parts={ship(200, 300, 130, 112)} tone={TONE} />
//
// `objects.ts` says what an object is MADE OF; this puts it on the stage. The split
// is the same one `critters.ts` and `Silhouette.tsx` already have, and it is what
// keeps the drawings renderable in plain Node: objects.ts has zero imports, so
// `npm run sheet:objects` can draw any of them without React, without Metro and
// without a browser.
//
// ── WHAT IT DOES THAT A BARE <Shapes> DOES NOT ──────────────────────────────
//
// It paints the ROLES and it gets the ORDER right, which are the two things every
// caller would otherwise have to remember:
//
//   · `paint()` turns each part's role into a fill from the lesson's own branch
//     tones, so the same drawing is struck in ethics olive and logic blue with no
//     hex literal in any scene.
//   · the BODY is outlined as one union and the marks are drawn on top of it,
//     never grown. Growing a mark turns a rim into a black band and a porthole into
//     a blot — which is exactly what the first style render did to a tree's shading,
//     running it out past the canopy's own edge.
//
// ── AND IT IS IN muststamp's SHARED LIST ────────────────────────────────────
//
// For the reason `Silhouette.tsx` is: this file decides how big a scene's art is, so
// a change here resizes an object in every scene that draws one and those scenes'
// must-boxes go stale with it. A shared component that sizes art is apparatus, and
// §21's rule is that apparatus goes in the hash.
// ─────────────────────────────────────────────────────────────────────────────
import { View, type ViewStyle } from 'react-native';
import { Shapes, Outlined, type Part } from './Silhouette';
import { paint, bodyOf, marksOf, type ObjPart, type ObjTone } from './objects';

/** The outline weight the stage is drawn at. `stageSkin`'s plates use the same. */
export const OBJECT_LINE = 2.2;

export default function ObjectArt({
  parts,
  tone,
  line = OBJECT_LINE,
  ink = '#1A1A1A',
  style,
}: {
  /** A drawing from `objects.ts`, already placed: `tree(x, y, w, h)`. */
  parts: readonly ObjPart[];
  /** The lesson's own `stageTone(branch)`. */
  tone: ObjTone;
  line?: number;
  ink?: string;
  style?: ViewStyle;
}) {
  // `paint` maps role → fill; the two passes are then selected off the ORIGINAL
  // parts, because `bodyOf`/`marksOf` read `role`, which the painted copies keep.
  const painted = paint(parts, tone, ink) as unknown as Part[];
  const body = bodyOf(painted as unknown as ObjPart[]) as unknown as Part[];
  const marks = marksOf(painted as unknown as ObjPart[]) as unknown as Part[];
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }, style]}>
      <Outlined parts={body} width={line} line={ink} />
      <Shapes parts={marks} />
    </View>
  );
}
