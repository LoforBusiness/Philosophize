import { useState, type ReactNode } from 'react';
import { View, Image, Text, StyleSheet, type StyleProp, type ViewStyle, type LayoutChangeEvent } from 'react-native';
import {
  backgroundById,
  backgroundSource,
  tonePalette,
  type ProfileBackground,
  type TonePalette,
} from '@/data/profileBackgrounds';
import { sceneLayout, avatarLayout } from '@/components/shared/profileSceneGeometry';
import { useUserDataStore } from '@/stores/userDataStore';

// One place where "what the user's chosen picture looks like" is decided, so the
// profile header, Home's masthead, the settings row and the picker swatches cannot
// drift apart — they all render through these.

export function useProfileArt(overrideId?: string): {
  bg: ProfileBackground;
  palette: TonePalette;
  source: ReturnType<typeof backgroundSource>;
} {
  const stored = useUserDataStore((s) => s.profileBackground);
  const id = overrideId ?? stored;
  const bg = backgroundById(id);
  return { bg, palette: tonePalette(bg.tone), source: backgroundSource(id) };
}

/**
 * The picture, filling whatever it is put inside, with its HORIZON at `horizon`
 * of the box's height (or at `horizonAt` dp). The sky colour fills above the
 * picture and the ground colour below it, so a box of any shape is finished — and
 * every word laid in the bottom of the box stands on the dark ground, never on an
 * object. That is what lets the drawn places carry a name with no scrim at all.
 *
 * The box measures itself, because a percentage cannot place a horizon: the scale
 * is set by the box's width AND by how far down the horizon has to land.
 */
export function ProfileArtFill({
  backgroundId,
  horizon = 0.58,
  horizonAt,
  overscan = 0,
  style,
  children,
}: {
  backgroundId?: string;
  /** Where the horizon lands, as a fraction of the box's height. */
  horizon?: number;
  /** …or in dp from the box's top, which wins. */
  horizonAt?: number;
  /** Extra width a side, for a box that slides the picture. */
  overscan?: number;
  style?: StyleProp<ViewStyle>;
  /** Drawn over the picture inside the same box, e.g. a slow drift wrapper's content. */
  children?: ReactNode;
}) {
  const { bg, source } = useProfileArt(backgroundId);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!box || box.w !== width || box.h !== height) setBox({ w: width, h: height });
  };
  const lay = box ? sceneLayout(box.w, horizonAt ?? box.h * horizon, overscan) : null;

  return (
    <View style={[styles.fill, { backgroundColor: bg.ground }, style]} pointerEvents="none" onLayout={onLayout}>
      {lay && source ? (
        <>
          <View style={[styles.sky, { height: Math.max(0, lay.top + 2), backgroundColor: bg.sky }]} />
          <Image
            source={source}
            resizeMode="stretch"
            style={{ position: 'absolute', left: lay.left, top: lay.top, width: lay.w, height: lay.h }}
          />
        </>
      ) : null}
      {children}
    </View>
  );
}

/**
 * The reader's picture in a circle: the place, centred on what it is about — the
 * lighthouse's lantern, the boat, the cottage. Falls back to their initial on the
 * ground colour if no picture is registered.
 */
export function ProfileAvatar({
  size = 76,
  backgroundId,
  letter,
  ring = true,
  ringColor,
}: {
  size?: number;
  backgroundId?: string;
  /** Shown only when there is no image to show. */
  letter?: string;
  ring?: boolean;
  ringColor?: string;
}) {
  const { bg, palette, source } = useProfileArt(backgroundId);
  const lay = avatarLayout(size, bg.focus);
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring ? Math.max(2, Math.round(size / 26)) : 0,
          borderColor: ringColor ?? palette.line,
          backgroundColor: bg.ground,
        },
      ]}
    >
      {source ? (
        <>
          <View style={[styles.sky, { height: Math.max(0, lay.top + 1), backgroundColor: bg.sky }]} />
          <Image
            source={source}
            resizeMode="stretch"
            style={{ position: 'absolute', left: lay.left, top: lay.top, width: lay.w, height: lay.h }}
          />
        </>
      ) : letter ? (
        <Text
          style={[
            styles.avatarLetter,
            { color: palette.text, fontSize: size * 0.58, width: size * 0.95, lineHeight: size * 0.66 },
          ]}
        >
          {letter.toUpperCase()}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' },
  sky: { position: 'absolute', top: 0, left: 0, right: 0 },
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarLetter: {
    fontFamily: 'Caveat_700Bold',
    // Caveat's ink overhangs its advance width and Android clips to that box,
    // which cut the right of a "W". The extra width + centring is the fix.
    textAlign: 'center',
    includeFontPadding: false,
  },
});
