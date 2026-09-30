// THE CAST OF A DIALOGUE LESSON — who speaks, what they wear, and whose voice it is.
//
// A dialogue lesson (LESSON_RULES group AP) has no narrator under the stage: the
// stickmen ARE the speakers. Each beat that speaks names its `speaker`, the player
// shows that speaker's face beside the words, and the line is rendered in that
// speaker's voice. Nothing else says which voice a line gets:
//
//   · a voice is locked to a costume (AP2), so the Top Hat always sounds like Algieba
//     and the plain mascot always sounds like Sadachbia, lesson after lesson;
//   · no line names a voice itself — scripts/render-narration.mjs reads it from here,
//     and scripts/install-narration.mjs refuses a take recorded in any other.
//
// All three are Chirp 3 HD voices from the same Google project and the same free
// monthly allowance, and every request goes through the character ledger.
//
// ZERO IMPORTS, like rig.ts and tone.ts, so the scripts read it in plain Node.

export type Speaker = 'tophat' | 'cap' | 'plain';

export const SPEAKERS: readonly Speaker[] = ['tophat', 'cap', 'plain'];

export interface Voice {
  /** Google's voice name, exactly as the Text-to-Speech API takes it. */
  name: string;
  languageCode: string;
  /** Chirp 3 HD `speakingRate`: 1 is the voice's own pace. */
  rate: number;
}

export interface CastMember {
  /** The wardrobe costume id this speaker always wears (wardrobe.ts COSTUMES). */
  costume: 'magistrate' | 'stroller' | 'plain';
  /** What the face tag is read out as to a screen reader. */
  label: string;
  voice: Voice;
}

export const CAST: Record<Speaker, CastMember> = {
  // The economist. A touch slower than his own default: he is the one explaining.
  tophat: { costume: 'magistrate', label: 'Top hat', voice: { name: 'en-GB-Chirp3-HD-Algieba', languageCode: 'en-GB', rate: 0.95 } },
  // The stall-holder. Chosen by Claude on 2026-09-29: a newsboy cap reads as a
  // working man at a glance and cannot be mistaken for the top hat.
  cap: { costume: 'stroller', label: 'Cap', voice: { name: 'en-AU-Chirp3-HD-Zubenelgenubi', languageCode: 'en-AU', rate: 1 } },
  // The mascot, undressed — the reader's stand-in.
  plain: { costume: 'plain', label: 'Plain', voice: { name: 'en-GB-Chirp3-HD-Sadachbia', languageCode: 'en-GB', rate: 1 } },
};

/** The voice every lesson that is NOT a dialogue lesson is read in. */
export const NARRATOR_VOICE: Voice = { name: 'en-GB-Chirp3-HD-Algieba', languageCode: 'en-GB', rate: 1 };

/** The voice a beat is spoken in. */
export function voiceFor(speaker: Speaker | undefined): Voice {
  return speaker ? CAST[speaker].voice : NARRATOR_VOICE;
}
