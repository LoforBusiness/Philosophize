import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import * as Speech from 'expo-speech';
import { useNarration } from './NarrationContext';
import { getBritishVoice } from '@/lib/voice';

interface VBeat {
  display: string;
  charStart: number; // offset of this beat's first word within its sentence
}
interface Sentence {
  text: string;
  beats: VBeat[];
}

// Split into SENTENCES (each spoken as one natural utterance — so the voice only
// pauses at real punctuation), then into short VISUAL beats within each sentence.
function buildSentences(text: string): Sentence[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentenceStrings = clean.match(/[^.!?]+[.!?]*/g) ?? [clean];

  return sentenceStrings
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const words = s.split(' ');
      const beats: VBeat[] = [];
      let group: { w: string; start: number }[] = [];
      let searchFrom = 0;

      const flush = () => {
        if (group.length === 0) return;
        const display = group
          .map((x) => x.w)
          .join(' ')
          .replace(/^["'\s]+|[.,;:"'\s]+$/g, '');
        if (display) beats.push({ display, charStart: group[0].start });
        group = [];
      };

      for (const w of words) {
        const start = s.indexOf(w, searchFrom);
        searchFrom = start + w.length;
        group.push({ w, start });
        const endsClause = /[,;:]$/.test(w);
        if (group.length >= 4 || endsClause) flush();
      }
      flush();
      if (beats.length === 0) beats.push({ display: s.replace(/[.!?]+$/, ''), charStart: 0 });
      return { text: s, beats };
    });
}

// Deterministic pseudo-random in [0,1) so a word's size/angle/position is stable
// across re-renders but varies per word.
function rnd(seed: number): number {
  const x = Math.sin(seed * 999.13) * 43758.5453;
  return x - Math.floor(x);
}

const INK = '#1A1A1A';
const MIN_BEAT_MS = 480; // every beat stays on screen at least this long — no flashing

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Vary tone + speed per sentence so the narrator isn't monotone. Questions rise
// and slow slightly; each sentence gets a small deterministic pitch/rate offset.
function prosodyFor(i: number, text: string, base: number) {
  const q = /\?\s*$/.test(text);
  const ex = /!\s*$/.test(text);
  let rate = base - 0.04 + rnd(i * 13 + 1) * 0.12;
  let pitch = 0.8 + rnd(i * 7 + 5) * 0.16;
  if (q) {
    pitch += 0.07;
    rate -= 0.03;
  }
  if (ex) {
    pitch += 0.04;
    rate += 0.03;
  }
  return { rate: clamp(rate, 0.75, 1.05), pitch: clamp(pitch, 0.7, 1.1) };
}

interface Props {
  text: string;
  active?: boolean;
  onDone?: () => void;
  rate?: number;
  variant?: 'play' | 'prompt';
}

