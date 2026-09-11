import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { ERA, type EraKey } from '@/constants/design';
import { eraGroupOfId } from '@/data/philosophers';
import { LESSON_NAMES } from '@/data/lessonNames';
import { narration } from '@/lib/narration';
import { NARRATION } from '@/lib/narration/manifest';
import { useNarrationStore } from '@/lib/narration/store';
import { PENDING_MS, RISING_LESSONS, letterTimes, wordAlpha, withAlpha } from '@/lib/narration/reveal';
import { useUserDataStore } from '@/stores/userDataStore';
import { INK, RULE } from './cinematicKit';
import RisingText, { type RiseMode } from './RisingText';

// ─────────────────────────────────────────────────────────────────────────────
// THE PARAGRAPH UNDER THE FIGURE, WITH TWO THINGS PICKED OUT OF IT.
//
// The deck was one flat `<Text>`: every word of every beat arrived with exactly
// the same weight, including the two kinds that carry more than the rest.
//
//   A NAME. These lessons name people constantly — "Hume grants the variety",
//   "Plato hung it up here" — and a name is the one word on the screen a reader
//   might want to stop and ask about. It is drawn in its ERA's colour and it
//   opens a one-line snapshot when tapped.
//
//   A MAXIM. Most lessons turn on a single sentence, and it looked like every
//   other sentence around it. A beat may name one phrase of its own text as the
//   thing to remember, and it is struck rather than merely bolded.
//
// ── WHY THE COLOUR IS NOT A NEW COLOUR ──────────────────────────────────────
//
// `ERA` in constants/design.ts is the app's licensed "one place a hue means
// something", already keyed on the five groups the roster sorts 322 thinkers by,
// and already used on every quote plate. A name in the deck taking the same hue
// as that thinker's plate is the identity being consistent, not the identity
// bending: by the time a reader meets "Hume" in oxblood here, they have seen
// oxblood on his quotations.
//
// ── AND IT IS AN OUTLINE, NOT A FLOOD ───────────────────────────────────────
//
// §19's rule, recorded there after Insights was rebuilt twice: what makes a
// screen look cheap is not the palette, it is the AREA. So a name takes the hue
// in its TEXT and a 1.5pt rule under it — an edge and a mark. A filled chip
// behind every name would put six saturated blocks in a paragraph, which is the
// rainbow that rebuild exists to have ended.
//
// ── ONE PARENT `<Text>`, ALWAYS ─────────────────────────────────────────────
//
// The segments are nested Texts inside a single parent, because that is the only
// arrangement in which the line breaks are computed across the whole paragraph.
// Rendering the runs as siblings in a row lays each out independently and a
// highlighted name can no longer share a line with the words around it.
//
// ── AND IN A NARRATED LESSON, EACH WORD APPEARS AS IT IS SPOKEN ──────────────
//
// Decided 11 Sep 2026. A paragraph whose beat has a clip in lib/narration starts
// with every word laid out but transparent, and fades each one in on the time
// scripts/make-narration.mjs estimated for it. The words are coloured rather than
// hidden, so the lines break exactly where they will when the paragraph is whole,
// and nothing moves as it fills in. A paragraph whose voice never starts is shown
// whole after PENDING_MS; a muted lesson, the web, and every lesson without a clip
// never enter this path at all.
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  text: string;
  /** The lesson's id — the name index is per lesson (see data/lessonNames.ts). */
  lessonId: string;
  /** Which beat this paragraph belongs to, so a narrated line can find its voice. */
  beat?: number;
  /** A phrase of `text` to strike as the thing worth remembering. */
  focus?: string;
  style?: StyleProp<TextStyle>;
  /**
   * Which name was pressed, and where it sits across the deck.
   *
   * The x is what `ThinkerPeek` hangs its leader line under, and it comes from
   * the name's own layout rather than from the touch: a reader pressing the last
   * letter of "Wittgenstein" should still get a line under the middle of the
   * word, not under their fingertip.
   */
  onPeek?: (philosopherId: string, anchorX: number) => void;
  /** Which name is open, so it can be shown as pressed. */
  openId?: string | null;
}

