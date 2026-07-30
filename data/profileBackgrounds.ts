import type { ImageSourcePropType } from 'react-native';

// The art someone can wear on their profile. ONE choice drives BOTH their
// picture and their header background, which is why each image has to work
// twice: as a ~72px circle and as a full-width band behind live text.
//
// ─────────────────────────────────────────────────────────────────────────────
// HOW TO ADD OR REPLACE AN IMAGE
//   1. Drop the file in  assets/images/profile/  (see DROP-IMAGES-HERE.md).
//   2. Add its require() to SOURCES below, keyed by id.
//   3. Add a line to assets/images/profile/CREDITS.txt — source + licence + URL,
//      the same way assets/story/existence/CREDITS.txt does it.
//   4. Run  node scripts/check-profile-contrast.mjs  and take the `tone` it
//      reports. Do NOT eyeball it (see the note on `tone`).
//
// An id with no entry in SOURCES renders a procedural ink wash instead, so the
// app always builds and always looks finished — the same arrangement
// components/lesson/lessonBackgrounds.ts uses.
// ─────────────────────────────────────────────────────────────────────────────

export type Tone = 'light' | 'dark';

export interface ProfileBackground {
  id: string;
  /** Shown under the swatch in the picker. */
  name: string;
  /**
   * What the ART is, which decides what colour the text on top becomes: a
   * `light` image gets ink text over a paper wash, a `dark` one gets paper text
   * over an ink wash.
   *
   * This is MEASURED, not judged. Several of these images read "dark" to the eye
   * because they are dense with black line-work while being overwhelmingly white
   * paper by area — and it is the area that decides whether white text survives.
   * `scripts/check-profile-contrast.mjs` computes the mean luminance of the exact
   * band the text occupies and prints the tone to use.
   */
  tone: Tone;
  /**
   * Where to centre the avatar crop, in 0–1 of the image. The header shows the
   * whole width; the avatar shows a circle, so the subject has to be aimed at.
   */
  focus: { x: number; y: number };
}

/**
 * Registered image files. Empty entries fall back to the procedural wash.
 * Keys must match an id in PROFILE_BACKGROUNDS.
 */
const SOURCES: Partial<Record<string, ImageSourcePropType>> = {
  'night-spiral': require('@/assets/images/profile/01-night-spiral.jpg'),
  'sunburst': require('@/assets/images/profile/02-sunburst.jpg'),
  'woodcut-sky': require('@/assets/images/profile/03-woodcut-sky.jpg'),
  'the-peak': require('@/assets/images/profile/04-the-peak.jpg'),
  'the-range': require('@/assets/images/profile/05-the-range.jpg'),
  'rain-field': require('@/assets/images/profile/06-rain-field.jpg'),
  'small-house': require('@/assets/images/profile/07-small-house.jpg'),
  'the-tower': require('@/assets/images/profile/08-the-tower.jpg'),
  'stone-bridge': require('@/assets/images/profile/09-stone-bridge.jpg'),
  'the-ruins': require('@/assets/images/profile/10-the-ruins.jpg'),
};

export const PROFILE_BACKGROUNDS: ProfileBackground[] = [
  { id: 'night-spiral', name: 'The Wanderer', tone: 'dark', focus: { x: 0.5, y: 0.62 } },
  // Reads as a dark picture and is not one: measured mean luminance 0.27, because
  // the black cloudbanks sit around a large bright sun. Ink text, not paper.
  { id: 'sunburst', name: 'Break in the Clouds', tone: 'light', focus: { x: 0.5, y: 0.4 } },
  { id: 'woodcut-sky', name: 'Woodcut Sky', tone: 'light', focus: { x: 0.5, y: 0.5 } },
  { id: 'the-peak', name: 'The Peak', tone: 'light', focus: { x: 0.5, y: 0.45 } },
  { id: 'the-range', name: 'The Range', tone: 'light', focus: { x: 0.5, y: 0.5 } },
  { id: 'rain-field', name: 'Weather', tone: 'light', focus: { x: 0.5, y: 0.45 } },
  { id: 'small-house', name: 'The Small House', tone: 'light', focus: { x: 0.42, y: 0.62 } },
  { id: 'the-tower', name: 'The Tower', tone: 'light', focus: { x: 0.5, y: 0.5 } },
  { id: 'stone-bridge', name: 'The Crossing', tone: 'light', focus: { x: 0.5, y: 0.5 } },
  { id: 'the-ruins', name: 'The Ruins', tone: 'light', focus: { x: 0.5, y: 0.5 } },
];

/** The woodcut cloud engraving — what every new profile starts as. */
export const DEFAULT_BACKGROUND_ID = 'woodcut-sky';

export function backgroundById(id: string | null | undefined): ProfileBackground {
  return (
    PROFILE_BACKGROUNDS.find((b) => b.id === id) ??
    PROFILE_BACKGROUNDS.find((b) => b.id === DEFAULT_BACKGROUND_ID) ??
    PROFILE_BACKGROUNDS[0]
  );
}

/** null when the file has not been registered yet — caller draws the wash. */
export function backgroundSource(id: string | null | undefined): ImageSourcePropType | null {
  return SOURCES[backgroundById(id).id] ?? null;
}

/** True once at least one image file is actually registered. */
export const HAS_PROFILE_ART = Object.keys(SOURCES).length > 0;

// ── the palette a tone implies ───────────────────────────────────────────────
// Kept here rather than in the screen so the header, the avatar and the picker
// swatches cannot drift apart.

const Paper = '#FAFAF7';
const Ink = '#1A1A1A';

export interface TonePalette {
  /** Name, rank chip, quote. */
  text: string;
  /** Subtitle, attributions — the quieter line. */
  muted: string;
  /** Borders: avatar ring, rank chip. */
  line: string;
  /** Fill behind the avatar so a letter always has something to sit on. */
  avatarFill: string;
  /** The wash laid over the art to guarantee the contrast. */
  scrim: [string, string];
  /** Colour shown while the image loads, and behind a transparent PNG. */
  base: string;
}

// The MUTED colours here are set by measurement, not by taste. The subtitle and
// the quote attribution are small text, so WCAG asks 4.5:1 of them, and the
// original mid-greys (#5A574E / #C9C6BD) came in at 3.7–4.4 over half of the
// artwork — readable-ish on a desk, not readable on a phone in daylight.
// Darkening the light-tone grey and lightening the dark-tone one buys the
// contrast without touching the scrim, which is the right trade: a heavier scrim
// buys the same contrast by hiding the picture the user chose.
// Re-run scripts/check-profile-contrast.mjs after changing any value here.
export function tonePalette(tone: Tone): TonePalette {
  return tone === 'dark'
    ? {
        text: Paper,
        muted: '#DCD9D0',
        line: Paper,
        avatarFill: 'rgba(0,0,0,0.45)',
        // Lighter at the top so the art still reads, heavier where the quote sits.
        scrim: ['rgba(12,12,12,0.34)', 'rgba(12,12,12,0.78)'],
        base: Ink,
      }
    : {
        text: Ink,
        muted: '#45423A',
        line: Ink,
        avatarFill: 'rgba(255,255,255,0.55)',
        scrim: ['rgba(250,250,247,0.42)', 'rgba(250,250,247,0.86)'],
        base: '#EFEADC',
      };
}