export default function KineticNarration({
  text,
  active = true,
  onDone,
  rate = 0.9,
  variant = 'play',
}: Props) {
  const { enabled, registerPlayer } = useNarration();
  const sentences = useMemo(() => buildSentences(text), [text]);

  const [sIdx, setSIdx] = useState(0);
  const [bIdx, setBIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [nonce, setNonce] = useState(0);

  const mounted = useRef(true);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    getBritishVoice(); // warm up voice resolution early
    mounted.current = true;
    return () => {
      mounted.current = false;
      Speech.stop();
    };
  }, []);

  const lastBeatOf = (si: number) => Math.max(0, (sentences[si]?.beats.length ?? 1) - 1);

  const skip = useCallback(() => {
    Speech.stop();
    const last = Math.max(0, sentences.length - 1);
    setSIdx(last);
    setBIdx(lastBeatOf(last));
    setFinished(true);
    doneRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentences]);

  const restart = useCallback(() => {
    Speech.stop();
    setFinished(false);
    setSIdx(0);
    setBIdx(0);
    setNonce((n) => n + 1);
  }, []);
  useEffect(() => {
    registerPlayer(restart);
    return () => registerPlayer(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Speak one sentence per effect run. Beats are paced EVENLY across the
  // sentence's spoken duration with a minimum dwell, so a word is never on
  // screen for "almost no time," and the sentence only advances once the audio
  // has finished AND every beat has had its time on screen.
  useEffect(() => {
    if (!enabled) {
      setFinished(true);
      doneRef.current?.();
      return;
    }
    if (!active || sentences.length === 0) {
      if (sentences.length === 0) {
        setFinished(true);
        doneRef.current?.();
      }
      return;
    }
    if (finished || sIdx >= sentences.length) return;

    let cancelled = false;
    let started = false;
    let audioDone = false;
    let visualDone = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sentence = sentences[sIdx];
    const isLast = sIdx >= sentences.length - 1;
    const lastBeat = sentence.beats.length - 1;
    setBIdx(0);

    const clearTimers = () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
    const finishSentence = () => {
      if (cancelled || !mounted.current) return;
      cancelled = true;
      clearTimers();
      Speech.stop();
      if (isLast) {
        setFinished(true);
        doneRef.current?.();
      } else {
        setSIdx((i) => i + 1);
      }
    };
    const maybeFinish = () => {
      if (audioDone && visualDone) finishSentence();
    };

    const { rate: r, pitch } = prosodyFor(sIdx, sentence.text, rate);
    const len = Math.max(1, sentence.text.length);
    const estMs = Math.min(9000, Math.max(900, len * (64 / r)));
    const perBeat = Math.max(MIN_BEAT_MS, Math.round(estMs / sentence.beats.length));

    // Evenly-paced beat reveals.
    for (let i = 1; i <= lastBeat; i++) {
      timers.push(
        setTimeout(() => {
          if (!cancelled) setBIdx(i);
        }, i * perBeat)
      );
    }
    // Mark visuals complete a touch after the last beat appears.
    timers.push(
      setTimeout(() => {
        visualDone = true;
        maybeFinish();
      }, lastBeat * perBeat + 200)
    );

    // If audio never starts (browser blocks autoplay), don't stall.
    timers.push(
      setTimeout(() => {
        if (!started) {
          audioDone = true;
          maybeFinish();
        }
      }, estMs + 500)
    );

    // Speak the sentence with its own pitch/rate.
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        getBritishVoice().then((voice) => {
          if (cancelled) return;
          try {
            Speech.stop();
            Speech.speak(sentence.text, {
              voice: voice ?? undefined,
              rate: r,
              pitch,
              language: 'en-GB',
              onStart: () => {
                started = true;
              },
              onDone: () => {
                audioDone = true;
                maybeFinish();
              },
              onStopped: () => {},
              onError: () => {
                audioDone = true;
                maybeFinish();
              },
            });
          } catch {
            audioDone = true;
            maybeFinish();
          }
        });
      }, 160)
    );

    return () => {
      cancelled = true;
      clearTimers();
      Speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sIdx, enabled, active, sentences, nonce, finished, rate]);

  // Muted: show the whole passage statically so the lesson stays readable.
  if (!enabled) {
    return (
      <View style={styles.center}>
        <Text style={variant === 'prompt' ? styles.staticPrompt : styles.staticText}>
          {sentences.map((s) => s.beats.map((b) => b.display).join(' ')).join(' ')}
        </Text>
      </View>
    );
  }

  const beat = sentences[sIdx]?.beats[bIdx];
  const isPrompt = variant === 'prompt';
  const seedBase = sIdx * 131 + bIdx * 17 + nonce * 911;

  return (
    <Pressable style={{ flex: 1 }} onPress={finished ? undefined : skip}>
      <AnimatePresence exitBeforeEnter>
        {beat && (
          <MotiView
            key={`beat-${sIdx}-${bIdx}-${nonce}`}
            from={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'timing', duration: 170 }}
            style={[
              StyleSheet.absoluteFill,
              styles.beat,
              isPrompt ? styles.promptLayout : layoutForBeat(sIdx + bIdx),
            ]}
          >
            {beat.display.split(' ').map((w, i) => {
              const seed = seedBase + i * 7;
              const size = isPrompt
                ? 26 + Math.round(rnd(seed) * 8)
                : 34 + Math.round(rnd(seed) * 22);
              const rot = isPrompt ? (rnd(seed + 1) - 0.5) * 5 : (rnd(seed + 1) - 0.5) * 12;
              const ty = isPrompt ? 0 : (rnd(seed + 2) - 0.5) * 16;
              return (
                <MotiView
                  key={i}
                  from={entranceFrom(seed, ty, isPrompt)}
                  animate={{ opacity: 1, translateY: ty, scale: 1, rotate: `${rot}deg` }}
                  transition={{
                    type: 'spring',
                    delay: i * (isPrompt ? 55 : 70),
                    damping: isPrompt ? 14 : 10,
                    stiffness: isPrompt ? 150 : 140,
                    mass: 0.7,
                  }}
                  style={{ marginHorizontal: 6, marginVertical: 2 }}
                >
                  <Text
                    style={{
                      fontFamily: 'Caveat_700Bold',
                      fontSize: size,
                      color: INK,
                      lineHeight: size * 1.04,
                    }}
                  >
                    {w}
                  </Text>
                </MotiView>
              );
            })}
          </MotiView>
        )}
      </AnimatePresence>
    </Pressable>
  );
}

function entranceFrom(seed: number, ty: number, isPrompt: boolean) {
  if (isPrompt) return { opacity: 0, scale: 0.6, translateY: ty + 14, rotate: '0deg' };
  const v = Math.floor(rnd(seed + 3) * 3);
  if (v === 0) return { opacity: 0, scale: 0.3, translateY: ty + 32, rotate: '0deg' };
  if (v === 1) return { opacity: 0, scale: 1.7, translateY: ty, rotate: '0deg' };
  return { opacity: 0, scale: 0.6, translateY: ty - 28, rotate: '-12deg' };
}

function layoutForBeat(i: number) {
  const presets = [
    { justifyContent: 'center', alignItems: 'center' },
    { justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 18 },
    { justifyContent: 'flex-start', alignItems: 'center', paddingTop: 90 },
    { justifyContent: 'flex-end', alignItems: 'flex-end', paddingRight: 18, paddingBottom: 90 },
    { justifyContent: 'center', alignItems: 'flex-end', paddingRight: 18 },
  ] as const;
  return presets[i % presets.length];
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  beat: { paddingHorizontal: 24, flexDirection: 'row', flexWrap: 'wrap' },
  promptLayout: { justifyContent: 'center', alignItems: 'center' },
  staticText: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 40,
    color: INK,
    textAlign: 'center',
    lineHeight: 46,
  },
  staticPrompt: {
    fontFamily: 'Caveat_700Bold',
    fontSize: 32,
    color: INK,
    textAlign: 'center',
    lineHeight: 38,
  },
});
