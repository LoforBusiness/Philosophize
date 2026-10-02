import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

import type { WeekDay, WidgetMood } from '@/lib/widget/mood';
import { ICONS, ICON_VIEWBOX, type IconName } from './widgetIcons';
import { FACT, GAP, layoutWidget, PAD, RADIUS, T, WEEK } from './widgetLayout';
import { markFor, mix, STATUS_COLOR, STATUS_ICON, W } from './widgetTheme';

// ─────────────────────────────────────────────────────────────────────────────
// THE HOME-SCREEN WIDGET (third design, 2026-10-02).
//
//   "completely redesign them … I do not need a stick man in the widgets … look
//    at the Google Calendar design … really nice widgets … design using their
//    ideas and their looks."
//
// From three mocks drawn after Google's own widgets, the owner picked the one
// after Pixel Weather's Material 3 Expressive widgets: one deep container; the
// streak as the hero number where Weather puts the temperature; the status and his
// line beside it; then rounded pills inside — the week, Monday first, like the
// hourly forecast row, and a fact from the day's subject with its Material Symbol.
// No illustration. At 2×2 it is the streak alone; on a short 4×1 strip, one row.
//
// NOT a React Native tree: RemoteViews, in a headless task, so only the library's
// primitives exist and nothing can be measured. Every size decision is arithmetic
// in widgetLayout.ts, and `npm run check:widget` runs that arithmetic over every
// fact and line. The registered name is still `QuoteOfTheDay` (app.json): a widget
// already on a home screen is bound to it.
// ─────────────────────────────────────────────────────────────────────────────

type Hex = `#${string}`;
const hex = (c: string) => c as Hex;
const svg = (name: IconName, color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ICON_VIEWBOX}"><path fill="${color}" d="${ICONS[name]}"/></svg>`;

export interface StudyWidgetProps {
  mood: WidgetMood;
  subjectName: string;
  subjectHue: string;
  width: number;
  height: number;
}

const DAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
/** A day disc's look: fill, letter colour, and whether it wears a ring. */
export function dayLook(d: WeekDay): { bg: string | null; fg: string; ring: boolean } {
  switch (d) {
    case 'done': return { bg: W.ember, fg: '#FFFFFF', ring: false };
    case 'todayDone': return { bg: W.ember, fg: '#FFFFFF', ring: true };
    case 'rest': return { bg: W.rest, fg: W.bg, ring: false };
    case 'today': return { bg: null, fg: W.on, ring: true };
    case 'missed': return { bg: mix(W.pill, W.on, 0.14), fg: W.soft, ring: false };
    default: return { bg: null, fg: W.faint, ring: false };
  }
}

/** The week row. At 2×2 the discs are too small to carry a letter, so they are dots. */
function Week({ week, disc, letters = true }: { week: WeekDay[]; disc: number; letters?: boolean }) {
  return (
    <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', width: 'match_parent' }}>
      {week.map((d, i) => {
        const L = dayLook(d);
        return (
          <FlexWidget
            key={i}
            style={{
              width: disc, height: disc, borderRadius: disc / 2,
              backgroundColor: L.bg ? hex(L.bg) : letters ? undefined : hex(W.faint),
              borderWidth: L.ring ? 2 : 0, borderColor: L.ring ? hex(W.on) : undefined,
              justifyContent: 'center', alignItems: 'center',
            }}
          >
            {letters ? <TextWidget text={DAY[i]} style={{ fontSize: Math.round(disc * 0.48), fontWeight: '800', color: hex(L.fg) }} /> : null}
          </FlexWidget>
        );
      })}
    </FlexWidget>
  );
}

