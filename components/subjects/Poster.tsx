// ─────────────────────────────────────────────────────────────────────────────
// ONE SUBJECT (OR BRANCH) POSTER, FILLING ITS BOX.
//
//   <Poster art="science" hue={subject.hue} width={169} height={118} />
//
// `posters.ts` builds the drawing as an SVG string for exactly this box — the frame
// grows to the box's shape, so nothing is cropped or stretched — and this paints it.
//
// SVG, NOT VIEWS, and that is a trade made on purpose. The subject drawings were Views
// so a screen of them held no bitmaps; but a bust's curls, a flask's
// neck and a mountain's snow cap are curves, and the owner asked for drawings that
// look like the references rather than like shapes. react-native-svg paints each one
// into a bitmap the size of its BOX (§19's GPU rule), so the boxes are the card-sized
// ones only, and the Home shelf windows its cards (SubjectCarousel) so an off-screen
// poster is not held.
//
// The box is filled with the hue as well, so the frame the SVG is painting into is
// never a white flash while it parses.
// ─────────────────────────────────────────────────────────────────────────────
import { memo, useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { posterXml, type PosterKey } from './posters';

function Poster({
  art, hue, width, height, style,
}: {
  art: PosterKey;
  hue: string;
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
}) {
  const w = Math.round(width);
  const h = Math.round(height);
  const xml = useMemo(() => posterXml(art, hue, w, h), [art, hue, w, h]);
  return (
    <View pointerEvents="none" style={[{ width: w, height: h, backgroundColor: hue, overflow: 'hidden' }, style]}>
      <SvgXml xml={xml} width={w} height={h} />
    </View>
  );
}

export default memo(Poster);
