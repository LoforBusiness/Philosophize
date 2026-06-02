import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import * as Speech from 'expo-speech';
import { useNarration } from './NarrationContext';
import { getBritishVoice } from '@/lib/voice';
import { T } from './theme';

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
        beats.push({ display: group.map((x) => x.w).join(' '), charStart: group[0].start });
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
      if (beats.length === 0) beats.push({ display: s, charStart: 0 });
      return { text: s, beats };
    });
}

// Deterministic pseudo-random in [0,1) so prosody varies per sentence but is stable.
function rnd(seed: number): number {
  const x = Math.sin(seed * 999.13) * 43758.5453;
  return x - Math.floor(x);
}

const MIN_BEAT_MS = 360;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// A measured, human narrator — an unhurried, reflective register with only a
// gentle natural lilt between sentences (heavy jitter is what reads as robotic).
function prosodyFor(i: number, text: string, base: number) {
  const q = /\?\s*$/.test(text);
  const ex = /!\s*$/.test(text);
  let rate = base + (rnd(i * 13 + 1) - 0.5) * 0.05;
  let pitch = 1.0 + (rnd(i * 7 + 5) - 0.5) * 0.07;
  if (q) {
    pitch += 0.04;
    rate -= 0.04;
  }
  if (ex) {
    pitch += 0.04;
    rate += 0.02;
  }
  return { rate: clamp(rate, 0.84, 1.06), pitch: clamp(pitch, 0.92, 1.1) };
}

interface Props {
  text: string;
  active?: boolean;
  onDone?: () => void;
  rate?: number;
  variant?: 'play' | 'prompt';
  size?: number;
  align?: 'left' | 'center';
}

// Renders a passage as ONE clean, left-aligned block of serif text. As the
// narrator reads, each word brightens from dim to full in reading order — the
// words stay exactly where they belong on the page (no scattering). The speech
// engine (sentence-by-sentence, word-boundary synced) is unchanged.
export default function KineticNarration({
  text,
  active = true,
  onDone,
  rate = 0.95,
  variant = 'play',
  size,
  align = 'left',
}: Props) {
  const { enabled, registerPlayer } = useNarration();
  const sentences = useMemo(() => buildSentences(text), [text]);

  // Flat list of words, each tagged with the (sentence, beat) it belongs to so
  // we can brighten them in step with the narration.
  const tokens = useMemo(() => {
    const out: { w: string; si: number; bi: number; s0: boolean }[] = [];
    sentences.forEach((s, si) => {
      let from = 0;
      s.text.split(' ').filter(Boolean).forEach((w) => {
        const at = s.text.indexOf(w, from);
        from = at + w.length;
        let bi = 0;
        for (let k = 0; k < s.beats.length; k++) {
          if (s.beats[k].charStart <= at) bi = k;
          else break;
        }
        out.push({ w, si, bi, s0: si === 0 });
      });
    });
    return out;
  }, [sentences]);

  const [sIdx, setSIdx] = useState(0);
  const [bIdx, setBIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [nonce, setNonce] = useState(0);

  const mounted = useRef(true);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    getBritishVoice();
    mounted.current = true;
    return () => {
      mounted.current = false;
      Speech.stop();
    };
  }, []);

  const skip = useCallback(() => {
    Speech.stop();
    setSIdx(Math.max(0, sentences.length - 1));
    setBIdx(Math.max(0, (sentences[sentences.length - 1]?.beats.length ?? 1) - 1));
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

  // Speak one sentence per effect run; brighten beats in time with the audio.
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

    const beatForChar = (ci: number) => {
      let idx = 0;
      for (let k = 0; k < sentence.beats.length; k++) {
        if (sentence.beats[k].charStart <= ci) idx = k;
        else break;
      }
      return idx;
    };

    let boundaryDriven = false;
    for (let i = 1; i <= lastBeat; i++) {
      timers.push(
        setTimeout(() => {
          if (!cancelled && !boundaryDriven) setBIdx(i);
        }, i * perBeat)
      );
    }
    timers.push(
      setTimeout(() => {
        if (!boundaryDriven) {
          visualDone = true;
          maybeFinish();
        }
      }, lastBeat * perBeat + 200)
    );
    timers.push(
      setTimeout(() => {
        if (!started) {
          audioDone = true;
          maybeFinish();
        }
      }, estMs + 500)
    );

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
              onBoundary: (ev: { charIndex?: number; charLength?: number }) => {
                if (cancelled) return;
                const ci = typeof ev?.charIndex === 'number' ? ev.charIndex : 0;
                boundaryDriven = true;
                const bi = beatForChar(ci);
                setBIdx((cur) => (bi > cur ? bi : cur));
                if (bi >= lastBeat) {
                  visualDone = true;
                  maybeFinish();
                }
              },
              onDone: () => {
                audioDone = true;
                if (boundaryDriven) {
                  setBIdx(lastBeat);
                  visualDone = true;
                }
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
      }, 140)
    );

    return () => {
      cancelled = true;
      clearTimers();
      Speech.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sIdx, enabled, active, sentences, nonce, finished, rate]);

  const baseSize = size ?? (variant === 'prompt' ? 22 : 27);
  const lineHeight = Math.round(baseSize * 1.42);
  const showAll = !enabled || finished;

  const revealed = (si: number, bi: number) => showAll || si < sIdx || (si === sIdx && bi <= bIdx);

  return (
    <Pressable style={{ flex: 1 }} onPress={finished ? undefined : skip}>
      <ScrollView
        contentContainerStyle={[styles.scroll, align === 'center' && { alignItems: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.flow, align === 'center' && { justifyContent: 'center' }]}>
          {tokens.map((t, i) => {
            const on = revealed(t.si, t.bi);
            return (
              <MotiView
                key={`${nonce}-${i}`}
                animate={{ opacity: on ? 1 : 0 }}
                transition={{ type: 'timing', duration: 220 }}
              >
                <Text
                  style={{
                    fontFamily: t.s0 ? 'PlayfairDisplay_700Bold' : 'PlayfairDisplay_400Regular',
                    fontSize: baseSize,
                    lineHeight,
                    color: T.cream,
                    marginRight: 8,
                  }}
                >
                  {t.w}
                </Text>
              </MotiView>
            );
          })}
        </View>
      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 20 },
  flow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' },
});
