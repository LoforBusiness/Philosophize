import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic aesthetics-aesthetics-3, "Why Humans Love Music and Stories".
// Theme: A MUSIC ROOM, A PUPPET THEATRE, AN URN WITH A TAP AND AN UPRIGHT PIANO.
//
// He plays two notes on an upright piano, then pulls the cord of a puppet theatre and
// its curtains open on a tragic mask. An amphora on a wall console fills with pity and fear, and
// he opens its tap to let them go: catharsis. He pulls the cord again and the stage
// lamp lights the mask, ignorance to knowledge: recognition. A storm at sea hangs on
// the wall, an accurate image of a painful thing. At the piano the notes are sad for
// no reason, which is Schopenhauer's will; for Plato he lowers the fallboard halfway.
//
// Redrawn 2026-09-26, the third lesson of the branch in reading order. Every line,
// citation, quotation and summary point is copied from the previous script by a
// generator, word for word and beat for beat. The first question is asked on the
// stage now, the urn against the painting, where it was two cards under the figure.
// ─────────────────────────────────────────────────────────────────────────────

export interface Aes3Beat extends BaseBeat {
  /** His pose under the act. Bands per N2: <100 rig, 100+ held, 300+ played. */ p?: number;
  /** Where he stands: 130 at the theatre's cord · 276 between the urn's spigot and the piano. */ x?: number;
  /** The act across this beat's line (the scene choreographs it). */
  act?: 'music' | 'curtain' | 'fill' | 'named' | 'recognise' | 'image' | 'will' | 'plato';
  /** The theatre's curtains are open on the mask. */ open?: boolean;
  /** The urn has filled and been let out through its tap. */ drained?: boolean;
  /** The urn's plate reads CATHARSIS. */ named?: boolean;
  /** The stage lamp is lit on the mask, and the theatre's plate reads RECOGNITION. */ lit?: boolean;
  /** Q1 on the stage: the urn and the painting are the two answers. */ q1?: boolean;
  /** The piano's plate reads THE WILL. */ will?: boolean;
  /** The fallboard over the keys: 0 open · 0.5 halfway down. */ lid?: number;
  /** This beat's camera tour, over the generated one (K10); [] holds the whole room, so he is never cut off walking in. */ tour?: readonly (readonly number[])[];
}

export const BEATS: Aes3Beat[] = [
  {
    p: 158, x: 276, act: 'music',
    text: 'Every human culture on record has made music and told stories. No society studied by anthropologists lacks either.',
    dur: 2.2,
  },
  {
    p: 158, x: 130, act: 'curtain', open: true, tour: [],
    text: 'A practice found in every culture calls for an explanation. Why would people seek out stories that make them suffer?',
    dur: 1.8,
  },
  {
    p: 158, x: 276, act: 'fill', open: true, drained: true, tour: [],
    text: 'Aristotle held that a tragedy arouses pity and fear in its audience, and then releases them.',
    cite: 'Catharsis',
    dur: 3.1,
  },
  {
    p: 158, x: 276, act: 'named', open: true, drained: true, named: true,
    text: 'The effect is called katharsis, a term Aristotle never explained. Readers still disagree about what it means.',
    dur: 1.8,
  },
  {
    p: 158, x: 130, act: 'recognise', open: true, drained: true, named: true, lit: true, tour: [],
    text: 'In Sophocles’ Oedipus the King, Oedipus discovers that he has killed his own father. Aristotle calls this a recognition, a change from ignorance to knowledge.',
    cite: 'Recognition',
    dur: 2.1,
  },
  {
    p: 167, x: 130, act: 'image', open: true, drained: true, named: true, lit: true,
    text: 'Aristotle also writes that people enjoy accurate images of painful things, because learning from them is a pleasure.',
    dur: 2.9,
  },
  {
    p: 260, x: 130, open: true, drained: true, named: true, lit: true, q1: true,
    interact: {
      prompt: 'You leave a tragedy drained and yet relieved. Which of Aristotle’s concepts explains the relief?',
      explain: 'Catharsis. For Aristotle, a tragedy first stirs pity and fear, and then lets them go. That’s the relief you feel at the end. Mimesis means copying, and every tragedy copies an action, so copying can’t explain the relief.',
      xp: 5,
    },
    dur: 1,
  },
  {
    p: 158, x: 276, act: 'will', open: true, drained: true, named: true, lit: true, will: true,
    text: 'Music can make you sad without giving you any reason to be sad. Arthur Schopenhauer held that music expresses the will, the blind striving behind everything in nature.',
    cite: 'Music before reason',
    dur: 4,
  },
  {
    p: 158, x: 276, act: 'plato', open: true, drained: true, named: true, lit: true, will: true, lid: 0.5,
    text: 'Plato, over two thousand years earlier, argued that music shapes character before reason develops. So he thought music dangerous.',
    dur: 1.8,
  },
  {
    p: 263, x: 276, open: true, drained: true, named: true, lit: true, will: true, lid: 0.5,
    quote: {
      id: 'lq-aesthetics-aesthetics-3-1',
      text: 'Music is not, like the other arts, a copy of the Ideas, but a copy of the will itself.',
      author: 'Arthur Schopenhauer',
      philosopherId: 'arthur-schopenhauer',
      work: 'The World as Will and Representation',
      era: '1818',
      branchSlugs: ['aesthetics'],
    },
    dur: 3.4,
  },
  {
    p: 260, x: 276, open: true, drained: true, named: true, lit: true, will: true, lid: 0.5,
    interact: {
      prompt: 'Put these in order, from lightest hand to heaviest.',
      order: {
        axis: 'LIGHTEST FIRST',
        items: [
          { id: 'free', reads: 'LEAVE MUSIC ALONE' },
          { id: 'modes', reads: 'KEEP THE STEADFAST MODES' },
          { id: 'ban', reads: 'BANISH MUSIC ENTIRELY' },
        ],
      },
      explain: 'Plato takes the middle one. If music forms character before reason can judge it, leaving it alone hands that formation to chance; banishing it gives up a training he thinks indispensable. What he regulates is which modes, not whether.',
      xp: 5,
    },
    dur: 1,
  },
  {
    open: true, drained: true, named: true, lit: true, will: true, lid: 0.5,
    summary: {
      title: 'Tragedy, Music and the Emotions',
      points: [
        'Aristotle: tragedy arouses and releases pity and fear',
        'Schopenhauer: music copies the will',
        'Plato regulated the modes rather than banning music',
      ],
      closing: 'Philosophers have debated why art moves its audience for twenty-four centuries.',
    },
    dur: 2.8,
  },
];
