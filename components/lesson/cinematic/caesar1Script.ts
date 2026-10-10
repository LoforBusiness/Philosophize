import type { BaseBeat } from './cinematicKit';

// ─────────────────────────────────────────────────────────────────────────────
// Cinematic history-caesar-1, "Caesar and the Pirates" — the first lesson of History's
// second unit, the life of Julius Caesar (LESSON_RULES group AW), and a DIALOGUE lesson
// (group AP).
// AW: story
// Theme: A ROMAN MERCHANT SHIP ON THE AEGEAN, A PIRATE GALLEY, THREE TREASURE CHESTS;
// THEN THE PIRATES' ISLAND COVE, A CAMPFIRE, A SCROLL OF POEMS, AND A FLEET BY NIGHT.
//
// THE STORY. 75 BC: Caesar, about twenty-five, is sailing to Rhodes to study speaking
// under the famous teacher Apollonius Molon. Cilician pirates take his ship near the
// island of Pharmacusa and ask twenty talents for him. He laughs that they don't know who
// they've caught and offers fifty. His friends go to the coastal cities to raise it; he
// stays thirty-eight days among the pirates, ordering them to be quiet while he sleeps,
// joining their games, reading them his poems and speeches, calling anyone who didn't
// admire them an uneducated barbarian, and promising, laughing, to crucify them all. They
// laugh too. The ransom comes from Miletus; he mans ships there, sails straight back,
// captures most of them and their silver, and jails them at Pergamum. The governor of
// Asia, Junius, eyes the money and puts off a decision, so Caesar goes back to the prison
// and has them crucified, as he had promised.
//
// SOURCES: Plutarch, Life of Caesar 1.8–2.7 (written about AD 100); Suetonius, Life of
// the Deified Julius 4 and 74 (about AD 121). A talent was about 26 kg of silver. Cilician
// pirates ruled much of the Mediterranean until Pompey cleared them in 67 BC.
//
// THE CAST, IN ROLE (AW2):
//   plain  — JULIUS CAESAR, young, in the toga with the purple stripe (garb.ts caesarYoung).
//            His vanity (AS3) is Caesar's own, told straight.
//   tophat — THE PIRATE CAPTAIN, red head wrap, gold hoop, a curved blade (pirateCaptain).
//            An irritable man (AS2) whose hostage will not behave like one.
//   cap    — A YOUNG PIRATE, ochre wrap (pirate). Kind and helpful (AS4): he carries the
//            silver, holds the scroll, and actually likes the poems.
//
// Every line is written for the ear (groups AC/AD), from its speaker's character (AS),
// and spoken in the natural style (AP22). The crucifixion is said, never drawn (AW4).
// ─────────────────────────────────────────────────────────────────────────────

