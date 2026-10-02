import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import type { WidgetMood } from '@/lib/widget/mood';
import { layoutWidget, FOOT, KICKER, PAD, RADIUS } from './widgetLayout';
import { inkFor, paletteFor, sceneSvg, SEAL_CORE, SEAL_EMBER } from './widgetScenes';

// ─────────────────────────────────────────────────────────────────────────────
// THE HOME-SCREEN WIDGET (redesigned 2026-10-02).
//
//   "redesign the widget completely to say different things from different
//    subjects … look at Duolingo's widget … I really like theirs. It's funny too
//    … really nice colors … change the widget depending on what kind of day it
//    is, or if the user has not come back for a day."
//
// The owner picked the SPLIT from three rendered directions: on the left his day —
// the sky follows the clock and he gets more desperate as midnight comes without a
// lesson, Duolingo's own mechanism — with the streak on it; on the right a fact
// from one of the seven subjects, a different subject every three hours, and his
// line underneath. Below SPLIT_MIN_W (a 2×2) there is no room for the fact and the
// widget is just his day.
//
// NOT a React Native tree: this renders to Android RemoteViews in a headless task,
// so only the library's primitives exist and nothing can be measured. Every size
// decision is therefore ARITHMETIC in widgetLayout.ts, and `npm run check:widget`
// runs the same arithmetic over every fact and every line. The picture is one SVG
// drawn to the exact box it fills (widgetScenes.ts says why that matters).
//
// The registered name is still `QuoteOfTheDay` (app.json, render.tsx): a widget
// already on somebody's home screen is bound to that name, and renaming it would
// strand every one of them. Only the picker's label and preview are compiled.
// ─────────────────────────────────────────────────────────────────────────────

const PAPER = '#FBFAF6';
const INK = '#1A1A1A';
/** His line, calm. */
const LINE_CALM = '#5C574F';
/** His line when the streak is in danger — the ember, deepened to read on paper. */
const LINE_URGENT = '#A8401F';

export interface StudyWidgetProps {
  mood: WidgetMood;
  subjectName: string;
  subjectHue: string;
  width: number;
  height: number;
}

function Seal({ n, bg, fg }: { n: number; bg: string; fg: string }) {
  const seal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5.4" fill="${SEAL_EMBER}"/><circle cx="6" cy="6" r="2.5" fill="${SEAL_CORE}"/></svg>`;
  return (
    <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: bg as `#${string}`, borderRadius: 11, paddingLeft: 5, paddingRight: 8, paddingVertical: 3 }}>
      <SvgWidget svg={seal} style={{ width: 12, height: 12, marginRight: 4 }} />
      <TextWidget text={String(n)} style={{ fontSize: 14, fontWeight: '800', color: fg as `#${string}` }} />
    </FlexWidget>
  );
}

export function StudyWidget({ mood, subjectName, subjectHue, width, height }: StudyWidgetProps) {
  const w = Math.max(110, Math.round(width));
  const h = Math.max(80, Math.round(height));
  const P = paletteFor(mood.tod, mood.rain);
  const L = layoutWidget(w, h, mood.fact, mood.line);
  const spec = { tod: mood.tod, rain: mood.rain, pose: mood.pose, mug: mood.mug, crate: mood.crate };
  const label = `${mood.streak} day streak. ${mood.line}${L.mode === 'split' ? ` ${subjectName}: ${mood.fact}` : ''}`;
  const kicker = inkFor(subjectHue, PAPER);
  const open = { clickAction: 'OPEN_URI' as const, clickActionData: { uri: 'philosophize://' } };

  if (L.mode === 'day') {
    return (
      <OverlapWidget {...open} accessibilityLabel={label} style={{ width: 'match_parent', height: 'match_parent' }}>
        <SvgWidget svg={sceneSvg(spec, w, h, [RADIUS, RADIUS, RADIUS, RADIUS], 0.8)} style={{ width: w, height: h }} />
        <FlexWidget style={{ width: 'match_parent', height: 'match_parent', flexDirection: 'column', paddingLeft: PAD.l, paddingTop: PAD.t, paddingRight: PAD.r }}>
          <Seal n={mood.streak} bg={P.pillBg} fg={P.pillFg} />
          <TextWidget
            text={mood.line}
            maxLines={L.lineLines}
            truncate="END"
            style={{ width: Math.floor(L.textW), marginTop: 8, fontSize: L.lineSize, fontWeight: '800', color: P.text as `#${string}` }}
          />
        </FlexWidget>
      </OverlapWidget>
    );
  }

  return (
    <OverlapWidget {...open} accessibilityLabel={label} style={{ width: 'match_parent', height: 'match_parent' }}>
      <FlexWidget style={{ width: 'match_parent', height: 'match_parent', flexDirection: 'row' }}>
        <SvgWidget svg={sceneSvg(spec, L.leftW, h, [RADIUS, 0, 0, RADIUS], 0.56)} style={{ width: L.leftW, height: h }} />
        <FlexWidget
          style={{
            width: L.rightW,
            height: 'match_parent',
            backgroundColor: PAPER,
            borderTopRightRadius: RADIUS,
            borderBottomRightRadius: RADIUS,
            flexDirection: 'column',
            paddingLeft: PAD.l,
            paddingRight: PAD.r,
            paddingTop: PAD.t,
            paddingBottom: PAD.b,
          }}
        >
          {/* Which subject, in its own colour. */}
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', height: KICKER.h, marginBottom: KICKER.gap }}>
            <FlexWidget style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: kicker as `#${string}`, marginRight: 5 }} />
            <TextWidget
              text={subjectName.toUpperCase()}
              maxLines={1}
              style={{ fontSize: KICKER.size, fontWeight: '800', letterSpacing: 1.4, color: kicker as `#${string}` }}
            />
          </FlexWidget>
          {/* The fact takes every dp the panel can spare. */}
          <FlexWidget style={{ flex: 1, width: 'match_parent', justifyContent: 'center' }}>
            <TextWidget
              text={mood.fact}
              maxLines={L.factLines}
              truncate="END"
              style={{ fontSize: L.factSize, fontWeight: '600', color: INK, width: L.rightW - PAD.l - PAD.r }}
            />
          </FlexWidget>
          {L.footLines > 0 ? (
            <TextWidget
              text={mood.line}
              maxLines={L.footLines}
              truncate="END"
              style={{ marginTop: FOOT.gap, fontSize: FOOT.size, fontWeight: '800', color: mood.state === 'waiting' && (mood.atRisk || mood.tod === 'evening') ? LINE_URGENT : LINE_CALM }}
            />
          ) : null}
        </FlexWidget>
      </FlexWidget>
      {/* The streak sits on his sky, top left. */}
      <FlexWidget style={{ width: L.leftW, height: 'match_parent', paddingLeft: 10, paddingTop: 10 }}>
        <Seal n={mood.streak} bg={P.pillBg} fg={P.pillFg} />
      </FlexWidget>
    </OverlapWidget>
  );
}
