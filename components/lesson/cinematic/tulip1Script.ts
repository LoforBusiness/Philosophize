import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic economics-tulips-1, "The Flower That Broke" — the first lesson of Economics'
// second unit, Dutch tulip mania (LESSON_RULES group AW), and a DIALOGUE lesson (group AP).
// AW: story
// Theme: THE LEIDEN UNIVERSITY GARDEN, BOXWOOD BEDS, CRATES OF BULBS IN STRAW, A SPADE;
// THEN THE GARDEN WALL BY NIGHT, A LANTERN, A LADDER, EMPTY HOLES; THEN TULIPS IN BLOOM,
// A STRIPED BROKEN TULIP, CLAY POTS, A GARDEN GATE, PRICE TAGS.
//
// THE STORY. Tulips grow wild in Central Asia and were grown for generations in the
// Ottoman Empire. Ogier Ghiselin de Busbecq, the Holy Roman Emperor's ambassador to Sultan
// Suleiman (1554–62), saw them in Turkey and wrote about them; who first sent bulbs west is
// not certain. The botanist Carolus Clusius (Charles de l'Écluse) grew tulips in Vienna,
// and in October 1593, aged sixty-seven, came to Leiden to run the university's new
// garden, the hortus botanicus, laid out with the apothecary Dirck Cluyt. He planted his
// bulbs, and they flowered in the spring of 1594. Bulbs were stolen from the garden, and a
// story told later says this was because Clusius would not sell or asked too much; the
// characters flag that as a story. Some tulips "broke": their colour split into flames
// and feathers on white. Clusius noticed broken tulips were weaker, and their bulbs grew
// fewer offsets; nobody could make one break on purpose, and a broken bulb's offsets broke
// too. The cause, a virus spread by aphids, was found in the 1920s. Clusius died in 1609.
// By 1624 the striped Semper Augustus was the most prized tulip of all, and its owner
// turned down an offer of three thousand guilders, about ten years' pay for a skilled
// worker.
//
// SOURCES: Anne Goldgar, Tulipmania: Money, Honor, and Knowledge in the Dutch Golden Age
// (2007); Mike Dash, Tulipomania (1999); Busbecq, Turkish Letters (Letter 1); Nicolaes
// van Wassenaer, Historisch Verhael (1625) on the Semper Augustus; on the virus, Dorothy
// Cayley's work at the John Innes Institute (1928). Wages: Goldgar gives a skilled
// craftsman roughly 250–300 guilders a year.
//
// THE UNIT PLAN (five lessons, `economics-tulips`):
//   1 The Flower That Broke — Clusius's Leiden garden, the stolen bulbs, broken tulips:
//     SCARCITY. (this lesson)
//   2 Selling What's Underground — a Haarlem florist sells bulbs still in the ground on
//     promissory notes, the "wind trade": FUTURES CONTRACTS.
//   3 The Tavern Colleges — bulbs traded over wine in Haarlem's tavern "colleges", the
//     winter of 1636–37: SPECULATION.
//   4 The Alkmaar Auction — 5 February 1637, the bulbs of the orphans of Wouter Winkel fetch
//     about 90,000 guilders: THE PEAK OF A BUBBLE.
//   5 The Crash, and the Myth — Haarlem a few days later, buyers stop turning up; the courts
//     and the contracts; Goldgar's case that the famous ruin was exaggerated: HOW A BUBBLE
//     ENDS.
//   From lesson 2 the plain one plays an UNNAMED Haarlem florist: the records do not let us
//   follow one named trader through the whole winter, so he is never given a name.
//
// THE CAST, IN ROLE (AW2):
//   plain  — CAROLUS CLUSIUS, the botanist, plum doublet and ruff (garb.ts burgherBare).
//            His vanity (AS3): the greatest botanist in Europe, and he says so.
//   tophat — DIRCK CLUYT, the apothecary who laid out the beds, black doublet, ruff and
//            tall hat (burgher). Irritable (AS2): he does the digging and the explaining.
//            Like caesar1's captain, he speaks from beyond his own lifetime in the coda.
//   cap    — A GARDEN BOY at the hortus (an invented, unnamed role), composed in the scene
//            from garb.ts parts: breeches(WEAR.breeches), coat(WEAR.smock, 'thigh'),
//            sleeves(WEAR.smock), front(WEAR.smockShade, 3, 8) — a work smock. Kind and
//            helpful (AS4): he labels, waters, finds the theft and the striped flower.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character (AS),
// and spoken in the natural style (AP22). The theft is said and shown as empty holes.
// ─────────────────────────────────────────────────────────────────────────────

