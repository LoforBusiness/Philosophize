import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic economics-foundations-7, "Economics Recap: Dawn at the Exchange" — the RECAP
// of the Economics road's first six lessons (LESSON_RULES group AV), and a DIALOGUE
// lesson (group AP).
// AV: recap
// Theme: AN OLD TRADING EXCHANGE AT DAWN, A SLATE PRICE BOARD, A TICKER MACHINE, LEDGERS
// AND A COFFEE URN; THEN A HARBOUR MARKET, CRATES, SACKS, A FISH STALL AND A NOTICE BOARD.
//
// Two people talk, and nobody narrates. The economist (the top hat) is alone in a grand
// old exchange hall at dawn: tall arched windows going pink, a huge slate price board on
// the back wall (WHEAT · WOOL · COAL · UMBRELLAS), a brass ticker-tape machine under a
// glass dome, a clerk's high desk with ledgers and an inkwell, a merchant's brass balance
// and a coffee urn on a side table. He chalks the morning's prices. The woman with the
// bun, who was in four of the six lessons (the rain, the garden, the rat cellar, the
// coconut stall), wanders in with a crate of tomatoes, cheerful and one step behind,
// taking everything literally. Then they go down to the harbour market: a moored sailing
// ship with cargo nets, stacked crates and sacks of grain, a fish stall on ice, a crane,
// gulls, a chalkboard of prices and the harbourmaster's notice board. The economist sets
// each muddle straight, curtly.
//
// WHAT IT RECAPS, LESSON BY LESSON (each line is taken from what that lesson said):
//   1 What Is Economics? — wants never run out, but money, time and goods do (scarcity);
//     a price is a signal of how scarce something is (beats 2, 4, 6).
//   2 Supply and Demand — demand is how much people want to buy at each price; supply is
//     how much sellers offer; the price moves when either one changes; more umbrellas
//     from the van brought the price down (beats 4–8).
//   3 What Does It Really Cost? — what you give up is the opportunity cost, the next best
//     thing; even something free costs your time (beats 9–10).
//   4 Why Do People Trade? — doing one job well is specialising; trade swaps what you make
//     for what you need; a fair trade leaves both sides better off (beats 13–17).
//   5 The Rat-Tail Reward — an incentive is a reward that changes what people do; people
//     chase the reward, not what you meant; reward the result you want (beats 18–20).
//   6 Too Much Treasure — more money chasing the same goods pushes prices up, which is
//     inflation; money is only worth what it can buy (beats 11–12).
//
// Every line is written for the ear (groups AC/AD), from its speaker's character
// (cast.ts, AP14; group AS), and spoken in the natural style (AP22).
// ─────────────────────────────────────────────────────────────────────────────

export interface Econ7Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * work — the economist alone in the exchange at dawn: chalks prices on the slate board,
   *   taps the chalk, turns a ledger page, glances at the ticker under its glass dome ·
   * arrive — the woman with the bun comes in through the big doors with a crate of
   *   tomatoes on her hip, sets it down and looks round the hall, delighted ·
   * scarce — the economist waves the chalk along the board's rows of prices ·
   * coffee — she spots the coffee urn and points at it, beaming ·
   * demand — the economist taps the UMBRELLAS slate on the board with the chalk ·
   * ticker — she leans over the ticker machine and pulls up its paper tape to read it ·
   * umbrella — she opens her hands over her head like an umbrella ·
   * supply — the economist shakes his head and draws a delivery van in chalk under the slate ·
   * freecup — she fills a cup at the urn and sips from it ·
   * cost — the economist points at the cup in her hand, then at the pink dawn in the window ·
   * mint — she reads the ticker tape again and throws her arms up ·
   * inflate — the economist picks a coin off the brass balance's pan and holds it up ·
   * harbour — both walk down to the harbour market; she carries her crate of tomatoes ·
   * special — the economist points at her crate, then at the fish stall ·
   * swap — she hands her crate to the fisher and comes back with a fish ·
   * fair — the economist folds his arms and sighs ·
   * sacks — she drags three sacks of litter up to the harbourmaster's notice board ·
   * incentive — the economist looks from the sacks to the notice board and back ·
   * rest — both at ease on the quay under the quotation, gulls and the ship behind.
   */
  act?: 'work' | 'arrive' | 'scarce' | 'coffee' | 'demand' | 'ticker' | 'umbrella' | 'supply' | 'freecup' | 'cost' | 'mint' | 'inflate' | 'harbour' | 'special' | 'swap' | 'fair' | 'sacks' | 'incentive' | 'rest';
  /** Where they are: 0 the exchange · 1 the harbour market. */
  place?: number;
  /** What she holds: 0 nothing · 1 a coffee cup · 2 her crate of tomatoes · 3 a fish. */
  holds?: number;
  /**
   * First question on the stage — CHALK THE BOARD: three chalk marks waiting on the ledge
   * under the price board's UMBRELLAS slate, an UP arrow, a DOWN arrow and a LEVEL line;
   * the one that belongs on the slate is the one to tap.
   */
  board?: boolean;
  /**
   * Second question on the stage — SWAP AT THE QUAY: three things by her feet on the
   * quay, her crate of tomatoes, a borrowed fishing rod and an empty wicker basket; the one
   * to carry to the fish stall is the one to tap.
   */
  swap?: boolean;
  /**
   * Third question on the stage — PIN THE NOTICE: three paper notices in the
   * harbourmaster's hand by his board, A COIN PER SACK OF LITTER, A COIN PER CLEAN BERTH
   * and A COIN PER BROOM BOUGHT; the one to pin up is the one to tap.
   */
  notice?: boolean;
}

