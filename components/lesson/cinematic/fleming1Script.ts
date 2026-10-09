import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic science-penicillin-1, "The Mould on the Plate" — the first lesson of
// Science's second unit, the discovery of penicillin (LESSON_RULES group AW), and a
// DIALOGUE lesson (group AP).
// AW: story
// Theme: A CLUTTERED HOSPITAL LAB, STACKED GLASS CULTURE PLATES, A TRAY OF DISINFECTANT,
// A MOULD; THEN FLASKS OF BROTH, A TRENCH PLATE, A RABBIT; THEN A CLUB LECTURE ROOM.
//
// THE STORY. Alexander Fleming, a bacteriologist in Sir Almroth Wright's Inoculation
// Department at St Mary's Hospital, Paddington, London, is studying Staphylococcus for a
// chapter of the Medical Research Council's System of Bacteriology. He grows it on culture
// plates: glass Petri dishes holding a thin layer of agar (a jelly made from seaweed), on
// which each germ grows into a visible golden colony. He goes on his summer holiday to
// Suffolk leaving a stack of old plates on his bench, and on 3 September 1928 he comes
// back and sorts them, dropping the old ones into a shallow tray of Lysol. His former
// assistant Merlin Pryce drops in. One plate has a mould at its edge, and around the mould
// the Staphylococcus colonies have gone transparent and dissolved, leaving a clear zone.
// Fleming had found lysozyme in 1921 from his own nasal mucus during a cold. Where the
// spore came from is not known; the mycologist C. J. La Touche's mould lab on the floor
// below is the usual guess, and the script only says "maybe". Fleming grows the mould in
// meat broth, calls the filtered broth "mould juice", cuts a trench in an agar plate, fills
// it with the juice and streaks germs across to it: Staphylococcus, Streptococcus, the
// pneumococcus and diphtheria germs stop short; B. coli, the typhoid germ and Pfeiffer's
// bacillus (then blamed for influenza) grow right up to it. It still works diluted
// hundreds of times, and does no harm injected into a rabbit and a mouse. But it loses its
// strength within a few weeks, and his young colleagues Stuart Craddock and Frederick
// Ridley cannot make it pure. On 13 February 1929 Fleming speaks to the Medical Research
// Club, framed as "A medium for the isolation of Pfeiffer's bacillus", and nobody asks a
// question. On 7 March 1929 he names it penicillin, after the mould Penicillium, and the
// paper appears in June 1929. Nearly ten years later Ernst Chain and Howard Florey, at
// Oxford, read it.
//
// SOURCES: A. Fleming, "On the antibacterial action of cultures of a penicillium, with
// special reference to their use in the isolation of B. influenzae", British Journal of
// Experimental Pathology 10 (1929) 226–236; Gwyn Macfarlane, Alexander Fleming: The Man
// and the Myth (1984); André Maurois, The Life of Sir Alexander Fleming (1959), with
// Merlin Pryce's account; Ronald Hare, The Birth of Penicillin (1970); Kevin Brown,
// Penicillin Man (2004). The famous "That's funny" is Pryce's memory, years later, so it
// is said here as Fleming's line in a play, not offered as a recorded quotation.
//
// THE CAST, IN ROLE (AW2) — no woman's part in this lesson, so the bun sits it out:
//   plain  — ALEXANDER FLEMING, white lab coat, a Petri dish in hand (garb.ts UNIT2_OUTFITS
//            fleming). His vanity (AS3) is affectionate: the untidiest man in the
//            building explaining that his mess is a system.
//   cap    — MERLIN PRYCE, his former research assistant, lab coat with a blue tie
//            (labColleague). Kind and helpful (AS4): he lifts plates out of the tray and
//            puts plainly what the plate shows. Place 0 only.
//   tophat — STUART CRADDOCK, the young colleague who grows and filters the broth, lab
//            coat with a blue tie (labColleague, with a waistcoat-grey shirt if the scene
//            wants him told apart from Pryce; they are never on stage together). Irritable
//            (AS2): he does the dull work and says so, and then teaches the result.
//
// THE UNIT PLAN (AW1) — six lessons, unit science-penicillin, "The Discovery of Penicillin":
//   1. The Mould on the Plate — London 1928–29: the plate, the mould juice, the silent talk.
//   2. The Juice Nobody Wanted — 1929–1939: it won't come pure, Fleming moves on; Chain
//      finds the paper in Oxford and Florey's team takes it up.
//   3. Eight Mice — Oxford, 25 May 1940: Heatley's bedpans and milk churns, the mouse test.
//   4. The Policeman — February 1941: Albert Alexander, the first patient, saved and then lost
//      when the penicillin runs out (bun plays a "penicillin girl" in the brewing room).
//   5. The Mouldy Cantaloupe — Peoria, Illinois, 1941–44: Mary Hunt's melon (bun), deep
//      tanks, enough for D-Day.
//   6. The Prize and the Warning — 1945: the Nobel Prize for Fleming, Florey and Chain, and
//      Fleming's warning that misuse will breed resistant germs.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character (AS),
// and spoken in the natural style (AP22). Nobody narrates (AW4).
// ─────────────────────────────────────────────────────────────────────────────

