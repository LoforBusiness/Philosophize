import { useEffect, useState } from 'react';
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
}

// A reading card whose words live directly in the illustrated scene — no panel.
// The passage sits in the scene's deliberately blank region (sky, fog, open
// field) and fades in word by word the moment the reader arrives on the card.
// Ink text on the paper scenes, paper text on the night scenes.
export default function StatementScreen({ text, kicker, size = 23, source }: Props) {
  const scene = useSceneMeta();
  const isCurrent = useCardActive();
  // Latch: the reveal begins on first arrival and never rewinds when swiping back.
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (isCurrent && !active) setActive(true);
  }, [isCurrent, active]);
  const dark = scene.mode === 'dark';

  const body = dark ? '#F4F3EE' : T.ink;
  const faint = dark ? 'rgba(244,243,238,0.6)' : T.gold;
  // A soft halo the colour of the page sits behind every glyph so the words
  // stay legible even where the artwork drifts into the text zone.
  const halo = dark ? 'rgba(14,14,14,0.92)' : 'rgba(250,250,247,0.95)';
  const haloShadow = {
    textShadowColor: halo,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  } as const;
  const { total } = wordTiming(text);

  const justify =
    scene.zone === 'top' ? 'flex-start' : scene.zone === 'bottom' ? 'flex-end' : 'center';

  return (
    <View
      style={[
        styles.root,
        {
          justifyContent: justify,
          paddingHorizontal: scene.padH ?? 32,
          paddingTop: scene.zone === 'top' ? 46 : 18,
          // The scenes keep their art low in the frame, so centred text is
          // biased upward to stay inside the blank sky.
          paddingBottom: scene.zone === 'bottom' ? 56 : scene.zone === 'middle' ? 130 : 18,
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
          <Text style={[styles.kicker, { color: faint }, haloShadow]}>{kicker}</Text>
        </MotiView>
      ) : null}

      <FadeInWords text={text} size={size} color={body} active={active} haloColor={halo} />

      {source ? (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ type: 'timing', duration: 700, delay: active ? total : 0 }}
          style={styles.sourceWrap}
        >
          <Text style={[styles.source, { color: dark ? 'rgba(244,243,238,0.7)' : T.inkSoft }, haloShadow]}>
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
