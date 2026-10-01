import type { ImageSourcePropType } from 'react-native';
import { PROFILE_SCENE_ART } from '@/components/shared/profileSceneArt';

// The picture someone wears. ONE choice drives their avatar, the top of Profile
// and the masthead on Home, which is why each place has to work three ways: as a
// ~76px circle, as a full-width band behind their name, and as a short strip
// behind the wordmark.
//
// ─────────────────────────────────────────────────────────────────────────────
// SINCE 2026-10-01 THE PICTURES ARE DRAWN, NOT FOUND.
//
// They were ten engravings and photographs from Commons, the last found pictures in
// an app whose every other picture is drawn. The owner asked for "created ones that
// resemble the art style of the app", and they are ten places in the Quick Start's
// editorial style (components/shared/profileScenes.ts), each built from a reference
// photograph looked at first.
//
// THE IDS DID NOT CHANGE, and that is deliberate: `profileBackground` is stored on
// every reader and synced, so a new id would reset everybody's choice. Each old id
// names the new place nearest the picture it replaced — the-tower is a lighthouse,
// stone-bridge a stone arch, night-spiral a moonlit lake, woodcut-sky (everybody's
// default) the open sea.
//
// TO CHANGE ONE: edit profileScenes.ts, then `npm run make:profile-art`.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kept for the callers that still ask. Every drawn place stands on a DARK ground and
 * the words always sit on that ground, so every place is `dark`: paper text, never
 * ink. It is no longer measured off a picture because nothing is laid on the art.
 */
export type Tone = 'light' | 'dark';

export interface ProfileBackground {
  id: string;
  /** Shown under the swatch in the picker. */
  name: string;
  tone: Tone;
  /** The top of the sky, painted above the picture in a box taller than it. */
  sky: string;
  /** The ground the words stand on, painted below the picture. */
  ground: string;
  /** What the avatar circle is centred on, in the scene's canvas units. */
  focus: { x: number; y: number };
}

export const PROFILE_BACKGROUNDS: ProfileBackground[] = Object.entries(PROFILE_SCENE_ART).map(([id, s]) => ({
  id,
  name: s.name,
  tone: 'dark' as const,
  sky: s.sky,
  ground: s.ground,
  focus: s.focus,
}));

/** The open sea — what every new profile starts as. */
export const DEFAULT_BACKGROUND_ID = 'woodcut-sky';

export function backgroundById(id: string | null | undefined): ProfileBackground {
  return (
    PROFILE_BACKGROUNDS.find((b) => b.id === id) ??
    PROFILE_BACKGROUNDS.find((b) => b.id === DEFAULT_BACKGROUND_ID) ??
    PROFILE_BACKGROUNDS[0]
  );
}

/** The drawn picture's file. */
export function backgroundSource(id: string | null | undefined): ImageSourcePropType | null {
  return PROFILE_SCENE_ART[backgroundById(id).id]?.source ?? null;
}

export const HAS_PROFILE_ART = Object.keys(PROFILE_SCENE_ART).length > 0;

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
  /** A wash for a box that lays words on the art itself. The drawn places never need it. */
  scrim: [string, string];
  /** Colour shown while the image loads. */
  base: string;
}

// The muted colour is measured: `scripts/check-profile-contrast.mjs` holds the name
// at 7:1 and this line at 4.5:1 against every place's ground.
export function tonePalette(tone: Tone): TonePalette {
  return tone === 'dark'
    ? {
        text: Paper,
        muted: '#D8D5CC',
        line: Paper,
        avatarFill: 'rgba(0,0,0,0.45)',
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
