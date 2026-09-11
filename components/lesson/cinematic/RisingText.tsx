import { Fragment, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { ERA, type EraKey } from '@/constants/design';
import { eraGroupOfId } from '@/data/philosophers';
import { PENDING_MS, RISE_EM, letterFrame, type LetterTime } from '@/lib/narration/reveal';
import { INK, RULE } from './cinematicKit';
import type { Run } from './NarrationText';

// ─────────────────────────────────────────────────────────────────────────────
// THE NARRATED PARAGRAPH, WITH EACH LETTER RISING INTO PLACE AS IT IS SPOKEN.
//
// Asked for on 11 Sep 2026 and on for two lessons first (RISING_LESSONS in
// lib/narration/reveal.ts), so it can be tuned before it goes further. NarrationText
// decides when a paragraph uses it; this draws it.
//
// ── WHY THE PARAGRAPH IS NO LONGER ONE <Text> ───────────────────────────────
//
// A nested Text is a span, and a span cannot move: no transform reaches it on
// Android. So every letter is its own Animated.Text, every word a row of them, and
// the paragraph a wrapping row of words. Lines therefore break between WORDS by
// flex-wrap rather than inside the text engine, and a word's trailing space travels
// with it, so a line can end one word sooner than a plain paragraph's would (the
// height came out the same on every line measured). The layout is kept for the
// WHOLE life of the paragraph (waiting, speaking, finished, muted), so it never swaps
// to a plain Text and reflows in front of the reader.
//
// ── ONE CLOCK, ON THE UI THREAD ─────────────────────────────────────────────
//
// The fade re-renders about twenty times a second from a JS timer, which is fine
// for opacity in fifths and visibly steppy for movement. Here nothing re-renders
// while the line plays: a frame callback advances one shared value from the moment
// the voice started, and every letter's style is a function of it.
//
// ── WHAT MOVES AS ONE PIECE ─────────────────────────────────────────────────
//
// The first draft carried a maxim's band and a name's underline on every letter, and
// the contact sheet showed what that does: each rising letter took its own piece of
// band or rule down with it, so both came out stepped until the word landed. So the
// band is laid UNDER a maxim's letters and fades in where it is, and a name, which is
// one tap target with one rule under it, rises as a single piece.
// ─────────────────────────────────────────────────────────────────────────────

/** Waiting for its voice, speaking, cut off by a tap, or simply shown. */
export type RiseMode = 'wait' | 'play' | 'freeze' | 'show';

interface Props {
  text: string;
  runs: readonly Run[];
  /** One entry per character of `text` (letterTimes in lib/narration/reveal.ts). */
  times: readonly LetterTime[];
  style?: StyleProp<TextStyle>;
  mode: RiseMode;
  /** When the voice started, in Date.now() milliseconds. Read in 'play'. */
  startAt: number;
  onPeek?: (philosopherId: string, anchorX: number) => void;
  openId?: string | null;
  /**
   * Draw the paragraph as it looks this many seconds into its line, with no clock
   * running. What a contact sheet of the animation renders.
   */
  still?: number;
}

/** A stretch of one word that belongs to one run. */
type Seg = { run: Run | undefined; from: number; to: number };
/** A word, the runs inside it, and what kind of space follows it. */
type Word = { from: number; to: number; segs: Seg[]; pid: string | null; space: 'none' | 'plain' | 'band' };

/** A time no letter is still arriving at, in either direction. */
const FAR = 1e6;
/** A space that neither collapses on the web nor lets a line break inside a word. */
const SPACE = '\u00A0';

function Letter({ ch, start, len, rise, t, style }: {
  ch: string;
  start: number;
  len: number;
  rise: number;
  t: SharedValue<number>;
  style: StyleProp<TextStyle>;
}) {
  const moving = useAnimatedStyle(() => {
    const f = letterFrame(t.value, start, len, rise);
    return { opacity: f[0], transform: [{ translateY: f[1] }] };
  });
  return <Animated.Text style={[style, moving]}>{ch}</Animated.Text>;
}

/** A maxim's band, laid under its letters: it fades in where it is and never moves. */
function Band({ start, len, t }: { start: number; len: number; t: SharedValue<number> }) {
  const shown = useAnimatedStyle(() => ({ opacity: letterFrame(t.value, start, len, 0)[0] }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.band, shown]} />;
}

/** Something that rises as one piece, on the timing of its first letter. */
function Piece({ start, len, rise, t, children }: {
  start: number;
  len: number;
  rise: number;
  t: SharedValue<number>;
  children: ReactNode;
}) {
  const moving = useAnimatedStyle(() => {
    const f = letterFrame(t.value, start, len, rise);
    return { opacity: f[0], transform: [{ translateY: f[1] }] };
  });
  return <Animated.View style={moving}>{children}</Animated.View>;
}

export default function RisingText({ text, runs, times, style, mode, startAt, onPeek, openId, still }: Props) {
  const flat = StyleSheet.flatten(style) ?? {};
  const size = typeof flat.fontSize === 'number' ? flat.fontSize : 18;
  const rise = Math.round(size * RISE_EM * 10) / 10;
  const end = useMemo(() => times.reduce((e, x) => Math.max(e, x.start + x.len), 0), [times]);

  const t = useSharedValue(still ?? (mode === 'show' ? FAR : -FAR));
  const endAt = useSharedValue(end);
  const base = useSharedValue(-1);
  const lead = useSharedValue(0);
  const running = useSharedValue(false);

  useFrameCallback((f) => {
    'worklet';
    if (!running.value) return;
    // The first frame after the clock is armed fixes where zero is, in the frame
    // clock's own units, so no wall-clock reading is ever made on the UI thread.
    if (base.value < 0) base.value = f.timestamp - lead.value * 1000;
    const now = (f.timestamp - base.value) / 1000;
    if (now > endAt.value) {
      running.value = false;
      t.value = FAR;
      return;
    }
    t.value = now;
  });

  useEffect(() => {
    endAt.value = end;
    if (still != null) {
      running.value = false;
      t.value = still;
      return undefined;
    }
    if (mode === 'show') {
      running.value = false;
      t.value = FAR;
      return undefined;
    }
    // Cut off by a tap: the letters still to come stay unwritten while the deck fades.
    if (mode === 'freeze') {
      running.value = false;
      return undefined;
    }
    if (mode === 'play') {
      lead.value = (Date.now() - startAt) / 1000;
      base.value = -1;
      running.value = true;
      return undefined;
    }
    // Waiting for the voice: hidden, and never for longer than PENDING_MS.
    running.value = false;
    t.value = -FAR;
    const timer = setTimeout(() => { t.value = FAR; }, PENDING_MS);
    return () => clearTimeout(timer);
  }, [mode, startAt, still, end]);

  // The words, each cut into the runs it holds, and what follows each one.
  const words = useMemo(() => {
    const runAt: (Run | undefined)[] = [];
    let offset = 0;
    for (const r of runs) {
      for (let c = 0; c < r.text.length; c += 1) runAt[offset + c] = r;
      offset += r.text.length;
    }
    const list: Word[] = [];
    const re = /(\S+)(\s*)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const from = m.index;
      const to = from + m[1].length;
      const segs: Seg[] = [];
      for (let c = from; c < to; c += 1) {
        const last = segs[segs.length - 1];
        if (last && last.run === runAt[c]) last.to = c + 1;
        else segs.push({ run: runAt[c], from: c, to: c + 1 });
      }
      let pid: string | null = null;
      for (const s of segs) {
        if (s.run && s.run.kind === 'name') { pid = s.run.pid; break; }
      }
      const after = runAt[to];
      list.push({
        from,
        to,
        segs,
        pid,
        space: m[2].length === 0 ? 'none' : after && after.kind === 'focus' ? 'band' : 'plain',
      });
    }
    return list;
  }, [text, runs]);

  const box = useRef<View>(null);
  const wordRefs = useRef<Record<number, View | null>>({});

  /** The pressed name's centre, in points from the paragraph's left edge (see NarrationText). */
  const anchor = (k: number, then: (x: number) => void) => {
    const w = wordRefs.current[k];
    const b = box.current;
    if (!w || !b || typeof w.measureInWindow !== 'function') { then(0); return; }
    b.measureInWindow((bx) => {
      w.measureInWindow((wx, _wy, ww) => then(Math.max(0, wx - bx + ww / 2)));
    });
  };

  const nameStyle = (pid: string): TextStyle => {
    const group = eraGroupOfId(pid) as EraKey | null;
    const hue = group ? ERA[group] : INK;
    return {
      color: hue,
      fontWeight: '700',
      textDecorationLine: 'underline',
      textDecorationColor: hue,
      // The open one reads as held down rather than merely marked.
      backgroundColor: openId === pid ? `${hue}1A` : 'transparent',
    };
  };
  const focusStyle: StyleProp<TextStyle> = [style, styles.focus];
  const space = <Text style={style}>{SPACE}</Text>;

  return (
    <View ref={box} style={styles.para} accessible={!onPeek} accessibilityLabel={text}>
      {words.map((w, k) => {
        if (w.pid) {
          const pid = w.pid;
          return (
            <Pressable
              key={k}
              ref={(r) => { wordRefs.current[k] = r; }}
              // Marked so a harness can tell a name from an answer (see NarrationText).
              testID="thinker-name"
              accessibilityRole="button"
              disabled={!onPeek}
              onPress={onPeek ? (e) => {
                e.stopPropagation?.();
                anchor(k, (x) => onPeek(pid, x));
              } : undefined}
              style={styles.word}
            >
              <Piece start={times[w.from].start} len={times[w.from].len} rise={rise} t={t}>
                <Text style={style}>
                  {w.segs.map((s) => (
                    <Text key={s.from} style={s.run && s.run.kind === 'name' ? nameStyle(s.run.pid) : undefined}>
                      {text.slice(s.from, s.to)}
                    </Text>
                  ))}
                </Text>
              </Piece>
              {w.space !== 'none' ? space : null}
            </Pressable>
          );
        }
        const lastSeg = w.segs[w.segs.length - 1];
        const bandHoldsSpace = w.space === 'band' && !!lastSeg.run && lastSeg.run.kind === 'focus';
        return (
          <View key={k} style={styles.word}>
            {w.segs.map((s) => {
              const focus = !!s.run && s.run.kind === 'focus';
              const letters = [];
              for (let c = s.from; c < s.to; c += 1) {
                letters.push(
                  <Letter key={c} ch={text[c]} start={times[c].start} len={times[c].len} rise={rise} t={t} style={focus ? focusStyle : style} />,
                );
              }
              if (!focus) return <Fragment key={s.from}>{letters}</Fragment>;
              return (
                <View key={s.from} style={styles.word}>
                  <Band start={times[s.from].start} len={times[s.from].len} t={t} />
                  {letters}
                  {s === lastSeg && bandHoldsSpace ? space : null}
                </View>
              );
            })}
            {w.space !== 'none' && !bandHoldsSpace ? space : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  para: { flexDirection: 'row', flexWrap: 'wrap' },
  word: { flexDirection: 'row' },
  band: { backgroundColor: RULE },
  focus: { fontWeight: '700', color: INK },
});