export interface Caesar1Beat extends BaseBeat {
  /**
   * What happens across this beat (the scene choreographs it):
   * sail — Caesar alone at the rail of a Roman merchant ship, reading a scroll; the sail
   *   fills, the ship rolls gently, gulls ·
   * board — a pirate galley with a dark sail slides alongside; the captain and the young
   *   pirate jump down onto the deck, blades out ·
   * intro — Caesar turns, rolls up his scroll, smooths his toga, chin up ·
   * price — the captain looks him up and down and holds up two fingers twice: twenty ·
   * talent — the young pirate heaves one sack of silver onto his shoulder and staggers ·
   * fifty — Caesar sweeps a hand over the three chests and taps the one marked FIFTY ·
   * stunned — the captain's blade droops; he points off toward the island ·
   * island — the cove: the young pirate unrolls a mat for Caesar by the fire ·
   * sleep — Caesar lies on the mat, sits up and snaps at the pirates singing round the fire ·
   * sigh — the captain slumps on a rock beside the young pirate ·
   * poem — Caesar stands on a rock and reads from a scroll the young pirate holds open ·
   * clap — the young pirate claps; the captain doesn't ·
   * threat — Caesar wags a finger at them all, smiling ·
   * laugh — the captain throws his head back and laughs; the young pirate joins in ·
   * ransom — a rowing boat noses into the cove with two chests; the captain counts coins ·
   * fleet — night: Caesar on the bow of a Roman warship gliding into the cove, torches ·
   * caught — the captain and the young pirate stand with their hands tied ·
   * write — Caesar, back ashore, looks out to sea, pleased with himself ·
   * after — the captain, still tied, gives the reader a dry look ·
   * rest — the cove by night, the fleet at anchor, under the quotation.
   */
  act?: 'sail' | 'board' | 'intro' | 'price' | 'talent' | 'fifty' | 'stunned' | 'island' | 'sleep' | 'sigh' | 'poem' | 'clap' | 'threat' | 'laugh' | 'ransom' | 'fleet' | 'caught' | 'write' | 'after' | 'rest';
  /** Where they are: 0 the merchant ship at sea · 1 the pirates' cove by day · 2 the cove at night. */
  place?: number;
  /**
   * First question on the stage — PICK THE CHEST: three iron-bound chests on the deck,
   * chalked TEN, TWENTY and FIFTY (haggle the pirates down, pay what they ask, or tell them
   * to ask more). The chest Caesar will choose is the one to tap.
   */
  chests?: boolean;
  /**
   * Second question on the stage — SEAL THE ORDER: on a table at the prison in Pergamum,
   * the governor's sealed letter (wait for him), the iron key to the cells (let them go)
   * and Caesar's gold signet ring (give the order himself). The one Caesar uses is the one
   * to tap.
   */
  order?: boolean;
}