export interface Fleming1Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * return — Fleming comes through the lab door with a small suitcase, sets it down, and
   *   looks fondly at a bench buried under towers of glass dishes ·
   * help — Pryce leans in at the open door, then crosses to the bench and lifts the top
   *   plate off the tallest tower with both hands ·
   * agar — Fleming takes a dish, holds it up to the window light, and tilts it so the pale
   *   jelly inside catches the light ·
   * colony — Pryce points with a pencil at the golden dots on a dish ·
   * staph — Fleming taps a fat textbook manuscript on the bench, chin up ·
   * dunk — Pryce slides old dishes one by one into a shallow tray of cleaning fluid; a few
   *   on top of the heap stay dry, above the liquid ·
   * funny — Fleming plucks one dish off the dry top of the heap and freezes, peering ·
   * ring — Pryce leans over his shoulder; the dish, shown large, has a white fluffy mould
   *   at its edge and a clear ring round it where no colonies are left ·
   * nose — Fleming taps his own nose with one finger, very pleased ·
   * spore — Pryce glances down at the floorboards, toward the mould lab downstairs ·
   * flasks — the back room: Craddock stands at shelves of flat glass flasks, each with a
   *   white felt of mould on top of yellow broth, and pours one through a glass filter ·
   * trench — Craddock lays a large plate on the bench: a trench cut across the agar, full
   *   of yellow juice, three streaks of germs running toward it ·
   * result — the plate, shown large: one streak stops short of the trench, two run up to it ·
   * mice — Fleming holds a little glass syringe; a white rabbit in a hutch and a mouse in a
   *   jar on the bench both look perfectly well ·
   * fades — Craddock holds up a flask whose juice has gone pale and shakes his head ·
   * talk — the club: Fleming at a lectern in a panelled room, a lantern slide of the plate on
   *   the wall behind him, rows of chairs ·
   * silence — Craddock in the front row; not one hand goes up; a chair creaks ·
   * paper — Fleming at the lectern folds his notes and writes the word PENICILLIN on them ·
   * after — Craddock gives the reader a dry look over the empty chairs ·
   * rest — the lab bench at evening, the dish with the clear ring under a bell jar.
   */
  act?: 'return' | 'help' | 'agar' | 'colony' | 'staph' | 'dunk' | 'funny' | 'ring' | 'nose' | 'spore' | 'flasks' | 'trench' | 'result' | 'mice' | 'fades' | 'talk' | 'silence' | 'paper' | 'after' | 'rest';
  /**
   * Where they are: 0 Fleming's small lab at St Mary's Hospital, September 1928 — a bench
   * under a tall sash window over Praed Street, towers of glass dishes, a microscope, a
   * Bunsen burner, racks of test tubes, a wire loop, a shallow enamel tray of disinfectant,
   * papers everywhere · 1 the back room, winter 1928 — tall shelves of flat glass flasks of
   * broth, a warm incubator cabinet, a glass filter on a stand, a rabbit hutch · 2 the
   * Medical Research Club, February 1929 — a wood-panelled lecture room, a lectern, a
   * lantern projector throwing the plate onto a screen, rows of chairs.
   */
  place?: number;
  /**
   * First question on the stage — SPOT THE PLATE: three dishes lifted off the dry top of
   * the heap, side by side on the bench: one covered all over in golden colonies, one with a
   * mould at its edge and colonies growing right up to it, and one with a mould and a clear
   * ring round it. The dish that made Fleming stop is the one to tap.
   */
  plates?: boolean;
  /**
   * Second question on the stage — CALL THE STREAK: on the trench plate, three streaks of
   * germs run toward the trench of mould juice, labelled STAPHYLOCOCCUS, TYPHOID and GUT
   * GERM (B. coli). Before the plate is shown grown, the reader taps the streak that will
   * stop short of the juice.
   */
  streaks?: boolean;
}

