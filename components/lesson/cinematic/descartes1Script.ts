import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic philosophy-descartes-1, "The Stove-Heated Room" — the first lesson of
// Philosophy's second unit, René Descartes and his method of doubt (LESSON_RULES group
// AW), and a DIALOGUE lesson (group AP).
// AW: story
// Theme: A SNOWY BAVARIAN TOWN ON THE DANUBE, ARMY TENTS, A TILED STOVE, A TIMBER TABLE,
// SCHOOLBOOKS, A FROSTED WINDOW, A TOWN PLAN, A BASKET OF APPLES; THEN THE ROOM BY NIGHT,
// A CANDLE, A WHIRLWIND, SPARKS, A DICTIONARY AND A BOOK OF POEMS.
//
// THE STORY. 1619: René Descartes, twenty-three (born 31 March 1596), is a gentleman
// volunteer in the army of Maximilian, Duke of Bavaria, a year into the war later called
// the Thirty Years' War. He has been at the coronation of Emperor Ferdinand at Frankfurt
// (September 1619), and on his way back to the army the winter holds him in quarters in
// Germany. Finding no conversation to divert him, he stays all day shut up alone in a
// stove-heated room, thinking. He has left one of the most famous schools in Europe, the
// Jesuit college of La Flèche, finding he had gained nothing from it but doubts and errors.
// One of his first thoughts there: a town laid out by one engineer is better ordered than
// an old town that grew from a village, built up by many hands; and while nobody pulls down
// every house in a town to rebuild it, a man may pull down his own. So he resolves to
// clear out every opinion he has accepted and rebuild on firm ground. On 10 November 1619,
// he writes, he was full of enthusiasm, having found the foundations of a wonderful
// science. That night he has three dreams: a whirlwind that spins him and bends him over;
// a noise like a thunderclap that wakes him to sparks filling the room; and a table with a
// dictionary and a book of poems, open at the line "Which path in life shall I follow?"
// (Ausonius, "Quod vitae sectabor iter?"). Waking, he prays and vows a pilgrimage to the
// shrine of Our Lady at Loreto.
//
// SOURCES: Descartes, Discourse on the Method (1637), Parts 1–2 (the room, La Flèche, the
// one-architect town, pulling down one's own house); his notebook Olympica (the date and
// the "wonderful science"; lost, known through copies and Baillet); Adrien Baillet, La Vie
// de Monsieur Des-Cartes (1691), II.1, which paraphrases the three dreams and the vow from
// the Olympica. The dreams are therefore known secondhand, and the script says so (beat
// 20). The exact town is uncertain (Baillet's account points to the Danube near Ulm;
// Neuburg is often proposed), so no line names it. THE APPLE BASKET is Descartes's own
// image, but from 1642 (Seventh Replies, to Bourdin): tip every apple out, then put back
// only the sound ones. The scene plays it in the 1619 room and the top hat flags its real
// date (beat 13). The landlord and the fellow soldier are unnamed stand-ins for the people
// around him; the Discourse says he had no conversation, and the comedy is that he refuses
// theirs.
//
// UNIT PLAN — "Descartes Doubts Everything", five lessons:
//   1. The Stove-Heated Room — winter 1619: tear it all down, the three dreams.
//   2. A Method in French — 1637: the Discourse's four rules, published in Leiden.
//   3. The Evil Demon — 1641, Meditation One: the senses, the dream, the deceiver.
//   4. I Think, Therefore I Am — Meditation Two: the one thing he can't doubt, the wax.
//   5. The Princess Pushes Back — 1643: Elisabeth asks how a mind moves a body; Stockholm.
//
// THE CAST, IN ROLE (AW2):
//   plain  — RENÉ DESCARTES, young, a gentleman soldier: buff coat, red sash, plumed hat
//            (garb.ts UNIT2_OUTFITS descartes). His vanity (AS3) is a young genius's, told
//            straight and affectionately.
//   tophat — THE LANDLORD who owns the room and its stove. Composed in the scene from
//            garb.ts parts: breeches(WEAR.breeches), coat(WEAR.smock, 'hip'),
//            sleeves(WEAR.smock), an apron front(WEAR.knitCream, 6), knitCap(WEAR.hatBrown).
//            Irritable (AS2): a soldier who thinks all day is using his firewood.
//   cap    — A FELLOW SOLDIER, dark buff coat (soldier). Kind and helpful (AS4): he carries
//            the firewood, brings the apples, and tries to make conversation.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character (AS),
// and spoken in the natural style (AP22). Nothing in the war is drawn graphically (AW4).
// ─────────────────────────────────────────────────────────────────────────────

