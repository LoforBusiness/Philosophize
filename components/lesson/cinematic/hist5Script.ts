import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic history-foundations-5, "On Trial in Athens" — the fifth lesson on the
// History road, a DIALOGUE lesson (LESSON_RULES group AP) told in FIRST PERSON (group AT).
// Theme: AN ATHENIAN LAW COURT, A WATER CLOCK, AND FIVE HUNDRED JURORS.
//
// The reader IS the man in the cap (cast.ts: kind, Australian). He wakes in his own
// bedroom, hears a crowd, opens the door and walks into a law court in ancient Athens,
// where the plain one (vain, and harsher than anywhere else in the app on the owner's
// word, 2026-10-03) is prosecuting him. The jurors watch, murmur, laugh and vote; they
// never speak. Nobody narrates.
//
// A FOUNDATION LESSON (AP3), three ideas: jurors were ordinary citizens picked by
// lottery, so nobody could bribe them · you spoke for yourself, with a water clock
// giving both sides the same time · the jurors voted in secret with bronze discs, and a
// tie set the defendant free.
//
// THE READER ANSWERS BY SPEAKING (AT4): each graded question offers two replies; the one
// tapped is then SAID by the cap on a beat of its own, and the plain one answers it. The
// replies, his answers to them and the verdict are BRANCHES (AT5): `when` picks the beat.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14; group AS), and read at the pace its words ask for (AP17).
// ─────────────────────────────────────────────────────────────────────────────

export interface Hist5Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it, all seen through his eyes):
   * wake — black, then his eyelids flicker open on his bedroom ceiling and drop to the room ·
   * room — he looks down at his hands, turns them over, and looks round the room to the door ·
   * door — he walks to the door and puts his hand on the handle ·
   * open — the door swings open onto sunlight: the court, the jurors on their benches, and the plain one centre stage, arms wide ·
   * what — his hands come up, open, as he walks out into the court ·
   * charge — the plain one paces in front of him, hands behind his back ·
   * jury — the plain one sweeps a hand along the jurors; the view follows it along the benches ·
   * straws — he looks along the benches himself, and back ·
   * why — the plain one walks right up to him and leans in ·
   * reply — his hand comes up, palm open, as he answers ·
   * sour — the plain one straightens, sour, and turns away ·
   * gloat — the plain one throws his head back and laughs, and points at him ·
   * clock — the plain one walks to the water clock and pulls its plug; water runs ·
   * asks — he looks at the water clock, a hand toward it ·
   * prove — the plain one turns back to him, arms folded ·
   * defend — he turns to the jurors, both hands open ·
   * vote — the plain one holds up two bronze discs; the jurors file to the urns ·
   * verdict — the plain one reads the count at the urn ·
   * sleep — his eyelids close; black ·
   * rest — black, under the quotation.
   */
  act?: 'wake' | 'room' | 'door' | 'open' | 'what' | 'charge' | 'jury' | 'straws' | 'why' | 'reply' | 'sour' | 'gloat'
    | 'clock' | 'asks' | 'prove' | 'defend' | 'vote' | 'verdict' | 'sleep' | 'rest';
  /** Which verdict the urn shows on a `verdict` beat: free, a tie, or guilty. */
  verdict?: 'free' | 'tie' | 'guilty';
  /** The first graded question: two replies, said out loud. */
  lot?: boolean;
  /** The second graded question: two replies, said out loud. */
  fair?: boolean;
}

