import React from 'react';
import { Platform } from 'react-native';
import { QuoteWidget } from '@/components/widget/QuoteWidget';
import { getRotatingQuote, todayLabel } from '@/lib/dailyQuote';
import { readPinnedQuote } from './pin';
import { readWidgetStreak } from './streak';
import { readWidgetBackground } from './background';

// Single source of truth for what the home-screen widget shows: the pinned quote
// (or the 3-hour rotation) plus the live day streak. Used by the headless widget
// task AND by every in-app refresh trigger, so the two can never drift apart.

export async function buildQuoteWidget(
  size?: { width: number; height: number }
): Promise<React.ReactElement> {
  const [pinned, streak, background] = await Promise.all([
    readPinnedQuote(),
    readWidgetStreak(),
    readWidgetBackground(),
  ]);
  const q = pinned ?? getRotatingQuote();
  return (
    <QuoteWidget
      text={q.text}
      author={q.author}
      dateLabel={todayLabel()}
      philosopherId={q.philosopherId}
      streak={streak}
      background={background}
      width={size?.width}
      height={size?.height}
    />
  );
}

// Ask Android to re-render the widget now (best-effort; never throws, no-op off
// Android or when no widget is placed). Call after anything the widget displays
// changes: streak advances, a quote is pinned/unpinned, or the app comes up.
export async function refreshQuoteWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    type Info = { width: number; height: number };
    // `renderWidget` is HANDED the widget's dimensions and this used to throw
    // them away, which is why the backdrop was letterboxed. Build per widget:
    // two widgets of different sizes want two differently-shaped scenes.
    requestWidgetUpdate({
      widgetName: 'QuoteOfTheDay',
      renderWidget: (info: Info) => buildQuoteWidget(info),
      widgetNotFound: () => {},
    });
  } catch {}
}
