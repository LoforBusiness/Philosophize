import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic personal-growth-endurance-1, "Proceed" — the first lesson of Personal
// Growth's second unit, Shackleton's Endurance expedition (LESSON_RULES group AW), and a
// DIALOGUE lesson (group AP).
// AW: story
// Theme: THE ENDURANCE MOORED IN THE THAMES, A MAP OF ANTARCTICA, CRATES, TELEGRAMS;
// THEN THE WHALING STATION AT GRYTVIKEN; THEN THE PACK ICE, PICKS, SAWS AND THE SHIP'S LOG.
//
// THE STORY. Nobody had crossed Antarctica. Ernest Shackleton's Imperial Trans-Antarctic
// Expedition meant to: the Endurance would land a party on the Weddell Sea coast, and
// they would walk about 1,800 miles over the Pole to the Ross Sea. The ship left London on
// 1 August 1914. On 3 August, as Britain mobilised for war, Shackleton offered the ship,
// the stores and the men to the country. Within an hour the Admiralty wired back one
// word, "Proceed". Within two hours Winston Churchill, First Lord of the Admiralty, wired
// at more length to say the expedition should go on. Britain declared war the next day.
// The Endurance reached the whaling station at Grytviken, South Georgia, on 5 November
// 1914. The whalers warned that the ice to the south was the worst they had known, so
// Shackleton waited a month, and sailed on 5 December with twenty-eight men (counting the
// stowaway Perce Blackborow, who had come aboard at Buenos Aires) and sixty-nine dogs. On
// 18–19 January 1915, about a day's sail from the planned landing at Vahsel Bay, the pack
// froze round the ship. On 14–15 February all hands cut at the ice with picks, saws and
// chisels for two days toward open water; the channel closed again. On 24 February
// Shackleton ended ship's routine and made the Endurance a winter station. The surgeon
// Alexander Macklin later wrote that he did not rage or show the slightest disappointment.
//
// THE ADVERT. "Men wanted for hazardous journey…" is a legend: no copy has ever been found
// in any newspaper. About five thousand people did apply. The cap raises it as a rumour and
// Shackleton says nobody has found it (AW4: an uncertain story is never told as fact).
//
// SOURCES: Ernest Shackleton, South (1919), Preface and chapters 1–2; Frank Worsley,
// Endurance (1931); Alfred Lansing, Endurance (1959); Caroline Alexander, The Endurance
// (1998, with Macklin's account); Roland Huntford, Shackleton (1985).
//
// THE CAST, IN ROLE (AW2):
//   plain  — ERNEST SHACKLETON, "the Boss", in a gabardine smock and a navy knitted cap
//            (garb.ts UNIT2_OUTFITS shackleton). His vanity (AS3) is Shackleton's own
//            showmanship, told with affection.
//   tophat — FRANK WORSLEY, captain of the Endurance, navy jacket and peaked cap
//            (captain). Irritable (AS2) that his ship keeps being given away and stuck,
//            and the one who names the idea.
//   cap    — TOM CREAN, the big Irish seaman, cream jumper and red knitted cap (explorer).
//            Kind and helpful (AS4): he carries the crates, the pup and the saw.
//
// UNIT PLAN — Shackleton's Endurance (six lessons):
//   1 Proceed — the war, the Admiralty's wire, Grytviken, the ship caught in the ice (1914–15).
//   2 The Long Night — winter in the pack: routine, football on the floe, the Ritz (1915).
//   3 She's Going, Boys — the ship crushed and sunk; two pounds of kit each; a new goal (1915).
//   4 The Boats — the floe camps and the open-boat run to Elephant Island (April 1916).
//   5 The James Caird — eight hundred miles to South Georgia in a lifeboat (April–May 1916).
//   6 Every Man Home — over the mountains to Stromness and the rescue, no man lost (1916).
//
// Every line is written for the ear (groups AC/AD), from its speaker's character (AS),
// and spoken in the natural style (AP22).
// ─────────────────────────────────────────────────────────────────────────────

