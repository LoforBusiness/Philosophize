import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-17',
  slug: 'lying-and-promises',
  title: 'Is It Ever Right to Lie?',
  description: 'A killer asks where your friend is hiding. Kant says: do not lie. Really?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A murderer asks where your friend is. Do you lie?',
      subtext: 'The most famous test a moral rule ever failed. Or did it?',
      emoji: '🚪',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you met the Categorical Imperative.',
      body: 'Kant said: act only on a rule you could will for everyone. "Lie when convenient" fails — if all lied, words would mean nothing. So truthfulness became a perfect, exceptionless duty. Now watch that rule bite.',
      emoji: '⚖️',
    },
    {
      type: 'example',
      title: 'The Knock at the Door',
      scenario: 'In 1797 the writer Benjamin Constant pressed Kant with a case. A friend hides in your house. A would-be murderer knocks and asks where he is. Surely, said Constant, you may lie to save a life. Kant answered: no. You must not lie, even here. The reply scandalized readers and still does.',
      source: 'Kant, On a Supposed Right to Lie (1797)',
      emoji: '🔪',
    },
    {
      type: 'concept',
      title: 'Why Kant Will Not Budge',
      body: 'For Kant, a lie corrupts the very source of trust between people. You answer only for your own act, not for the murderer’s free choices. Tell the truth and any evil that follows is on him. Lie, and you make yourself the author of wrong.',
      visual: '🕯️',
      highlight: 'unconditional duty',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-17-1',
      quote: 'To be truthful in all declarations is therefore a sacred and unconditionally commanding law of reason that admits of no expediency whatsoever.',
      author: 'Immanuel Kant',
      era: '1797',
      work: 'On a Supposed Right to Lie from Philanthropy',
      philosopherId: 'immanuel-kant',
    },
    {
      type: 'dilemma',
      scenario: 'Your friend is hiding in your house. A man you know means to kill him knocks and asks, calmly, where he is. The truth dooms your friend; a lie may save him. The door is open. He is waiting for your answer.',
      prompt: 'At the door, do you lie?',
      choices: [
        { id: 'truth', label: 'Tell the truth; never lie' },
        { id: 'lie', label: 'Lie to save my friend' },
        { id: 'refuse', label: 'Refuse to answer at all' },
      ],
      views: [
        {
          thinker: 'Immanuel Kant',
          stance: 'never lie, whatever follows',
          why: 'Truthfulness is a duty owed to everyone, unconditionally. You are not responsible for the murderer’s choices, only your own. Lie, and you destroy the trust that words depend on.',
        },
        {
          thinker: 'Benjamin Constant',
          stance: 'the murderer forfeits the truth',
          why: 'A right to truth belongs only to those who would not abuse it. By coming to kill, the murderer has forfeited his claim. You may lie to shield the innocent.',
        },
        {
          thinker: 'J. S. Mill (consequentialist)',
          stance: 'of course lie; a life is at stake',
          why: 'Weigh the outcomes. Preventing a murder vastly outweighs the harm of one false sentence. A rule that forbids the lie here is a rule worth breaking.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt: 'A defender says, "Kant won’t lie because he ignores consequences entirely." Where does this go wrong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Kant denies the killing is bad — he simply does not care who dies', isCorrect: false },
          { id: 'b', text: 'Kant grants the death is terrible, but holds you answer only for your own act, not the murderer’s', isCorrect: true },
          { id: 'c', text: 'Kant thinks lying actually saves more lives than truth-telling', isCorrect: false },
          { id: 'd', text: 'Kant believes the murderer has a strict right to be told the truth', isCorrect: false },
        ],
        explanation: 'This is the straw-man fallacy: it caricatures Kant as heartless. He does not deny the death is awful. His claim is narrower — moral responsibility tracks your own freely chosen act, so the murderer’s crime is on the murderer, not on your honesty.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you weighed outcomes in the trolley case.',
      body: 'Here is exactly where a rule-based ethics and an outcome-based ethics tear apart. The utilitarian who counted five lives over one will count one saved life over one honest sentence — and lie without hesitation. Kant cannot follow him.',
      emoji: '🔀',
    },
    {
      // (E37c) The scene asks two graded questions; the data file has to ask the
      // same two. This mirrors the deck question in components/lesson/cinematic.
      type: 'question',
      prompt: 'Kant will not lie to the murderer at the door. What is he actually claiming?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'You answer for your own act; the murderer answers for his', isCorrect: true },
          { id: 'b', text: 'The death would not really be a bad thing', isCorrect: false },
          { id: 'c', text: 'Lying never in fact saves anybody', isCorrect: false },
          { id: 'd', text: 'The murderer has a right to the truth', isCorrect: false },
        ],
        explanation: 'That responsibility tracks your own freely chosen act. Kant does not deny the death is terrible — he denies that it lands on your account. The tempting answer is the caricature that he is indifferent to the killing, which is how he gets read as heartless when the argument is really about whose act it is.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Kant made truth-telling an exceptionless duty',
        'Even lying to a murderer counts as wrong',
        'You answer for your act, not others’ crimes',
        'Consequentialists lie to save the life',
      ],
      closingThought: 'A rule strong enough to be universal can also be strong enough to horrify. That tension is the price of moral certainty.',
    },
  ],
};

export default lesson;
