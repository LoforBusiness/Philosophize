import { Image } from 'react-native';
import { LESSON_ART } from './lessonArt';

// ONE PRE-DRAWN PICTURE on the stage (LESSON_RULES AM13): a detailed object drawn as real
// curves against references in scripts/lib/lessonart/ and baked by `npm run make:lesson-art`,
// laid at its scene box. A picture that replaces a shape-built object takes that object's box,
// so where it sits, and anything that moves it, is unchanged. It is one View on a phone where
// the shapes were dozens (AT7).
export default function LessonPicture({ name }: { name: keyof typeof LESSON_ART | string }) {
  const a = LESSON_ART[name];
  if (!a) return null;
  return (
    <Image
      source={a.source}
      fadeDuration={0}
      style={{ position: 'absolute', left: a.x, top: a.y, width: a.w, height: a.h }}
    />
  );
}