export function StudyWidget({ mood, subjectName, subjectHue, width, height }: StudyWidgetProps) {
  const w = Math.max(110, Math.round(width));
  const h = Math.max(60, Math.round(height));
  const L = layoutWidget(w, h, mood.streak, mood.line, mood.fact);
  const statusColor = STATUS_COLOR[mood.statusTone] ?? W.on;
  const statusIcon = STATUS_ICON[mood.statusTone] ?? 'play';
  const flameColor = mood.streak > 0 ? W.ember : W.out;
  const label = `${mood.streak} day streak. ${mood.status}. ${mood.line}${L.mode === 'full' && L.factLines ? ` ${subjectName}: ${mood.fact}` : ''}`;
  const open = { clickAction: 'OPEN_URI' as const, clickActionData: { uri: 'philosophize://' } };

  if (L.mode === 'strip') {
    return (
      <FlexWidget {...open} accessibilityLabel={label} style={{ width: 'match_parent', height: 'match_parent', backgroundColor: hex(W.bg), borderRadius: RADIUS, flexDirection: 'row', alignItems: 'center', paddingHorizontal: PAD }}>
        <SvgWidget svg={svg('flame', flameColor)} style={{ width: 22, height: 22, marginRight: 2 }} />
        <TextWidget text={String(mood.streak)} style={{ fontSize: 30, fontWeight: '600', color: hex(W.on), marginRight: 14 }} />
        <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
          <TextWidget text={mood.status} maxLines={1} style={{ fontSize: 14, fontWeight: '700', color: hex(statusColor) }} />
          {L.line ? <TextWidget text={mood.line} maxLines={1} style={{ fontSize: T.line.size, color: hex(W.soft), marginTop: 2 }} /> : null}
        </FlexWidget>
      </FlexWidget>
    );
  }

  if (L.mode === 'glance') {
    return (
      <FlexWidget {...open} accessibilityLabel={label} style={{ width: 'match_parent', height: 'match_parent', backgroundColor: hex(W.bg), borderRadius: Math.round(Math.min(w, h) * 0.32), flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: PAD }}>
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SvgWidget svg={svg('flame', flameColor)} style={{ width: 30, height: 30, marginRight: 4 }} />
          <TextWidget text={String(mood.streak)} style={{ fontSize: T.glanceHero.size, fontWeight: '600', color: hex(W.on) }} />
        </FlexWidget>
        <TextWidget text="day streak" style={{ fontSize: 12, fontWeight: '600', color: hex(W.soft), marginTop: 2 }} />
        <TextWidget text={mood.status} maxLines={1} style={{ fontSize: 12.5, fontWeight: '700', color: hex(statusColor), marginTop: 6 }} />
        {L.week ? (
          <FlexWidget style={{ width: 'match_parent', marginTop: 10, paddingHorizontal: 6 }}>
            <Week week={mood.week} disc={11} letters={false} />
          </FlexWidget>
        ) : null}
      </FlexWidget>
    );
  }

  return (
    <FlexWidget {...open} accessibilityLabel={label} style={{ width: 'match_parent', height: 'match_parent', backgroundColor: hex(W.bg), borderRadius: RADIUS, flexDirection: 'column', padding: PAD }}>
      {/* The status and his line, and the streak, big, where Weather puts the temperature. */}
      <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', alignItems: 'flex-start' }}>
        <FlexWidget style={{ width: Math.floor(L.leftW), flexDirection: 'column' }}>
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SvgWidget svg={svg(statusIcon, statusColor)} style={{ width: 18, height: 18, marginRight: 6 }} />
            <TextWidget text={mood.status} maxLines={1} style={{ fontSize: T.status.size, fontWeight: '700', color: hex(statusColor) }} />
          </FlexWidget>
          {L.lineLines ? (
            <TextWidget text={mood.line} maxLines={L.lineLines} style={{ fontSize: T.line.size, color: hex(W.soft), marginTop: 3 }} />
          ) : null}
        </FlexWidget>
        <FlexWidget style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
          <SvgWidget svg={svg('flame', flameColor)} style={{ width: T.heroFlame, height: T.heroFlame, marginRight: 2 }} />
          <TextWidget text={String(mood.streak)} style={{ fontSize: T.hero.size, fontWeight: '600', color: hex(W.on) }} />
        </FlexWidget>
      </FlexWidget>
      <FlexWidget style={{ flex: 1 }} />
      {/* The week, Monday first, like Weather's hourly row. */}
      <FlexWidget style={{ width: 'match_parent', backgroundColor: hex(W.pill), borderRadius: 18, paddingVertical: WEEK.padY, paddingHorizontal: WEEK.padX }}>
        <Week week={mood.week} disc={WEEK.disc} />
      </FlexWidget>
      {/* The day's subject and its fact, whole or not at all. */}
      {L.factLines ? (
        <FlexWidget style={{ width: 'match_parent', marginTop: GAP, backgroundColor: hex(W.pill), borderRadius: 16, paddingVertical: FACT.padY, paddingHorizontal: FACT.padX, flexDirection: 'row', alignItems: 'center' }}>
          <SvgWidget svg={svg(mood.subject as IconName, markFor(subjectHue))} style={{ width: FACT.icon, height: FACT.icon, marginRight: FACT.gap }} />
          <TextWidget text={mood.fact} maxLines={L.factLines} style={{ width: Math.floor(L.factW), fontSize: T.fact.size, color: hex(W.on) }} />
        </FlexWidget>
      ) : null}
    </FlexWidget>
  );
}