export type Run =
  | { kind: 'plain'; text: string }
  | { kind: 'name'; text: string; pid: string }
  | { kind: 'focus'; text: string };

/** Escape a surface form for use in a RegExp. */
const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Cut the paragraph into runs.
 *
 * NAMES ARE MATCHED LONGEST-FIRST, which is why `lessonNames.ts` emits them in
 * that order: offered "Hume" before "David Hume", the short form wins and leaves
 * a stray uncoloured "David" in front of a coloured surname.
 *
 * The focus phrase is applied to the SURVIVING plain runs only. A maxim that
 * contains a name keeps the name's own colour and gets no second treatment —
 * two emphases on one word is not more emphatic, it is a mess.
 */
export function runsOf(text: string, names: readonly (readonly [string, string])[], focus?: string): Run[] {
  let runs: Run[] = [{ kind: 'plain', text }];

  for (const [surface, pid] of names) {
    const re = new RegExp(`\\b${esc(surface)}\\b`, 'g');
    const next: Run[] = [];
    for (const run of runs) {
      if (run.kind !== 'plain') { next.push(run); continue; }
      let at = 0;
      let m: RegExpExecArray | null;
      re.lastIndex = 0;
      while ((m = re.exec(run.text))) {
        if (m.index > at) next.push({ kind: 'plain', text: run.text.slice(at, m.index) });
        next.push({ kind: 'name', text: m[0], pid });
        at = m.index + m[0].length;
      }
      if (at < run.text.length) next.push({ kind: 'plain', text: run.text.slice(at) });
    }
    runs = next;
  }

  if (focus) {
    const next: Run[] = [];
    for (const run of runs) {
      if (run.kind !== 'plain') { next.push(run); continue; }
      const at = run.text.indexOf(focus);
      if (at < 0) { next.push(run); continue; }
      if (at > 0) next.push({ kind: 'plain', text: run.text.slice(0, at) });
      next.push({ kind: 'focus', text: focus });
      const rest = run.text.slice(at + focus.length);
      if (rest) next.push({ kind: 'plain', text: rest });
    }
    runs = next;
  }

  return runs.filter((r) => r.text.length > 0);
}

/**
 * Where this paragraph is in its spoken line.
 *
 * `spoken` drives the fade: `t` seconds in (negative while the voice has not
 * started), or null when every word should simply be shown. `mode` and `at` drive
 * the rising reveal in RISING_LESSONS instead, which keeps its own clock on the UI
 * thread, so for those this hook starts no timer at all.
 */
