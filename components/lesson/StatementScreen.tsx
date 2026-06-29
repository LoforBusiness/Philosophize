import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import FadeInWords, { wordTiming } from './FadeInWords';
import { useSceneMeta, useCardActive } from './sceneContext';
import { T } from './theme';

interface Props {
  text: string;
  kicker?: string;       // small caps label above the passage
  size?: number;         // body font size
  source?: string;       // optional attribution (example cards)
  onRevealed?: () => void; // fired once the whole passage has finished fading in
}

// A reading card whose words live directly in the illustrated scene — no panel.
// The passage sits in the scene's deliberately blank region (sky, fog, open
// field) and fades in word by word the moment the reader arrives on the card.
// Ink text on the paper scenes, paper text on the night scenes.
export default function StatementScreen({ text, kicker, size = 23, source, onRevealed }: Props) {
  const scene = useSceneMeta();
  const isCurrent = useCardActive();
  // Latch: the reveal begins on first arrival and never rewinds when swiping back.
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (isCurrent && !active) setActive(true);
  }, [isCurrent, active]);
  const dark = scene.mode === 'dark';

  // Auto-fit: a long passage (a dense summary recap, an 80-word example) can run
  // taller than the card and clip behind the footer. We measure the card's height
  // and the passage's natural height once, and shrink the font *only* when the
  // text would overflow — so cards that already fit are never touched. Word area
  // scales ~ size², hence the sqrt; the 8px margin leaves a little breathing room.
  const paddingTop = scene.zone === 'top' ? 46 : 18;
  const paddingBottom = scene.zone === 'bottom' ? 56 : scene.zone === 'middle' ? 130 : 18;
  const reserve = paddingTop + paddingBottom + (kicker ? 40 : 0) + (source ? 46 : 0);
  const [rootH, setRootH] = useState(0);
  const [bodyH, setBodyH] = useState(0);
  const [fitSize, setFitSize] = useState(size);
  const fitLocked = useRef(false);
  useEffect(() => {
    if (fitLocked.current || rootH <= 0 || bodyH <= 0) return;
    const avail = rootH - reserve;
    if (avail > 0 && bodyH > avail) {
      const next = Math.max(15, Math.floor(size * Math.sqrt((avail - 8) / bodyH)));
      if (next < size) setFitSize(next);
    }
    fitLocked.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootH, bodyH]);

  const body = dark ? '#F4F3EE' : T.ink;
  const faint = dark ? 'rgba(244,243,238,0.6)' : T.gold;
  // A soft halo the colour of the page sits behind every glyph so the words
  // stay legible even where the artwork drifts into the text zone.
  const halo = dark ? 'rgba(14,14,14,0.92)' : 'rgba(250,250,247,0.95)';
  // A tone-matched plate painted right behind the words. Calibrated to disappear
  // over the scene's blank zone (it matches the page) but to fill in solidly the
  // moment a word crosses same-tone art — a white cloud, the moon, a dark tree —
  // so no word is ever lost in the illustration. The paper plate is keyed to the
  // scene's mid paper tone (not pure white) so it stays invisible on light scenes
  // yet still lifts ink text off any dark mass it crosses.
  const plate = dark ? 'rgba(14,14,14,0.7)' : 'rgba(244,243,238,0.5)';
  const haloShadow = {
    textShadowColor: halo,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  } as const;
  // The kicker and attribution sit on their own small plate too, for the same reason.
  const linePlate = {
    backgroundColor: plate,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  } as const;
  const { total } = wordTiming(text);

  // Report up the moment the whole passage (and any trailing attribution) has
  // finished surfacing, so the runner can keep the forward swipe locked until
  // every word is on screen. Fires once; the reveal never rewinds.
  const revealedRef = useRef(false);
  useEffect(() => {
    if (!active || revealedRef.current) return;
    const doneMs = total + (source ? 700 : 0);
    const t = setTimeout(() => {
      revealedRef.current = true;
      onRevealed?.();
    }, doneMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const justify =
    scene.zone === 'top' ? 'flex-start' : scene.zone === 'bottom' ? 'flex-end' : 'center';

  return (
    <View
      onLayout={(e) => setRootH(e.nativeEvent.layout.height)}
      style={[
        styles.root,
        {
          justifyContent: justify,
          paddingHorizontal: scene.padH ?? 32,
          paddingTop,
          // The scenes keep their art low in the frame, so centred text is
          // biased upward to stay inside the blank sky.
          paddingBottom,
        },
      ]}
    >
      {kicker ? (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ type: 'timing', duration: 600 }}
          style={styles.kickerWrap}
        >
          <Text style={[styles.kicker, { color: faint }, linePlate, haloShadow]}>{kicker}</Text>
        </MotiView>
      ) : null}

      <View onLayout={(e) => setBodyH(e.nativeEvent.layout.height)}>
        <FadeInWords text={text} size={fitSize} color={body} active={active} haloColor={halo} plateColor={plate} />
      </View>

      {source ? (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ type: 'timing', duration: 700, delay: active ? total : 0 }}
          style={styles.sourceWrap}
        >
          <Text style={[styles.source, { color: dark ? 'rgba(244,243,238,0.7)' : T.inkSoft }, linePlate, haloShadow]}>
            — {source}
          </Text>
        </MotiView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  kickerWrap: { alignItems: 'center', marginBottom: 16 },
  kicker: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    letterSpacing: 3,
  },
  sourceWrap: { alignItems: 'center', marginTop: 18 },
  source: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 13,
  },
});