export interface Tulip1Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * arrive — autumn 1593: Clusius walks in through the garden gate behind the cap, who
   *   wheels a barrow stacked with crates packed in straw; leaves blow across the beds ·
   * dig — Cluyt straightens up from a bed with his spade and leans on it, glaring at the
   *   crates ·
   * unpack — Clusius lifts the lid of a crate and holds up a brown bulb like a jewel ·
   * label — the cap kneels at the bed edge, pushing a wooden label stick into the soil ·
   * envoy — Clusius taps a folded letter from his doublet, chin up ·
   * plant — Cluyt drops a bulb into a hole and pats the soil flat with the spade ·
   * bloom — spring 1594: the beds burst into rows of red, yellow and pink tulips; the cap
   *   runs in from the gate, where hats bob over the wall ·
   * refuse — Clusius stands between the beds and the gate, arms folded ·
   * theft — night: the cap holds up a lantern by the wall; a ladder leans against it and
   *   the best bed is pocked with empty holes ·
   * holes — Clusius kneels by the holes and lifts a handful of loose soil ·
   * shrug — Cluyt leans on the ladder and looks over the wall toward the town ·
   * broken — a later spring: the cap points at one tulip in a full bed, red flames on white ·
   * inspect — Clusius bends close to the striped flower, turning a leaf in his fingers ·
   * scarce — Cluyt digs up the striped tulip's bulb and shows two tiny offsets beside it ·
   * reveal — the striped pot from the question blooms striped; the cap holds it up ·
   * virus — Cluyt plucks a tiny green aphid off a leaf and holds it to the light ·
   * legacy — Clusius stands among the blooms, hand on heart, admiring them ·
   * after — Cluyt gives the reader a dry look; a single striped bulb sits on a velvet cloth ·
   * wage — the cap counts on his fingers, eyes wide ·
   * rest — the garden in bloom at dusk, under the quotation.
   */
  act?: 'arrive' | 'dig' | 'unpack' | 'label' | 'envoy' | 'plant' | 'bloom' | 'refuse' | 'theft' | 'holes' | 'shrug' | 'broken' | 'inspect' | 'scarce' | 'reveal' | 'virus' | 'legacy' | 'after' | 'wage' | 'rest';
  /**
   * Where they are: 0 the Leiden university garden, autumn 1593 into spring 1594 — a walled
   * garden behind the brick university building on the Rapenburg canal, square beds edged
   * in boxwood, gravel paths, a wooden gate, a wheelbarrow and straw-packed crates ·
   * 1 the same garden at night — the brick wall, a ladder against it, a lantern, the bed of
   * empty holes, the canal and roofs beyond under a moon · 2 the garden in a later spring —
   * beds in full bloom, a potting bench with clay pots, the gate with visitors' hats above it.
   */
  place?: number;
  /**
   * First question on the stage — THE NEXT SPRING (call what happens next): on the potting
   * bench, three clay pots, each with a painted tag — a plain red tulip, a red-and-white
   * striped tulip, and bare soil. Clusius has just planted an offset of the striped tulip;
   * the reader taps the pot showing what will come up. Then it blooms.
   */
  pots?: boolean;
  /**
   * Second question on the stage — PIN THE PRICE: at the garden gate, three potted tulips
   * on a plank (a plain red, a plain yellow, the striped one) and a heavy brass price tag
   * on a string. The reader taps the tulip the tag belongs on: the one buyers pay most for.
   */
  tags?: boolean;
}

