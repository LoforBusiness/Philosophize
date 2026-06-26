import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

// Shared pacing so callers (e.g. a trailing attribution line) can time their own
// entrance to land just after the final word has faded in.
export function wordTiming(text: string) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  // Quicker per-word on long passages so a 60-word concept never drags.
  const per = Math.min(170, Math.max(60, Math.round(2800 / Math.max(1, words.length))));
  const lead = 260; // beat of stillness after arriving on the card
  return { words, per, lead, total: lead + words.length * per + 720 };
}

interface Props {
  text: string;
  size?: number;
  color: string;
  active: boolean; // begins the reveal; once begun it never resets
  align?: 'center' | 'left';
  // Soft glow drawn behind each word so the passage always reads against busy
  // artwork — paper-coloured behind ink text, ink-coloured behind paper text.
  haloColor?: string;
  // A tone-matched plate painted directly behind each word. Tuned so it vanishes
  // over the scene's blank zone (paper-on-paper / ink-on-night) yet becomes a
  // solid backing the instant a word lands on same-tone art (a white cloud, the
  // moon, a dark canopy) — guaranteeing every word stays completely visible.
  plateColor?: string;
}

// Renders a passage as wrapped words that each fade in one after another —
// invisible at first, then surfacing softly in reading order, like ink settling
// onto the page. The first sentence is set in bold for hierarchy.
export default function FadeInWords({ text, size = 23, color, active, align = 'center', haloColor, plateColor }: Props) {
  const { words, per, lead } = useMemo(() => wordTiming(text), [text]);

  // Index of the last word of the first sentence (bolded headline).
  const firstSentenceEnd = useMemo(() => {
    const i = words.findIndex((w) => /[.!?]$/.test(w));
    return i === -1 ? words.length - 1 : i;
  }, [words]);

  const [started, setStarted] = useState(false);
  useEffect(() => {
    if (active && !started) setStarted(true);
  }, [active, started]);

  const lineHeight = Math.round(size * 1.42);

  return (
    <View style={[styles.wrap, { justifyContent: align === 'center' ? 'center' : 'flex-start' }]}>
      {words.map((w, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0, translateY: 8 }}
          animate={started ? { opacity: 1, translateY: 0 } : { opacity: 0, translateY: 8 }}
          transition={{ type: 'timing', duration: 720, delay: started ? lead + i * per : 0 }}
        >
          <Text
            style={{
              fontFamily: i <= firstSentenceEnd ? 'PlayfairDisplay_700Bold' : 'PlayfairDisplay_400Regular',
              fontSize: size,
              lineHeight,
              color,
              marginHorizontal: 2,
              marginVertical: 2,
              paddingHorizontal: 5,
              paddingVertical: 1,
              borderRadius: 6,
              ...(plateColor ? { backgroundColor: plateColor } : null),
              ...(haloColor
                ? {
                    textShadowColor: haloColor,
                    textShadowOffset: { width: 0, height: 0 },
                    textShadowRadius: 8,
                  }
                : null),
            }}
          >
            {w}
          </Text>
        </MotiView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
});
