import { View, ImageBackground, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { LESSON_BACKGROUNDS } from './lessonBackgrounds';
import { PARCHMENT_SCENES } from './backgrounds';

// Full-bleed background behind a lesson's cards. Renders a bundled parchment
// image when any are registered in lessonBackgrounds.ts; otherwise draws one of
// the procedural "antique parchment" scenes (classical motifs at the edges). A
// soft centre glow + edge vignette keeps the centred cards crisp.
export default function LessonBackground({ variant = 0 }: { variant?: number }) {
  const imgs = LESSON_BACKGROUNDS;
  const src = imgs.length > 0 ? imgs[((variant % imgs.length) + imgs.length) % imgs.length] : null;
  const Scene = PARCHMENT_SCENES[((variant % PARCHMENT_SCENES.length) + PARCHMENT_SCENES.length) % PARCHMENT_SCENES.length];

  return (
    <View style={[StyleSheet.absoluteFill, styles.base]} pointerEvents="none">
      {src ? <ImageBackground source={src} resizeMode="cover" style={StyleSheet.absoluteFill} /> : <Scene />}
      <Scrim />
    </View>
  );
}

// Gentle light wash where the card sits, fading to a faint dark vignette.
function Scrim() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="lb-glow" cx="50%" cy="47%" rx="78%" ry="66%">
          <Stop offset="0%" stopColor="#FBF7EE" stopOpacity={0.26} />
          <Stop offset="62%" stopColor="#FBF7EE" stopOpacity={0.08} />
          <Stop offset="100%" stopColor="#6E5C3C" stopOpacity={0.13} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#lb-glow)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: '#E9DDC4' },
});
