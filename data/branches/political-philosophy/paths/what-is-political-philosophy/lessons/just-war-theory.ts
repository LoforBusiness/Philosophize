import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-27',
  slug: 'just-war-theory',
  title: 'When Is War Just?',
  description: 'Between "war is always wrong" and "anything goes," there is a careful middle path.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Can killing thousands ever be the right thing to do?',
      subtext: 'Pacifists say never. Realists say morality stops at the border. Just war theory says: it depends, and here are the rules.',
      emoji: '⚔️',
    },
    {
      type: 'concept',
      title: 'A Middle Path',
      body: 'Just war theory rejects two extremes. Against pacifism, it holds that some wars can be justified. Against realism ("all is fair in war"), it insists that even war is bound by moral rules. The hard question is which wars, fought how.',
      visual: '🛤️',
      highlight: 'bound by moral rules',
    },
    {
      type: 'concept',
      title: 'Two Separate Questions',
      body: 'Just war theory splits into two parts. Jus ad bellum asks whether going to war is justified: a just cause, last resort, proportion, legitimate authority. Jus in bello asks whether the war is fought justly: spare civilians, use no more force than needed.',
      visual: '⚖️',
      highlight: 'ad bellum / in bello',
    },
    {
      type: 'example',
      title: 'The Just Cause, The Unjust Means',
      scenario: 'A country is invaded and fights back, a textbook just cause (ad bellum). But to hasten victory it firebombs an enemy city, killing civilians on purpose. Just war theory says: the cause may be right and the conduct still deeply wrong. The two judgments come apart.',
      source: 'Michael Walzer, Just and Unjust Wars (1977)',
      emoji: '🔥',
    },
    {
      type: 'quote',
      id: 'lq-political-political-27-1',
      quote: 'The theory of justice should point us, in the absence of compelling reasons of an entirely different kind, toward the violation of rights as the deepest wrong of war.',
      author: 'Michael Walzer',
      era: '1977',
      work: 'Just and Unjust Wars',
    },
    {
      type: 'reinforcement',
      callout: 'The roots run deep, back to Augustine and Aquinas.',
      body: 'Centuries before Walzer, Augustine argued a war could be just if waged for a rightful cause and rightly intended. Aquinas systematized it: just authority, just cause, right intention. Modern theory refines these old tests.',
      emoji: '📜',
    },
    {
      type: 'question',
      prompt: 'Soldiers win a war that had a clearly just cause, but did so by deliberately targeting civilians. How does just war theory judge this?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The cause can be just (ad bellum) yet the conduct unjust (in bello)', isCorrect: true },
          { id: 'b', text: 'A just cause automatically makes every tactic justified', isCorrect: false },
          { id: 'c', text: 'Winning proves the whole war was just', isCorrect: false },
          { id: 'd', text: 'Civilian deaths are fine if they shorten the war', isCorrect: false },
        ],
        explanation: 'Answers (b) and (d) commit the "ends justify the means" error that just war theory exists to block. Ad bellum and in bello are judged separately: a righteous cause never licenses deliberately killing the innocent.',
      },
    },
    {
      type: 'question',
      prompt: 'A nation with a just cause could end the war fast by bombing a city full of civilians. May it?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No, deliberately killing civilians is never permitted', isCorrect: true },
          { id: 'b', text: 'Yes, fewer total deaths is what matters', isCorrect: false },
          { id: 'c', text: 'Yes, a just cause carries the means with it', isCorrect: false },
          { id: 'd', text: 'Yes, if defeat is otherwise certain', isCorrect: false },
        ],
        explanation: 'No. Non-combatants never took up arms, so the in bello rule forbids aiming at them however fast it would end the war. The cause still passes, which is the pair of verdicts just war theory keeps apart: just to fight, unjust in the fighting.',
      },
    },
    {
      type: 'summary',
      title: 'Rules Even In War',
      keyPoints: [
        'A middle path between pacifism and "anything goes"',
        'Jus ad bellum: whether to go to war',
        'Jus in bello: how the war is fought',
        'A just cause never licenses killing civilians',
      ],
      closingThought: 'When a war is called "justified," ask two questions, not one: just to start, and justly fought?',
    },
  ],
};

export default lesson;
