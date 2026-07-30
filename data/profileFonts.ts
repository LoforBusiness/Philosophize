// The ten faces someone can set their own name in.
//
// Six were already loaded for the app's own typography and cost nothing extra;
// four (Cinzel, UnifrakturMaguntia, Special Elite, Abril Fatface) were added for
// this picker alone, because four near-identical antique serifs do not read as
// "ten different fonts" to anybody actually choosing one.
//
// Every entry is loaded in `app/_layout.tsx`. A face that is listed here but not
// loaded there falls back to the system font silently — which looks like a bug
// and is not one, so keep the two lists together.

export interface ProfileFont {
  id: string;
  /** Shown in the picker. */
  name: string;
  /** The loaded family name. */
  family: string;
  /** Some faces only look right shouting; others only look right speaking. */
  transform: 'uppercase' | 'none';
  /**
   * Optical size correction. A blackletter cap-height and a geometric sans
   * cap-height at the same point size are not the same size to the eye, so each
   * face carries the multiplier that makes it sit like the others.
   */
  scale: number;
  /**
   * Letter-spacing at display size. Inscription capitals need air; a script
   * needs none and closes up if given any.
   */
  tracking: number;
}

export const PROFILE_FONTS: ProfileFont[] = [
  // ── already in the app ────────────────────────────────────────────────────
  {
    id: 'playfair',
    name: 'Playfair',
    family: 'PlayfairDisplay_700Bold',
    transform: 'uppercase',
    scale: 1,
    tracking: 2,
  },
  {
    id: 'playfair-italic',
    name: 'Playfair Italic',
    family: 'PlayfairDisplay_700Bold_Italic',
    transform: 'none',
    scale: 1.06,
    tracking: 0.5,
  },
  {
    id: 'cormorant',
    name: 'Cormorant',
    family: 'CormorantGaramond_600SemiBold',
    transform: 'uppercase',
    scale: 1.1,
    tracking: 3,
  },
  {
    id: 'imfell',
    name: 'IM Fell',
    family: 'IMFellEnglish_400Regular',
    transform: 'none',
    scale: 1.08,
    tracking: 1,
  },
  {
    id: 'caveat',
    name: 'Caveat',
    family: 'Caveat_700Bold',
    transform: 'none',
    // Caveat's lowercase is small for its point size; it needs the most help.
    scale: 1.3,
    tracking: 0,
  },
  {
    id: 'inter',
    name: 'Inter',
    family: 'Inter_700Bold',
    transform: 'uppercase',
    scale: 0.92,
    tracking: 3,
  },

  // ── added for this picker ─────────────────────────────────────────────────
  {
    id: 'cinzel',
    name: 'Cinzel',
    family: 'Cinzel_700Bold',
    // Cinzel is a Roman inscriptional face — it has no real lowercase design.
    transform: 'uppercase',
    scale: 0.94,
    tracking: 3.5,
  },
  {
    id: 'unifraktur',
    name: 'Blackletter',
    family: 'UnifrakturMaguntia_400Regular',
    // Blackletter capitals are ornamental and unreadable in a row of them.
    transform: 'none',
    scale: 1.12,
    tracking: 0.5,
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    family: 'SpecialElite_400Regular',
    transform: 'uppercase',
    scale: 0.94,
    tracking: 1.5,
  },
  {
    id: 'abril',
    name: 'Abril',
    family: 'AbrilFatface_400Regular',
    transform: 'none',
    scale: 1,
    tracking: 0.5,
  },
];

export const DEFAULT_PROFILE_FONT = 'playfair';

export function profileFontById(id: string | null | undefined): ProfileFont {
  return PROFILE_FONTS.find((f) => f.id === id) ?? PROFILE_FONTS[0];
}

/**
 * The style a name should be drawn in at a given display size. Callers pass the
 * size they would have used for Playfair and get back the face's own corrected
 * size, so a name is the same visual weight whichever face is chosen.
 */
export function profileNameStyle(id: string | null | undefined, baseSize: number) {
  const f = profileFontById(id);
  return {
    fontFamily: f.family,
    fontSize: Math.round(baseSize * f.scale),
    letterSpacing: f.tracking,
    // Android adds 2–4px of font padding per Text, which shows as a name sitting
    // low in its own row once the faces have different scales.
    includeFontPadding: false,
  } as const;
}

export function profileNameText(id: string | null | undefined, name: string): string {
  return profileFontById(id).transform === 'uppercase' ? name.toUpperCase() : name;
}
