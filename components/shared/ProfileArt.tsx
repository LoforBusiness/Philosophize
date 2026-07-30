import { View, Image, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  backgroundById,
  backgroundSource,
  tonePalette,
  type ProfileBackground,
  type TonePalette,
} from '@/data/profileBackgrounds';
import { useUserDataStore } from '@/stores/userDataStore';

// One place where "what the user's chosen art looks like" is decided, so the
// profile header, the settings row and the picker swatches cannot drift apart —
// they all render through these.

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
 * The art itself, filling whatever it is put inside. Used full-width behind the
 * profile header and as the fill of the avatar circle.
 *
 * `focus` biases the crop: an image is drawn `cover` (so it always fills) and
 * then nudged toward the interesting part. The 1.18 overscale is what lets it be
 * nudged at all without dragging an empty edge into frame.
 */
export function ProfileArtFill({
  backgroundId,
  scrim = true,
  style,
}: {
  backgroundId?: string;
  /** The header needs the wash that guarantees contrast; a swatch does not. */
  scrim?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { bg, palette, source } = useProfileArt(backgroundId);
  const dx = (0.5 - bg.focus.x) * 100;
  const dy = (0.5 - bg.focus.y) * 100;

  return (
    <View style={[styles.fill, { backgroundColor: palette.base }, style]} pointerEvents="none">
      {source ? (
        <Image
          source={source}
          resizeMode="cover"
          style={[
            styles.fill,
            styles.image,
            { transform: [{ scale: 1.18 }, { translateX: dx }, { translateY: dy }] },
          ]}
        />
      ) : (
        // No file registered yet — a plain ink/paper wash rather than a broken
        // image box, the same arrangement lessonBackgrounds.ts uses.
        <LinearGradient
          colors={
            bg.tone === 'dark'
              ? ['#2A2A26', '#141412']
              : ['#F3EEE0', '#DED8C6']
          }
          style={styles.fill}
        />
      )}

      {scrim ? (
        <LinearGradient colors={palette.scrim} locations={[0, 1]} style={styles.fill} />
      ) : null}
    </View>
  );
}

/**
 * The user's picture. Falls back to their initial when no art file is registered,
 * which is also what makes this safe to ship before the images land.
 */
export function ProfileAvatar({
  size = 76,
  backgroundId,
  letter,
  ring = true,
}: {
  size?: number;
  backgroundId?: string;
  /** Shown only when there is no image to show. */
  letter?: string;
  ring?: boolean;
}) {
  const { palette, source } = useProfileArt(backgroundId);
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring ? 2 : 0,
          borderColor: palette.line,
          backgroundColor: palette.avatarFill,
        },
      ]}
    >
      <ProfileArtFill backgroundId={backgroundId} scrim={false} />
      {!source && letter ? (
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
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  // An IMAGE needs its size stated, not merely implied by the four insets. React
  // Native Web gives an <Image> an explicit width/height from the file's own
  // dimensions, and an explicit width beats `right`/`bottom` — so an inset-only
  // absolute fill leaves the image at natural size and the parent's
  // `overflow: hidden` shows a magnified crumb of it instead of the picture.
  image: { width: '100%', height: '100%' },
  avatar: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarLetter: {
    fontFamily: 'Caveat_700Bold',
    // Caveat's ink overhangs its advance width and Android clips to that box,
    // which cut the right of a "W". The extra width + centring is the fix.
    textAlign: 'center',
    includeFontPadding: false,
  },
});
