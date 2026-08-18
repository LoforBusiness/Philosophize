import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-35',
  slug: 'pushing-and-letting-go',
  title: 'Pushing and Letting Go',
  description: 'Same outcome, same reason, two very different verdicts.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'One man pushes. One man watches.',
      subtext: 'Both end up with the same result.',
      emoji: '🤲',
    },
    {
      type: 'concept',
      title: 'Doing and Allowing',
      body: 'Most people think making something happen is worse than letting it happen, even when the result and the motive are identical. Killing looks worse than failing to save. Whether that difference is real, or just easier to see, is the argument.',
      visual: '⚖️',
      highlight: 'making it happen versus letting it happen',
    },
    {
      type: 'example',
      title: 'Smith and Jones',
      scenario: 'Smith drowns his young cousin for the inheritance. Jones plans to, walks in as the boy slips under, and simply does not reach in. Rachels asks what your verdict on the two is, and whether you can defend the gap.',
      source: 'Rachels, "Active and Passive Euthanasia" (1975)',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-35',
      quote: 'The bare difference between killing and letting die does not, in itself, make a moral difference.',
      author: 'James Rachels',
      era: '1975',
    },
    {
      type: 'question',
      prompt: 'What is the Smith and Jones pair designed to isolate?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The bare doing/allowing difference, with motive and outcome held fixed', isCorrect: true },
          { id: 'b', text: 'Whether intentions matter more than consequences', isCorrect: false },
          { id: 'c', text: 'Whether family ties change what you owe someone', isCorrect: false },
          { id: 'd', text: 'Whether the law should treat the two men the same', isCorrect: false },
        ],
        explanation: 'Everything else is deliberately matched — same motive, same result, same relationship. Whatever is left when you compare them is the difference between doing and allowing, and only that.',
      },
    },
    {
      type: 'question',
      prompt: 'A defender of the distinction has a strong reply. Which?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Ordinary cases are not matched, and our rule is built for ordinary cases', isCorrect: true },
          { id: 'b', text: 'Letting die never causes any harm at all', isCorrect: false },
          { id: 'c', text: 'Only actions can be described, so only actions can be judged', isCorrect: false },
          { id: 'd', text: 'The pair is impossible, so it proves nothing', isCorrect: false },
        ],
        explanation: 'The pair is built to be identical, and real life almost never is: allowings usually involve less certainty, less control and weaker motives. A rule tuned to the usual case can be right without surviving a case designed to strip it bare.',
      },
    },
    {
      type: 'summary',
      title: 'Same Result, Two Verdicts',
      keyPoints: [
        'Doing usually strikes us as worse than allowing',
        'Matched pairs strip out everything else',
        'On matched pairs the gap shrinks or vanishes',
        'It may be a rule for the ordinary case, not a truth',
      ],
      closingThought: 'The distinction survives everywhere except the one place it was tested. That is either a defence of it or the case against it, and people who agree on all the facts still split.',
    },
  ],
};

export default lesson;
