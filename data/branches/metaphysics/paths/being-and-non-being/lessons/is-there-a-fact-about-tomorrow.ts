import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-40',
  slug: 'is-there-a-fact-about-tomorrow',
  title: 'Is There a Fact About Tomorrow?',
  description: 'Either there will be a sea battle tomorrow or there will not. Say that today, and the day after seems to be settled already.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Tomorrow either rains or it does not.',
      subtext: 'That sounds harmless. Aristotle thought it might close the future.',
      emoji: '📖',
    },
    {
      type: 'concept',
      title: 'The Rule That Looks Empty',
      body: 'Logic has a rule that every statement is either true or false. Apply it to a statement about tomorrow and something odd happens. If it is already true, then tomorrow is already one way rather than the other, and nobody has done anything yet.',
      visual: '⚖️',
      highlight: 'tomorrow is already one way rather than the other',
    },
    {
      type: 'example',
      title: 'The Sea Battle',
      scenario: 'Aristotle imagined admirals arguing the night before. One says there will be a battle at dawn. The other says there will not. One of them is right, and was right while they spoke. So the morning was fixed before either admiral chose anything.',
      source: 'Aristotle, On Interpretation IX',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-40',
      quote: 'A sea-fight must either take place tomorrow or not, but it is not necessary that it should take place tomorrow.',
      author: 'Aristotle',
      era: 'c. 350 BCE',
      philosopherId: 'aristotle',
    },
    {
      type: 'question',
      prompt: 'If every statement is already true or false, what does tomorrow hold?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'One of the two outcomes, already', isCorrect: true },
          { id: 'b', text: 'Both outcomes, until the day arrives', isCorrect: false },
          { id: 'c', text: 'Nothing at all, until the day arrives', isCorrect: false },
          { id: 'd', text: 'Whichever outcome people expect', isCorrect: false },
        ],
        explanation: 'One of the two. That is what the rule says, applied to a day that has not happened. Holding both at once is not an option any logic offers. Holding nothing is a real escape, and it is the one Aristotle reaches for, but it costs him the rule.',
      },
    },
    {
      type: 'question',
      prompt: 'Where does the argument for a fixed future actually slip?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Being true and being unavoidable are not the same', isCorrect: true },
          { id: 'b', text: 'Statements about the future are meaningless', isCorrect: false },
          { id: 'c', text: 'Nobody can know what tomorrow holds', isCorrect: false },
          { id: 'd', text: 'The two admirals might both be wrong', isCorrect: false },
        ],
        explanation: 'Truth is not force. It is true that you will finish this sentence, and you are finishing it anyway. Calling future statements meaningless throws out weather forecasts with the fatalism, and our ignorance is beside the point: the worry was never about what anyone knows.',
      },
    },
    {
      type: 'summary',
      title: 'The Blank Line',
      keyPoints: [
        'Bivalence says every statement is true or false',
        'Applied to tomorrow, it seems to settle tomorrow',
        'Aristotle left the future statement neither, for now',
        'The other escape is to deny that true means forced',
      ],
      closingThought: 'Every answer here costs something — a rule of logic, or an open tomorrow. Deciding which you would rather pay is the whole exercise.',
    },
  ],
};

export default lesson;
