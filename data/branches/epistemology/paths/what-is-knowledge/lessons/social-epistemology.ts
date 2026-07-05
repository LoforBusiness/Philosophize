import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-20',
  slug: 'social-epistemology',
  title: 'Knowing Together In A Noisy World',
  description: 'Capstone: misinformation, echo chambers, and how groups know or fail to.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You are smart. Why can the group still be wrong?',
      subtext: 'Almost no belief you hold was tested by you alone.',
      emoji: '📣',
    },
    {
      type: 'concept',
      title: 'Knowledge Is a Team Sport',
      body: 'You did not personally verify that the Earth is round or that vaccines work. You trust a web of witnesses, experts, and institutions. Most of what you know, you know on someone else’s say-so. Good knowing depends on a healthy social network of trust.',
      visual: '🕸️',
      highlight: 'testimony',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw…',
      body: 'Earlier you became an updater—change your mind when evidence arrives. You asked whom to trust. You became a fallibilist: you might be wrong. All three quietly assume corrections can still reach you.',
      emoji: '🔁',
    },
    {
      type: 'concept',
      title: 'When the Repair Mechanism Breaks',
      body: 'A bubble just leaves out other views—adding information pops it. A true echo chamber is worse: it teaches you, in advance, that outsiders are liars. So when good evidence arrives, it is read as proof the liars are at it again. The fix gets disarmed.',
      visual: '🛑',
      highlight: 'echo chamber',
    },
    {
      type: 'example',
      title: 'The Inoculation Trick',
      scenario: 'A pundit tells followers: “Mainstream scientists are paid to deceive you.” Later a study contradicts him. His audience does not weigh it—they cite it as more proof the scientists are bought. Every correction now strengthens his grip. The community is well-informed about the outside and still trapped, because trust itself was poisoned.',
      source: 'C. Thi Nguyen, “Echo Chambers and Epistemic Bubbles”',
      emoji: '🎙️',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-20',
      quote: 'The peculiar evil of silencing the expression of an opinion is robbing the human race.',
      author: 'John Stuart Mill',
      era: '1859',
      work: 'On Liberty',
      philosopherId: 'john-stuart-mill',
    },
    {
      type: 'question',
      prompt: 'Your friend says she is in an echo chamber, but “it’s fine—she reads opposing articles daily.” What is she missing?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          {
            id: 'a',
            text: 'Nothing—reading opposing views means she is not in an echo chamber.',
            isCorrect: false,
          },
          {
            id: 'b',
            text: 'An echo chamber just means seeing fewer opposing views, which she fixes by reading them.',
            isCorrect: false,
          },
          {
            id: 'c',
            text: 'A true echo chamber discredits outsiders, so even those articles get read as proof outsiders lie.',
            isCorrect: true,
          },
          {
            id: 'd',
            text: 'She should stop reading anything to avoid being influenced at all.',
            isCorrect: false,
          },
        ],
        explanation:
          'Correct: C. The tempting answer (B) commits the bubble–chamber conflation. A bubble is mere lack of exposure—more information pops it. A true echo chamber preemptively discredits outside sources, so the very articles she reads are reinterpreted as further evidence the outsiders are lying. Adding information cannot fix a system built to neutralize it.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Most knowledge rests on trusting others.',
        'A bubble lacks exposure; more info pops it.',
        'An echo chamber poisons trust in outsiders.',
        'It disarms correction by predicting it.',
      ],
      closingThought:
        'The open-to-correction mind this path built can be socially disabled—so guard not just your views, but your trust.',
    },
  ],
};

export default lesson;