export interface Endur1Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * quay — the Endurance moored in the Thames, a summer morning: masts, furled sails,
   *   crates on deck, a big map of Antarctica pinned to a crate; Shackleton stands by it,
   *   chin up, hands on hips ·
   * map — Worsley drags one finger across the map from coast to coast, and sighs ·
   * crates — Crean carries a crate up the gangplank, sets it down, holds out a folded
   *   newspaper ·
   * letters — Shackleton waves the paper away and pats a mail sack bulging with letters ·
   * news — Crean opens the newspaper to a black headline about the call-up ·
   * wire — Shackleton writes on a telegram pad on a crate and hands the form to Crean,
   *   who runs it down the gangplank ·
   * grumble — Worsley folds his arms and glares at the ship, then at Shackleton ·
   * proceed — Shackleton holds the opened telegram up high; Crean throws off the mooring
   *   rope and the ship eases away from the quay ·
   * station — Grytviken, South Georgia: rusting oil tanks, boiling sheds, a whale catcher
   *   at the jetty, snowy peaks; Crean points south across the bay ·
   * bend — Worsley unrolls a chart on a barrel and pencils a new sailing date on it ·
   * wait — Shackleton sits on a barrel drumming his fingers, then stands as if it was
   *   his idea ·
   * sail — dogs in their kennels along the deck; Crean carries a husky pup aboard and the
   *   ship slips out of the bay ·
   * beset — the Weddell Sea: white floes to the horizon, a low sun, the ship held fast;
   *   Worsley at the rail kicks the ice, which does not move ·
   * cut — on the floe, Crean hands Shackleton a pick and swings a long ice saw; chips fly ·
   * chop — Shackleton swings the pick twice, then leans on it and poses ·
   * refreeze — the cut channel glazes white again behind them; Worsley lets his saw drop ·
   * winter — Shackleton closes the ship's log and straightens his cap ·
   * home — Crean carries a crate down the hatch; smoke rises from the stovepipe ·
   * mood — Worsley watches the men settle, then gives the reader a slow nod ·
   * rest — the ship in the ice at dusk, lamplight in her portholes, under the quotation.
   */
  act?: 'quay' | 'map' | 'crates' | 'letters' | 'news' | 'wire' | 'grumble' | 'proceed' | 'station' | 'bend' | 'wait' | 'sail' | 'beset' | 'cut' | 'chop' | 'refreeze' | 'winter' | 'home' | 'mood' | 'rest';
  /** Where they are: 0 the Endurance at the Thames quay · 1 Grytviken whaling station · 2 the pack ice of the Weddell Sea. */
  place?: number;
  /**
   * First question on the stage — OPEN THE WIRE: a telegraph boy's tray on a crate holds
   * three sealed telegram envelopes; tapping one tears it open to show its form: RETURN TO
   * PORT, PROCEED, or JOIN THE FLEET. The reader calls the Admiralty's reply before the
   * story shows it. The one that says PROCEED is the one to tap.
   */
  wires?: boolean;
  /**
   * Second question on the stage — WRITE THE ORDERS: on a folding table on the ice, the
   * ship's log lies open with three orders pencilled in, waiting to be signed: KEEP
   * CUTTING, ABANDON SHIP and WINTER STATION. Tapping one inks Shackleton's signature
   * under it. The order he gave is the one to tap.
   */
  orders?: boolean;
}