function useSpokenClock(lessonId: string, beat: number | undefined, text: string, rising: boolean) {
  const line = beat == null ? undefined : NARRATION[lessonId]?.[beat];
  const on = useUserDataStore((s) => s.settings.narration);
  const narrates = !!line && line.text === text && on && narration.isSupported();
  const mountedAt = useRef(Date.now()).current;
  // Only a line started around or after this paragraph appeared counts: the store
  // still holds the last play of this beat from any earlier visit to the lesson.
  const phase = useNarrationStore((s) =>
    narrates && s.lessonId === lessonId && s.beat === beat && s.at >= mountedAt - 250 ? s.phase : null);
  const at = useNarrationStore((s) => (narrates && s.lessonId === lessonId && s.beat === beat ? s.at : 0));
  const [now, setNow] = useState(mountedAt);

  const waiting = phase === null || phase === 'idle';
  const playing = phase === 'playing' && !!line && (now - at) / 1000 <= line.dur + 0.3;
  const running = !rising && narrates && (playing || (waiting && now - mountedAt < PENDING_MS));

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = 0;
    const tick = () => {
      const t = Date.now();
      // About twenty renders a second: each word steps through five shades as it
      // fades, and a render per frame would buy nothing a reader can see.
      if (t - last >= 45) { last = t; setNow(t); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  // What the rising reveal needs is where the voice is, never a time.
  const mode: RiseMode = !narrates || phase === 'failed' ? 'show'
    : phase === 'playing' ? 'play'
    : phase === 'stopped' ? 'freeze'
    : 'wait';

  let spoken: { t: number; starts: readonly number[] } | null = null;
  if (narrates && line && !rising) {
    if (phase === 'playing') spoken = playing ? { t: (now - at) / 1000, starts: line.words } : null;
    else if (waiting && now - mountedAt < PENDING_MS) spoken = { t: -1, starts: line.words };
  }
  return { spoken, mode, at };
}

export default function NarrationText({ text, lessonId, beat, focus, style, onPeek, openId }: Props) {
  const names = LESSON_NAMES[lessonId] ?? [];
  // Where each drawn name sits, filled in by onLayout as the paragraph lays out.
  // A ref rather than state: it is read on press and never rendered from, so
  // storing it in state would re-render the deck once per name for nothing.
  // ── WHERE THE NAME SITS, MEASURED WHEN IT IS PRESSED ───────────────────────
  //
  // This began as `onLayout` on the name, which is the obvious tool and does not
  // work: measured in the rendered page, react-native-web fired it ONCE across a
  // whole lesson in one case and NEVER in another, so the leader line landed under
  // the right word in one lesson and at the margin in the next. A callback that
  // fires sometimes is worse than one that never does, because it looks correct
  // wherever you happen to check.
  //
  // `measureInWindow` at press time is asked of a view that is on screen and
  // attached — which is the one condition §21 records it needing — and it gives
  // the name's own box rather than the touch point, so pressing the last letter of
  // "Wittgenstein" still hangs the line under the middle of the word.
  const para = useRef<Text>(null);
  const marks = useRef<Record<number, Text | null>>({});
  const runs = useMemo(() => runsOf(text, names, focus), [text, names, focus]);
  const line = beat == null ? undefined : NARRATION[lessonId]?.[beat];
  // A narrated line in a lesson trying the rising reveal draws with RisingText for the
  // whole life of the paragraph, so it never reflows between waiting and finished.
  const rising = RISING_LESSONS.includes(lessonId) && !!line && line.text === text;
  const { spoken, mode, at } = useSpokenClock(lessonId, beat, text, rising);
  const times = useMemo(
    () => (rising && line ? letterTimes(line.words, text, line.dur) : null),
    [rising, line, text],
  );
  const baseColor = useMemo(() => {
    const c = StyleSheet.flatten(style)?.color;
    return typeof c === 'string' ? c : INK;
  }, [style]);
  // Which word every character belongs to. Whitespace belongs to the word before it,
  // so a struck maxim's band grows across the space as the next word arrives. Counted
  // over the WHOLE text, because a run can end mid-word: "Sartre." is one spoken word
  // and two runs, the name and its full stop.
  const wordAt = useMemo(() => {
    const out = new Int32Array(text.length);
    let k = -1;
    let inWord = false;
    for (let c = 0; c < text.length; c += 1) {
      const ws = /\s/.test(text[c]);
      if (!ws && !inWord) k += 1;
      inWord = !ws;
      out[c] = Math.max(0, k);
    }
    return out;
  }, [text]);

  // Below every hook on purpose: `rising` can differ between beats of one instance.
  if (rising && times) {
    return (
      <RisingText
        key={`${lessonId}:${beat}:${text}`}
        text={text}
        runs={runs}
        times={times}
        style={style}
        mode={mode}
        startAt={at}
        onPeek={onPeek}
        openId={openId}
      />
    );
  }

  // The common case is a paragraph with nothing in it to pick out, and it must
  // cost exactly what it used to: one Text, no wrappers, no press handlers.
  if (!spoken && runs.length === 1 && runs[0].kind === 'plain') {
    return <Text style={style}>{text}</Text>;
  }

  /** The name's centre, in points from the paragraph's left edge. */
  const anchor = (k: number, then: (x: number) => void) => {
    const mark = marks.current[k];
    const box = para.current;
    if (!mark || !box || typeof mark.measureInWindow !== 'function') { then(0); return; }
    box.measureInWindow((px) => {
      mark.measureInWindow((mx, _my, mw) => then(Math.max(0, mx - px + mw / 2)));
    });
  };

  const alphaOf = (word: number) => (spoken ? wordAlpha(spoken.starts, word, spoken.t) : 1);
  /** A run cut into pieces that each belong to one word, with where each starts in `text`. */
  const piecesOf = (runText: string, start: number) => {
    const out: { text: string; word: number }[] = [];
    let s = 0;
    for (let c = 1; c <= runText.length; c += 1) {
      if (c === runText.length || wordAt[start + c] !== wordAt[start + s]) {
        out.push({ text: runText.slice(s, c), word: wordAt[start + s] });
        s = c;
      }
    }
    return out;
  };

  let offset = 0;
  return (
    <Text ref={para} style={style}>
      {runs.map((run, k) => {
        const start = offset;
        offset += run.text.length;
        if (run.kind === 'plain') {
          if (!spoken) return <Text key={k}>{run.text}</Text>;
          return (
            <Text key={k}>
              {piecesOf(run.text, start).map((p, j) => (
                <Text key={j} style={{ color: withAlpha(baseColor, alphaOf(p.word)) }}>{p.text}</Text>
              ))}
            </Text>
          );
        }
        if (run.kind === 'focus') {
          if (!spoken) {
            return (
              <Text key={k} style={{ fontWeight: '700', backgroundColor: RULE, color: INK }}>
                {run.text}
              </Text>
            );
          }
          return (
            <Text key={k} style={{ fontWeight: '700' }}>
              {piecesOf(run.text, start).map((p, j) => {
                const a = alphaOf(p.word);
                return (
                  <Text key={j} style={{ backgroundColor: withAlpha(RULE, a), color: withAlpha(INK, a) }}>{p.text}</Text>
                );
              })}
            </Text>
          );
        }
        const group = eraGroupOfId(run.pid) as EraKey | null;
        const hue = group ? ERA[group] : INK;
        const open = openId === run.pid;
        // A name arrives as one piece, on its first word's time.
        const a = alphaOf(wordAt[start]);
        return (
          <Text
            key={k}
            accessibilityRole="button"
            // MARKED SO A HARNESS CAN TELL IT FROM AN ANSWER.
            //
            // Six browser harnesses answer a two-card question by taking the first
            // `[role="button"],[tabindex]` below the stage that is wide enough. A
            // tappable name is now exactly that shape — "Simone de Beauvoir" sets
            // near the 150-unit width guard those predicates lean on — so a sweep
            // could answer a lesson by pressing a philosopher and then report the
            // beat as never advancing. That is §21's rule arriving again: a lesson
            // gaining a new kind of tappable element means the harnesses gain one
            // too, in the same commit.
            testID="thinker-name"
            // THE PRESS MUST STOP HERE, and this one line is the whole feature.
            //
            // The deck sits inside the player's body Pressable, whose onPress is
            // `advance` — and `advance` calls setPeek(null) on its way to the next
            // beat. So without this, tapping a name opens the card and closes it
            // again in the same gesture, while ALSO moving the reader off the
            // sentence they were asking about. Measured in a browser it looks
            // exactly like a handler that never fired.
            //
            // On a device the two would not collide: a Text with onPress claims
            // the touch responder and the parent never sees it. It is react-native-web
            // that turns this into a real <button> whose click bubbles — so the
            // defect only exists on the one platform this project can look at,
            // which is the reverse of §21's usual blind spot and just as costly.
            ref={(r) => { marks.current[k] = r; }}
            onPress={onPeek ? (e) => {
              e.stopPropagation?.();
              anchor(k, (x) => onPeek(run.pid, x));
            } : undefined}
            style={{
              color: withAlpha(hue, a),
              fontWeight: '700',
              textDecorationLine: 'underline',
              textDecorationColor: withAlpha(hue, a),
              // The open one reads as held down rather than merely marked.
              backgroundColor: open ? `${hue}1A` : 'transparent',
            }}
          >
            {run.text}
          </Text>
        );
      })}
    </Text>
  );
}
