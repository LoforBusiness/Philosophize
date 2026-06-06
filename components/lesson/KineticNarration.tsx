import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
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

// A deep, unhurried narrator — the register of a thoughtful, middle-aged
// philosopher. Low pitch for gravitas, a measured pace, and only a gentle
// natural lilt between sentences (heavy jitter is what reads as robotic).
function prosodyFor(i: number, text: string, base: number) {
  const q = /\?\s*$/.test(text);
  const ex = /!\s*$/.test(text);
  let rate = base + (rnd(i * 13 + 1) - 0.5) * 0.04;
  let pitch = 0.8 + (rnd(i * 7 + 5) - 0.5) * 0.05;
  if (q) {
    pitch += 0.03;
    rate -= 0.03;
  }
  if (ex) {
    pitch += 0.03;
    rate += 0.02;
  }
  return { rate: clamp(rate, 0.8, 1.0), pitch: clamp(pitch, 0.7, 0.9) };
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
  rate = 0.9,
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

  const baseSize = size ?? (variant === 'prompt' ? 27 : 31);
  const lineHeight = Math.round(baseSize * 1.34);
  const PAGE = 9; // ~10 words on screen at once

  const wordStyle = (s0: boolean) => ({
    fontFamily: s0 ? 'PlayfairDisplay_700Bold' : 'PlayfairDisplay_400Regular',
    fontSize: baseSize,
    lineHeight,
    color: T.cream,
    marginHorizontal: 5,
    marginVertical: 3,
  });

  // How many words the narrator has reached so far.
  let revealedCount = 0;
  for (const t of tokens) {
    if (t.si < sIdx || (t.si === sIdx && t.bi <= bIdx)) revealedCount++;
  }
  if (finished) revealedCount = tokens.length;

  // Narration off: show the whole passage so it can be read in silence.
  if (!enabled) {
    return (
      <ScrollView contentContainerStyle={styles.readAll} showsVerticalScrollIndicator={false}>
        {tokens.map((t, i) => (
          <Text key={i} style={wordStyle(t.s0)}>
            {t.w}
          </Text>
        ))}
      </ScrollView>
    );
  }

  // A rolling window of ~PAGE words. Words pop in as the narrator speaks them;
  // once a page fills, it falls away and the next page bounces in.
  const lastPage = Math.max(0, Math.floor((tokens.length - 1) / PAGE));
  const currentPage = finished
    ? lastPage
    : Math.min(lastPage, Math.floor(Math.max(0, revealedCount - 1) / PAGE));
  const start = currentPage * PAGE;
  const pageTokens = tokens.slice(start, start + PAGE);

  return (
    <Pressable style={styles.stage} onPress={finished ? undefined : skip}>
      <AnimatePresence>
        <MotiView
          key={`${nonce}-${currentPage}`}
          style={styles.page}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, translateY: 38, scale: 0.92 }}
          transition={{ type: 'timing', duration: 260 }}
        >
          {pageTokens.map((t, idx) => {
            const gi = start + idx;
            const on = finished || gi < revealedCount;
            return (
              <MotiView
                key={`${nonce}-${gi}`}
                from={{ opacity: 0, scale: 0.5, translateY: 22 }}
                animate={
                  on
                    ? { opacity: 1, scale: 1, translateY: 0 }
                    : { opacity: 0, scale: 0.5, translateY: 22 }
                }
                transition={{ type: 'spring', damping: 11, stiffness: 210, mass: 0.7 }}
              >
                <Text style={wordStyle(t.s0)}>{t.w}</Text>
              </MotiView>
            );
          })}
        </MotiView>
      </AnimatePresence>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1 },
  page: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  readAll: {
    flexGrow: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 20,
  },
});
