import { useMemo, useRef } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { ERA, type EraKey } from '@/constants/design';
import { eraGroupOfId } from '@/data/philosophers';
import { LESSON_NAMES } from '@/data/lessonNames';
import { INK, RULE } from './cinematicKit';

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
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  text: string;
  /** The lesson's id — the name index is per lesson (see data/lessonNames.ts). */
  lessonId: string;
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

type Run =
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

export default function NarrationText({ text, lessonId, focus, style, onPeek, openId }: Props) {
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

  // The common case is a paragraph with nothing in it to pick out, and it must
  // cost exactly what it used to: one Text, no wrappers, no press handlers.
  if (runs.length === 1 && runs[0].kind === 'plain') {
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

  return (
    <Text ref={para} style={style}>
      {runs.map((run, k) => {
        if (run.kind === 'plain') return <Text key={k}>{run.text}</Text>;
        if (run.kind === 'focus') {
          return (
            <Text key={k} style={{ fontWeight: '700', backgroundColor: RULE, color: INK }}>
              {run.text}
            </Text>
          );
        }
        const group = eraGroupOfId(run.pid) as EraKey | null;
        const hue = group ? ERA[group] : INK;
        const open = openId === run.pid;
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
              color: hue,
              fontWeight: '700',
              textDecorationLine: 'underline',
              textDecorationColor: hue,
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
