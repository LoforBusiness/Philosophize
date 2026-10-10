import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic business-amazon-1, "Cadabra in the Garage" — the first lesson of
// Business's second unit, the story of Amazon (LESSON_RULES group AW), and a DIALOGUE
// lesson (group AP).
// AW: story
// Theme: A MANHATTAN OFFICE AT NIGHT, A PRINTOUT CHART, A SOFTWARE BOX, A MUSIC CD, A
// HARDBACK BOOK; AN OLD CHEVY BLAZER ON THE INTERSTATE, A LAPTOP, A ROAD ATLAS; A GARAGE
// IN BELLEVUE, A POT-BELLIED STOVE, WOODEN DOORS MADE INTO DESKS.
//
// THE STORY. Spring 1994: Jeff Bezos, thirty, is a senior vice president at the hedge
// fund D. E. Shaw in New York. He reads that use of the World Wide Web is growing about
// 2,300 percent a year, and decides the thing to do is open a shop on it. He makes a list
// of about twenty products that could be sold online (software, office supplies, clothes,
// music, books among them) and picks books: more than three million titles were in print,
// far more than the biggest bookshop could stock, and the big book wholesalers, Ingram and
// Baker & Taylor, already kept every title listed in catalogues. His boss, David Shaw,
// takes him on a long walk in Central Park: a good idea, he says, but a better one for
// somebody who doesn't already have a good job, and he asks him to think for two days.
// Bezos imagines himself at eighty and decides he would not regret failing but would
// regret never trying (his "regret-minimisation framework"). He leaves in the middle of
// the year, giving up his annual bonus. In July 1994 he and his wife MacKenzie fly to
// Fort Worth, Texas, take his father's 1988 Chevy Blazer, and drive to Seattle; she
// drives while he types the business plan and revenue forecasts on a laptop. He chose
// Seattle for three reasons: it was close to Ingram's big book warehouse in Roseburg,
// Oregon; Microsoft had filled it with software engineers; and Washington was a small
// state, so few customers would have to be charged its sales tax (a shop collected sales
// tax only where it had a physical presence). The company is incorporated as Cadabra,
// and works from the garage of a rented house in Bellevue, heated by a pot-bellied stove.
// Bezos builds desks out of wooden doors from Home Depot. The first employee is the
// programmer Shel Kaphan. A lawyer, Todd Tarbert, hears "Cadabra" on the phone as
// "cadaver", and the name is changed to Amazon early in 1995 (lesson 2).
//
// SOURCES: Brad Stone, The Everything Store: Jeff Bezos and the Age of Amazon (2013),
// chapter 1; Robert Spector, Amazon.com: Get Big Fast (2000); Jeff Bezos, interview with
// the Academy of Achievement (4 May 2001) for the eighty-year-old and the regret; Amazon's
// own "door desk" history (aboutamazon.com). Numbers are as Bezos and Stone give them.
//
// THE UNIT PLAN (six lessons, one company):
//   1 Cadabra in the Garage (1994) — the chart, choosing books, quitting, the drive, the garage.
//   2 Ding! Every Order (1995) — the name Amazon, the launch in July, a bell for every
//     order, packing on the floor, orders from all fifty states in a month.
//   3 Get Big Fast (1997–98) — the IPO at eighteen dollars, Barnes & Noble goes online,
//     the lawsuit and "Amazon.toast", growing past books.
//   4 The Crash (2000–01) — the dot-com bust, shares under ten dollars, layoffs, and
//     the flywheel: lower prices, more customers, more sellers.
//   5 Two Days, Free (2005) — Prime, the fulfilment centres, how an order moves from a
//     shelf to a van.
//   6 The Shop Behind the Shop (2006) — Amazon Web Services: renting out the computers.
//
// THE CAST, IN ROLE (AW2):
//   plain  — JEFF BEZOS, 1994: blue oxford shirt and khakis (garb.ts bezos). His vanity
//            (AS3) is a founder's certainty, kept affectionate.
//   tophat — DAVID E. SHAW, his boss: navy suit and red tie (bossSuit). An irritable man
//            (AS2) whose best employee is leaving to sell books.
//   bun    — MACKENZIE BEZOS, at the wheel: green sweater and jeans (sweater) under her
//            bun. Oblivious (AS5) in a cheerful, literal way, never foolish.
//   cap    — SHEL KAPHAN, the first employee: t-shirt and jeans (tshirt). Kind and
//            helpful (AS4): he holds the door while it becomes a desk.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character (AS),
// and spoken in the natural style (AP22).
// ─────────────────────────────────────────────────────────────────────────────

