// ─────────────────────────────────────────────────────────────────────────────
// THE WALLPAPER — a faint repeating doodle behind Home, Learn, Pass, Profile and a
// subject page.
//
// The owner: the tabs were "boring … because the background is just pure white".
// Every app they pointed at (Brilliant, Imprint, Duolingo, Deepstash, Khan Academy)
// puts its cards on a coloured or textured ground, and of three directions drawn with
// the real subject posters they picked this one on 2026-09-29: a green-grey page
// (tone.WALL) with one small line doodle per subject, a step darker (WALL_DOODLE).
//
// ── A GRID OF TILES, NEVER `resizeMode="repeat"` — AND THAT IS §19 AGAIN ─────
//
// The first version was one <Image resizeMode="repeat"> filling the screen, and on
// Android that is not a shader over a small bitmap: React Native implements repeat
// with a Fresco postprocessor (ReactImageView.TilePostprocessor) that calls
// `createBitmap(width, height)` — a bitmap THE SIZE OF THE VIEW. Behind Profile's
// body that was ~1080×7300px, about 30MB, plus a screen-sized ~10MB one on each of
// Home, Learn and Pass; every built tab is held for the session, so the app went
// over HWUI's ~121MB texture budget and the owner felt exactly what §19 records the
// last time: Profile's overscroll stretch and the streak screen went laggy.
//
// So the tile is laid out by hand: one small <Image> per 132dp cell, all with the
// same source. Fresco decodes the tile once and every cell draws that one bitmap, so
// the whole wallpaper costs one 396px texture however many cells there are. It is
// FIXED to the screen (mounted behind a scroll view, never inside one), so the cell
// count is the screen's, not a long page's.
//
// `npm run make:wallpaper` writes the tile from the same two tone.ts colours, so the
// tile and the colour a screen paints behind it cannot drift apart. Mount it FIRST
// inside a root that paints WALL itself, so a slow first frame is green-grey, not
// white.
// ─────────────────────────────────────────────────────────────────────────────
import { memo } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

const TILE = require('../../assets/images/wallpaper/doodle.png');
/** The tile's side in dp — make-wallpaper.mjs's TILE. */
export const WALL_TILE = 132;

function DoodleGround() {
  const { width, height } = useWindowDimensions();
  const cols = Math.ceil(width / WALL_TILE);
  const rows = Math.ceil(height / WALL_TILE);
  const cells: { key: string; left: number; top: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) cells.push({ key: `${r}-${c}`, left: c * WALL_TILE, top: r * WALL_TILE });
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {cells.map((cell) => (
        <Image
          key={cell.key}
          source={TILE}
          // `stretch` at the tile's own size is a straight blit: no scale transform,
          // no postprocessor. `fadeDuration` 0 so the cells do not fade in one by one.
          resizeMode="stretch"
          fadeDuration={0}
          style={[styles.cell, { left: cell.left, top: cell.top }]}
        />
      ))}
    </View>
  );
}

export default memo(DoodleGround);

const styles = StyleSheet.create({
  cell: { position: 'absolute', width: WALL_TILE, height: WALL_TILE },
});