export const BEATS: Fleming1Beat[] = [
  {
    bed: 'street',
    sfx: [{ id: 'creak', at: 0.8, gain: 0.6 }, { id: 'crate', at: 2.5, gain: 0.5 }, { id: 'glass', at: 4.1, gain: 0.6 }, { id: 'glass', at: 5.5, gain: 0.5 }],
    voiceAfter: 6.0,
    act: 'return', place: 0,
    speaker: 'plain',
    text: 'Back from my summer holiday in Suffolk. The finest germ man in London has returned to his bench.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'glass', at: 3.8, gain: 0.5 }],
    act: 'help', place: 0,
    speaker: 'cap',
    text: 'Morning, Dr Fleming. Shall I help you clear this tower of glass dishes?',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'agar', place: 0,
    speaker: 'plain',
    text: 'They’re culture plates, and it’s a system, not a mess. Each dish holds a thin layer of agar, a jelly made from seaweed.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'colony', place: 0,
    speaker: 'cap',
    text: 'And each golden dot on the jelly is a colony. It started as one germ and grew into millions.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 2.0, gain: 0.6 }],
    act: 'staph', place: 0,
    speaker: 'plain',
    text: 'Staphylococcus, the germ behind boils and infected wounds. I’m writing about it for a very important book.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'drop', at: 2.1, gain: 0.5 }, { id: 'glass', at: 2.7, gain: 0.5 }],
    act: 'dunk', place: 0,
    speaker: 'cap',
    text: 'The old ones go in the cleaning fluid, then. Some of these have sat here for weeks.',
    pace: 'even',
    dur: 1.8,
  },
  {
    place: 0, plates: true,
    interact: {
      prompt: 'Three dishes sit on top of the pile. Which one makes Fleming stop and stare?',
      explain: 'The dish with the clear ring. Near the mould, the colonies had died and gone see-through. A dish full of colonies is normal, and a mould with colonies right up to it isn’t killing anything.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'funny', place: 0,
    speaker: 'plain',
    text: 'That’s funny. There’s a fluffy mould at the edge, and the germs near it have gone see-through.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'ring', place: 0,
    speaker: 'cap',
    text: 'There’s a clear ring all the way round it. Something coming out of that mould is killing them.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'nose', place: 0,
    speaker: 'plain',
    text: 'Just like my lysozyme, which I found with a drip from my own nose. I make discoveries by being untidy.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'spore', place: 0,
    speaker: 'cap',
    text: 'Maybe a spore drifted up from the mould lab downstairs. Nobody knows for sure.',
    pace: 'even',
    dur: 1.8,
  },
  {
    bed: 'room',
    sfx: [{ id: 'water', at: 2.7, gain: 0.5 }],
    act: 'flasks', place: 1,
    speaker: 'tophat',
    text: 'So now I grow your mould on meat broth, in every flask we own. The yellow broth below the mould is your mould juice.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'plate', at: 3.1, gain: 0.6 }],
    act: 'trench', place: 1,
    speaker: 'tophat',
    text: 'Now the test. A trench cut across a plate and filled with juice, and three germs streaked toward it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 1, streaks: true,
    interact: {
      prompt: 'Three germs are streaked toward the trench of mould juice. Which streak will stop short of it?',
      explain: 'The Staphylococcus streak. The juice killed it before it reached the trench. The typhoid and gut germ streaks grew right up to the juice, because it only works on some germs.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'result', place: 1,
    speaker: 'tophat',
    text: 'The boil germ stops short of the trench. The typhoid germ and the gut germ walk straight up to the juice.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'mice', place: 1,
    speaker: 'plain',
    text: 'Watered down hundreds of times, the juice still kills Staphylococcus. A rabbit and a mouse got injections, and neither animal minded.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'glass', at: 0.4, gain: 0.5 }],
    act: 'fades', place: 1,
    speaker: 'tophat',
    text: 'And within weeks the juice loses its strength, and nobody here can make it pure. A medicine has to keep.',
    pace: 'even',
    dur: 2.1,
  },
  {
    bed: 'museum',
    sfx: [{ id: 'paper', at: 0.3, gain: 0.5 }],
    act: 'talk', place: 2,
    speaker: 'plain',
    text: 'Gentlemen of the Medical Research Club, I give you a mould that kills germs. Any questions?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chair', at: 1.8, gain: 0.5 }],
    act: 'silence', place: 2,
    speaker: 'tophat',
    text: 'Not one. You spent the talk on using it to grow a germ people blamed for flu.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'pencil', at: 1.6, gain: 0.6 }],
    act: 'paper', place: 2,
    speaker: 'plain',
    text: 'Penicillin, after the mould. The name goes in a paper, and some genius will read the paper eventually.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'after', place: 2,
    speaker: 'tophat',
    text: 'Two scientists at Oxford did. Nearly ten years later.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'rest', place: 0,
    quote: {
      id: 'lq-science-penicillin-1-1',
      text: 'It is suggested that it may be an efficient antiseptic for application to, or injection into, areas infected with penicillin-sensitive microbes.',
      author: 'Alexander Fleming',
      work: 'On the antibacterial action of cultures of a penicillium, British Journal of Experimental Pathology 10 (1929), summary',
      era: '1929',
      branchSlugs: ['science'],
    },
    dur: 3.0,
  },
  {
    place: 0,
    summary: {
      title: 'The Mould on the Plate',
      points: [
        'A mould killed Staphylococcus on a dish Fleming nearly threw away',
        'Its juice stopped some germs, even watered down',
        'It faded fast, and nobody asked a single question',
      ],
      closing: 'Penicillin sat in a journal for nearly ten years. Then someone in Oxford opened it.',
    },
    dur: 2.8,
  },
];