export interface Amazon1Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * chart — night in the office: Bezos alone at his desk under a lamp, tears a long
   *   printout off a dot-matrix printer and holds it up; a line on it climbs almost
   *   straight up; the skyscrapers glow in the window behind ·
   * boss — Shaw comes in through the glass door, coat over his arm, and stops at the desk ·
   * list — Bezos pins a typed list of twenty products to the cork board and runs a
   *   pencil down it, line by line ·
   * pick — Shaw folds his arms and nods at the three things on the desk: a software box,
   *   a music CD and a hardback book ·
   * books — Bezos picks up the book, holds it high, and sweeps his other hand toward the
   *   window as if the shelves went on for ever ·
   * warn — Shaw sits on the corner of the desk and taps the book with one finger ·
   * regret — Bezos stands at the window, hands behind his back, looking out at the city ·
   * leave — Shaw holds the glass door open and points through it; Bezos picks up a
   *   cardboard box of his things ·
   * drive — the interstate across open plains at dusk: MacKenzie at the wheel of the old
   *   brown-and-tan Blazer, Bezos in the passenger seat with a laptop on his knees ·
   * plan — Bezos taps the road atlas spread on the dashboard without looking up ·
   * seattle — Bezos folds the atlas so the Seattle page is on top and points ahead ·
   * typing — MacKenzie glances at the laptop; Bezos types fast, a spreadsheet on screen ·
   * draft — Bezos pats the laptop like a precious thing and goes back to typing ·
   * arrive — autumn, the garage in Bellevue: a black pot-bellied stove, extension cords
   *   across the concrete, a workbench; Kaphan walks in with a backpack and waves ·
   * doors — Bezos drags a plain wooden door off a stack and lays it across two sawhorses ·
   * drill — Kaphan holds the door steady while Bezos drills a leg onto one corner ·
   * name — MacKenzie hangs a hand-lettered sign on the garage wall: CADABRA ·
   * cadabra — Bezos spreads his arms under the sign like a magician ·
   * cadaver — Kaphan gently lowers one of Bezos's arms and points at the sign ·
   * rest — the garage at night, the stove glowing, the door desk finished, under the
   *   quotation.
   */
  act?: 'chart' | 'boss' | 'list' | 'pick' | 'books' | 'warn' | 'regret' | 'leave' | 'drive' | 'plan' | 'seattle' | 'typing' | 'draft' | 'arrive' | 'doors' | 'drill' | 'name' | 'cadabra' | 'cadaver' | 'rest';
  /** Where they are: 0 the office in New York · 1 the Blazer on the interstate · 2 the garage in Bellevue. */
  place?: number;
  /**
   * First question on the stage — STOCK THE SHELF: an empty bookcase-style shelf beside
   * Bezos's desk, and on the desk a boxed software disk, a music CD in its case and a
   * hardback book. The reader taps the one Bezos will sell first, and it slides onto the
   * shelf, which then fills and fills past the edge of the frame.
   */
  shelf?: boolean;
  /**
   * Second question on the stage — PIN THE MAP: the road atlas open on the Blazer's
   * dashboard with three red pins, at SEATTLE, SAN FRANCISCO and BOULDER. The reader
   * calls which city the car is heading for before Bezos says it; the right pin lights
   * and the road ahead turns toward the mountains and the sea.
   */
  map?: boolean;
}