export const BEATS: Caesar1Beat[] = [
  {
    bed: 'ship',
    music: 'mcarnival',
    sfx: [{ id: 'creak', at: 1.0, gain: 0.5 }, { id: 'paper', at: 2.4, gain: 0.6 }, { id: 'rope', at: 3.8, gain: 0.5 }],
    voiceAfter: 6.0,
    act: 'sail', place: 0,
    speaker: 'plain',
    text: 'Rhodes by next week. The best teacher of speaking in the world, and soon, his best student.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'plank', at: 1.35, gain: 0.7 }, { id: 'crate', at: 2.12, gain: 0.7 }, { id: 'crate', at: 2.48, gain: 0.5 }],
    act: 'board', place: 0,
    speaker: 'tophat',
    text: 'Hands where I can see them! This ship belongs to the pirates of Cilicia now.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'paper', at: 0.4, gain: 0.6 }],
    act: 'intro', place: 0,
    speaker: 'plain',
    text: 'I’m Gaius Julius Caesar, and my family goes back to the goddess Venus. Do mind the toga.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'price', place: 0,
    speaker: 'tophat',
    text: 'A rich Roman boy, lovely. Twenty talents of silver, and you go home.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'coinpile', at: 0.55, gain: 0.6 }, { id: 'coin', at: 4.25, gain: 0.6 }],
    act: 'talent', place: 0,
    speaker: 'cap',
    text: 'That’s a lot, sir. One talent is about as much silver as a man can carry.',
    pace: 'even',
    dur: 1.8,
  },
  {
    place: 0, chests: true,
    interact: {
      prompt: 'The pirates want twenty talents for Caesar. Which chest does he pick?',
      explain: 'The chest marked fifty. Caesar laughed that they didn’t know who they’d caught, and told them to ask fifty. To him, twenty was an insult.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    sfx: [{ id: 'chest', at: 2.15, gain: 0.7 }, { id: 'coinpile', at: 2.6, gain: 0.5 }],
    act: 'fifty', place: 0,
    speaker: 'plain',
    text: 'Fifty, because twenty’s an insult to my family. My friends will raise the silver from the cities on the coast.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'stunned', place: 0,
    speaker: 'tophat',
    text: 'He’s raising his own price. Until the silver comes, you live on our island.',
    pace: 'even',
    dur: 2.1,
  },
  {
    bed: 'beach',
    act: 'island', place: 1,
    speaker: 'cap',
    text: 'Here’s your mat, sir. Pirates like us rule half this sea, so nobody’s coming to look for you.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'sleep', place: 1,
    speaker: 'plain',
    text: 'Quiet out there! Some of us are trying to sleep.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'sigh', place: 1,
    speaker: 'tophat',
    text: 'Thirty-eight days of this. He gives us orders like we’re his guards.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'paper', at: 0.3, gain: 0.6 }],
    act: 'poem', place: 1,
    speaker: 'plain',
    text: 'My new poem, and you’ll clap when I finish. Anyone who doesn’t is an uneducated barbarian.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'clap', at: 0.5, gain: 0.7 }, { id: 'clap', at: 0.95, gain: 0.7 }],
    act: 'clap', place: 1,
    speaker: 'cap',
    text: 'I liked the part about the sea, sir.',
    pace: 'even',
    dur: 1.8,
  },
  {
    act: 'threat', place: 1,
    speaker: 'plain',
    text: 'When I’m free, I’ll come back and crucify the lot of you.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'laugh', place: 1,
    speaker: 'tophat',
    text: 'He thinks he’s funny! Go on, everybody laugh.',
    pace: 'even',
    dur: 2.1,
  },
  {
    sfx: [{ id: 'oar', at: 0.2, gain: 0.6 }, { id: 'coinpile', at: 1.9, gain: 0.6 }, { id: 'coin', at: 3.18, gain: 0.6 }],
    act: 'ransom', place: 1,
    speaker: 'tophat',
    text: 'Fifty talents, all counted. Off you go, and try not to miss us.',
    pace: 'even',
    dur: 2.1,
  },
  {
    bed: 'sea',
    sfx: [{ id: 'oar', at: 1.6, gain: 0.6 }],
    act: 'fleet', place: 2,
    speaker: 'plain',
    text: 'I borrowed some ships at Miletus and came straight back. Did you miss me?',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    sfx: [{ id: 'rope', at: 0.3, gain: 0.5 }],
    act: 'caught', place: 2,
    speaker: 'tophat',
    text: 'Take us to the governor, then. He’ll sell us and keep the silver for himself.',
    pace: 'even',
    dur: 2.1,
  },
  {
    place: 2, order: true,
    interact: {
      prompt: 'The governor keeps putting it off, hoping for the silver. What does Caesar do?',
      explain: 'His signet ring. He gave the order himself. He went back to the prison and had them crucified, just as he’d promised while they laughed. The letter would have meant waiting, and the key would have set them free.',
      xp: 5,
    },
    dur: 1.0,
  },
  {
    act: 'write', place: 2,
    speaker: 'plain',
    text: 'Remember my kidnapping, every word. A writer will tell my story one day.',
    pace: 'brisk',
    dur: 1.8,
  },
  {
    act: 'after', place: 2,
    speaker: 'tophat',
    text: 'A Greek called Plutarch did, nearly two hundred years later. That’s how we know any of it.',
    pace: 'even',
    dur: 2.1,
  },
  {
    act: 'rest', place: 2,
    quote: {
      id: 'lq-history-caesar-1-1',
      text: 'Caesar laughed at them for not knowing who their captive was, and of his own accord agreed to give them fifty.',
      author: 'Plutarch',
      work: 'Life of Caesar, 2 (tr. Bernadotte Perrin)',
      era: 'c. AD 100',
      branchSlugs: ['history'],
    },
    dur: 3.0,
  },
  {
    place: 2,
    summary: {
      title: 'Caesar and the Pirates',
      points: [
        'Pirates kidnapped young Caesar on his way to Rhodes',
        'He raised his own ransom from twenty talents to fifty',
        'He promised revenge as a joke, then kept his word',
      ],
      closing: 'He was twenty-five, a prisoner, and already acting like the one in charge. Rome was about to meet him.',
    },
    dur: 2.8,
  },
];
