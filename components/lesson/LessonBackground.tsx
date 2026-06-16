import { View, ImageBackground, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { LESSON_BACKGROUNDS } from './lessonBackgrounds';
import { sceneForVariant } from './inkScenes';

// Full-bleed illustrated scene behind a lesson's cards. Renders a bundled image
// when any are registered in lessonBackgrounds.ts; otherwise draws one of the
// hand-drawn black-and-white ink scenes (clouds, winter trees, the wanderer…).
// Each lesson gets its own scene via `variant`; the words of the lesson fade in
// over the scene's deliberately blank region.
export default function LessonBackground({ variant = 0 }: { variant?: number }) {
  const imgs = LESSON_BACKGROUNDS;
  const src = imgs.length > 0 ? imgs[((variant % imgs.length) + imgs.length) % imgs.length] : null;
  const ink = sceneForVariant(variant);
  const dark = ink.meta.mode === 'dark';

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: dark ? '#0E0E0E' : '#E4E4DF' }]} pointerEvents="none">
      {src ? <ImageBackground source={src} resizeMode="cover" style={StyleSheet.absoluteFill} /> : <ink.Scene />}
      {!dark ? <Scrim /> : null}
    </View>
  );
}

// Gentle light wash where the words sit, fading to a faint vignette — only on
// the paper scenes; the night scenes keep their full contrast.
function Scrim() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="lb-glow" cx="50%" cy="47%" rx="85%" ry="72%">
          <Stop offset="0%" stopColor="#FAFAF7" stopOpacity={0.55} />
          <Stop offset="45%" stopColor="#FAFAF7" stopOpacity={0.34} />
          <Stop offset="74%" stopColor="#FAFAF7" stopOpacity={0.12} />
          <Stop offset="100%" stopColor="#26313F" stopOpacity={0.12} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#lb-glow)" />
    </Svg>
  );
}
