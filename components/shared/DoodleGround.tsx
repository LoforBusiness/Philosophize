// ─────────────────────────────────────────────────────────────────────────────
// THE WALLPAPER — a faint repeating doodle behind Home, Learn and a subject page.
//
// The owner: the tabs were "boring … because the background is just pure white".
// Every app they pointed at (Brilliant, Imprint, Duolingo, Deepstash, Khan Academy)
// puts its cards on a coloured or textured ground, and of three directions drawn with
// the real subject posters they picked this one on 2026-09-29: a green-grey page
// (tone.WALL) with one small line doodle per subject, a step darker (WALL_DOODLE).
//
// A REPEATED TILE, never a screen-sized drawing — §19's GPU rule. `npm run
// make:wallpaper` writes the 132dp tile from the same two tone.ts colours, so the tile
// and the colour a screen paints behind it cannot drift apart. Mount it FIRST inside
// the screen's root, which paints WALL itself, so a slow first frame shows the same
// green-grey rather than white.
// ─────────────────────────────────────────────────────────────────────────────
import { Image, StyleSheet, View } from 'react-native';

const TILE = require('../../assets/images/wallpaper/doodle.png');

export default function DoodleGround() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={TILE} resizeMode="repeat" style={styles.tile} />
    </View>
  );
}

const styles = StyleSheet.create({
  // The size is STATED: react-native-web gives an image with no width and height its
  // source's own size (132px) whatever its insets say, so the tile was drawn once.
  tile: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
});
