import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-25',
  slug: 'the-problem-of-the-criterion',
  title: 'How Do You Check Your Own Ruler?',
  description: 'To know what counts as knowledge, you need a good method. But how do you check the method?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'To trust your method, you need a method to trust it.',
      subtext: 'And to trust that one… you see where this is going.',
      emoji: '📏',
    },
    {
      type: 'example',
      title: 'The Suspect Ruler',
      scenario:
        'You measure a table with a ruler and it reads one metre. But is the ruler accurate? To check, you compare it against a "true" metre standard. But how do you know that standard is correct? You would need another standard to verify it. To certify any measuring tool, you seem to need a tool you have already certified.',
      emoji: '📐',
    },
    {
      type: 'concept',
      title: 'The Problem of the Criterion',
      body: 'Two questions chase each other. (1) What do we know? (2) How do we decide what counts as knowledge—what is our criterion? To answer (1) you seem to need (2). But to pick a good criterion in (2), you need to already know some cases from (1). Each answer presupposes the other.',
      visual: '🔁',
      highlight: 'the criterion',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-25-1',
      quote: 'In order to decide whether things really are as they seem, we must possess a criterion. But to know the criterion is correct we need a proof; and to know the proof, a criterion.',
      author: 'Sextus Empiricus (paraphrase)',
      era: 'c. 200 CE',
      work: 'Outlines of Pyrrhonism',
      philosopherId: 'sextus-empiricus',
    },
    {
      type: 'concept',
      title: 'Two Ways Out',
      body: 'The methodist starts with a criterion—"only what is certain counts"—then sorts beliefs by it. The particularist starts the other way: "I clearly know I have hands," and builds the criterion to fit such obvious cases. One trusts the rule first; the other trusts clear examples first.',
      visual: '↔️',
      highlight: 'methodist vs particularist',
    },
    {
      type: 'reinforcement',
      callout: 'You just met a particularist.',
      body: 'Last lesson, G.E. Moore held up his hands and trusted the obvious case over the clever theory. That is the particularist move: start from things you plainly know, then craft a criterion that fits. The methodist, by contrast, picks the rule first and lets it decide the cases.',
      emoji: '✋',
    },
    {
      type: 'dilemma',
      scenario:
        'You want to figure out which of your beliefs really count as knowledge. But you cannot sort the beliefs without a standard, and you cannot pick a trustworthy standard without already sorting some beliefs. You have to start somewhere. Where do you put your first stake in the ground?',
      prompt: 'Where do you begin—the rule or the cases?',
      choices: [
        { id: 'a', label: 'Start with a strict criterion, then sort beliefs' },
        { id: 'b', label: 'Start with clear examples of knowing, then form a rule' },
        { id: 'c', label: 'Refuse to start; suspend judgment entirely' },
      ],
      views: [
        {
          thinker: 'Methodist (e.g. Descartes)',
          stance: 'Fix the criterion first.',
          why: 'Begin with a standard—accept only what is indubitable—then test every belief against it. The risk: a strict rule may throw out almost everything you ordinarily call knowledge.',
        },
        {
          thinker: 'Particularist (e.g. Moore, Chisholm)',
          stance: 'Trust the obvious cases first.',
          why: 'Begin from things you plainly know—"here is a hand"—and shape your criterion to fit them. The risk: how do you justify calling those starting cases knowledge without begging the question?',
        },
        {
          thinker: 'Pyrrhonian Skeptic',
          stance: 'You cannot honestly start.',
          why: 'Since each side needs the other, neither can justify its starting point. The consistent move is to suspend judgment and stop claiming knowledge at all.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'You can’t verify a method without a method',
        'The criterion problem links "what" and "how"',
        'Methodists start from a rule',
        'Particularists start from clear cases',
      ],
      closingThought: 'There may be no neutral ground floor. To inquire at all, you must, somewhere, simply begin.',
    },
  ],
};

export default lesson;
