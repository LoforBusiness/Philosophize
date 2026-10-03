// ─────────────────────────────────────────────────────────────────────────────
// THE LOADER HANDS OVER TO THE LESSON WITHOUT A BLANK FRAME (LESSON_RULES AI8).
//
// The route used to swap the loader for the lesson in one render: `loading ? <Loader/>
// : <Lesson/>`. A lesson's stage draws nothing until it has measured its own box, so the
// first frame after the swap was the header over blank paper, and then the picture
// appeared — measured in a browser, one painted frame of nothing between the two, and
// longer on a phone, where mounting a lesson is one long commit.
//
// So the loader stays ON TOP while the lesson mounts beneath it, and lifts only once the
// stage has drawn (`drawn`, set by CinematicPlayer two frames after it measures), fading
// out over a picture that is already there. If the stage never says so, it lifts after
// FALLBACK_MS anyway. The lesson is told when it is uncovered (`revealed`), so the opening
// breath (AP19) counts from the moment the reader can see the place.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import LessonLoader from './LessonLoader';
import { setDrawn, useGuideStore } from './cinematic/lessonGuideState';

/** How long the loader takes to lift off the drawn lesson. */
const LIFT_MS = 220;
/** The longest the loader waits for the stage to say it has drawn. */
const FALLBACK_MS = 1500;

type Phase = 'loading' | 'mounting' | 'lifting' | 'done';

export default function LoaderHandoff({ children }: { children: (revealed: boolean) => ReactNode }) {
  // A new lesson has not drawn yet: cleared before anything below mounts.
  const [phase, setPhase] = useState<Phase>(() => { setDrawn(false); return 'loading'; });
  const drawn = useGuideStore((s) => s.drawn);
  const cover = useSharedValue(1);
  const lifted = useRef(false);

  useEffect(() => {
    if (phase !== 'mounting') return;
    const lift = () => {
      if (lifted.current) return;
      lifted.current = true;
      setPhase('lifting');
      cover.value = withTiming(0, { duration: LIFT_MS, easing: Easing.out(Easing.quad) }, (fin) => {
        if (fin) runOnJS(setPhase)('done');
      });
    };
    if (drawn) { lift(); return; }
    const t = setTimeout(lift, FALLBACK_MS);
    return () => clearTimeout(t);
  }, [phase, drawn, cover]);

  const coverStyle = useAnimatedStyle(() => ({ opacity: cover.value }));

  return (
    <View style={styles.root}>
      {phase !== 'loading' ? children(phase === 'done') : null}
      {phase !== 'done' ? (
        <Animated.View style={[StyleSheet.absoluteFill, coverStyle]} pointerEvents={phase === 'loading' ? 'auto' : 'none'}>
          <LessonLoader onDone={() => setPhase('mounting')} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