export const BEATS: Endur1Beat[] = [
  {
    bed: 'river',
    music: 'mmorning',
    // the deck boards under him; Crean's crate set down; the map pinned to its case
    sfx: [{ id: 'creak', at: 0.8, gain: 0.5 }, { id: 'crate', at: 2.2, gain: 0.6 }, { id: 'pin', at: 3.6, gain: 0.6 }],
    voiceAfter: 6.0,
    act: 'quay', place: 0,
    speaker: 'plain',
    text: 'Nobody has ever walked across Antarctica, coast to coast. I’ll be the first, and it’ll make a lovely book.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 1.8, gain: 0.6 }],
    act: 'map', place: 0,
    speaker: 'tophat',
    text: 'Eighteen hundred miles of ice, on foot. My ship drops you on one coast, and you walk to the other.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'crate', at: 1.95, gain: 0.7 }],
    act: 'crates', place: 0,
    speaker: 'cap',
    text: 'The lads say you put an advert in the paper, Boss. Men wanted for a hazardous journey?',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'letters', place: 0,
    speaker: 'plain',
    text: 'Nobody’s ever found that advert. About five thousand people wrote to me anyway, which is hardly a surprise.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 0.3, gain: 0.7 }],
    act: 'news', place: 0,
    speaker: 'cap',
    text: 'There’s bad news in the paper, though. Britain’s calling up its soldiers and sailors for a war.',
    pace: 'even',
    dur: 1.8,
  },
  {
    // the form written on the pad, then torn off it
    sfx: [{ id: 'scribble', at: 0.7, gain: 0.5 }, { id: 'tear', at: 1.72, gain: 0.55 }],
    act: 'wire', place: 0,
    speaker: 'plain',
    text: 'Then I’ve wired the Admiralty. They can have the ship, the stores, and all of us.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'grumble', place: 0,
    speaker: 'tophat',
    text: 'You’ve given my ship to the Navy without asking me. Wonderful.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, wires: true,
    interact: {
      prompt: 'Shackleton offers his ship and men for the war. Which telegram comes back from the Admiralty?',
      explain: 'The one that says PROCEED. Within an hour the Admiralty wired that one word, and Churchill soon wired to say the expedition should go on. RETURN TO PORT and JOIN THE FLEET never came.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    // the mooring line lifted off the bitt and thrown off
    sfx: [{ id: 'rope', at: 1.0, gain: 0.55 }],
    act: 'proceed', place: 0,
    speaker: 'plain',
    text: 'One word from the Admiralty: Proceed. Even the Navy knows a national treasure when it sees one.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    bed: 'sea',
    sfx: [{ id: 'plank', at: 0.6, gain: 0.5 }],
    act: 'station', place: 1,
    speaker: 'cap',
    text: 'South Georgia, Boss. The whalers here say the ice down south is the worst they’ve ever seen.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 0.65, gain: 0.6 }, { id: 'pencil', at: 2.1, gain: 0.6 }],
    act: 'bend', place: 1,
    speaker: 'tophat',
    text: 'Then we listen to the people who sail it. A goal can stay fixed, but the plan has to bend to the ice.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'wait', place: 1,
    speaker: 'plain',
    text: 'Fine, we’ll wait a month for the ice to loosen. I was about to suggest it myself.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'creak', at: 0.8, gain: 0.45 }],
    act: 'sail', place: 1,
    speaker: 'cap',
    text: 'Fifth of December, and we’re off. Twenty-eight men, sixty-nine dogs, and one very full deck.',
    pace: 'even',
    dur: 1.8,
  },
  {
    bed: 'wind',
    // her hull groaning in the ice; his boot against the ice
    sfx: [{ id: 'creak', at: 0.6, gain: 0.5 }, { id: 'thud', at: 1.7, gain: 0.4 }],
    act: 'beset', place: 2,
    speaker: 'tophat',
    text: 'January, and she’s stuck fast. The ice closed round her overnight, a day’s sail from land.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'crack', at: 2.75, gain: 0.5 }, { id: 'crack', at: 4.1, gain: 0.4 }],
    act: 'cut', place: 2,
    speaker: 'cap',
    text: 'Out on the ice, everyone. Picks, saws and chisels, and we’ll cut her a path to open water.',
    pace: 'even',
    dur: 1.8,
  },
  {
    // two blows of the pick
    sfx: [{ id: 'thud', at: 0.4, gain: 0.5 }, { id: 'thud', at: 1.18, gain: 0.45 }],
    act: 'chop', place: 2,
    speaker: 'plain',
    text: 'Two whole days of chopping. I don’t like to boast, but I was the best at it.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    // his saw dropped on the ice
    sfx: [{ id: 'can', at: 2.0, gain: 0.5 }],
    act: 'refreeze', place: 2,
    speaker: 'tophat',
    text: 'The path froze shut behind us. The pack runs to the sky in every direction, and drifts where the wind takes it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 2, orders: true,
    interact: {
      prompt: 'The ship won’t come free before winter. Which order does Shackleton sign in the log?',
      explain: 'WINTER STATION. On 24 February 1915 he ended ship’s routine and made her a home for the winter. KEEP CUTTING had already failed, and ABANDON SHIP would have left a sound ship for open ice.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'book', at: 1.2, gain: 0.6 }],
    act: 'winter', place: 2,
    speaker: 'plain',
    text: 'We’ll spend the winter in the ice and cross next year. I’m not upset at all, I’m adapting.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'crate', at: 3.7, gain: 0.6 }],
    act: 'home', place: 2,
    speaker: 'cap',
    text: 'Then let’s make her a proper home. I’ll move the crates below and get the stove lit.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'mood', place: 2,
    speaker: 'tophat',
    text: 'The Boss didn’t rage or sulk, and the men noticed. A crew takes its mood from the Boss.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'rest', place: 2,
    quote: {
      id: 'lq-personal-growth-endurance-1-1',
      text: 'Within an hour I received a laconic wire from the Admiralty saying ‘Proceed.’',
      author: 'Ernest Shackleton',
      work: 'South (1919), Preface',
      era: '1919',
      branchSlugs: ['personal-growth'],
    },
    dur: 3.0,
  },
  {
    place: 2,
    summary: {
      title: 'Proceed',
      points: [
        'Shackleton set out in 1914 to cross Antarctica on foot',
        'He offered his ship for the war, and was told to proceed',
        'Trapped in the ice, he changed the plan and kept the goal',
      ],
      closing: 'Now came the long polar night, with twenty-eight men to keep cheerful. That takes more than a plan.',
    },
    dur: 2.8,
  },
];