export const BEATS: Hist5Beat[] = [
  {
    act: 'wake',
    speaker: 'cap',
    text: 'Ugh. What time is it? I don’t even remember falling asleep.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'room', bed: 'muffled',
    speaker: 'cap',
    text: 'Wait. My lamp, my poster, my hands. So why can I hear a crowd outside?',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'door', voiceAfter: 2.7,
    sfx: [{ id: 'steps', at: 'lead', gain: 0.9 }],
    speaker: 'cap',
    text: 'Hello? Is somebody out there? I’m coming out, alright?',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    act: 'open', bed: 'court', voiceAfter: 2.6,
    sfx: [{ id: 'door', at: 'lead' }, { id: 'laugh', at: 'tail', gain: 0.85 }],
    speaker: 'plain',
    text: 'At last! Citizens of Athens, the defendant has finally woken up.',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    act: 'what',
    speaker: 'cap',
    text: 'Defendant? Mate, I’ve just got out of bed. What am I supposed to have done?',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    act: 'charge',
    speaker: 'plain',
    text: 'You wandered into Athens uninvited, and you’re suspiciously nice to everyone. I’m prosecuting you myself.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'jury',
    speaker: 'plain',
    text: 'Here, any citizen can bring a case. And look who’s judging you: five hundred ordinary men, picked by lottery this morning.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'straws',
    speaker: 'cap',
    text: 'No judge at all? Just a crowd of strangers who drew straws?',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'why',
    speaker: 'plain',
    text: 'Yes. Since you’re so curious, tell the court. Why a lottery?',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    lot: true, go: 0.9,
    interact: {
      prompt: 'Why does Athens pick its jurors by lottery?',
      explain: 'Nobody knew who would sit until that morning, so nobody could bribe the jury in advance.',
      cards: [{ text: 'So nobody can bribe them', correct: true }, { text: 'So the cleverest get picked', correct: false }],
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'reply', when: { q: 1, ok: true },
    speaker: 'cap',
    text: 'If nobody knows who’s judging until this morning, nobody can bribe them. That’s clever.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'reply', when: { q: 1, ok: false },
    speaker: 'cap',
    text: 'So the cleverest people end up on the jury? That seems sensible to me.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'sour', when: { q: 1, ok: true },
    sfx: [{ id: 'murmur', at: 'tail', gain: 0.8 }],
    speaker: 'plain',
    text: 'Correct. How disappointing. I was looking forward to watching you fail.',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    act: 'gloat', when: { q: 1, ok: false },
    sfx: [{ id: 'laugh', at: 'tail' }],
    speaker: 'plain',
    text: 'A lottery picks the clever ones? You absolute turnip, it’s so nobody can bribe them!',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    act: 'clock',
    sfx: [{ id: 'pour', at: 'tail', gain: 0.9 }],
    speaker: 'plain',
    text: 'Now defend yourself. No lawyer will save you here: you speak for yourself, and this water clock times you.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'asks',
    speaker: 'cap',
    text: 'A clock made of water? And does it time you as well?',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    act: 'prove',
    speaker: 'plain',
    text: 'Sadly, yes. Now prove you were listening, if you can.',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    fair: true, go: 0.9,
    interact: {
      prompt: 'Why do both sides get the same water clock?',
      explain: 'Each side gets the same water, so the same time to speak. Nobody can talk for longer than the other.',
      cards: [{ text: 'So the jury leaves early', correct: false }, { text: 'So the time is fair', correct: true }],
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'reply', when: { q: 2, ok: true },
    speaker: 'cap',
    text: 'Same water for both of us, so neither of us gets longer to talk. That’s fair.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'reply', when: { q: 2, ok: false },
    speaker: 'cap',
    text: 'So the jury can get home for dinner? Fair enough, they look hungry.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'sour', when: { q: 2, ok: true },
    sfx: [{ id: 'murmur', at: 'tail', gain: 0.8 }],
    speaker: 'plain',
    text: 'Correct again. Do you practise being this annoying?',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    act: 'gloat', when: { q: 2, ok: false },
    sfx: [{ id: 'laugh', at: 'tail' }],
    speaker: 'plain',
    text: 'Dinner? It’s so the time is fair, you hopeless lump. Equal water, equal time.',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    act: 'defend',
    sfx: [{ id: 'drip', at: 'tail' }],
    speaker: 'cap',
    text: 'Look, I don’t know how I got here. But I’ve been polite all morning, and he’s been rude, so you decide.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'vote',
    sfx: [{ id: 'discs', at: 'tail' }],
    speaker: 'plain',
    text: 'Jurors, your discs: hollow means guilty, solid means innocent. Into the bronze urn with them.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'verdict', verdict: 'free', when: { score: 2 },
    sfx: [{ id: 'cheer', at: 'tail' }],
    speaker: 'plain',
    text: 'Three hundred solid discs: not guilty. I hate this city.',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    act: 'verdict', verdict: 'tie', when: { score: 1 },
    sfx: [{ id: 'cheer', at: 'tail', gain: 0.7 }],
    speaker: 'plain',
    text: 'Two hundred and fifty each way: a tie, and a tie means you go free. Ridiculous rule.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'verdict', verdict: 'guilty', when: { score: 0 },
    sfx: [{ id: 'gasp', at: 'tail' }],
    speaker: 'plain',
    text: 'Three hundred hollow discs. Guilty! Oh, this is the best day of my life.',
    pace: 'brisk',
    dur: 2.0,
  },
  {
    act: 'sleep', bed: null,
    speaker: 'cap',
    text: 'Right. I’m going back to bed. Wake me up when it’s a normal day.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'rest',
    quote: {
      id: 'lq-history-foundations-5-1',
      text: 'When it is a question of settling private disputes, everyone is equal before the law.',
      author: 'Pericles',
      work: 'Funeral Oration, in Thucydides',
      era: 'c. 431 BC',
      branchSlugs: ['history'],
    },
    dur: 3.0,
  },
  {
    summary: {
      title: 'On Trial in Athens',
      points: [
        'Jurors were picked by lottery, so nobody could bribe them',
        'You spoke for yourself, timed by a water clock',
        'Jurors voted in secret with bronze discs',
      ],
      closing: 'Next time you see a jury, remember who did it first.',
    },
    dur: 2.8,
  },
];
