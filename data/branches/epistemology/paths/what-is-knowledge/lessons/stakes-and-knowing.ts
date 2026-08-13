import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-33',
  slug: 'stakes-and-knowing',
  title: 'Does "Know" Move When the Stakes Do?',
  description: 'Same evidence, same belief. Put money on it and you stop saying you know.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You knew it a second ago. Then it started to matter.',
      subtext: 'Nothing about the evidence changed in between.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'The Bar Moves',
      body: 'Ask whether the bank opens on Saturday and you will happily say you know, because you were there last Saturday. Say a missed payment costs you the house and the same memory suddenly feels thin. The evidence did not shrink. The standard rose.',
      visual: '📏',
      highlight: 'Enough for what?',
    },
    {
      type: 'example',
      title: 'The Bank Case',
      scenario: 'Keith DeRose built two versions of one afternoon. In both you drive past the bank, remember a Saturday queue, and decide to come back. In the second version a cheque has to clear or you lose the house — and you get out and check.',
      source: 'DeRose, on contextualism',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-33',
      quote: 'Enough is enough: it does not mean everything.',
      author: 'J. L. Austin',
      era: '1962',
    },
    {
      type: 'question',
      prompt: 'In the high-stakes version, what actually changed?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The standard the word "know" was being held to', isCorrect: true },
          { id: 'b', text: 'The strength of the memory the belief rests on', isCorrect: false },
          { id: 'c', text: 'Whether the bank was in fact open on Saturday', isCorrect: false },
          { id: 'd', text: 'Whether the belief was true', isCorrect: false },
        ],
        explanation: 'The memory is the same memory and the bank is doing whatever it was always going to do. What moved is how good a reason has to be before the word "know" is the right one — and the stakes are what moved it.',
      },
    },
    {
      type: 'question',
      prompt: 'Does raising the stakes make your belief less likely to be true?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — it only makes "I know" a harder thing to say', isCorrect: true },
          { id: 'b', text: 'Yes, because high stakes weaken the supporting evidence', isCorrect: false },
          { id: 'c', text: 'Yes, because truth itself depends on what is at risk', isCorrect: false },
          { id: 'd', text: 'No, because stakes have no bearing on anything epistemic', isCorrect: false },
        ],
        explanation: 'The tempting slide is from "I should not claim to know" to "I am probably wrong". They are different. The world is exactly as likely to cooperate either way; what changed is how much you should stake on it without checking.',
      },
    },
    {
      type: 'summary',
      title: 'Enough For What?',
      keyPoints: [
        'The same evidence can pass one test and fail another',
        'Stakes move the standard, not the evidence',
        '"I should check" is not "I am probably wrong"',
        'Contextualism: "know" carries its context with it',
      ],
      closingThought: 'Next time you hesitate to say you know, ask what changed. Usually it is not what you have. It is what it would cost to be wrong.',
    },
  ],
};

export default lesson;
