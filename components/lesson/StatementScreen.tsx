import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import KineticNarration from './KineticNarration';
import { type SceneKey } from './scenes/LessonScene';
import { T } from './theme';

interface Props {
  text: string;
  hint: string;          // small caps label, bottom-left
  button: string;        // button label, bottom-right
  onContinue: () => void;
  size?: number;
  source?: string;       // optional attribution (example cards)
  kicker?: string;       // optional small gold label above the passage
  scene?: SceneKey;      // themed isometric backdrop for this lesson
}

// The shared scaffold for every "reading" card: a themed isometric scene up top
// (the visual hero), then a narrated passage that reveals in place below it, a
// contextual hint, and an always-available continue button.
export default function StatementScreen({ text, hint, button, onContinue, size, source, kicker, scene }: Props) {
  const [done, setDone] = useState(false);

  return (
    <View style={styles.root}>
      {kicker ? (
        <Text style={styles.kicker}>{kicker}</Text>
      ) : null}

      <View style={{ flex: 1 }}>
        <KineticNarration text={text} size={size} onDone={() => setDone(true)} />
      </View>

      {source && done ? (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 300 }}>
          <Text style={styles.source}>— {source}</Text>
        </MotiView>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.hint}>{done ? hint : 'TAP TO REVEAL'}</Text>
        <Pressable onPress={onContinue} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}>
          <Text style={styles.btnText}>{button}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  kicker: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: T.gold,
    letterSpacing: 3,
    paddingHorizontal: 26,
    marginTop: 4,
    marginBottom: 2,
  },
  source: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 13,
    color: T.creamSoft,
    paddingHorizontal: 26,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 6,
  },
  hint: { fontFamily: 'Inter_500Medium', fontSize: 10, color: T.dim, letterSpacing: 2 },
  btn: {
    borderWidth: 1.5,
    borderColor: T.cream,
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  btnText: { fontFamily: 'Inter_700Bold', fontSize: 12, color: T.cream, letterSpacing: 1 },
});