export interface Descartes1Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * march — snow falls on a Bavarian town by the Danube: steep roofs, a church spire, army
   *   tents and a cannon under snow at the edge of town, a blue-and-white banner; Descartes
   *   trudges in from the left, the soldier behind him with a bundle of logs on his back ·
   * quarters — the soldier points up the street at a half-timbered house with smoke rising
   *   from its chimney; the logs shift on his back ·
   * stove — inside: the landlord opens the door of a tall green-tiled stove and feeds in two
   *   logs from the soldier's bundle; an orange glow comes up on the tiles ·
   * sit — Descartes drags a stool to the timber table, sits, pulls off his plumed hat and
   *   lays it down with care, and holds up one hand: no talking ·
   * scoff — the landlord stands with his arms folded by the stove, shaking his head ·
   * books — Descartes pulls schoolbooks from his pack and drops them in a stack on the
   *   table; he flicks one open and shuts it again ·
   * window — the soldier rubs a clear patch in the frosted window: outside, a crooked old
   *   town, roofs at every angle, lanes that bend, a tower leaning on a wall ·
   * plan — Descartes unrolls a sheet of paper and draws a town of straight streets with a
   *   ruler and pencil; he holds it up beside the window ·
   * house — Descartes taps his own head, then sweeps the schoolbooks off the table into his
   *   pack, clearing the table bare ·
   * apples — the soldier sets a wicker basket of red apples on the bare table; one apple
   *   on top has a brown soft patch ·
   * sort — Descartes tips the basket: every apple rolls out across the table; he turns each
   *   one over and puts the sound ones back, setting the soft one aside ·
   * grumble — the landlord stoops and picks a stray apple off the floor, sighing ·
   * enthuse — night: Descartes paces in front of the glowing stove with a candle, writing
   *   in a small notebook as he walks ·
   * wind — he lies on the cot; the room fills with a swirl of blue wind lines, and his
   *   dream self staggers, bent over on one side, pushed round in a circle ·
   * spark — a bright flash; sparks fly round the room from the stove; he sits bolt upright
   *   on the cot, blanket clutched ·
   * answer — the dream table fades; Descartes stands at the real table, one hand on the
   *   closed book of poems, chin up ·
   * vow — the landlord, in a nightcap, steps out of the doorway with a lamp, unimpressed, and
   *   goes back through it; the door shuts behind him (AW8) ·
   * after — the soldier holds up the little notebook, then sets it down on the table ·
   * rest — the room by night, the stove glowing, snow at the window, under the quotation.
   */
  act?: 'march' | 'quarters' | 'stove' | 'sit' | 'scoff' | 'books' | 'window' | 'plan' | 'house' | 'apples' | 'sort' | 'grumble' | 'enthuse' | 'wind' | 'spark' | 'answer' | 'vow' | 'after' | 'rest';
  /**
   * Where they are: 0 the snowy town on the Danube by day · 1 the stove-heated room by day
   * (tiled stove, timber table, stool, frosted window, pack, logs) · 2 the same room at
   * night (candle, cot, the stove's glow, and the dream drawn over it).
   */
  place?: number;
  /**
   * First question on the stage — TIP THE BASKET (call what happens next): on the table, the
   * wicker basket of apples (tip the whole lot out and check each one), Descartes's hand
   * holding one apple up (pick the bad ones out one at a time), and the wood bin beside the
   * stove (throw the lot away). The one Descartes does is the one to tap.
   */
  basket?: boolean;
  /**
   * Second question on the stage — OPEN THE BOOK: in the third dream, a book of poems lies
   * open on the table beside a fat dictionary, three paper ribbons hanging from its pages,
   * each with a line written on it: "Which path in life shall I follow?", "Love conquers
   * all." and "Seize the day." The ribbon he reads is the one to tap.
   */
  book?: boolean;
}