export const BEATS: Tulip1Beat[] = [
  {
    bed: 'garden',
    sfx: [{ id: 'wheel', at: 0.6, gain: 0.5 }, { id: 'creak', at: 2.2, gain: 0.6 }, { id: 'crate', at: 4.0, gain: 0.6 }, { id: 'paper', at: 5.2, gain: 0.5 }],
    voiceAfter: 6.0,
    act: 'arrive', place: 0,
    speaker: 'plain',
    text: 'Leiden, at last. The university wanted the greatest botanist in Europe, so they sent for me.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'dig', place: 0,
    speaker: 'tophat',
    text: 'I’ve dug these beds since summer. Please tell me those crates aren’t full of onions.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'crate', at: 0.3, gain: 0.6 }],
    act: 'unpack', place: 0,
    speaker: 'plain',
    text: 'Tulip bulbs, from my garden in Vienna. They come from the Ottoman Empire, where they’ve been grown for generations.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'label', place: 0,
    speaker: 'cap',
    text: 'How did they get from Turkey to Vienna, sir? I’ll write it on the label.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 0.4, gain: 0.6 }],
    act: 'envoy', place: 0,
    speaker: 'plain',
    text: 'A friend of mine was the emperor’s ambassador to the Sultan. He saw them in Turkey and wrote home about them.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'clay', at: 1.0, gain: 0.5 }],
    act: 'plant', place: 0,
    speaker: 'tophat',
    text: 'So I bury your foreign onions in October and wait until spring. Lovely.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'bloom', place: 0,
    speaker: 'cap',
    text: 'They’re up, sir, every colour! And there’s a crowd at the gate asking to buy them.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'refuse', place: 0,
    speaker: 'plain',
    text: 'Sell them? They’re for science, not for every merchant with a fat purse.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    bed: 'night',
    sfx: [{ id: 'creak', at: 0.4, gain: 0.5 }],
    act: 'theft', place: 1,
    speaker: 'cap',
    text: 'Sir, come quick! Somebody climbed the wall last night and dug up the bulbs.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'holes', place: 1,
    speaker: 'plain',
    text: 'My tulips! Thieves, in my garden, and they took the best ones.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'creak', at: 0.6, gain: 0.4 }],
    act: 'shrug', place: 1,
    speaker: 'tophat',
    text: 'There’s a story going round that you asked so much, nobody could buy one. So they stole them instead.',
    pace: 'even',
    dur: 2.1,
  },
  {
    bed: 'garden',
    act: 'broken', place: 2,
    speaker: 'cap',
    text: 'Look at this tulip, sir. Red flames on white, like somebody painted the petals.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'inspect', place: 2,
    speaker: 'plain',
    text: 'A broken tulip. Glorious, and weak, and its bulb grows fewer young bulbs than a healthy one.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'clay', at: 0.5, gain: 0.5 }],
    act: 'scarce', place: 2,
    speaker: 'tophat',
    text: 'That’s called scarcity. Nobody can break a tulip on purpose, so there are only ever a few.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 2, pots: true,
    interact: {
      prompt: 'Clusius plants a young bulb from the striped tulip. Which pot shows what comes up next spring?',
      explain: 'The striped pot. Whatever breaks a tulip lives inside the bulb, so its young bulbs flower striped too. The plain red pot is what a healthy bulb gives, and the bare pot would mean it died. It’s weak, not dead.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'clay', at: 0.3, gain: 0.6 }],
    act: 'reveal', place: 2,
    speaker: 'cap',
    text: 'Striped again, sir! So the stripes must live inside the bulb.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'virus', place: 2,
    speaker: 'tophat',
    text: 'They do. Three hundred years later, scientists found a virus, carried from plant to plant by tiny insects called aphids.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 2, tags: true,
    interact: {
      prompt: 'Three tulips wait at the garden gate. Which one do buyers pay the most for?',
      explain: 'The striped one. Few exist, nobody can make more on purpose, and its bulb multiplies slowly. The red and the yellow grow easily, so there are plenty of them to go round.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'legacy', place: 2,
    speaker: 'plain',
    text: 'Rare, beautiful, and grown by me. People will pay a fortune for these one day.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'after', place: 2,
    speaker: 'tophat',
    text: 'They did, long after you died. In 1624, the owner of a striped bulb called Semper Augustus turned down three thousand guilders.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'wage', place: 2,
    speaker: 'cap',
    text: 'That’s about ten years’ pay for a skilled worker, sir.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'rest', place: 2,
    quote: {
      id: 'lq-economics-tulips-1-1',
      text: 'In 1634, the rage among the Dutch to possess them was so great that the ordinary industry of the country was neglected.',
      author: 'Charles Mackay',
      work: 'Memoirs of Extraordinary Popular Delusions (1841), "The Tulipomania"',
      era: '1841',
      branchSlugs: ['economics'],
    },
    dur: 3.0,
  },
  {
    place: 2,
    summary: {
      title: 'The Flower That Broke',
      points: [
        'Tulips came from the Ottoman Empire to Clusius’s Leiden garden',
        'Striped broken tulips were weak, and nobody could make one',
        'Few bulbs and many eager buyers pushed prices up',
      ],
      closing: 'By the 1630s, people weren’t only buying tulips. They were buying bulbs still under the ground.',
    },
    dur: 2.8,
  },
];
