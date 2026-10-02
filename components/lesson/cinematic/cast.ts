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
// EACH ONE IS A CHARACTER, NOT ONLY A VOICE (AP14, the owner, 2026-09-30; who each
// one is lives in LESSON_RULES group AS, rewritten by the owner 2026-10-02). The
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
   * lands near the even pace, 5.3 syllables a second of speech (AP17): raised twice on 2026-10-01
   * by what each voice measured below that on the fourteen voiced dialogue lessons.
   */
  rate: number;
}

export interface CastMember {
  /** The wardrobe costume id this speaker always wears (wardrobe.ts COSTUMES). */
  costume: 'magistrate' | 'stroller' | 'plain' | 'bun';
  /** What the face tag is read out as to a screen reader. */
  label: string;
  voice: Voice;
  /** The words the owner gave this person — each named in an AS heading of LESSON_RULES. */
  trait: 'irritable-teacher' | 'kind-helpful' | 'vain-passive-aggressive' | 'oblivious';
  /** How that sounds in a line — what a script writer reads before writing theirs. */
  character: string;
}

export const CAST: Record<Speaker, CastMember> = {
  // The economist. A touch slower than his own default: he is the one explaining.
  tophat: {
    costume: 'magistrate', label: 'Top hat', voice: { name: 'en-GB-Chirp3-HD-Algieba', languageCode: 'en-GB', rate: 1.06 },
    trait: 'irritable-teacher',
    character: 'The irritable teacher (AS2). He still names the idea the others have just walked into and says why it matters, precisely — but they try his patience and he lets it show: a curt correction at being interrupted or made to say it twice, a weary sigh put into words, a deadpan put-down with the gravity of a funeral. Grumpy, never vain: his jokes are about THEM and the mess they are making, never about himself, and the idea always lands.',
  },
  // The stall-holder. Chosen by Claude on 2026-09-29: a newsboy cap reads as a
  // working man at a glance and cannot be mistaken for the top hat.
  cap: {
    costume: 'stroller', label: 'Cap', voice: { name: 'en-AU-Chirp3-HD-Zubenelgenubi', languageCode: 'en-AU', rate: 0.99 },
    trait: 'kind-helpful',
    character: 'The kind and helpful one (AS4). He assumes the best of everybody and helps before he is asked: fetches the thing, shows the step, offers to go first, and says what the top hat meant again in plainer words for whoever missed it. He smooths things over when the other two get sharp, takes a loss without complaint, and is never sarcastic — not once.',
  },
  // The mascot, undressed — the reader's stand-in.
  plain: {
    costume: 'plain', label: 'Plain', voice: { name: 'en-GB-Chirp3-HD-Sadachbia', languageCode: 'en-GB', rate: 1.07 },
    trait: 'vain-passive-aggressive',
    character: 'The vain, passive-aggressive one (AS3). Polite on the surface and pointed underneath — faint praise, "no, no, it is fine" — with a LEGO Batman ego: he is the hero of his own story, narrates himself as a legend with a straight face, claims he knew it all along, takes the credit, and sulks for a line when somebody else is right. His humour is about HIMSELF. He needles the other characters and the situation — never the reader, and never how clever somebody is (§7).',
  },
  // The fourth voice (2026-09-30): an American woman. A low hair bun is all she
  // wears — nothing is drawn on a stickman's body (wardrobe.ts BUN).
  bun: {
    costume: 'bun', label: 'Bun', voice: { name: 'en-US-Chirp3-HD-Kore', languageCode: 'en-US', rate: 1.06 },
    trait: 'oblivious',
    character: 'The oblivious one (AS5). Cheerful, and one step behind: she misses the point, takes the figure of speech literally, and asks the question the reader was too polite to ask. Never stupid — her wrong turn is the one the lesson is about to correct.',
  },
};

/** The voice every lesson that is NOT a dialogue lesson is read in. */
export const NARRATOR_VOICE: Voice = { name: 'en-GB-Chirp3-HD-Algieba', languageCode: 'en-GB', rate: 1 };

/** The voice a beat is spoken in. */
export function voiceFor(speaker: Speaker | undefined): Voice {
  return speaker ? CAST[speaker].voice : NARRATOR_VOICE;
}