export const BEATS: Descartes1Beat[] = [
  {
    bed: 'wind',
    music: 'mbachc',
    // the logs hitched on the soldier's back, twice
    sfx: [{ id: 'crate', at: 2.6, gain: 0.6 }, { id: 'crate', at: 5.2, gain: 0.55 }],
    voiceAfter: 6.0,
    act: 'march', place: 0,
    speaker: 'plain',
    text: 'Twenty-three years old, a gentleman soldier, and nobody to fight until spring. What a waste of me.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'crate', at: 0.6, gain: 0.55 }],
    act: 'quarters', place: 0,
    speaker: 'cap',
    text: 'The war stops for the snow, sir. They’ve found you a room in town with a big stove.',
    pace: 'even',
    dur: 1.8,
  },
  {
    bed: 'fire',
    // the iron fire door opened; two logs pushed into the fire
    sfx: [{ id: 'oven', at: 0.4, gain: 0.6 }, { id: 'plank', at: 1.35, gain: 0.55 }],
    act: 'stove', place: 1,
    speaker: 'tophat',
    text: 'My best room, and my best stove. The wood isn’t free, young man.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'chair', at: 0.3, gain: 0.6 }],
    act: 'sit', place: 1,
    speaker: 'plain',
    text: 'Lovely. Now nobody talk to me, please. I’m going to think.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'scoff', place: 1,
    speaker: 'tophat',
    text: 'All day, shut in a room? Soldiers drink in winter, they don’t sit and think.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'book', at: 1.5, gain: 0.7 }, { id: 'pageturn', at: 2.5, gain: 0.6 }],
    act: 'books', place: 1,
    speaker: 'plain',
    text: 'I went to La Flèche, one of the best schools in Europe. All it gave me was a pile of doubts.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'window', place: 1,
    speaker: 'cap',
    text: 'The town’s nice though, sir. Hundreds of years of builders, each one adding a bit.',
    pace: 'even',
    dur: 1.8,
  },
  {
    // the sheet unrolled; two strokes ruled along the ruler
    sfx: [{ id: 'paper', at: 0.2, gain: 0.6 }, { id: 'pencil', at: 0.96, gain: 0.55 }, { id: 'pencil', at: 1.8, gain: 0.5 }],
    act: 'plan', place: 1,
    speaker: 'plain',
    text: 'That’s the trouble with it. A town that one person plans is far neater than one a hundred builders patched.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'book', at: 2.3, gain: 0.6 }],
    act: 'house', place: 1,
    speaker: 'plain',
    text: 'So I’ll pull down my own beliefs, every one of them. Then I’ll build again from the ground up.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    // the wicker basket set down on the table
    sfx: [{ id: 'box', at: 3.8, gain: 0.55 }],
    act: 'apples', place: 1,
    speaker: 'cap',
    text: 'I brought you some apples, sir. A few might have gone bad, sorry.',
    pace: 'even',
    dur: 1.8,
  },
  {
    place: 1, basket: true,
    interact: {
      prompt: 'Some of the apples might be bad, and Descartes can’t tell which. What does he do?',
      explain: 'The basket: he tips every apple out and puts back only the sound ones. Picking out one at a time could miss a hidden bad one, and the wood bin wastes the good ones.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'thud', at: 1.3, gain: 0.6 }, { id: 'thud', at: 1.75, gain: 0.5 }],
    act: 'sort', place: 1,
    speaker: 'plain',
    text: 'All of them out, then back one by one, only the good ones. Beliefs work the same way.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'grumble', place: 1,
    speaker: 'tophat',
    text: 'Descartes puts that basket in a book in 1642. Until then, my floor is covered in apples.',
    pace: 'even',
    dur: 2.1,
  },
  {
    // writing as he paces; the notebook dropped on the table; down on the cot
    sfx: [{ id: 'pencil', at: 0.4, gain: 0.55 }, { id: 'book', at: 3.0, gain: 0.5 }, { id: 'creak', at: 5.4, gain: 0.5 }],
    act: 'enthuse', place: 2,
    speaker: 'plain',
    text: 'The tenth of November, and I’ve found the foundations of a wonderful science. Write that down, history.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    // the blanket as he lies down; the whirlwind rising
    sfx: [{ id: 'whoosh', at: 0.2, gain: 0.55 }, { id: 'whoosh', at: 1.3, gain: 0.5 }],
    act: 'wind', place: 2,
    speaker: 'plain',
    text: 'Now I’m dreaming. A wind is spinning me round, and I can’t stand up straight.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    // the bang; the stove's fire flares and throws its sparks
    sfx: [{ id: 'crack', at: 0.2, gain: 0.7 }, { id: 'burner', at: 0.9, gain: 0.5 }],
    act: 'spark', place: 2,
    speaker: 'plain',
    text: 'A bang like thunder, and sparks all over the room. Am I awake, or still dreaming?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    place: 2, book: true,
    interact: {
      prompt: 'In his third dream, a book of poems lies open. Which line does Descartes read?',
      explain: 'Which path in life shall I follow, a line by the Roman poet Ausonius, and Descartes took it as his own question. Love conquers all and Seize the day are famous, but not in his dream.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    // after his line the room's door opens: the landlord is in the doorway with his lantern (AW8)
    sfx: [{ id: 'door', at: 4.5, gain: 0.8 }],
    act: 'answer', place: 2,
    speaker: 'plain',
    text: 'My own path. I doubt everything, and then I rebuild it properly.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    // he steps back into the doorway and the door shuts behind him (AW8)
    sfx: [{ id: 'doorshut', at: 5.0, gain: 0.8 }],
    act: 'vow', place: 2,
    speaker: 'tophat',
    text: 'He also vowed a trip to the shrine at Loreto. Now, will everyone please go to sleep?',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'pageturn', at: 2.55, gain: 0.55 }],
    act: 'after', place: 2,
    speaker: 'cap',
    text: 'The notebook got lost, sir. We know the dreams from a book about him, written seventy years later.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'rest', place: 2,
    quote: {
      id: 'lq-philosophy-descartes-1-1',
      text: 'I stayed all day shut up alone in a stove-heated room, where I was completely free to converse with myself about my own thoughts.',
      author: 'René Descartes',
      work: 'Discourse on the Method, Part 2 (1637; tr. Cottingham, Stoothoff and Murdoch)',
      era: '1637',
      branchSlugs: ['philosophy'],
    },
    dur: 3.0,
  },
  {
    place: 2,
    summary: {
      title: 'The Stove-Heated Room',
      points: [
        'In winter 1619, young Descartes shut himself in to think',
        'He chose to pull down every belief and rebuild',
        'That night, three dreams asked which path he would follow',
      ],
      closing: 'He had the plan. Next, he needed a method, and it took him eighteen years to publish it.',
    },
    dur: 2.8,
  },
];
