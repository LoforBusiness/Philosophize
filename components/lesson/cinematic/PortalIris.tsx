import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { IRIS_FROM, irisR } from './portal';

/**
 * The colour of the patch a scene change goes into, growing out from its focus over the
 * last quarter of the push until it covers the band (portal.ts, THE IRIS). Drawn as the
 * LAST child of the set it belongs to, so it rides that set's zoom and lies over
 * everything in it — the object's own outline included, which would otherwise show as a
 * ring round the flat field at the deepest point.
 *
 * `field` names the depth track on `S` (0 at rest, 1 at the deepest point).
 */
export default function PortalIris({
  S, field, x, y, r0, z, color,
}: {
  S: SharedValue<any>;
  field: string;
  x: number;
  y: number;
  r0: number;
  z: number;
  color: string;
}) {
  const st = useAnimatedStyle(() => {
    const k = S.value[field] as number;
    return {
      opacity: k > IRIS_FROM - 0.02 ? 1 : 0,
      transform: [{ scale: irisR(k, r0, z) / r0 }],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', left: x - r0, top: y - r0, width: 2 * r0, height: 2 * r0, borderRadius: r0, backgroundColor: color },
        st,
      ]}
    />
  );
}
