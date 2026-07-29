import type { ImageSourcePropType } from 'react-native';

// The picture each branch carries: behind its card on Learn, and behind the
// masthead once you are inside it. The SAME image in both places on purpose —
// it's what makes a branch recognisable a moment before you've read its name.
//
// Paired to meaning, not to tone: the lone figure belongs to Ethics because it
// is the only picture with someone in it making a choice; the town belongs to
// Political Philosophy because it is the only one with a society; the engraving
// belongs to Logic because it is the one built line by deliberate line.
//
// Relative requires (not '@/') — Metro resolves asset requires by path.
export const BRANCH_ART: Record<string, ImageSourcePropType> = {
  metaphysics: require('../assets/images/branches/metaphysics.jpg'),
  epistemology: require('../assets/images/branches/epistemology.jpg'),
  logic: require('../assets/images/branches/logic.jpg'),
  ethics: require('../assets/images/branches/ethics.jpg'),
  aesthetics: require('../assets/images/branches/aesthetics.jpg'),
  'political-philosophy': require('../assets/images/branches/political-philosophy.jpg'),
};

// The scrim laid over every one of them. This is what makes the text safe:
// the pictures range from near-black (the moon over the cliff) to almost white
// (the misty peak), so NOTHING can be read reliably off the art itself. The
// scrim ends near-solid ink wherever words sit, which fixes the contrast in
// advance instead of hoping a given picture happens to be dark enough.
//
// Same reasoning as the launch screen: decide the tone by construction, never
// per image.
export const SCRIM_TOP = 'rgba(16,15,13,0.16)';
export const SCRIM_MID = 'rgba(16,15,13,0.60)';
export const SCRIM_DEEP = 'rgba(16,15,13,0.90)';

/** Ink laid evenly over a masthead, where text is centred rather than stacked low.
 *  Lighter than it first was: at 0.62–0.86 the picture stopped being a picture —
 *  a branch whose crop happens to land on a dark band (epistemology's rock face)
 *  read as a plain black box. The text keeps its contrast from its own shadow. */
export const MAST_SCRIM: readonly [string, string, string] = [
  'rgba(16,15,13,0.40)',
  'rgba(16,15,13,0.54)',
  'rgba(16,15,13,0.70)',
];

/** Type text sitting on the scrim. */
export const ArtCream = '#F4F1EA';
export const ArtSoft = 'rgba(240,237,229,0.86)';
export const ArtFaint = 'rgba(240,237,229,0.74)';
export const ArtGold = '#C9C2B2';
