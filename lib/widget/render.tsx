import React from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudyWidget } from '@/components/widget/StudyWidget';
import { widgetMood, type WidgetInput } from './mood';
import { WIDGET_FACTS } from '@/data/widgetFacts';
import { getSubject } from '@/data/subjects';

// Single source of truth for what the home-screen widget shows. Used by the
// headless widget task AND by every in-app refresh, so the two cannot drift.

const USERDATA_KEY = 'philosophize-userdata';
// Must match the widget "name" in app.json, useWidgetPlaced and pinWidget.
export const WIDGET_NAME = 'QuoteOfTheDay';

/** What the widget is worked out from — the streak, the last lesson day, rest days
 *  held and the days studied — read straight from the persisted store, so the
 *  headless task needs no app running. */
async function readInput(now: Date): Promise<WidgetInput> {
  try {
    const raw = await AsyncStorage.getItem(USERDATA_KEY);
    const s = raw ? JSON.parse(raw)?.state ?? {} : {};
    const n = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : 0);
    return {
      now,
      streak: n(s.streak),
      lastLessonDate: typeof s.lastLessonDate === 'string' ? s.lastLessonDate : null,
      restHeld: Math.max(0, n(s.restDaysEarned) - n(s.restDaysUsed)),
      activeDays: Array.isArray(s.activeDays) ? s.activeDays.filter((d: unknown) => typeof d === 'string') : [],
      restDays: Array.isArray(s.restDays) ? s.restDays.filter((d: unknown) => typeof d === 'string') : [],
    };
  } catch {
    return { now, streak: 0, lastLessonDate: null, restHeld: 0 };
  }
}

export async function buildHomeWidget(size?: { width: number; height: number }): Promise<React.ReactElement> {
  const mood = widgetMood(await readInput(new Date()), WIDGET_FACTS);
  const subject = getSubject(mood.subject);
  return (
    <StudyWidget
      mood={mood}
      subjectName={subject?.short ?? 'Did you know'}
      subjectHue={subject?.hue ?? '#2A4343'}
      width={size?.width ?? 250}
      height={size?.height ?? 110}
    />
  );
}

// Ask Android to re-render the widget now (best-effort; never throws, no-op off
// Android or when no widget is placed). Call after anything it shows changes: a
// lesson finished, or the app coming up.
export async function refreshHomeWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    type Info = { width: number; height: number };
    requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: (info: Info) => buildHomeWidget(info),
      widgetNotFound: () => {},
    });
  } catch {}
}
