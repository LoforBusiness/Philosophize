// ─────────────────────────────────────────────────────────────────────────────
// ONE SUBJECT (OR BRANCH) POSTER, FILLING ITS BOX.
//
//   <Poster art="science" hue={subject.hue} width={169} height={118} />
//
// `posters.ts` builds the drawing as an SVG string for exactly this box — the frame
// grows to the box's shape, so nothing is cropped or stretched — and this paints it.
//
// SVG, NOT VIEWS, and that is a trade made on purpose. The subject drawings were Views
// so a screen of them held no bitmaps; but a bust's curls, a flask's neck and a
// mountain's snow cap are curves, and the owner asked for drawings that look like the
// references rather than like shapes. react-native-svg paints each one into a bitmap
// the size of its BOX (§19's GPU rule): a Home card is ~2MB on a phone, a Learn tile
// ~0.7MB, and Home and Learn together hold about 13MB of them.
//
// ── AND ONLY WHILE ITS TAB IS THE ONE ON SCREEN ─────────────────────────────
//
// Every tab is built at startup and held for the session, and HWUI gives the whole
// app ONE ~121MB texture budget (§19) — which is what Profile's overscroll stretch and
// the streak screen run out of first. So a poster draws its SVG only while the TAB it
// belongs to is focused (any screen of the Learn stack counts as Learn), and is a
// plain box of its scene's ground colour otherwise: that bitmap is released while the reader is on
// Profile, Pass or the streak screen. The release waits out the tabs' 340ms
// cross-dissolve, so a tab never fades out with its pictures gone.
// ─────────────────────────────────────────────────────────────────────────────
import { memo, useEffect, useMemo, useState } from 'react';
import { View, Image, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from 'expo-router';
import { posterXml, posterGround, type PosterKey } from './posters';

/** Longer than the tabs' 340ms cross-dissolve (app/(app)/_layout.tsx). */
const RELEASE_AFTER_MS = 420;

/** The navigation object expo-router hands a screen (React Navigation's, re-exported). */
type Nav = {
  getState?: () => { type?: string } | undefined;
  getParent?: () => unknown;
  isFocused: () => boolean;
  addListener: (e: 'focus' | 'blur', cb: () => void) => () => void;
};

/** The navigation object of the TAB this screen sits in — itself, or an ancestor. */
function tabNavigationOf(nav: Nav | undefined): Nav | undefined {
  let n: Nav | undefined = nav;
  for (let i = 0; n && i < 6; i++) {
    if (n.getState?.()?.type === 'tab') return n;
    n = n.getParent?.() as Nav | undefined;
  }
  return undefined;
}

/** Whether this screen's TAB is the focused one. Outside a tab navigator: always. */
function useTabFocused(): boolean {
  let nav: Nav | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    nav = useNavigation() as unknown as Nav;
  } catch {
    nav = undefined; // rendered outside a navigator (a sheet harness): just draw.
  }
  const tab = tabNavigationOf(nav);
  const [focused, setFocused] = useState(() => (tab ? tab.isFocused() : true));
  useEffect(() => {
    if (!tab) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const onFocus = () => { if (timer) clearTimeout(timer); timer = null; setFocused(true); };
    const onBlur = () => { if (timer) clearTimeout(timer); timer = setTimeout(() => setFocused(false), RELEASE_AFTER_MS); };
    const offFocus = tab.addListener('focus', onFocus);
    const offBlur = tab.addListener('blur', onBlur);
    setFocused(tab.isFocused());
    return () => { offFocus(); offBlur(); if (timer) clearTimeout(timer); };
  }, [tab]);
  return focused;
}

function Poster({
  art, hue, width, height, style, image,
}: {
  art: PosterKey;
  hue: string;
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  /** The same poster pre-drawn to PNG (posterArt.ts), for a place the reader SWIPES
   *  through: an image is decoded once, where SvgXml parses its string on the JS
   *  thread and builds a native view per path every time its card mounts. */
  image?: ImageSourcePropType;
}) {
  const w = Math.round(width);
  const h = Math.round(height);
  const xml = useMemo(() => (image ? '' : posterXml(art, hue, w, h)), [image, art, hue, w, h]);
  const live = useTabFocused();
  return (
    <View pointerEvents="none" style={[{ width: w, height: h, backgroundColor: posterGround(art, hue), overflow: 'hidden' }, style]}>
      {!live ? null : image
        ? <Image source={image} style={{ width: w, height: h }} resizeMode="cover" fadeDuration={0} />
        : <SvgXml xml={xml} width={w} height={h} />}
    </View>
  );
}

export default memo(Poster);
