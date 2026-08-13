import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-33',
  slug: 'how-much-is-required',
  title: 'How Much Is Morally Required?',
  description: 'Giving is good. At what point does good stop and required begin?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Everyone agrees you should give something. How much?',
      subtext: 'The moment you answer, you have taken a side.',
      emoji: '🪙',
    },
    {
      type: 'concept',
      title: 'The Demandingness Objection',
      body: 'If preventing serious harm at small cost is required, the requirement does not stop at one donation. There is always another life you could save by giving a little more, right up to the point where you are as badly off as the people you are helping.',
      visual: '⬆️',
      highlight: 'Where does it stop?',
    },
    {
      type: 'example',
      title: 'Two Answers, Both Uncomfortable',
      scenario: 'Peter Singer bit the bullet: morality really is that demanding and we have simply been ignoring it. Susan Wolf pushed back, arguing that a life given over entirely to duty is not an ideal human life but a diminished one.',
      source: 'Wolf, "Moral Saints" (1982)',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-33',
      quote: 'A moral saint will have to be very nice indeed, and it is unlikely that he will be funny.',
      author: 'Susan Wolf',
      era: '1982',
    },
    {
      type: 'question',
      prompt: 'What is the demandingness objection actually objecting to?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'That the principle, followed honestly, leaves you no life of your own', isCorrect: true },
          { id: 'b', text: 'That giving to strangers does no measurable good', isCorrect: false },
          { id: 'c', text: 'That we have no duties to people far away', isCorrect: false },
          { id: 'd', text: 'That charity should be voluntary rather than obligatory', isCorrect: false },
        ],
        explanation: 'The objection grants the principle and follows it. If every pound that could prevent serious harm is owed, then so is the next one, and the objection is that nothing in the argument ever says stop.',
      },
    },
    {
      type: 'question',
      prompt: 'Singer replies that a demanding conclusion is not a false one. Is that fair?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Partly — an argument is not refuted by being unwelcome, though our reaction is evidence too', isCorrect: true },
          { id: 'b', text: 'No — if a conclusion is hard to live by it must be wrong', isCorrect: false },
          { id: 'c', text: 'Yes, completely — how we feel about a conclusion is never relevant', isCorrect: false },
          { id: 'd', text: 'No, because moral claims cannot be argued for at all', isCorrect: false },
        ],
        explanation: 'Both extremes are too quick. Difficulty is not disproof, and Singer is right that we would not accept "too demanding" from someone refusing to wade into the pond. But a settled, near-universal reaction is data about morality, not just noise — which is why this is still live.',
      },
    },
    {
      type: 'summary',
      title: 'Where The Line Sits',
      keyPoints: [
        'The pond argument does not obviously stop at one donation',
        'Followed strictly, it leaves you nothing of your own',
        'Wolf: a life of pure duty is diminished, not ideal',
        'Difficulty is not disproof — but it is evidence',
      ],
      closingThought: 'Almost nobody defends the far end of this line. Almost nobody can say why it is wrong.',
    },
  ],
};

export default lesson;