export const BEATS: Econ7Beat[] = [
  {
    bed: 'room',
    sfx: [{ id: 'chalk', at: 1.1, gain: 0.7 }, { id: 'chalktap', at: 2.4, gain: 0.6 }, { id: 'paper', at: 3.8, gain: 0.6 }, { id: 'chalk', at: 5.0, gain: 0.7 }],
    voiceAfter: 6.2,
    act: 'work', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Wheat up, wool down. And nobody here yet to argue with me.',
    pace: 'even',
    dur: 2.0,
  },
  {
    act: 'arrive', place: 0, holds: 0,
    speaker: 'bun',
    text: 'Good morning! Is this the shop where you can buy everything?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalktap', at: 1.2, gain: 0.6 }],
    act: 'scarce', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'It’s an exchange, and nobody gets everything. Wants never run out, but money, time and goods do, and that’s scarcity.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'coffee', place: 0, holds: 0,
    speaker: 'bun',
    text: 'My wants run out. All I want is a coffee.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalktap', at: 0.8, gain: 0.6 }],
    act: 'demand', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Then you’re one of many. How much people want to buy at each price is demand, and the price climbs with it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'paper', at: 0.4, gain: 0.6 }],
    act: 'ticker', place: 0, holds: 0,
    speaker: 'bun',
    text: 'Ooh, this little machine prints the news. It says rain all week, which is lovely for my tomatoes.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    place: 0, holds: 0, board: true,
    interact: {
      prompt: 'Rain all week, and no more umbrellas for sale. Which mark goes on the umbrella slate?',
      explain: 'The up arrow. More people want umbrellas and no more are for sale, so the price rises. The down arrow needs more umbrellas for sale, and the level line says nothing changed.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'umbrella', place: 0, holds: 0,
    speaker: 'bun',
    text: 'Like the umbrella man! Then the rain stopped, and all his umbrellas got cheap.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'chalk', at: 1.0, gain: 0.7 }],
    act: 'supply', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'The rain never stopped. The van brought more umbrellas, and more supply is what brought the price down.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'pourcup', at: 0.2, gain: 0.5 }, { id: 'cup', at: 2.0, gain: 0.6 }],
    act: 'freecup', place: 0, holds: 1,
    speaker: 'bun',
    text: 'Well, the coffee’s free. So this morning cost me nothing at all.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'cost', place: 0, holds: 1,
    speaker: 'tophat',
    text: 'It cost you your lie-in. Even a free choice costs the next best thing you gave up, its opportunity cost.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'paper', at: 0.3, gain: 0.6 }, { id: 'cup', at: 2.2, gain: 0.5 }],
    act: 'mint', place: 0, holds: 0,
    speaker: 'bun',
    text: 'The machine says the mint has made twice as many coins. So everyone’s twice as rich!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'coin', at: 0.6, gain: 0.7 }],
    act: 'inflate', place: 0, holds: 0,
    speaker: 'tophat',
    text: 'Twice the coins for the same bread means twice the prices. That’s inflation, and money’s only worth what it can buy.',
    pace: 'even',
    dur: 2.1,
  },
  {
    bed: 'market',
    act: 'harbour', place: 1, holds: 2,
    speaker: 'bun',
    text: 'I’ve got a whole crate of tomatoes, and nothing for lunch. Maybe I’ll catch a fish myself.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'special', place: 1, holds: 2,
    speaker: 'tophat',
    text: 'You’d fish badly and grow fewer tomatoes. Doing the job you’re good at is specialising, so swap for the rest.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 1, holds: 2, swap: true,
    interact: {
      prompt: 'She wants fish for lunch. What should she take to the fish stall?',
      explain: 'Her crate of tomatoes. She grows them well and the fisher catches fish well, so a swap gives them both more. The fishing rod means doing a job badly, and the empty basket has nothing to trade.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'swap', place: 1, holds: 3,
    speaker: 'bun',
    text: 'The fisher’s got my tomatoes, and I’ve got a fish. So which of us lost?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'fair', place: 1, holds: 3,
    speaker: 'tophat',
    text: 'Neither of you, and do keep up. A fair trade leaves both sides better off.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'sacks', place: 1, holds: 0,
    speaker: 'bun',
    text: 'Oh, and the harbourmaster pays a coin for every sack of litter. I’ve brought three from home!',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'incentive', place: 1, holds: 0,
    speaker: 'tophat',
    text: 'So the quay is dirtier than before. A reward that changes what people do is an incentive, and people chase the reward.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 1, holds: 0, notice: true,
    interact: {
      prompt: 'The harbourmaster wants a clean quay. Which notice should he pin up?',
      explain: 'A coin per clean berth. It pays for the clean quay he wants. A coin per sack pays people to bring litter from home, and a coin per broom pays for brooms, not sweeping.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'rest', place: 1, holds: 0,
    quote: {
      id: 'lq-economics-foundations-7-1',
      text: 'It is not from the benevolence of the butcher, the brewer, or the baker, that we expect our dinner, but from their regard to their own interest.',
      author: 'Adam Smith',
      work: 'The Wealth of Nations, Book I, Chapter 2',
      era: '1776',
      branchSlugs: ['economics'],
    },
    dur: 3.0,
  },
  {
    place: 1, holds: 0,
    summary: {
      title: 'Economics Recap: Dawn at the Exchange',
      points: [
        'Prices move when supply or demand changes',
        'A choice costs the next best thing you gave up',
        'Fair trades help both sides, and rewards change what people do',
      ],
      closing: 'Next time you see a price, ask what it’s telling you, and what you gave up to pay it.',
    },
    dur: 2.8,
  },
];