export const BEATS: Amazon1Beat[] = [
  {
    bed: 'room',
    music: 'mentertainer',
    sfx: [{ id: 'typing', at: 0.15, gain: 0.55 }, { id: 'tear', at: 2.2, gain: 0.6 }, { id: 'paper', at: 3.55, gain: 0.5 }, { id: 'pencil', at: 5.3, gain: 0.55 }],
    voiceAfter: 6.0,
    act: 'chart', place: 0,
    speaker: 'plain',
    text: 'Two thousand three hundred percent in a year. And I’m the only person in New York who’s noticed.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'door', at: 0.0, gain: 0.6 }, { id: 'doorshut', at: 1.37, gain: 0.45 }],
    voiceAfter: 2.4,
    act: 'boss', place: 0,
    speaker: 'tophat',
    text: 'It’s late, Bezos, and you’re grinning at a printout. Explain, or go home.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'pin', at: 0.42, gain: 0.6 }, { id: 'pencil', at: 1.9, gain: 0.5 }],
    act: 'list', place: 0,
    speaker: 'plain',
    text: 'That’s how fast the web is growing, David, and nothing else grows like it. So I’ve made a list of twenty things to sell on it.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'pick', place: 0,
    speaker: 'tophat',
    text: 'Twenty things, and you haven’t opened a single shop. Pick one, and then go home.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 0, shelf: true,
    interact: {
      prompt: 'Software, music or books: which one will Bezos sell first?',
      explain: 'The book. Over three million books were in print, far more than any shop could stock. And book wholesalers already listed every one in catalogues. Software and music had far fewer titles, so big shops could carry most of them already.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'book', at: 2.35, gain: 0.7 }],
    act: 'books', place: 0,
    speaker: 'plain',
    text: 'Books, of course. No bookshop can hold three million titles, but a website can list them all.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'creak', at: 0.85, gain: 0.45 }, { id: 'knock', at: 1.65, gain: 0.4 }, { id: 'knock', at: 4.15, gain: 0.4 }],
    act: 'warn', place: 0,
    speaker: 'tophat',
    text: 'It’s a good idea, I’ll admit. It’s a better idea for someone who doesn’t already have a good job.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'book', at: 0.5, gain: 0.6 }],
    act: 'regret', place: 0,
    speaker: 'plain',
    text: 'I pictured myself at eighty. I wouldn’t regret failing, but I’d regret never trying.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'box', at: 0.8, gain: 0.7 }, { id: 'shed', at: 3.45, gain: 0.6 }, { id: 'doorshut', at: 'tail', gain: 0.45 }],
    act: 'leave', place: 0,
    speaker: 'tophat',
    text: 'You’ll walk out halfway through the year and lose your bonus. Shut the door on your way out.',
    pace: 'even',
    dur: 2.1,
  },
  {
    bed: 'wind',
    act: 'drive', place: 1,
    speaker: 'bun',
    text: 'Your dad’s old Blazer drives beautifully! Remind me where we’re going again?',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'paper', at: 0.55, gain: 0.5 }],
    act: 'plan', place: 1,
    speaker: 'plain',
    text: 'A city near the books, full of coders, in a small state. I chose it weeks ago, like a genius.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    place: 1, map: true,
    interact: {
      prompt: 'Near a book warehouse, full of coders, few customers paying sales tax. Which city are they driving to?',
      explain: 'Seattle. It was near Ingram’s big book warehouse, full of Microsoft’s coders, and only Washington’s few shoppers paid its sales tax. San Francisco has millions of Californians who’d pay tax. Boulder was far from the books.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'pageturn', at: 0.25, gain: 0.7 }],
    act: 'seattle', place: 1,
    speaker: 'plain',
    text: 'Seattle. The biggest book warehouse is a day away, and the whole town is full of programmers.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'typing', at: 0.6, gain: 0.55 }],
    act: 'typing', place: 1,
    speaker: 'bun',
    text: 'You’ve been typing since Texas. Should I drive slower so the numbers don’t spill?',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'typing', at: 1.7, gain: 0.5 }],
    act: 'draft', place: 1,
    speaker: 'plain',
    text: 'It’s the business plan, and the numbers are holding on fine. One day, people will study this draft.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    bed: 'fire',
    sfx: [{ id: 'door', at: 0.25, gain: 0.6 }, { id: 'doorshut', at: 1.42, gain: 0.45 }],
    voiceAfter: 2.4,
    act: 'arrive', place: 2,
    speaker: 'cap',
    text: 'Hi, I’m Shel Kaphan. I’ve written software for years, and I’d love to help you build this.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'crate', at: 1.3, gain: 0.6 }, { id: 'plank', at: 3.92, gain: 0.7 }],
    act: 'doors', place: 2,
    speaker: 'plain',
    text: 'Welcome to head office. Desks cost too much, so we’re making ours out of doors.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'crank', at: 1.95, gain: 0.6 }, { id: 'knock', at: 2.4, gain: 0.5 }],
    act: 'drill', place: 2,
    speaker: 'cap',
    text: 'Good thinking, Jeff. I’ll hold it steady while you put the legs on.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'creak', at: 0.65, gain: 0.45 }, { id: 'pin', at: 1.7, gain: 0.6 }],
    act: 'name', place: 2,
    speaker: 'bun',
    text: 'I love it in here! What’s the shop called, again?',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'creak', at: 0.25, gain: 0.4 }, { id: 'whoosh', at: 4.2, gain: 0.55 }],
    act: 'cadabra', place: 2,
    speaker: 'plain',
    text: 'Cadabra, as in abracadabra. You wish for a book, and it appears like magic.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'cadaver', place: 2,
    speaker: 'cap',
    text: 'Our lawyer heard it on the phone and thought you’d said cadaver. That means a dead body, Jeff.',
    pace: 'even',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'modem', at: 0.5, gain: 0.5 }],
    act: 'rest', place: 2,
    quote: {
      id: 'lq-business-amazon-1-1',
      text: 'I knew that if I failed I wouldn’t regret that, but I knew the one thing I might regret is not ever having tried.',
      author: 'Jeff Bezos',
      work: 'Interview with the Academy of Achievement, 4 May 2001',
      era: '2001',
      branchSlugs: ['business'],
    },
    dur: 3.0,
  },
  {
    place: 2,
    summary: {
      title: 'Cadabra in the Garage',
      points: [
        'In 1994 Bezos saw the web growing at astonishing speed',
        'He chose books, because no shop could stock them all',
        'He quit, drove west and started work in a Bellevue garage',
      ],
      closing: 'The shop needed a better name, and its very first order. Next, a bell rings every time someone buys a book.',
    },
    dur: 2.8,
  },
];
