import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-22',
  slug: 'the-experience-machine',
  title: 'Would You Plug In Forever?',
  description: 'Nozick built a tank that guarantees bliss. His real question: is pleasure all we want?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A machine promises a lifetime of perfect happiness.',
      subtext: 'You float in a tank, believing you live an amazing life. Would you plug in for good?',
      emoji: '🧠',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you met utilitarianism.',
      body: 'You saw the view that what matters is maximizing pleasure and minimizing pain. If that is true, a machine delivering endless pleasure should be the best possible life. Nozick designed a thought experiment to test exactly that claim.',
      emoji: '🔎',
    },
    {
      type: 'example',
      title: 'The Tank',
      scenario: 'Robert Nozick imagined a machine that can give you any experience you desire. Neuropsychologists stimulate your brain so you think and feel you are writing a great novel, making friends, or falling in love. Floating in the tank, you would not know it is all simulated. Programmed for a lifetime, it guarantees more pleasure than reality ever could.',
      source: 'Robert Nozick, Anarchy, State, and Utopia (1974)',
      emoji: '🛁',
    },
    {
      type: 'concept',
      title: 'Why Most People Refuse',
      body: 'Nozick argued that we would not plug in, and that reveals something. We want to actually do things, not just feel as if we do. We want to be a certain kind of person, not a blob in a tank. And we want contact with reality, not a man-made fantasy.',
      visual: '🌍',
      highlight: 'we want to do things, not just feel',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-22-1',
      quote: 'We learn that something matters to us in addition to experience by imagining an experience machine and then realizing that we would not use it.',
      author: 'Robert Nozick',
      era: '1974',
      work: 'Anarchy, State, and Utopia',
    },
    {
      type: 'question',
      prompt: 'Why does refusing the machine threaten the view that only pleasure matters?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It shows the machine cannot really produce pleasure', isCorrect: false },
          { id: 'b', text: 'It shows we value things besides our inner experiences, like truth and real achievement', isCorrect: true },
          { id: 'c', text: 'It shows pleasure is bad and pain is good', isCorrect: false },
          { id: 'd', text: 'It shows nobody actually cares about happiness', isCorrect: false },
        ],
        explanation: 'Option A is the tempting trap: it dodges the experiment by denying its premise. But the machine is stipulated to deliver maximal pleasure. The puzzle is precisely that even with guaranteed bliss, we hesitate. That hesitation suggests we care about more than how things feel from the inside — we want them to be real. Pleasure may be one good, but not the only one.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A friend, grieving and exhausted, says she would happily plug into the machine forever. "I just want to stop hurting and feel good," she says. "Reality has given me nothing. Why should authenticity matter more than a lifetime of joy I can guarantee?"',
      prompt: 'Has she found a flaw in Nozick’s argument?',
      choices: [
        { id: 'a', label: 'Yes, for her, pleasure really is all that matters' },
        { id: 'b', label: 'No, her grief, not the argument, drives the choice' },
      ],
      views: [
        {
          thinker: 'Hedonist',
          stance: 'She is right; well-being just is good experience.',
          why: 'If a life feels wonderful from the inside, what more could "well-being" mean? Calling the tank empty smuggles in a value she does not share. Her honest preference exposes our attachment to reality as mere bias.',
        },
        {
          thinker: 'Nozick',
          stance: 'Most still refuse, even craving relief.',
          why: 'The experiment asks what we would choose on reflection, not in despair. That nearly all of us recoil — even when bliss is promised — signals we value contact with reality and real doing, not just sensation.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'The experience machine guarantees maximal pleasure',
        'Most people would refuse to plug in',
        'We seem to value reality and real doing',
        'This challenges pleasure-only theories of the good',
      ],
      closingThought: 'If you would not plug in, you already believe a good life is more than how it feels.',
    },
  ],
};

export default lesson;
