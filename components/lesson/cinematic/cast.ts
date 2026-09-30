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
// All four are Chirp 3 HD voices from the same Google project and the same free
// monthly allowance, and every request goes through the character ledger.
//
// EACH ONE IS A CHARACTER, NOT ONLY A VOICE (AP14, the owner, 2026-09-30). The
// `character` line below is what a script is written FROM: the same fact said by the
// kind one, the needling one and the one who has missed the point is three different
// lines, and a line that could be given to any of the four belongs to none of them.
//
// AND A LESSON CASTS AS MANY AS IT NEEDS, NOT ALL FOUR (AP13): two is a lesson, three
// is a lesson, four is a lot of people to stage and is for the lesson that wants it.
//
// ZERO IMPORTS, like rig.ts and tone.ts, so the scripts read it in plain Node.

export type Speaker = 'tophat' | 'cap' | 'plain' | 'bun';

export const SPEAKERS: readonly Speaker[] = ['tophat', 'cap', 'plain', 'bun'];

export interface Voice {
  /** Google's voice name, exactly as the Text-to-Speech API takes it. */
  name: string;
  languageCode: string;
  /**
   * Chirp 3 HD `speakingRate`: 1 is the voice's own pace. Each is set so a FIRST take
   * lands near a person's 4.5 syllables a second of speech (AP16): measured on the seven
   * first lessons, all four voices ran at 4.7–5.4 at their old rates, the cap fastest.
   */
  rate: number;
}

export interface CastMember {
  /** The wardrobe costume id this speaker always wears (wardrobe.ts COSTUMES). */
  costume: 'magistrate' | 'stroller' | 'plain' | 'bun';
  /** What the face tag is read out as to a screen reader. */
  label: string;
  voice: Voice;
  /** The one word the owner gave this person (AP14). */
  trait: 'teaching' | 'kind' | 'passive-aggressive' | 'oblivious';
  /** How that sounds in a line — what a script writer reads before writing theirs. */
  character: string;
}

export const CAST: Record<Speaker, CastMember> = {
  // The economist. A touch slower than his own default: he is the one explaining.
  tophat: {
    costume: 'magistrate', label: 'Top hat', voice: { name: 'en-GB-Chirp3-HD-Algieba', languageCode: 'en-GB', rate: 0.9 },
    trait: 'teaching',
    character: 'The teacher. He explains, as a story rather than a lecture: he names the idea the others have just walked into, and says why it matters. Patient, precise, a little amused.',
  },
  // The stall-holder. Chosen by Claude on 2026-09-29: a newsboy cap reads as a
  // working man at a glance and cannot be mistaken for the top hat.
  cap: {
    costume: 'stroller', label: 'Cap', voice: { name: 'en-AU-Chirp3-HD-Zubenelgenubi', languageCode: 'en-AU', rate: 0.86 },
    trait: 'kind',
    character: 'The kind one. He assumes the best of everybody, helps before he is asked, and takes a loss without complaint — which is often exactly what the lesson needs somebody to do.',
  },
  // The mascot, undressed — the reader's stand-in.
  plain: {
    costume: 'plain', label: 'Plain', voice: { name: 'en-GB-Chirp3-HD-Sadachbia', languageCode: 'en-GB', rate: 0.92 },
    trait: 'passive-aggressive',
    character: 'The passive-aggressive one. Polite on the surface and pointed underneath: faint praise, a dry aside, "no, no, it is fine". He needles the OTHER CHARACTERS and the situation — never the reader, and never how clever somebody is (§7).',
  },
  // The fourth voice (2026-09-30): an American woman. A low hair bun is all she
  // wears — nothing is drawn on a stickman's body (wardrobe.ts BUN).
  bun: {
    costume: 'bun', label: 'Bun', voice: { name: 'en-US-Chirp3-HD-Kore', languageCode: 'en-US', rate: 0.92 },
    trait: 'oblivious',
    character: 'The oblivious one. Cheerful, and one step behind: she misses the point, takes the figure of speech literally, and asks the question the reader was too polite to ask. Never stupid — her wrong turn is the one the lesson is about to correct.',
  },
};

/** The voice every lesson that is NOT a dialogue lesson is read in. */
export const NARRATOR_VOICE: Voice = { name: 'en-GB-Chirp3-HD-Algieba', languageCode: 'en-GB', rate: 1 };

/** The voice a beat is spoken in. */
export function voiceFor(speaker: Speaker | undefined): Voice {
  return speaker ? CAST[speaker].voice : NARRATOR_VOICE;
}
